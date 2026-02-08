"use client";

/**
 * ReportForm Component
 * 報告入力フォーム
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TaskInput } from "./TaskInput";
import { Button } from "@/components/ui/button";
import { submitReport } from "@/app/actions/reports";
import type { TaskFormData, Report, Task } from "@/types";

interface ReportFormProps {
  reportDate: string;
  existingReport?: Report | null;
  carryoverTasks?: Task[]; // 前日の「今日の予定」からの引き継ぎ
}

export function ReportForm({
  reportDate,
  existingReport,
  carryoverTasks = [],
}: ReportFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // 初期値の設定
  // 既存レポートがある場合はそれを使用、なければ引き継ぎタスクを使用
  const initialYesterdayTasks: TaskFormData[] = existingReport?.yesterday_tasks
    ? existingReport.yesterday_tasks.map((task: Task) => ({
        task_name: task.task_name,
        hours: task.actual_hours || 0,
        completed: task.completed || false,
      }))
    : carryoverTasks.length > 0
    ? carryoverTasks.map((task: Task) => ({
        task_name: task.task_name,
        hours: task.planned_hours || 0,
        completed: false, // 引き継ぎ時は未完了
      }))
    : [];

  const initialTodayTasks: TaskFormData[] = existingReport?.today_tasks
    ? existingReport.today_tasks.map((task: Task) => ({
        task_name: task.task_name,
        hours: task.planned_hours || 0,
      }))
    : [];

  const [yesterdayTasks, setYesterdayTasks] = useState<TaskFormData[]>(
    initialYesterdayTasks
  );
  const [todayTasks, setTodayTasks] = useState<TaskFormData[]>(
    initialTodayTasks
  );
  const [notes, setNotes] = useState(existingReport?.notes || "");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // バリデーション
    const validYesterdayTasks = yesterdayTasks.filter(
      (task) => task.task_name.trim() !== "" && task.hours > 0
    );
    const validTodayTasks = todayTasks.filter(
      (task) => task.task_name.trim() !== "" && task.hours > 0
    );

    if (validYesterdayTasks.length === 0 && validTodayTasks.length === 0) {
      setError("昨日の実績または今日の予定を最低1つ入力してください");
      return;
    }

    // フォームデータを作成
    const formData = new FormData();
    formData.append("report_date", reportDate);
    formData.append(
      "yesterday_tasks",
      JSON.stringify(
        validYesterdayTasks.map((task) => ({
          task_name: task.task_name,
          actual_hours: task.hours,
          completed: task.completed || false,
        }))
      )
    );
    formData.append(
      "today_tasks",
      JSON.stringify(
        validTodayTasks.map((task) => ({
          task_name: task.task_name,
          planned_hours: task.hours,
        }))
      )
    );
    formData.append("notes", notes);

    // サーバーアクション実行
    startTransition(async () => {
      const result = await submitReport(formData);

      if (result.success) {
        setSuccess(true);
        // 3秒後にダッシュボードへリダイレクト
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        setError(result.error || "報告の送信に失敗しました");
      }
    });
  };

  // 引き継ぎタスクがあるかどうか
  const hasCarryover = carryoverTasks.length > 0 && !existingReport;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 引き継ぎ通知 */}
      {hasCarryover && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md text-sm">
          前日の予定から {carryoverTasks.length} 件のタスクを引き継ぎました。完了したタスクにチェックを入れてください。
        </div>
      )}

      {/* 昨日の実績 */}
      <div className="bg-card border rounded-lg p-6">
        <TaskInput
          label="昨日の実績"
          placeholder="実施したタスクを入力"
          initialTasks={initialYesterdayTasks}
          onChange={setYesterdayTasks}
          showCompleted={true}
        />
      </div>

      {/* 今日の予定 */}
      <div className="bg-card border rounded-lg p-6">
        <TaskInput
          label="今日の予定"
          placeholder="予定しているタスクを入力"
          initialTasks={initialTodayTasks}
          onChange={setTodayTasks}
        />
      </div>

      {/* 困りごと・相談 */}
      <div className="bg-card border rounded-lg p-6 space-y-4">
        <label htmlFor="notes" className="text-sm font-medium">
          困りごと・相談（任意）
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="困っていることや相談したいことがあれば入力してください"
          rows={4}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* 成功メッセージ */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md text-sm">
          報告を送信しました。ダッシュボードに移動します...
        </div>
      )}

      {/* 送信ボタン */}
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isPending}
          className="flex-1"
        >
          {isPending ? "送信中..." : existingReport ? "更新する" : "報告する"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard")}
          disabled={isPending}
        >
          キャンセル
        </Button>
      </div>
    </form>
  );
}
