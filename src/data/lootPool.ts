import { LootItem, LootRarity, LootSlotType, Habit, UserProfile } from '../types';
import { generateId } from '../utils/gamification';

export interface RarityConfig {
  rarity: LootRarity;
  name: string;
  color: string;
  bgGradient: string;
  border: string;
  glow: string;
  weight: number; // For drop calculation
}

export const RARITY_CONFIGS: Record<LootRarity, RarityConfig> = {
  common: {
    rarity: 'common',
    name: 'COMMON',
    color: 'text-slate-300',
    bgGradient: 'from-slate-900 to-slate-800',
    border: 'border-slate-500',
    glow: 'shadow-[0_0_8px_rgba(148,163,184,0.3)]',
    weight: 42,
  },
  uncommon: {
    rarity: 'uncommon',
    name: 'UNCOMMON',
    color: 'text-emerald-400',
    bgGradient: 'from-emerald-950 to-slate-900',
    border: 'border-emerald-500',
    glow: 'shadow-[0_0_10px_rgba(16,185,129,0.4)]',
    weight: 27,
  },
  rare: {
    rarity: 'rare',
    name: 'RARE',
    color: 'text-cyan-400',
    bgGradient: 'from-cyan-950 to-slate-900',
    border: 'border-cyan-400',
    glow: 'shadow-[0_0_12px_rgba(34,211,238,0.5)]',
    weight: 15,
  },
  epic: {
    rarity: 'epic',
    name: 'EPIC',
    color: 'text-purple-400',
    bgGradient: 'from-purple-950 to-slate-900',
    border: 'border-purple-400',
    glow: 'shadow-[0_0_14px_rgba(192,132,252,0.6)]',
    weight: 9,
  },
  legendary: {
    rarity: 'legendary',
    name: 'LEGENDARY',
    color: 'text-amber-400',
    bgGradient: 'from-amber-950 to-yellow-950',
    border: 'border-amber-400',
    glow: 'shadow-[0_0_18px_rgba(251,191,36,0.8)]',
    weight: 4.5,
  },
  mythic: {
    rarity: 'mythic',
    name: 'MYTHIC',
    color: 'text-rose-400',
    bgGradient: 'from-rose-950 to-red-950',
    border: 'border-rose-500',
    glow: 'shadow-[0_0_22px_rgba(244,63,94,0.9)]',
    weight: 2.0,
  },
  artifact: {
    rarity: 'artifact',
    name: 'PRISMATIC ARTIFACT',
    color: 'text-fuchsia-300',
    bgGradient: 'from-fuchsia-950 via-indigo-950 to-cyan-950',
    border: 'border-fuchsia-400',
    glow: 'shadow-[0_0_26px_rgba(232,121,249,1)]',
    weight: 0.5,
  },
};

