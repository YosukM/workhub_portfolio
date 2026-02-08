/**
 * LINE Webhook API Route
 * LINEからのWebhookイベントを処理
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  verifyLineSignature,
  replyLineMessage,
  createLinkingSuccessMessage,
  LineWebhookBody,
  LineWebhookEvent,
} from "@/lib/line";

// Node.jsランタイムを使用（cryptoモジュールのため）
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // リクエストボディを取得
    const bodyText = await request.text();
    const signature = request.headers.get("x-line-signature");

    // 署名検証
    if (!signature || !verifyLineSignature(bodyText, signature)) {
      console.error("Invalid LINE webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body: LineWebhookBody = JSON.parse(bodyText);

    // イベントを処理
    for (const event of body.events) {
      await handleLineEvent(event);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("LINE webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * LINEイベントを処理
 */
async function handleLineEvent(event: LineWebhookEvent): Promise<void> {
  const lineUserId = event.source.userId;

  if (!lineUserId) {
    return;
  }

  // メッセージイベントの処理
  if (event.type === "message" && event.message?.type === "text") {
    const text = event.message.text?.trim();

    // 6桁の連携コードかチェック
    if (text && /^\d{6}$/.test(text)) {
      await handleLinkingCode(event, lineUserId, text);
      return;
    }

    // その他のメッセージ
    if (event.replyToken) {
      await replyLineMessage(
        event.replyToken,
        `WorkHubです。

📝 LINE連携をするには、アプリの設定画面で表示される6桁のコードを送信してください。

🔗 アプリURL: ${process.env.NEXT_PUBLIC_APP_URL || "https://your-app.vercel.app"}/settings`
      );
    }
  }

  // フォローイベント（友だち追加）
  if (event.type === "follow" && event.replyToken) {
    await replyLineMessage(
      event.replyToken,
      `WorkHubをご利用いただきありがとうございます！🎉

LINE連携を行うには:
1. アプリにログイン
2. 設定画面で「LINE連携」をクリック
3. 表示された6桁のコードをこのトークに送信

📱 アプリURL: ${process.env.NEXT_PUBLIC_APP_URL || "https://your-app.vercel.app"}`
    );
  }
}

/**
 * 連携コードを処理
 */
async function handleLinkingCode(
  event: LineWebhookEvent,
  lineUserId: string,
  code: string
): Promise<void> {
  const adminClient = createAdminClient();

  // 既にこのLINEアカウントが連携されているかチェック
  const { data: existingProfile } = await adminClient
    .from("profiles")
    .select("id, name")
    .eq("line_user_id", lineUserId)
    .single();

  if (existingProfile) {
    if (event.replyToken) {
      await replyLineMessage(
        event.replyToken,
        `このLINEアカウントは既に${existingProfile.name}さんとして連携されています。

別のアカウントと連携する場合は、まず現在の連携を解除してください。`
      );
    }
    return;
  }

  // 連携コードで検索
  const { data: profile, error } = await adminClient
    .from("profiles")
    .select("id, name, line_linking_code_expires_at")
    .eq("line_linking_code", code)
    .single();

  if (error || !profile) {
    if (event.replyToken) {
      await replyLineMessage(
        event.replyToken,
        `連携コードが見つかりません。

コードが正しいか確認してください。コードは発行から10分間有効です。`
      );
    }
    return;
  }

  // 有効期限チェック
  const expiresAt = new Date(profile.line_linking_code_expires_at);
  if (expiresAt < new Date()) {
    if (event.replyToken) {
      await replyLineMessage(
        event.replyToken,
        `連携コードの有効期限が切れています。

設定画面で新しいコードを発行してください。`
      );
    }
    return;
  }

  // LINE連携を完了
  const { error: updateError } = await adminClient
    .from("profiles")
    .update({
      line_user_id: lineUserId,
      line_linked_at: new Date().toISOString(),
      line_linking_code: null,
      line_linking_code_expires_at: null,
    })
    .eq("id", profile.id);

  if (updateError) {
    console.error("Failed to complete LINE linking:", updateError);
    if (event.replyToken) {
      await replyLineMessage(
        event.replyToken,
        `連携処理中にエラーが発生しました。もう一度お試しください。`
      );
    }
    return;
  }

  // 成功メッセージ
  if (event.replyToken) {
    await replyLineMessage(
      event.replyToken,
      createLinkingSuccessMessage(profile.name)
    );
  }
}

// Webhook検証用のGET（LINE Developersの設定時に使用）
export async function GET() {
  return NextResponse.json({ status: "OK" });
}
