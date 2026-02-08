/**
 * Dashboard Page
 * ダッシュボード（報告一覧）ページ
 */

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDashboardSummary, getReportsByUserAndDateRange, calculateTotalHours, getAllUsersMonthlyHours } from "@/lib/reports";
import { UserReportCard } from "@/components/dashboard/UserReportCard";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DateSelector } from "@/components/dashboard/DateSelector";
import { MonthlyHoursList } from "@/components/dashboard/MonthlyHoursList";
import { Button } from "@/components/ui/button";
import { getTodayDate, getMonthRange, getNextDate } from "@/lib/date-utils";
import { LogoutButton } from "@/components/logout-button";
import { WelcomeSplash } from "@/components/dashboard/WelcomeSplash";

interface DashboardPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  noStore();

  // 認証チェック
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // プロフィール取得（adminクライアントでRLSをバイパス）
  const adminClient = createAdminClient();
  let { data: profile } = await adminClient
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // プロフィールがない場合は自動作成
  if (!profile) {
    const emailName = user.email?.split("@")[0] || "ユーザー";

    const now = new Date().toISOString();
    const { data: newProfile, error: createError } = await adminClient
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email,
        name: emailName,
        role: "member",
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating profile:", JSON.stringify(createError, null, 2));
      console.error("User ID:", user.id);
      console.error("Service Role Key exists:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);

      // エラー時はログアウトしてエラーページへ
      await supabase.auth.signOut();
      redirect("/auth/error?message=profile_creation_failed");
    }
    profile = newProfile;
  }

  // 日付パラメータ取得（デフォルトは今日）
  const params = await searchParams;
  const targetDate = params.date || getTodayDate();

  // ダッシュボードサマリー取得
  const summaries = await getDashboardSummary(targetDate);

  // 選択された日付の月の稼働時間を取得
  const { startDate: monthStart, endDate: monthEnd } = getMonthRange(targetDate);
  // 実稼働日ベースで集計するため、期間を1日ずらす（例: 1月の稼働は1/2〜2/1のレポートを集計）
  const queryStartDate = getNextDate(monthStart);
  const queryEndDate = getNextDate(monthEnd);
  const currentUserReports = await getReportsByUserAndDateRange(user.id, queryStartDate, queryEndDate);
  const currentUserMonthlyHours = currentUserReports.reduce(
    (sum, report) => sum + calculateTotalHours(report.yesterday_tasks),
    0
  );

  // 管理者の場合、全ユーザーの当月稼働時間を取得
  const isAdmin = (profile as any)?.role === "admin";
  const allUsersMonthlyHours = isAdmin
    ? await getAllUsersMonthlyHours(monthStart, monthEnd)
    : [];

  // 表示用文字列を生成（例: "2026年1月"）
  const monthDate = new Date(monthStart);
  const monthLabel = `${monthDate.getFullYear()}年${monthDate.getMonth() + 1}月`;

  // 未提出者と提出済みで分ける
  const notSubmitted = summaries.filter((s) => !s.has_submitted);
  const submitted = summaries.filter((s) => s.has_submitted);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-950 dark:to-blue-950/20">
      {/* ウェルカムスプラッシュ (初回のみ表示) */}
      <WelcomeSplash userName={(profile as any)?.name || "ゲスト"} />

      {/* ヘッダー */}
      <header className="border-b sticky top-0 glass z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Image
                src="/WorkHub_LogoML.svg"
                alt="WorkHub"
                width={140}
                height={40}
                className="h-8 sm:h-10 w-auto"
                priority
              />
              <div className="hidden sm:block">
                <p className="text-sm text-muted-foreground">
                  ようこそ、{(profile as any)?.name}さん
                  {(profile as any)?.role === "admin" && (
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300">
                      管理者
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
              <Button asChild size="sm" className="gradient-primary border-0 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all text-xs sm:text-sm">
                <Link href="/report">報告を入力</Link>
              </Button>
              {(profile as any)?.role === "admin" && (
                <Button asChild variant="outline" size="sm" className="hover:border-violet-300 dark:hover:border-violet-700 text-xs sm:text-sm">
                  <Link href="/admin/users">ユーザー管理</Link>
                </Button>
              )}
              <Button asChild variant="outline" size="sm" className="text-xs sm:text-sm">
                <Link href="/settings">設定</Link>
              </Button>
              <LogoutButton />
            </div>
          </div>

          {/* 日付選択 */}
          <div className="flex items-center justify-center">
            <Suspense fallback={<div className="h-9" />}>
              <DateSelector currentDate={targetDate} />
            </Suspense>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* 統計情報 */}
        <div className="mb-6 sm:mb-8">
          <DashboardStats summaries={summaries} currentUserMonthlyHours={currentUserMonthlyHours} />
        </div>

        {/* 管理者向け：全ユーザー当月稼働時間一覧 */}
        {isAdmin && allUsersMonthlyHours.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <MonthlyHoursList usersHours={allUsersMonthlyHours} month={monthLabel} />
          </div>
        )}

        {/* 未提出者セクション */}
        {notSubmitted.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-destructive">
                未提出者
              </h2>
              <span className="text-xs sm:text-sm text-muted-foreground">
                ({notSubmitted.length}人)
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {notSubmitted.map((summary) => (
                <UserReportCard key={summary.user_id} summary={summary} />
              ))}
            </div>
          </div>
        )}

        {/* 提出済みセクション */}
        {submitted.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-semibold">提出済み</h2>
              <span className="text-xs sm:text-sm text-muted-foreground">
                ({submitted.length}人)
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {submitted.map((summary) => (
                <UserReportCard key={summary.user_id} summary={summary} />
              ))}
            </div>
          </div>
        )}

        {/* データがない場合 */}
        {summaries.length === 0 && (
          <div className="text-center py-12 sm:py-16">
            <p className="text-sm sm:text-base text-muted-foreground">
              ユーザーが登録されていません
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
