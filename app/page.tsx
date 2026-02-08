import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import Image from "next/image";

export default async function Home() {
  // 認証チェック - ログイン済みの場合はダッシュボードへ
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-hero-light dark:gradient-hero" />

      {/* Decorative elements */}
      <div className="absolute top-20 -left-10 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse-soft" />
      <div className="absolute bottom-20 -right-10 sm:right-10 w-48 sm:w-96 h-48 sm:h-96 bg-indigo-400/20 rounded-full blur-3xl animate-pulse-soft delay-300" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-purple-400/10 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation */}
        <nav className="w-full glass border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center flex-shrink-0">
              <Image
                src="/WorkHub_LogoML.svg"
                alt="WorkHub"
                width={140}
                height={40}
                className="h-8 sm:h-10 w-auto"
                priority
              />
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              <ThemeSwitcher />
              <Link
                href="/auth/login"
                className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                ログイン
              </Link>
              <Link
                href="/auth/sign-up"
                className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg gradient-primary text-white hover:opacity-90 transition-opacity shadow-lg shadow-cyan-500/25"
              >
                新規登録
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12 sm:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-slide-up">
              <span className="inline-block px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 mb-4 sm:mb-6">
                チーム管理をもっとシンプルに
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 animate-slide-up delay-100">
              チームの業務を
              <span className="text-gradient block mt-2">可視化・効率化</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-10 animate-slide-up delay-200 px-2">
              日次報告の予実管理と稼働時間の自動集計で、
              チーム全体の生産性を向上させましょう。
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-slide-up delay-300 px-4">
              <Link
                href="/auth/sign-up"
                className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl gradient-primary text-white hover:opacity-90 transition-all shadow-xl shadow-cyan-500/30 hover:shadow-2xl hover:shadow-cyan-500/40 hover:-translate-y-0.5"
              >
                無料で始める
              </Link>
              <Link
                href="/auth/login"
                className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl bg-white dark:bg-slate-800 border border-border hover:border-primary/50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                ログイン
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 sm:px-6 py-12 sm:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10 sm:mb-16 animate-fade-in">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">主な機能</h2>
              <p className="text-sm sm:text-base text-muted-foreground">シンプルで使いやすい業務管理ツール</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
              {/* Feature 1 */}
              <div className="group p-6 sm:p-8 rounded-2xl glass-card card-hover animate-slide-up">
                <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-xl gradient-primary flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-6 sm:w-7 h-6 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">予実管理</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  昨日の実績と今日の予定を並列表示。計画と実績のギャップを一目で把握できます。
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group p-6 sm:p-8 rounded-2xl glass-card card-hover animate-slide-up delay-100">
                <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-6 sm:w-7 h-6 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">稼働時間可視化</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  自動集計で効率的な工数管理。月次・週次のレポートも簡単に確認できます。
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group p-6 sm:p-8 rounded-2xl glass-card card-hover animate-slide-up delay-200">
                <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-6 sm:w-7 h-6 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">LINE連携</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  報告忘れを防ぐLINE通知。毎朝のリマインダーで提出率を向上させます。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 sm:px-6 py-12 sm:py-20">
          <div className="max-w-4xl mx-auto">
            <div className="relative p-6 sm:p-12 rounded-2xl sm:rounded-3xl overflow-hidden">
              <div className="absolute inset-0 gradient-primary opacity-90" />
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.3)_1px,transparent_0)] bg-[length:24px_24px]" />

              <div className="relative z-10 text-center text-white">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
                  今すぐチーム管理を始めましょう
                </h2>
                <p className="text-sm sm:text-lg text-white/80 mb-6 sm:mb-8 max-w-2xl mx-auto">
                  無料で登録して、チームの生産性を向上させましょう。
                  セットアップは数分で完了します。
                </p>
                <Link
                  href="/auth/sign-up"
                  className="inline-flex px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl bg-white text-blue-600 hover:bg-white/90 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
                >
                  無料で始める
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-4 sm:px-6 py-6 sm:py-8 border-t border-border/50">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <Image
                src="/WorkHub_LogoM.svg"
                alt="WorkHub"
                width={24}
                height={24}
                className="h-5 sm:h-6 w-5 sm:w-6"
              />
              <span className="text-xs sm:text-sm font-medium text-foreground">
                WorkHub
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              © 2026 WorkHub. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
