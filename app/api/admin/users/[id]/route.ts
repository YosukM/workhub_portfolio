/**
 * Admin User Management API
 * 管理者用ユーザー削除API
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * ユーザーを削除（管理者のみ）
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await context.params;

    if (!targetUserId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const supabase = await createClient();

    // 現在のユーザーを取得
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminClient = createAdminClient();

    // 現在のユーザーが管理者かチェック（profiles.role を使用）
    const { data: currentProfile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (currentProfile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 自分自身は削除できない
    if (targetUserId === user.id) {
      return NextResponse.json(
        { error: "Cannot delete yourself" },
        { status: 400 }
      );
    }

    // 削除対象のユーザーが存在するかチェック
    const { data: targetProfile } = await adminClient
      .from("profiles")
      .select("id, name, role")
      .eq("id", targetUserId)
      .single();

    if (!targetProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 関連するレポートを削除
    const { error: reportsError } = await adminClient
      .from("reports")
      .delete()
      .eq("user_id", targetUserId);

    if (reportsError) {
      console.error("Failed to delete user reports:", reportsError);
      return NextResponse.json(
        { error: "Failed to delete user reports" },
        { status: 500 }
      );
    }

    // user_identities を削除
    const { error: identitiesError } = await adminClient
      .from("user_identities")
      .delete()
      .eq("user_id", targetUserId);

    if (identitiesError) {
      console.error("Failed to delete user identities:", identitiesError);
      // 続行（クリティカルではない）
    }

    // admin_users から削除（管理者の場合）
    await adminClient
      .from("admin_users")
      .delete()
      .eq("user_id", targetUserId);

    // プロフィールを削除
    const { error: profileError } = await adminClient
      .from("profiles")
      .delete()
      .eq("id", targetUserId);

    if (profileError) {
      console.error("Failed to delete profile:", profileError);
      return NextResponse.json(
        { error: "Failed to delete profile" },
        { status: 500 }
      );
    }

    // Supabase Authからユーザーを削除
    const { error: authError } = await adminClient.auth.admin.deleteUser(
      targetUserId
    );

    if (authError) {
      console.error("Failed to delete auth user:", authError);
      // プロフィールは削除済みなのでログのみ
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
