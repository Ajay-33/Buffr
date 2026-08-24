import {
  Habit,
  HabitCompletion,
  HabitDifficulty,
  LifeAttributes,
  LifeCategory,
  InsightCard,
  Achievement,
  UserProfile,
} from '../types';
import { isHabitScheduledForDate, getDaysAgo, getTodayStr, parseDateStr } from './dateUtils';

export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
};

export const DIFFICULTY_WEIGHTS: Record<HabitDifficulty, number> = {
  easy: 1.0,
  medium: 1.5,
  hard: 2.0,
  extreme: 3.0,
};

export const DIFFICULTY_BASE_XP: Record<HabitDifficulty, number> = {
  easy: 10,
  medium: 20,
  hard: 35,
  extreme: 50,
};

export interface RankTier {
  name: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND' | 'MASTER' | 'GRANDMASTER' | 'MYTHIC';
  minLevel: number;
  maxLevel: number;
  color: string;
  badgeBg: string;
  borderColor: string;
  glowColor: string;
  description: string;
}

export const RANK_TIERS: RankTier[] = [
  { name: 'BRONZE', minLevel: 1, maxLevel: 4, color: '#cd7f32', badgeBg: 'bg-amber-950/80', borderColor: 'border-amber-700', glowColor: 'rgba(205,127,50,0.4)', description: 'Recruit: Building foundational habit routines' },
  { name: 'SILVER', minLevel: 5, maxLevel: 9, color: '#c0c0c0', badgeBg: 'bg-slate-800/80', borderColor: 'border-slate-400', glowColor: 'rgba(192,192,192,0.4)', description: 'Builder: Solidifying consistency and daily discipline' },
  { name: 'GOLD', minLevel: 10, maxLevel: 15, color: '#facc15', badgeBg: 'bg-yellow-950/80', borderColor: 'border-yellow-400', glowColor: 'rgba(250,204,21,0.5)', description: 'Disciplined: Strong habit resilience & high streak rate' },
  { name: 'PLATINUM', minLevel: 16, maxLevel: 24, color: '#22d3ee', badgeBg: 'bg-cyan-950/80', borderColor: 'border-cyan-400', glowColor: 'rgba(34,211,238,0.5)', description: 'Relentless: Advanced habit momentum and focus' },
  { name: 'DIAMOND', minLevel: 25, maxLevel: 34, color: '#a855f7', badgeBg: 'bg-purple-950/80', borderColor: 'border-purple-400', glowColor: 'rgba(168,85,247,0.5)', description: 'Ascended: Peak character attributes and mastery' },
  { name: 'MASTER', minLevel: 35, maxLevel: 44, color: '#ec4899', badgeBg: 'bg-pink-950/80', borderColor: 'border-pink-500', glowColor: 'rgba(236,72,153,0.5)', description: 'Elite: Compound character transformation' },
  { name: 'GRANDMASTER', minLevel: 45, maxLevel: 49, color: '#ef4444', badgeBg: 'bg-red-950/80', borderColor: 'border-red-500', glowColor: 'rgba(239,68,68,0.6)', description: 'Grandmaster: Unshakable iron willpower' },
  { name: 'MYTHIC', minLevel: 50, maxLevel: 999, color: '#10b981', badgeBg: 'bg-emerald-950/80', borderColor: 'border-emerald-400', glowColor: 'rgba(16,185,129,0.7)', description: 'Mythic Buffr: Living legendary tier' },
];

export const getRankTier = (level: number): RankTier => {
  return RANK_TIERS.find((r) => level >= r.minLevel && level <= r.maxLevel) || RANK_TIERS[0];
};

export const getHighestUnlockedTitle = (level: number): string => {
  let highest = ALL_TITLES[0].title;
  for (const t of ALL_TITLES) {
    if (level >= t.level) {
      highest = t.title;
    }
  }
  return highest;
};

export const getUnlockedTitlesForLevel = (level: number): { title: string; requiredLevel: number; isUnlocked: boolean }[] => {
  return ALL_TITLES.map((t) => ({
    title: t.title,
    requiredLevel: t.level,
    isUnlocked: level >= t.level,
  }));
};

