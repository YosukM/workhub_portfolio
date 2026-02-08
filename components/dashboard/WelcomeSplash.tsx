"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface WelcomeSplashProps {
  userName: string;
}

export function WelcomeSplash({ userName }: WelcomeSplashProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // セッションストレージを確認
    // キー名を変更して、過去の記録をリセット（強制的に再表示）
    const SESSION_KEY = "workhub_splash_seen_v2"; 
    const hasSeenSplash = sessionStorage.getItem(SESSION_KEY);
    
    if (!hasSeenSplash) {
      setIsVisible(true);
      sessionStorage.setItem(SESSION_KEY, "true");

      // 2.5秒後に非表示にする
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm"
        >
          {/* 背景の装飾（薄いグラデーション） */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-purple-500/10 to-pink-500/10" />

          <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            {/* ロゴアニメーション */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Image
                src="/WorkHub_LogoM.svg"
                alt="WorkHub"
                width={120}
                height={120}
                className="w-24 h-24 sm:w-32 sm:h-32 drop-shadow-2xl"
                priority
              />
            </motion.div>

            {/* テキストアニメーション */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="space-y-2"
            >
              <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                Welcome Back
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground font-medium">
                {userName} さん
              </p>
            </motion.div>

            {/* ローディングインジケータ（装飾的） */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 64 }}
              transition={{ delay: 0.8, duration: 1.2, ease: "easeInOut" }}
              className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-4"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
