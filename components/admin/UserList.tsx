"use client";

/**
 * UserList Component
 * ユーザー一覧と削除機能
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toggleUserStatus, toggleUserRole } from "@/app/actions/admin";
import type { Profile } from "@/types";

interface UserListProps {
  users: Profile[];
  currentUserId: string;
}

export function UserList({ users, currentUserId }: UserListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [togglingRoleId, setTogglingRoleId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleToggleStatus = async (user: Profile, isActive: boolean) => {
    setTogglingId(user.id);
    setError(null);
    try {
      const result = await toggleUserStatus(user.id, isActive);
      if (!result.success) {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error("Status update error:", err);
      setError("ステータスの更新に失敗しました");
    } finally {
      setTogglingId(null);
    }
  };

  const handleToggleRole = async (user: Profile, isAdmin: boolean) => {
    setTogglingRoleId(user.id);
    setError(null);
    try {
      const result = await toggleUserRole(user.id, isAdmin ? "admin" : "member");
      if (!result.success) {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error("Role update error:", err);
      setError(err instanceof Error ? err.message : "権限の更新に失敗しました");
    } finally {
      setTogglingRoleId(null);
    }
  };

  const handleDelete = async (user: Profile) => {
    if (user.id === currentUserId) {
      setError("自分自身は削除できません");
      return;
    }

    const confirmed = window.confirm(
      `${user.name}さんを削除しますか?\n\nこの操作は取り消せません。関連する全ての報告データも削除されます。`
    );

    if (!confirmed) return;

    setDeletingId(user.id);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error("Delete user failed:", response.status, data);
        throw new Error(data.error || `削除に失敗しました (${response.status})`);
      }

      router.refresh();
    } catch (err) {
      console.error("Delete user error:", err);
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
          {error}
        </div>
      )}

      <div className="divide-y">
        {users.map((user) => (
          <div
            key={user.id}
            className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`font-medium truncate ${!(user.is_active ?? true) ? "text-muted-foreground" : ""}`}>
                  {user.name}
                </span>
                {user.role === "admin" && (
                  <Badge variant="secondary">管理者</Badge>
                )}
                {!(user.is_active ?? true) && (
                  <Badge variant="outline" className="text-muted-foreground">停止中</Badge>
                )}
                {user.id === currentUserId && (
                  <Badge variant="outline">あなた</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {user.email}
              </p>
              <p className="text-xs text-muted-foreground">
                登録日: {new Date(user.created_at).toLocaleDateString("ja-JP")}
              </p>
            </div>

            <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
              {/* 管理者権限スイッチ */}
              <div className="flex items-center space-x-2">
                <Switch
                  id={`admin-${user.id}`}
                  checked={user.role === "admin"}
                  onCheckedChange={(checked) => handleToggleRole(user, checked)}
                  disabled={togglingRoleId === user.id || user.id === currentUserId}
                />
                <Label 
                  htmlFor={`admin-${user.id}`} 
                  className={`text-xs cursor-pointer min-w-[3em] ${user.id === currentUserId ? "text-muted-foreground/50" : "text-muted-foreground"}`}
                >
                  {user.role === "admin" ? "管理者" : "一般"}
                </Label>
              </div>

              {/* 稼働状態スイッチ */}
              <div className="flex items-center space-x-2">
                <Switch
                  id={`active-${user.id}`}
                  checked={user.is_active ?? true}
                  onCheckedChange={(checked) => handleToggleStatus(user, checked)}
                  disabled={togglingId === user.id}
                />
                <Label htmlFor={`active-${user.id}`} className="text-xs text-muted-foreground cursor-pointer min-w-[3em]">
                  {(user.is_active ?? true) ? "稼働中" : "停止中"}
                </Label>
              </div>

              {user.line_user_id && (
                <Badge variant="outline" className="text-green-600">
                  LINE連携済
                </Badge>
              )}

              {user.id !== currentUserId && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(user)}
                  disabled={deletingId === user.id}
                >
                  {deletingId === user.id ? "削除中..." : "削除"}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          ユーザーがいません
        </p>
      )}
    </div>
  );
}
