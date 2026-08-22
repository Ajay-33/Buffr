import React, { useState } from 'react';
import {
  X,
  Flame,
  Award,
  Calendar,
  Pause,
  Play,
  Archive,
  Trash2,
  Edit,
  TrendingUp,
} from 'lucide-react';
import { Habit, HabitCompletion } from '../../types';
import { calculateHabitStreak } from '../../utils/gamification';
import { getDaysAgo, formatDisplayDate } from '../../utils/dateUtils';
import { playSound } from '../../utils/sound';

interface HabitDetailModalProps {
  isOpen: boolean;
  habit: Habit | null;
  completions: HabitCompletion[];
  onClose: () => void;
  onEditHabit: (habit: Habit) => void;
  onTogglePauseHabit: (habitId: string, pauseReason?: string) => void;
  onToggleArchiveHabit: (habitId: string) => void;
  onDeleteHabit: (habitId: string) => void;
}

export const HabitDetailModal: React.FC<HabitDetailModalProps> = ({
  isOpen,
  habit,
  completions,
  onClose,
  onEditHabit,
  onTogglePauseHabit,
  onToggleArchiveHabit,
  onDeleteHabit,
}) => {
  const [pauseReasonInput, setPauseReasonInput] = useState('');
  const [showPauseInput, setShowPauseInput] = useState(false);

  if (!isOpen || !habit) return null;

  const streakStats = calculateHabitStreak(habit, completions);

  // Calculate 7-day, 30-day, and 90-day completion rates
  const getRate = (days: number) => {
    let completed = 0;
    for (let i = 0; i < days; i++) {
      const dStr = getDaysAgo(i);
      const isDone = completions.some(
        (c) => c.habitId === habit.id && c.dateStr === dStr && c.isCompleted
      );
      if (isDone) completed++;
    }
    return Math.round((completed / days) * 100);
  };

  const rate7d = getRate(7);
  const rate30d = getRate(30);

  // Last 14 days log list
  const recentLogs: { dateStr: string; isCompleted: boolean; progressValue: number }[] = [];
  for (let i = 0; i < 14; i++) {
    const dStr = getDaysAgo(i);
    const comp = completions.find((c) => c.habitId === habit.id && c.dateStr === dStr);
    recentLogs.push({
      dateStr: dStr,
      isCompleted: comp ? comp.isCompleted : false,
      progressValue: comp ? comp.progressValue : 0,
    });
  }

  const handlePauseSubmit = () => {
    playSound('click');
    onTogglePauseHabit(habit.id, pauseReasonInput.trim() || 'Temporary pause');
    setShowPauseInput(false);
  };

  return (
    <div
      id="habit-detail-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        id="habit-detail-modal-card"
        className="w-full max-w-lg max-h-[90vh] bg-[#11092a] border-4 border-yellow-400 shadow-[8px_8px_0px_#000] flex flex-col overflow-hidden text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b-2 border-[#3b2d60] bg-[#090416]">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 flex items-center justify-center text-xl border-2 bg-[#090416]"
              style={{ borderColor: habit.color }}
            >
              {habit.emoji}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-arcade text-xs sm:text-sm text-yellow-400">{habit.title}</h2>
                {habit.isPaused && (
                  <span className="px-1.5 py-0.5 text-[8px] font-arcade bg-amber-400 text-black font-bold">
                    PAUSED
                  </span>
                )}
              </div>
              <p className="text-[11px] text-cyan-300 font-retro">
                {habit.category.toUpperCase()} • {habit.timeOfDay.toUpperCase()} • +{habit.xpReward} PTS
              </p>
            </div>
          </div>
          <button
            id="habit-detail-close-btn"
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Streak & Stats Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 bg-[#090416] border-2 border-[#3b2d60] text-center shadow-[2px_2px_0px_#000]">
              <div className="flex items-center justify-center space-x-1 text-yellow-400 mb-0.5">
                <Flame className="w-3 h-3 fill-yellow-400" />
                <span className="text-[8px] font-arcade">COMBO</span>
              </div>
              <span className="text-sm font-arcade text-white">
                {streakStats.currentStreak}D
              </span>
              <p className="text-[10px] text-cyan-300 font-retro">BEST: {streakStats.longestStreak}D</p>
            </div>

            <div className="p-2.5 bg-[#090416] border-2 border-[#3b2d60] text-center shadow-[2px_2px_0px_#000]">
              <div className="flex items-center justify-center space-x-1 text-green-400 mb-0.5">
                <TrendingUp className="w-3 h-3" />
                <span className="text-[8px] font-arcade">30D RATE</span>
              </div>
              <span className="text-sm font-arcade text-green-400">{rate30d}%</span>
              <p className="text-[10px] text-cyan-300 font-retro">7D: {rate7d}%</p>
            </div>

            <div className="p-2.5 bg-[#090416] border-2 border-[#3b2d60] text-center shadow-[2px_2px_0px_#000]">
              <div className="flex items-center justify-center space-x-1 text-cyan-400 mb-0.5">
                <Award className="w-3 h-3" />
                <span className="text-[8px] font-arcade">TOTAL</span>
              </div>
              <span className="text-sm font-arcade text-cyan-400">
                {streakStats.totalCompletions}
              </span>
              <p className="text-[10px] text-yellow-300 font-retro">+{streakStats.totalCompletions * habit.xpReward} PTS</p>
            </div>
          </div>

          {/* Description / Notes if any */}
          {habit.description && (
            <div className="p-2.5 bg-[#090416] border border-[#3b2d60] text-xs text-slate-300 font-retro">
              <span className="font-arcade text-[8px] text-yellow-400 block mb-0.5">
                PROTOCOL DIRECTIVES:
              </span>
              {habit.description}
            </div>
          )}

          {/* 14-Day Timeline matrix */}
          <div>
            <span className="text-[9px] font-arcade text-cyan-400 tracking-wider flex items-center space-x-1.5 mb-1.5">
              <Calendar className="w-3 h-3 text-green-400" />
              <span>RECENT 14-DAY LOG MATRIX</span>
            </span>
            <div className="grid grid-cols-7 gap-1">
              {recentLogs.slice().reverse().map((log, idx) => (
                <div
                  key={idx}
                  className={`p-1.5 border text-center transition-all ${
                    log.isCompleted
                      ? 'bg-[#0e2c1c] border-green-400 text-green-400'
                      : 'bg-[#090416] border-[#3b2d60] text-slate-500'
                  }`}
                  title={`${log.dateStr}: ${log.isCompleted ? 'Completed' : 'Missed'}`}
                >
                  <span className="text-[8px] font-retro block">{formatDisplayDate(log.dateStr).slice(0, 3).toUpperCase()}</span>
                  <span className="text-[9px] font-arcade">{log.dateStr.slice(8)}</span>
                  <div className="mt-0.5 flex justify-center">
                    <div
                      className={`w-1.5 h-1.5 ${
                        log.isCompleted ? 'bg-green-400' : 'bg-slate-700'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pause Reason input if expanding */}
          {showPauseInput && (
            <div className="p-3 bg-[#241a06] border-2 border-amber-400 space-y-2">
              <label className="text-[9px] font-arcade text-amber-300 block">
                REASON FOR PAUSING (REST, TRAVEL, SICK...)
              </label>
              <input
                id="habit-pause-reason-input"
                type="text"
                placeholder="e.g. Flu, Tournament, Vacation..."
                value={pauseReasonInput}
                onChange={(e) => setPauseReasonInput(e.target.value)}
                className="w-full bg-[#090416] border border-amber-400 px-2.5 py-1 text-xs text-white focus:outline-none font-arcade"
              />
              <div className="flex space-x-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowPauseInput(false)}
                  className="px-2.5 py-1 bg-slate-800 text-[9px] font-arcade text-slate-300"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={handlePauseSubmit}
                  className="arcade-btn-yellow px-2.5 py-1 text-[9px] font-arcade"
                >
                  CONFIRM PAUSE
                </button>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-2 border-t-2 border-[#3b2d60]">
            <button
              id="detail-btn-edit"
              onClick={() => {
                playSound('click');
                onClose();
                onEditHabit(habit);
              }}
              className="arcade-btn-cyan py-2 px-2 text-[9px] font-arcade flex items-center justify-center space-x-1"
            >
              <Edit className="w-3 h-3" />
              <span>EDIT</span>
            </button>

            <button
              id="detail-btn-pause"
              onClick={() => {
                playSound('click');
                if (habit.isPaused) {
                  onTogglePauseHabit(habit.id);
                } else {
                  setShowPauseInput(true);
                }
              }}
              className="arcade-btn-yellow py-2 px-2 text-[9px] font-arcade flex items-center justify-center space-x-1"
            >
              {habit.isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
              <span>{habit.isPaused ? 'RESUME' : 'PAUSE'}</span>
            </button>

            <button
              id="detail-btn-archive"
              onClick={() => {
                playSound('click');
                onToggleArchiveHabit(habit.id);
                onClose();
              }}
              className="arcade-btn-pink py-2 px-2 text-[9px] font-arcade flex items-center justify-center space-x-1"
            >
              <Archive className="w-3 h-3" />
              <span>{habit.isArchived ? 'RESTORE' : 'ARCHIVE'}</span>
            </button>

            <button
              id="detail-btn-delete"
              onClick={() => {
                playSound('click');
                if (confirm(`Delete "${habit.title}" permanently from memory bank?`)) {
                  onDeleteHabit(habit.id);
                  onClose();
                }
              }}
              className="py-2 px-2 bg-red-950 border border-red-500 text-[9px] font-arcade text-red-400 hover:bg-red-900 flex items-center justify-center space-x-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>DELETE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
