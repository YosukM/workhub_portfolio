/**
 * Report Page
 * 日次報告入力ページ
 */

import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMyReport } from "@/app/actions/reports";
import { getYesterdayTodayTasks } from "@/lib/reports";
import { ReportForm } from "@/components/report/ReportForm";
import { getTodayDate, formatDateWithDay } from "@/lib/date-utils";
import type { Task } from "@/types";

export default async function ReportPage() {
  noStore();

  // 認証チェック
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // プロフィール取得
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // 今日の日付
  const today = getTodayDate();

  // 既存のレポートを取得
  const existingReport = await getMyReport(today);

  // 前日の「今日の予定」を取得（引き継ぎ用）
  let carryoverTasks: Task[] = [];
  if (!existingReport) {
    // 今日のレポートがない場合のみ引き継ぎ
    carryoverTasks = await getYesterdayTodayTasks(user.id, today);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">日次報告</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                {formatDateWithDay(today)}
              </p>
            </div>
            <div className="text-xs sm:text-sm">
              <span className="text-muted-foreground">ログイン中:</span>{" "}
              <span className="font-medium">{(profile as any)?.name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2">
            {existingReport ? "報告を編集" : "報告を入力"}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            昨日の実績と今日の予定を入力してください。タスク名と時間を記入し、必要に応じて困りごとや相談事項を追加できます。
          </p>
        </div>

        <ReportForm
          reportDate={today}
          existingReport={existingReport}
          carryoverTasks={carryoverTasks}
        />
      </main>
    </div>
  );
}
