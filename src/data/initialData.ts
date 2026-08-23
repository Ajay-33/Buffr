import {
  Habit,
  Achievement,
  Challenge,
  Quest,
  UserProfile,
  XPTransaction,
  HabitCompletion,
  RoutineChain,
} from '../types';
import { getDaysAgo, getTodayStr } from '../utils/dateUtils';

export const DEFAULT_ROUTINE_CHAINS: RoutineChain[] = [
  {
    id: 'chain_dawn_protocol',
    title: 'Dawn Anchor Protocol',
    description: 'Jumpstart mental clarity, physical vitality, and deep morning momentum.',
    emoji: '🌅',
    color: '#06b6d4',
    timeOfDay: 'morning',
    comboBonusXp: 45,
    habitIds: ['h_meditation', 'h_workout', 'h_deepwork'],
    isArchived: false,
    order: 0,
  },
  {
    id: 'chain_vitality_engine',
    title: 'Vitality & Movement',
    description: 'Keep hydration high and baseline cardiovascular activity strong.',
    emoji: '⚡',
    color: '#f59e0b',
    timeOfDay: 'afternoon',
    comboBonusXp: 35,
    habitIds: ['h_water', 'h_steps'],
    isArchived: false,
    order: 1,
  },
  {
    id: 'chain_nightfall_recovery',
    title: 'Nightfall Restoration',
    description: 'Decompress neural bandwidth with deep reading and restorative sleep.',
    emoji: '🌙',
    color: '#8b5cf6',
    timeOfDay: 'evening',
    comboBonusXp: 40,
    habitIds: ['h_reading', 'h_sleep'],
    isArchived: false,
    order: 2,
  },
];

export interface HabitTemplate {
  title: string;
  category: Habit['category'];
  description: string;
  timeOfDay: Habit['timeOfDay'];
  habitType: Habit['habitType'];
  difficulty?: Habit['difficulty'];
  targetValue: number;
  unit?: string;
  emoji: string;
  color: string;
  icon: string;
  xpReward?: number;
  attributeBoosts?: Habit['attributeBoosts'];
}

export interface RoutineTemplatePack {
  id: string;
  name: string;
  description: string;
  icon: string;
  habits: HabitTemplate[];
}

export const UNLOCKED_TITLES_POOL = [
  'Starter',
  'Novice',
  'Apprentice',
  'Consistent',
  'Focused',
  'Disciplined',
  'Relentless',
  'Vanguard',
  'Ascendant',
  'Titan',
  'Master of Habit',
  'Immortal',
];

