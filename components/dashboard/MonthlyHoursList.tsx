/**
 * MonthlyHoursList Component
 * 管理者向け：全ユーザーの当月稼働時間一覧
 */

import Link from "next/link";
import { Card } from "@/components/ui/card";

interface UserMonthlyHours {
  userId: string;
  userName: string;
  totalHours: number;
}

interface MonthlyHoursListProps {
  usersHours: UserMonthlyHours[];
  month: string; // "2026年1月" のような表示用文字列
}

export function MonthlyHoursList({ usersHours, month }: MonthlyHoursListProps) {
  // 稼働時間順にソート（降順）
  const sortedUsers = [...usersHours].sort((a, b) => b.totalHours - a.totalHours);

  // 全体の合計
  const totalAllHours = usersHours.reduce((sum, u) => sum + u.totalHours, 0);

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-sm sm:text-base">
            {month} 稼働時間一覧
          </h3>
        </div>
        <div className="text-right">
          <span className="text-xs text-muted-foreground">合計</span>
          <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
            {totalAllHours.toFixed(1)}h
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-2 font-medium text-muted-foreground">ユーザー</th>
              <th className="text-right py-2 px-2 font-medium text-muted-foreground">稼働時間</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user) => (
              <tr
                key={user.userId}
                className="border-b last:border-b-0 hover:bg-muted/50 transition-colors"
              >
                <td className="py-2.5 px-2">
                  <Link
                    href={`/dashboard/${user.userId}`}
                    className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-medium shrink-0">
                      {user.userName.charAt(0)}
                    </div>
                    <span className="truncate">{user.userName}</span>
                  </Link>
                </td>
                <td className="py-2.5 px-2 text-right">
                  <span className={`font-semibold tabular-nums ${
                    user.totalHours > 0
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}>
                    {user.totalHours.toFixed(1)}h
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {usersHours.length === 0 && (
        <p className="text-center text-muted-foreground text-sm py-4">
          データがありません
        </p>
      )}
    </Card>
  );
}
