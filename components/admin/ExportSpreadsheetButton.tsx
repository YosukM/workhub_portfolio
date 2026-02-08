"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Loader2, AlertCircle, CheckCircle2, ChevronDown } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExportSpreadsheetButtonProps {
  isGoogleLinked: boolean;
}

export function ExportSpreadsheetButton({ isGoogleLinked }: ExportSpreadsheetButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // 過去12ヶ月分のリストを生成
  const getMonthOptions = () => {
    const options = [];
    const today = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      options.push(d);
    }
    return options;
  };

  const monthOptions = getMonthOptions();

  const handleExport = async () => {
    if (!isGoogleLinked) {
      alert("この機能を使用するには、Googleアカウントでログイン（再ログイン）し、スプレッドシートへのアクセスを許可する必要があります。");
      return;
    }

    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1;
    const formattedMonth = `${year}年${month}月`;

    if (!confirm(`${formattedMonth}の全ユーザー稼働集計をGoogleスプレッドシートに出力しますか？`)) {
      return;
    }

    setIsExporting(true);
    try {
      const response = await fetch("/api/admin/export-spreadsheet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: selectedDate.toISOString(), // 選択された月の任意の日付を送る
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Export failed");
      }

      // 新しいタブでスプレッドシートを開く
      if (data.spreadsheetUrl) {
        window.open(data.spreadsheetUrl, "_blank");
      } else {
        alert("スプレッドシートが作成されましたが、URLを取得できませんでした。");
      }
    } catch (error: any) {
      console.error("Export failed:", error);
      alert(`エクスポートに失敗しました: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const formatMonth = (date: Date) => {
    return `${date.getFullYear()}年${date.getMonth() + 1}月`;
  };

  return (
    <div className="flex items-center gap-2">
      {/* 月選択ドロップダウン */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 text-xs sm:text-sm min-w-[120px] justify-between">
            {formatMonth(selectedDate)}
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {monthOptions.map((date) => (
            <DropdownMenuItem
              key={date.toISOString()}
              onClick={() => setSelectedDate(date)}
              className={
                date.getMonth() === selectedDate.getMonth() &&
                date.getFullYear() === selectedDate.getFullYear()
                  ? "bg-accent"
                  : ""
              }
            >
              {formatMonth(date)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* エクスポートボタン */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-block">
              <Button
                variant="outline"
                size="sm"
                className={`gap-2 text-xs sm:text-sm border-2 ${
                  isGoogleLinked 
                    ? "bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200" 
                    : "bg-gray-50 text-gray-500 border-gray-200 opacity-70"
                }`}
                onClick={handleExport}
                disabled={isExporting}
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : !isGoogleLinked ? (
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                ) : (
                  <FileSpreadsheet className="h-4 w-4" />
                )}
                
                {isExporting ? "出力中..." : "出力"}
                
                {isGoogleLinked && <CheckCircle2 className="h-3 w-3 ml-1 text-green-600" />}
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {!isGoogleLinked 
              ? "Google連携が必要です。ログアウトしてGoogleで再ログインしてください。" 
              : `${formatMonth(selectedDate)}の稼働集計を出力します`}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