export const ROUTINE_TEMPLATE_PACKS: RoutineTemplatePack[] = [
  {
    id: 'morning_power',
    name: 'Morning Power Routine',
    description: 'Kickstart your focus, hydration, and energy before the world wakes up.',
    icon: 'Sun',
    habits: [
      {
        title: 'Drink 2 Glasses of Water',
        category: 'Health',
        description: 'Hydrate immediately upon waking.',
        timeOfDay: 'morning',
        habitType: 'count',
        difficulty: 'easy',
        targetValue: 2,
        unit: 'glasses',
        emoji: '💧',
        color: '#06b6d4',
        icon: 'Droplets',
        attributeBoosts: { Health: 2, Discipline: 1 },
      },
      {
        title: 'Morning Movement & Stretch',
        category: 'Fitness',
        description: '10 minutes of dynamic mobility and stretching.',
        timeOfDay: 'morning',
        habitType: 'duration',
        difficulty: 'easy',
        targetValue: 10,
        unit: 'min',
        emoji: '🧘‍♂️',
        color: '#10b981',
        icon: 'Activity',
        attributeBoosts: { Strength: 1, Health: 2, Mindfulness: 1 },
      },
      {
        title: 'Mindful Meditation',
        category: 'Mindfulness',
        description: 'Calm the mind and set daily intention.',
        timeOfDay: 'morning',
        habitType: 'duration',
        difficulty: 'medium',
        targetValue: 10,
        unit: 'min',
        emoji: '🕯️',
        color: '#8b5cf6',
        icon: 'Sparkles',
        attributeBoosts: { Mindfulness: 3, Focus: 2 },
      },
      {
        title: 'Plan Daily Top 3 Priorities',
        category: 'Focus',
        description: 'Define the critical tasks to win the day.',
        timeOfDay: 'morning',
        habitType: 'boolean',
        difficulty: 'easy',
        targetValue: 1,
        emoji: '🎯',
        color: '#f59e0b',
        icon: 'CheckSquare',
        attributeBoosts: { Focus: 3, Discipline: 2 },
      },
    ],
  },
  {
    id: 'fitness_starter',
    name: 'Iron & Cardio Builder',
    description: 'Transform physical vitality and build athletic endurance.',
    icon: 'Dumbbell',
    habits: [
      {
        title: 'Strength / Gym Workout',
        category: 'Fitness',
        description: 'Resistance training or hypertrophy session.',
        timeOfDay: 'afternoon',
        habitType: 'duration',
        difficulty: 'hard',
        targetValue: 45,
        unit: 'min',
        emoji: '🏋️',
        color: '#ef4444',
        icon: 'Dumbbell',
        attributeBoosts: { Strength: 4, Health: 3, Discipline: 2 },
      },
      {
        title: 'Walk 8,000 Steps',
        category: 'Health',
        description: 'Maintain baseline cardiovascular activity.',
        timeOfDay: 'anytime',
        habitType: 'quantity',
        difficulty: 'medium',
        targetValue: 8000,
        unit: 'steps',
        emoji: '👟',
        color: '#10b981',
        icon: 'Footprints',
        attributeBoosts: { Health: 3, Strength: 1 },
      },
      {
        title: 'Drink 8 Glasses of Water',
        category: 'Health',
        description: 'Optimal daily cellular hydration.',
        timeOfDay: 'anytime',
        habitType: 'count',
        difficulty: 'medium',
        targetValue: 8,
        unit: 'glasses',
        emoji: '🌊',
        color: '#0284c7',
        icon: 'Droplets',
        attributeBoosts: { Health: 3, Focus: 1 },
      },
      {
        title: 'High-Protein Nutrition',
        category: 'Health',
        description: 'Hit lean protein and micronutrient targets.',
        timeOfDay: 'evening',
        habitType: 'boolean',
        difficulty: 'medium',
        targetValue: 1,
        emoji: '🥩',
        color: '#f97316',
        icon: 'Apple',
        attributeBoosts: { Health: 3, Strength: 2 },
      },
    ],
  },
  {
    id: 'deep_work',
    name: 'Cognitive Mastery & Deep Work',
    description: 'Protect high-value attention and master deep cognitive craft.',
    icon: 'Brain',
    habits: [
      {
        title: 'Deep Work Session (No Distractions)',
        category: 'Focus',
        description: 'Pure uninterrupted single-task flow.',
        timeOfDay: 'morning',
        habitType: 'duration',
        difficulty: 'hard',
        targetValue: 90,
        unit: 'min',
        emoji: '⚡',
        color: '#6366f1',
        icon: 'Zap',
        attributeBoosts: { Focus: 4, Discipline: 3, Mind: 2 },
      },
      {
        title: 'Read Non-Fiction / Books',
        category: 'Mind',
        description: 'Expand mental models and learn deep subjects.',
        timeOfDay: 'evening',
        habitType: 'duration',
        difficulty: 'medium',
        targetValue: 30,
        unit: 'min',
        emoji: '📚',
        color: '#a855f7',
        icon: 'BookOpen',
        attributeBoosts: { Mind: 4, Focus: 2 },
      },
      {
        title: 'Zero Social Media After 10 PM',
        category: 'Discipline',
        description: 'Protect sleep hygiene and dopamine baselines.',
        timeOfDay: 'evening',
        habitType: 'avoidance',
        difficulty: 'medium',
        targetValue: 1,
        emoji: '📵',
        color: '#ec4899',
        icon: 'ShieldOff',
        attributeBoosts: { Discipline: 3, Focus: 2, Health: 2 },
      },
    ],
  },
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_first_step',
    code: 'FIRST_STEP',
    title: 'First Step',
    description: 'Complete your first habit and ignite your progression.',
    category: 'Completion',
    icon: 'Footprints',
    badgeRarity: 'bronze',
    target: 1,
    current: 0,
    isUnlocked: false,
    xpReward: 50,
  },
  {
    id: 'ach_momentum',
    code: 'MOMENTUM',
    title: 'Building Momentum',
    description: 'Maintain a 3-day active habit streak.',
    category: 'Streaks',
    icon: 'Flame',
    badgeRarity: 'bronze',
    target: 3,
    current: 0,
    isUnlocked: false,
    xpReward: 100,
  },
  {
    id: 'ach_on_fire',
    code: 'ON_FIRE',
    title: 'On Fire',
    description: 'Reach a continuous 7-day streak.',
    category: 'Streaks',
    icon: 'Flame',
    badgeRarity: 'silver',
    target: 7,
    current: 0,
    isUnlocked: false,
    xpReward: 250,
  },
  {
    id: 'ach_unstoppable',
    code: 'UNSTOPPABLE',
    title: 'Unstoppable',
    description: 'Maintain an ironclad 30-day streak.',
    category: 'Streaks',
    icon: 'ShieldAlert',
    badgeRarity: 'gold',
    target: 30,
    current: 0,
    isUnlocked: false,
    xpReward: 600,
  },
  {
    id: 'ach_century',
    code: 'CENTURY',
    title: 'The Century Club',
    description: 'Maintain a 100-day unbroken streak.',
    category: 'Streaks',
    icon: 'Crown',
    badgeRarity: 'diamond',
    target: 100,
    current: 0,
    isUnlocked: false,
    xpReward: 2000,
  },
  {
    id: 'ach_perfect_week',
    code: 'PERFECT_WEEK',
    title: 'Perfect Week',
    description: 'Earn 100% daily completion score 7 days in a row.',
    category: 'Consistency',
    icon: 'Sparkles',
    badgeRarity: 'gold',
    target: 7,
    current: 0,
    isUnlocked: false,
    xpReward: 500,
  },
  {
    id: 'ach_xp_hunter',
    code: 'XP_HUNTER',
    title: 'XP Hunter',
    description: 'Accumulate 2,500 Total XP.',
    category: 'XP',
    icon: 'Award',
    badgeRarity: 'silver',
    target: 2500,
    current: 0,
    isUnlocked: false,
    xpReward: 300,
  },
  {
    id: 'ach_level_10',
    code: 'BUFFR_10',
    title: 'Titan In Training',
    description: 'Reach Buffr Character Level 10.',
    category: 'Levels',
    icon: 'Shield',
    badgeRarity: 'silver',
    target: 10,
    current: 1,
    isUnlocked: false,
    xpReward: 400,
  },
  {
    id: 'ach_scholar',
    code: 'SCHOLAR',
    title: 'The Scholar',
    description: 'Complete 50 Mind and Learning habits.',
    category: 'Categories',
    icon: 'BookOpen',
    badgeRarity: 'silver',
    target: 50,
    current: 0,
    isUnlocked: false,
    xpReward: 350,
  },
  {
    id: 'ach_athlete',
    code: 'ATHLETE',
    title: 'Iron Athlete',
    description: 'Complete 50 Fitness and Strength sessions.',
    category: 'Categories',
    icon: 'Dumbbell',
    badgeRarity: 'gold',
    target: 50,
    current: 0,
    isUnlocked: false,
    xpReward: 450,
  },
  {
    id: 'ach_zen_master',
    code: 'ZEN_MASTER',
    title: 'Inner Zen Master',
    description: 'Complete 30 Mindfulness and Meditation sessions.',
    category: 'Categories',
    icon: 'Sparkles',
    badgeRarity: 'silver',
    target: 30,
    current: 0,
    isUnlocked: false,
    xpReward: 300,
  },
  {
    id: 'ach_centurion',
    code: 'CENTURION',
    title: '100 Habits Completed',
    description: 'Reach 100 lifetime completed habit checks.',
    category: 'Completion',
    icon: 'CheckCircle2',
    badgeRarity: 'silver',
    target: 100,
    current: 0,
    isUnlocked: false,
    xpReward: 500,
  },
];

