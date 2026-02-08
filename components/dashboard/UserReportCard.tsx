/**
 * UserReportCard Component
 * ダッシュボード用ユーザーレポートカード（モダンデザイン）
 */

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ReportSummary, Task } from "@/types";
import { formatTime } from "@/lib/date-utils";

interface UserReportCardProps {
  summary: ReportSummary;
}

export function UserReportCard({ summary }: UserReportCardProps) {
  const isSubmitted = summary.has_submitted;
  const isAdmin = summary.user_role === "admin";

  // タスクを分類
  // 持ち越しタスク = 昨日の実績のうち未完了のもの
  const carryoverTasks = summary.yesterday_tasks.filter(
    (task: Task) => !task.completed
  );
  // 完了タスク = 昨日の実績のうち完了のもの
  const completedTasks = summary.yesterday_tasks.filter(
    (task: Task) => task.completed
  );
  // 本日のタスク = 今日の予定
  const todayTasks = summary.today_tasks;

  // 時間計算
  const carryoverHours = carryoverTasks.reduce(
    (sum: number, task: Task) => sum + (task.actual_hours || 0),
    0
  );
  const completedHours = completedTasks.reduce(
    (sum: number, task: Task) => sum + (task.actual_hours || 0),
    0
  );

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
        !isSubmitted
          ? "border-red-300 dark:border-red-800 bg-gradient-to-br from-red-50/50 to-orange-50/50 dark:from-red-950/20 dark:to-orange-950/20"
          : "hover:shadow-blue-500/10"
      }`}
    >
      {/* 提出済みの場合のアクセント */}
      {isSubmitted && (
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-green-500 to-emerald-500" />
      )}

      {/* 未提出の場合のアクセント */}
      {!isSubmitted && (
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-500 to-orange-500" />
      )}

      <div className="p-5">
        {/* ヘッダー */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {/* アバター */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                isSubmitted
                  ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                  : "bg-gradient-to-br from-gray-400 to-gray-500"
              }`}>
                {summary.user_name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{summary.user_name}</h3>
                  {isAdmin && (
                    <Badge variant="secondary" className="text-xs bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300">
                      管理者
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{summary.user_email}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {isSubmitted ? (
              <>
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 border-0">
                  提出済み
                </Badge>
                {summary.submitted_at && (
                  <span className="text-xs text-muted-foreground">
                    {formatTime(summary.submitted_at)}
                  </span>
                )}
              </>
            ) : (
              <Badge className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 border-0">
                未提出
              </Badge>
            )}
          </div>
        </div>

        {isSubmitted ? (
          <>
            {/* タスクセクション */}
            <div className="space-y-3 mb-4">
              {/* 持ち越しタスク */}
              {carryoverTasks.length > 0 && (
                <div className="p-3 rounded-lg bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-orange-700 dark:text-orange-300 flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      持ち越しタスク
                    </h4>
                    <span className="text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/50 px-2 py-0.5 rounded-full">
                      {carryoverHours.toFixed(1)}h
                    </span>
                  </div>
                  <ul className="space-y-1.5">
                    {carryoverTasks.map((task: Task, index: number) => (
                      <li
                        key={index}
                        className="text-sm flex items-start justify-between gap-2"
                      >
                        <span className="flex-1 truncate text-foreground/80">{task.task_name}</span>
                        <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                          {task.actual_hours?.toFixed(1)}h
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 完了タスク（昨日完了したもの） */}
              {completedTasks.length > 0 && (
                <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      完了タスク
                    </h4>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full">
                      {completedHours.toFixed(1)}h
                    </span>
                  </div>
                  <ul className="space-y-1.5">
                    {completedTasks.map((task: Task, index: number) => (
                      <li
                        key={index}
                        className="text-sm flex items-start justify-between gap-2"
                      >
                        <span className="flex-1 truncate text-foreground/60 line-through">{task.task_name}</span>
                        <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                          {task.actual_hours?.toFixed(1)}h
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 本日のタスク */}
              <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    本日のタスク
                  </h4>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded-full">
                    {summary.today_total_hours.toFixed(1)}h
                  </span>
                </div>
                {todayTasks.length > 0 ? (
                  <ul className="space-y-1.5">
                    {todayTasks.map((task: Task, index: number) => (
                      <li
                        key={index}
                        className="text-sm flex items-start justify-between gap-2"
                      >
                        <span className="flex-1 truncate text-foreground/80">{task.task_name}</span>
                        <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                          {task.planned_hours?.toFixed(1)}h
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground italic">予定なし</p>
                )}
              </div>
            </div>

            {/* 困りごと・相談 */}
            {summary.notes && (
              <div className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 mb-4">
                <h4 className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-1 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  困りごと・相談
                </h4>
                <p className="text-sm whitespace-pre-wrap text-foreground/80">{summary.notes}</p>
              </div>
            )}

            {/* 詳細リンク */}
            <Button asChild variant="outline" size="sm" className="w-full group">
              <Link href={`/dashboard/${summary.user_id}`} className="flex items-center justify-center gap-2">
                詳細を見る
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </Button>
          </>
        ) : (
          <div className="py-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              まだ報告が提出されていません
            </p>
            <Button asChild variant="outline" size="sm" className="group">
              <Link href={`/dashboard/${summary.user_id}`} className="flex items-center gap-2">
                詳細を見る
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