export const MASTER_LOOT_CATALOG: Omit<LootItem, 'id' | 'obtainedAt' | 'isEquipped'>[] = [
  // ================= COMMON =================
  {
    name: 'Wooden Practice Blade',
    subtitle: 'Beginner Focus Tool',
    description: '+5% XP for Fitness and Morning habits.',
    flavorText: 'Carved from sturdy cedar. Every grand mastery starts with basic repetitions.',
    rarity: 'common',
    slot: 'weapon',
    icon: 'Sword',
    emoji: '🗡️',
    stats: { xpBonusPercent: 5, strengthBoost: 3 },
  },
  {
    name: 'Woven Linen Tunic',
    subtitle: 'Novice Apparel',
    description: '+2 Health boost and subtle discipline resilience.',
    flavorText: 'Simple, unadorned cloth that absorbs sweat during grueling morning routines.',
    rarity: 'common',
    slot: 'armor',
    icon: 'Shield',
    emoji: '🥋',
    stats: { healthBoost: 3, disciplineBoost: 2 },
  },
  {
    name: 'Copper Coin of Luck',
    subtitle: 'Pocket Charm',
    description: '+5% higher chance to trigger item drops on task completions.',
    flavorText: 'An old coin polished smooth by daily habit consistency.',
    rarity: 'common',
    slot: 'charm',
    icon: 'Coins',
    emoji: '🪙',
    stats: { luckBonusPercent: 5 },
  },
  {
    name: 'Dull Brass Monocle',
    subtitle: 'Student Eyeglass',
    description: '+4 Mind boost for reading and study quests.',
    flavorText: 'Slightly scratched lens, yet sharp enough to lock into a 25-minute study sprint.',
    rarity: 'common',
    slot: 'relic',
    icon: 'Eye',
    emoji: '🧐',
    stats: { mindBoost: 4 },
  },

  // ================= UNCOMMON =================
  {
    name: 'Iron Kettlebell Mace',
    subtitle: 'Heavy Habit Smasher',
    description: '+8% XP on all Hard/Extreme workouts + 5 Strength boost.',
    flavorText: 'Cast in heavy molten iron. Weighted specifically to shatter morning lethargy.',
    rarity: 'uncommon',
    slot: 'weapon',
    icon: 'Dumbbell',
    emoji: '🏋️',
    stats: { xpBonusPercent: 8, strengthBoost: 5 },
  },
  {
    name: 'Runed Leather Bracers',
    subtitle: 'Disciplined Wristguards',
    description: '+6 Discipline and +5% XP on evening habits.',
    flavorText: 'Embossed with retro runic inscriptions: "No excuses, just execution."',
    rarity: 'uncommon',
    slot: 'armor',
    icon: 'Sparkles',
    emoji: '🛡️',
    stats: { disciplineBoost: 6, xpBonusPercent: 5 },
  },
  {
    name: 'Silver Clover Leaf',
    subtitle: 'Fortuitous Charm',
    description: '+10% Loot drop chance & +5% Critical XP roll.',
    flavorText: 'Pressed inside an ancient strategy manual. Radiates gentle good fortune.',
    rarity: 'uncommon',
    slot: 'charm',
    icon: 'Sparkles',
    emoji: '🍀',
    stats: { luckBonusPercent: 10, critXpChance: 5 },
  },
  {
    name: 'Quill of Diligence',
    subtitle: 'Scholar Inscription Tool',
    description: '+6 Mind and +6 Focus boosts on writing & deep work habits.',
    flavorText: 'Never runs dry as long as your daily momentum remains unbroken.',
    rarity: 'uncommon',
    slot: 'relic',
    icon: 'Feather',
    emoji: '🪶',
    stats: { mindBoost: 6, focusBoost: 6 },
  },

  // ================= RARE =================
  {
    name: 'Blade of the Early Dawn',
    subtitle: 'Morning Vanguard Weapon',
    description: '+15% bonus XP for any quest checked off before 10:00 AM.',
    flavorText: 'Gleams with the first radiant ray of morning sunshine. Slays procrastination on contact.',
    rarity: 'rare',
    slot: 'weapon',
    icon: 'Sun',
    emoji: '🌅',
    stats: { xpBonusPercent: 12, focusBoost: 8 },
  },
  {
    name: 'Titanmail Hauberk',
    subtitle: 'Armor of Consistency',
    description: '+10 Health, +8 Discipline, and 10% chance to shield streak on missed days.',
    flavorText: 'Interlocked steel rings forged under intense discipline heat.',
    rarity: 'rare',
    slot: 'armor',
    icon: 'ShieldCheck',
    emoji: '🦾',
    stats: { healthBoost: 10, disciplineBoost: 8, streakShieldChance: 10 },
  },
  {
    name: 'Sapphire Hourglass of Chronos',
    subtitle: 'Time Anchor Relic',
    description: '+15% XP on duration/focus tasks + 8 Focus boost.',
    flavorText: 'Glowing azure sand inside falls at a steady, uninterrupted flow-state pace.',
    rarity: 'rare',
    slot: 'relic',
    icon: 'Hourglass',
    emoji: '⏳',
    stats: { xpBonusPercent: 15, focusBoost: 8 },
  },
  {
    name: 'Emerald Dragon Scale',
    subtitle: 'Vitality Charm',
    description: '+1 extra Streak Freeze maximum capacity.',
    flavorText: 'Pulsing with natural dragon vitality. Stores an extra reservoir of emergency recovery.',
    rarity: 'rare',
    slot: 'charm',
    icon: 'Gem',
    emoji: '🐲',
    stats: { freezeSlotsBonus: 1, luckBonusPercent: 8 },
  },

  // ================= EPIC =================
  {
    name: 'Aegis of the Iron Will',
    subtitle: 'Legendary Paladin Plate',
    description: '+20% Streak XP multiplier bonus + 15 Discipline boost.',
    flavorText: 'An unbreakable chestplate that radiates an aura of stoic determination.',
    rarity: 'epic',
    slot: 'armor',
    icon: 'Shield',
    emoji: '🛡️',
    stats: { xpBonusPercent: 18, disciplineBoost: 15, streakShieldChance: 20 },
  },
  {
    name: 'Staff of Arcane Focus',
    subtitle: 'High Mage Focus Conduit',
    description: '+12 Mind, +12 Focus, and +15% Critical 2x XP roll chance.',
    flavorText: 'A crystal-topped retro staff that aligns neural frequencies for pure flow state.',
    rarity: 'epic',
    slot: 'weapon',
    icon: 'Zap',
    emoji: '🔮',
    stats: { mindBoost: 12, focusBoost: 12, critXpChance: 15 },
  },
  {
    name: 'Phoenix Feather Talisman',
    subtitle: 'Rebirth Trinket',
    description: 'Auto-saves your combo streak if broken, +15% Loot Luck.',
    flavorText: 'Warm to the touch with everlasting flame. Even from ashes, habits rise renewed.',
    rarity: 'epic',
    slot: 'charm',
    icon: 'Flame',
    emoji: '🔥',
    stats: { streakShieldChance: 30, luckBonusPercent: 15 },
  },
  {
    name: 'Scroll of Seven Disciplines',
    subtitle: 'Mastery Codex',
    description: '+5 to ALL 9 Life Attributes simultaneously.',
    flavorText: 'Contains the distilled wisdom of 1,000 days of uninterrupted daily routines.',
    rarity: 'epic',
    slot: 'relic',
    icon: 'BookOpen',
    emoji: '📜',
    stats: {
      strengthBoost: 5,
      healthBoost: 5,
      mindBoost: 5,
      focusBoost: 5,
      disciplineBoost: 5,
      mindfulnessBoost: 5,
      creativityBoost: 5,
      socialBoost: 5,
      financeBoost: 5,
    },
  },

  // ================= LEGENDARY =================
  {
    name: 'Excalibur of Daily Mastery',
    subtitle: 'Hero Sovereign Weapon',
    description: '+25% XP on ALL quests + 15 Strength + 15 Focus.',
    flavorText: 'Pulled from the stone of hesitation. Wielded only by those who execute daily without failure.',
    rarity: 'legendary',
    slot: 'weapon',
    icon: 'Sword',
    emoji: '👑',
    stats: { xpBonusPercent: 25, strengthBoost: 15, focusBoost: 15, critXpChance: 20 },
  },
  {
    name: 'Celestial Mantle of the Grandmaster',
    subtitle: 'Divine Robe',
    description: '+20 Health, +20 Discipline, +25% streak protection.',
    flavorText: 'Woven with cosmic starlight. Protects the hero from mental fatigue and setbacks.',
    rarity: 'legendary',
    slot: 'armor',
    icon: 'Sparkles',
    emoji: '✨',
    stats: { healthBoost: 20, disciplineBoost: 20, streakShieldChance: 25, freezeSlotsBonus: 1 },
  },
  {
    name: 'Eye of the Void Dragon',
    subtitle: 'Transcendent Monocle',
    description: '+25% XP bonus & +25% Loot Drop Luck.',
    flavorText: 'Sees through all excuses. Pierces the fog of distraction with hyper-clarity.',
    rarity: 'legendary',
    slot: 'relic',
    icon: 'Eye',
    emoji: '👁️',
    stats: { xpBonusPercent: 25, luckBonusPercent: 25, mindBoost: 18 },
  },
  {
    name: 'Orb of Eternal Momentum',
    subtitle: 'Relic of Perpetuity',
    description: '+30% bonus combo multiplier & 2x XP chance.',
    flavorText: 'Spins forever without loss of friction. The embodiment of continuous compounding growth.',
    rarity: 'legendary',
    slot: 'charm',
    icon: 'Globe',
    emoji: '🪐',
    stats: { xpBonusPercent: 20, critXpChance: 25, luckBonusPercent: 20 },
  },

  // ================= MYTHIC =================
  {
    name: 'Infinity Gauntlet of Willpower',
    subtitle: 'Reality-Bending Handpiece',
    description: '+35% XP on ALL quests, +20 to Strength, Discipline & Focus.',
    flavorText: 'Snapped into existence when all 5 core virtues are aligned in harmony.',
    rarity: 'mythic',
    slot: 'weapon',
    icon: 'Hand',
    emoji: '🥊',
    stats: { xpBonusPercent: 35, strengthBoost: 20, disciplineBoost: 20, focusBoost: 20, critXpChance: 30 },
  },
  {
    name: 'Armor of the Chronomancer Lord',
    subtitle: 'Time Sovereign Armor',
    description: '+25 Discipline, +2 extra Streak Freezes, +40% Streak Shield.',
    flavorText: 'Bend the passage of time itself to ensure no daily goal is ever left uncompleted.',
    rarity: 'mythic',
    slot: 'armor',
    icon: 'Shield',
    emoji: '⏳',
    stats: { disciplineBoost: 25, freezeSlotsBonus: 2, streakShieldChance: 40, healthBoost: 20 },
  },
  {
    name: 'Philosopher’s Golden Catalyst',
    subtitle: 'Alchemical Heart',
    description: 'Transmutes every habit completion into +50% XP & +35% Drop Chance.',
    flavorText: 'Converts base effort into pure spiritual gold and character transcendence.',
    rarity: 'mythic',
    slot: 'charm',
    icon: 'Crown',
    emoji: '🌟',
    stats: { xpBonusPercent: 40, luckBonusPercent: 35, critXpChance: 35 },
  },

  // ================= PRISMATIC ARTIFACT =================
  {
    name: 'The Primordial Cartridge of Buffr',
    subtitle: 'God-Tier Sovereign Artifact',
    description: '+50% XP globally, +25 to ALL Attributes, +50% Loot Luck, Infinite Momentum.',
    flavorText: 'The legendary golden retro cartridge containing the master game code of human potential.',
    rarity: 'artifact',
    slot: 'relic',
    icon: 'Trophy',
    emoji: '🌈',
    stats: {
      xpBonusPercent: 50,
      luckBonusPercent: 50,
      critXpChance: 40,
      strengthBoost: 25,
      healthBoost: 25,
      mindBoost: 25,
      focusBoost: 25,
      disciplineBoost: 25,
      mindfulnessBoost: 25,
      creativityBoost: 25,
      socialBoost: 25,
      financeBoost: 25,
      freezeSlotsBonus: 2,
      streakShieldChance: 50,
    },
  },
];

