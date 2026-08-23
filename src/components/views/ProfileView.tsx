import React, { useState, useRef } from 'react';
import {
  User,
  Shield,
  Award,
  Flame,
  Volume2,
  VolumeX,
  Vibrate,
  Smartphone,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Layers,
  Edit,
  Check,
  Pause,
  Play,
  Archive,
  Trash2,
  FileText,
  Gamepad2,
  Terminal,
  Cloud,
  CheckCircle2,
  KeyRound,
  LogOut,
  RefreshCw,
  AlertTriangle,
  X,
  Lock,
  Zap,
  Camera,
  LayoutGrid,
} from 'lucide-react';
import { Habit, UserProfile, XPTransaction } from '../../types';
import {
  calculateLevelFromTotalXp,
  getRankTier,
  getUnlockedTitlesForLevel,
  isStreakShieldActive,
  getHighestUnlockedTitle,
} from '../../utils/gamification';
import { exportDataAsJson, exportCompletionsAsCsv, importDataFromJson } from '../../storage/db';
import { playSound } from '../../utils/sound';
import { useAuth } from '../../firebase/AuthContext';
import { AvatarPickerModal } from '../modals/AvatarPickerModal';


interface ProfileViewProps {
  user: UserProfile;
  habits: Habit[];
  xpTransactions: XPTransaction[];
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onEditHabit: (habit: Habit) => void;
  onTogglePauseHabit: (habitId: string, pauseReason?: string) => void;
  onToggleArchiveHabit: (habitId: string) => void;
  onDeleteHabit: (habitId: string) => void;
  onResetDemoData: () => void;
  onResetFreshData?: () => void;
  onDataImportSuccess: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  habits,
  xpTransactions,
  onUpdateUser,
  onEditHabit,
  onTogglePauseHabit,
  onToggleArchiveHabit,
  onDeleteHabit,
  onResetDemoData,
  onResetFreshData,
  onDataImportSuccess,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [nameInput, setNameInput] = useState(user.name);
  const [habitFilter, setHabitFilter] = useState<'all' | 'active' | 'paused' | 'archived'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currentUser, syncStatus, signInWithGoogle, signOut, syncNow, loading } = useAuth();

  // In-App Retro Confirm Modal & Toast State (Bypasses browser window.confirm in iframe)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  } | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const levelInfo = calculateLevelFromTotalXp(user.totalXp);

  const rankTier = getRankTier(levelInfo.level);
  const titleOptions = getUnlockedTitlesForLevel(levelInfo.level);
  const isShieldActive = isStreakShieldActive(user);

  const handleNameSave = () => {
    if (nameInput.trim()) {
      playSound('click');
      onUpdateUser({ name: nameInput.trim() });
    }
    setIsEditingName(false);
  };

  const handleUseStreakFreeze = () => {
    if (user.streakFreezesRemaining <= 0) {
      playSound('click');
      showToast('⚠️ NO SHIELD CHARGES REMAINING! LEVEL UP TO EARN MORE.');
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: 'DEPLOY COMBO SHIELD?',
      description: 'Activate 1 Shield charge to freeze your streak and protect combo multipliers for the next 24 hours.',
      confirmLabel: 'DEPLOY SHIELD',
      isDestructive: false,
      onConfirm: () => {
        playSound('powerup');
        onUpdateUser({
          streakFreezesRemaining: Math.max(0, (user.streakFreezesRemaining ?? 2) - 1),
          streakShieldActiveUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });
        showToast('⚡ COMBO SHIELD DEPLOYED! STREAK PROTECTED FOR 24H.');
      },
    });
  };

  const handleExportJson = () => {
    playSound('click');
    const jsonStr = exportDataAsJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buffr_save_state_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('💾 SAVE STATE JSON EXPORTED SUCCESSFULLY!');
  };

  const handleExportCsv = () => {
    playSound('click');
    const csvStr = exportCompletionsAsCsv();
    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buffr_telemetry_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📊 TELEMETRY CSV LOGS EXPORTED!');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importDataFromJson(content);
      if (success) {
        playSound('powerup');
        showToast('✅ MEMORY CARD SAVE RESTORED SUCCESSFULLY!');
        onDataImportSuccess();
      } else {
        playSound('gameover');
        showToast('❌ INVALID SAVE STATE FILE FORMAT.');
      }
    };
    reader.readAsText(file);
  };

  // Filtered habits
  const filteredHabits = habits.filter((h) => {
    if (habitFilter === 'active') return !h.isArchived && !h.isPaused;
    if (habitFilter === 'paused') return h.isPaused && !h.isArchived;
    if (habitFilter === 'archived') return h.isArchived;
    return true;
  });

  return (
    <div id="profile-view-container" className="p-3 sm:p-6 max-w-4xl mx-auto space-y-4 sm:space-y-6 pb-28">
      {/* Header */}
      <div className="bg-[#11092a] border-2 border-[#3b2d60] p-3 sm:p-4 shadow-[3px_3px_0px_#05020a]">
        <h1 className="text-base sm:text-lg font-arcade text-yellow-400 tracking-wider flex items-center space-x-2">
          <span>PLAYER CONFIG & MEMORY BANK</span>
          <Gamepad2 className="w-4 h-4 text-cyan-400" />
        </h1>
        <p className="text-xs text-cyan-300 font-retro mt-0.5">
          AVATAR LOADOUT, QUEST INVENTORY & ROM BACKUP PROTOCOLS
        </p>
      </div>

      {/* Character Sheet Hero Box */}
      <div className="p-3.5 sm:p-5 bg-[#11092a] border-2 border-[#3b2d60] shadow-[3px_3px_0px_#05020a] space-y-4">
        {/* Tier & Rank Header Banner */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-[#090416] border border-[#2f2352]">
          <div className="flex items-center space-x-2">
            <span
              className={`px-2 py-0.5 text-[9px] font-arcade border font-bold shadow-[2px_2px_0px_#000] ${rankTier.badgeBg} ${rankTier.borderColor}`}
              style={{ color: rankTier.color }}
            >
              {rankTier.name} TIER
            </span>
            <span className="text-[10px] text-slate-400 font-arcade">
              LV {rankTier.minLevel} - {rankTier.maxLevel === 999 ? '∞' : rankTier.maxLevel}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 text-[9px] font-retro text-cyan-300">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>{rankTier.description}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            {/* Clickable Pilot Avatar / PFP with Hover Badge */}
            <div
              onClick={() => {
                playSound('click');
                setIsAvatarPickerOpen(true);
              }}
              className="relative group cursor-pointer"
              title="Click to Change Pilot PFP / Avatar"
            >
              <div className="w-14 h-14 bg-[#1f1242] border-2 border-yellow-400 flex items-center justify-center shadow-[3px_3px_0px_#000] overflow-hidden group-hover:border-cyan-300 transition-all">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || 'Pilot'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">{user.avatarEmoji || '👾'}</span>
                )}
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-yellow-300">
                <Camera className="w-4 h-4" />
                <span className="text-[7px] font-arcade mt-0.5">EDIT</span>
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                {isEditingName ? (
                  <div className="flex items-center space-x-1">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="bg-[#090416] border-2 border-yellow-400 px-2 py-0.5 text-xs text-yellow-300 font-arcade focus:outline-none"
                    />
                    <button
                      onClick={handleNameSave}
                      className="p-1 bg-yellow-400 text-black border border-black"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1.5">
                    <h2 className="text-xs sm:text-sm font-arcade text-yellow-300">{user.name}</h2>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="text-slate-400 hover:text-white"
                      title="Edit Callsign"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <span className="px-1.5 py-0.2 text-[8px] sm:text-[9px] font-arcade bg-green-500 text-black font-bold">
                  LV {levelInfo.level}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    setIsAvatarPickerOpen(true);
                  }}
                  className="px-1.5 py-0.5 bg-[#170e36] hover:bg-[#2c1d5e] border border-cyan-400 text-cyan-300 text-[8px] font-arcade flex items-center space-x-1 shadow-[1px_1px_0px_#000]"
                  title="Change Pilot Profile Picture or Emoji Badge"
                >
                  <Camera className="w-2.5 h-2.5" />
                  <span>CHANGE PFP</span>
                </button>
              </div>

              {/* Title Selector (Only allows unlocked titles) */}
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <div className="flex items-center space-x-1 bg-[#090416] border border-[#3b2d60] px-2 py-0.5">
                  <Award className="w-3 h-3 text-yellow-400" />
                  <select
                    id="user-title-select"
                    value={user.currentTitle || 'Starter'}
                    onChange={(e) => {
                      playSound('click');
                      onUpdateUser({ currentTitle: e.target.value, autoEquipHighestTitle: false });
                    }}
                    className="bg-transparent text-yellow-400 text-[10px] font-arcade focus:outline-none cursor-pointer"
                  >
                    {titleOptions.map((t) => (
                      <option
                        key={t.title}
                        value={t.title}
                        disabled={!t.isUnlocked}
                        className={t.isUnlocked ? 'bg-[#090416] text-yellow-300' : 'bg-[#05020c] text-slate-600'}
                      >
                        {t.isUnlocked ? `★ ${t.title.toUpperCase()}` : `🔒 LV ${t.requiredLevel}: ${t.title.toUpperCase()}`}
                      </option>
                    ))}
                  </select>
                </div>

                <span className="text-[8px] font-retro text-slate-400">
                  (Earned via Level & XP Progression)
                </span>
              </div>
            </div>
          </div>

          {/* Streak Freeze / Combo Shield Bank */}
          <div className="p-2.5 bg-[#090416] border-2 border-cyan-500 flex items-center justify-between sm:justify-start space-x-3 shadow-[2px_2px_0px_#000]">
            <div className="flex items-center space-x-2">
              <Shield className={`w-5 h-5 ${isShieldActive ? 'text-green-400 animate-pulse' : 'text-cyan-400'}`} />
              <div>
                <span className="text-[8px] font-arcade text-slate-400 block">
                  {isShieldActive ? 'SHIELD STATUS: ACTIVE' : 'COMBO SHIELD BANK'}
                </span>
                <span className={`text-xs font-arcade ${isShieldActive ? 'text-green-300' : 'text-cyan-300'}`}>
                  {isShieldActive ? 'PROTECTED FOR 24H' : `x${user.streakFreezesRemaining ?? 2} CHARGES`}
                </span>
              </div>
            </div>

            {!isShieldActive && (
              <button
                id="btn-use-streak-freeze"
                onClick={handleUseStreakFreeze}
                disabled={(user.streakFreezesRemaining ?? 2) <= 0}
                className="arcade-btn-cyan px-2.5 py-1 text-[9px] font-arcade disabled:opacity-50"
              >
                DEPLOY
              </button>
            )}
          </div>
        </div>

        {/* Level Progress */}
        <div className="space-y-1 pt-2 border-t-2 border-[#2f2352]">
          <div className="flex justify-between text-[9px] font-arcade text-slate-300">
            <span>PROGRESS TO LVL {levelInfo.level + 1}</span>
            <span className="text-yellow-400">
              {levelInfo.currentLevelXp}/{levelInfo.nextLevelXpRequired} PTS ({levelInfo.progressPercent}%) • TOTAL XP: {user.totalXp.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-[#05020c] border border-[#3b2d60] h-3 p-0.5">
            <div
              className="bg-gradient-to-r from-emerald-500 via-cyan-400 to-yellow-400 h-full"
              style={{ width: `${levelInfo.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Habit Inventory & Management */}
      <div className="p-3.5 sm:p-5 bg-[#11092a] border-2 border-[#3b2d60] shadow-[3px_3px_0px_#05020a] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs sm:text-sm font-arcade text-yellow-400">
              ACTIVE HABIT INVENTORY
            </h2>
          </div>

          <div className="flex bg-[#090416] border-2 border-[#3b2d60] p-0.5">
            {(['all', 'active', 'paused', 'archived'] as const).map((f) => (
              <button
                key={f}
                onClick={() => {
                  playSound('click');
                  setHabitFilter(f);
                }}
                className={`px-2 py-0.5 uppercase text-[9px] font-arcade transition-all ${
                  habitFilter === f ? 'bg-yellow-400 text-black font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {filteredHabits.length === 0 ? (
            <p className="text-xs text-cyan-300 font-retro py-2">NO HABIT PROTOCOLS IN THIS DRAWER.</p>
          ) : (
            filteredHabits.map((habit) => (
              <div
                key={habit.id}
                className="p-2.5 bg-[#0e0722] border-2 border-[#2f2352] flex items-center justify-between gap-2 shadow-[2px_2px_0px_#000]"
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <span className="text-lg">{habit.emoji}</span>
                  <div className="truncate">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-arcade text-white truncate">{habit.title}</span>
                      {habit.isPaused && (
                        <span className="px-1 py-0.2 text-[8px] bg-amber-500/30 text-amber-300 border border-amber-500 font-arcade">
                          PAUSED
                        </span>
                      )}
                      {habit.isArchived && (
                        <span className="px-1 py-0.2 text-[8px] bg-slate-800 text-slate-400 border border-slate-700 font-arcade">
                          ARCHIVED
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-cyan-300 font-retro">
                      {habit.category} • {habit.timeOfDay} • +{habit.xpReward} PTS
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 shrink-0 font-mono">
                  <button
                    onClick={() => {
                      playSound('click');
                      onEditHabit(habit);
                    }}
                    className="p-1.5 bg-[#170e36] hover:bg-[#281859] border border-[#3b2d60] text-slate-300"
                    title="Edit Habit"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      playSound('click');
                      onTogglePauseHabit(habit.id, habit.isPaused ? undefined : 'Temporary pause');
                    }}
                    className="p-1.5 bg-[#170e36] hover:bg-[#281859] border border-[#3b2d60] text-amber-400"
                    title={habit.isPaused ? 'Resume Habit' : 'Pause Habit'}
                  >
                    {habit.isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => {
                      playSound('click');
                      onToggleArchiveHabit(habit.id);
                    }}
                    className="p-1.5 bg-[#170e36] hover:bg-[#281859] border border-[#3b2d60] text-slate-400"
                    title={habit.isArchived ? 'Unarchive Habit' : 'Archive Habit'}
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      playSound('click');
                      setConfirmModal({
                        isOpen: true,
                        title: 'PURGE HABIT FROM ROM?',
                        description: `Permanently delete "${habit.title}" from your character's active memory bank?`,
                        confirmLabel: 'DELETE HABIT',
                        isDestructive: true,
                        onConfirm: () => {
                          playSound('click');
                          onDeleteHabit(habit.id);
                          showToast(`🗑️ "${habit.title}" PURGED FROM ROM.`);
                        },
                      });
                    }}
                    className="p-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-600 text-rose-400"
                    title="Delete Habit"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* XP Transaction History Feed */}
      <div className="p-3.5 sm:p-5 bg-[#11092a] border-2 border-[#3b2d60] shadow-[3px_3px_0px_#05020a] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <h2 className="text-xs sm:text-sm font-arcade text-yellow-400">XP LEDGER TRANSACTION FEED</h2>
          </div>
          <span className="text-[8px] font-arcade text-slate-400">REAL-TIME TELEMETRY</span>
        </div>

        <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
          {xpTransactions.slice(0, 10).map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-2 bg-[#090416] border border-[#2f2352]"
            >
              <div className="truncate mr-2">
                <span className="font-retro text-xs text-slate-200 block truncate">{tx.reason}</span>
                <span className="text-[8px] font-arcade text-slate-400">
                  {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <span className="text-green-400 font-arcade text-[10px] shrink-0">+{tx.amount} PTS</span>
            </div>
          ))}
        </div>
      </div>

      {/* App Preferences & Settings */}
      <div className="p-3.5 sm:p-5 bg-[#11092a] border-2 border-[#3b2d60] shadow-[3px_3px_0px_#05020a] space-y-3">
        <h2 className="text-xs sm:text-sm font-arcade text-yellow-400">CHIPTUNE AUDIO & HARDWARE SETTINGS</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Sound Synthesizer toggle */}
          <div
            onClick={() => {
              playSound('click');
              onUpdateUser({ soundEnabled: !user.soundEnabled });
            }}
            className="p-3 bg-[#0e0722] border-2 border-[#3b2d60] flex items-center justify-between cursor-pointer hover:border-yellow-400 transition-colors"
          >
            <div className="flex items-center space-x-2.5">
              {user.soundEnabled ? (
                <Volume2 className="w-5 h-5 text-green-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-500" />
              )}
              <div>
                <span className="text-[10px] font-arcade text-white block">8-BIT CHIPTUNE SYNTH</span>
                <span className="text-xs text-cyan-300 font-retro">Web Audio square wave FX</span>
              </div>
            </div>
            <div
              className={`w-8 h-4 p-0.5 border border-black ${
                user.soundEnabled ? 'bg-green-400' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-3 h-3 bg-black transition-transform ${
                  user.soundEnabled ? 'translate-x-3.5' : 'translate-x-0'
                }`}
              />
            </div>
          </div>

          {/* Haptics toggle */}
          <div
            onClick={() => {
              playSound('click');
              onUpdateUser({ hapticsEnabled: !user.hapticsEnabled });
            }}
            className="p-3 bg-[#0e0722] border-2 border-[#3b2d60] flex items-center justify-between cursor-pointer hover:border-yellow-400 transition-colors"
          >
            <div className="flex items-center space-x-2.5">
              <Vibrate className="w-5 h-5 text-cyan-400" />
              <div>
                <span className="text-[10px] font-arcade text-white block">HAPTIC FORCE FEEDBACK</span>
                <span className="text-xs text-cyan-300 font-retro">Gamepad tactile pulses</span>
              </div>
            </div>
            <div
              className={`w-8 h-4 p-0.5 border border-black ${
                user.hapticsEnabled ? 'bg-green-400' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-3 h-3 bg-black transition-transform ${
                  user.hapticsEnabled ? 'translate-x-3.5' : 'translate-x-0'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Google Cloud Account & Realtime Database Sync */}
      <div className="p-3.5 sm:p-5 bg-[#11092a] border-2 border-cyan-500/80 shadow-[3px_3px_0px_#05020a] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cloud className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xs sm:text-sm font-arcade text-cyan-300">
              CLOUD SYNC & GOOGLE AUTH
            </h2>
          </div>
          {currentUser ? (
            <span className="px-2 py-0.5 text-[8px] font-arcade bg-emerald-500/20 text-emerald-300 border border-emerald-500">
              CLOUD CONNECTED
            </span>
          ) : (
            <span className="px-2 py-0.5 text-[8px] font-arcade bg-slate-800 text-slate-400 border border-slate-700">
              OFFLINE / LOCAL ONLY
            </span>
          )}
        </div>

        <p className="text-xs text-slate-300 font-retro">
          {currentUser
            ? `Logged in as ${currentUser.displayName || currentUser.email || 'Player'}. Your habits, XP, streaks, and reflections sync to Firebase Firestore in real-time across all your phones and computers.`
            : 'Sign in with Google to enable automatic cloud backup and real-time synchronization between your phone, laptop, and tablet.'}
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          {currentUser ? (
            <>
              <button
                id="btn-cloud-sync-now"
                onClick={() => {
                  playSound('powerup');
                  syncNow();
                }}
                disabled={syncStatus === 'syncing'}
                className="py-2 px-3 bg-[#0e2a22] hover:bg-[#143d32] border-2 border-emerald-400 text-emerald-200 text-[9px] font-arcade flex items-center space-x-1.5 shadow-[2px_2px_0px_#000]"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                <span>{syncStatus === 'syncing' ? 'SYNCING TO CLOUD...' : 'FORCE CLOUD SYNC'}</span>
              </button>

              <button
                id="btn-google-signout"
                onClick={() => {
                  playSound('click');
                  signOut();
                }}
                className="py-2 px-3 bg-[#241124] hover:bg-[#3d1a3d] border-2 border-pink-500 text-pink-300 text-[9px] font-arcade flex items-center space-x-1.5 shadow-[2px_2px_0px_#000]"
              >
                <LogOut className="w-3.5 h-3.5 text-pink-400" />
                <span>SIGN OUT ({currentUser.email?.split('@')[0] || 'ACCOUNT'})</span>
              </button>
            </>
          ) : (
            <button
              id="btn-google-signin"
              onClick={() => {
                playSound('powerup');
                signInWithGoogle();
              }}
              disabled={loading}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 border-2 border-cyan-400 text-cyan-100 text-[10px] font-arcade flex items-center justify-center space-x-2 shadow-[3px_3px_0px_#000]"
            >
              <KeyRound className="w-4 h-4 text-cyan-300 animate-pulse" />
              <span>CONNECT GOOGLE ACCOUNT & ENABLE CLOUD SYNC</span>
            </button>
          )}
        </div>
      </div>

      {/* Data Management: Export / Import / Reset */}
      <div className="p-3.5 sm:p-5 bg-[#11092a] border-2 border-[#3b2d60] shadow-[3px_3px_0px_#05020a] space-y-3">
        <h2 className="text-xs sm:text-sm font-arcade text-yellow-400">MEMORY CARD SAVE & BACKUP</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            id="btn-export-json"
            onClick={handleExportJson}
            className="py-2 px-3 bg-[#0e0722] hover:bg-[#1c1040] border-2 border-[#3b2d60] text-slate-200 text-[9px] font-arcade flex items-center justify-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5 text-green-400" />
            <span>BACKUP SAVE STATE (JSON)</span>
          </button>

          <button
            id="btn-export-csv"
            onClick={handleExportCsv}
            className="py-2 px-3 bg-[#0e0722] hover:bg-[#1c1040] border-2 border-[#3b2d60] text-slate-200 text-[9px] font-arcade flex items-center justify-center space-x-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>EXPORT LOGS (CSV)</span>
          </button>

          <button
            id="btn-import-json"
            onClick={() => fileInputRef.current?.click()}
            className="py-2 px-3 bg-[#0e0722] hover:bg-[#1c1040] border-2 border-[#3b2d60] text-slate-200 text-[9px] font-arcade flex items-center justify-center space-x-1.5"
          >
            <Upload className="w-3.5 h-3.5 text-yellow-400" />
            <span>RESTORE SAVE STATE</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />

          <button
            id="btn-reset-fresh"
            onClick={() => {
              playSound('click');
              setConfirmModal({
                isOpen: true,
                title: 'START FRESH (RESET TO LEVEL 1)?',
                description: 'This will erase all current habits, logs, XP, and streaks from this device and your Google Cloud sync. You will restart from Level 1 with a clean slate to begin your real habit journey.',
                confirmLabel: 'YES, WIPE DATA & START FRESH',
                isDestructive: true,
                onConfirm: () => {
                  playSound('gameover');
                  onResetFreshData?.();
                },
              });
            }}
            className="py-2 px-3 bg-red-950/60 hover:bg-red-900/80 border-2 border-red-500 text-red-300 text-[9px] font-arcade flex items-center justify-center space-x-1.5 active:translate-y-0.5 transition-all shadow-[2px_2px_0px_#000]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>START FRESH (RESET LEVEL 1)</span>
          </button>

          <button
            id="btn-reset-demo"
            onClick={() => {
              playSound('click');
              setConfirmModal({
                isOpen: true,
                title: 'RELOAD 30-DAY DEMO SAVE?',
                description: 'This will replace current save data with the 30-day pre-populated arcade dataset for testing, demos, and feature exploration.',
                confirmLabel: 'RELOAD DEMO DATA',
                isDestructive: false,
                onConfirm: () => {
                  playSound('gameover');
                  onResetDemoData();
                  showToast('🕹️ 30-DAY DEMO DATASET LOADED!');
                },
              });
            }}
            className="py-2 px-3 bg-[#1e1338] hover:bg-[#2c1b52] border-2 border-purple-500 text-purple-300 text-[9px] font-arcade flex items-center justify-center space-x-1.5 active:translate-y-0.5 transition-all shadow-[2px_2px_0px_#000]"
          >
            <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
            <span>RELOAD 30-DAY DEMO SAVE</span>
          </button>
        </div>
      </div>

      {/* Floating In-App Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-slate-900 border-2 border-yellow-400 text-yellow-300 text-[10px] font-arcade shadow-[0px_4px_20px_rgba(0,0,0,0.8)] flex items-center space-x-2 animate-bounce max-w-[90vw] text-center">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Retro Arcade Confirmation Modal */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0f0826] border-2 border-yellow-400 p-5 max-w-sm w-full shadow-[6px_6px_0px_#000] relative">
            <div className="flex items-center space-x-2 mb-3 border-b border-purple-800/80 pb-2">
              <AlertTriangle className={`w-5 h-5 ${confirmModal.isDestructive ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`} />
              <h3 className={`text-[11px] font-arcade ${confirmModal.isDestructive ? 'text-red-400' : 'text-yellow-300'}`}>
                {confirmModal.title}
              </h3>
            </div>

            <p className="text-[10px] font-retro leading-relaxed text-slate-300 mb-5 bg-[#170e36] p-3 border border-purple-900/60">
              {confirmModal.description}
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  playSound('click');
                  setConfirmModal(null);
                }}
                className="py-2 px-3 bg-[#1e1338] hover:bg-[#2e1d54] border-2 border-slate-600 text-slate-300 text-[9px] font-arcade flex items-center justify-center space-x-1 shadow-[2px_2px_0px_#000] active:translate-y-0.5"
              >
                <X className="w-3.5 h-3.5" />
                <span>ABORT</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const cb = confirmModal.onConfirm;
                  setConfirmModal(null);
                  cb();
                }}
                className={`py-2 px-3 border-2 text-[9px] font-arcade flex items-center justify-center space-x-1 shadow-[2px_2px_0px_#000] active:translate-y-0.5 ${
                  confirmModal.isDestructive
                    ? 'bg-red-600 hover:bg-red-500 border-red-300 text-white'
                    : 'bg-yellow-500 hover:bg-yellow-400 border-yellow-200 text-black font-bold'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{confirmModal.confirmLabel}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Avatar / PFP Selection & Upload Modal */}
      <AvatarPickerModal
        isOpen={isAvatarPickerOpen}
        user={user}
        onUpdateAvatar={(data) => {
          onUpdateUser(data);
          showToast('👾 PILOT PFP / AVATAR CALIBRATED!');
        }}
        onClose={() => setIsAvatarPickerOpen(false)}
      />
    </div>
  );
};
