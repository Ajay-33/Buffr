import React from 'react';
import { X, TrendingUp, Sparkles, CheckCircle2, Flame, Award } from 'lucide-react';
import { Habit, HabitCompletion } from '../../types';
import { getDaysAgo } from '../../utils/dateUtils';
import { calculateDailyScore } from '../../utils/gamification';
import { playSound } from '../../utils/sound';

interface WeeklyReviewModalProps {
  isOpen: boolean;
  habits: Habit[];
  completions: HabitCompletion[];
  onClose: () => void;
}

export const WeeklyReviewModal: React.FC<WeeklyReviewModalProps> = ({
  isOpen,
  habits,
  completions,
  onClose,
}) => {
  if (!isOpen) return null;

  // Calculate past 7 days stats
  let totalScheduled = 0;
  let totalCompleted = 0;
  let totalXpEarned = 0;
  let perfectDays = 0;

  const categoryDoneMap: Record<string, number> = {};

  for (let i = 0; i < 7; i++) {
    const dStr = getDaysAgo(i);
    const dayRes = calculateDailyScore(habits, completions, dStr);
    totalScheduled += dayRes.scheduledCount;
    totalCompleted += dayRes.completedCount;
    if (dayRes.score === 100) perfectDays++;

    // completions in this day
    const dayComps = completions.filter((c) => c.dateStr === dStr && c.isCompleted);
    dayComps.forEach((c) => {
      const h = habits.find((hb) => hb.id === c.habitId);
      if (h) {
        totalXpEarned += h.xpReward;
        categoryDoneMap[h.category] = (categoryDoneMap[h.category] || 0) + 1;
      }
    });
  }

  // Previous week comparison
  let prevWeekScheduled = 0;
  let prevWeekCompleted = 0;
  for (let i = 7; i < 14; i++) {
    const dStr = getDaysAgo(i);
    const dayRes = calculateDailyScore(habits, completions, dStr);
    prevWeekScheduled += dayRes.scheduledCount;
    prevWeekCompleted += dayRes.completedCount;
  }

  const thisWeekRate = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;
  const prevWeekRate = prevWeekScheduled > 0 ? Math.round((prevWeekCompleted / prevWeekScheduled) * 100) : 0;
  const growthDelta = thisWeekRate - prevWeekRate;

  // Top category
  let topCategory = 'Fitness';
  let topCount = 0;
  Object.entries(categoryDoneMap).forEach(([cat, count]) => {
    if (count > topCount) {
      topCount = count;
      topCategory = cat;
    }
  });

  return (
    <div
      id="weekly-review-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        id="weekly-review-modal-card"
        className="w-full max-w-md bg-[#11092a] border-4 border-yellow-400 shadow-[8px_8px_0px_#000] flex flex-col overflow-hidden text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b-2 border-[#3b2d60] bg-[#090416]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-[#1f1242] border border-yellow-400 flex items-center justify-center text-yellow-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-arcade text-xs sm:text-sm text-yellow-400">STAGE CLEAR DEBRIEF</h2>
              <p className="text-[11px] text-cyan-300 font-retro">
                PAST 7-DAY BATTLE LOG & PROGRESSION
              </p>
            </div>
          </div>
          <button
            id="weekly-review-close-btn"
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Consistency Hero Card */}
          <div className="p-3.5 bg-[#090416] border-2 border-green-400 shadow-[4px_4px_0px_#000] text-center">
            <span className="text-[9px] font-arcade text-green-400 block mb-1">
              OVERALL 7-DAY CLEAR RATE
            </span>
            <div className="text-3xl font-arcade text-yellow-400 mb-1">
              {thisWeekRate}%
            </div>
            <p className="text-[11px] text-cyan-300 font-retro flex items-center justify-center space-x-1">
              <TrendingUp className="w-3.5 h-3.5 text-green-400" />
              <span>
                {growthDelta >= 0 ? `+${growthDelta}% vs previous cycle` : `${growthDelta}% vs previous cycle`}
              </span>
            </p>
          </div>

          {/* Grid Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 bg-[#090416] border-2 border-[#3b2d60] shadow-[2px_2px_0px_#000]">
              <span className="text-[8px] font-arcade text-yellow-400 block mb-0.5">
                EXP EARNED
              </span>
              <div className="text-sm font-arcade text-yellow-400 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>+{totalXpEarned}</span>
              </div>
            </div>

            <div className="p-2.5 bg-[#090416] border-2 border-[#3b2d60] shadow-[2px_2px_0px_#000]">
              <span className="text-[8px] font-arcade text-green-400 block mb-0.5">
                QUESTS CLEARED
              </span>
              <div className="text-sm font-arcade text-green-400 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                <span>{totalCompleted}</span>
              </div>
            </div>

            <div className="p-2.5 bg-[#090416] border-2 border-[#3b2d60] shadow-[2px_2px_0px_#000]">
              <span className="text-[8px] font-arcade text-cyan-400 block mb-0.5">
                PERFECT DAYS
              </span>
              <div className="text-sm font-arcade text-cyan-400 flex items-center space-x-1">
                <Flame className="w-3.5 h-3.5 text-cyan-400" />
                <span>{perfectDays}/7</span>
              </div>
            </div>

            <div className="p-2.5 bg-[#090416] border-2 border-[#3b2d60] shadow-[2px_2px_0px_#000]">
              <span className="text-[8px] font-arcade text-pink-400 block mb-0.5">
                TOP DISCIPLINE
              </span>
              <div className="text-xs font-arcade text-pink-400 truncate">
                {topCategory.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Weekly Takeaway / Insight */}
          <div className="p-3 bg-[#090416] border border-[#3b2d60] text-xs text-slate-300 space-y-1">
            <span className="font-arcade text-[9px] text-yellow-400 flex items-center space-x-1.5">
              <Sparkles className="w-3 h-3 text-yellow-400" />
              <span>COMMAND TACTICAL REPORT</span>
            </span>
            <p className="text-[11px] text-slate-300 font-retro leading-relaxed">
              {growthDelta >= 0
                ? `Sensational discipline, pilot! You achieved a ${thisWeekRate}% clear rate. Continue chaining streaks into the upcoming sector!`
                : 'Solid effort. Regroup and lock down your morning primary protocol to rebuild full battle momentum.'}
            </p>
          </div>

          <button
            id="weekly-review-done-btn"
            onClick={() => {
              playSound('powerup');
              onClose();
            }}
            className="w-full arcade-btn-yellow py-2.5 text-xs font-arcade"
          >
            ENTER NEXT ROUND // GO
          </button>
        </div>
      </div>
    </div>
  );
};
