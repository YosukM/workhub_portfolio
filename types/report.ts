/**
 * Report Form Type Definitions
 * フォーム入力用の型定義
 */

import { Task } from "./database";

/**
 * Report Form Data - 報告フォーム入力データ
 */
export interface ReportFormData {
  report_date: string; // YYYY-MM-DD
  yesterday_tasks: TaskFormData[];
  today_tasks: TaskFormData[];
  notes: string;
}

/**
 * Task Form Data - タスク入力データ
 */
export interface TaskFormData {
  task_name: string;
  hours: number; // 実績時間 or 予定時間
  completed?: boolean; // 完了フラグ（昨日の実績用）
}

/**
 * Report Summary - レポートサマリー（ダッシュボード表示用）
 */
export interface ReportSummary {
  user_id: string;
  user_name: string;
  user_email: string;
  user_role: "admin" | "member";
  report_date: string;
  has_submitted: boolean;
  yesterday_total_hours: number;
  today_total_hours: number;
  yesterday_tasks: Task[];
  today_tasks: Task[];
  notes: string | null;
  submitted_at: string | null;
}

/**
 * Dashboard Data - ダッシュボード全体データ
 */
export interface DashboardData {
  target_date: string; // YYYY-MM-DD
  reports: ReportSummary[];
  total_users: number;
  submitted_count: number;
  not_submitted_count: number;
}

/**
 * Report Status - 報告ステータス
 */
export type ReportStatus = "submitted" | "not_submitted" | "late";

/**
 * User Report Card Data - ユーザーレポートカード表示用
 */
export interface UserReportCard {
  user_id: string;
  user_name: string;
  user_email: string;
  user_role: "admin" | "member";
  status: ReportStatus;
  yesterday_tasks: Task[];
  today_tasks: Task[];
  yesterday_total_hours: number;
  today_total_hours: number;
  notes: string | null;
  submitted_at: string | null;
}

/**
 * Report Filter Options - フィルタリングオプション
 */
export interface ReportFilterOptions {
  date?: string; // YYYY-MM-DD
  user_id?: string;
  status?: ReportStatus;
  date_from?: string; // YYYY-MM-DD
  date_to?: string; // YYYY-MM-DD
}

/**
 * Report Statistics - レポート統計
 */
export interface ReportStatistics {
  total_reports: number;
  average_yesterday_hours: number;
  average_today_hours: number;
  submission_rate: number; // 0-100
  most_active_users: {
    user_id: string;
    user_name: string;
    report_count: number;
  }[];
}
