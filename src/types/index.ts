export type LifeCategory =
  | 'Fitness'
  | 'Health'
  | 'Mind'
  | 'Focus'
  | 'Discipline'
  | 'Mindfulness'
  | 'Creativity'
  | 'Social'
  | 'Finance'
  | 'Sleep';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'anytime';

export type HabitDifficulty = 'easy' | 'medium' | 'hard' | 'extreme';

export type HabitType = 'boolean' | 'count' | 'duration' | 'quantity' | 'avoidance';

export type FrequencyType = 'daily' | 'weekdays' | 'custom_days' | 'times_per_week';

export interface AttributeBoostMap {
  Strength?: number;
  Health?: number;
  Mind?: number;
  Focus?: number;
  Discipline?: number;
  Mindfulness?: number;
  Creativity?: number;
  Social?: number;
  Finance?: number;
}

export interface HabitFrequency {
  type: FrequencyType;
  days?: number[];
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  emoji: string;
  color: string;
  category: LifeCategory;
  timeOfDay: TimeOfDay;
  habitType: HabitType;
  difficulty?: HabitDifficulty;
  targetValue: number;
  unit?: string;
  frequencyType?: FrequencyType;
  frequencyDays?: number[];
  frequency?: HabitFrequency;
  xpReward: number;
  attributeBoosts?: AttributeBoostMap;
  reminderTime?: string;
  isPaused: boolean;
  pauseReason?: string;
  isArchived: boolean;
  createdAt: string;
  notes?: string;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  dateStr: string;
  completedAt?: string;
  isCompleted: boolean;
  progressValue: number;
  reasonMissed?: string;
  notes?: string;
}

export type XPSourceType =
  | 'habit'
  | 'streak'
  | 'achievement'
  | 'challenge'
  | 'quest'
  | 'perfect_day';

export interface XPTransaction {
  id: string;
  amount: number;
  timestamp: string;
  sourceType?: XPSourceType;
  sourceId?: string;
  description?: string;
  reason?: string;
  habitId?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
  avatarEmoji?: string;
  level: number;
  totalXp: number;
  currentTitle: string;
  unlockedTitles?: string[];
  streakFreezes?: number;
  streakFreezesRemaining?: number;
  longestStreak?: number;
  currentStreak: number;
  perfectDaysCount?: number;
  totalHabitsCompleted?: number;
  joinedDate?: string;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  themeMode?: 'dark' | 'light' | 'system';
  isPhoneFrame?: boolean;
  onboardingCompleted?: boolean;
}

export interface LifeAttributes {
  Strength: number;
  Health: number;
  Mind: number;
  Focus: number;
  Discipline: number;
  Mindfulness: number;
  Creativity: number;
  Social: number;
  Finance: number;
}

export type AchievementCategory =
  | 'Consistency'
  | 'Streaks'
  | 'Completion'
  | 'XP'
  | 'Levels'
  | 'Categories'
  | 'Mastery';

export interface Achievement {
  id: string;
  code?: string;
  title: string;
  description: string;
  category?: AchievementCategory;
  icon: string;
  badgeRarity?: 'bronze' | 'silver' | 'gold' | 'diamond' | 'legendary';
  tier?: 'bronze' | 'silver' | 'gold' | 'diamond' | 'legendary';
  target: number;
  current?: number;
  progress?: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  xpReward: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: LifeCategory;
  durationDays?: number;
  targetDays?: number;
  currentDay?: number;
  startDate?: string;
  endDate?: string;
  targetCriteria?: string;
  totalTarget?: number;
  currentProgress?: number;
  xpReward: number;
  badge?: string;
  emoji?: string;
  color?: string;
  isCustom?: boolean;
  isJoined?: boolean;
  isCompleted?: boolean;
  status?: 'active' | 'completed' | 'failed';
}

export interface Quest {
  id: string;
  type: 'daily' | 'weekly';
  title: string;
  description: string;
  progress: number;
  target: number;
  xpReward: number;
  freezeReward?: number;
  isClaimed: boolean;
  expiresAt?: string;
  iconName?: string;
}

export type MoodType = 'terrible' | 'bad' | 'okay' | 'good' | 'great';

export interface DailyReflection {
  dateStr: string;
  mood: MoodType;
  whatWentWell?: string;
  whatCouldImprove?: string;
  notes?: string;
  createdAt: string;
}

export interface DailySummary {
  dateStr: string;
  totalScheduled: number;
  completedCount: number;
  dailyScore: number;
  xpEarned: number;
  isPerfectDay: boolean;
}

export interface InsightCard {
  id: string;
  title: string;
  description: string;
  type: 'positive' | 'tip' | 'milestone' | 'warning';
  icon: string;
}

export type ActiveTab = 'today' | 'calendar' | 'progress' | 'challenges' | 'profile';
