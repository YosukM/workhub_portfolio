"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();

    // 確実にホーム画面に遷移
    window.location.href = "/";
  };

  return <Button onClick={logout}>ログアウト</Button>;
}
