"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useActionState } from "react";
import { signup, signInWithGoogle } from "@/app/actions/auth";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [state, formAction, isPending] = useActionState(signup, { error: null });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {/* グラスモーフィズムカード */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">新規登録</h1>
          <p className="text-white/60 text-sm">
            新しいアカウントを作成
          </p>
        </div>

        {/* フォーム */}
        <form action={formAction}>
          <div className="flex flex-col gap-5">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-white/80 text-sm font-medium">
                メールアドレス
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                disabled={isPending}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-cyan-400 focus:ring-cyan-400/20 rounded-lg h-11"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-white/80 text-sm font-medium">
                パスワード
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={isPending}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-cyan-400 focus:ring-cyan-400/20 rounded-lg h-11"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="repeat-password" className="text-white/80 text-sm font-medium">
                パスワード（確認）
              </Label>
              <Input
                id="repeat-password"
                name="repeat-password"
                type="password"
                required
                disabled={isPending}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-cyan-400 focus:ring-cyan-400/20 rounded-lg h-11"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="admin-code" className="text-white/80 text-sm font-medium">
                管理者コード（任意）
              </Label>
              <Input
                id="admin-code"
                name="admin-code"
                type="password"
                placeholder="管理者として登録する場合のみ入力"
                disabled={isPending}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-cyan-400 focus:ring-cyan-400/20 rounded-lg h-11"
              />
            </div>
            {state?.error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {state.error}
              </p>
            )}
            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-medium rounded-lg shadow-lg shadow-cyan-500/25 transition-all duration-200 mt-2"
              disabled={isPending}
            >
              {isPending ? "アカウント作成中..." : "新規登録"}
            </Button>
          </div>
        </form>

        {/* 区切り線 */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-transparent px-4 text-white/50">または</span>
          </div>
        </div>

        {/* Google登録ボタン */}
        <form action={signInWithGoogle}>
          <Button
            type="submit"
            variant="outline"
            className="w-full h-11 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white rounded-lg transition-all duration-200"
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Googleで登録
          </Button>
        </form>

        {/* LINE登録ボタン */}
        <Button
          asChild
          variant="outline"
          className="w-full h-11 bg-[#06C755]/10 border-[#06C755]/30 text-white hover:bg-[#06C755]/20 hover:text-white rounded-lg transition-all duration-200 mt-3"
        >
          <a href="/api/auth/line/start?mode=login">
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
            </svg>
            LINEで登録
          </a>
        </Button>

        <div className="mt-6 text-center text-sm text-white/50">
          既にアカウントをお持ちですか？{" "}
          <Link
            href="/auth/login"
            className="text-cyan-300 hover:text-cyan-200 transition-colors font-medium"
          >
            ログイン
          </Link>
        </div>
      </div>
    </div>
  );
}
