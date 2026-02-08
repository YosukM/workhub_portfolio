"use client";

/**
 * PeriodSelector Component
 * 期間選択コンポーネント
 */

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

type Period = "7days" | "30days" | "90days";

interface PeriodSelectorProps {
  userId: string;
}

export function PeriodSelector({ userId }: PeriodSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPeriod = (searchParams.get("period") as Period) || "30days";

  const handlePeriodChange = (period: Period) => {
    const params = new URLSearchParams(searchParams);
    params.set("period", period);
    router.push(`/dashboard/${userId}?${params.toString()}`);
  };

  const periods = [
    { value: "7days" as Period, label: "1週間" },
    { value: "30days" as Period, label: "1ヶ月" },
    { value: "90days" as Period, label: "3ヶ月" },
  ];

  return (
    <div className="flex gap-2">
      {periods.map((period) => (
        <Button
          key={period.value}
          variant={currentPeriod === period.value ? "default" : "outline"}
          size="sm"
          onClick={() => handlePeriodChange(period.value)}
        >
          {period.label}
        </Button>
      ))}
    </div>
  );
}
