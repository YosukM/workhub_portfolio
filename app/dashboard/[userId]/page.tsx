/**
 * User Detail Page
 * ユーザー詳細ページ（レポート履歴）
 */

import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getProfileById } from "@/lib/profiles";
import {
  getReportsByUserAndDateRange,
  calculateReportStatistics,
} from "@/lib/reports";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PeriodSelector } from "@/components/dashboard/PeriodSelector";
import { calculateDateRange } from "@/lib/date-utils";
import { UserStats } from "@/components/dashboard/UserStats";
import { ReportHistory } from "@/components/dashboard/ReportHistory";

interface UserDetailPageProps {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ period?: "7days" | "30days" | "90days" }>;
}

export default async function UserDetailPage({
  params,
  searchParams,
}: UserDetailPageProps) {
  noStore();

  // 認証チェック
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // パラメータ取得
  const { userId } = await params;
  const { period = "30days" } = await searchParams;

  // プロフィール取得
  const profile = await getProfileById(userId);

  if (!profile) {
    redirect("/dashboard");
  }

  // 日付範囲の計算
  const { startDate, endDate } = calculateDateRange(period);

  // レポート取得
  const reports = await getReportsByUserAndDateRange(
    userId,
    startDate,
    endDate
  );

  // 統計計算
  const statistics = calculateReportStatistics(reports);

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button asChild variant="outline" size="sm" className="text-xs sm:text-sm">
                <Link href="/dashboard">← 戻る</Link>
              </Button>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5 sm:mb-1 flex-wrap">
                  <h1 className="text-lg sm:text-2xl font-bold truncate">{profile.name}</h1>
                  {profile.role === "admin" && (
                    <Badge variant="outline" className="text-xs">管理者</Badge>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {profile.email}
                </p>
              </div>
            </div>
            <PeriodSelector userId={userId} />
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* 統計情報 */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">統計情報</h2>
          <UserStats statistics={statistics} />
        </div>

        {/* レポート履歴 */}
        <div>
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
            レポート履歴
            <span className="text-xs sm:text-sm font-normal text-muted-foreground ml-2">
              （{reports.length}件）
            </span>
          </h2>
          <ReportHistory reports={reports} />
        </div>
      </main>
    </div>
  );
}
