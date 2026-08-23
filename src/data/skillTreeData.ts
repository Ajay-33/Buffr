import { SkillBranchId, SkillNode, UserSkillTreeState, UserProfile } from '../types';

export interface BranchInfo {
  id: SkillBranchId;
  name: string;
  discipline: string;
  tagline: string;
  themeColor: string;
  badgeBg: string;
  borderColor: string;
  icon: string;
  emoji: string;
}

export const SKILL_BRANCHES: Record<SkillBranchId, BranchInfo> = {
  warrior: {
    id: 'warrior',
    name: 'WARRIOR',
    discipline: 'STRENGTH & VITALITY',
    tagline: 'Physical momentum, intense training, and unstoppable stamina.',
    themeColor: '#ef4444',
    badgeBg: 'bg-red-950/80',
    borderColor: 'border-red-500',
    icon: 'Sword',
    emoji: '⚔️',
  },
  mage: {
    id: 'mage',
    name: 'MAGE',
    discipline: 'MIND & DEEP FOCUS',
    tagline: 'Hyper-concentration, intellectual mastery, and flow-state sprints.',
    themeColor: '#a855f7',
    badgeBg: 'bg-purple-950/80',
    borderColor: 'border-purple-500',
    icon: 'Brain',
    emoji: '🧠',
  },
  paladin: {
    id: 'paladin',
    name: 'PALADIN',
    discipline: 'DISCIPLINE & STREAKS',
    tagline: 'Iron willpower, streak preservation, and unwavering consistency.',
    themeColor: '#eab308',
    badgeBg: 'bg-yellow-950/80',
    borderColor: 'border-yellow-400',
    icon: 'Shield',
    emoji: '🛡️',
  },
  monk: {
    id: 'monk',
    name: 'MONK',
    discipline: 'MINDFULNESS & SLEEP',
    tagline: 'Restorative recovery, mental calm, and hormonal equilibrium.',
    themeColor: '#06b6d4',
    badgeBg: 'bg-cyan-950/80',
    borderColor: 'border-cyan-400',
    icon: 'Sparkles',
    emoji: '🧘',
  },
  rogue: {
    id: 'rogue',
    name: 'ROGUE',
    discipline: 'FORTUNE & CREATIVITY',
    tagline: 'Lucky loot rolls, creative breakthroughs, and resource compounding.',
    themeColor: '#10b981',
    badgeBg: 'bg-emerald-950/80',
    borderColor: 'border-emerald-500',
    icon: 'Sparkles',
    emoji: '🎨',
  },
};