/**
 * Calculates whether a habit completion produces an unpredictable loot drop.
 * Base chance ~35%, boosted by difficulty, combo streak, equipped luck charms, and S-Rank days.
 */
export const rollForLootDrop = (
  habit: Habit,
  user: UserProfile,
  isPerfectDay: boolean = false
): LootItem | null => {
  // Base chance: 32%
  let dropChance = 32;

  // Difficulty bonus
  if (habit.difficulty === 'extreme') dropChance += 28;
  else if (habit.difficulty === 'hard') dropChance += 16;
  else if (habit.difficulty === 'medium') dropChance += 8;

  // Streak bonus
  if (user.currentStreak >= 30) dropChance += 12;
  else if (user.currentStreak >= 7) dropChance += 6;

  // Perfect day bonus
  if (isPerfectDay) dropChance += 25;

  // Equipped gear luck bonus
  const equippedCharm = user.equippedGear?.charm;
  if (equippedCharm?.stats.luckBonusPercent) {
    dropChance += equippedCharm.stats.luckBonusPercent;
  }
  const equippedRelic = user.equippedGear?.relic;
  if (equippedRelic?.stats.luckBonusPercent) {
    dropChance += equippedRelic.stats.luckBonusPercent;
  }

  // Roll 0 - 100
  const roll = Math.random() * 100;
  if (roll > dropChance) {
    return null; // No drop this time
  }

  // Determine Rarity
  // Rarity weights with luck modifiers
  const luckBonus = (equippedCharm?.stats.luckBonusPercent || 0) + (equippedRelic?.stats.luckBonusPercent || 0);

  const rarityWeights: { rarity: LootRarity; weight: number }[] = [
    { rarity: 'artifact', weight: 0.5 + luckBonus * 0.05 },
    { rarity: 'mythic', weight: 2.0 + luckBonus * 0.1 },
    { rarity: 'legendary', weight: 4.5 + luckBonus * 0.15 },
    { rarity: 'epic', weight: 9.0 + luckBonus * 0.2 },
    { rarity: 'rare', weight: 16.0 },
    { rarity: 'uncommon', weight: 28.0 },
    { rarity: 'common', weight: 40.0 },
  ];

  const totalWeight = rarityWeights.reduce((sum, r) => sum + r.weight, 0);
  let randomWeight = Math.random() * totalWeight;

  let selectedRarity: LootRarity = 'common';
  for (const rw of rarityWeights) {
    if (randomWeight <= rw.weight) {
      selectedRarity = rw.rarity;
      break;
    }
    randomWeight -= rw.weight;
  }

  // Filter master catalog by rarity
  const pool = MASTER_LOOT_CATALOG.filter((item) => item.rarity === selectedRarity);
  const selectedTemplate = pool.length > 0
    ? pool[Math.floor(Math.random() * pool.length)]
    : MASTER_LOOT_CATALOG[0];

  const newItem: LootItem = {
    ...selectedTemplate,
    id: generateId('loot'),
    isEquipped: false,
    obtainedAt: new Date().toISOString(),
  };

  return newItem;
};

