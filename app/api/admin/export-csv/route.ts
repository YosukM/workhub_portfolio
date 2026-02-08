import { createClient } from "@/lib/supabase/server";
import { getAllUsersMonthlyHours } from "@/lib/reports";
import { NextResponse } from "next/server";
import { getMonthRange } from "@/lib/date-utils";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1.セッションの取得
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 管理者チェック
    const { data: profileData } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    const profile = profileData as { role: string } | null;

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2. データの取得
    const body = await request.json().catch(() => ({}));
    const targetDate = body.date || new Date().toISOString();

    // 月の範囲を取得
    const { startDate, endDate } = getMonthRange(targetDate);
    
    // 稼働時間集計
    const userHours = await getAllUsersMonthlyHours(startDate, endDate);

    // 3. CSV生成
    const header = ["メンバー名", "稼働時間合計(h)", "集計期間"];
    const rows = userHours.map(u => [
      `"${u.userName.replace(/"/g, '""')}"`, // エスケープ処理
      u.totalHours,
      `"${startDate} 〜 ${endDate}"`
    ]);
    
    const csvContent = [
      header.join(","),
      ...rows.map(row => row.join(','))
    ].join("\n");

    // BOM付きUTF-8にする（Excelでの文字化け防止）
    const bom = "\uFEFF";
    const csvWithBom = bom + csvContent;

    return new NextResponse(csvWithBom, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="worklog_${startDate.slice(0, 7)}.csv"`,
      },
    });

  } catch (error: any) {
    console.error("Export error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
