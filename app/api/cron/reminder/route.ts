/**
 * Reminder Cron Job API
 * 毎朝10:00にLINE連携済みかつ未提出のユーザーへリマインダーを送信
 *
 * Vercel Cron設定（vercel.json）:
 * {
 *   "crons": [{
 *     "path": "/api/cron/reminder",
 *     "schedule": "0 1 * * *"  // UTC 1:00 = JST 10:00
 *   }]
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendLineMulticast, createReminderMessage } from "@/lib/line";
import { getTodayDate } from "@/lib/date-utils";

// Node.jsランタイムを使用
export const runtime = "nodejs";

// Cron認証用のシークレット（Vercelから送信される）
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  try {
    console.log("Starting reminder cron job...");

    // Vercel Cronからの認証を確認
    const authHeader = request.headers.get("authorization");
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      console.error("Unauthorized cron access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminClient = createAdminClient();
    const today = getTodayDate();
    console.log(`Processing reminders for date: ${today}`);

    // 1. LINE連携済みかつ稼働中の全ユーザーを取得
    const { data: profiles, error: profilesError } = await adminClient
      .from("profiles")
      .select("id, name, line_user_id")
      .not("line_user_id", "is", null)
      .eq("is_active", true);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw new Error("Failed to fetch profiles");
    }

    if (!profiles || profiles.length === 0) {
      console.log("No LINE-linked active users found.");
      return NextResponse.json({
        success: true,
        message: "No LINE-linked users found",
        notified: 0,
      });
    }

    console.log(`Found ${profiles.length} potential users for reminder.`);

    // 2. 今日の報告を提出済みのユーザーを取得
    const { data: reports, error: reportsError } = await adminClient
      .from("reports")
      .select("user_id")
      .eq("report_date", today);

    if (reportsError) {
      console.error("Error fetching reports:", reportsError);
      throw new Error("Failed to fetch reports");
    }

    // 提出済みユーザーIDのセットを作成
    const submittedUserIds = new Set(reports?.map((r) => r.user_id) || []);
    console.log(`Found ${submittedUserIds.size} submitted reports for today.`);

    // 3. 未提出のLINEユーザーIDリスト作成
    const targetProfiles = profiles.filter((p) => !submittedUserIds.has(p.id));
    const lineUserIds = targetProfiles
      .map((p) => p.line_user_id)
      .filter((id): id is string => id !== null);

    if (lineUserIds.length === 0) {
      console.log("Everyone has submitted reports. No reminders needed.");
      return NextResponse.json({
        success: true,
        message: "All users have submitted reports",
        notified: 0,
      });
    }

    console.log(
      `Sending reminders to ${lineUserIds.length} users: ${targetProfiles
        .map((u) => u.name)
        .join(", ")}`
    );

    // 4. リマインダーメッセージを送信
    const message = createReminderMessage();
    const success = await sendLineMulticast(lineUserIds, message);

    if (!success) {
      console.error("Failed to send LINE multicast messages");
      return NextResponse.json(
        { error: "Failed to send LINE messages" },
        { status: 500 }
      );
    }

    console.log("Reminders sent successfully.");

    return NextResponse.json({
      success: true,
      message: `Reminder sent to ${lineUserIds.length} users`,
      notified: lineUserIds.length,
      users: targetProfiles.map((u) => u.name),
    });
  } catch (error) {
    console.error("Reminder cron error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}