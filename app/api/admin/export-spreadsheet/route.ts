import { createClient } from "@/lib/supabase/server";
import { google } from "googleapis";
import { getAllUsersMonthlyHours } from "@/lib/reports";
import { NextResponse } from "next/server";
import { getMonthRange, getNextDate } from "@/lib/date-utils";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. セッションの取得
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Googleプロバイダのトークン取得
    const providerToken = session.provider_token;
    
    // Googleログイン以外、またはトークンがない場合
    if (!providerToken) {
       return NextResponse.json({ error: "Google account linkage required. Please login with Google." }, { status: 400 });
    }

    // 3. データの取得
    // リクエストボディから対象月を取得（なければ今月）
    const body = await request.json().catch(() => ({}));
    const targetDate = body.date || new Date().toISOString();

    // 月の範囲を取得
    const { startDate, endDate } = getMonthRange(targetDate);
    
    // 稼働時間集計（getAllUsersMonthlyHoursは内部で日付を1日ずらす処理をしているため、そのまま渡す）
    // ※注意：先ほどの修正でgetAllUsersMonthlyHours内でgetNextDateを使うように変更したので、
    // ここでは純粋な月の開始日・終了日を渡せばOK
    const userHours = await getAllUsersMonthlyHours(startDate, endDate);

    // 4. Google Sheets APIの初期化
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: providerToken });
    const sheets = google.sheets({ version: "v4", auth });

    // 5. スプレッドシートの作成
    const sheetName = "WorkLog";
    const resource = {
      properties: {
        title: `WorkHub稼働集計_${startDate.slice(0, 7)}`,
      },
      sheets: [
        {
          properties: {
            title: sheetName,
          },
        },
      ],
    };

    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: resource,
    });

    const spreadsheetId = spreadsheet.data.spreadsheetId;

    // 6. データの書き込み
    // ヘッダー
    const header = ["メンバー名", "稼働時間合計(h)", "集計期間"];
    // データ行
    const rows = userHours.map(u => [u.userName, u.totalHours, `${startDate} 〜 ${endDate}`]);
    
    const values = [header, ...rows];

    await sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId!,
      range: `${sheetName}!A1`,
      valueInputOption: "RAW",
      requestBody: {
        values: values,
      },
    });

    return NextResponse.json({ 
      success: true, 
      spreadsheetUrl: spreadsheet.data.spreadsheetUrl 
    });

  } catch (error: any) {
    console.error("Export error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
