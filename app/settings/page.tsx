/**
 * Settings Page
 * プロフィール設定ページ
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/settings-form";
import { LineLinking } from "@/components/line-linking";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/types";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single() as { data: Profile | null };

  if (!profile) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-bold">設定</h1>
            <Button asChild variant="outline" size="sm" className="text-xs sm:text-sm">
              <Link href="/dashboard">戻る</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <SettingsForm profile={profile} />
        <LineLinking
          isLinked={!!profile.line_user_id}
          linkedAt={profile.line_linked_at}
        />
      </main>
    </div>
  );
}
