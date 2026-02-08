/**
 * Profile Data Access Layer
 * ユーザープロフィール関連のデータアクセス
 */

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/types";

/**
 * 現在のユーザーのプロフィールを取得
 */
export async function getCurrentUserProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await adminClient
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching current user profile:", error);
    return null;
  }

  return data;
}

/**
 * 特定ユーザーのプロフィールを取得
 */
export async function getProfileById(userId: string): Promise<Profile | null> {
  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return data;
}

/**
 * 全ユーザーのプロフィールを取得
 */
export async function getAllProfiles(): Promise<Profile[]> {
  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from("profiles")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching profiles:", error);
    throw new Error("Failed to fetch profiles");
  }

  return data || [];
}

/**
 * プロフィールを更新
 */
export async function updateProfile(
  userId: string,
  updates: {
    name?: string;
    role?: "admin" | "member";
  }
): Promise<Profile> {
  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating profile:", error);
    throw new Error("Failed to update profile");
  }

  return data as Profile;
}

/**
 * 現在のユーザーが管理者かどうかを確認
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const adminClient = createAdminClient();

  const { data: profile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return profile?.role === "admin";
}

/**
 * 特定のユーザーが管理者かどうかを確認
 */
export async function isAdminById(userId: string): Promise<boolean> {
  const adminClient = createAdminClient();

  const { data: profile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  return profile?.role === "admin";
}

/**
 * メンバー一覧を取得（管理者以外）
 */
export async function getMembers(): Promise<Profile[]> {
  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from("profiles")
    .select("*")
    .eq("role", "member")
    .order("name");

  if (error) {
    console.error("Error fetching members:", error);
    throw new Error("Failed to fetch members");
  }

  return data || [];
}

/**
 * 管理者一覧を取得
 */
export async function getAdmins(): Promise<Profile[]> {
  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from("profiles")
    .select("*")
    .eq("role", "admin")
    .order("name");

  if (error) {
    console.error("Error fetching admins:", error);
    throw new Error("Failed to fetch admins");
  }

  return data || [];
}
