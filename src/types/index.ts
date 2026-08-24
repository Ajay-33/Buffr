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

/**
 * daily       - every single day
 * weekdays    - Mon-Fri
 * custom_days - specific weekdays (frequencyDays)
 * times_per_week - flexible target: N of 7 days, any days
 * interval    - every N days (next due = last completion + N)
 */
export type FrequencyType = 'daily' | 'weekdays' | 'custom_days' | 'times_per_week' | 'interval';

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
  /** For 'interval' type: repeat every N days */
  intervalDays?: number;
  /** For 'times_per_week' type: target count out of 7 flexible days */
  timesPerWeek?: number;
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
  /** For 'interval' type: repeat every N days (mirrored in frequency) */
  intervalDays?: number;
  /** For 'times_per_week' type: target count out of 7 flexible days */
  timesPerWeek?: number;
  frequency?: HabitFrequency;
  xpReward: number;
  attributeBoosts?: AttributeBoostMap;
  reminderTime?: string;
  isPaused: boolean;
  pauseReason?: string;
  isArchived: boolean;
  createdAt: string;
  notes?: string;
  order?: number;
  routineChainId?: string;
}

export interface RoutineChain {
  id: string;
  title: string;
  description?: string;
  emoji: string;
  color: string;
  timeOfDay: TimeOfDay;
  comboBonusXp: number;
  habitIds: string[];
  isArchived?: boolean;
  order?: number;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  dateStr: string;
  completedAt?: string;
  isCompleted: boolean;
  progressValue: number;
  /** Exact XP granted when this completion was made — reversed 1:1 on undo,
   *  preventing toggle-spam XP farming (streak/gear/crit bonuses included). */
  xpAwarded?: number;
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
  streakFreezesRemaining: number;
  streakShieldActiveUntil?: string;
  autoEquipHighestTitle?: boolean;
  longestStreak?: number;
  currentStreak: number;
  perfectDaysCount?: number;
  totalHabitsCompleted?: number;
  joinedDate?: string;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  notificationsEnabled?: boolean;
  morningReminderEnabled?: boolean;
  morningReminderTime?: string;
  eveningReminderEnabled?: boolean;
  eveningReminderTime?: string;
  streakReminderEnabled?: boolean;
  streakReminderTime?: string;
  themeMode?: 'dark' | 'light' | 'system';
  isPhoneFrame?: boolean;
  onboardingCompleted?: boolean;
  inventory?: LootItem[];
  equippedGear?: EquippedGear;
  skillTree?: UserSkillTreeState;
}

export type LootRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic'
  | 'artifact';

export type LootSlotType = 'weapon' | 'armor' | 'relic' | 'charm';

export interface LootStats {
  xpBonusPercent?: number;
  luckBonusPercent?: number;
  strengthBoost?: number;
  healthBoost?: number;
  mindBoost?: number;
  focusBoost?: number;
  disciplineBoost?: number;
  mindfulnessBoost?: number;
  creativityBoost?: number;
  socialBoost?: number;
  financeBoost?: number;
  streakShieldChance?: number;
  freezeSlotsBonus?: number;
  critXpChance?: number;
}

export interface LootItem {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  flavorText: string;
  rarity: LootRarity;
  slot: LootSlotType;
  icon: string;
  emoji: string;
  stats: LootStats;
  isEquipped?: boolean;
  obtainedAt?: string;
}

export interface EquippedGear {
  weapon?: LootItem | null;
  armor?: LootItem | null;
  relic?: LootItem | null;
  charm?: LootItem | null;
}

export type SkillBranchId = 'warrior' | 'mage' | 'paladin' | 'monk' | 'rogue';

export interface SkillNode {
  id: string;
  branch: SkillBranchId;
  title: string;
  subtitle: string;
  description: string;
  tier: 1 | 2 | 3;
  cost: number;
  icon: string;
  emoji: string;
  requiresNodeId?: string;
  statsEffect: {
    xpMultiplier?: number;
    categoryBoost?: { category: LifeCategory; boostPercent: number };
    morningBonusPercent?: number;
    eveningBonusPercent?: number;
    lootLuckBonus?: number;
    streakRecoveryBonus?: boolean;
    attributeFlatBonus?: { attr: keyof LifeAttributes; val: number };
  };
}

export interface UserSkillTreeState {
  unlockedNodeIds: string[];
  totalSkillPointsEarned: number;
  availableSkillPoints: number;
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
