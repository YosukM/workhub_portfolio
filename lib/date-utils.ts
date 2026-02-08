/**
 * Date Utility Functions
 * 日付関連のユーティリティ関数
 */

// JST Timezone
const TIMEZONE_JST = "Asia/Tokyo";

/**
 * 現在の日本時間を取得 (Dateオブジェクトとして返す)
 * サーバーのタイムゾーンに関わらず、JSTの日時情報を持つDateオブジェクトを生成する
 * 注意: 生成されたDateオブジェクトの getFullYear() 等はJSTの値を返すが、
 * toISOString() 等はJSTの時間をUTCとして解釈した値を返すため使用に注意が必要。
 */
export function getNowJST(): Date {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", { timeZone: TIMEZONE_JST }));
}

/**
 * 今日の日付を YYYY-MM-DD 形式で取得
 */
export function getTodayDate(): string {
  const today = getNowJST();
  return formatDate(today);
}

/**
 * 昨日の日付を YYYY-MM-DD 形式で取得
 */
export function getYesterdayDate(): string {
  const yesterday = getNowJST();
  yesterday.setDate(yesterday.getDate() - 1);
  return formatDate(yesterday);
}

/**
 * Date オブジェクトを YYYY-MM-DD 形式に変換
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * YYYY-MM-DD 形式の文字列を Date オブジェクトに変換
 */
export function parseDate(dateString: string): Date {
  return new Date(dateString);
}

/**
 * 日付を日本語形式でフォーマット (例: 2026年1月8日)
 */
export function formatDateJP(dateString: string): string {
  const date = parseDate(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
}

/**
 * 日付を曜日付きでフォーマット (例: 2026年1月8日(水))に対し
 */
export function formatDateWithDay(dateString: string): string {
  const date = parseDate(dateString);
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const weekday = weekdays[date.getDay()];
  return `${formatDateJP(dateString)}(${weekday})`;
}

/**
 * ISO 8601 タイムスタンプを日本語形式でフォーマット
 * 日本時間（JST）で表示
 * 例: 2026-01-08T10:30:00Z -> 2026年1月8日 19:30
 */
export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString("ja-JP", {
    timeZone: TIMEZONE_JST,
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * タイムスタンプから時刻のみを取得 (例: 10:30)
 * 日本時間（JST）で表示
 */
export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("ja-JP", {
    timeZone: TIMEZONE_JST,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * 2つの日付の差を日数で取得
 */
export function getDaysDifference(date1: string, date2: string): number {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * 指定日が今日かどうかを判定
 */
export function isToday(dateString: string): boolean {
  return dateString === getTodayDate();
}

/**
 * 指定日が過去かどうかを判定
 */
export function isPast(dateString: string): boolean {
  const date = parseDate(dateString);
  const today = new Date(getTodayDate());
  return date < today;
}

/**
 * 指定日が未来かどうかを判定
 */
export function isFuture(dateString: string): boolean {
  const date = parseDate(dateString);
  const today = new Date(getTodayDate());
  return date > today;
}

/**
 * 指定日の前日を取得
 */
export function getPreviousDate(dateString: string): string {
  const date = parseDate(dateString);
  date.setDate(date.getDate() - 1);
  return formatDate(date);
}

/**
 * 指定日の翌日を取得
 */
export function getNextDate(dateString: string): string {
  const date = parseDate(dateString);
  date.setDate(date.getDate() + 1);
  return formatDate(date);
}

/**
 * 指定期間の日付配列を生成
 */
export function getDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  const current = new Date(start);
  while (current <= end) {
    dates.push(formatDate(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * 現在時刻が指定時刻を過ぎているかどうかを判定
 * 例: isTimePassed("10:00") -> 現在時刻が10:00を過ぎている場合true
 */
export function isTimePassed(timeString: string): boolean {
  const now = getNowJST();
  const [hours, minutes] = timeString.split(":").map(Number);
  const targetTime = new Date(now);
  targetTime.setHours(hours, minutes, 0, 0);
  return now > targetTime;
}

/**
 * 期間に応じた開始日・終了日を計算
 */
export function calculateDateRange(period: "7days" | "30days" | "90days"): {
  startDate: string;
  endDate: string;
} {
  const today = getNowJST();
  const endDate = getTodayDate();
  const startDate = new Date(today);

  switch (period) {
    case "7days":
      startDate.setDate(today.getDate() - 7);
      break;
    case "30days":
      startDate.setDate(today.getDate() - 30);
      break;
    case "90days":
      startDate.setDate(today.getDate() - 90);
      break;
  }

  return {
    startDate: formatDate(startDate),
    endDate,
  };
}

/**
 * 指定日の属する月の開始日・終了日を取得
 */
export function getMonthRange(dateString: string): {
  startDate: string;
  endDate: string;
} {
  const date = parseDate(dateString);
  const year = date.getFullYear();
  const month = date.getMonth();

  // 当月の1日
  const startDate = new Date(year, month, 1);
  // 当月の最終日
  const endDate = new Date(year, month + 1, 0);

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  };
}

/**
 * 当月の開始日・終了日を取得
 */
export function getCurrentMonthRange(): {
  startDate: string;
  endDate: string;
} {
  const today = getNowJST();
  const year = today.getFullYear();
  const month = today.getMonth();

  // 当月の1日
  const startDate = new Date(year, month, 1);
  // 当月の最終日
  const endDate = new Date(year, month + 1, 0);

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  };
}