export const MASTER_SKILL_NODES: SkillNode[] = [
  // ================= ⚔️ WARRIOR BRANCH =================
  {
    id: 'warrior_t1_1',
    branch: 'warrior',
    title: 'Dawn Vanguard',
    subtitle: 'Tier 1 Routine Primer',
    description: '+15% bonus XP for Fitness & Health habits completed in the morning.',
    tier: 1,
    cost: 1,
    icon: 'Sun',
    emoji: '🌅',
    statsEffect: { morningBonusPercent: 15, attributeFlatBonus: { attr: 'Strength', val: 5 } },
  },
  {
    id: 'warrior_t1_2',
    branch: 'warrior',
    title: 'Iron Foundation',
    subtitle: 'Tier 1 Body Conditioning',
    description: '+6 Strength and +6 Health flat attribute scaling permanently.',
    tier: 1,
    cost: 1,
    icon: 'Dumbbell',
    emoji: '🦾',
    statsEffect: { attributeFlatBonus: { attr: 'Strength', val: 6 } },
  },
  {
    id: 'warrior_t2_1',
    branch: 'warrior',
    title: 'Heavy Rep Momentum',
    subtitle: 'Tier 2 Intensity Surge',
    description: '+25% XP multiplier on all Hard and Extreme workout quests.',
    tier: 2,
    cost: 2,
    requiresNodeId: 'warrior_t1_1',
    icon: 'Flame',
    emoji: '🔥',
    statsEffect: { categoryBoost: { category: 'Fitness', boostPercent: 25 } },
  },
  {
    id: 'warrior_t2_2',
    branch: 'warrior',
    title: 'Titan Metabolism',
    subtitle: 'Tier 2 Recovery Engine',
    description: '+10 Health attribute bonus and 10% chance to shield streak.',
    tier: 2,
    cost: 2,
    requiresNodeId: 'warrior_t1_2',
    icon: 'Activity',
    emoji: '⚡',
    statsEffect: { attributeFlatBonus: { attr: 'Health', val: 10 }, streakRecoveryBonus: true },
  },
  {
    id: 'warrior_t3_capstone',
    branch: 'warrior',
    title: 'Colossus Transcendence',
    subtitle: 'Tier 3 Master Capstone',
    description: '+20% global XP, +15 Strength/Health, and unlocked Berserker Aura.',
    tier: 3,
    cost: 3,
    requiresNodeId: 'warrior_t2_1',
    icon: 'Crown',
    emoji: '👑',
    statsEffect: { xpMultiplier: 1.2, attributeFlatBonus: { attr: 'Strength', val: 15 } },
  },

  // ================= 🧠 MAGE BRANCH =================
  {
    id: 'mage_t1_1',
    branch: 'mage',
    title: 'Hyper-Focus Lens',
    subtitle: 'Tier 1 Neural Primer',
    description: '+15% XP on Mind & Focus tasks + 6 Mind boost.',
    tier: 1,
    cost: 1,
    icon: 'Eye',
    emoji: '🧐',
    statsEffect: { categoryBoost: { category: 'Mind', boostPercent: 15 }, attributeFlatBonus: { attr: 'Mind', val: 6 } },
  },
  {
    id: 'mage_t1_2',
    branch: 'mage',
    title: 'Deep Work Chamber',
    subtitle: 'Tier 1 Concentration',
    description: '+8 Focus and +5 Discipline permanently.',
    tier: 1,
    cost: 1,
    icon: 'Brain',
    emoji: '🔬',
    statsEffect: { attributeFlatBonus: { attr: 'Focus', val: 8 } },
  },
  {
    id: 'mage_t2_1',
    branch: 'mage',
    title: 'Scholar’s Overclock',
    subtitle: 'Tier 2 Intellectual Sprint',
    description: '+25% XP on Reading, Writing, and Skill acquisition habits.',
    tier: 2,
    cost: 2,
    requiresNodeId: 'mage_t1_1',
    icon: 'BookOpen',
    emoji: '📖',
    statsEffect: { categoryBoost: { category: 'Focus', boostPercent: 25 } },
  },
  {
    id: 'mage_t2_2',
    branch: 'mage',
    title: 'Flow State Resonance',
    subtitle: 'Tier 2 Neural Harmony',
    description: '15% chance for Critical 2x XP roll when completing focus tasks.',
    tier: 2,
    cost: 2,
    requiresNodeId: 'mage_t1_2',
    icon: 'Zap',
    emoji: '⚡',
    statsEffect: { attributeFlatBonus: { attr: 'Mind', val: 10 } },
  },
  {
    id: 'mage_t3_capstone',
    branch: 'mage',
    title: 'Omniscient Archmage',
    subtitle: 'Tier 3 Master Capstone',
    description: 'Double attribute gains on all Mind/Focus habits + 20% global XP.',
    tier: 3,
    cost: 3,
    requiresNodeId: 'mage_t2_1',
    icon: 'Sparkles',
    emoji: '🔮',
    statsEffect: { xpMultiplier: 1.2, attributeFlatBonus: { attr: 'Mind', val: 20 } },
  },

  // ================= 🛡️ PALADIN BRANCH =================
  {
    id: 'paladin_t1_1',
    branch: 'paladin',
    title: 'Anchor of Routine',
    subtitle: 'Tier 1 Discipline Base',
    description: '+8 Discipline attribute and +5% XP on all streak milestone days.',
    tier: 1,
    cost: 1,
    icon: 'ShieldCheck',
    emoji: '⚓',
    statsEffect: { attributeFlatBonus: { attr: 'Discipline', val: 8 } },
  },
  {
    id: 'paladin_t1_2',
    branch: 'paladin',
    title: 'Iron Pledge',
    subtitle: 'Tier 1 Vow of Consistency',
    description: '+10% combo streak XP multiplier bonus.',
    tier: 1,
    cost: 1,
    icon: 'Award',
    emoji: '🛡️',
    statsEffect: { xpMultiplier: 1.1 },
  },
  {
    id: 'paladin_t2_1',
    branch: 'paladin',
    title: 'Phoenix Shielding',
    subtitle: 'Tier 2 Emergency Ward',
    description: '+1 extra Streak Freeze maximum capacity + 15% streak recovery chance.',
    tier: 2,
    cost: 2,
    requiresNodeId: 'paladin_t1_1',
    icon: 'Flame',
    emoji: '🔥',
    statsEffect: { streakRecoveryBonus: true, attributeFlatBonus: { attr: 'Discipline', val: 10 } },
  },
  {
    id: 'paladin_t2_2',
    branch: 'paladin',
    title: 'Unshakable Will',
    subtitle: 'Tier 2 Habit Resilience',
    description: '+12 Discipline and +8 Health attribute boost.',
    tier: 2,
    cost: 2,
    requiresNodeId: 'paladin_t1_2',
    icon: 'Shield',
    emoji: '🏰',
    statsEffect: { attributeFlatBonus: { attr: 'Discipline', val: 12 } },
  },
  {
    id: 'paladin_t3_capstone',
    branch: 'paladin',
    title: 'Grandmaster Aegis',
    subtitle: 'Tier 3 Master Capstone',
    description: 'Permanent 25% XP multiplier and unbreakable momentum shield.',
    tier: 3,
    cost: 3,
    requiresNodeId: 'paladin_t2_1',
    icon: 'Trophy',
    emoji: '🌟',
    statsEffect: { xpMultiplier: 1.25, attributeFlatBonus: { attr: 'Discipline', val: 25 } },
  },

  // ================= 🧘 MONK BRANCH =================
  {
    id: 'monk_t1_1',
    branch: 'monk',
    title: 'Twilight Wind-Down',
    subtitle: 'Tier 1 Evening Harmony',
    description: '+15% XP on evening and sleep habits + 6 Mindfulness boost.',
    tier: 1,
    cost: 1,
    icon: 'Moon',
    emoji: '🌙',
    statsEffect: { eveningBonusPercent: 15, attributeFlatBonus: { attr: 'Mindfulness', val: 6 } },
  },
  {
    id: 'monk_t1_2',
    branch: 'monk',
    title: 'Inner Stillness',
    subtitle: 'Tier 1 Stress Reduction',
    description: '+8 Mindfulness and +6 Health attribute boost.',
    tier: 1,
    cost: 1,
    icon: 'Heart',
    emoji: '🕯️',
    statsEffect: { attributeFlatBonus: { attr: 'Mindfulness', val: 8 } },
  },
  {
    id: 'monk_t2_1',
    branch: 'monk',
    title: 'Lucid Recovery',
    subtitle: 'Tier 2 Circadian Optimization',
    description: '+25% XP on Meditation & Sleep habits + 10 Health boost.',
    tier: 2,
    cost: 2,
    requiresNodeId: 'monk_t1_1',
    icon: 'Sparkles',
    emoji: '✨',
    statsEffect: { categoryBoost: { category: 'Mindfulness', boostPercent: 25 } },
  },
  {
    id: 'monk_t2_2',
    branch: 'monk',
    title: 'Zen Equanimity',
    subtitle: 'Tier 2 Emotional Balance',
    description: '+10 Mindfulness and +8 Discipline attribute boost.',
    tier: 2,
    cost: 2,
    requiresNodeId: 'monk_t1_2',
    icon: 'Sun',
    emoji: '☯️',
    statsEffect: { attributeFlatBonus: { attr: 'Mindfulness', val: 10 } },
  },
  {
    id: 'monk_t3_capstone',
    branch: 'monk',
    title: 'Transcendent Harmony',
    subtitle: 'Tier 3 Master Capstone',
    description: 'Boosts all Life Attributes by +10 and grants +20% global XP.',
    tier: 3,
    cost: 3,
    requiresNodeId: 'monk_t2_1',
    icon: 'Globe',
    emoji: '🌸',
    statsEffect: { xpMultiplier: 1.2, attributeFlatBonus: { attr: 'Mindfulness', val: 20 } },
  },

  // ================= 🎨 ROGUE / BARD BRANCH =================
  {
    id: 'rogue_t1_1',
    branch: 'rogue',
    title: 'Lucky Gambler',
    subtitle: 'Tier 1 Fortune Spark',
    description: '+15% higher chance to roll Loot Drops on every completed habit.',
    tier: 1,
    cost: 1,
    icon: 'Coins',
    emoji: '🎲',
    statsEffect: { lootLuckBonus: 15 },
  },
  {
    id: 'rogue_t1_2',
    branch: 'rogue',
    title: 'Silver Tongue',
    subtitle: 'Tier 1 Social & Finance',
    description: '+6 Social and +6 Finance attribute boost permanently.',
    tier: 1,
    cost: 1,
    icon: 'Users',
    emoji: '🤝',
    statsEffect: { attributeFlatBonus: { attr: 'Social', val: 6 } },
  },
  {
    id: 'rogue_t2_1',
    branch: 'rogue',
    title: 'Midas Spark',
    subtitle: 'Tier 2 Fortune Transmutation',
    description: '+25% chance to roll Epic/Legendary loot & +15% XP on Finance quests.',
    tier: 2,
    cost: 2,
    requiresNodeId: 'rogue_t1_1',
    icon: 'Gem',
    emoji: '💎',
    statsEffect: { lootLuckBonus: 25, categoryBoost: { category: 'Finance', boostPercent: 15 } },
  },
  {
    id: 'rogue_t2_2',
    branch: 'rogue',
    title: 'Muse’s Whisper',
    subtitle: 'Tier 2 Creative Flow',
    description: '+10 Creativity and +8 Mind attribute boost.',
    tier: 2,
    cost: 2,
    requiresNodeId: 'rogue_t1_2',
    icon: 'Feather',
    emoji: '🎨',
    statsEffect: { attributeFlatBonus: { attr: 'Creativity', val: 10 } },
  },
  {
    id: 'rogue_t3_capstone',
    branch: 'rogue',
    title: 'Grand Alchemist of Destiny',
    subtitle: 'Tier 3 Master Capstone',
    description: '+50% Loot Drop Luck, unlocks Mythic drops, +20% global XP.',
    tier: 3,
    cost: 3,
    requiresNodeId: 'rogue_t2_1',
    icon: 'Crown',
    emoji: '🌟',
    statsEffect: { lootLuckBonus: 50, xpMultiplier: 1.2 },
  },
];