export const INITIAL_CHALLENGES: Challenge[] = [
  {
    id: 'chal_7d_discipline',
    title: '7-Day Discipline Forge',
    description: 'Complete 100% of your habits for 7 consecutive days to build baseline grit.',
    category: 'Discipline',
    durationDays: 7,
    startDate: getTodayStr(),
    endDate: getDaysAgo(-7),
    targetCriteria: 'Score >= 90% for 7 days',
    totalTarget: 7,
    currentProgress: 3,
    xpReward: 450,
    badge: '🛡️ Shield of Iron',
    isCustom: false,
    status: 'active',
  },
  {
    id: 'chal_30d_reading',
    title: '30-Day Deep Reading Challenge',
    description: 'Read 20+ minutes every day to expand cognitive bandwidth.',
    category: 'Mind',
    durationDays: 30,
    startDate: getDaysAgo(10),
    endDate: getDaysAgo(-20),
    targetCriteria: '30 days of reading',
    totalTarget: 30,
    currentProgress: 14,
    xpReward: 800,
    badge: '📖 Tome of Wisdom',
    isCustom: false,
    status: 'active',
  },
  {
    id: 'chal_10_workouts',
    title: '10 Workouts Sprint',
    description: 'Hit the gym or log 10 high-intensity workouts in 14 days.',
    category: 'Fitness',
    durationDays: 14,
    startDate: getDaysAgo(4),
    endDate: getDaysAgo(-10),
    targetCriteria: '10 completed fitness habits',
    totalTarget: 10,
    currentProgress: 5,
    xpReward: 500,
    badge: '⚡ Titan Lightning',
    isCustom: false,
    status: 'active',
  },
];

