"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(
  prevState: any,
  formData: FormData
): Promise<{ error: string | null; success: boolean }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "認証エラー", success: false };
  }

  const name = formData.get("name") as string;

  if (!name || name.trim().length === 0) {
    return { error: "名前を入力してください", success: false };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("profiles") as any)
    .update({ name: name.trim() })
    .eq("id", user.id);

  if (error) {
    console.error("Error updating profile:", error);
    return { error: "プロフィールの更新に失敗しました", success: false };
  }

  revalidatePath("/dashboard");
  revalidatePath("/settings");

  return { error: null, success: true };
}