/**
 * Calculates user's available skill points based on level and milestones.
 */
export const calculateTotalSkillPoints = (user: UserProfile): number => {
  // 1 SP per level above 1, plus bonus 1 SP every 5 levels, plus 1 SP per 3 S-Rank days
  const levelPoints = Math.max(0, user.level - 1);
  const milestoneBonus = Math.floor(user.level / 5);
  const perfectDayBonus = Math.floor((user.perfectDaysCount || 0) / 3);
  return levelPoints + milestoneBonus + perfectDayBonus;
};

/**
 * Computes all active passive bonuses from unlocked skill tree nodes.
 */
export const calculateSkillTreeBonuses = (state?: UserSkillTreeState) => {
  const bonuses = {
    xpMultiplier: 1.0,
    morningBonusPercent: 0,
    eveningBonusPercent: 0,
    lootLuckBonus: 0,
    streakRecoveryBonus: false,
    categoryBoosts: {} as Record<string, number>,
    attributeFlatBonus: {
      Strength: 0,
      Health: 0,
      Mind: 0,
      Focus: 0,
      Discipline: 0,
      Mindfulness: 0,
      Creativity: 0,
      Social: 0,
      Finance: 0,
    },
  };

  if (!state || !state.unlockedNodeIds) return bonuses;

  state.unlockedNodeIds.forEach((nodeId) => {
    const node = MASTER_SKILL_NODES.find((n) => n.id === nodeId);
    if (!node) return;

    if (node.statsEffect.xpMultiplier) {
      bonuses.xpMultiplier *= node.statsEffect.xpMultiplier;
    }
    if (node.statsEffect.morningBonusPercent) {
      bonuses.morningBonusPercent += node.statsEffect.morningBonusPercent;
    }
    if (node.statsEffect.eveningBonusPercent) {
      bonuses.eveningBonusPercent += node.statsEffect.eveningBonusPercent;
    }
    if (node.statsEffect.lootLuckBonus) {
      bonuses.lootLuckBonus += node.statsEffect.lootLuckBonus;
    }
    if (node.statsEffect.streakRecoveryBonus) {
      bonuses.streakRecoveryBonus = true;
    }
    if (node.statsEffect.categoryBoost) {
      const cat = node.statsEffect.categoryBoost.category;
      bonuses.categoryBoosts[cat] = (bonuses.categoryBoosts[cat] || 0) + node.statsEffect.categoryBoost.boostPercent;
    }
    if (node.statsEffect.attributeFlatBonus) {
      const attr = node.statsEffect.attributeFlatBonus.attr;
      bonuses.attributeFlatBonus[attr] += node.statsEffect.attributeFlatBonus.val;
    }
  });

  return bonuses;
};
