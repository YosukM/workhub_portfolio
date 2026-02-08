/**
 * LINE Auth Start API
 * LINE認証画面へのリダイレクトを行う
 *
 * mode パラメータ:
 * - login: ログイン/新規登録（デフォルト）
 * - link: アカウント連携（ログイン中ユーザーに紐づけ）
 *
 * redirect_uri は常に /api/auth/line/callback
 * mode は state パラメータに含めて渡す
 */

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function getBaseUrl(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (appUrl) return appUrl;

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`;

  return "http://localhost:3000";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") || "login";

  const baseUrl = getBaseUrl();

  const channelId = process.env.LINE_LOGIN_CHANNEL_ID;
  if (!channelId) {
    console.error("[LINE_START] LINE_LOGIN_CHANNEL_ID not configured");
    return NextResponse.redirect(`${baseUrl}/auth/error?error=LINE_Login_not_configured`);
  }

  // redirect_uri は常に callback に固定
  const redirectUri = `${baseUrl}/api/auth/line/callback`;

  // state に mode を含める（UUID_mode 形式）
  const stateId = crypto.randomUUID();
  const state = `${stateId}_${mode}`;
  const nonce = crypto.randomUUID();

  const params = new URLSearchParams({
    response_type: "code",
    client_id: channelId,
    redirect_uri: redirectUri,
    state: state,
    scope: "profile openid email",
    nonce: nonce,
  });

  const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`;

  console.log("[LINE_START] Redirecting to LINE auth", { mode, redirectUri });

  return NextResponse.redirect(lineAuthUrl);
}
