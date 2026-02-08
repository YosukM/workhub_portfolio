"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileText, Loader2, AlertCircle, CheckCircle2, ChevronDown, Download } from "lucide-react";
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

interface ExportButtonsProps {
  isGoogleLinked: boolean;
}

export function ExportButtons({ isGoogleLinked }: ExportButtonsProps) {
  const [isSpreadsheetExporting, setIsSpreadsheetExporting] = useState(false);
  const [isCsvExporting, setIsCsvExporting] = useState(false);
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
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth() + 1;
  const formattedMonth = `${year}年${month}月`;

  // ローカル時間でYYYY-MM-DD形式の文字列を生成する関数
  // toISOString()だとUTCに変換され、時差で前月になってしまう場合があるため
  const toLocalDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const handleSpreadsheetExport = async () => {
    if (!isGoogleLinked) {
      alert("この機能を使用するには、Googleアカウントでログイン（再ログイン）し、スプレッドシートへのアクセスを許可する必要があります。");
      return;
    }

    if (!confirm(`${formattedMonth}の全ユーザー稼働集計をGoogleスプレッドシートに出力しますか？`)) {
      return;
    }

    setIsSpreadsheetExporting(true);
    try {
      const response = await fetch("/api/admin/export-spreadsheet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: toLocalDateString(selectedDate),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Export failed");
      }

      if (data.spreadsheetUrl) {
        window.open(data.spreadsheetUrl, "_blank");
      } else {
        alert("スプレッドシートが作成されましたが、URLを取得できませんでした。");
      }
    } catch (error: any) {
      console.error("Export failed:", error);
      alert(`エクスポートに失敗しました: ${error.message}`);
    } finally {
      setIsSpreadsheetExporting(false);
    }
  };

  const handleCsvExport = async () => {
    if (!confirm(`${formattedMonth}の全ユーザー稼働集計をCSVファイルとしてダウンロードしますか？`)) {
      return;
    }

    setIsCsvExporting(true);
    try {
      const response = await fetch("/api/admin/export-csv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: toLocalDateString(selectedDate),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Export failed");
      }

      // Blobとして取得してダウンロード
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `worklog_${year}-${String(month).padStart(2, '0')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error: any) {
      console.error("CSV Export failed:", error);
      alert(`CSVエクスポートに失敗しました: ${error.message}`);
    } finally {
      setIsCsvExporting(false);
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

      {/* CSVエクスポートボタン */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-xs sm:text-sm"
              onClick={handleCsvExport}
              disabled={isCsvExporting}
            >
              {isCsvExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              CSV
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {`${formattedMonth}の稼働集計をCSVダウンロード`}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* スプレッドシートエクスポートボタン */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={`gap-2 text-xs sm:text-sm border-2 ${
                isGoogleLinked 
                  ? "bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200" 
                  : "bg-gray-50 text-gray-500 border-gray-200 opacity-70"
              }`}
              onClick={handleSpreadsheetExport}
              disabled={isSpreadsheetExporting}
            >
              {isSpreadsheetExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : !isGoogleLinked ? (
                <AlertCircle className="h-4 w-4 text-amber-500" />
              ) : (
                <FileSpreadsheet className="h-4 w-4" />
              )}
              Sheets
              {isGoogleLinked && <CheckCircle2 className="h-3 w-3 ml-1 text-green-600" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {!isGoogleLinked 
              ? "Google連携が必要です" 
              : `${formattedMonth}の稼働集計をGoogleスプレッドシートに出力`}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
