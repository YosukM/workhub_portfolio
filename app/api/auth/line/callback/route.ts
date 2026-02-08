/**
 * LINE Auth Callback API
 * LINE認証後の統一コールバック
 *
 * state パラメータから mode を取得:
 * - login: ログイン/新規登録
 * - link: アカウント連携（ログイン中ユーザーに紐づけ）
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";

export const runtime = "nodejs";

// ログ出力
function log(step: string, data?: Record<string, unknown>) {
  console.log(`[LINE_CALLBACK] step=${step}`, data ? JSON.stringify(data) : "");
}

function logError(step: string, error: unknown) {
  const err = error as Error;
  console.error(`[LINE_CALLBACK_ERROR] step=${step}`, {
    message: err?.message,
    code: (err as any)?.code,
  });
}

// ベースURL取得
function getBaseUrl(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (appUrl) return appUrl;
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`;
  return "http://localhost:3000";
}

// state から mode を抽出（UUID_mode 形式）
function parseModeFromState(state: string | null): "login" | "link" {
  if (!state) return "login";
  const parts = state.split("_");
  const mode = parts[parts.length - 1];
  return mode === "link" ? "link" : "login";
}

interface LineTokenResponse {
  access_token: string;
  id_token?: string;
}

interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const baseUrl = getBaseUrl();
  const mode = parseModeFromState(state);

  log("init", { mode, hasCode: !!code, hasError: !!error });

  // エラーチェック
  if (error) {
    logError("line_error", new Error(errorDescription || error));
    const redirectPath = mode === "link" ? "/settings" : "/auth/error";
    return NextResponse.redirect(`${baseUrl}${redirectPath}?error=${encodeURIComponent(errorDescription || error)}`);
  }

  if (!code) {
    logError("no_code", new Error("no_code"));
    const redirectPath = mode === "link" ? "/settings" : "/auth/error";
    return NextResponse.redirect(`${baseUrl}${redirectPath}?error=no_code`);
  }

  try {
    const channelId = process.env.LINE_LOGIN_CHANNEL_ID;
    const channelSecret = process.env.LINE_LOGIN_CHANNEL_SECRET;

    if (!channelId || !channelSecret) {
      throw new Error("LINE ログインの設定がされていません");
    }

    // Step 1: LINE トークン取得
    const tokenResponse = await fetch("https://api.line.me/oauth2/v2.1/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: `${baseUrl}/api/auth/line/callback`,
        client_id: channelId,
        client_secret: channelSecret,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`LINE トークン取得に失敗しました: ${tokenResponse.status}`);
    }

    const tokenData: LineTokenResponse = await tokenResponse.json();

    // Step 2: LINE プロフィール取得
    const profileResponse = await fetch("https://api.line.me/v2/profile", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!profileResponse.ok) {
      throw new Error(`LINE プロフィール取得に失敗しました: ${profileResponse.status}`);
    }

    const lineProfile: LineProfile = await profileResponse.json();
    const providerUid = lineProfile.userId.toLowerCase();

    log("line_profile", { providerUid: providerUid.substring(0, 8) + "...", displayName: lineProfile.displayName, mode });

    // mode に応じて処理を分岐
    if (mode === "link") {
      return await handleLink(request, baseUrl, providerUid, lineProfile);
    } else {
      return await handleLogin(request, baseUrl, providerUid, lineProfile);
    }
  } catch (error) {
    logError("callback_error", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    const redirectPath = mode === "link" ? "/settings" : "/auth/error";
    return NextResponse.redirect(`${baseUrl}${redirectPath}?error=${encodeURIComponent(message)}`);
  }
}

/**
 * ログイン処理
 */
