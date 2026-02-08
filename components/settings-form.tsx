"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateProfile } from "@/app/actions/profile";

interface SettingsFormProps {
  profile: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export function SettingsForm({ profile }: SettingsFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfile, {
    error: null,
    success: false,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>プロフィール設定</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name">名前</Label>
              <Input
                id="name"
                name="name"
                type="text"
                defaultValue={profile.name}
                required
                disabled={isPending}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={profile.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                メールアドレスは変更できません
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">権限</Label>
              <Input
                id="role"
                name="role"
                type="text"
                defaultValue={profile.role === "admin" ? "管理者" : "メンバー"}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                権限は管理者のみ変更できます
              </p>
            </div>

            {state?.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}
            {state?.success && (
              <p className="text-sm text-green-600">保存しました</p>
            )}

            <Button type="submit" disabled={isPending}>
              {isPending ? "保存中..." : "保存"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
