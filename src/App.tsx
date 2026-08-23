import React, { useState, useEffect } from 'react';
import {
  Habit,
  HabitCompletion,
  UserProfile,
  Challenge,
  Quest,
  Achievement,
  XPTransaction,
  DailyReflection,
  LootItem,
  LootSlotType,
  UserSkillTreeState,
  RoutineChain,
} from './types';
import { BuffrStorage } from './storage/db';
import { BuffrHeader } from './components/common/BuffrHeader';
import { BuffrBottomNav } from './components/common/BuffrBottomNav';
import { AndroidFrame } from './components/layout/AndroidFrame';

// Views
import { TodayView } from './components/views/TodayView';
import { CalendarView } from './components/views/CalendarView';
import { ProgressView } from './components/views/ProgressView';
import { ChallengesView } from './components/views/ChallengesView';
import { ProfileView } from './components/views/ProfileView';

// Modals
import { HabitFormModal } from './components/modals/HabitFormModal';
import { HabitDetailModal } from './components/modals/HabitDetailModal';
import { LevelUpModal } from './components/modals/LevelUpModal';
import { PerfectDayModal } from './components/modals/PerfectDayModal';
import { DailyReflectionModal } from './components/modals/DailyReflectionModal';
import { WeeklyReviewModal } from './components/modals/WeeklyReviewModal';
import { OnboardingModal } from './components/modals/OnboardingModal';
import { LootDropModal } from './components/modals/LootDropModal';
import { RetroCartridgeModal } from './components/modals/RetroCartridgeModal';

// Utils & RPG Engines
import {
  calculateDailyScore,
  calculateLevelFromTotalXp,
  calculateOverallStreak,
  checkAchievementsUnlock,
  generateId,
  calculateHabitStreak,
  DIFFICULTY_BASE_XP,
} from './utils/gamification';
import { getTodayStr } from './utils/dateUtils';
import { BuffrWidgetBridge } from './utils/widgetBridge';
import {
  playCompletionSound,
  playStreakSound,
  playLevelUpSound,
  playCelebrationSound,
  triggerHapticPulse,
  playSound,
} from './utils/sound';
import { HabitTemplate, createFreshDataset } from './data/initialData';
import { useAuth } from './firebase/AuthContext';
import { FirestoreSyncService } from './firebase/firestoreService';
import { rollForLootDrop, calculateEquippedBuffs } from './data/lootPool';
import { calculateSkillTreeBonuses } from './data/skillTreeData';