export const INITIAL_QUESTS: Quest[] = [
  {
    id: 'quest_d1',
    type: 'daily',
    title: 'Habit Trifecta',
    description: 'Complete at least 3 habits today.',
    progress: 0,
    target: 3,
    xpReward: 40,
    freezeReward: 0,
    isClaimed: false,
    expiresAt: '23:59',
    iconName: 'CheckSquare',
  },
  {
    id: 'quest_d2',
    type: 'daily',
    title: 'Heavy Lifter',
    description: 'Complete at least 1 Hard or Extreme habit.',
    progress: 0,
    target: 1,
    xpReward: 35,
    freezeReward: 0,
    isClaimed: false,
    expiresAt: '23:59',
    iconName: 'Zap',
  },
  {
    id: 'quest_d3',
    type: 'daily',
    title: 'XP Harvester',
    description: 'Earn 60+ XP across today’s actions.',
    progress: 0,
    target: 60,
    xpReward: 30,
    freezeReward: 0,
    isClaimed: false,
    expiresAt: '23:59',
    iconName: 'Flame',
  },
  {
    id: 'quest_w1',
    type: 'weekly',
    title: 'Weekly Dominance',
    description: 'Complete 25 total habits this week.',
    progress: 0,
    target: 25,
    xpReward: 250,
    freezeReward: 1,
    isClaimed: false,
    expiresAt: 'Sunday 23:59',
    iconName: 'Award',
  },
  {
    id: 'quest_w2',
    type: 'weekly',
    title: 'High Consistency Week',
    description: 'Score 80%+ on 5 different days this week.',
    progress: 0,
    target: 5,
    xpReward: 300,
    freezeReward: 1,
    isClaimed: false,
    expiresAt: 'Sunday 23:59',
    iconName: 'Sparkles',
  },
];

/**
 * Creates rich demo datasets with 30 days of realistic history
 */
