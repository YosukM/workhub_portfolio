/**
 * LINE Link API Route
 * LINE連携コードの生成・連携解除
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * 連携コードを生成
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 現在のユーザーを取得
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminClient = createAdminClient();

    // 既にLINE連携されているかチェック
    const { data: profile } = await adminClient
      .from("profiles")
      .select("line_user_id")
      .eq("id", user.id)
      .single();

    if (profile?.line_user_id) {
      return NextResponse.json(
        { error: "Already linked to LINE" },
        { status: 400 }
      );
    }

    // 6桁のランダムコードを生成
    const linkingCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10分後

    // コードを保存
    const { error: updateError } = await adminClient
      .from("profiles")
      .update({
        line_linking_code: linkingCode,
        line_linking_code_expires_at: expiresAt,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Failed to generate linking code:", updateError);
      return NextResponse.json(
        { error: "Failed to generate code" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      code: linkingCode,
      expiresAt,
    });
  } catch (error) {
    console.error("LINE link error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * LINE連携を解除
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 現在のユーザーを取得
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminClient = createAdminClient();

    // 連携を解除
    const { error: updateError } = await adminClient
      .from("profiles")
      .update({
        line_user_id: null,
        line_linked_at: null,
        line_linking_code: null,
        line_linking_code_expires_at: null,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Failed to unlink LINE:", updateError);
      return NextResponse.json(
        { error: "Failed to unlink" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("LINE unlink error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * 連携状態を取得
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 現在のユーザーを取得
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminClient = createAdminClient();

    const { data: profile } = await adminClient
      .from("profiles")
      .select("line_user_id, line_linked_at")
      .eq("id", user.id)
      .single();

    return NextResponse.json({
      isLinked: !!profile?.line_user_id,
      linkedAt: profile?.line_linked_at || null,
    });
  } catch (error) {
    console.error("LINE status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
