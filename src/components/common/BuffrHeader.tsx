import React from 'react';
import {
  Flame,
  Volume2,
  VolumeX,
  Smartphone,
  Maximize2,
  Gamepad2,
  LayoutGrid,
  Heart,
  Cloud,
  CheckCircle2,
  LogIn,
  Loader2,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { useAuth } from '../../firebase/AuthContext';

interface BuffrHeaderProps {
  user: UserProfile;
  todayXpEarned?: number;
  onToggleSound?: () => void;
  onTogglePhoneFrame?: () => void;
  onToggleDeviceFrame?: () => void;
  isDeviceFrameEnabled?: boolean;
  onOpenWidgetSimulator?: () => void;
  onOpenCreateHabit?: () => void;
  onOpenLevelUpModal?: () => void;
}

export const BuffrHeader: React.FC<BuffrHeaderProps> = ({
  user,
  todayXpEarned = 0,
  onToggleSound,
  onTogglePhoneFrame,
  onToggleDeviceFrame,
  isDeviceFrameEnabled,
  onOpenWidgetSimulator,
}) => {
  const isFramed = isDeviceFrameEnabled ?? user.isPhoneFrame ?? false;
  const handleToggleFrame = onToggleDeviceFrame || onTogglePhoneFrame;
  const { currentUser, syncStatus, signInWithGoogle, syncNow, loading } = useAuth();

  return (
    <header
      id="buffr-main-header"
      className="sticky top-0 z-30 w-full bg-[#0d0720]/95 backdrop-blur-md border-b-2 border-[#3b2d60] px-2.5 sm:px-4 py-2 sm:py-2.5 shadow-[0_4px_0_#05020a]"
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Brand identity - Arcade Style */}
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <div className="relative flex-shrink-0 flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 bg-yellow-400 border-2 border-yellow-200 text-black shadow-[2px_2px_0px_#000]">
            <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 stroke-[2.5]" />
            <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-500 border border-black animate-ping" />
            <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-500 border border-black" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1 sm:space-x-1.5">
              <span className="font-arcade text-xs sm:text-sm text-yellow-400 tracking-wider neon-text-yellow truncate">
                BUFFR
              </span>
              <span className="px-1 py-0.2 rounded-none text-[8px] sm:text-[9px] font-arcade bg-pink-500 text-white border border-pink-300 shadow-[1px_1px_0px_#000]">
                {currentUser ? 'ONLINE' : '1P'}
              </span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 text-[9px] sm:text-xs font-retro text-cyan-300 tracking-wide truncate">
              <span className="text-yellow-300 font-bold truncate">LV.{user.level}</span>
              <span>•</span>
              <span className="text-green-400">+{todayXpEarned}P</span>
            </div>
          </div>
        </div>

        {/* Stats & Arcade HUD Actions */}
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          {/* Cloud Auth / Sync Button */}
          {currentUser ? (
            <button
              onClick={syncNow}
              className={`flex items-center space-x-1 px-1.5 sm:px-2 py-1 border-2 text-[8px] sm:text-[10px] font-arcade shadow-[2px_2px_0px_#000] active:translate-y-0.5 transition-all ${
                syncStatus === 'syncing'
                  ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                  : syncStatus === 'error'
                  ? 'bg-rose-950/60 border-rose-500 text-rose-300'
                  : 'bg-[#122822] border-emerald-500 text-emerald-300'
              }`}
              title={`Cloud Synced: ${currentUser.email || currentUser.displayName || 'Google Account'}. Click to force sync.`}
            >
              {syncStatus === 'syncing' ? (
                <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
              ) : syncStatus === 'error' ? (
                <Cloud className="w-3 h-3 text-rose-400" />
              ) : (
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              )}
              <span className="hidden sm:inline">
                {syncStatus === 'syncing' ? 'SYNC' : 'CLOUD'}
              </span>
            </button>
          ) : (
            <button
              onClick={signInWithGoogle}
              disabled={loading}
              className="flex items-center space-x-1 px-1.5 sm:px-2 py-1 bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 border-2 border-cyan-400 text-cyan-200 text-[8px] sm:text-[10px] font-arcade shadow-[2px_2px_0px_#000] active:translate-y-0.5 transition-all"
              title="Sign in with Google to enable Real-time Cloud Save & Multi-Device Sync"
            >
              <LogIn className="w-3 h-3 text-cyan-300" />
              <span className="hidden xs:inline sm:inline">G-SYNC</span>
            </button>
          )}

          {/* Combo / Streak pill */}
          <div
            id="header-streak-pill"
            className="flex items-center space-x-0.5 sm:space-x-1 px-1.5 sm:px-2 py-1 bg-[#1a0f35] border-2 border-amber-500/80 text-amber-300 text-[9px] sm:text-xs font-arcade shadow-[2px_2px_0px_#000]"
            title="Active Streak Combo"
          >
            <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
            <span>x{user.currentStreak}</span>
          </div>

          {/* Lives / Streak Freeze Counter */}
          <div
            className="flex items-center space-x-0.5 sm:space-x-1 px-1.5 sm:px-2 py-1 bg-[#1a0f35] border-2 border-pink-500/80 text-pink-300 text-[9px] sm:text-xs font-arcade shadow-[2px_2px_0px_#000]"
            title={`${user.streakFreezesRemaining || user.streakFreezes || 0} Streak Freezes (Lives Remaining)`}
          >
            <Heart className="w-3 h-3 text-pink-400 fill-pink-400" />
            <span>{user.streakFreezesRemaining ?? user.streakFreezes ?? 0}</span>
          </div>

          {/* Widgets Simulator launcher - Visible on desktop */}
          {onOpenWidgetSimulator && (
            <button
              id="header-btn-widgets"
              onClick={onOpenWidgetSimulator}
              className="hidden md:flex p-1.5 sm:p-2 bg-[#1e143f] hover:bg-[#2c1d5e] border-2 border-cyan-500 text-cyan-300 shadow-[2px_2px_0px_#000] active:translate-y-0.5 transition-all"
              title="Android Home-Screen Widgets Simulator"
            >
              <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
            </button>
          )}

          {/* Sound Toggle */}
          {onToggleSound && (
            <button
              id="header-btn-sound"
              onClick={onToggleSound}
              className="p-1 sm:p-2 bg-[#1e143f] hover:bg-[#2c1d5e] border-2 border-purple-500 text-purple-300 shadow-[2px_2px_0px_#000] active:translate-y-0.5 transition-all"
              title={user.soundEnabled ? 'Mute 8-Bit Audio' : 'Enable 8-Bit Chiptune Audio'}
            >
              {user.soundEnabled ? (
                <Volume2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
              ) : (
                <VolumeX className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500" />
              )}
            </button>
          )}

          {/* Phone Frame vs Full Desktop Toggle - Hidden on small mobile screens */}
          {handleToggleFrame && (
            <button
              id="header-btn-viewport-toggle"
              onClick={handleToggleFrame}
              className={`hidden md:flex p-1.5 sm:p-2 border-2 shadow-[2px_2px_0px_#000] active:translate-y-0.5 transition-all ${
                isFramed
                  ? 'bg-yellow-400 border-yellow-200 text-black font-bold'
                  : 'bg-[#1e143f] border-slate-700 text-slate-300 hover:bg-[#2c1d5e]'
              }`}
              title={isFramed ? 'Switch to Full Dashboard Mode' : 'Switch to Android Phone Simulator'}
            >
              {isFramed ? (
                <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : (
                <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};


