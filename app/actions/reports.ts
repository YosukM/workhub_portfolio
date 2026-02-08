"use server";

/**
 * Report Server Actions
 * 報告関連のサーバーアクション
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendLineMulticast, createAdminNotificationMessage } from "@/lib/line";
import type { Task } from "@/types";

/**
 * レポート送信結果
 */
export type ReportActionResult = {
  success: boolean;
  error?: string;
  reportId?: string;
};

/**
 * 報告を作成または更新
 */
export async function submitReport(formData: FormData): Promise<ReportActionResult> {
  try {
    const supabase = await createClient();

    // 現在のユーザーを取得
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "認証が必要です" };
    }

    // フォームデータを解析
    const reportDate = formData.get("report_date") as string;
    const yesterdayTasksJson = formData.get("yesterday_tasks") as string;
    const todayTasksJson = formData.get("today_tasks") as string;
    const notes = formData.get("notes") as string;

    if (!reportDate) {
      return { success: false, error: "報告日が指定されていません" };
    }

    // JSONをパース
    let yesterdayTasks: Task[] = [];
    let todayTasks: Task[] = [];

    try {
      yesterdayTasks = JSON.parse(yesterdayTasksJson || "[]");
      todayTasks = JSON.parse(todayTasksJson || "[]");
    } catch (e) {
      return { success: false, error: "タスクデータの形式が不正です" };
    }

    // バリデーション
    if (yesterdayTasks.length === 0 && todayTasks.length === 0) {
      return {
        success: false,
        error: "昨日の実績または今日の予定を最低1つ入力してください",
      };
    }

    // 既存のレポートを確認
    const { data: existingReport } = await supabase
      .from("reports")
      .select("id")
      .eq("user_id", user.id)
      .eq("report_date", reportDate)
      .single() as { data: { id: string } | null };

    let reportId: string;

    if (existingReport) {
      // 更新
      const { data, error } = await supabase
        .from("reports")
        // @ts-expect-error Supabase type inference issue
        .update({
          yesterday_tasks: yesterdayTasks as any,
          today_tasks: todayTasks as any,
          notes: notes || null,
        })
        .eq("id", existingReport.id)
        .select("id")
        .single();

      if (error) {
        console.error("Error updating report:", error);
        return { success: false, error: `報告の更新に失敗しました: ${error.message} (コード: ${error.code})` };
      }

      reportId = (data as any).id;
    } else {
      // 新規作成
      const { data, error } = await supabase
        .from("reports")
        // @ts-expect-error Supabase type inference issue
        .insert({
          user_id: user.id,
          report_date: reportDate,
          yesterday_tasks: yesterdayTasks as any,
          today_tasks: todayTasks as any,
          notes: notes || null,
        })
        .select("id")
        .single();

      if (error) {
        console.error("Error creating report:", error);
        return { success: false, error: `報告の作成に失敗しました: ${error.message} (コード: ${error.code})` };
      }

      reportId = (data as any).id;
    }

    // キャッシュを再検証
    revalidatePath("/dashboard");
    revalidatePath("/report");

    // 管理者へ通知（非同期処理のエラーは握りつぶし、メイン処理に影響させない）
    try {
      const adminClient = createAdminClient();

      // 提出者の情報を取得（名前が必要）
      const { data: submitterProfile } = await adminClient
        .from("profiles")
        .select("name, role")
        .eq("id", user.id)
        .single();

      // 管理者以外が提出した場合のみ通知する（管理者が自分の報告をテスト送信する場合などは通知不要かもしれないが、要件通り「一般ユーザーが提出」に絞るならrole checkが必要）
      // ここでは submitterProfile.role !== 'admin' をチェックする
      if (submitterProfile && submitterProfile.role !== 'admin') {
        // LINE連携済みの管理者を取得
        const { data: admins } = await adminClient
          .from("profiles")
          .select("line_user_id")
          .eq("role", "admin")
          .not("line_user_id", "is", null);

        if (admins && admins.length > 0) {
          const adminLineIds = admins.map(a => a.line_user_id as string);
          const message = createAdminNotificationMessage(submitterProfile.name, reportDate, user.id);
          await sendLineMulticast(adminLineIds, message);
        }
      }
    } catch (notifyError) {
      console.error("Failed to notify admins:", notifyError);
      // 通知失敗はユーザーへのレスポンスには影響させない
    }

    return { success: true, reportId };
  } catch (error) {
    console.error("Unexpected error in submitReport:", error);
    return { success: false, error: "予期しないエラーが発生しました" };
  }
}

/**
 * 報告を削除
 */
export async function deleteReport(reportId: string): Promise<ReportActionResult> {
  try {
    const supabase = await createClient();

    // 現在のユーザーを取得
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "認証が必要です" };
    }

    // レポートを削除（RLSにより自分のレポートのみ削除可能）
    const { error } = await supabase
      .from("reports")
      .delete()
      .eq("id", reportId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting report:", error);
      return { success: false, error: "報告の削除に失敗しました" };
    }

    // キャッシュを再検証
    revalidatePath("/dashboard");
    revalidatePath("/report");

    return { success: true };
  } catch (error) {
    console.error("Unexpected error in deleteReport:", error);
    return { success: false, error: "予期しないエラーが発生しました" };
  }
}

/**
 * 指定日の自分のレポートを取得
 */
export async function getMyReport(reportDate: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("user_id", user.id)
      .eq("report_date", reportDate)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return null;
      }
      console.error("Error fetching report:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error in getMyReport:", error);
    return null;
  }
}
