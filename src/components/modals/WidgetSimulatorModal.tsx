import React, { useState, useEffect } from 'react';
import {
  X,
  Flame,
  Check,
  CheckSquare,
  Sparkles,
  Trophy,
  Smartphone,
  Download,
  Share2,
  ExternalLink,
  Info,
  Maximize2,
  Minimize2,
  Zap,
} from 'lucide-react';
import { Habit, HabitCompletion, UserProfile } from '../../types';
import { getTodayStr } from '../../utils/dateUtils';
import { calculateDailyScore, getRankTier } from '../../utils/gamification';
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
  const [activeTab, setActiveTab] = useState<'widgets' | 'android-guide' | 'ambient-mode'>('widgets');
  const [isAmbientFullscreen, setIsAmbientFullscreen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const todayStr = getTodayStr();
  const dayStats = calculateDailyScore(habits, completions, todayStr);
  const scheduledHabits = habits.filter((h) => !h.isArchived && !h.isPaused);
  const rankTier = getRankTier(user.level || 1);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      setActiveTab('android-guide');
    }
  };

  return (
    <div
      id="widget-simulator-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        id="widget-simulator-modal-card"
        className={`w-full max-w-lg bg-[#11092a] border-4 border-yellow-400 shadow-[8px_8px_0px_#000] flex flex-col overflow-hidden text-slate-100 max-h-[90vh] ${
          isAmbientFullscreen ? 'max-w-3xl h-[85vh]' : ''
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b-2 border-[#3b2d60] bg-[#090416]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-[#1f1242] border border-yellow-400 flex items-center justify-center text-yellow-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-arcade text-xs sm:text-sm text-yellow-400">ARCADE HUD WIDGETS & ANDROID ACCESS</h2>
              <p className="text-[10px] text-cyan-300 font-retro">
                HOMESCREEN MINI-COMPANION & 1-TAP PWA SHORTCUTS
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

        {/* Tab Navigation */}
        <div className="flex border-b-2 border-[#3b2d60] bg-[#150b2e]">
          <button
            id="tab-widgets-preview"
            onClick={() => {
              playSound('click');
              setActiveTab('widgets');
            }}
            className={`flex-1 py-2 text-[9px] sm:text-[10px] font-arcade flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'widgets'
                ? 'bg-[#11092a] text-yellow-400 border-b-2 border-yellow-400 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>HUD WIDGETS</span>
          </button>

          <button
            id="tab-android-guide"
            onClick={() => {
              playSound('click');
              setActiveTab('android-guide');
            }}
            className={`flex-1 py-2 text-[9px] sm:text-[10px] font-arcade flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'android-guide'
                ? 'bg-[#11092a] text-yellow-400 border-b-2 border-yellow-400 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>ANDROID HOMESCREEN</span>
          </button>

          <button
            id="tab-ambient-mode"
            onClick={() => {
              playSound('click');
              setActiveTab('ambient-mode');
            }}
            className={`flex-1 py-2 text-[9px] sm:text-[10px] font-arcade flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'ambient-mode'
                ? 'bg-[#11092a] text-yellow-400 border-b-2 border-yellow-400 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>DESK DOCK HUD</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* TAB 1: HUD WIDGETS */}
          {activeTab === 'widgets' && (
            <div className="space-y-4">
              {/* Quick Info Box */}
              <div className="p-3 bg-[#090416] border border-cyan-500/80 text-[10px] text-cyan-300 font-retro flex items-center justify-between">
                <span>Interactive live check-in: Tap any habit below to mark it done instantly!</span>
                <span className="text-yellow-400 font-arcade text-[9px]">LIVE SYNC</span>
              </div>

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
                      <span>LVL {user.level} {rankTier.name}</span>
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
                    {scheduledHabits.slice(0, 5).map((h) => {
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

              {/* Widget 3: 4x1 Minimalist Streak Ribbon */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-arcade text-yellow-400 uppercase tracking-wider block">
                  WIDGET 3: 4x1 STREAK & XP RIBBON
                </span>
                <div className="p-3 bg-[#090416] border-2 border-amber-500/80 shadow-[4px_4px_0px_#000] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Flame className="w-6 h-6 text-amber-400 fill-amber-400 animate-pulse" />
                    <div>
                      <span className="text-[11px] font-arcade text-amber-300 block">
                        {user.currentStreak}-DAY ACTIVE STREAK
                      </span>
                      <span className="text-[9px] font-retro text-slate-400">
                        LONGEST COMBO: {user.longestStreak || user.currentStreak} DAYS
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-arcade text-yellow-400 block">
                      +{dayStats.completedCount * 25} XP TODAY
                    </span>
                    <span className="text-[9px] font-retro text-cyan-300">
                      RANK: {rankTier.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ANDROID HOMESCREEN SETUP GUIDE */}
          {activeTab === 'android-guide' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-[#090416] border-2 border-yellow-400 shadow-[3px_3px_0px_#000] space-y-2">
                <div className="flex items-center space-x-2 text-yellow-400">
                  <Smartphone className="w-5 h-5" />
                  <h3 className="text-xs font-arcade">HOW ANDROID WEB APPS & SHORTCUTS WORK</h3>
                </div>
                <p className="text-[11px] font-retro text-slate-200 leading-relaxed">
                  Because Buffr is built as a modern Progressive Web App (PWA), you can install it directly onto your Android Home Screen with <strong>Zero App Store downloads</strong>, full standalone fullscreen mode, and 1-tap launcher shortcuts!
                </p>
              </div>

              {/* Step-by-Step Android Setup */}
              <div className="space-y-2.5">
                <span className="text-[9px] font-arcade text-cyan-300 uppercase tracking-wider block">
                  3 STEPS TO ADD TO ANDROID HOME SCREEN:
                </span>

                <div className="p-3 bg-[#090416] border border-[#3b2d60] flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-400 text-black font-arcade font-bold text-xs flex items-center justify-center flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="text-xs font-arcade text-white">OPEN IN CHROME / BRAVE / EDGE</h4>
                    <p className="text-[10px] font-retro text-slate-300 mt-0.5">
                      Open this Buffr web app in Chrome, Brave, Samsung Internet, or Edge on your Android phone.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-[#090416] border border-[#3b2d60] flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-400 text-black font-arcade font-bold text-xs flex items-center justify-center flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs font-arcade text-white">TAP BROWSER MENU (⋮) ➔ "INSTALL APP"</h4>
                    <p className="text-[10px] font-retro text-slate-300 mt-0.5">
                      Tap the 3 dots in the top right corner of your browser and select <strong>"Install App"</strong> (or <strong>"Add to Home screen"</strong>).
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-[#090416] border border-[#3b2d60] flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-400 text-black font-arcade font-bold text-xs flex items-center justify-center flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="text-xs font-arcade text-white">LONG-PRESS ICON FOR QUICK SHORTCUTS</h4>
                    <p className="text-[10px] font-retro text-slate-300 mt-0.5">
                      Once added, long-press the Buffr icon on your home screen to instantly jump to <strong>Today's Habits</strong>, <strong>Daily Debrief</strong>, or <strong>HUD Widgets</strong> without opening the browser!
                    </p>
                  </div>
                </div>
              </div>

              {/* Install button trigger if available */}
              {deferredPrompt && !isInstalled && (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full py-3 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black border-2 border-yellow-200 text-xs font-arcade font-bold shadow-[4px_4px_0px_#000] active:translate-y-0.5 flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4 stroke-[3]" />
                  <span>INSTALL BUFFR TO ANDROID HOME SCREEN NOW</span>
                </button>
              )}
            </div>
          )}

          {/* TAB 3: AMBIENT DESK DOCK HUD */}
          {activeTab === 'ambient-mode' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-[#090416] border-2 border-cyan-400 shadow-[3px_3px_0px_#000] flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-arcade text-cyan-300 block">DESK COMPANION HUD</span>
                  <p className="text-[10px] font-retro text-slate-300">
                    Keep your phone in horizontal/vertical dock mode for real-time habit tracking & timers.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAmbientFullscreen(!isAmbientFullscreen)}
                  className="arcade-btn-cyan px-2.5 py-1 text-[9px] font-arcade flex items-center space-x-1"
                >
                  {isAmbientFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  <span>{isAmbientFullscreen ? 'NORMAL' : 'EXPAND'}</span>
                </button>
              </div>

              {/* Live Ambient Display */}
              <div className="p-6 bg-black border-2 border-[#3b2d60] shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] text-center space-y-4">
                <div className="flex justify-between items-center text-xs font-arcade text-slate-500 border-b border-[#20153f] pb-2">
                  <span>BUFFR HUD // LIVE</span>
                  <span className="text-green-400 animate-pulse">● CONNECTED</span>
                </div>

                <div className="space-y-1">
                  <span className="text-4xl sm:text-5xl font-arcade text-yellow-400 tracking-wider">
                    {dayStats.completedCount} / {dayStats.scheduledCount}
                  </span>
                  <p className="text-xs font-arcade text-cyan-300">
                    DAILY OBJECTIVES COMPLETED ({dayStats.score}%)
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  <div className="p-2 bg-[#0d061f] border border-[#3b2d60]">
                    <span className="text-[8px] font-arcade text-slate-400 block">COMBO</span>
                    <span className="text-xs font-arcade text-amber-400">x{user.currentStreak} DAYS</span>
                  </div>
                  <div className="p-2 bg-[#0d061f] border border-[#3b2d60]">
                    <span className="text-[8px] font-arcade text-slate-400 block">CHARACTER</span>
                    <span className="text-xs font-arcade text-yellow-400">LV.{user.level}</span>
                  </div>
                  <div className="p-2 bg-[#0d061f] border border-[#3b2d60]">
                    <span className="text-[8px] font-arcade text-slate-400 block">TIER</span>
                    <span className="text-xs font-arcade text-purple-400">{rankTier.name}</span>
                  </div>
                  <div className="p-2 bg-[#0d061f] border border-[#3b2d60]">
                    <span className="text-[8px] font-arcade text-slate-400 block">STATUS</span>
                    <span className="text-xs font-arcade text-green-400">{dayStats.label}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t-2 border-[#3b2d60] bg-[#090416] flex items-center justify-between text-[10px] text-cyan-300 font-retro">
          <span>BUFFR HUD // ZERO BATTERY CONSUMPTION ARCHITECTURE</span>
          <button
            type="button"
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="py-1.5 px-4 bg-[#1e1338] border border-slate-600 text-white font-arcade text-[9px] hover:bg-[#2c1b52]"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
};
