/**
 * UserStats Component
 * ユーザー統計情報コンポーネント
 */

import { Card } from "@/components/ui/card";

interface UserStatsProps {
  statistics: {
    totalReports: number;
    totalYesterdayHours: number;
    totalTodayHours: number;
    averageYesterdayHours: number;
    averageTodayHours: number;
    totalTasks: number;
  };
}

export function UserStats({ statistics }: UserStatsProps) {
  const stats = [
    {
      label: "報告回数",
      value: statistics.totalReports,
      unit: "回",
      color: "text-foreground",
    },
    {
      label: "実績合計",
      value: statistics.totalYesterdayHours.toFixed(1),
      unit: "h",
      color: "text-blue-600",
    },
    {
      label: "予定合計",
      value: statistics.totalTodayHours.toFixed(1),
      unit: "h",
      color: "text-green-600",
    },
    {
      label: "総タスク数",
      value: statistics.totalTasks,
      unit: "件",
      color: "text-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="p-4">
          <div className="text-xs text-muted-foreground mb-1">
            {stat.label}
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </span>
            <span className="text-sm text-muted-foreground">{stat.unit}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}
