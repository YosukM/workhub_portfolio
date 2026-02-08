"use client";

/**
 * DateSelector Component
 * 日付選択コンポーネント
 */

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  formatDate,
  formatDateWithDay,
  getPreviousDate,
  getNextDate,
  getTodayDate,
  isToday,
  parseDate,
} from "@/lib/date-utils";

interface DateSelectorProps {
  currentDate: string;
}

export function DateSelector({ currentDate }: DateSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleDateChange = (newDate: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("date", newDate);
    router.push(`/dashboard?${params.toString()}`);
  };

  const onSelectDate = (date: Date | undefined) => {
    if (date) {
      handleDateChange(formatDate(date));
    }
  };

  const goToPrevious = () => {
    handleDateChange(getPreviousDate(currentDate));
  };

  const goToNext = () => {
    handleDateChange(getNextDate(currentDate));
  };

  const goToToday = () => {
    handleDateChange(getTodayDate());
  };

  const isTodayDate = isToday(currentDate);
  const dateObj = parseDate(currentDate);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={goToPrevious}
        aria-label="前の日"
      >
        ←
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-9 justify-start text-left font-normal min-w-[180px]",
              !currentDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span className="text-base font-semibold">
              {formatDateWithDay(currentDate)}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateObj}
            onSelect={onSelectDate}
            initialFocus
            locale={ja}
            weekStartsOn={1}
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={goToNext}
        aria-label="次の日"
      >
        →
      </Button>

      {!isTodayDate && (
        <Button variant="ghost" size="sm" onClick={goToToday} className="ml-2">
          今日
        </Button>
      )}
    </div>
  );
}