async function handleLogin(
  request: NextRequest,
  baseUrl: string,
  providerUid: string,
  lineProfile: LineProfile
): Promise<NextResponse> {
  const adminClient = createAdminClient();

  // user_identities で既存マッピング検索
  const { data: existingUserId } = await adminClient
    .rpc("get_user_id_by_identity", { p_provider: "line", p_provider_uid: providerUid });

  let resolvedUserId: string;
  const isExistingUser = !!existingUserId;

  if (existingUserId) {
    resolvedUserId = existingUserId;
    log("identity_found", { providerUid: providerUid.substring(0, 8) + "...", resolved_user_id: resolvedUserId.substring(0, 8) + "..." });
  } else {
    // 新規ユーザー作成を試みる
    const email = `line_${providerUid}@line.local`;
    const tempPassword = `LINE_${crypto.randomUUID()}`;

    const { data: authUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        name: lineProfile.displayName,
        provider: "line",
        provider_uid: providerUid,
        avatar_url: lineProfile.pictureUrl,
      },
    });

    if (createError) {
      // メール重複の場合、既存ユーザーを検索して user_identities に追加
      const isEmailExists =
        createError.message.includes("already") ||
        createError.message.includes("exists") ||
        createError.message.includes("registered");

      if (isEmailExists) {
        log("email_exists_recovery", { email });

        // RPC で既存 auth user の ID を取得
        const { data: existingAuthUserId, error: rpcError } = await adminClient
          .rpc("get_auth_user_id_by_email", { p_email: email });

        if (rpcError || !existingAuthUserId) {
          throw new Error("既存ユーザーの検索に失敗しました");
        }

        resolvedUserId = existingAuthUserId;

        // user_identities に登録（マッピング復旧）
        const { error: identityError } = await adminClient
          .from("user_identities")
          .insert({
            provider: "line",
            provider_uid: providerUid,
            user_id: resolvedUserId,
          });

        if (identityError) {
          logError("identity_recovery_insert", identityError);
        }

        log("identity_recovered", { providerUid: providerUid.substring(0, 8) + "...", resolved_user_id: resolvedUserId.substring(0, 8) + "..." });
      } else {
        throw new Error(`ユーザー作成に失敗しました: ${createError.message}`);
      }
    } else if (authUser?.user) {
      resolvedUserId = authUser.user.id;

      // user_identities に登録
      const { error: identityError } = await adminClient
        .from("user_identities")
        .insert({
          provider: "line",
          provider_uid: providerUid,
          user_id: resolvedUserId,
        });

      if (identityError) {
        logError("identity_insert", identityError);
      }

      log("identity_created", { providerUid: providerUid.substring(0, 8) + "...", resolved_user_id: resolvedUserId.substring(0, 8) + "..." });
    } else {
      throw new Error("ユーザー作成でエラーが発生しました");
    }
  }

  // profiles 処理（既存ユーザーは name/role を維持）
  const now = new Date().toISOString();

  if (isExistingUser) {
    const { error: updateError } = await adminClient
      .from("profiles")
      .update({
        line_user_id: providerUid,
        line_linked_at: now,
        updated_at: now,
      })
      .eq("id", resolvedUserId);

    if (updateError) {
      logError("profiles_update", updateError);
    }
    log("profiles_update_ok", { resolved_user_id: resolvedUserId.substring(0, 8) + "...", mode: "existing" });
  } else {
    const { error: insertError } = await adminClient.from("profiles").insert({
      id: resolvedUserId,
      email: `line_${providerUid}@line.local`,
      name: lineProfile.displayName,
      role: "member",
      line_user_id: providerUid,
      line_linked_at: now,
      created_at: now,
      updated_at: now,
    });

    if (insertError) {
      logError("profiles_insert", insertError);
      await adminClient
        .from("profiles")
        .update({
          line_user_id: providerUid,
          line_linked_at: now,
          updated_at: now,
        })
        .eq("id", resolvedUserId);
    }
    log("profiles_insert_ok", { resolved_user_id: resolvedUserId.substring(0, 8) + "...", mode: "new" });
  }

  // 管理者チェック（ログ用）
  const { data: adminProfile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", resolvedUserId)
    .single();
  log("admin_check_ok", { resolved_user_id: resolvedUserId.substring(0, 8) + "...", is_admin: adminProfile?.role === "admin" });

  // セッション確立
  const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
    type: "magiclink",
    email: `line_${providerUid}@line.local`,
    options: { redirectTo: `${baseUrl}/dashboard` },
  });

  if (linkError || !linkData?.properties?.hashed_token) {
    throw new Error("セッション生成に失敗しました");
  }

  const response = NextResponse.redirect(`${baseUrl}/dashboard`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { error: verifyError } = await supabase.auth.verifyOtp({
    token_hash: linkData.properties.hashed_token,
    type: "email",
  });

  if (verifyError) {
    throw new Error("ログイン処理に失敗しました");
  }

  log("session_ok", { resolved_user_id: resolvedUserId.substring(0, 8) + "..." });

  return response;
}

/**
 * アカウント連携処理
 */
async function handleLink(
  request: NextRequest,
  baseUrl: string,
  providerUid: string,
  lineProfile: LineProfile
): Promise<NextResponse> {
  // 現在のセッションからuser_id取得
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    log("no_session", { error: userError?.message });
    return NextResponse.redirect(`${baseUrl}/auth/login?error=not_logged_in`);
  }

  const currentUserId = user.id;
  log("session_found", { user_id: currentUserId.substring(0, 8) + "..." });

  const adminClient = createAdminClient();

  // 既存マッピング確認
  const { data: existingUserId } = await adminClient
    .rpc("get_user_id_by_identity", { p_provider: "line", p_provider_uid: providerUid });

  if (existingUserId) {
    if (existingUserId === currentUserId) {
      log("already_linked", { providerUid: providerUid.substring(0, 8) + "..." });
      return NextResponse.redirect(`${baseUrl}/settings?message=already_linked`);
    } else {
      log("linked_to_other", { providerUid: providerUid.substring(0, 8) + "...", other_user: existingUserId.substring(0, 8) + "..." });
      return NextResponse.redirect(`${baseUrl}/settings?error=line_already_linked_to_other`);
    }
  }

  // user_identities に登録
  const { error: identityError } = await adminClient
    .from("user_identities")
    .insert({
      provider: "line",
      provider_uid: providerUid,
      user_id: currentUserId,
    });

  if (identityError) {
    throw new Error("LINE 連携の登録に失敗しました");
  }

  log("identity_created", { providerUid: providerUid.substring(0, 8) + "...", user_id: currentUserId.substring(0, 8) + "..." });

  // profiles 更新
  const now = new Date().toISOString();
  const { error: updateError } = await adminClient
    .from("profiles")
    .update({
      line_user_id: providerUid,
      line_linked_at: now,
      updated_at: now,
    })
    .eq("id", currentUserId);

  if (updateError) {
    logError("profiles_update", updateError);
  } else {
    log("profiles_update_ok", { user_id: currentUserId.substring(0, 8) + "..." });
  }

  return NextResponse.redirect(`${baseUrl}/settings?message=line_linked`);
}
