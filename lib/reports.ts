/**
 * Report Data Access Layer
 * レポートデータのCRUD操作
 */

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  Report,
  ReportWithProfile,
  Task,
  ReportSummary,
  Profile,
} from "@/types";
import { getNextDate } from "@/lib/date-utils";

/**
 * 指定日のレポート一覧を取得（プロフィール情報付き）
 */
export async function getReportsByDate(
  date: string
): Promise<ReportWithProfile[]> {
  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from("reports")
    .select(`
      *,
      profile:profiles(*)
    `)
    .eq("report_date", date)
    .order("submitted_at", { ascending: false });

  if (error) {
    console.error("Error fetching reports:", error);
    throw new Error("Failed to fetch reports");
  }

  return (data as ReportWithProfile[]) || [];
}

/**
 * 特定ユーザーの指定日のレポートを取得
 */
export async function getReportByUserAndDate(
  userId: string,
  date: string
): Promise<Report | null> {
  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from("reports")
    .select("*")
    .eq("user_id", userId)
    .eq("report_date", date)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return null;
    }
    console.error("Error fetching report:", error);
    throw new Error("Failed to fetch report");
  }

  return data;
}

/**
 * 特定ユーザーのレポート履歴を取得
 */
export async function getReportsByUser(
  userId: string,
  limit: number = 30
): Promise<Report[]> {
  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from("reports")
    .select("*")
    .eq("user_id", userId)
    .order("report_date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching user reports:", error);
    throw new Error("Failed to fetch user reports");
  }

  return data || [];
}

/**
 * 特定ユーザーの期間指定レポート取得
 */
export async function getReportsByUserAndDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<Report[]> {
  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from("reports")
    .select("*")
    .eq("user_id", userId)
    .gte("report_date", startDate)
    .lte("report_date", endDate)
    .order("report_date", { ascending: false });

  if (error) {
    console.error("Error fetching user reports by date range:", error);
    throw new Error("Failed to fetch user reports");
  }

  return (data as Report[]) || [];
}

/**
 * レポート統計を計算
 */
export function calculateReportStatistics(reports: Report[]) {
  const totalReports = reports.length;

  if (totalReports === 0) {
    return {
      totalReports: 0,
      totalYesterdayHours: 0,
      totalTodayHours: 0,
      averageYesterdayHours: 0,
      averageTodayHours: 0,
      totalTasks: 0,
    };
  }

  const totalYesterdayHours = reports.reduce(
    (sum, report) => sum + calculateTotalHours(report.yesterday_tasks),
    0
  );

  const totalTodayHours = reports.reduce(
    (sum, report) => sum + calculateTotalHours(report.today_tasks),
    0
  );

  const totalTasks = reports.reduce(
    (sum, report) =>
      sum + report.yesterday_tasks.length + report.today_tasks.length,
    0
  );

  return {
    totalReports,
    totalYesterdayHours,
    totalTodayHours,
    averageYesterdayHours: totalYesterdayHours / totalReports,
    averageTodayHours: totalTodayHours / totalReports,
    totalTasks,
  };
}

/**
 * レポートを作成
 */
export async function createReport(
  userId: string,
  reportDate: string,
  yesterdayTasks: Task[],
  todayTasks: Task[],
  notes: string | null
): Promise<Report> {
  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from("reports")
    .insert({
      user_id: userId,
      report_date: reportDate,
      yesterday_tasks: yesterdayTasks as any,
      today_tasks: todayTasks as any,
      notes: notes,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating report:", error);
    throw new Error("Failed to create report");
  }

  return data as Report;
}

/**
 * レポートを更新
 */
export async function updateReport(
  reportId: string,
  yesterdayTasks: Task[],
  todayTasks: Task[],
  notes: string | null
): Promise<Report> {
  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from("reports")
    .update({
      yesterday_tasks: yesterdayTasks as any,
      today_tasks: todayTasks as any,
      notes: notes,
    })
    .eq("id", reportId)
    .select()
    .single();

  if (error) {
    console.error("Error updating report:", error);
    throw new Error("Failed to update report");
  }

  return data as Report;
}

/**
 * レポートを削除
 */
export async function deleteReport(reportId: string): Promise<void> {
  const adminClient = createAdminClient();

  const { error } = await adminClient.from("reports").delete().eq("id", reportId);

  if (error) {
    console.error("Error deleting report:", error);
    throw new Error("Failed to delete report");
  }
}

/**
 * 前日の「今日の予定」を取得（今日の「昨日の実績」に引き継ぐため）
 */
export async function getYesterdayTodayTasks(
  userId: string,
  todayDate: string
): Promise<Task[]> {
  const adminClient = createAdminClient();

  // 前日の日付を計算
  const today = new Date(todayDate);
  today.setDate(today.getDate() - 1);
  const yesterdayDate = today.toISOString().split("T")[0];

  const { data, error } = await adminClient
    .from("reports")
    .select("today_tasks")
    .eq("user_id", userId)
    .eq("report_date", yesterdayDate)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned - 前日のレポートがない
      return [];
    }
    console.error("Error fetching yesterday's today_tasks:", error);
    return [];
  }

  return (data?.today_tasks as Task[]) || [];
}

