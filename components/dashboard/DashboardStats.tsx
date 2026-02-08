/**
 * DashboardStats Component
 * ダッシュボード統計情報（モダンデザイン）
 */

import { Card } from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import type { ReportSummary } from "@/types";

interface DashboardStatsProps {
  summaries: ReportSummary[];
  currentUserMonthlyHours: number;
}

export function DashboardStats({ summaries, currentUserMonthlyHours }: DashboardStatsProps) {
  const totalUsers = summaries.length;
  const submittedUsers = summaries.filter((s) => s.has_submitted);
  const notSubmittedUsers = summaries.filter((s) => !s.has_submitted);
  
  const submittedCount = submittedUsers.length;
  const notSubmittedCount = notSubmittedUsers.length;
  const submissionRate =
    totalUsers > 0 ? Math.round((submittedCount / totalUsers) * 100) : 0;

  // 雲のようなホバーカードの共通スタイル
  const cloudCardStyle = "w-auto min-w-[200px] max-w-[280px] p-0 rounded-[1.5rem] bg-white/95 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-0 ring-1 ring-black/5 dark:bg-slate-900/90 dark:ring-white/10 overflow-hidden";

  const UserList = ({ users, title, emptyMsg, iconColor }: { users: ReportSummary[], title: string, emptyMsg: string, iconColor: string }) => (
    <div className="flex flex-col">
      <div className="px-4 py-3 border-b bg-muted/30">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          {title}
          <span className="text-xs font-normal text-muted-foreground ml-auto">
            {users.length}名
          </span>
        </h4>
      </div>
      <div className="max-h-[200px] overflow-y-auto p-2 custom-scrollbar">
        {users.length > 0 ? (
          <div className="space-y-1">
            {users.map((user) => (
              <div key={user.user_id} className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-muted/50 transition-colors text-sm">
                <div className={`w-2 h-2 rounded-full ${iconColor}`} />
                <span className="truncate">{user.user_name}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-xs text-muted-foreground">
            {emptyMsg}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* 提出率 */}
      <HoverCard openDelay={200} closeDelay={100}>
        <HoverCardTrigger asChild>
          <Card className="relative overflow-hidden p-5 card-hover group cursor-default">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="text-sm text-muted-foreground">提出率</span>
              </div>
              <div className="text-3xl font-bold">
                {submissionRate}
                <span className="text-lg text-muted-foreground ml-1">%</span>
              </div>
            </div>
          </Card>
        </HoverCardTrigger>
        <HoverCardContent className={cloudCardStyle} side="top">
           <UserList 
             users={submittedUsers} 
             title="提出済みのメンバー" 
             emptyMsg="まだ誰も提出していません" 
             iconColor="bg-violet-500"
           />
        </HoverCardContent>
      </HoverCard>

      {/* 提出済み */}
      <HoverCard openDelay={200} closeDelay={100}>
        <HoverCardTrigger asChild>
          <Card className="relative overflow-hidden p-5 card-hover group cursor-default">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-muted-foreground">提出済み</span>
              </div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {submittedCount}
                <span className="text-lg text-muted-foreground ml-1">/{totalUsers}</span>
              </div>
            </div>
          </Card>
        </HoverCardTrigger>
        <HoverCardContent className={cloudCardStyle} side="top">
           <UserList 
             users={submittedUsers} 
             title="提出済みのメンバー" 
             emptyMsg="まだ誰も提出していません" 
             iconColor="bg-green-500"
           />
        </HoverCardContent>
      </HoverCard>

      {/* 未提出 */}
      <HoverCard openDelay={200} closeDelay={100}>
        <HoverCardTrigger asChild>
          <Card className="relative overflow-hidden p-5 card-hover group cursor-default">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  notSubmittedCount > 0
                    ? "bg-gradient-to-br from-red-500 to-orange-500"
                    : "bg-gradient-to-br from-gray-400 to-gray-500"
                }`}>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm text-muted-foreground">未提出</span>
              </div>
              <div className={`text-3xl font-bold ${
                notSubmittedCount > 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"
              }`}>
                {notSubmittedCount}
                <span className="text-lg text-muted-foreground ml-1">/{totalUsers}</span>
              </div>
            </div>
          </Card>
        </HoverCardTrigger>
        <HoverCardContent className={cloudCardStyle} side="top">
           <UserList 
             users={notSubmittedUsers} 
             title="未提出のメンバー" 
             emptyMsg="全員提出済みです！🎉" 
             iconColor="bg-red-500"
           />
        </HoverCardContent>
      </HoverCard>

      {/* 当月合計稼働時間 */}
      <Card className="relative overflow-hidden p-5 card-hover group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm text-muted-foreground">当月合計</span>
          </div>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {currentUserMonthlyHours.toFixed(1)}
            <span className="text-lg text-muted-foreground ml-1">h</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">あなたの実績</p>
        </div>
      </Card>
    </div>
  );
}
