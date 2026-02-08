"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function login(
  prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signup(
  prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const adminCode = formData.get("admin-code") as string;
  const adminSecret = process.env.ADMIN_SIGNUP_SECRET;

  // 管理者コードの検証（入力されている場合のみ）
  if (adminCode) {
    if (!adminSecret) {
      console.warn("ADMIN_SIGNUP_SECRET is not set");
      // シークレット未設定時は管理者登録を受け付けない（またはエラーにする）
      // ここでは安全のためエラーにはせず、一般ユーザーとして登録するフローも考えられるが
      // ユーザーの意図（管理者になりたい）を尊重し、設定不備としてエラーを返す方が親切か
      // しかし、ユーザーには「コードが間違っています」と伝える方が安全
      return { error: "管理者コードが無効です" };
    }
    
    if (adminCode !== adminSecret) {
      return { error: "管理者コードが正しくありません" };
    }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // 管理者権限の付与
  if (data.user && adminCode && adminSecret && adminCode === adminSecret) {
    try {
      const adminClient = createAdminClient();
      await adminClient
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", data.user.id);
    } catch (err) {
      console.error("Failed to promote user to admin:", err);
      // エラーが発生してもユーザーは作成されているので、成功画面へ遷移させるか、
      // エラーを返すか。ここではログ出力のみにとどめる。
    }
  }

  redirect("/auth/sign-up-success");
}

export async function signInWithLine(): Promise<void> {
  // 環境変数からベースURLを取得
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "")
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
    || "http://localhost:3000";

  const channelId = process.env.LINE_LOGIN_CHANNEL_ID;
  if (!channelId) {
    redirect(`${baseUrl}/auth/error?error=LINE_Login_not_configured`);
  }

  // LINE認証URLを構築
  const state = crypto.randomUUID();
  const nonce = crypto.randomUUID();

  const params = new URLSearchParams({
    response_type: "code",
    client_id: channelId,
    redirect_uri: `${baseUrl}/api/auth/line/callback`,
    state: state,
    scope: "profile openid email",
    nonce: nonce,
  });

  const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`;
  redirect(lineAuthUrl);
}

export async function signInWithGoogle(): Promise<void> {
  // 環境変数からベースURLを取得（本番環境対応）
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "")
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
    || "http://localhost:3000";

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${baseUrl}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
      scopes: "https://www.googleapis.com/auth/spreadsheets",
    },
  });

  if (error) {
    redirect(`${baseUrl}/auth/error?error=${encodeURIComponent(error.message)}`);
  }

  if (data.url) {
    redirect(data.url);
  }

  redirect(`${baseUrl}/auth/error?error=OAuth_URL_not_generated`);
}