/**
 * タスクの合計時間を計算
 */
export function calculateTotalHours(tasks: Task[]): number {
  return tasks.reduce((total, task) => {
    return total + (task.actual_hours || task.planned_hours || 0);
  }, 0);
}

/**
 * 全ユーザーの期間内稼働時間を取得（管理者向け）
 * 注意: 稼働時間は「昨日の実績」に基づいているため、
 * 集計対象のレポート期間を1日後ろにずらして取得します。
 * 例: 1月の稼働時間 -> 1/2〜2/1のレポートを集計（1/1〜1/31の実績）
 */
export async function getAllUsersMonthlyHours(
  startDate: string,
  endDate: string
): Promise<{ userId: string; userName: string; totalHours: number }[]> {
  const adminClient = createAdminClient();

  // 全ユーザーを取得（稼働中のみ）
  const { data: profiles, error: profilesError } = await adminClient
    .from("profiles")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  if (profilesError) {
    console.error("Error fetching profiles:", profilesError);
    throw new Error("Failed to fetch profiles");
  }

  // 集計期間を1日ずらす（実稼働日ベースにするため）
  const queryStartDate = getNextDate(startDate);
  const queryEndDate = getNextDate(endDate);

  // 期間内のレポートを取得
  const { data: reports, error: reportsError } = await adminClient
    .from("reports")
    .select("user_id, yesterday_tasks")
    .gte("report_date", queryStartDate)
    .lte("report_date", queryEndDate);

  if (reportsError) {
    console.error("Error fetching reports:", reportsError);
    throw new Error("Failed to fetch reports");
  }

  // ユーザーごとの合計を計算
  const hoursMap = new Map<string, number>();
  (reports as Report[])?.forEach((report) => {
    const hours = calculateTotalHours(report.yesterday_tasks);
    const current = hoursMap.get(report.user_id) || 0;
    hoursMap.set(report.user_id, current + hours);
  });

  // 結果を構築
  return (profiles as { id: string; name: string }[]).map((profile) => ({
    userId: profile.id,
    userName: profile.name,
    totalHours: hoursMap.get(profile.id) || 0,
  }));
}

/**
 * 指定日のダッシュボード用サマリーを取得
 */
export async function getDashboardSummary(
  date: string
): Promise<ReportSummary[]> {
  // adminClientでRLSをバイパス
  const adminClient = createAdminClient();

  // 全ユーザーを取得（稼働中のみ）
  const { data: profiles, error: profilesError } = await adminClient
    .from("profiles")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (profilesError) {
    console.error("Error fetching profiles:", profilesError);
    throw new Error("Failed to fetch profiles");
  }

  // 指定日のレポートを取得
  const { data: reports, error: reportsError } = await adminClient
    .from("reports")
    .select("*")
    .eq("report_date", date);

  if (reportsError) {
    console.error("Error fetching reports:", reportsError);
    throw new Error("Failed to fetch reports");
  }

  // レポートマップを作成
  const reportMap = new Map<string, Report>();
  (reports as Report[])?.forEach((report) => {
    reportMap.set(report.user_id, report);
  });

  // サマリーを構築
  const summaries: ReportSummary[] = (profiles as Profile[]).map((profile) => {
    const report = reportMap.get(profile.id);

    if (report) {
      return {
        user_id: profile.id,
        user_name: profile.name,
        user_email: profile.email,
        user_role: profile.role,
        report_date: date,
        has_submitted: true,
        yesterday_total_hours: calculateTotalHours(report.yesterday_tasks),
        today_total_hours: calculateTotalHours(report.today_tasks),
        yesterday_tasks: report.yesterday_tasks,
        today_tasks: report.today_tasks,
        notes: report.notes,
        submitted_at: report.submitted_at,
      };
    } else {
      return {
        user_id: profile.id,
        user_name: profile.name,
        user_email: profile.email,
        user_role: profile.role,
        report_date: date,
        has_submitted: false,
        yesterday_total_hours: 0,
        today_total_hours: 0,
        yesterday_tasks: [],
        today_tasks: [],
        notes: null,
        submitted_at: null,
      };
    }
  });

  return summaries;
}
