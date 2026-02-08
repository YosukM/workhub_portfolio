"use client";

/**
 * TaskInput Component
 * タスク入力コンポーネント（動的に行を追加/削除可能）
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { TaskFormData } from "@/types";

interface TaskInputProps {
  label: string;
  placeholder: string;
  initialTasks?: TaskFormData[];
  onChange: (tasks: TaskFormData[]) => void;
  showCompleted?: boolean; // 「済み」チェックボックスを表示するか
}

// 完了エフェクトコンポーネント
function CompletionEffect({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* パーティクル */}
      {[...Array(6)].map((_, i) => (
        <span
          key={i}
          className="absolute w-2 h-2 rounded-full animate-particle"
          style={{
            left: "50%",
            top: "50%",
            backgroundColor: ["#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4"][i],
            animationDelay: `${i * 50}ms`,
            transform: `rotate(${i * 60}deg) translateY(-20px)`,
          }}
        />
      ))}
      {/* チェックマーク */}
      <span className="absolute inset-0 flex items-center justify-center animate-check-pop">
        <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </span>
    </div>
  );
}

export function TaskInput({
  label,
  placeholder,
  initialTasks = [],
  onChange,
  showCompleted = false,
}: TaskInputProps) {
  // ローカルステートでは入力を文字列として扱う（"0.5"や空文字などの入力を許容するため）
  type LocalTask = Omit<TaskFormData, "hours"> & { hours: string };

  const [tasks, setTasks] = useState<LocalTask[]>(
    initialTasks.length > 0
      ? initialTasks.map((t) => ({
          ...t,
          hours: t.hours === 0 ? "" : t.hours.toString(),
        }))
      : [{ task_name: "", hours: "" }]
  );
  const [completingIndex, setCompletingIndex] = useState<number | null>(null);

  const handleTaskChange = (
    index: number,
    field: keyof TaskFormData,
    value: string | number | boolean
  ) => {
    const newTasks = [...tasks];
    if (field === "task_name") {
      newTasks[index].task_name = value as string;
    } else if (field === "hours") {
      // 文字列として保存
      newTasks[index].hours = value as string;
    } else if (field === "completed") {
      const isCompleting = value as boolean;
      newTasks[index].completed = isCompleting;

      // 完了時にエフェクトを表示
      if (isCompleting) {
        setCompletingIndex(index);
        setTimeout(() => setCompletingIndex(null), 600);
      }
    }
    setTasks(newTasks);

    // 親コンポーネントには数値として渡す
    const numericTasks: TaskFormData[] = newTasks.map((t) => ({
      ...t,
      hours: t.hours === "" ? 0 : Number(t.hours),
    }));
    onChange(numericTasks);
  };

  const addTask = () => {
    const newTasks = [...tasks, { task_name: "", hours: "" }];
    setTasks(newTasks);
    // 新規追加時は0として扱う
    const numericTasks: TaskFormData[] = newTasks.map((t) => ({
      ...t,
      hours: t.hours === "" ? 0 : Number(t.hours),
    }));
    onChange(numericTasks);
  };

  const removeTask = (index: number) => {
    let newTasks: LocalTask[];
    if (tasks.length === 1) {
      // 最低1行は残す
      newTasks = [{ task_name: "", hours: "" }];
    } else {
      newTasks = tasks.filter((_, i) => i !== index);
    }
    setTasks(newTasks);

    const numericTasks: TaskFormData[] = newTasks.map((t) => ({
      ...t,
      hours: t.hours === "" ? 0 : Number(t.hours),
    }));
    onChange(numericTasks);
  };

  const totalHours = tasks.reduce(
    (sum, task) => sum + (task.hours === "" ? 0 : Number(task.hours)),
    0
  );

  return (
    <div className="space-y-4">
      {/* アニメーション用スタイル */}
      <style jsx global>{`
        @keyframes particle {
          0% {
            opacity: 1;
            transform: rotate(var(--rotation, 0deg)) translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: rotate(var(--rotation, 0deg)) translateY(-30px) scale(0);
          }
        }
        @keyframes check-pop {
          0% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            opacity: 1;
            transform: scale(1.3);
          }
          100% {
            opacity: 0;
            transform: scale(1);
          }
        }
        .animate-particle {
          animation: particle 0.5s ease-out forwards;
        }
        .animate-check-pop {
          animation: check-pop 0.5s ease-out forwards;
        }
      `}</style>

      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <span className="text-sm text-muted-foreground">
          合計: {totalHours.toFixed(1)}時間
        </span>
      </div>

      <div className="space-y-2">
        {tasks.map((task, index) => (
          <div
            key={index}
            className="flex gap-2 items-start relative"
          >
            {/* 完了エフェクト */}
            {showCompleted && completingIndex === index && (
              <CompletionEffect show={true} />
            )}

            {/* 済みチェックボックス */}
            {showCompleted && (
              <div className="flex items-center h-10 relative">
                <input
                  type="checkbox"
                  checked={task.completed || false}
                  onChange={(e) =>
                    handleTaskChange(index, "completed", e.target.checked)
                  }
                  className={`w-5 h-5 rounded border-2 cursor-pointer transition-all duration-200 ${
                    task.completed
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "border-gray-300 hover:border-emerald-400"
                  }`}
                  title="完了済み"
                />
              </div>
            )}
            <div className="flex-1">
              <input
                type="text"
                value={task.task_name}
                onChange={(e) =>
                  handleTaskChange(index, "task_name", e.target.value)
                }
                placeholder={placeholder}
                className={`w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200 ${
                  showCompleted && task.completed ? "line-through text-muted-foreground bg-muted/30" : ""
                }`}
              />
            </div>
            <div className="w-24">
              <input
                type="number"
                value={task.hours || ""}
                onChange={(e) =>
                  handleTaskChange(index, "hours", e.target.value)
                }
                placeholder="時間"
                step="0.5"
                min="0"
                max="24"
                className={`w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200 ${
                  showCompleted && task.completed ? "text-muted-foreground bg-muted/30" : ""
                }`}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => removeTask(index)}
              className="shrink-0"
            >
              ×
            </Button>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={addTask}
        className="w-full"
      >
        + タスクを追加
      </Button>
    </div>
  );
}