/**
 * Calculates aggregated stat buffs from all equipped gear.
 */
export const calculateEquippedBuffs = (gear?: UserProfile['equippedGear']) => {
  const buffs = {
    xpBonusPercent: 0,
    luckBonusPercent: 0,
    critXpChance: 0,
    freezeSlotsBonus: 0,
    streakShieldChance: 0,
    attributeBoosts: {
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

  if (!gear) return buffs;

  const equippedItems = [gear.weapon, gear.armor, gear.relic, gear.charm].filter(Boolean) as LootItem[];

  equippedItems.forEach((item) => {
    if (item.stats.xpBonusPercent) buffs.xpBonusPercent += item.stats.xpBonusPercent;
    if (item.stats.luckBonusPercent) buffs.luckBonusPercent += item.stats.luckBonusPercent;
    if (item.stats.critXpChance) buffs.critXpChance += item.stats.critXpChance;
    if (item.stats.freezeSlotsBonus) buffs.freezeSlotsBonus += item.stats.freezeSlotsBonus;
    if (item.stats.streakShieldChance) buffs.streakShieldChance += item.stats.streakShieldChance;

    if (item.stats.strengthBoost) buffs.attributeBoosts.Strength += item.stats.strengthBoost;
    if (item.stats.healthBoost) buffs.attributeBoosts.Health += item.stats.healthBoost;
    if (item.stats.mindBoost) buffs.attributeBoosts.Mind += item.stats.mindBoost;
    if (item.stats.focusBoost) buffs.attributeBoosts.Focus += item.stats.focusBoost;
    if (item.stats.disciplineBoost) buffs.attributeBoosts.Discipline += item.stats.disciplineBoost;
    if (item.stats.mindfulnessBoost) buffs.attributeBoosts.Mindfulness += item.stats.mindfulnessBoost;
    if (item.stats.creativityBoost) buffs.attributeBoosts.Creativity += item.stats.creativityBoost;
    if (item.stats.socialBoost) buffs.attributeBoosts.Social += item.stats.socialBoost;
    if (item.stats.financeBoost) buffs.attributeBoosts.Finance += item.stats.financeBoost;
  });

  return buffs;
};
