/**
 * Database Type Definitions for WorkHub
 * Generated from Supabase schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "admin" | "member";

/**
 * Profiles Table - ユーザープロフィール
 */
export interface Profile {
  id: string; // UUID
  email: string;
  name: string;
  role: UserRole;
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
  // LINE連携
  line_user_id: string | null;
  line_linking_code: string | null;
  line_linking_code_expires_at: string | null;
  line_linked_at: string | null;
  is_active: boolean;
}

/**
 * Task Structure - タスク構造（JSONB内の構造）
 */
export interface Task {
  task_name: string;
  actual_hours?: number; // 昨日の実績用
  planned_hours?: number; // 今日の予定用
  completed?: boolean; // 完了フラグ
}

/**
 * Reports Table - 日次報告
 */
export interface Report {
  id: string; // UUID
  user_id: string; // UUID
  report_date: string; // YYYY-MM-DD
  yesterday_tasks: Task[]; // JSONB
  today_tasks: Task[]; // JSONB
  notes: string | null; // 困りごと・相談
  submitted_at: string; // ISO 8601 timestamp
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

/**
 * Report with User Profile - レポート + ユーザー情報（JOIN結果）
 */
export interface ReportWithProfile extends Report {
  profile: Profile;
}

/**
 * Database Schema - 全体スキーマ定義
 */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          email: string;
          name: string;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
          line_user_id?: string | null;
          line_linking_code?: string | null;
          line_linking_code_expires_at?: string | null;
          line_linked_at?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
          line_user_id?: string | null;
          line_linking_code?: string | null;
          line_linking_code_expires_at?: string | null;
          line_linked_at?: string | null;
          is_active?: boolean;
        };
        Relationships: [];
      };
      reports: {
        Row: Report;
        Insert: {
          id?: string;
          user_id: string;
          report_date: string;
          yesterday_tasks: Task[];
          today_tasks: Task[];
          notes?: string | null;
          submitted_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          report_date?: string;
          yesterday_tasks?: Task[];
          today_tasks?: Task[];
          notes?: string | null;
          submitted_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reports_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
