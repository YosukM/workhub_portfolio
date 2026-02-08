/**
 * Admin Users Page
 * 管理者用ユーザー管理ページ
 */

import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserList } from "@/components/admin/UserList";
import { ExportButtons } from "@/components/admin/ExportButtons";
import type { Profile } from "@/types";

export default async function AdminUsersPage() {
  noStore();

  // 認証チェック
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  const user = session.user;

  // Google連携チェック
  const isGoogleLinked = user.app_metadata.provider === "google" && !!session.provider_token;

  const adminClient = createAdminClient();

  // 管理者チェック（profiles.role を使用）
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  // 全ユーザーを取得
  const { data: users } = await adminClient
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">ユーザー管理</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                メンバーの追加・削除
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ExportButtons isGoogleLinked={isGoogleLinked} />
              <Button asChild variant="outline" size="sm" className="w-fit text-xs sm:text-sm">
                <Link href="/dashboard">ダッシュボードに戻る</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <Card className="p-4 sm:p-6">
          <div className="mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-semibold">登録ユーザー一覧</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {(users as Profile[])?.length || 0}人のユーザーが登録されています
            </p>
          </div>

          <UserList
            users={(users as Profile[]) || []}
            currentUserId={user.id}
          />
        </Card>
      </main>
    </div>
  );
}