export const isStreakShieldActive = (user?: Partial<UserProfile> | null): boolean => {
  if (!user?.streakShieldActiveUntil) return false;
  try {
    return new Date(user.streakShieldActiveUntil).getTime() > Date.now();
  } catch {
    return false;
  }
};

export const ALL_TITLES = [
  { level: 1, title: 'Starter' },
  { level: 3, title: 'Initiate' },
  { level: 5, title: 'Builder' },
  { level: 8, title: 'Disciplined' },
  { level: 12, title: 'Focused' },
  { level: 16, title: 'Relentless' },
  { level: 20, title: 'Titan' },
  { level: 25, title: 'Ascended' },
  { level: 30, title: 'Elite' },
  { level: 40, title: 'Grandmaster' },
  { level: 50, title: 'Mythic Buffr' },
];

/**
 * Calculates XP required for a given level
 * Level 1: 100
 * Level 2: 250
 * Level 3: 450
 * Level 10: 2150
 */
export const getXpForLevel = (level: number): number => {
  if (level <= 1) return 100;
  return Math.round(75 * Math.pow(level, 1.45) + 25);
};

export const getTotalXpRequiredUpToLevel = (level: number): number => {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += getXpForLevel(i);
  }
  return total;
};

export const calculateLevelFromTotalXp = (
  totalXp: number
): { level: number; currentLevelXp: number; nextLevelXpRequired: number; progressPercent: number; titleUnlocked?: string } => {
  let level = 1;
  let remainingXp = Math.max(0, totalXp);

  while (true) {
    const needed = getXpForLevel(level);
    if (remainingXp < needed) {
      const progressPercent = Math.min(100, Math.round((remainingXp / needed) * 100));
      const titleObj = ALL_TITLES.find((t) => t.level === level);
      return {
        level,
        currentLevelXp: remainingXp,
        nextLevelXpRequired: needed,
        progressPercent,
        titleUnlocked: titleObj ? titleObj.title : undefined,
      };
    }
    remainingXp -= needed;
    level++;
  }
};

/**
 * Calculates Streak Multiplier bonus on XP
 */
export const getStreakXpMultiplier = (streakDays: number): number => {
  if (streakDays >= 100) return 1.3; // +30%
  if (streakDays >= 30) return 1.2; // +20%
  if (streakDays >= 7) return 1.1; // +10%
  return 1.0;
};

/**
 * Calculates weighted daily score (0 - 100)
 */
export const calculateDailyScore = (
  habits: Habit[],
  completions: HabitCompletion[],
  dateStr: string
): { score: number; completedCount: number; scheduledCount: number; label: string; color: string } => {
  // 'times_per_week' habits are intentionally EXCLUDED from the daily score:
  // their whole point is flexibility, so a missed day must never dent the
  // perfect-day percentage. They're rewarded via weekly-target streaks instead.
  const scheduledHabits = habits.filter(
    (h) =>
      !h.isArchived &&
      (h.frequencyType || h.frequency?.type) !== 'times_per_week' &&
      isHabitScheduledForDate(h, dateStr, completions)
  );

  if (scheduledHabits.length === 0) {
    return {
      score: 0,
      completedCount: 0,
      scheduledCount: 0,
      label: 'No Scheduled Habits',
      color: 'text-slate-400',
    };
  }

  let totalWeight = 0;
  let earnedWeight = 0;
  let completedCount = 0;

  scheduledHabits.forEach((habit) => {
    const weight = DIFFICULTY_WEIGHTS[habit.difficulty] || 1.0;
    totalWeight += weight;

    const completion = completions.find(
      (c) => c.habitId === habit.id && c.dateStr === dateStr
    );

    if (completion && completion.isCompleted) {
      earnedWeight += weight;
      completedCount++;
    } else if (completion && completion.progressValue > 0 && habit.targetValue > 1) {
      // Partial credit for quantity habits
      const fraction = Math.min(1, completion.progressValue / habit.targetValue);
      earnedWeight += weight * fraction;
    }
  });

  const rawScore = totalWeight > 0 ? (earnedWeight / totalWeight) * 100 : 0;
  const score = Math.round(rawScore);

  let label = 'Needs Work';
  let color = 'text-rose-400';

  if (score >= 95) {
    label = 'Elite Day';
    color = 'text-amber-400';
  } else if (score >= 80) {
    label = 'Excellent';
    color = 'text-emerald-400';
  } else if (score >= 60) {
    label = 'Strong Day';
    color = 'text-teal-400';
  } else if (score >= 40) {
    label = 'Building Momentum';
    color = 'text-sky-400';
  }

  return {
    score,
    completedCount,
    scheduledCount: scheduledHabits.length,
    label,
    color,
  };
};

