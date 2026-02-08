"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * ユーザーの稼働状態（is_active）を切り替える
 */
export async function toggleUserStatus(
  userId: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // 実行ユーザーが管理者かチェック
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const adminClient = createAdminClient();

  // 管理者権限チェック
  const { data: executorProfile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (executorProfile?.role !== "admin") {
    return { success: false, error: "Forbidden" };
  }

  // ステータス更新
  const { error } = await adminClient
    .from("profiles")
    .update({ is_active: isActive })
    .eq("id", userId);

  if (error) {
    console.error("Error updating user status:", error);
    return { success: false, error: "Failed to update user status" };
  }

  revalidatePath("/admin/users");
  revalidatePath("/dashboard"); // ダッシュボードの表示も変わるため
  return { success: true };
}

/**
 * ユーザーの権限（role）を切り替える
 */
export async function toggleUserRole(
  userId: string,
  newRole: "admin" | "member"
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // 実行ユーザーが管理者かチェック
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const adminClient = createAdminClient();

  // 管理者権限チェック
  const { data: executorProfile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (executorProfile?.role !== "admin") {
    return { success: false, error: "Forbidden" };
  }

  // 自分自身の権限変更は不可（誤って管理者権限を失うのを防ぐため）
  if (userId === user.id) {
    return { success: false, error: "自分自身の権限は変更できません" };
  }

  // 権限更新
  const { error } = await adminClient
    .from("profiles")
    .update({ role: newRole })
    .eq("id", userId);

  if (error) {
    console.error("Error updating user role:", error);
    return { success: false, error: "Failed to update user role" };
  }

  revalidatePath("/admin/users");
  return { success: true };
}
