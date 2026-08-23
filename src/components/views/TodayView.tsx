import React, { useState, useEffect } from 'react';
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
  ArrowLeft,
  ArrowRight,
  History,
  Edit3,
  CheckCircle2,
} from 'lucide-react';
import {
  Habit,
  HabitCompletion,
  UserProfile,
  TimeOfDay,
  Quest,
} from '../../types';
import { BuffrProgressRing } from '../common/BuffrProgressRing';
import { BuffrXPBar } from '../common/BuffrXPBar';
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
import { playSound } from '../../utils/sound';

interface TodayViewProps {
  user: UserProfile;
  habits: Habit[];
  completions: HabitCompletion[];
  quests: Quest[];
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
}

export const TodayView: React.FC<TodayViewProps> = ({
  user,
  habits,
  completions,
  quests,
  onToggleHabit,
  onUpdateHabitProgress,
  onOpenHabitDetail,
  onOpenDailyReflection,
  onClaimQuest,
  onOpenWeeklyReview,
  onOpenCreateHabit,
}) => {
  const todayStr = getTodayStr();
  const yesterdayStr = getDaysAgo(1);

  // Active view date for logging (defaults to today, can switch to yesterday or past date)
  const [activeDateStr, setActiveDateStr] = useState<string>(todayStr);
  const isViewingToday = activeDateStr === todayStr;
  const isViewingYesterday = activeDateStr === yesterdayStr;

  // Quantity quick-edit dialog state (e.g. for logging 10,000 steps)
  const [editingQuantityHabitId, setEditingQuantityHabitId] = useState<string | null>(null);
  const [customQuantityValue, setCustomQuantityValue] = useState<string>('');

  const dayStats = calculateDailyScore(habits, completions, activeDateStr);
  const levelInfo = calculateLevelFromTotalXp(user.totalXp);

  // Yesterday's missed status check
  const yesterdayStats = calculateDailyScore(habits, completions, yesterdayStr);
  const hasMissedYesterdayTasks =
    yesterdayStats.scheduledCount > 0 && yesterdayStats.score < 100;

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
    setCollapsedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  // Filter scheduled active habits
  const scheduledHabits = habits.filter((h) => !h.isArchived);

  // Group by time of day
  const timeGroups: { id: TimeOfDay; label: string; icon: string; code: string }[] = [
    { id: 'morning', label: 'MORNING RUN', icon: '🌅', code: 'STAGE 01' },
    { id: 'afternoon', label: 'AFTERNOON GRIND', icon: '☀️', code: 'STAGE 02' },
    { id: 'evening', label: 'NIGHT OPS', icon: '🌙', code: 'STAGE 03' },
    { id: 'anytime', label: 'ANYTIME MISSIONS', icon: '⚡', code: 'FREE PLAY' },
  ];

  // Daily quests
  const dailyQuests = quests.filter((q) => q.type === 'daily');

  // Calculate active date's XP earned
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

  return (
    <div id="today-view-container" className="p-3 sm:p-6 max-w-4xl mx-auto space-y-4 sm:space-y-6 pb-28">
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

      {/* Date Switcher Bar (Today / Yesterday / Date Selector) */}
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
          <label className="text-[9px] font-arcade text-slate-400 flex items-center space-x-1 cursor-pointer">
            <input
              type="date"
              max={todayStr}
              value={activeDateStr}
              onChange={(e) => {
                if (e.target.value) {
                  playSound('click');
                  setActiveDateStr(e.target.value);
                }
              }}
              className="bg-[#090416] border border-[#553c90] text-slate-200 text-[10px] font-mono px-2 py-1 focus:border-cyan-400 focus:outline-none"
            />
          </label>
        </div>
      </div>

      {/* Forgotten Yesterday Missed Tasks Alert Banner (when on today and yesterday has unlogged tasks) */}
      {isViewingToday && hasMissedYesterdayTasks && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-gradient-to-r from-[#2e1805] to-[#1c0f2a] border-2 border-amber-400 shadow-[3px_3px_0px_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
        >
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-amber-400 text-black flex items-center justify-center font-bold shrink-0">
              <History className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="text-[11px] sm:text-xs font-arcade text-amber-300">
                DID YOU FORGET TO LOG YESTERDAY ({formatDisplayDate(yesterdayStr).toUpperCase()})?
              </h4>
              <p className="text-[10px] sm:text-[11px] font-retro text-slate-200">
                You cleared {yesterdayStats.completedCount}/{yesterdayStats.scheduledCount} missions yesterday. Update your steps or workouts to restore combo streaks!
              </p>
            </div>
          </div>

          <button
            id="btn-jump-update-yesterday"
            onClick={() => {
              playSound('powerup');
              setActiveDateStr(yesterdayStr);
            }}
            className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-arcade text-[10px] sm:text-xs font-bold border border-amber-200 shadow-[2px_2px_0px_#000] active:translate-y-0.5 shrink-0 flex items-center space-x-1"
          >
            <span>LOG YESTERDAY'S WORK</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}

      {/* Active Retroactive Editing Banner (when viewing yesterday or a past date) */}
      {!isViewingToday && (
        <div className="p-3 bg-[#1f1035] border-2 border-cyan-400 shadow-[3px_3px_0px_#05020a] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-cyan-400 text-black flex items-center justify-center font-bold shrink-0">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-[11px] sm:text-xs font-arcade text-cyan-300">
                  EDITING {isViewingYesterday ? "YESTERDAY'S" : 'PAST'} MISSION LOG: {formatDisplayDate(activeDateStr).toUpperCase()}
                </h4>
                <span className="px-1 py-0.2 bg-cyan-900 border border-cyan-400 text-cyan-200 text-[8px] font-arcade">
                  RETRO MODE
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-retro text-slate-300">
                Tap checkmarks or log your steps/progress to backfill completed missions and repair combos.
              </p>
            </div>
          </div>

          <button
            id="btn-return-today"
            onClick={() => {
              playSound('click');
              setActiveDateStr(todayStr);
            }}
            className="px-3 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-black font-arcade text-[10px] sm:text-xs font-bold border border-cyan-200 shadow-[2px_2px_0px_#000] active:translate-y-0.5 shrink-0 flex items-center space-x-1"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>RETURN TO TODAY</span>
          </button>
        </div>
      )}

      {/* Hero Progress Section: Level Bar & Daily Score Ring */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {/* Left 2 cols: XP Progression Bar */}
        <div className="md:col-span-2 space-y-3">
          <BuffrXPBar
            level={levelInfo.level}
            currentLevelXp={levelInfo.currentLevelXp}
            nextLevelXpRequired={levelInfo.nextLevelXpRequired}
            progressPercent={levelInfo.progressPercent}
            streakDays={user.currentStreak}
          />

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

      {/* Daily Quests Preview Strip */}
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

      {/* Habit Groups (Morning / Afternoon / Evening / Anytime) */}
      <div className="space-y-4">
        {scheduledHabits.length === 0 ? (
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
          timeGroups.map((group) => {
            const groupHabits = scheduledHabits.filter((h) => h.timeOfDay === group.id);
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
                      {groupHabits.map((habit) => {
                        const completion = completions.find(
                          (c) => c.habitId === habit.id && c.dateStr === activeDateStr
                        );
                        const isDone = completion ? completion.isCompleted : false;
                        const currentProgress = completion ? completion.progressValue : 0;
                        const streakStats = calculateHabitStreak(habit, completions);
                        const timerData = activeTimers[habit.id] || { seconds: 0, isRunning: false };

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

                                    {/* Quick +1000 / +2500 / +5000 / +10000 Step buttons for large quantities */}
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

                            {/* Inline Custom Quantity Modal / Input Dropdown */}
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
    </div>
  );
};