/**
 * Calculates streak for a single habit
 */
export const calculateHabitStreak = (
  habit: Habit,
  completions: HabitCompletion[],
  todayStr: string = getTodayStr()
): { currentStreak: number; longestStreak: number; totalCompletions: number } => {
  const habitCompletions = completions.filter(
    (c) => c.habitId === habit.id && c.isCompleted
  );
  const totalCompletions = habitCompletions.length;
  if (totalCompletions === 0) {
    return { currentStreak: 0, longestStreak: 0, totalCompletions: 0 };
  }

  const completedDates = new Set(habitCompletions.map((c) => c.dateStr));

  const getMondayOfWeek = (dStr: string): string => {
    const d = parseDateStr(dStr);
    const off = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - off);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // ── FLEXIBLE WEEKLY TARGETS ('X of 7 days') ─────────────────────────────
  // Streaks are counted in consecutive fully-met weeks instead of consecutive
  // days. The current week never breaks a streak (it isn't finished yet).
  const fType = habit.frequencyType || habit.frequency?.type || 'daily';
  if (fType === 'times_per_week') {
    const target = Math.max(
      1,
      Math.min(7, habit.timesPerWeek ?? habit.frequency?.timesPerWeek ?? 3)
    );
    const metByWeek = new Map();
    habitCompletions.forEach((c) => {
      const wk = getMondayOfWeek(c.dateStr);
      metByWeek.set(wk, (metByWeek.get(wk) || 0) + 1);
    });

    const thisWk = getMondayOfWeek(todayStr);
    const weekKeys = [...new Set([...metByWeek.keys(), thisWk])].sort();
    let longestFlex = 0;
    let runFlex = 0;
    for (const wk of weekKeys) {
      if ((metByWeek.get(wk) || 0) >= target) {
        runFlex++;
        if (runFlex > longestFlex) longestFlex = runFlex;
      } else if (wk !== thisWk) {
        runFlex = 0; // finished weeks must meet target to keep the chain
      }
    }

    let curFlex = (metByWeek.get(thisWk) || 0) >= target ? 1 : 0;
    let cursor = parseDateStr(thisWk);
    for (let guard = 0; guard < 260; guard++) {
      cursor.setDate(cursor.getDate() - 7);
      const wk = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
      if ((metByWeek.get(wk) || 0) >= target) curFlex++;
      else break;
    }

    return {
      currentStreak: curFlex,
      longestStreak: Math.max(longestFlex, curFlex),
      totalCompletions,
    };
  }

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Check from today backwards
  let checkDate = parseDateStr(todayStr);
  let isTodayCompleted = completedDates.has(todayStr);
  let isTodayScheduled = isHabitScheduledForDate(habit, todayStr, habitCompletions);

  // If today is scheduled and completed -> streak starts at 1, check yesterday
  // If today is scheduled and NOT completed yet -> don't break streak yet if yesterday was completed
  if (isTodayCompleted) {
    currentStreak++;
  }

  // Iterate backwards up to 365 days
  let pointerDate = new Date(checkDate);
  pointerDate.setDate(pointerDate.getDate() - 1);

  while (true) {
    const dStr = getTodayStr().length ? getDaysAgo(0, pointerDate) : '';
    const scheduled = isHabitScheduledForDate(habit, dStr, habitCompletions);

    if (scheduled) {
      if (completedDates.has(dStr)) {
        currentStreak++;
      } else {
        // Streak broken
        break;
      }
    }
    // If not scheduled on this day, skip without breaking
    pointerDate.setDate(pointerDate.getDate() - 1);

    // Stop if we go before creation or exceed 365
    if (habit.createdAt && dStr < habit.createdAt.slice(0, 10)) break;
    const diffDays = Math.round((checkDate.getTime() - pointerDate.getTime()) / (1000 * 3600 * 24));
    if (diffDays > 365) break;
  }

  // Calculate longest streak by scanning full timeline
  let scanDate = new Date();
  scanDate.setDate(scanDate.getDate() - 365);
  tempStreak = 0;

  for (let i = 0; i <= 365; i++) {
    const dStr = getDaysAgo(0, scanDate);
    const scheduled = isHabitScheduledForDate(habit, dStr, habitCompletions);

    if (scheduled) {
      if (completedDates.has(dStr)) {
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    }
    scanDate.setDate(scanDate.getDate() + 1);
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  return {
    currentStreak,
    longestStreak,
    totalCompletions,
  };
};

/**
 * Calculates overall active user streak (days where score was >= 60%)
 */
export const calculateOverallStreak = (
  habits: Habit[],
  completions: HabitCompletion[],
  todayStr: string = getTodayStr()
): { currentStreak: number; longestStreak: number; perfectDaysCount: number } => {
  let currentStreak = 0;
  let longestStreak = 0;
  let perfectDaysCount = 0;
  let tempStreak = 0;

  // Scan last 180 days
  const dayScores: { dateStr: string; score: number }[] = [];
  for (let i = 0; i < 180; i++) {
    const dStr = getDaysAgo(i);
    const res = calculateDailyScore(habits, completions, dStr);
    if (res.scheduledCount > 0) {
      dayScores.push({ dateStr: dStr, score: res.score });
      if (res.score === 100) perfectDaysCount++;
    }
  }

  // Calculate current streak
  for (let i = 0; i < dayScores.length; i++) {
    const item = dayScores[i];
    if (i === 0 && item.dateStr === todayStr) {
      // Today
      if (item.score >= 50) {
        currentStreak++;
      }
    } else {
      if (item.score >= 50) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Longest streak
  for (let i = dayScores.length - 1; i >= 0; i--) {
    if (dayScores[i].score >= 50) {
      tempStreak++;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    } else {
      tempStreak = 0;
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  return {
    currentStreak,
    longestStreak,
    perfectDaysCount,
  };
};

/**
 * Calculates Life Attributes (0 - 100) based on completions in respective categories
 */
export const calculateLifeAttributes = (
  habits: Habit[],
  completions: HabitCompletion[],
  user?: Partial<UserProfile> | null
): LifeAttributes => {
  const baseAttributes: LifeAttributes = {
    Strength: 25,
    Health: 30,
    Mind: 28,
    Focus: 25,
    Discipline: 32,
    Mindfulness: 20,
    Creativity: 15,
    Social: 18,
    Finance: 20,
  };

  // Add passive boosts from equipped gear
  if (user?.equippedGear) {
    const gearList = [
      user.equippedGear.weapon,
      user.equippedGear.armor,
      user.equippedGear.relic,
      user.equippedGear.charm,
    ].filter(Boolean);

    gearList.forEach((item) => {
      if (!item) return;
      if (item.stats.strengthBoost) baseAttributes.Strength += item.stats.strengthBoost;
      if (item.stats.healthBoost) baseAttributes.Health += item.stats.healthBoost;
      if (item.stats.mindBoost) baseAttributes.Mind += item.stats.mindBoost;
      if (item.stats.focusBoost) baseAttributes.Focus += item.stats.focusBoost;
      if (item.stats.disciplineBoost) baseAttributes.Discipline += item.stats.disciplineBoost;
      if (item.stats.mindfulnessBoost) baseAttributes.Mindfulness += item.stats.mindfulnessBoost;
      if (item.stats.creativityBoost) baseAttributes.Creativity += item.stats.creativityBoost;
      if (item.stats.socialBoost) baseAttributes.Social += item.stats.socialBoost;
      if (item.stats.financeBoost) baseAttributes.Finance += item.stats.financeBoost;
    });
  }

  const completedMap: Record<string, number> = {};
  completions.filter((c) => c.isCompleted).forEach((c) => {
    completedMap[c.habitId] = (completedMap[c.habitId] || 0) + 1;
  });

  habits.forEach((habit) => {
    const times = completedMap[habit.id] || 0;
    if (times === 0) return;

    // Apply boosts
    const boosts = habit.attributeBoosts || {};
    (Object.keys(boosts) as (keyof LifeAttributes)[]).forEach((attr) => {
      const boostVal = boosts[attr] || 0;
      baseAttributes[attr] += boostVal * times * 1.5;
    });

    // Default category mapping boost
    if (habit.category === 'Fitness') {
      baseAttributes.Strength += times * 2.2;
      baseAttributes.Health += times * 1.5;
    } else if (habit.category === 'Health') {
      baseAttributes.Health += times * 2.4;
      baseAttributes.Mindfulness += times * 0.8;
    } else if (habit.category === 'Mind') {
      baseAttributes.Mind += times * 2.6;
      baseAttributes.Focus += times * 1.2;
    } else if (habit.category === 'Focus') {
      baseAttributes.Focus += times * 2.5;
      baseAttributes.Discipline += times * 1.8;
    } else if (habit.category === 'Mindfulness') {
      baseAttributes.Mindfulness += times * 2.8;
      baseAttributes.Health += times * 1.0;
    } else if (habit.category === 'Creativity') {
      baseAttributes.Creativity += times * 3.0;
      baseAttributes.Mind += times * 1.0;
    } else if (habit.category === 'Finance') {
      baseAttributes.Finance += times * 3.0;
      baseAttributes.Discipline += times * 1.5;
    } else if (habit.category === 'Social') {
      baseAttributes.Social += times * 3.0;
    } else if (habit.category === 'Sleep') {
      baseAttributes.Health += times * 2.0;
      baseAttributes.Discipline += times * 1.5;
    }

    // Every habit completed adds a little Discipline
    baseAttributes.Discipline += times * 0.5;
  });

  // Clamp 0 - 100
  const result: LifeAttributes = {
    Strength: Math.min(100, Math.round(baseAttributes.Strength)),
    Health: Math.min(100, Math.round(baseAttributes.Health)),
    Mind: Math.min(100, Math.round(baseAttributes.Mind)),
    Focus: Math.min(100, Math.round(baseAttributes.Focus)),
    Discipline: Math.min(100, Math.round(baseAttributes.Discipline)),
    Mindfulness: Math.min(100, Math.round(baseAttributes.Mindfulness)),
    Creativity: Math.min(100, Math.round(baseAttributes.Creativity)),
    Social: Math.min(100, Math.round(baseAttributes.Social)),
    Finance: Math.min(100, Math.round(baseAttributes.Finance)),
  };

  return result;
};

/**
 * Generates smart, personalized habit insights
 */
export const generateInsights = (
  habits: Habit[],
  completions: HabitCompletion[]
): InsightCard[] => {
  const insights: InsightCard[] = [];

  // 1. Morning vs Evening consistency
  const morningHabits = habits.filter((h) => h.timeOfDay === 'morning');
  const eveningHabits = habits.filter((h) => h.timeOfDay === 'evening');

  const getCompRate = (list: Habit[]) => {
    if (list.length === 0) return 0;
    let totalScheduled = 0;
    let totalDone = 0;
    for (let i = 0; i < 14; i++) {
      const dStr = getDaysAgo(i);
      list.forEach((h) => {
        if (isHabitScheduledForDate(h, dStr, completions)) {
          totalScheduled++;
          if (completions.some((c) => c.habitId === h.id && c.dateStr === dStr && c.isCompleted)) {
            totalDone++;
          }
        }
      });
    }
    return totalScheduled > 0 ? (totalDone / totalScheduled) * 100 : 0;
  };

  const morningRate = Math.round(getCompRate(morningHabits));
  const eveningRate = Math.round(getCompRate(eveningHabits));

  if (morningRate > 0 && eveningRate > 0) {
    if (morningRate >= eveningRate + 15) {
      insights.push({
        id: 'morning_power',
        title: 'Morning Powerhouse',
        description: `Your morning habits are ${morningRate - eveningRate}% more consistent than your evening habits. Execute priority goals before noon.`,
        type: 'positive',
        icon: 'Sun',
      });
    } else if (eveningRate >= morningRate + 15) {
      insights.push({
        id: 'night_owl',
        title: 'Nightflow Momentum',
        description: `Your evening habits show higher completion rates (${eveningRate}%). Build wind-down routines for maximum habit retention.`,
        type: 'positive',
        icon: 'Moon',
      });
    }
  }

  // 2. Strongest day of the week
  const dayTotals: { done: number; total: number }[] = Array.from({ length: 7 }, () => ({
    done: 0,
    total: 0,
  }));
  for (let i = 0; i < 28; i++) {
    const dStr = getDaysAgo(i);
    const dayOfWeek = parseDateStr(dStr).getDay();
    habits.forEach((h) => {
      if (isHabitScheduledForDate(h, dStr, completions)) {
        dayTotals[dayOfWeek].total++;
        if (completions.some((c) => c.habitId === h.id && c.dateStr === dStr && c.isCompleted)) {
          dayTotals[dayOfWeek].done++;
        }
      }
    });
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let bestDayIdx = 1;
  let bestDayRate = -1;

  dayTotals.forEach((d, idx) => {
    if (d.total >= 4) {
      const rate = d.done / d.total;
      if (rate > bestDayRate) {
        bestDayRate = rate;
        bestDayIdx = idx;
      }
    }
  });

  if (bestDayRate > 0.6) {
    insights.push({
      id: 'best_day',
      title: `${dayNames[bestDayIdx]} Peak Performance`,
      description: `${dayNames[bestDayIdx]} is consistently your highest scoring day (${Math.round(bestDayRate * 100)}% completion). Schedule challenging habits here.`,
      type: 'positive',
      icon: 'Flame',
    });
  }

  // 3. Weekly Consistency Delta
  let thisWeekDone = 0;
  let thisWeekTotal = 0;
  let lastWeekDone = 0;
  let lastWeekTotal = 0;

  for (let i = 0; i < 7; i++) {
    const dStr = getDaysAgo(i);
    habits.forEach((h) => {
      if (isHabitScheduledForDate(h, dStr, completions)) {
        thisWeekTotal++;
        if (completions.some((c) => c.habitId === h.id && c.dateStr === dStr && c.isCompleted)) {
          thisWeekDone++;
        }
      }
    });
  }

  for (let i = 7; i < 14; i++) {
    const dStr = getDaysAgo(i);
    habits.forEach((h) => {
      if (isHabitScheduledForDate(h, dStr, completions)) {
        lastWeekTotal++;
        if (completions.some((c) => c.habitId === h.id && c.dateStr === dStr && c.isCompleted)) {
          lastWeekDone++;
        }
      }
    });
  }

  const thisRate = thisWeekTotal > 0 ? (thisWeekDone / thisWeekTotal) * 100 : 0;
  const lastRate = lastWeekTotal > 0 ? (lastWeekDone / lastWeekTotal) * 100 : 0;
  const delta = Math.round(thisRate - lastRate);

  if (delta > 5) {
    insights.push({
      id: 'growth_delta',
      title: 'Consistency Surging',
      description: `Your consistency improved by ${delta}% this week compared to last week. You are building compound character momentum.`,
      type: 'milestone',
      icon: 'TrendingUp',
    });
  } else if (delta < -10) {
    insights.push({
      id: 'recovery_tip',
      title: 'Reset & Rebound',
      description: 'Remember: consistency beats perfection. Focus on locking in just 2 essential habits today to restart your momentum.',
      type: 'tip',
      icon: 'Shield',
    });
  }

  // Fallback insight
  if (insights.length === 0) {
    insights.push({
      id: 'general_buffr',
      title: 'Compound Progression',
      description: 'Every completed habit boosts your Life Attributes and earns XP towards your next title unlock.',
      type: 'milestone',
      icon: 'Zap',
    });
  }

  return insights;
};

/**
 * Evaluates achievements progress and unlocks qualifying badges
 */
export const checkAchievementsUnlock = (
  habits: Habit[],
  completions: HabitCompletion[],
  user: UserProfile,
  achievements: Achievement[]
): Achievement[] => {
  const completedCompletions = completions.filter((c) => c.isCompleted);
  const totalCompletedCount = completedCompletions.length;
  const streakStats = calculateOverallStreak(habits, completions);

  // Category counts
  const categoryCompletedCounts: Record<string, number> = {};
  completedCompletions.forEach((c) => {
    const habit = habits.find((h) => h.id === c.habitId);
    if (habit) {
      categoryCompletedCounts[habit.category] = (categoryCompletedCounts[habit.category] || 0) + 1;
    }
  });

  return achievements.map((ach) => {
    let progress = ach.progress ?? ach.current ?? 0;
    let isUnlocked = ach.isUnlocked;

    const achKey = (ach.code || ach.id).toLowerCase();

    if (achKey.includes('first_step') || achKey.includes('first-step')) {
      progress = totalCompletedCount;
      if (progress >= (ach.target || 1)) isUnlocked = true;
    } else if (achKey.includes('momentum') || achKey.includes('streak-3') || achKey.includes('streak_3')) {
      progress = Math.max(user.currentStreak, user.longestStreak || 0);
      if (progress >= (ach.target || 3)) isUnlocked = true;
    } else if (achKey.includes('on_fire') || achKey.includes('streak-7') || achKey.includes('streak_7')) {
      progress = Math.max(user.currentStreak, user.longestStreak || 0);
      if (progress >= (ach.target || 7)) isUnlocked = true;
    } else if (achKey.includes('unstoppable') || achKey.includes('streak-30') || achKey.includes('streak_30')) {
      progress = Math.max(user.currentStreak, user.longestStreak || 0);
      if (progress >= (ach.target || 30)) isUnlocked = true;
    } else if (achKey.includes('century') || achKey.includes('century_club') || achKey.includes('streak-100')) {
      progress = Math.max(user.currentStreak, user.longestStreak || 0);
      if (progress >= (ach.target || 100)) isUnlocked = true;
    } else if (achKey.includes('perfect_week') || achKey.includes('perfect-week')) {
      progress = Math.max(user.perfectDaysCount || 0, streakStats.perfectDaysCount);
      if (progress >= (ach.target || 7)) isUnlocked = true;
    } else if (achKey.includes('xp_hunter') || achKey.includes('xp-hunter')) {
      progress = user.totalXp;
      if (progress >= (ach.target || 2500)) isUnlocked = true;
    } else if (achKey.includes('buffr_10') || achKey.includes('level-10') || achKey.includes('level_10')) {
      progress = user.level;
      if (progress >= (ach.target || 10)) isUnlocked = true;
    } else if (achKey.includes('level-5') || achKey.includes('level_5')) {
      progress = user.level;
      if (progress >= (ach.target || 5)) isUnlocked = true;
    } else if (achKey.includes('scholar')) {
      progress = (categoryCompletedCounts['Mind'] || 0) + (categoryCompletedCounts['Discipline'] || 0);
      if (progress >= (ach.target || 50)) isUnlocked = true;
    } else if (achKey.includes('athlete')) {
      progress = categoryCompletedCounts['Fitness'] || 0;
      if (progress >= (ach.target || 50)) isUnlocked = true;
    } else if (achKey.includes('zen_master') || achKey.includes('zen-master')) {
      progress = (categoryCompletedCounts['Mindfulness'] || 0) + (categoryCompletedCounts['Health'] || 0);
      if (progress >= (ach.target || 30)) isUnlocked = true;
    } else if (achKey.includes('centurion')) {
      progress = totalCompletedCount;
      if (progress >= (ach.target || 100)) isUnlocked = true;
    } else {
      if (progress >= ach.target && ach.target > 0) {
        isUnlocked = true;
      }
    }

    return {
      ...ach,
      progress: Math.min(ach.target, progress),
      current: Math.min(ach.target, progress),
      isUnlocked,
      unlockedAt: isUnlocked && !ach.unlockedAt ? new Date().toISOString() : ach.unlockedAt,
    };
  });
};
