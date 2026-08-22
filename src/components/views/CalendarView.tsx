import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Sparkles,
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  Moon,
  Zap,
} from 'lucide-react';
import { Habit, HabitCompletion, DailyReflection } from '../../types';
import {
  getMonthMatrix,
  formatDisplayDate,
  formatDate,
  getTodayStr,
  getYearHeatmapDates,
} from '../../utils/dateUtils';
import { calculateDailyScore } from '../../utils/gamification';

interface CalendarViewProps {
  habits: Habit[];
  completions: HabitCompletion[];
  reflections: DailyReflection[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  habits,
  completions,
  reflections,
}) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonthIndex, setCurrentMonthIndex] = useState(today.getMonth());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(getTodayStr());
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');

  const monthNames = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
  ];

  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonthIndex((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonthIndex((m) => m + 1);
    }
  };

  const monthMatrix = getMonthMatrix(currentYear, currentMonthIndex);

  // Selected date stats
  const selectedDayStats = calculateDailyScore(habits, completions, selectedDateStr);
  const selectedReflection = reflections.find((r) => r.dateStr === selectedDateStr);

  const selectedHabitStatuses = habits.map((h) => {
    const comp = completions.find((c) => c.habitId === h.id && c.dateStr === selectedDateStr);
    return {
      habit: h,
      isCompleted: comp ? comp.isCompleted : false,
      progressValue: comp ? comp.progressValue : 0,
      reasonMissed: comp?.reasonMissed,
    };
  });

  const scheduledForSelected = selectedHabitStatuses.filter((s) => !s.habit.isArchived);

  // Intensity color helper for date cell
  const getDayIntensity = (dateStr: string | null) => {
    if (!dateStr) return { bg: 'bg-transparent', border: 'border-transparent', text: 'text-transparent', scoreDot: 'bg-transparent', score: 0 };

    const { score, scheduledCount } = calculateDailyScore(habits, completions, dateStr);
    const isToday = dateStr === getTodayStr();
    const isSelected = dateStr === selectedDateStr;

    let baseBg = 'bg-[#0e0722]';
    let baseBorder = isSelected ? 'border-yellow-400 shadow-[0_0_8px_#facc15]' : 'border-[#2f2352]';
    let scoreDot = 'bg-slate-700';

    if (scheduledCount > 0) {
      if (score === 100) {
        baseBg = 'bg-[#1b3820]';
        baseBorder = isSelected ? 'border-yellow-400 shadow-[0_0_8px_#facc15]' : 'border-green-400';
        scoreDot = 'bg-yellow-400';
      } else if (score >= 80) {
        baseBg = 'bg-[#0f2d1e]';
        baseBorder = isSelected ? 'border-yellow-400' : 'border-emerald-500';
        scoreDot = 'bg-emerald-400';
      } else if (score >= 50) {
        baseBg = 'bg-[#102533]';
        baseBorder = isSelected ? 'border-yellow-400' : 'border-cyan-600';
        scoreDot = 'bg-cyan-400';
      } else if (score > 0) {
        baseBg = 'bg-[#1c1833]';
        baseBorder = isSelected ? 'border-yellow-400' : 'border-purple-600';
        scoreDot = 'bg-purple-400';
      } else {
        baseBg = 'bg-[#090416]';
        baseBorder = isSelected ? 'border-yellow-400' : 'border-slate-800';
        scoreDot = 'bg-slate-700';
      }
    }

    return {
      bg: baseBg,
      border: baseBorder,
      text: isToday ? 'text-yellow-400 font-bold' : 'text-slate-200',
      scoreDot,
      score,
    };
  };

  const heatmapDates = getYearHeatmapDates(40);

  return (
    <div id="calendar-view-container" className="p-3 sm:p-6 max-w-4xl mx-auto space-y-4 sm:space-y-6 pb-28">
      {/* Header with Month / Year Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#11092a] border-2 border-[#3b2d60] p-3 sm:p-4 shadow-[3px_3px_0px_#05020a]">
        <div>
          <h1 className="text-base sm:text-lg font-arcade text-yellow-400 tracking-wider flex items-center space-x-2">
            <span>TIME MATRIX LOG</span>
            <CalendarIcon className="w-4 h-4 text-cyan-400" />
          </h1>
          <p className="text-xs text-cyan-300 font-retro mt-0.5">
            CHRONOLOGICAL STREAKS, MISSION CLEAR HISTORY & BOSS RECORDS
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* View toggle */}
          <div className="flex bg-[#090416] border-2 border-[#3b2d60] p-0.5 shadow-[2px_2px_0px_#000]">
            <button
              id="cal-view-monthly-btn"
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1 text-[9px] sm:text-[10px] font-arcade transition-all ${
                viewMode === 'monthly' ? 'bg-yellow-400 text-black font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              MONTH
            </button>
            <button
              id="cal-view-yearly-btn"
              onClick={() => setViewMode('yearly')}
              className={`px-3 py-1 text-[9px] sm:text-[10px] font-arcade transition-all ${
                viewMode === 'yearly' ? 'bg-yellow-400 text-black font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              HEATMAP
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'monthly' ? (
        <div className="space-y-4">
          {/* Month Navigation & Grid */}
          <div className="p-3 sm:p-4 bg-[#11092a] border-2 border-[#3b2d60] shadow-[3px_3px_0px_#05020a] space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs sm:text-sm font-arcade text-yellow-400">
                {monthNames[currentMonthIndex]} {currentYear}
              </h2>
              <div className="flex items-center space-x-1">
                <button
                  id="cal-prev-month-btn"
                  onClick={handlePrevMonth}
                  className="p-1.5 sm:p-2 bg-[#1f1242] hover:bg-[#2d1b5e] border-2 border-[#55408a] text-slate-300 shadow-[1px_1px_0px_#000] active:translate-y-0.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  id="cal-next-month-btn"
                  onClick={handleNextMonth}
                  className="p-1.5 sm:p-2 bg-[#1f1242] hover:bg-[#2d1b5e] border-2 border-[#55408a] text-slate-300 shadow-[1px_1px_0px_#000] active:translate-y-0.5"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Day of week headers */}
            <div className="grid grid-cols-7 gap-1 text-center text-[9px] sm:text-[10px] font-arcade text-cyan-400 bg-[#090416] py-1 border border-[#3b2d60]">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d) => (
                <div key={d} className="py-0.5">
                  {d}
                </div>
              ))}
            </div>

            {/* Matrix Calendar Days */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
              {monthMatrix.map((week, wIdx) =>
                week.map((dateStr, dIdx) => {
                  if (!dateStr) {
                    return <div key={`${wIdx}-${dIdx}`} className="aspect-square opacity-0" />;
                  }

                  const dayNum = parseInt(dateStr.slice(8), 10);
                  const style = getDayIntensity(dateStr);

                  return (
                    <div
                      key={dateStr}
                      id={`cal-day-${dateStr}`}
                      onClick={() => setSelectedDateStr(dateStr)}
                      className={`aspect-square border-2 p-1 flex flex-col justify-between items-center cursor-pointer transition-all duration-100 touch-target-min hover:scale-105 ${style.bg} ${style.border}`}
                    >
                      <span className={`text-[10px] sm:text-xs font-arcade ${style.text}`}>{dayNum}</span>
                      <div className={`w-2 h-2 ${style.scoreDot} border border-black`} />
                    </div>
                  );
                })
              )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[9px] font-arcade text-slate-400 pt-2 border-t-2 border-[#2f2352]">
              <span className="text-yellow-400">CLEAR RATE:</span>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="flex items-center space-x-1">
                  <div className="w-2.5 h-2.5 bg-slate-700 border border-black" />
                  <span>0%</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2.5 h-2.5 bg-purple-500 border border-black" />
                  <span>1-49%</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2.5 h-2.5 bg-cyan-400 border border-black" />
                  <span>50-79%</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2.5 h-2.5 bg-emerald-400 border border-black" />
                  <span>80-99%</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2.5 h-2.5 bg-yellow-400 border border-black" />
                  <span className="text-yellow-300">100% S-RANK</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 52-Week GitHub Style Heatmap */
        <div className="p-4 bg-[#11092a] border-2 border-[#3b2d60] shadow-[3px_3px_0px_#05020a] space-y-3">
          <div>
            <h2 className="text-xs sm:text-sm font-arcade text-yellow-400">
              YEARLY HABIT MATRIX (PAST 40 WEEKS)
            </h2>
            <p className="text-xs text-cyan-300 font-retro mt-0.5">
              Click any pixel in the memory bank to inspect mission logs.
            </p>
          </div>

          <div className="overflow-x-auto py-2">
            <div className="grid grid-rows-7 grid-flow-col gap-1 min-w-[600px] p-2 bg-[#090416] border-2 border-[#2f2352]">
              {heatmapDates.map((dateStr) => {
                const style = getDayIntensity(dateStr);
                return (
                  <div
                    key={dateStr}
                    onClick={() => setSelectedDateStr(dateStr)}
                    className={`w-3.5 h-3.5 cursor-pointer border transition-transform hover:scale-125 ${style.bg} ${style.border}`}
                    title={`${dateStr}: ${style.score}% Completion`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Selected Day Detailed Breakdown Card */}
      <div className="p-3 sm:p-4 bg-[#11092a] border-2 border-[#3b2d60] shadow-[3px_3px_0px_#05020a] space-y-3">
        <div className="flex items-center justify-between pb-2.5 border-b-2 border-[#2f2352]">
          <div>
            <span className="text-[8px] sm:text-[9px] font-arcade text-cyan-400 block">
              MISSION ARCHIVE REPLAY
            </span>
            <h3 className="text-xs sm:text-sm font-arcade text-yellow-300 mt-0.5">
              {formatDisplayDate(selectedDateStr).toUpperCase()}
            </h3>
          </div>

          <div className="text-right">
            <span className={`text-base sm:text-lg font-arcade ${selectedDayStats.color}`}>
              {selectedDayStats.score}%
            </span>
            <span className="text-[9px] text-slate-400 font-arcade block">
              {selectedDayStats.completedCount}/{selectedDayStats.scheduledCount} CLEARED
            </span>
          </div>
        </div>

        {/* Habits list on this day */}
        <div className="space-y-2">
          {scheduledForSelected.length === 0 ? (
            <p className="text-xs text-cyan-300 font-retro py-2">NO MISSIONS LOGGED ON THIS CYCLE.</p>
          ) : (
            scheduledForSelected.map(({ habit, isCompleted, reasonMissed }) => (
              <div
                key={habit.id}
                className={`p-2.5 sm:p-3 border-2 flex items-center justify-between ${
                  isCompleted
                    ? 'bg-[#0d1f18] border-emerald-500 text-green-300 shadow-[2px_2px_0px_#000]'
                    : 'bg-[#0e0722] border-[#2f2352] text-slate-400'
                }`}
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <span className="text-base sm:text-lg">{habit.emoji}</span>
                  <div className="truncate">
                    <span className="text-[11px] sm:text-xs font-arcade text-white block truncate">{habit.title}</span>
                    <span className="text-[10px] text-cyan-300 font-retro">
                      {habit.category} • +{habit.xpReward} PTS
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {isCompleted ? (
                    <div className="flex items-center space-x-1 text-green-400 text-[10px] font-arcade">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>CLEARED</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-red-400 text-[10px] font-arcade">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{reasonMissed ? reasonMissed.toUpperCase() : 'MISSED'}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Reflection if recorded */}
        {selectedReflection && (
          <div className="p-3 bg-[#170e36] border-2 border-indigo-500 text-xs space-y-1.5 shadow-[2px_2px_0px_#000]">
            <div className="flex items-center justify-between text-indigo-300 font-arcade text-[10px]">
              <span className="flex items-center space-x-1">
                <Moon className="w-3.5 h-3.5" />
                <span>EVENING REPLAY LOG</span>
              </span>
              <span className="uppercase text-yellow-300">MOOD: {selectedReflection.mood}</span>
            </div>
            {selectedReflection.whatWentWell && (
              <p className="text-slate-200 font-retro text-xs">
                <strong className="text-green-400 font-arcade text-[10px]">VICTORIES:</strong> {selectedReflection.whatWentWell}
              </p>
            )}
            {selectedReflection.whatCouldImprove && (
              <p className="text-slate-300 font-retro text-xs">
                <strong className="text-amber-400 font-arcade text-[10px]">TACTICAL ADJUSTMENTS:</strong> {selectedReflection.whatCouldImprove}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
