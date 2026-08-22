import React from 'react';
import { X, Flame, Check, CheckSquare, Sparkles, Trophy } from 'lucide-react';
import { Habit, HabitCompletion, UserProfile } from '../../types';
import { getTodayStr } from '../../utils/dateUtils';
import { calculateDailyScore } from '../../utils/gamification';
import { playSound } from '../../utils/sound';

interface WidgetSimulatorModalProps {
  isOpen: boolean;
  user: UserProfile;
  habits: Habit[];
  completions: HabitCompletion[];
  onToggleHabit: (habitId: string) => void;
  onClose: () => void;
}

export const WidgetSimulatorModal: React.FC<WidgetSimulatorModalProps> = ({
  isOpen,
  user,
  habits,
  completions,
  onToggleHabit,
  onClose,
}) => {
  if (!isOpen) return null;

  const todayStr = getTodayStr();
  const dayStats = calculateDailyScore(habits, completions, todayStr);
  const scheduledHabits = habits.filter((h) => !h.isArchived && !h.isPaused);

  return (
    <div
      id="widget-simulator-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        id="widget-simulator-modal-card"
        className="w-full max-w-lg bg-[#11092a] border-4 border-yellow-400 shadow-[8px_8px_0px_#000] flex flex-col overflow-hidden text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b-2 border-[#3b2d60] bg-[#090416]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-[#1f1242] border border-yellow-400 flex items-center justify-center text-yellow-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-arcade text-xs sm:text-sm text-yellow-400">ARCADE HUD WIDGETS</h2>
              <p className="text-[11px] text-cyan-300 font-retro">
                HOMESCREEN MINI-COMPANION APPS PREVIEW
              </p>
            </div>
          </div>
          <button
            id="widget-modal-close-btn"
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
          {/* Widget 1: Today's Circular Progress & Streak */}
          <div className="space-y-1.5">
            <span className="text-[9px] font-arcade text-yellow-400 uppercase tracking-wider block">
              WIDGET 1: COMPACT 2x2 PROGRESS & COMBO
            </span>
            <div className="p-3.5 bg-[#090416] border-2 border-[#3b2d60] shadow-[4px_4px_0px_#000] flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-1.5">
                  <div className="w-5 h-5 bg-yellow-400 text-black flex items-center justify-center text-xs font-arcade font-bold">
                    B
                  </div>
                  <span className="text-xs font-arcade text-white">BUFFR</span>
                </div>
                <div className="text-xl font-arcade text-yellow-400">
                  {dayStats.completedCount} / {dayStats.scheduledCount}
                </div>
                <p className="text-[10px] text-green-400 font-retro">
                  {dayStats.score}% • {dayStats.label.toUpperCase()}
                </p>
              </div>

              <div className="flex flex-col items-end space-y-1.5">
                <div className="flex items-center space-x-1 px-2 py-0.5 bg-[#291e0a] border border-amber-400 text-yellow-300 text-xs font-retro">
                  <Flame className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span>{user.currentStreak}D COMBO</span>
                </div>
                <div className="flex items-center space-x-1 px-2 py-0.5 bg-[#170e33] border border-[#3b2d60] text-[9px] text-cyan-300 font-arcade">
                  <Trophy className="w-3 h-3 text-yellow-400" />
                  <span>LVL {user.level}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Widget 2: 4x2 Interactive Quick Checklist */}
          <div className="space-y-1.5">
            <span className="text-[9px] font-arcade text-yellow-400 uppercase tracking-wider block">
              WIDGET 2: 4x2 INTERACTIVE QUICK DISPATCH
            </span>
            <div className="p-3.5 bg-[#090416] border-2 border-[#3b2d60] shadow-[4px_4px_0px_#000] space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-[#3b2d60]">
                <span className="text-[10px] font-arcade text-white flex items-center space-x-1.5">
                  <CheckSquare className="w-3 h-3 text-green-400" />
                  <span>TODAY’S QUEST LOG</span>
                </span>
                <span className="text-[9px] text-cyan-300 font-retro">
                  {dayStats.completedCount} COMPLETED
                </span>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {scheduledHabits.slice(0, 4).map((h) => {
                  const isDone = completions.some(
                    (c) => c.habitId === h.id && c.dateStr === todayStr && c.isCompleted
                  );

                  return (
                    <div
                      key={h.id}
                      onClick={() => {
                        playSound(isDone ? 'click' : 'complete');
                        onToggleHabit(h.id);
                      }}
                      className={`flex items-center justify-between p-2 border transition-all cursor-pointer ${
                        isDone
                          ? 'bg-[#0d261b] border-green-400 text-green-300'
                          : 'bg-[#150b2e] border-[#3b2d60] text-slate-300 hover:border-yellow-400'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <span className="text-sm">{h.emoji}</span>
                        <span className="text-xs font-retro truncate">{h.title}</span>
                      </div>
                      <div
                        className={`w-5 h-5 flex items-center justify-center border ${
                          isDone
                            ? 'bg-green-500 border-green-500 text-black'
                            : 'border-[#3b2d60] bg-[#090416]'
                        }`}
                      >
                        {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-[#090416] border border-[#3b2d60] text-[10px] text-cyan-300 font-retro text-center">
            ANDRO-GLANCE ARCHITECTURE // REAL-TIME ZERO POWER DRAIN SYNC
          </div>
        </div>
      </div>
    </div>
  );
};
