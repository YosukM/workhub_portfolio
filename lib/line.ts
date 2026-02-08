/**
 * LINE Messaging API Client
 * LINE連携のためのユーティリティ関数
 */

import crypto from "crypto";

const LINE_API_BASE = "https://api.line.me/v2/bot";

/**
 * LINE Messaging APIへのリクエスト
 */
async function lineRequest(
  endpoint: string,
  method: "GET" | "POST" = "POST",
  body?: object
): Promise<Response> {
  const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error("LINE_CHANNEL_ACCESS_TOKEN is not configured");
  }

  return fetch(`${LINE_API_BASE}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * LINEユーザーにメッセージを送信
 */
export async function sendLineMessage(
  lineUserId: string,
  message: string
): Promise<boolean> {
  try {
    const response = await lineRequest("/message/push", "POST", {
      to: lineUserId,
      messages: [
        {
          type: "text",
          text: message,
        },
      ],
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("LINE API error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to send LINE message:", error);
    return false;
  }
}

/**
 * 複数ユーザーにメッセージを一括送信（マルチキャスト）
 */
export async function sendLineMulticast(
  lineUserIds: string[],
  message: string
): Promise<boolean> {
  if (lineUserIds.length === 0) {
    return true;
  }

  try {
    const response = await lineRequest("/message/multicast", "POST", {
      to: lineUserIds,
      messages: [
        {
          type: "text",
          text: message,
        },
      ],
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("LINE multicast error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to send LINE multicast:", error);
    return false;
  }
}

/**
 * リマインダーメッセージを作成
 */
export function createReminderMessage(userName?: string): string {
  const greeting = userName ? `${userName}さん、` : "";
  return `${greeting}おはようございます！🌅

本日の日次報告がまだ提出されていません。

📝 報告の入力はこちらから:
${process.env.NEXT_PUBLIC_APP_URL || "https://your-app.vercel.app"}/report

※ 毎朝10時までに報告をお願いします。`;
}

/**
 * LINE連携完了メッセージ
 */
export function createLinkingSuccessMessage(userName: string): string {
  return `${userName}さん、LINE連携が完了しました！✅

これより、日次報告のリマインダーをLINEでお届けします。

📅 リマインド時間: 毎朝 9:50
📝 報告期限: 毎朝 10:00`;
}

/**
 * 管理者への報告提出通知メッセージ
 */
export function createAdminNotificationMessage(
  userName: string,
  reportDate: string,
  userId: string
): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://your-app.vercel.app";
  return `${userName}さんが ${reportDate} の日次報告を提出しました。✅

詳細はこちら:
${appUrl}/dashboard/${userId}`;
}

/**
 * Webhookイベントの型定義
 */
export interface LineWebhookEvent {
  type: string;
  replyToken?: string;
  source: {
    userId?: string;
    type: string;
  };
  message?: {
    type: string;
    text?: string;
  };
}

export interface LineWebhookBody {
  events: LineWebhookEvent[];
}

/**
 * Webhook署名の検証
 */
export function verifyLineSignature(
  body: string,
  signature: string
): boolean {
  const channelSecret = process.env.LINE_CHANNEL_SECRET;

  if (!channelSecret) {
    console.error("LINE_CHANNEL_SECRET is not configured");
    return false;
  }

  const hash = crypto
    .createHmac("SHA256", channelSecret)
    .update(body)
    .digest("base64");

  return hash === signature;
}

/**
 * リプライメッセージ送信
 */
export async function replyLineMessage(
  replyToken: string,
  message: string
): Promise<boolean> {
  try {
    const response = await lineRequest("/message/reply", "POST", {
      replyToken,
      messages: [
        {
          type: "text",
          text: message,
        },
      ],
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("LINE reply error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to reply LINE message:", error);
    return false;
  }
}
