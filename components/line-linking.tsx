"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LineLinkingProps {
  isLinked: boolean;
  linkedAt: string | null;
}

export function LineLinking({ isLinked: initialIsLinked, linkedAt: initialLinkedAt }: LineLinkingProps) {
  const [isLinked, setIsLinked] = useState(initialIsLinked);
  const [linkedAt, setLinkedAt] = useState(initialLinkedAt);
  const [linkingCode, setLinkingCode] = useState<string | null>(null);
  const [codeExpiresAt, setCodeExpiresAt] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // カウントダウンタイマー
  useEffect(() => {
    if (!codeExpiresAt) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.max(0, Math.floor((codeExpiresAt.getTime() - now.getTime()) / 1000));
      setTimeLeft(diff);

      if (diff === 0) {
        setLinkingCode(null);
        setCodeExpiresAt(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [codeExpiresAt]);

  // 連携コードを生成
  const generateCode = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/line/link", {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "コードの生成に失敗しました");
      }

      const data = await response.json();
      setLinkingCode(data.code);
      setCodeExpiresAt(new Date(data.expiresAt));
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  // 連携を解除
  const unlinkLine = async () => {
    if (!confirm("LINE連携を解除しますか？リマインダーが届かなくなります。")) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/line/link", {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "解除に失敗しました");
      }

      setIsLinked(false);
      setLinkedAt(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  // 時間のフォーマット
  const formatTimeLeft = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-green-500" fill="currentColor">
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
          </svg>
          LINE連携
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLinked ? (
          // 連携済み
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">連携済み</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {linkedAt && `連携日時: ${new Date(linkedAt).toLocaleString("ja-JP")}`}
            </p>
            <p className="text-sm text-muted-foreground">
              毎朝9:50に未提出の場合、LINEでリマインダーが届きます。
            </p>
            <Button
              variant="outline"
              onClick={unlinkLine}
              disabled={isLoading}
              className="text-destructive hover:text-destructive"
            >
              {isLoading ? "処理中..." : "連携を解除"}
            </Button>
          </div>
        ) : linkingCode ? (
          // コード表示中
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              以下のコードをLINE Botに送信してください:
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl font-mono font-bold tracking-widest bg-muted px-6 py-3 rounded-lg">
                {linkingCode}
              </span>
            </div>
            <p className="text-sm text-center text-muted-foreground">
              有効期限: {formatTimeLeft(timeLeft)}
            </p>
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium">連携手順:</p>
              <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                <li>下のQRコードまたはリンクからBotを友だち追加</li>
                <li>上の6桁のコードをトーク画面に送信</li>
                <li>連携完了メッセージが届けば完了！</li>
              </ol>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setLinkingCode(null);
                setCodeExpiresAt(null);
              }}
            >
              キャンセル
            </Button>
          </div>
        ) : (
          // 未連携
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              LINEと連携すると、毎朝9:50に日次報告のリマインダーが届きます。
            </p>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button onClick={generateCode} disabled={isLoading}>
              {isLoading ? "生成中..." : "LINE連携を開始"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