export default function App() {
  const { currentUser } = useAuth();

  // App state
  const [activeTab, setActiveTab] = useState<'today' | 'calendar' | 'progress' | 'challenges' | 'profile'>('today');
  const [isDeviceFrameEnabled, setIsDeviceFrameEnabled] = useState(false);

  // Core Data
  const [user, setUser] = useState<UserProfile>(() => BuffrStorage.getUser());
  const [habits, setHabits] = useState<Habit[]>(() => BuffrStorage.getHabits());
  const [completions, setCompletions] = useState<HabitCompletion[]>(() => BuffrStorage.getCompletions());
  const [challenges, setChallenges] = useState<Challenge[]>(() => BuffrStorage.getChallenges());
  const [quests, setQuests] = useState<Quest[]>(() => BuffrStorage.getQuests());
  const [achievements, setAchievements] = useState<Achievement[]>(() => BuffrStorage.getAchievements());
  const [xpTransactions, setXpTransactions] = useState<XPTransaction[]>(() => BuffrStorage.getXpTransactions());
  const [reflections, setReflections] = useState<DailyReflection[]>(() => BuffrStorage.getReflections());
  const [routineChains, setRoutineChains] = useState<RoutineChain[]>(() => BuffrStorage.getRoutineChains());

  // RPG & Loot Modals State
  const [pendingLootItem, setPendingLootItem] = useState<LootItem | null>(null);
  const [isLootDropModalOpen, setIsLootDropModalOpen] = useState(false);
  const [isRetroCartridgeOpen, setIsRetroCartridgeOpen] = useState(false);

  // Sync with Android Home Screen Widget whenever relevant state changes
  useEffect(() => {
    BuffrWidgetBridge.sync();
  }, [user, habits, completions]);

  // Real-time Cloud Firestore Subscription
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = FirestoreSyncService.subscribeToUserData(currentUser.uid, (cloudData) => {
      if (cloudData.user) {
        setUser((prev) => {
          const merged = { ...prev, ...cloudData.user };
          BuffrStorage.saveUser(merged);
          return merged;
        });
      }
      if (cloudData.habits && cloudData.habits.length > 0) {
        setHabits(cloudData.habits);
        BuffrStorage.saveHabits(cloudData.habits);
      }
      if (cloudData.completions && cloudData.completions.length > 0) {
        setCompletions(cloudData.completions);
        BuffrStorage.saveCompletions(cloudData.completions);
      }
      if (cloudData.reflections && cloudData.reflections.length > 0) {
        setReflections(cloudData.reflections);
        BuffrStorage.saveReflections(cloudData.reflections);
      }
      if (cloudData.routineChains && cloudData.routineChains.length > 0) {
        setRoutineChains(cloudData.routineChains);
        BuffrStorage.saveRoutineChains(cloudData.routineChains);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);


  // Modals state
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => !BuffrStorage.hasCompletedOnboarding());
  const [isHabitFormOpen, setIsHabitFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const [isHabitDetailOpen, setIsHabitDetailOpen] = useState(false);
  const [selectedHabitForDetail, setSelectedHabitForDetail] = useState<Habit | null>(null);

  const [isLevelUpModalOpen, setIsLevelUpModalOpen] = useState(false);
  const [levelUpNewLevel, setLevelUpNewLevel] = useState(1);
  const [levelUpTitleUnlocked, setLevelUpTitleUnlocked] = useState<string | undefined>(undefined);

  const [isPerfectDayModalOpen, setIsPerfectDayModalOpen] = useState(false);
  const [isDailyReflectionOpen, setIsDailyReflectionOpen] = useState(false);
  const [isWeeklyReviewOpen, setIsWeeklyReviewOpen] = useState(false);

  // Sync state helpers
  const refreshAllState = () => {
    setUser(BuffrStorage.getUser());
    setHabits(BuffrStorage.getHabits());
    setCompletions(BuffrStorage.getCompletions());
    setChallenges(BuffrStorage.getChallenges());
    setQuests(BuffrStorage.getQuests());
    setAchievements(BuffrStorage.getAchievements());
    setXpTransactions(BuffrStorage.getXpTransactions());
    setReflections(BuffrStorage.getReflections());
    setRoutineChains(BuffrStorage.getRoutineChains());
  };

  // User state updates
  const handleUpdateUser = (updated: Partial<UserProfile>) => {
    const nextUser = { ...user, ...updated };
    setUser(nextUser);
    BuffrStorage.saveUser(nextUser);
    if (currentUser) {
      FirestoreSyncService.saveUser(currentUser.uid, nextUser);
    }
  };


  // Onboarding completion
  const handleFinishOnboarding = (selectedHabits: HabitTemplate[], userName: string, avatarEmoji?: string) => {
    const newHabits: Habit[] = selectedHabits.map((tpl) => ({
      id: generateId('habit'),
      title: tpl.title,
      description: tpl.description,
      category: tpl.category,
      timeOfDay: tpl.timeOfDay,
      color: tpl.color,
      emoji: tpl.emoji,
      icon: tpl.icon || 'Sparkles',
      difficulty: tpl.difficulty || 'medium',
      xpReward: tpl.xpReward || DIFFICULTY_BASE_XP[tpl.difficulty || 'medium'] || 20,
      habitType: tpl.habitType,
      targetValue: tpl.targetValue,
      unit: tpl.unit,
      frequencyType: 'daily',
      frequencyDays: [0, 1, 2, 3, 4, 5, 6],
      frequency: { type: 'daily' },
      attributeBoosts: tpl.attributeBoosts || {},
      isArchived: false,
      isPaused: false,
      createdAt: new Date().toISOString(),
    }));

    const initialUser: UserProfile = {
      ...user,
      name: userName,
      avatarEmoji: avatarEmoji || user.avatarEmoji || '👾',
      level: 1,
      totalXp: 0,
      currentStreak: 1,
      streakFreezesRemaining: 2,
      currentTitle: 'Starter',
      soundEnabled: true,
      hapticsEnabled: true,
    };

    BuffrStorage.saveUser(initialUser);
    BuffrStorage.saveHabits(newHabits);
    BuffrStorage.setOnboardingCompleted(true);

    setUser(initialUser);
    setHabits(newHabits);
    setIsOnboardingOpen(false);
    playCelebrationSound();
  };

  const handleExploreDemo = () => {
    BuffrStorage.resetToDemoData();
    BuffrStorage.setOnboardingCompleted(true);
    refreshAllState();
    setIsOnboardingOpen(false);
  };

  const handleResetFresh = () => {
    BuffrStorage.resetToFresh();
    refreshAllState();
    if (currentUser) {
      FirestoreSyncService.pushAllToCloud(currentUser.uid);
    }
    setActiveTab('today');
    setIsOnboardingOpen(true);
  };

  // Habit Toggle / Completion Progression Engine (Supports retroactive date logging for yesterday/past days)
  const handleToggleHabit = (habitId: string, targetDateStr?: string) => {
    const activeDateStr = targetDateStr || getTodayStr();
    const isPastDate = activeDateStr !== getTodayStr();
    const targetHabit = habits.find((h) => h.id === habitId);
    if (!targetHabit) return;

    const existingComp = completions.find(
      (c) => c.habitId === habitId && c.dateStr === activeDateStr
    );

    const willBeCompleted = existingComp ? !existingComp.isCompleted : true;
    const progressVal = willBeCompleted ? targetHabit.targetValue : 0;

    const updatedComp: HabitCompletion = {
      id: existingComp ? existingComp.id : generateId('comp'),
      habitId,
      dateStr: activeDateStr,
      isCompleted: willBeCompleted,
      progressValue: progressVal,
      completedAt: willBeCompleted ? new Date().toISOString() : undefined,
    };

    BuffrStorage.saveCompletion(updatedComp);

    // Calculate XP delta & RPG Bonuses
    let nextTotalXp = user.totalXp;
    let droppedLoot: LootItem | null = null;
    let isCrit = false;

    if (willBeCompleted) {
      // Habit streak bonus
      const streakInfo = calculateHabitStreak(targetHabit, completions);
      const streakBonus = Math.min(15, streakInfo.currentStreak * 2);

      // Gear & Skill tree buffs
      const gearBuffs = calculateEquippedBuffs(user.equippedGear);
      const skillBonuses = calculateSkillTreeBonuses(user.skillTree);

      let earnedXp = targetHabit.xpReward + streakBonus;

      // Gear bonus %
      if (gearBuffs.xpBonusPercent > 0) {
        earnedXp += Math.round(targetHabit.xpReward * (gearBuffs.xpBonusPercent / 100));
      }

      // Skill Tree Multiplier
      earnedXp = Math.round(earnedXp * skillBonuses.xpMultiplier);

      // Morning / Evening Boosts
      const currentHour = new Date().getHours();
      if (currentHour < 10 && skillBonuses.morningBonusPercent > 0) {
        earnedXp += Math.round(targetHabit.xpReward * (skillBonuses.morningBonusPercent / 100));
      } else if (currentHour >= 20 && skillBonuses.eveningBonusPercent > 0) {
        earnedXp += Math.round(targetHabit.xpReward * (skillBonuses.eveningBonusPercent / 100));
      }

      // Critical XP roll
      if (Math.random() * 100 < (gearBuffs.critXpChance || 0)) {
        isCrit = true;
        earnedXp *= 2;
      }

      nextTotalXp += earnedXp;

      const tx: XPTransaction = {
        id: generateId('tx'),
        amount: earnedXp,
        reason: isCrit
          ? `⚡ CRITICAL HIT 2x XP! ${targetHabit.title}`
          : isPastDate
          ? `Backfilled: ${targetHabit.title} (${activeDateStr})`
          : `Completed: ${targetHabit.title} ${streakBonus > 0 ? `(+${streakBonus} Streak Bonus)` : ''}`,
        timestamp: new Date().toISOString(),
        habitId,
      };
      BuffrStorage.saveXPTransaction(tx);

      // Sound and haptics
      if (streakInfo.currentStreak > 3) {
        playStreakSound();
      } else {
        playCompletionSound();
      }
      triggerHapticPulse('medium');
    } else {
      nextTotalXp = Math.max(0, nextTotalXp - targetHabit.xpReward);
      triggerHapticPulse('light');
    }

    // Refresh completions & txs in state
    const nextCompletions = BuffrStorage.getCompletions();
    setCompletions(nextCompletions);
    setXpTransactions(BuffrStorage.getXpTransactions());

    // Check Mini Combo Routine Chains bonus XP
    if (willBeCompleted) {
      const activeChains = routineChains.filter(
        (rc) => !rc.isArchived && rc.habitIds.includes(habitId)
      );

      for (const chain of activeChains) {
        const otherHabitsDone = chain.habitIds
          .filter((hid) => hid !== habitId)
          .every((hid) =>
            nextCompletions.some(
              (c) => c.habitId === hid && c.dateStr === activeDateStr && c.isCompleted
            )
          );

        // If this completing habit was the final step of the chain:
        if (otherHabitsDone) {
          nextTotalXp += chain.comboBonusXp;
          const comboTx: XPTransaction = {
            id: generateId('tx'),
            amount: chain.comboBonusXp,
            reason: `⚡ Mini Combo Clear: ${chain.title} (+${chain.comboBonusXp} XP Combo Multiplier)`,
            timestamp: new Date().toISOString(),
          };
          BuffrStorage.saveXPTransaction(comboTx);
          setXpTransactions(BuffrStorage.getXpTransactions());
          playSound('powerup');
          triggerHapticPulse('heavy');
        }
      }
    }

    // Calculate comprehensive streak & perfect days metrics
    const streakStats = calculateOverallStreak(habits, nextCompletions);

    // Check Perfect Day 100% Score
    let isPerfectDayNow = false;
    if (willBeCompleted) {
      const dayStats = calculateDailyScore(habits, nextCompletions, activeDateStr);
      if (dayStats.score === 100 && dayStats.scheduledCount > 0) {
        isPerfectDayNow = true;
        setIsPerfectDayModalOpen(true);
        playCelebrationSound();
      }
    }

    // Roll for Loot Drop if completing mission
    let updatedInventory = user.inventory || [];
    if (willBeCompleted) {
      droppedLoot = rollForLootDrop(targetHabit, user, isPerfectDayNow);
      if (droppedLoot) {
        updatedInventory = [droppedLoot, ...updatedInventory];
      }
    }

    // Check Level Up
    const oldLevel = user.level;
    const levelInfo = calculateLevelFromTotalXp(nextTotalXp);

    const nextUser: UserProfile = {
      ...user,
      totalXp: nextTotalXp,
      level: levelInfo.level,
      currentStreak: streakStats.currentStreak,
      longestStreak: Math.max(user.longestStreak || 0, streakStats.longestStreak),
      perfectDaysCount: streakStats.perfectDaysCount,
      currentTitle:
        levelInfo.level > oldLevel && levelInfo.titleUnlocked
          ? levelInfo.titleUnlocked
          : user.currentTitle,
      inventory: updatedInventory,
    };
    BuffrStorage.saveUser(nextUser);
    setUser(nextUser);

    // Trigger Loot Discovery or Level Up Celebration
    if (droppedLoot) {
      setPendingLootItem(droppedLoot);
      setIsLootDropModalOpen(true);
    } else if (levelInfo.level > oldLevel) {
      setLevelUpNewLevel(levelInfo.level);
      setLevelUpTitleUnlocked(levelInfo.titleUnlocked);
      setIsLevelUpModalOpen(true);
      playLevelUpSound();
    }

    // Check Quests & Achievements
    updateQuestsAndAchievements(nextCompletions, nextUser);

    // Sync to Cloud Firestore if logged in
    if (currentUser) {
      FirestoreSyncService.saveCompletion(currentUser.uid, updatedComp);
      FirestoreSyncService.saveUser(currentUser.uid, nextUser);
    }
  };

  // Direct progress updates for count/duration/quantity habits (supports retroactive target date)
  const handleUpdateHabitProgress = (
    habitId: string,
    progressValue: number,
    isCompleted: boolean,
    targetDateStr?: string
  ) => {
    const activeDateStr = targetDateStr || getTodayStr();
    const isPastDate = activeDateStr !== getTodayStr();
    const existingComp = completions.find(
      (c) => c.habitId === habitId && c.dateStr === activeDateStr
    );

    const updatedComp: HabitCompletion = {
      id: existingComp ? existingComp.id : generateId('comp'),
      habitId,
      dateStr: activeDateStr,
      isCompleted,
      progressValue,
      completedAt: isCompleted ? new Date().toISOString() : undefined,
    };

    BuffrStorage.saveCompletion(updatedComp);
    const nextCompletions = BuffrStorage.getCompletions();
    setCompletions(nextCompletions);

    if (isCompleted && (!existingComp || !existingComp.isCompleted)) {
      const h = habits.find((hb) => hb.id === habitId);
      if (h) {
        const oldLevel = user.level;
        let nextTotalXp = user.totalXp + h.xpReward;

        // Check Mini Combo Routine Chains bonus XP
        const activeChains = routineChains.filter(
          (rc) => !rc.isArchived && rc.habitIds.includes(habitId)
        );

        for (const chain of activeChains) {
          const otherHabitsDone = chain.habitIds
            .filter((hid) => hid !== habitId)
            .every((hid) =>
              nextCompletions.some(
                (c) => c.habitId === hid && c.dateStr === activeDateStr && c.isCompleted
              )
            );

          if (otherHabitsDone) {
            nextTotalXp += chain.comboBonusXp;
            const comboTx: XPTransaction = {
              id: generateId('tx'),
              amount: chain.comboBonusXp,
              reason: `⚡ Mini Combo Clear: ${chain.title} (+${chain.comboBonusXp} XP Combo Multiplier)`,
              timestamp: new Date().toISOString(),
            };
            BuffrStorage.saveXPTransaction(comboTx);
            playSound('powerup');
            triggerHapticPulse('heavy');
          }
        }

        const levelInfo = calculateLevelFromTotalXp(nextTotalXp);
        const streakStats = calculateOverallStreak(habits, nextCompletions);
        const nextUser: UserProfile = {
          ...user,
          totalXp: nextTotalXp,
          level: levelInfo.level,
          currentStreak: streakStats.currentStreak,
          longestStreak: Math.max(user.longestStreak || 0, streakStats.longestStreak),
          perfectDaysCount: streakStats.perfectDaysCount,
          currentTitle:
            levelInfo.level > oldLevel && levelInfo.titleUnlocked
              ? levelInfo.titleUnlocked
              : user.currentTitle,
        };
        BuffrStorage.saveUser(nextUser);
        setUser(nextUser);
        updateQuestsAndAchievements(nextCompletions, nextUser);

        const tx: XPTransaction = {
          id: generateId('tx'),
          amount: h.xpReward,
          reason: isPastDate
            ? `Target Reached (${activeDateStr}): ${h.title}`
            : `Target Reached: ${h.title}`,
          timestamp: new Date().toISOString(),
          habitId,
        };
        BuffrStorage.saveXPTransaction(tx);
        setXpTransactions(BuffrStorage.getXpTransactions());

        if (levelInfo.level > oldLevel) {
          setLevelUpNewLevel(levelInfo.level);
          setLevelUpTitleUnlocked(levelInfo.titleUnlocked);
          setIsLevelUpModalOpen(true);
          playLevelUpSound();
        } else {
          playCompletionSound();
        }
        triggerHapticPulse('medium');

        if (currentUser) {
          FirestoreSyncService.saveUser(currentUser.uid, nextUser);
          FirestoreSyncService.saveXPTransaction(currentUser.uid, tx);
        }
      }
    }

    if (currentUser) {
      FirestoreSyncService.saveCompletion(currentUser.uid, updatedComp);
    }
  };


  // Quests & Achievements verification engine
  const updateQuestsAndAchievements = (
    currentCompletions: HabitCompletion[],
    currentUser: UserProfile
  ) => {
    const todayStr = getTodayStr();
    const todayDone = currentCompletions.filter((c) => c.dateStr === todayStr && c.isCompleted).length;

    // Quests progress update
    const updatedQuests = quests.map((q) => {
      if (q.id === 'q-1') {
        return { ...q, progress: todayDone };
      }
      return q;
    });
    BuffrStorage.saveQuests(updatedQuests);
    setQuests(updatedQuests);

    // Achievements unlock check
    const nextAchievements = checkAchievementsUnlock(
      habits,
      currentCompletions,
      currentUser,
      achievements
    );
    BuffrStorage.saveAchievements(nextAchievements);
    setAchievements(nextAchievements);
  };

  // Quest Claiming
  const handleClaimQuest = (questId: string) => {
    const targetQuest = quests.find((q) => q.id === questId);
    if (!targetQuest || targetQuest.isClaimed || targetQuest.progress < targetQuest.target) return;

    const nextQuests = quests.map((q) =>
      q.id === questId ? { ...q, isClaimed: true } : q
    );
    BuffrStorage.saveQuests(nextQuests);
    setQuests(nextQuests);

    // Add XP
    const oldLevel = user.level;
    const nextTotalXp = user.totalXp + targetQuest.xpReward;
    const levelInfo = calculateLevelFromTotalXp(nextTotalXp);
    const nextUser = {
      ...user,
      totalXp: nextTotalXp,
      level: levelInfo.level,
      currentTitle:
        levelInfo.level > oldLevel && levelInfo.titleUnlocked
          ? levelInfo.titleUnlocked
          : user.currentTitle,
    };
    BuffrStorage.saveUser(nextUser);
    setUser(nextUser);

    BuffrStorage.saveXPTransaction({
      id: generateId('tx'),
      amount: targetQuest.xpReward,
      reason: `Claimed Quest Bounty: ${targetQuest.title}`,
      timestamp: new Date().toISOString(),
    });
    setXpTransactions(BuffrStorage.getXpTransactions());

    if (levelInfo.level > oldLevel) {
      setLevelUpNewLevel(levelInfo.level);
      setLevelUpTitleUnlocked(levelInfo.titleUnlocked);
      setIsLevelUpModalOpen(true);
      playLevelUpSound();
    } else {
      playCelebrationSound();
    }
    triggerHapticPulse('heavy');
  };

  // Challenge Actions
  const handleJoinChallenge = (challengeId: string) => {
    const nextChallenges = challenges.map((c) =>
      c.id === challengeId ? { ...c, isJoined: true, currentDay: 1 } : c
    );
    BuffrStorage.saveChallenges(nextChallenges);
    setChallenges(nextChallenges);
    triggerHapticPulse('medium');
  };

  const handleCreateCustomChallenge = (challengeData: Partial<Challenge>) => {
    const newChallenge: Challenge = {
      id: generateId('chal'),
      title: challengeData.title || 'New Challenge',
      description: challengeData.description || '',
      targetDays: challengeData.targetDays || 14,
      currentDay: 1,
      xpReward: challengeData.xpReward || 150,
      isJoined: true,
      isCompleted: false,
      emoji: challengeData.emoji || '🎯',
      color: challengeData.color || '#10b981',
      category: challengeData.category || 'Discipline',
    };

    const nextChallenges = [newChallenge, ...challenges];
    BuffrStorage.saveChallenges(nextChallenges);
    setChallenges(nextChallenges);
    playCompletionSound();
  };

  // RPG Gear and Skill Tree Handlers
  const handleEquipLootItem = (item: LootItem) => {
    playSound('equip');
    const currentInventory = user.inventory || [];
    const currentEquipped = user.equippedGear || {};

    const updatedInventory = currentInventory.map((invItem) => {
      if (invItem.slot === item.slot && invItem.isEquipped && invItem.id !== item.id) {
        return { ...invItem, isEquipped: false };
      }
      if (invItem.id === item.id) {
        return { ...invItem, isEquipped: true };
      }
      return invItem;
    });

    const nextUser: UserProfile = {
      ...user,
      inventory: updatedInventory,
      equippedGear: {
        ...currentEquipped,
        [item.slot]: { ...item, isEquipped: true },
      },
    };

    BuffrStorage.saveUser(nextUser);
    setUser(nextUser);
    if (currentUser) {
      FirestoreSyncService.saveUser(currentUser.uid, nextUser);
    }
  };

  const handleUnequipSlot = (slot: LootSlotType) => {
    playSound('click');
    const currentInventory = user.inventory || [];
    const currentEquipped = { ...(user.equippedGear || {}) };
    delete currentEquipped[slot];

    const updatedInventory = currentInventory.map((invItem) => {
      if (invItem.slot === slot && invItem.isEquipped) {
        return { ...invItem, isEquipped: false };
      }
      return invItem;
    });

    const nextUser: UserProfile = {
      ...user,
      inventory: updatedInventory,
      equippedGear: currentEquipped,
    };

    BuffrStorage.saveUser(nextUser);
    setUser(nextUser);
    if (currentUser) {
      FirestoreSyncService.saveUser(currentUser.uid, nextUser);
    }
  };

  const handleUpdateSkillTree = (updatedSkillTree: UserSkillTreeState) => {
    const nextUser: UserProfile = {
      ...user,
      skillTree: updatedSkillTree,
    };
    BuffrStorage.saveUser(nextUser);
    setUser(nextUser);
    if (currentUser) {
      FirestoreSyncService.saveUser(currentUser.uid, nextUser);
    }
  };

  // Habit CRUD Actions
  const handleSaveHabit = (habitData: Partial<Habit>) => {
    let savedHabit: Habit;
    if (editingHabit) {
      // Update
      savedHabit = { ...editingHabit, ...habitData } as Habit;
      BuffrStorage.saveHabit(savedHabit);
    } else {
      // Create
      savedHabit = {
        id: generateId('habit'),
        title: habitData.title || 'New Habit',
        description: habitData.description,
        category: habitData.category || 'Fitness',
        timeOfDay: habitData.timeOfDay || 'morning',
        color: habitData.color || '#10b981',
        emoji: habitData.emoji || '✨',
        icon: habitData.icon || 'Sparkles',
        difficulty: habitData.difficulty || 'medium',
        xpReward: habitData.xpReward || 20,
        habitType: habitData.habitType || 'boolean',
        targetValue: habitData.targetValue || 1,
        unit: habitData.unit,
        frequencyType: habitData.frequencyType || 'daily',
        frequencyDays: habitData.frequencyDays || [0, 1, 2, 3, 4, 5, 6],
        frequency: habitData.frequency || { type: 'daily' },
        attributeBoosts: habitData.attributeBoosts || {},
        reminderTime: habitData.reminderTime,
        isArchived: false,
        isPaused: false,
        createdAt: new Date().toISOString(),
      };
      BuffrStorage.saveHabit(savedHabit);
    }

    if (currentUser) {
      FirestoreSyncService.saveHabit(currentUser.uid, savedHabit);
    }

    setHabits(BuffrStorage.getHabits());
    setIsHabitFormOpen(false);
    setEditingHabit(null);
  };

  const handleApplyRoutinePack = (packHabits: HabitTemplate[]) => {
    packHabits.forEach((tpl) => {
      const newHabit: Habit = {
        id: generateId('habit'),
        title: tpl.title,
        description: tpl.description,
        category: tpl.category,
        timeOfDay: tpl.timeOfDay,
        color: tpl.color,
        emoji: tpl.emoji,
        icon: tpl.icon || 'Sparkles',
        difficulty: tpl.difficulty || 'medium',
        xpReward: tpl.xpReward || DIFFICULTY_BASE_XP[tpl.difficulty || 'medium'] || 20,
        habitType: tpl.habitType,
        targetValue: tpl.targetValue,
        unit: tpl.unit,
        frequencyType: 'daily',
        frequencyDays: [0, 1, 2, 3, 4, 5, 6],
        frequency: { type: 'daily' },
        attributeBoosts: tpl.attributeBoosts || {},
        isArchived: false,
        isPaused: false,
        createdAt: new Date().toISOString(),
      };
      BuffrStorage.saveHabit(newHabit);
      if (currentUser) {
        FirestoreSyncService.saveHabit(currentUser.uid, newHabit);
      }
    });

    setHabits(BuffrStorage.getHabits());
    setIsHabitFormOpen(false);
    playCelebrationSound();
  };

  const handleTogglePauseHabit = (habitId: string, pauseReason?: string) => {
    const target = habits.find((h) => h.id === habitId);
    if (!target) return;

    const nextHabit: Habit = {
      ...target,
      isPaused: !target.isPaused,
      pauseReason: !target.isPaused ? pauseReason : undefined,
    };
    BuffrStorage.saveHabit(nextHabit);
    if (currentUser) {
      FirestoreSyncService.saveHabit(currentUser.uid, nextHabit);
    }
    setHabits(BuffrStorage.getHabits());
  };

  const handleToggleArchiveHabit = (habitId: string) => {
    const target = habits.find((h) => h.id === habitId);
    if (!target) return;

    const nextHabit: Habit = {
      ...target,
      isArchived: !target.isArchived,
    };
    BuffrStorage.saveHabit(nextHabit);
    if (currentUser) {
      FirestoreSyncService.saveHabit(currentUser.uid, nextHabit);
    }
    setHabits(BuffrStorage.getHabits());
  };

  const handleReorderHabits = (newOrderedHabits: Habit[]) => {
    BuffrStorage.saveHabits(newOrderedHabits);
    setHabits(newOrderedHabits);
    if (currentUser) {
      newOrderedHabits.forEach((h) => {
        FirestoreSyncService.saveHabit(currentUser.uid, h);
      });
    }
  };

  const handleSaveRoutineChain = (chain: RoutineChain) => {
    BuffrStorage.saveRoutineChain(chain);
    setRoutineChains(BuffrStorage.getRoutineChains());
    if (currentUser) {
      FirestoreSyncService.saveRoutineChain(currentUser.uid, chain);
    }
  };

  const handleDeleteRoutineChain = (chainId: string) => {
    BuffrStorage.deleteRoutineChain(chainId);
    setRoutineChains(BuffrStorage.getRoutineChains());
    if (currentUser) {
      FirestoreSyncService.deleteRoutineChain(currentUser.uid, chainId);
    }
  };

  const handleDeleteHabit = (habitId: string) => {
    BuffrStorage.deleteHabit(habitId);
    if (currentUser) {
      FirestoreSyncService.deleteHabit(currentUser.uid, habitId);
    }
    setHabits(BuffrStorage.getHabits());
  };

  // Daily Reflection save
  const handleSaveDailyReflection = (reflection: DailyReflection) => {
    BuffrStorage.saveDailyReflection(reflection);
    setReflections(BuffrStorage.getReflections());

    // Award +25 XP
    const nextTotalXp = user.totalXp + 25;
    const levelInfo = calculateLevelFromTotalXp(nextTotalXp);
    const nextUser = { ...user, totalXp: nextTotalXp, level: levelInfo.level };
    BuffrStorage.saveUser(nextUser);
    setUser(nextUser);

    const tx: XPTransaction = {
      id: generateId('tx'),
      amount: 25,
      reason: 'Completed Daily Reflection Journal',
      timestamp: new Date().toISOString(),
    };
    BuffrStorage.saveXPTransaction(tx);
    setXpTransactions(BuffrStorage.getXpTransactions());
    playCelebrationSound();

    if (currentUser) {
      FirestoreSyncService.saveReflection(currentUser.uid, reflection);
      FirestoreSyncService.saveUser(currentUser.uid, nextUser);
      FirestoreSyncService.saveXPTransaction(currentUser.uid, tx);
    }
  };


  // Render Inner Application Screens
  const renderViewContent = () => {
    switch (activeTab) {
      case 'today':
        return (
          <TodayView
            user={user}
            habits={habits}
            completions={completions}
            quests={quests}
            routineChains={routineChains}
            onToggleHabit={handleToggleHabit}
            onUpdateHabitProgress={handleUpdateHabitProgress}
            onOpenHabitDetail={(habit) => {
              setSelectedHabitForDetail(habit);
              setIsHabitDetailOpen(true);
            }}
            onOpenDailyReflection={() => setIsDailyReflectionOpen(true)}
            onClaimQuest={handleClaimQuest}
            onOpenWeeklyReview={() => setIsWeeklyReviewOpen(true)}
            onOpenCreateHabit={() => {
              setEditingHabit(null);
              setIsHabitFormOpen(true);
            }}
            onSaveRoutineChain={handleSaveRoutineChain}
            onDeleteRoutineChain={handleDeleteRoutineChain}
            onReorderHabits={handleReorderHabits}
            onToggleArchiveHabit={handleToggleArchiveHabit}
          />
        );
      case 'calendar':
        return (
          <CalendarView
            habits={habits}
            completions={completions}
            reflections={reflections}
            onToggleHabit={handleToggleHabit}
            onUpdateHabitProgress={handleUpdateHabitProgress}
          />
        );
      case 'progress':
        return (
          <ProgressView
            user={user}
            habits={habits}
            completions={completions}
            onOpenWeeklyReview={() => setIsWeeklyReviewOpen(true)}
            onUpdateSkillTree={handleUpdateSkillTree}
            onOpenCartridgeModal={() => setIsRetroCartridgeOpen(true)}
            onEquipItem={handleEquipLootItem}
            onUnequipSlot={handleUnequipSlot}
          />
        );
      case 'challenges':
        return (
          <ChallengesView
            user={user}
            challenges={challenges}
            quests={quests}
            achievements={achievements}
            onJoinChallenge={handleJoinChallenge}
            onClaimQuest={handleClaimQuest}
            onCreateCustomChallenge={handleCreateCustomChallenge}
          />
        );
      case 'profile':
        return (
          <ProfileView
            user={user}
            habits={habits}
            xpTransactions={xpTransactions}
            onUpdateUser={handleUpdateUser}
            onEditHabit={(h) => {
              setEditingHabit(h);
              setIsHabitFormOpen(true);
            }}
            onTogglePauseHabit={handleTogglePauseHabit}
            onToggleArchiveHabit={handleToggleArchiveHabit}
            onDeleteHabit={handleDeleteHabit}
            onResetDemoData={handleExploreDemo}
            onResetFreshData={handleResetFresh}
            onDataImportSuccess={refreshAllState}
            onOpenCartridgeModal={() => setIsRetroCartridgeOpen(true)}
            onOpenSkillTree={() => setActiveTab('progress')}
            onEquipItem={handleEquipLootItem}
            onUnequipSlot={handleUnequipSlot}
          />
        );
      default:
        return null;
    }
  };

  const todayStr = getTodayStr();
  const todayXpEarned = xpTransactions
    .filter((tx) => tx.timestamp && tx.timestamp.startsWith(todayStr))
    .reduce((acc, tx) => acc + (tx.amount || 0), 0);

  const appLayout = (
    <div id="buffr-app-root" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Header */}
      <BuffrHeader
        user={user}
        todayXpEarned={todayXpEarned}
        onToggleSound={() => handleUpdateUser({ soundEnabled: !user.soundEnabled })}
        onOpenCreateHabit={() => {
          setEditingHabit(null);
          setIsHabitFormOpen(true);
        }}
        isDeviceFrameEnabled={isDeviceFrameEnabled}
        onToggleDeviceFrame={() => setIsDeviceFrameEnabled(!isDeviceFrameEnabled)}
        onOpenSkillTree={() => setActiveTab('progress')}
        onOpenCartridge={() => setIsRetroCartridgeOpen(true)}
        onOpenVault={() => setActiveTab('progress')}
      />

      {/* Main Content View with Fade Transition */}
      <main className="flex-1 overflow-y-auto">
        {renderViewContent()}
      </main>

      {/* Bottom Navigation Bar */}
      <BuffrBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onChangeTab={setActiveTab}
        onOpenCreateHabit={() => {
          setEditingHabit(null);
          setIsHabitFormOpen(true);
        }}
      />

      {/* MODALS */}
      <HabitFormModal
        isOpen={isHabitFormOpen}
        onClose={() => {
          setIsHabitFormOpen(false);
          setEditingHabit(null);
        }}
        onSaveHabit={handleSaveHabit}
        onApplyRoutinePack={handleApplyRoutinePack}
        editingHabit={editingHabit}
      />

      <HabitDetailModal
        isOpen={isHabitDetailOpen}
        habit={selectedHabitForDetail}
        completions={completions}
        onClose={() => {
          setIsHabitDetailOpen(false);
          setSelectedHabitForDetail(null);
        }}
        onEditHabit={(h) => {
          setEditingHabit(h);
          setIsHabitFormOpen(true);
        }}
        onTogglePauseHabit={handleTogglePauseHabit}
        onToggleArchiveHabit={handleToggleArchiveHabit}
        onDeleteHabit={handleDeleteHabit}
      />

      <LevelUpModal
        isOpen={isLevelUpModalOpen}
        newLevel={levelUpNewLevel}
        unlockedTitle={levelUpTitleUnlocked}
        onClose={() => setIsLevelUpModalOpen(false)}
      />

      <PerfectDayModal
        isOpen={isPerfectDayModalOpen}
        totalHabitsCount={habits.filter((h) => !h.isArchived && !h.isPaused).length}
        streakDays={user.currentStreak}
        onClose={() => setIsPerfectDayModalOpen(false)}
      />

      <DailyReflectionModal
        isOpen={isDailyReflectionOpen}
        onClose={() => setIsDailyReflectionOpen(false)}
        onSaveReflection={handleSaveDailyReflection}
        existingReflection={reflections.find((r) => r.dateStr === getTodayStr())}
      />

      <WeeklyReviewModal
        isOpen={isWeeklyReviewOpen}
        habits={habits}
        completions={completions}
        onClose={() => setIsWeeklyReviewOpen(false)}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onFinishOnboarding={handleFinishOnboarding}
        onExploreDemo={handleExploreDemo}
      />

      <LootDropModal
        isOpen={isLootDropModalOpen}
        item={pendingLootItem}
        onClose={() => {
          setIsLootDropModalOpen(false);
          setPendingLootItem(null);
        }}
        onEquip={(item) => {
          handleEquipLootItem(item);
          setIsLootDropModalOpen(false);
          setPendingLootItem(null);
        }}
        onSendToVault={() => {
          setIsLootDropModalOpen(false);
          setPendingLootItem(null);
        }}
      />

      <RetroCartridgeModal
        isOpen={isRetroCartridgeOpen}
        user={user}
        habits={habits}
        completions={completions}
        onClose={() => setIsRetroCartridgeOpen(false)}
      />
    </div>
  );

  return (
    <AndroidFrame isEnabled={isDeviceFrameEnabled}>
      {appLayout}
    </AndroidFrame>
  );
}
