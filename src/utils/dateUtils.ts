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
    frequency?: { type?: string; days?: number[] };
    isPaused?: boolean;
    createdAt?: string;
  },
  dateStr: string
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
      return true;
    default:
      return true;
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
