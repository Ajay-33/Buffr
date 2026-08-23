import React, { useState, useEffect, useMemo } from 'react';
import {
  Flame,
  Check,
  Plus,
  Minus,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Moon,
  Zap,
  Calendar as CalendarIcon,
  Clock,
  History,
  Edit3,
  Layers,
  ArrowUp,
  ArrowDown,
  Search,
  Archive,
  RotateCw,
  SlidersHorizontal,
  ArrowRight,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import {
  Habit,
  HabitCompletion,
  UserProfile,
  TimeOfDay,
  Quest,
  RoutineChain,
} from '../../types';
import { BuffrProgressRing } from '../common/BuffrProgressRing';
import {
  calculateDailyScore,
  calculateLevelFromTotalXp,
  calculateHabitStreak,
} from '../../utils/gamification';
import {
  getTodayStr,
  getGreeting,
  formatLongDate,
  getDaysAgo,
  formatDisplayDate,
} from '../../utils/dateUtils';
import { motion, AnimatePresence } from 'motion/react';
import { playSound, triggerHapticPulse } from '../../utils/sound';
import { RoutineChainModal } from '../modals/RoutineChainModal';

interface TodayViewProps {
  user: UserProfile;
  habits: Habit[];
  completions: HabitCompletion[];
  quests: Quest[];
  routineChains?: RoutineChain[];
  onToggleHabit: (habitId: string, targetDateStr?: string) => void;
  onUpdateHabitProgress: (
    habitId: string,
    progressValue: number,
    isCompleted: boolean,
    targetDateStr?: string
  ) => void;
  onOpenHabitDetail: (habit: Habit) => void;
  onOpenDailyReflection: () => void;
  onClaimQuest: (questId: string) => void;
  onOpenWeeklyReview: () => void;
  onOpenCreateHabit: () => void;
  onSaveRoutineChain?: (chain: RoutineChain) => void;
  onDeleteRoutineChain?: (chainId: string) => void;
  onReorderHabits?: (habits: Habit[]) => void;
  onToggleArchiveHabit?: (habitId: string) => void;
}

type FilterStage = 'all' | 'morning' | 'afternoon' | 'evening' | 'anytime';
type FilterStatus = 'all' | 'pending' | 'completed' | 'combos' | 'archived';

export const TodayView: React.FC<TodayViewProps> = ({
  user,
  habits,
  completions,
  quests,
  routineChains = [],
  onToggleHabit,
  onUpdateHabitProgress,
  onOpenHabitDetail,
  onOpenDailyReflection,
  onClaimQuest,
  onOpenWeeklyReview,
  onOpenCreateHabit,
  onSaveRoutineChain = (_chain: RoutineChain) => {},
  onDeleteRoutineChain = (_id: string) => {},
  onReorderHabits = (_habits: Habit[]) => {},
  onToggleArchiveHabit = (_id: string) => {},
}) => {
  const todayStr = getTodayStr();
  const yesterdayStr = getDaysAgo(1);

  // Active view date for logging
  const [activeDateStr, setActiveDateStr] = useState<string>(todayStr);
  const isViewingToday = activeDateStr === todayStr;
  const isViewingYesterday = activeDateStr === yesterdayStr;

  // Quick Filter Tabs State
  const [selectedStage, setSelectedStage] = useState<FilterStage>('all');
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Reorder Mode State
  const [isReorderMode, setIsReorderMode] = useState(false);

  // Mini Combos Modal State
  const [isChainModalOpen, setIsChainModalOpen] = useState(false);

  // Quantity quick-edit state
  const [editingQuantityHabitId, setEditingQuantityHabitId] = useState<string | null>(null);
  const [customQuantityValue, setCustomQuantityValue] = useState<string>('');

  const dayStats = calculateDailyScore(habits, completions, activeDateStr);

  // Group collapses state
  const [collapsedGroups, setCollapsedGroups] = useState<Record<TimeOfDay, boolean>>({
    morning: false,
    afternoon: false,
    evening: false,
    anytime: false,
  });

  // Active timers state for duration habits
  const [activeTimers, setActiveTimers] = useState<
    Record<string, { seconds: number; isRunning: boolean }>
  >({});

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTimers((prev) => {
        let hasRunning = false;
        const next = { ...prev };
        Object.keys(next).forEach((hid) => {
          if (next[hid].isRunning) {
            hasRunning = true;
            next[hid] = { ...next[hid], seconds: next[hid].seconds + 1 };
          }
        });
        return hasRunning ? next : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleGroup = (group: TimeOfDay) => {
    playSound('click');
    setCollapsedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  // Sort habits by explicit order
  const sortedHabits = useMemo(() => {
    return [...habits].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [habits]);

  // Active vs Archived habits
  const activeHabits = useMemo(() => {
    return sortedHabits.filter((h) => !h.isArchived);
  }, [sortedHabits]);

  const archivedHabits = useMemo(() => {
    return sortedHabits.filter((h) => h.isArchived);
  }, [sortedHabits]);

  // Daily quests
  const dailyQuests = quests.filter((q) => q.type === 'daily');

  // Active date XP earned
  const activeDateCompletions = completions.filter(
    (c) => c.dateStr === activeDateStr && c.isCompleted
  );
  const activeDateXpEarned = activeDateCompletions.reduce((acc, c) => {
    const h = habits.find((hb) => hb.id === c.habitId);
    return acc + (h ? h.xpReward : 0);
  }, 0);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSaveCustomQuantity = (habit: Habit) => {
    const num = parseInt(customQuantityValue, 10);
    if (!isNaN(num) && num >= 0) {
      playSound('powerup');
      onUpdateHabitProgress(habit.id, num, num >= habit.targetValue, activeDateStr);
    }
    setEditingQuantityHabitId(null);
    setCustomQuantityValue('');
  };

  // Reorder habit up / down
  const handleMoveHabit = (habitId: string, direction: 'up' | 'down') => {
    playSound('click');
    triggerHapticPulse('light');
    const activeList = [...activeHabits];
    const currentIndex = activeList.findIndex((h) => h.id === habitId);
    if (currentIndex < 0) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= activeList.length) return;

    // Swap
    const temp = activeList[currentIndex];
    activeList[currentIndex] = activeList[targetIndex];
    activeList[targetIndex] = temp;

    // Re-assign order numbers
    const updatedWithOrder = activeList.map((h, idx) => ({
      ...h,
      order: idx,
    }));

    // Merge back with archived habits
    const fullUpdatedList = [
      ...updatedWithOrder,
      ...archivedHabits,
    ];

    onReorderHabits(fullUpdatedList);
  };

  // Group definitions
  const timeGroups: { id: TimeOfDay; label: string; icon: string; code: string }[] = [
    { id: 'morning', label: 'MORNING RUN', icon: '🌅', code: 'STAGE 01' },
    { id: 'afternoon', label: 'AFTERNOON GRIND', icon: '☀️', code: 'STAGE 02' },
    { id: 'evening', label: 'NIGHT OPS', icon: '🌙', code: 'STAGE 03' },
    { id: 'anytime', label: 'ANYTIME MISSIONS', icon: '⚡', code: 'FREE PLAY' },
  ];

  // Filter groups according to selectedStage
  const visibleGroups = timeGroups.filter((g) => {
    if (selectedStage === 'all') return true;
    return g.id === selectedStage;
  });

  // Habit matching filter
  const isHabitMatchingFilter = (h: Habit) => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = h.title.toLowerCase().includes(q);
      const matchCategory = h.category.toLowerCase().includes(q);
      const matchDesc = (h.description || '').toLowerCase().includes(q);
      if (!matchTitle && !matchCategory && !matchDesc) return false;
    }

    // Status filter
    if (selectedStatus === 'archived') {
      return h.isArchived;
    }

    if (h.isArchived) return false;

    const isDone = completions.some(
      (c) => c.habitId === h.id && c.dateStr === activeDateStr && c.isCompleted
    );

    if (selectedStatus === 'pending' && isDone) return false;
    if (selectedStatus === 'completed' && !isDone) return false;
    if (selectedStatus === 'combos') {
      // Must belong to at least one routine chain
      return routineChains.some((rc) => rc.habitIds.includes(h.id));
    }

    return true;
  };

  // Active Mini Combo calculations
  const activeRoutineChains = useMemo(() => {
    return routineChains.filter((c) => !c.isArchived);
  }, [routineChains]);

  return (
    <div id="today-view-container" className="p-3 sm:p-6 max-w-4xl mx-auto space-y-4 sm:space-y-5 pb-28">
      {/* Top Arcade Greeting & Date Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#11092a] border-2 border-[#3b2d60] p-3 sm:p-4 shadow-[3px_3px_0px_#05020a]">
        <div>
          <div className="flex items-center space-x-2">
            <span
              className={`px-1.5 py-0.5 font-arcade text-[9px] ${
                isViewingToday
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-amber-600 text-white font-bold'
              }`}
            >
              {isViewingToday ? '● LIVE TODAY' : '⏮ RETRO LOGGING'}
            </span>
            <h1 className="text-base sm:text-xl font-arcade text-yellow-400 tracking-wider">
              {getGreeting(user.name).toUpperCase()}
            </h1>
          </div>
          <p className="text-[11px] sm:text-xs text-cyan-300 font-retro mt-1 flex items-center space-x-2">
            <CalendarIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>{formatLongDate(activeDateStr).toUpperCase()}</span>
            <span>•</span>
            <span className="text-pink-400">READY PLAYER 1</span>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Mini Combos Manager Button */}
          <button
            id="today-btn-mini-combos"
            onClick={() => {
              playSound('click');
              setIsChainModalOpen(true);
            }}
            className="px-3 py-1.5 bg-[#170e33] hover:bg-[#25174f] border-2 border-cyan-400 text-[10px] sm:text-xs font-arcade text-cyan-300 hover:text-yellow-300 shadow-[2px_2px_0px_#000] active:translate-y-0.5 transition-all flex items-center space-x-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>MINI COMBOS</span>
            {routineChains.length > 0 && (
              <span className="px-1 py-0.2 bg-cyan-500 text-black text-[8px] font-bold">
                {routineChains.length}
              </span>
            )}
          </button>

          <button
            id="today-btn-weekly-review"
            onClick={onOpenWeeklyReview}
            className="px-3 py-1.5 bg-[#1f1242] hover:bg-[#2d1b5e] border-2 border-purple-500 text-[10px] sm:text-xs font-arcade text-purple-300 hover:text-white shadow-[2px_2px_0px_#000] active:translate-y-0.5 transition-all flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>WEEKLY LOG</span>
          </button>
        </div>
      </div>

      {/* Date Switcher Bar */}
      <div className="bg-[#120a28] border-2 border-[#4c377d] p-2 sm:p-2.5 shadow-[2px_2px_0px_#05020a] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-1.5">
          <span className="text-[9px] font-arcade text-slate-400 hidden sm:inline">LOG CYCLE:</span>
          {/* Quick Yesterday Button */}
          <button
            id="btn-switch-yesterday"
            onClick={() => {
              playSound('click');
              setActiveDateStr(yesterdayStr);
            }}
            className={`px-2.5 py-1 text-[9px] sm:text-[10px] font-arcade border transition-all flex items-center space-x-1 ${
              isViewingYesterday
                ? 'bg-amber-400 text-black border-amber-300 font-bold shadow-[2px_2px_0px_#000]'
                : 'bg-[#1e1338] hover:bg-[#2c1c50] text-amber-300 border-[#553c90]'
            }`}
          >
            <History className="w-3 h-3" />
            <span>YESTERDAY ({formatDisplayDate(yesterdayStr)})</span>
          </button>

          {/* Quick Today Button */}
          <button
            id="btn-switch-today"
            onClick={() => {
              playSound('click');
              setActiveDateStr(todayStr);
            }}
            className={`px-2.5 py-1 text-[9px] sm:text-[10px] font-arcade border transition-all flex items-center space-x-1 ${
              isViewingToday
                ? 'bg-cyan-400 text-black border-cyan-300 font-bold shadow-[2px_2px_0px_#000]'
                : 'bg-[#1e1338] hover:bg-[#2c1c50] text-cyan-300 border-[#553c90]'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>TODAY ({formatDisplayDate(todayStr)})</span>
          </button>
        </div>

        {/* Custom Date Input */}
        <div className="flex items-center space-x-1.5">
          <input
            type="date"
            value={activeDateStr}
            max={todayStr}
            onChange={(e) => {
              if (e.target.value) {
                playSound('click');
                setActiveDateStr(e.target.value);
              }
            }}
            className="bg-[#090416] border border-[#553c90] text-slate-200 text-[10px] font-mono px-2 py-0.5 focus:border-yellow-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Metrics Row: XP Bar + Radial Radar HUD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Left 2 cols: XP Progress & Quick Metrics */}
        <div className="md:col-span-2 space-y-3">
          {/* XP Level Bar */}
          <div className="p-3.5 bg-[#11092a] border-2 border-[#3b2d60] shadow-[3px_3px_0px_#05020a]">
            <div className="flex items-center justify-between text-[10px] font-arcade mb-1.5">
              <span className="text-yellow-400 flex items-center space-x-1">
                <Zap className="w-3 h-3 fill-yellow-400" />
                <span>LEVEL {calculateLevelFromTotalXp(user.totalXp).level} • {user.currentTitle || 'Starter'}</span>
              </span>
              <span className="text-cyan-300 font-mono">
                {user.totalXp} / {calculateLevelFromTotalXp(user.totalXp).nextLevelXpRequired} XP
              </span>
            </div>
            <div className="w-full bg-[#090416] h-3 border border-[#3b2d60] p-0.5">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 via-amber-400 to-emerald-400 transition-all duration-300"
                style={{
                  width: `${Math.min(100, Math.max(0, calculateLevelFromTotalXp(user.totalXp).progressPercent))}%`,
                }}
              />
            </div>
          </div>

          {/* Quick Arcade Metrics HUD */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 sm:p-3 bg-[#11092a] border-2 border-[#3b2d60] shadow-[2px_2px_0px_#05020a] flex flex-col justify-center">
              <span className="text-[8px] sm:text-[9px] text-slate-400 font-arcade">STAGE CLEAR</span>
              <span className={`text-sm sm:text-base font-arcade mt-0.5 ${dayStats.color}`}>
                {dayStats.score}%
              </span>
            </div>

            <div className="p-2.5 sm:p-3 bg-[#11092a] border-2 border-[#3b2d60] shadow-[2px_2px_0px_#05020a] flex flex-col justify-center">
              <span className="text-[8px] sm:text-[9px] text-slate-400 font-arcade">POINTS EARNED</span>
              <span className="text-sm sm:text-base font-arcade text-yellow-400 mt-0.5 flex items-center space-x-1">
                <Zap className="w-3 h-3 fill-yellow-400" />
                <span>+{activeDateXpEarned}</span>
              </span>
            </div>

            <div className="p-2.5 sm:p-3 bg-[#11092a] border-2 border-[#3b2d60] shadow-[2px_2px_0px_#05020a] flex flex-col justify-center">
              <span className="text-[8px] sm:text-[9px] text-slate-400 font-arcade">MISSIONS</span>
              <span className="text-sm sm:text-base font-arcade text-green-400 mt-0.5">
                {dayStats.completedCount}/{dayStats.scheduledCount}
              </span>
            </div>
          </div>
        </div>

        {/* Right 1 col: Circular Daily Score Ring */}
        <div className="p-4 bg-[#11092a] border-2 border-[#3b2d60] shadow-[3px_3px_0px_#05020a] flex flex-col items-center justify-center relative">
          <div className="absolute top-2 left-2 text-[8px] font-arcade text-cyan-400">
            RADAR METER
          </div>
          <BuffrProgressRing
            score={dayStats.score}
            size={120}
            strokeWidth={10}
            label={dayStats.label}
            sublabel={`${dayStats.completedCount}/${dayStats.scheduledCount} CLEARED`}
          />
        </div>
      </div>

      {/* Daily Bounties Strip */}
      <div className="p-3 sm:p-4 bg-[#11092a] border-2 border-[#3b2d60] shadow-[3px_3px_0px_#05020a] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-yellow-400 border border-black text-black flex items-center justify-center font-bold">
              <Zap className="w-3.5 h-3.5 fill-black" />
            </div>
            <span className="text-[10px] sm:text-xs font-arcade text-yellow-300 tracking-wider">
              DAILY BOUNTIES
            </span>
          </div>
          <span className="text-[9px] font-retro text-cyan-300">STAGE RESET: 24:00</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono">
          {dailyQuests.map((q) => {
            const isReadyToClaim = q.progress >= q.target && !q.isClaimed;
            return (
              <div
                key={q.id}
                className={`p-2.5 border-2 flex items-center justify-between transition-all ${
                  q.isClaimed
                    ? 'bg-[#0b051c] border-slate-800 text-slate-500'
                    : isReadyToClaim
                    ? 'bg-[#291705] border-yellow-400 text-yellow-200 shadow-[2px_2px_0px_#000]'
                    : 'bg-[#0e0722] border-[#2f2352] text-slate-300'
                }`}
              >
                <div className="truncate mr-2">
                  <span className="text-[10px] sm:text-[11px] font-arcade block truncate text-slate-200">
                    {q.title}
                  </span>
                  <span className="text-[10px] font-retro text-cyan-300">
                    {Math.min(q.target, q.progress)} / {q.target} • +{q.xpReward} PTS
                  </span>
                </div>

                {q.isClaimed ? (
                  <span className="text-[9px] font-arcade text-green-400">CLAIMED</span>
                ) : isReadyToClaim ? (
                  <button
                    id={`claim-quest-${q.id}`}
                    onClick={() => onClaimQuest(q.id)}
                    className="px-2.5 py-1 bg-yellow-400 hover:bg-yellow-300 border-2 border-yellow-200 text-black font-arcade text-[9px] shadow-[1px_1px_0px_#000] active:translate-y-0.5"
                  >
                    CLAIM!
                  </button>
                ) : (
                  <div className="w-12 bg-[#05020c] h-2.5 border border-[#3b2d60] p-0.5">
                    <div
                      className="bg-yellow-400 h-full"
                      style={{ width: `${Math.min(100, (q.progress / q.target) * 100)}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* MINI COMBOS HUD (Quest Chaining) */}
      {activeRoutineChains.length > 0 && selectedStatus !== 'archived' && (
        <div className="p-3 sm:p-4 bg-[#130a2a] border-2 border-cyan-500 shadow-[3px_3px_0px_#05020a] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-cyan-400 border border-black text-black flex items-center justify-center font-bold">
                <Layers className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[10px] sm:text-xs font-arcade text-cyan-300 tracking-wider">
                  ACTIVE MINI COMBOS & CHAINS
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                playSound('click');
                setIsChainModalOpen(true);
              }}
              className="text-[9px] font-arcade text-yellow-300 hover:text-yellow-200 flex items-center space-x-1"
            >
              <span>+ CONFIGURE COMBOS</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {activeRoutineChains.map((chain) => {
              const chainHabits = chain.habitIds
                .map((id) => habits.find((h) => h.id === id))
                .filter(Boolean) as Habit[];

              if (chainHabits.length === 0) return null;

              const completedInChain = chainHabits.filter((h) =>
                completions.some(
                  (c) => c.habitId === h.id && c.dateStr === activeDateStr && c.isCompleted
                )
              ).length;

              const isChainFullyCleared =
                chainHabits.length > 0 && completedInChain === chainHabits.length;

              const progressPercent = Math.round(
                (completedInChain / chainHabits.length) * 100
              );

              return (
                <div
                  key={chain.id}
                  className={`p-3 border-2 transition-all space-y-2 relative overflow-hidden ${
                    isChainFullyCleared
                      ? 'bg-[#092219] border-emerald-400 shadow-[2px_2px_0px_#022c22]'
                      : 'bg-[#0d0620] border-[#3b2d60] shadow-[2px_2px_0px_#000]'
                  }`}
                  style={{
                    borderLeftColor: chain.color,
                    borderLeftWidth: '4px',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 truncate">
                      <span className="text-base">{chain.emoji}</span>
                      <span className="text-xs font-arcade text-yellow-300 truncate">
                        {chain.title}
                      </span>
                    </div>

                    <span
                      className={`px-1.5 py-0.5 text-[8px] font-arcade border flex items-center space-x-1 ${
                        isChainFullyCleared
                          ? 'bg-emerald-400 text-black border-emerald-300 font-bold'
                          : 'bg-[#1b1038] text-yellow-300 border-yellow-500'
                      }`}
                    >
                      <Zap className="w-2.5 h-2.5 fill-current" />
                      <span>+{chain.comboBonusXp} XP</span>
                    </span>
                  </div>

                  {/* Step pills chain */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    {chainHabits.map((ch, idx) => {
                      const isStepDone = completions.some(
                        (c) => c.habitId === ch.id && c.dateStr === activeDateStr && c.isCompleted
                      );

                      return (
                        <React.Fragment key={ch.id}>
                          <button
                            type="button"
                            onClick={() => onToggleHabit(ch.id, activeDateStr)}
                            className={`flex items-center space-x-1 px-1.5 py-0.5 text-[9px] font-arcade border transition-all ${
                              isStepDone
                                ? 'bg-emerald-500 border-emerald-300 text-black font-bold'
                                : 'bg-[#170e33] hover:bg-[#25174f] border-[#44336c] text-slate-300 hover:text-yellow-300'
                            }`}
                            title={`Toggle Step: ${ch.title}`}
                          >
                            <span>{ch.emoji}</span>
                            <span className="truncate max-w-[80px]">{ch.title}</span>
                            {isStepDone && <Check className="w-2.5 h-2.5 stroke-[3.5]" />}
                          </button>

                          {idx < chainHabits.length - 1 && (
                            <ArrowRight className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* Progress Bar & Status */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[8px] font-arcade">
                      <span className={isChainFullyCleared ? 'text-emerald-300 font-bold' : 'text-slate-400'}>
                        {isChainFullyCleared
                          ? '🎉 COMBO UNLOCKED! (+BONUS XP AWARDED)'
                          : `COMBO PROGRESS: ${completedInChain}/${chainHabits.length} STEPS`}
                      </span>
                      <span className="text-cyan-300 font-mono">{progressPercent}%</span>
                    </div>

                    <div className="w-full bg-[#05020c] h-1.5 border border-[#3b2d60]">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isChainFullyCleared ? 'bg-emerald-400' : 'bg-cyan-400'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* QUICK FILTER TABS & CONTROL BAR */}
      <div className="p-3 bg-[#11092a] border-2 border-[#3b2d60] shadow-[3px_3px_0px_#05020a] space-y-3">
        {/* Time of Day Stage Filter Tabs */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-arcade text-yellow-400 flex items-center space-x-1">
              <Filter className="w-3 h-3" />
              <span>TIME STAGE FILTER:</span>
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'ALL STAGES', emoji: '🌟' },
              { id: 'morning', label: 'MORNING', emoji: '🌅' },
              { id: 'afternoon', label: 'AFTERNOON', emoji: '☀️' },
              { id: 'evening', label: 'NIGHT', emoji: '🌙' },
              { id: 'anytime', label: 'ANYTIME', emoji: '⚡' },
            ].map((tab) => {
              const isSelected = selectedStage === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`filter-stage-${tab.id}`}
                  onClick={() => {
                    playSound('click');
                    setSelectedStage(tab.id as FilterStage);
                  }}
                  className={`px-2.5 py-1 text-[9px] sm:text-[10px] font-arcade border transition-all flex items-center space-x-1.5 active:translate-y-0.5 ${
                    isSelected
                      ? 'bg-yellow-400 text-black border-yellow-200 font-bold shadow-[2px_2px_0px_#000]'
                      : 'bg-[#180e38] hover:bg-[#25174f] text-slate-300 border-[#473673]'
                  }`}
                >
                  <span>{tab.emoji}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Status / Category Pills & Search & Reorder Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#291e45]">
          {/* Status Pills */}
          <div className="flex flex-wrap gap-1">
            {[
              { id: 'all', label: 'ALL' },
              { id: 'pending', label: '⏳ PENDING' },
              { id: 'completed', label: '✅ CLEARED' },
              { id: 'combos', label: '🔗 COMBOS' },
              { id: 'archived', label: `🗄️ ARCHIVED (${archivedHabits.length})` },
            ].map((pill) => {
              const isSelected = selectedStatus === pill.id;
              return (
                <button
                  key={pill.id}
                  id={`filter-status-${pill.id}`}
                  onClick={() => {
                    playSound('click');
                    setSelectedStatus(pill.id as FilterStatus);
                  }}
                  className={`px-2 py-0.5 text-[8px] sm:text-[9px] font-arcade border transition-all ${
                    isSelected
                      ? 'bg-cyan-400 text-black border-cyan-300 font-bold shadow-[1px_1px_0px_#000]'
                      : 'bg-[#150b30] hover:bg-[#21134a] text-slate-400 border-[#39295e]'
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>

          {/* Search Input & Reorder Toggle */}
          <div className="flex items-center space-x-2">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search quest..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#090416] border border-[#3b2d60] text-slate-200 text-[10px] px-2 py-1 pl-6 focus:border-yellow-400 focus:outline-none w-28 sm:w-36 font-mono"
              />
              <Search className="w-3 h-3 text-slate-500 absolute left-1.5 top-1.5 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-[8px] font-arcade text-slate-400 hover:text-white absolute right-1 top-1 px-1"
                >
                  ×
                </button>
              )}
            </div>

            {/* Reorder Mode Button */}
            {selectedStatus !== 'archived' && (
              <button
                id="btn-toggle-reorder-mode"
                onClick={() => {
                  playSound('click');
                  setIsReorderMode(!isReorderMode);
                }}
                className={`px-2.5 py-1 text-[9px] font-arcade border flex items-center space-x-1 transition-all active:translate-y-0.5 ${
                  isReorderMode
                    ? 'bg-pink-500 text-white border-pink-300 font-bold shadow-[2px_2px_0px_#000] animate-pulse'
                    : 'bg-[#1e1338] hover:bg-[#2c1c50] text-pink-300 border-pink-600'
                }`}
                title="Toggle Habit Reorder Mode (Up/Down Arrows)"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>{isReorderMode ? 'DONE REORDER' : '↕️ REORDER'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ARCHIVED HABITS VAULT VIEW (If Selected) */}
      {selectedStatus === 'archived' ? (
        <div className="space-y-3">
          <div className="p-3 bg-[#180e38] border-2 border-amber-500 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Archive className="w-4 h-4 text-amber-400" />
              <div>
                <h3 className="text-xs font-arcade text-amber-300">ARCHIVED QUESTS VAULT</h3>
                <p className="text-[10px] text-cyan-300 font-retro">
                  Archived habits retain all historical stats & streaks without cluttering your daily missions
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 bg-amber-400 text-black font-arcade text-[9px] font-bold">
              {archivedHabits.length} VAULTED
            </span>
          </div>

          {archivedHabits.length === 0 ? (
            <div className="p-8 text-center bg-[#11092a] border-2 border-dashed border-[#3b2d60] space-y-2">
              <Archive className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-yellow-400 font-arcade">NO ARCHIVED HABITS</p>
              <p className="text-[10px] text-slate-400 font-retro">
                Habits you archive from detail views will appear here safely preserved.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {archivedHabits.map((habit) => {
                const streakStats = calculateHabitStreak(habit, completions);
                return (
                  <div
                    key={habit.id}
                    className="p-3 bg-[#0d0720] border-2 border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[2px_2px_0px_#000]"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 border-2 flex items-center justify-center text-xl shrink-0 opacity-60"
                        style={{ borderColor: habit.color }}
                      >
                        {habit.emoji}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-xs sm:text-sm font-arcade text-slate-300">
                            {habit.title}
                          </h4>
                          <span className="px-1 py-0.2 bg-slate-800 text-[8px] font-arcade text-slate-400 border border-slate-600">
                            VAULTED
                          </span>
                        </div>
                        <p className="text-[10px] font-retro text-slate-400 mt-0.5">
                          Total Cleared: {streakStats.totalCompletions} times • Best Combo: {streakStats.longestStreak}d
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          playSound('click');
                          onOpenHabitDetail(habit);
                        }}
                        className="px-2.5 py-1 bg-[#1a0f35] hover:bg-[#2b1955] border border-slate-600 text-[9px] font-arcade text-slate-300"
                      >
                        DETAILS
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          playSound('powerup');
                          onToggleArchiveHabit(habit.id);
                        }}
                        className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-black font-arcade text-[9px] font-bold border border-emerald-300 shadow-[1px_1px_0px_#000] flex items-center space-x-1"
                      >
                        <RotateCw className="w-3 h-3" />
                        <span>UNARCHIVE & RESTORE</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* NORMAL HABIT GROUPS */
        <div className="space-y-4">
          {activeHabits.length === 0 ? (
            <div className="p-8 text-center bg-[#11092a] border-2 border-dashed border-[#4c3b7a] space-y-4 shadow-[3px_3px_0px_#05020a]">
              <div className="w-12 h-12 bg-yellow-400 border-2 border-yellow-200 text-black flex items-center justify-center mx-auto text-xl shadow-[2px_2px_0px_#000]">
                👾
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-arcade text-yellow-400">INSERT COIN TO START</h3>
                <p className="text-xs text-cyan-300 font-retro mt-1 max-w-sm mx-auto">
                  No active habit missions found. Initialize your first habit routine to start gaining XP.
                </p>
              </div>
              <button
                id="today-empty-create-btn"
                onClick={onOpenCreateHabit}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 border-2 border-emerald-300 text-black font-arcade text-xs inline-flex items-center space-x-2 shadow-[0_4px_0_#065f46] active:translate-y-1"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>CREATE FIRST MISSION</span>
              </button>
            </div>
          ) : (
            visibleGroups.map((group) => {
              const groupHabits = activeHabits
                .filter((h) => h.timeOfDay === group.id)
                .filter(isHabitMatchingFilter);

              if (groupHabits.length === 0) return null;

              const isCollapsed = collapsedGroups[group.id];
              const groupCompletedCount = groupHabits.filter((h) =>
                completions.some(
                  (c) => c.habitId === h.id && c.dateStr === activeDateStr && c.isCompleted
                )
              ).length;

              return (
                <div key={group.id} className="space-y-2">
                  {/* Group Header - Arcade Stage Banner */}
                  <div
                    id={`group-header-${group.id}`}
                    onClick={() => toggleGroup(group.id)}
                    className="flex items-center justify-between px-3 py-1.5 bg-[#1a0f35] border-2 border-[#3b2d60] cursor-pointer select-none shadow-[2px_2px_0px_#000] hover:border-yellow-400 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-arcade text-yellow-400">{group.code}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-xs font-arcade text-slate-200">{group.label}</span>
                      <span className="text-[9px] font-arcade text-cyan-300 px-1.5 py-0.5 bg-[#0e0722] border border-[#4c3b7a]">
                        {groupCompletedCount}/{groupHabits.length}
                      </span>
                    </div>

                    <button className="text-slate-400 hover:text-white transition-colors">
                      {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Group Habit Cards */}
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2.5 overflow-hidden"
                      >
                        {groupHabits.map((habit, habitIdx) => {
                          const completion = completions.find(
                            (c) => c.habitId === habit.id && c.dateStr === activeDateStr
                          );
                          const isDone = completion ? completion.isCompleted : false;
                          const currentProgress = completion ? completion.progressValue : 0;
                          const streakStats = calculateHabitStreak(habit, completions);
                          const timerData = activeTimers[habit.id] || { seconds: 0, isRunning: false };

                          // Check if habit belongs to a mini combo chain
                          const matchedChain = routineChains.find((rc) =>
                            rc.habitIds.includes(habit.id)
                          );

                          return (
                            <div
                              key={habit.id}
                              id={`habit-card-${habit.id}`}
                              className={`p-3 sm:p-3.5 border-2 transition-all duration-150 relative ${
                                isDone
                                  ? 'bg-[#0d1f18] border-emerald-500 shadow-[3px_3px_0px_#022c22]'
                                  : 'bg-[#11092a] border-[#3b2d60] hover:border-cyan-500 shadow-[3px_3px_0px_#05020a]'
                              }`}
                            >
                              {/* Reorder Mode Control Bar */}
                              {isReorderMode && (
                                <div className="mb-2 pb-2 border-b border-[#2b1f48] flex items-center justify-between bg-[#0a0518] px-2 py-1">
                                  <div className="flex items-center space-x-1.5">
                                    <span className="px-1.5 py-0.2 bg-pink-600 text-white font-arcade text-[8px] font-bold">
                                      PRIORITY #{habitIdx + 1}
                                    </span>
                                    <span className="text-[9px] font-retro text-cyan-300">
                                      Shift execution priority
                                    </span>
                                  </div>

                                  <div className="flex items-center space-x-1">
                                    <button
                                      type="button"
                                      disabled={habitIdx === 0}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMoveHabit(habit.id, 'up');
                                      }}
                                      className="px-2 py-0.5 bg-[#25174f] hover:bg-[#392477] disabled:opacity-30 text-[9px] font-arcade text-yellow-300 border border-[#5d419e] flex items-center space-x-0.5"
                                      title="Move Up"
                                    >
                                      <ArrowUp className="w-3 h-3" />
                                      <span>UP</span>
                                    </button>
                                    <button
                                      type="button"
                                      disabled={habitIdx === groupHabits.length - 1}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMoveHabit(habit.id, 'down');
                                      }}
                                      className="px-2 py-0.5 bg-[#25174f] hover:bg-[#392477] disabled:opacity-30 text-[9px] font-arcade text-yellow-300 border border-[#5d419e] flex items-center space-x-0.5"
                                      title="Move Down"
                                    >
                                      <ArrowDown className="w-3 h-3" />
                                      <span>DOWN</span>
                                    </button>
                                  </div>
                                </div>
                              )}

                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                {/* Habit Icon & Identity */}
                                <div
                                  onClick={() => onOpenHabitDetail(habit)}
                                  className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer flex-1 min-w-0"
                                >
                                  <div
                                    className="w-10 h-10 border-2 flex items-center justify-center text-xl shrink-0 shadow-[2px_2px_0px_#000]"
                                    style={{
                                      borderColor: habit.color || '#38bdf8',
                                      backgroundColor: `${habit.color || '#38bdf8'}22`,
                                    }}
                                  >
                                    {habit.emoji}
                                  </div>

                                  <div className="truncate">
                                    <div className="flex items-center space-x-1.5">
                                      <h4
                                        className={`text-xs sm:text-sm font-arcade tracking-wide truncate transition-colors ${
                                          isDone ? 'text-green-300 line-through opacity-80' : 'text-slate-100'
                                        }`}
                                      >
                                        {habit.title}
                                      </h4>
                                      {matchedChain && (
                                        <span
                                          className="px-1.5 py-0.2 text-[8px] border font-arcade text-cyan-300 bg-[#0a0518]"
                                          style={{ borderColor: matchedChain.color }}
                                          title={`Linked in ${matchedChain.title}`}
                                        >
                                          {matchedChain.emoji} COMBO
                                        </span>
                                      )}
                                      {habit.isPaused && (
                                        <span className="px-1 py-0.5 text-[8px] bg-amber-950 border border-amber-400 text-amber-300 font-arcade">
                                          PAUSED
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex items-center space-x-1.5 sm:space-x-2 text-[10px] font-retro text-cyan-300 mt-0.5 truncate">
                                      <span className="text-yellow-300 font-bold">
                                        +{habit.xpReward} PTS
                                      </span>
                                      <span>•</span>
                                      <span className="uppercase">{habit.category}</span>
                                      {streakStats.currentStreak > 0 && (
                                        <>
                                          <span>•</span>
                                          <span className="text-amber-400 font-bold flex items-center space-x-0.5">
                                            <Flame className="w-3 h-3 fill-amber-400" />
                                            <span>x{streakStats.currentStreak} COMBO</span>
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Interactive controls */}
                                <div className="flex items-center justify-between sm:justify-end space-x-2 shrink-0 pt-1 sm:pt-0 border-t border-slate-800 sm:border-t-0">
                                  {/* Count Stepper */}
                                  {habit.habitType === 'count' && (
                                    <div className="flex items-center space-x-1 bg-[#090416] border-2 border-[#3b2d60] p-1 font-mono text-xs shadow-[1px_1px_0px_#000]">
                                      <button
                                        id={`habit-minus-${habit.id}`}
                                        onClick={() => {
                                          const nextVal = Math.max(0, currentProgress - 1);
                                          onUpdateHabitProgress(
                                            habit.id,
                                            nextVal,
                                            nextVal >= habit.targetValue,
                                            activeDateStr
                                          );
                                        }}
                                        className="w-7 h-7 bg-[#1c1238] hover:bg-[#2d1b5e] border border-slate-700 text-slate-300 flex items-center justify-center active:translate-y-0.5"
                                        title="Decrement count"
                                      >
                                        <Minus className="w-3.5 h-3.5" />
                                      </button>
                                      <span className="px-1.5 font-arcade text-[10px] text-yellow-300">
                                        {currentProgress}/{habit.targetValue}
                                      </span>
                                      <button
                                        id={`habit-plus-${habit.id}`}
                                        onClick={() => {
                                          const nextVal = currentProgress + 1;
                                          onUpdateHabitProgress(
                                            habit.id,
                                            nextVal,
                                            nextVal >= habit.targetValue,
                                            activeDateStr
                                          );
                                        }}
                                        className="w-7 h-7 bg-emerald-600 hover:bg-emerald-500 border border-emerald-400 text-black font-bold flex items-center justify-center active:translate-y-0.5"
                                        title="Increment count (+1)"
                                      >
                                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                                      </button>
                                    </div>
                                  )}

                                  {/* Duration Stopwatch/Timer */}
                                  {habit.habitType === 'duration' && (
                                    <div className="flex items-center space-x-1.5 bg-[#090416] border-2 border-[#3b2d60] px-2 py-1 font-mono text-xs shadow-[1px_1px_0px_#000]">
                                      <span className="text-cyan-300 font-retro text-xs">
                                        {timerData.seconds > 0
                                          ? formatTimer(timerData.seconds)
                                          : `${habit.targetValue}m`}
                                      </span>
                                      <button
                                        id={`timer-toggle-${habit.id}`}
                                        onClick={() => {
                                          setActiveTimers((prev) => ({
                                            ...prev,
                                            [habit.id]: {
                                              seconds: prev[habit.id]?.seconds || 0,
                                              isRunning: !prev[habit.id]?.isRunning,
                                            },
                                          }));
                                        }}
                                        className="p-1 bg-emerald-500 text-black border border-emerald-300 active:translate-y-0.5"
                                        title={timerData.isRunning ? 'Pause Timer' : 'Start Timer'}
                                      >
                                        {timerData.isRunning ? (
                                          <Pause className="w-3.5 h-3.5" />
                                        ) : (
                                          <Play className="w-3.5 h-3.5 fill-black" />
                                        )}
                                      </button>
                                      {timerData.seconds > 0 && (
                                        <button
                                          onClick={() => {
                                            setActiveTimers((prev) => ({
                                              ...prev,
                                              [habit.id]: { seconds: 0, isRunning: false },
                                            }));
                                          }}
                                          className="p-1 bg-[#1a0f35] text-slate-300 border border-slate-700 active:translate-y-0.5"
                                          title="Reset Timer"
                                        >
                                          <RotateCcw className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  )}

                                  {/* Quantity Habit (e.g. 10k steps, 8 glasses water) with Quick Adjusters */}
                                  {habit.habitType === 'quantity' && (
                                    <div className="flex items-center space-x-1 bg-[#090416] border-2 border-[#3b2d60] p-1 font-mono text-xs">
                                      <span className="px-1 text-[10px] font-retro text-cyan-300">
                                        {currentProgress.toLocaleString()} / {habit.targetValue.toLocaleString()}{' '}
                                        {habit.unit || ''}
                                      </span>

                                      {/* Quick +1000 / +5000 Step buttons for large quantities */}
                                      {habit.targetValue >= 1000 ? (
                                        <div className="flex items-center space-x-0.5">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const nextVal = Math.min(
                                                habit.targetValue * 2,
                                                currentProgress + 1000
                                              );
                                              onUpdateHabitProgress(
                                                habit.id,
                                                nextVal,
                                                nextVal >= habit.targetValue,
                                                activeDateStr
                                              );
                                            }}
                                            className="px-1 py-0.5 bg-[#1b1038] hover:bg-[#2e1c5c] text-[8px] font-arcade text-amber-300 border border-slate-700"
                                            title="Add 1,000 steps"
                                          >
                                            +1k
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const nextVal = Math.min(
                                                habit.targetValue * 2,
                                                currentProgress + 5000
                                              );
                                              onUpdateHabitProgress(
                                                habit.id,
                                                nextVal,
                                                nextVal >= habit.targetValue,
                                                activeDateStr
                                              );
                                            }}
                                            className="px-1 py-0.5 bg-[#1b1038] hover:bg-[#2e1c5c] text-[8px] font-arcade text-cyan-300 border border-slate-700"
                                            title="Add 5,000 steps"
                                          >
                                            +5k
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="flex items-center space-x-0.5">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const nextVal = currentProgress + 1;
                                              onUpdateHabitProgress(
                                                habit.id,
                                                nextVal,
                                                nextVal >= habit.targetValue,
                                                activeDateStr
                                              );
                                            }}
                                            className="px-1.5 py-0.5 bg-[#1b1038] hover:bg-[#2e1c5c] text-[9px] font-arcade text-cyan-300 border border-slate-700"
                                          >
                                            +1
                                          </button>
                                        </div>
                                      )}

                                      {/* Edit exact quantity value */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingQuantityHabitId(habit.id);
                                          setCustomQuantityValue(String(currentProgress || habit.targetValue));
                                        }}
                                        className="p-1 bg-[#1a0f35] hover:bg-[#2d1b5e] border border-slate-700 text-slate-300 hover:text-yellow-300 active:translate-y-0.5"
                                        title="Type custom step/quantity amount"
                                      >
                                        <Edit3 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )}

                                  {/* 1-Tap Arcade Cabinet Checkbox Button */}
                                  <motion.button
                                    id={`habit-toggle-btn-${habit.id}`}
                                    whileTap={{ scale: 0.88, y: 2 }}
                                    onClick={() => onToggleHabit(habit.id, activeDateStr)}
                                    className={`w-10 h-10 border-2 flex items-center justify-center transition-all ${
                                      isDone
                                        ? 'bg-emerald-500 border-emerald-300 text-black shadow-[0_3px_0_#065f46]'
                                        : 'bg-[#1e1338] border-[#55408a] hover:border-yellow-400 text-transparent shadow-[0_3px_0_#000]'
                                    }`}
                                    title={
                                      isDone
                                        ? 'Mark as Incomplete'
                                        : `Complete Mission (+XP) on ${activeDateStr}`
                                    }
                                  >
                                    <Check
                                      className={`w-5 h-5 stroke-[3.5] ${
                                        isDone ? 'opacity-100' : 'opacity-0'
                                      }`}
                                    />
                                  </motion.button>
                                </div>
                              </div>

                              {/* Inline Custom Quantity Input Dropdown */}
                              {editingQuantityHabitId === habit.id && (
                                <div className="mt-2.5 p-2.5 bg-[#0a0518] border-2 border-yellow-400 shadow-[2px_2px_0px_#000] flex flex-wrap items-center gap-2">
                                  <span className="text-[9px] font-arcade text-yellow-300">
                                    SET EXACT {habit.unit?.toUpperCase() || 'AMOUNT'} FOR {activeDateStr}:
                                  </span>
                                  <input
                                    type="number"
                                    autoFocus
                                    value={customQuantityValue}
                                    onChange={(e) => setCustomQuantityValue(e.target.value)}
                                    placeholder={String(habit.targetValue)}
                                    className="w-28 bg-[#150a2b] border border-cyan-400 text-white font-mono text-xs px-2 py-1 focus:outline-none"
                                  />
                                  <div className="flex items-center space-x-1">
                                    <button
                                      type="button"
                                      onClick={() => handleSaveCustomQuantity(habit)}
                                      className="px-2.5 py-1 bg-yellow-400 hover:bg-yellow-300 text-black font-arcade text-[9px] font-bold shadow-[1px_1px_0px_#000]"
                                    >
                                      SAVE
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setCustomQuantityValue(String(habit.targetValue));
                                        playSound('powerup');
                                        onUpdateHabitProgress(habit.id, habit.targetValue, true, activeDateStr);
                                        setEditingQuantityHabitId(null);
                                      }}
                                      className="px-2 py-1 bg-emerald-500 text-black font-arcade text-[9px] font-bold shadow-[1px_1px_0px_#000]"
                                    >
                                      MAX ({habit.targetValue.toLocaleString()})
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingQuantityHabitId(null)}
                                      className="px-2 py-1 bg-[#1a0f35] text-slate-400 font-arcade text-[9px]"
                                    >
                                      CANCEL
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* End-of-Day Reflection Card */}
      <div className="p-3.5 sm:p-4 bg-[#140b30] border-2 border-indigo-500 shadow-[3px_3px_0px_#05020a] flex items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-indigo-600 border-2 border-indigo-300 text-white flex items-center justify-center shadow-[2px_2px_0px_#000]">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-arcade text-indigo-300">EVENING LOG & REFLECT</h4>
            <p className="text-[11px] font-retro text-slate-300">
              Record daily mood, review bosses defeated & earn +25 PTS
            </p>
          </div>
        </div>

        <button
          id="today-open-reflection-btn"
          onClick={onOpenDailyReflection}
          className="px-3 py-2 bg-indigo-500 hover:bg-indigo-400 border-2 border-indigo-300 text-slate-950 font-arcade text-[10px] shadow-[2px_2px_0px_#000] active:translate-y-0.5 shrink-0"
        >
          REFLECT
        </button>
      </div>

      {/* Routine Chain (Mini Combos) Manager Modal */}
      <RoutineChainModal
        isOpen={isChainModalOpen}
        onClose={() => setIsChainModalOpen(false)}
        chains={routineChains}
        habits={habits}
        onSaveChain={onSaveRoutineChain}
        onDeleteChain={onDeleteRoutineChain}
      />
    </div>
  );
};
