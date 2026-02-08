/**
 * ReportHistory Component
 * レポート履歴表示コンポーネント
 */

import { Card } from "@/components/ui/card";
import type { Report, Task } from "@/types";
import { formatDateWithDay, formatTime } from "@/lib/date-utils";
import { calculateTotalHours } from "@/lib/reports";

interface ReportHistoryProps {
  reports: Report[];
}

export function ReportHistory({ reports }: ReportHistoryProps) {
  if (reports.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">
          この期間には報告がありません
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <Card key={report.id} className="p-6">
          {/* ヘッダー */}
          <div className="flex items-start justify-between mb-4 pb-4 border-b">
            <div>
              <h3 className="font-semibold text-lg">
                {formatDateWithDay(report.report_date)}
              </h3>
              <p className="text-sm text-muted-foreground">
                提出: {formatTime(report.submitted_at)}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">稼働時間</div>
              <div className="flex gap-3">
                <div>
                  <span className="text-xs text-muted-foreground">実績: </span>
                  <span className="font-semibold text-blue-600">
                    {calculateTotalHours(report.yesterday_tasks).toFixed(1)}h
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">予定: </span>
                  <span className="font-semibold text-green-600">
                    {calculateTotalHours(report.today_tasks).toFixed(1)}h
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 実績と予定 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 昨日の実績 */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                昨日の実績
              </h4>
              {report.yesterday_tasks.length > 0 ? (
                <ul className="space-y-2">
                  {report.yesterday_tasks.map((task: Task, index: number) => (
                    <li
                      key={index}
                      className="flex items-start justify-between gap-2 p-2 rounded bg-muted/50"
                    >
                      <span className="flex-1">{task.task_name}</span>
                      <span className="text-sm font-medium text-blue-600 shrink-0">
                        {task.actual_hours?.toFixed(1)}h
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  実績なし
                </p>
              )}
            </div>

            {/* 今日の予定 */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                今日の予定
              </h4>
              {report.today_tasks.length > 0 ? (
                <ul className="space-y-2">
                  {report.today_tasks.map((task: Task, index: number) => (
                    <li
                      key={index}
                      className="flex items-start justify-between gap-2 p-2 rounded bg-muted/50"
                    >
                      <span className="flex-1">{task.task_name}</span>
                      <span className="text-sm font-medium text-green-600 shrink-0">
                        {task.planned_hours?.toFixed(1)}h
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  予定なし
                </p>
              )}
            </div>
          </div>

          {/* 困りごと・相談 */}
          {report.notes && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                困りごと・相談
              </h4>
              <p className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded">
                {report.notes}
              </p>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
