/**
 * Date and time utilities for habit scheduling, streaks, and heatmap matrices.
 */

export const formatDate = (date: Date = new Date()): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const getTodayStr = (): string => formatDate(new Date());

export const parseDateStr = (dateStr: string): Date => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const getDaysAgo = (days: number, fromDate: Date = new Date()): string => {
  const d = new Date(fromDate);
  d.setDate(d.getDate() - days);
  return formatDate(d);
};

export const formatDisplayDate = (dateStr: string): string => {
  const d = parseDateStr(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

export const formatLongDate = (dateStr: string): string => {
  const d = parseDateStr(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

export const getDayOfWeek = (dateStr: string): number => {
  return parseDateStr(dateStr).getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
};

export const getDayName = (dayIndex: number): string => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[dayIndex];
};

export const isHabitScheduledForDate = (
  habit: {
    frequencyType?: string;
    frequencyDays?: number[];
    intervalDays?: number;
    timesPerWeek?: number;
    frequency?: { type?: string; days?: number[]; intervalDays?: number; timesPerWeek?: number };
    isPaused?: boolean;
    createdAt?: string;
  },
  dateStr: string,
  /** Required for 'interval' habits (due-date depends on completion history).
   *  When omitted, interval habits default to scheduled (safe legacy behavior). */
  completions?: { habitId: string; dateStr: string; isCompleted: boolean }[]
): boolean => {
  if (habit.isPaused) return false;
  // If habit was created after this date, it's not scheduled
  if (habit.createdAt && habit.createdAt.slice(0, 10) > dateStr) return false;

  const dayOfWeek = getDayOfWeek(dateStr);
  const fType = habit.frequencyType || habit.frequency?.type || 'daily';
  const fDays = habit.frequencyDays || habit.frequency?.days || [0, 1, 2, 3, 4, 5, 6];

  switch (fType) {
    case 'daily':
      return true;
    case 'weekdays':
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    case 'custom_days':
      return fDays.includes(dayOfWeek);
    case 'times_per_week':
      // Flexible target: available every day. Perfect-day scoring excludes it
      // (see calculateDailyScore) so missing a day never breaks the daily score.
      return true;
    case 'interval': {
      const n = Math.max(
        2,
        habit.intervalDays ??
          (habit.frequency as { intervalDays?: number } | undefined)?.intervalDays ??
          2
      );
      if (!completions) return true;
      const lastDone = completions
        .filter((c) => c.isCompleted && c.dateStr < dateStr)
        .map((c) => c.dateStr)
        .sort()
        .pop();
      // Never done -> due immediately. Otherwise due when N+ days have passed.
      return lastDone === undefined || getDaysBetweenDates(lastDone, dateStr) >= n;
    }
    default:
      return true;
  }
};

/** Whole-day difference: toDate - fromDate */
export const getDaysBetweenDates = (fromDateStr: string, toDateStr: string): number => {
  const a = parseDateStr(fromDateStr);
  const b = parseDateStr(toDateStr);
  return Math.round((b.getTime() - a.getTime()) / (1000 * 3600 * 24));
};

/** Monday-based week start for a given date string */
export const getWeekStart = (dateStr: string): string => {
  const d = parseDateStr(dateStr);
  const offset = (d.getDay() + 6) % 7; // Mon=0 ... Sun=6
  d.setDate(d.getDate() - offset);
  return formatDate(d);
};

/** Static badge text describing a habit's repeat rule (no live counters) */
export const getFrequencyStaticLabel = (habit: {
  frequencyType?: string;
  frequencyDays?: number[];
  intervalDays?: number;
  timesPerWeek?: number;
  frequency?: { type?: string; days?: number[]; intervalDays?: number; timesPerWeek?: number };
}): string => {
  const fType = habit.frequencyType || habit.frequency?.type || 'daily';
  const fDays = habit.frequencyDays || habit.frequency?.days || [];
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  switch (fType) {
    case 'daily':
      return 'EVERY DAY';
    case 'weekdays':
      return 'WEEKDAYS';
    case 'custom_days':
      return fDays.map((d) => dayNames[d]).join(' ') || 'CUSTOM';
    case 'interval':
      return `EVERY ${Math.max(2, habit.intervalDays ?? habit.frequency?.intervalDays ?? 2)}D`;
    case 'times_per_week':
      return `${Math.max(1, Math.min(7, habit.timesPerWeek ?? habit.frequency?.timesPerWeek ?? 3))}/WK FLEX`;
    default:
      return '';
  }
};

export const getMonthMatrix = (year: number, monthIndex: number): (string | null)[][] => {
  // monthIndex: 0-11
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);
  const startDayOfWeek = firstDay.getDay(); // 0 (Sun) - 6 (Sat)
  const totalDays = lastDay.getDate();

  const matrix: (string | null)[][] = [];
  let currentWeek: (string | null)[] = [];

  // Pad beginning of first week
  for (let i = 0; i < startDayOfWeek; i++) {
    currentWeek.push(null);
  }

  for (let day = 1; day <= totalDays; day++) {
    const dStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    currentWeek.push(dStr);

    if (currentWeek.length === 7) {
      matrix.push(currentWeek);
      currentWeek = [];
    }
  }

  // Pad end of last week
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    matrix.push(currentWeek);
  }

  return matrix;
};

export const getYearHeatmapDates = (weeksCount = 52): string[] => {
  const dates: string[] = [];
  const today = new Date();
  const totalDays = weeksCount * 7;

  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(formatDate(d));
  }
  return dates;
};

export const getGreeting = (name: string): string => {
  const hour = new Date().getHours();
  let timeGreeting = 'Good morning';
  if (hour >= 12 && hour < 17) {
    timeGreeting = 'Good afternoon';
  } else if (hour >= 17 && hour < 22) {
    timeGreeting = 'Good evening';
  } else if (hour >= 22 || hour < 5) {
    timeGreeting = 'Night mode';
  }
  return `${timeGreeting}, ${name}`;
};