export const createDemoDataset = (): {
  user: UserProfile;
  habits: Habit[];
  completions: HabitCompletion[];
  xpTransactions: XPTransaction[];
  achievements: Achievement[];
  challenges: Challenge[];
  quests: Quest[];
  routineChains: RoutineChain[];
} => {
  const habits: Habit[] = [
    {
      id: 'h_meditation',
      title: 'Mindfulness Meditation',
      description: '10 minutes of diaphragmatic breathing and focus.',
      icon: 'Sparkles',
      emoji: '🕯️',
      color: '#10b981',
      category: 'Mindfulness',
      timeOfDay: 'morning',
      habitType: 'duration',
      difficulty: 'easy',
      targetValue: 10,
      unit: 'min',
      frequencyType: 'daily',
      frequencyDays: [0, 1, 2, 3, 4, 5, 6],
      xpReward: 10,
      attributeBoosts: { Mindfulness: 4, Health: 1 },
      reminderTime: '06:45',
      isPaused: false,
      isArchived: false,
      createdAt: getDaysAgo(35),
      order: 0,
      routineChainId: 'chain_dawn_protocol',
    },
    {
      id: 'h_workout',
      title: 'Morning Workout & Strength',
      description: 'Compound resistance training or calisthenics.',
      icon: 'Dumbbell',
      emoji: '🏋️',
      color: '#ef4444',
      category: 'Fitness',
      timeOfDay: 'morning',
      habitType: 'duration',
      difficulty: 'hard',
      targetValue: 45,
      unit: 'min',
      frequencyType: 'weekdays',
      frequencyDays: [1, 2, 3, 4, 5],
      xpReward: 35,
      attributeBoosts: { Strength: 4, Health: 3, Discipline: 2 },
      reminderTime: '07:00',
      isPaused: false,
      isArchived: false,
      createdAt: getDaysAgo(35),
      order: 1,
      routineChainId: 'chain_dawn_protocol',
    },
    {
      id: 'h_deepwork',
      title: 'Deep Work (90 Min Flow)',
      description: 'Uninterrupted creative/engineering focus without phone.',
      icon: 'Zap',
      emoji: '⚡',
      color: '#6366f1',
      category: 'Focus',
      timeOfDay: 'morning',
      habitType: 'duration',
      difficulty: 'hard',
      targetValue: 90,
      unit: 'min',
      frequencyType: 'weekdays',
      frequencyDays: [1, 2, 3, 4, 5],
      xpReward: 35,
      attributeBoosts: { Focus: 4, Discipline: 3, Mind: 2 },
      reminderTime: '09:30',
      isPaused: false,
      isArchived: false,
      createdAt: getDaysAgo(35),
      order: 2,
      routineChainId: 'chain_dawn_protocol',
    },
    {
      id: 'h_water',
      title: 'Drink 8 Glasses of Water',
      description: 'Cellular hydration throughout the day.',
      icon: 'Droplets',
      emoji: '💧',
      color: '#06b6d4',
      category: 'Health',
      timeOfDay: 'anytime',
      habitType: 'count',
      difficulty: 'medium',
      targetValue: 8,
      unit: 'glasses',
      frequencyType: 'daily',
      frequencyDays: [0, 1, 2, 3, 4, 5, 6],
      xpReward: 20,
      attributeBoosts: { Health: 3, Focus: 1 },
      reminderTime: '10:00',
      isPaused: false,
      isArchived: false,
      createdAt: getDaysAgo(35),
      order: 3,
      routineChainId: 'chain_vitality_engine',
    },
    {
      id: 'h_steps',
      title: 'Walk 8,000 Steps',
      description: 'Daily baseline outdoor movement.',
      icon: 'Footprints',
      emoji: '👟',
      color: '#f59e0b',
      category: 'Fitness',
      timeOfDay: 'afternoon',
      habitType: 'quantity',
      difficulty: 'medium',
      targetValue: 8000,
      unit: 'steps',
      frequencyType: 'daily',
      frequencyDays: [0, 1, 2, 3, 4, 5, 6],
      xpReward: 20,
      attributeBoosts: { Health: 3, Strength: 1 },
      reminderTime: '18:00',
      isPaused: false,
      isArchived: false,
      createdAt: getDaysAgo(35),
      order: 4,
      routineChainId: 'chain_vitality_engine',
    },
    {
      id: 'h_reading',
      title: 'Read 25 Pages / Books',
      description: 'Philosophy, science, or technical craft.',
      icon: 'BookOpen',
      emoji: '📚',
      color: '#a855f7',
      category: 'Mind',
      timeOfDay: 'evening',
      habitType: 'quantity',
      difficulty: 'medium',
      targetValue: 25,
      unit: 'pages',
      frequencyType: 'daily',
      frequencyDays: [0, 1, 2, 3, 4, 5, 6],
      xpReward: 20,
      attributeBoosts: { Mind: 4, Focus: 2 },
      reminderTime: '20:30',
      isPaused: false,
      isArchived: false,
      createdAt: getDaysAgo(35),
      order: 5,
      routineChainId: 'chain_nightfall_recovery',
    },
    {
      id: 'h_sleep',
      title: 'In Bed Before 11:00 PM',
      description: '8 hours of restorative sleep.',
      icon: 'Moon',
      emoji: '🌙',
      color: '#3b82f6',
      category: 'Sleep',
      timeOfDay: 'evening',
      habitType: 'avoidance',
      difficulty: 'medium',
      targetValue: 1,
      frequencyType: 'daily',
      frequencyDays: [0, 1, 2, 3, 4, 5, 6],
      xpReward: 20,
      attributeBoosts: { Health: 3, Discipline: 2 },
      reminderTime: '22:30',
      isPaused: false,
      isArchived: false,
      createdAt: getDaysAgo(35),
      order: 6,
      routineChainId: 'chain_nightfall_recovery',
    },
  ];

  const completions: HabitCompletion[] = [];
  const xpTransactions: XPTransaction[] = [];
  let totalXp = 0;
  let totalCompletionsCount = 0;

  // Generate 30 days of realistic history
  for (let i = 30; i >= 1; i--) {
    const dStr = getDaysAgo(i);
    // Completion rate simulation: 80-95% on weekdays, 65-80% on weekends
    const dayOfWeek = (new Date(dStr).getDay());
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseProb = isWeekend ? 0.72 : 0.88;

    let dayCompletedCount = 0;
    let dayScheduledCount = 0;

    habits.forEach((habit) => {
      // Check if scheduled
      let scheduled = true;
      if (habit.frequencyType === 'weekdays' && isWeekend) scheduled = false;

      if (scheduled) {
        dayScheduledCount++;
        const didComplete = Math.random() < baseProb;
        if (didComplete) {
          dayCompletedCount++;
          totalCompletionsCount++;
          completions.push({
            id: `c_${habit.id}_${dStr}`,
            habitId: habit.id,
            dateStr: dStr,
            completedAt: `${dStr}T09:00:00Z`,
            isCompleted: true,
            progressValue: habit.targetValue,
          });

          // XP
          const xp = habit.xpReward;
          totalXp += xp;
          xpTransactions.push({
            id: `xp_${habit.id}_${dStr}`,
            amount: xp,
            timestamp: `${dStr}T10:00:00Z`,
            sourceType: 'habit',
            sourceId: habit.id,
            description: `Completed ${habit.title}`,
          });
        } else {
          // Partial or missed
          const progress = habit.targetValue > 1 ? Math.floor(habit.targetValue * 0.4) : 0;
          completions.push({
            id: `c_${habit.id}_${dStr}`,
            habitId: habit.id,
            dateStr: dStr,
            completedAt: `${dStr}T09:00:00Z`,
            isCompleted: false,
            progressValue: progress,
            reasonMissed: isWeekend ? 'Busy weekend' : 'Busy schedule',
          });
        }
      }
    });

    // Perfect day bonus
    if (dayScheduledCount > 0 && dayCompletedCount === dayScheduledCount) {
      totalXp += 50;
      xpTransactions.push({
        id: `xp_perf_${dStr}`,
        amount: 50,
        timestamp: `${dStr}T23:59:00Z`,
        sourceType: 'perfect_day',
        sourceId: dStr,
        description: 'Perfect Day 100% Completion Bonus',
      });
    }
  }

  // Today initial state (3 completed, 4 pending)
  const todayStr = getTodayStr();
  const todayCompletedHabits = [habits[0], habits[1], habits[4]]; // workout, water, meditation done
  todayCompletedHabits.forEach((h) => {
    totalCompletionsCount++;
    completions.push({
      id: `c_${h.id}_${todayStr}`,
      habitId: h.id,
      dateStr: todayStr,
      completedAt: `${todayStr}T08:15:00Z`,
      isCompleted: true,
      progressValue: h.targetValue,
    });
    totalXp += h.xpReward;
    xpTransactions.push({
      id: `xp_${h.id}_${todayStr}`,
      amount: h.xpReward,
      timestamp: `${todayStr}T08:15:00Z`,
      sourceType: 'habit',
      sourceId: h.id,
      description: `Completed ${h.title}`,
    });
  });

  // Steps progress today: 4,500 / 8,000
  completions.push({
    id: `c_h_steps_${todayStr}`,
    habitId: 'h_steps',
    dateStr: todayStr,
    completedAt: `${todayStr}T12:00:00Z`,
    isCompleted: false,
    progressValue: 4500,
  });

  // Reading progress today: 15 / 25
  completions.push({
    id: `c_h_reading_${todayStr}`,
    habitId: 'h_reading',
    dateStr: todayStr,
    completedAt: `${todayStr}T14:00:00Z`,
    isCompleted: false,
    progressValue: 15,
  });

  const achievements = INITIAL_ACHIEVEMENTS.map((a) => {
    if (a.id === 'ach_first_step') {
      return { ...a, current: 1, isUnlocked: true, unlockedAt: getDaysAgo(30) };
    }
    if (a.id === 'ach_momentum') {
      return { ...a, current: 3, isUnlocked: true, unlockedAt: getDaysAgo(27) };
    }
    if (a.id === 'ach_on_fire') {
      return { ...a, current: 7, isUnlocked: true, unlockedAt: getDaysAgo(20) };
    }
    if (a.id === 'ach_xp_hunter') {
      return { ...a, current: 2500, isUnlocked: true, unlockedAt: getDaysAgo(4) };
    }
    if (a.id === 'ach_athlete') {
      return { ...a, current: 28, isUnlocked: false };
    }
    if (a.id === 'ach_scholar') {
      return { ...a, current: 26, isUnlocked: false };
    }
    if (a.id === 'ach_zen_master') {
      return { ...a, current: 24, isUnlocked: false };
    }
    if (a.id === 'ach_centurion') {
      return { ...a, current: Math.min(100, totalCompletionsCount), isUnlocked: totalCompletionsCount >= 100 };
    }
    return a;
  });

  const quests: Quest[] = INITIAL_QUESTS.map((q) => {
    if (q.id === 'quest_d1') {
      return { ...q, progress: 3, isClaimed: true };
    }
    if (q.id === 'quest_d2') {
      return { ...q, progress: 1, isClaimed: false }; // ready to claim!
    }
    if (q.id === 'quest_d3') {
      return { ...q, progress: 65, isClaimed: false }; // ready to claim!
    }
    if (q.id === 'quest_w1') {
      return { ...q, progress: 18 };
    }
    if (q.id === 'quest_w2') {
      return { ...q, progress: 4 };
    }
    return q;
  });

  const user: UserProfile = {
    id: 'user_alex',
    name: 'Alex Rivera',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    level: 12,
    totalXp: 2840,
    currentTitle: 'Focused',
    unlockedTitles: ['Starter', 'Initiate', 'Builder', 'Disciplined', 'Focused'],
    streakFreezes: 3,
    streakFreezesRemaining: 3,
    longestStreak: 18,
    currentStreak: 12,
    perfectDaysCount: 8,
    totalHabitsCompleted: totalCompletionsCount,
    joinedDate: getDaysAgo(35),
    soundEnabled: true,
    hapticsEnabled: true,
    themeMode: 'dark',
    isPhoneFrame: false,
    onboardingCompleted: true,
    inventory: [
      {
        id: 'loot_demo_1',
        name: 'Blade of the Early Dawn',
        subtitle: 'Morning Vanguard Weapon',
        description: '+15% bonus XP for any quest checked off before 10:00 AM.',
        flavorText: 'Gleams with the first radiant ray of morning sunshine.',
        rarity: 'rare',
        slot: 'weapon',
        icon: 'Sun',
        emoji: '🌅',
        stats: { xpBonusPercent: 12, focusBoost: 8 },
        isEquipped: true,
        obtainedAt: getDaysAgo(14),
      },
      {
        id: 'loot_demo_2',
        name: 'Titanmail Hauberk',
        subtitle: 'Armor of Consistency',
        description: '+10 Health, +8 Discipline, and 10% chance to shield streak on missed days.',
        flavorText: 'Interlocked steel rings forged under intense discipline heat.',
        rarity: 'rare',
        slot: 'armor',
        icon: 'ShieldCheck',
        emoji: '🦾',
        stats: { healthBoost: 10, disciplineBoost: 8, streakShieldChance: 10 },
        isEquipped: true,
        obtainedAt: getDaysAgo(10),
      },
      {
        id: 'loot_demo_3',
        name: 'Sapphire Hourglass of Chronos',
        subtitle: 'Time Anchor Relic',
        description: '+15% XP on duration/focus tasks + 8 Focus boost.',
        flavorText: 'Glowing azure sand inside falls at a steady flow-state pace.',
        rarity: 'rare',
        slot: 'relic',
        icon: 'Hourglass',
        emoji: '⏳',
        stats: { xpBonusPercent: 15, focusBoost: 8 },
        isEquipped: true,
        obtainedAt: getDaysAgo(5),
      },
      {
        id: 'loot_demo_4',
        name: 'Silver Clover Leaf',
        subtitle: 'Fortuitous Charm',
        description: '+10% Loot drop chance & +5% Critical XP roll.',
        flavorText: 'Pressed inside an ancient strategy manual. Radiates gentle good fortune.',
        rarity: 'uncommon',
        slot: 'charm',
        icon: 'Sparkles',
        emoji: '🍀',
        stats: { luckBonusPercent: 10, critXpChance: 5 },
        isEquipped: true,
        obtainedAt: getDaysAgo(3),
      },
      {
        id: 'loot_demo_5',
        name: 'Iron Kettlebell Mace',
        subtitle: 'Heavy Habit Smasher',
        description: '+8% XP on all Hard/Extreme workouts + 5 Strength boost.',
        flavorText: 'Cast in heavy molten iron. Weighted specifically to shatter morning lethargy.',
        rarity: 'uncommon',
        slot: 'weapon',
        icon: 'Dumbbell',
        emoji: '🏋️',
        stats: { xpBonusPercent: 8, strengthBoost: 5 },
        isEquipped: false,
        obtainedAt: getDaysAgo(2),
      },
    ],
    equippedGear: {
      weapon: {
        id: 'loot_demo_1',
        name: 'Blade of the Early Dawn',
        subtitle: 'Morning Vanguard Weapon',
        description: '+15% bonus XP for any quest checked off before 10:00 AM.',
        flavorText: 'Gleams with the first radiant ray of morning sunshine.',
        rarity: 'rare',
        slot: 'weapon',
        icon: 'Sun',
        emoji: '🌅',
        stats: { xpBonusPercent: 12, focusBoost: 8 },
        isEquipped: true,
        obtainedAt: getDaysAgo(14),
      },
      armor: {
        id: 'loot_demo_2',
        name: 'Titanmail Hauberk',
        subtitle: 'Armor of Consistency',
        description: '+10 Health, +8 Discipline, and 10% chance to shield streak on missed days.',
        flavorText: 'Interlocked steel rings forged under intense discipline heat.',
        rarity: 'rare',
        slot: 'armor',
        icon: 'ShieldCheck',
        emoji: '🦾',
        stats: { healthBoost: 10, disciplineBoost: 8, streakShieldChance: 10 },
        isEquipped: true,
        obtainedAt: getDaysAgo(10),
      },
      relic: {
        id: 'loot_demo_3',
        name: 'Sapphire Hourglass of Chronos',
        subtitle: 'Time Anchor Relic',
        description: '+15% XP on duration/focus tasks + 8 Focus boost.',
        flavorText: 'Glowing azure sand inside falls at a steady flow-state pace.',
        rarity: 'rare',
        slot: 'relic',
        icon: 'Hourglass',
        emoji: '⏳',
        stats: { xpBonusPercent: 15, focusBoost: 8 },
        isEquipped: true,
        obtainedAt: getDaysAgo(5),
      },
      charm: {
        id: 'loot_demo_4',
        name: 'Silver Clover Leaf',
        subtitle: 'Fortuitous Charm',
        description: '+10% Loot drop chance & +5% Critical XP roll.',
        flavorText: 'Pressed inside an ancient strategy manual. Radiates gentle good fortune.',
        rarity: 'uncommon',
        slot: 'charm',
        icon: 'Sparkles',
        emoji: '🍀',
        stats: { luckBonusPercent: 10, critXpChance: 5 },
        isEquipped: true,
        obtainedAt: getDaysAgo(3),
      },
    },
    skillTree: {
      unlockedNodeIds: ['warrior_t1_1', 'paladin_t1_1', 'mage_t1_1'],
      totalSkillPointsEarned: 13,
      availableSkillPoints: 10,
    },
  };

  return {
    user,
    habits,
    completions,
    xpTransactions,
    achievements,
    challenges: INITIAL_CHALLENGES,
    quests,
    routineChains: DEFAULT_ROUTINE_CHAINS,
  };
};

export const createFreshDataset = (): {
  user: UserProfile;
  habits: Habit[];
  completions: HabitCompletion[];
  xpTransactions: XPTransaction[];
  achievements: Achievement[];
  challenges: Challenge[];
  quests: Quest[];
  routineChains: RoutineChain[];
} => {
  const user: UserProfile = {
    id: 'user_fresh',
    name: 'Champion',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    level: 1,
    totalXp: 0,
    currentTitle: 'Starter',
    unlockedTitles: ['Starter'],
    streakFreezes: 2,
    streakFreezesRemaining: 2,
    longestStreak: 0,
    currentStreak: 0,
    perfectDaysCount: 0,
    totalHabitsCompleted: 0,
    joinedDate: getTodayStr(),
    soundEnabled: true,
    hapticsEnabled: true,
    themeMode: 'dark',
    isPhoneFrame: false,
    onboardingCompleted: false,
  };

  return {
    user,
    habits: [],
    completions: [],
    xpTransactions: [],
    achievements: INITIAL_ACHIEVEMENTS,
    challenges: INITIAL_CHALLENGES,
    quests: INITIAL_QUESTS,
    routineChains: DEFAULT_ROUTINE_CHAINS,
  };
};
