import React, { useState } from 'react';
import {
  Trophy,
  Zap,
  Flame,
  CheckCircle2,
  Lock,
  Sparkles,
  Plus,
  Target,
  Clock,
  Shield,
  ShieldAlert,
  Swords,
  Skull,
  Footprints,
  Crown,
  Award,
  BookOpen,
  Dumbbell,
  Star,
  TrendingUp,
  Heart,
} from 'lucide-react';
import { Challenge, Quest, Achievement, UserProfile } from '../../types';
import { playSound } from '../../utils/sound';

interface ChallengesViewProps {
  user: UserProfile;
  challenges: Challenge[];
  quests: Quest[];
  achievements: Achievement[];
  onJoinChallenge: (challengeId: string) => void;
  onClaimQuest: (questId: string) => void;
  onCreateCustomChallenge: (challenge: Partial<Challenge>) => void;
}

// Map text icon names to real Lucide icons with fallback
const getTrophyLucideIcon = (iconName?: string): React.ElementType => {
  if (!iconName) return Trophy;
  const lower = iconName.toLowerCase().replace(/[-_\s]/g, '');
  if (lower.includes('footprint') || lower.includes('step')) return Footprints;
  if (lower.includes('flame') || lower.includes('fire')) return Flame;
  if (lower.includes('shieldalert')) return ShieldAlert;
  if (lower.includes('shield')) return Shield;
  if (lower.includes('crown')) return Crown;
  if (lower.includes('sparkle')) return Sparkles;
  if (lower.includes('award') || lower.includes('medal')) return Award;
  if (lower.includes('book') || lower.includes('scholar')) return BookOpen;
  if (lower.includes('dumbbell') || lower.includes('athlete') || lower.includes('fitness')) return Dumbbell;
  if (lower.includes('checkcircle') || lower.includes('centurion') || lower.includes('check')) return CheckCircle2;
  if (lower.includes('target')) return Target;
  if (lower.includes('zap') || lower.includes('lightning')) return Zap;
  if (lower.includes('star')) return Star;
  if (lower.includes('sword')) return Swords;
  if (lower.includes('heart')) return Heart;
  if (lower.includes('trend')) return TrendingUp;
  return Trophy;
};

export const ChallengesView: React.FC<ChallengesViewProps> = ({
  user,
  challenges,
  quests,
  achievements,
  onJoinChallenge,
  onClaimQuest,
  onCreateCustomChallenge,
}) => {
  const [activeTab, setActiveTab] = useState<'challenges' | 'quests' | 'achievements'>('challenges');
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [trophyFilter, setTrophyFilter] = useState<'all' | 'unlocked' | 'locked' | 'streaks' | 'completion' | 'xp' | 'levels' | 'categories'>('all');

  // Form state for custom challenge
  const [customTitle, setCustomTitle] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customDays, setCustomDays] = useState(14);
  const [customXp, setCustomXp] = useState(150);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    playSound('click');
    onCreateCustomChallenge({
      title: customTitle.trim(),
      description: customDesc.trim() || 'Custom discipline challenge',
      targetDays: customDays,
      currentDay: 1,
      xpReward: customXp,
      isJoined: true,
      isCompleted: false,
      emoji: '🎯',
      color: '#10b981',
      category: 'Discipline',
    });

    setCustomTitle('');
    setCustomDesc('');
    setShowCreateChallenge(false);
  };

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;

  return (
    <div id="challenges-view-container" className="p-3 sm:p-6 max-w-4xl mx-auto space-y-4 sm:space-y-6 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#11092a] border-2 border-[#3b2d60] p-3 sm:p-4 shadow-[3px_3px_0px_#05020a]">
        <div>
          <h1 className="text-base sm:text-lg font-arcade text-yellow-400 tracking-wider flex items-center space-x-2">
            <span>BOUNTIES & BOSS RAIDS</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </h1>
          <p className="text-xs text-cyan-300 font-retro mt-0.5">
            CLAIM TIMED GUILD BOUNTIES, SURVIVE SPRINTS & UNLOCK TROPHIES
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex bg-[#090416] border-2 border-[#3b2d60] p-1 font-mono text-xs shadow-[2px_2px_0px_#000]">
          <button
            id="tab-btn-challenges"
            onClick={() => {
              playSound('click');
              setActiveTab('challenges');
            }}
            className={`px-2.5 py-1 text-[9px] font-arcade transition-all ${
              activeTab === 'challenges'
                ? 'bg-yellow-400 text-black font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            RAIDS
          </button>
          <button
            id="tab-btn-quests"
            onClick={() => {
              playSound('click');
              setActiveTab('quests');
            }}
            className={`px-2.5 py-1 text-[9px] font-arcade transition-all ${
              activeTab === 'quests'
                ? 'bg-amber-400 text-black font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            BOUNTIES
          </button>
          <button
            id="tab-btn-achievements"
            onClick={() => {
              playSound('click');
              setActiveTab('achievements');
            }}
            className={`px-2.5 py-1 text-[9px] font-arcade transition-all ${
              activeTab === 'achievements'
                ? 'bg-cyan-400 text-black font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            TROPHIES ({unlockedCount}/{achievements.length})
          </button>
        </div>
      </div>

      {/* TAB 1: Challenges / Boss Raids */}
      {activeTab === 'challenges' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-arcade tracking-wider text-cyan-400">
              ACTIVE & RECOMMENDED CAMPAIGNS
            </span>
            <button
              id="btn-create-challenge"
              onClick={() => {
                playSound('click');
                setShowCreateChallenge(!showCreateChallenge);
              }}
              className="arcade-btn-green px-3 py-1.5 text-[10px] font-arcade inline-flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>CUSTOM RAID</span>
            </button>
          </div>

          {/* Custom Challenge Creator Form */}
          {showCreateChallenge && (
            <form
              onSubmit={handleCreateSubmit}
              className="p-4 bg-[#140b2e] border-2 border-green-500 shadow-[3px_3px_0px_#000] space-y-3"
            >
              <h3 className="font-arcade text-xs text-green-400">
                INITIATE CUSTOM DISCIPLINE RAID
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Raid Title (e.g. 14-DAY NO SUGAR)"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="bg-[#090416] border-2 border-[#3b2d60] px-3 py-2 text-xs font-arcade text-yellow-300 focus:outline-none focus:border-green-400"
                  required
                />
                <input
                  type="text"
                  placeholder="Raid Briefing / Rules"
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  className="bg-[#090416] border-2 border-[#3b2d60] px-3 py-2 text-xs font-retro text-white focus:outline-none focus:border-green-400"
                />
                <div className="flex items-center space-x-2">
                  <label className="text-[10px] font-arcade text-slate-300">DURATION (DAYS):</label>
                  <input
                    type="number"
                    min="3"
                    max="100"
                    value={customDays}
                    onChange={(e) => setCustomDays(parseInt(e.target.value) || 7)}
                    className="w-20 bg-[#090416] border-2 border-[#3b2d60] px-2 py-1.5 text-xs font-arcade text-yellow-300"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-[10px] font-arcade text-slate-300">XP REWARD:</label>
                  <input
                    type="number"
                    min="50"
                    max="1000"
                    value={customXp}
                    onChange={(e) => setCustomXp(parseInt(e.target.value) || 100)}
                    className="w-20 bg-[#090416] border-2 border-[#3b2d60] px-2 py-1.5 text-xs font-arcade text-yellow-300"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateChallenge(false)}
                  className="px-3 py-1.5 bg-[#1f1242] border-2 border-[#3b2d60] text-slate-300 text-[10px] font-arcade"
                >
                  ABORT
                </button>
                <button
                  type="submit"
                  className="arcade-btn-green px-4 py-1.5 text-[10px] font-arcade"
                >
                  LAUNCH RAID!
                </button>
              </div>
            </form>
          )}

          {/* Challenges List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
            {challenges.map((c) => {
              const progressPercent = Math.min(100, Math.round((c.currentDay / c.targetDays) * 100));

              return (
                <div
                  key={c.id}
                  id={`challenge-card-${c.id}`}
                  className={`p-3.5 sm:p-4 border-2 flex flex-col justify-between space-y-3 transition-all ${
                    c.isCompleted
                      ? 'bg-[#0d2218] border-emerald-500 shadow-[3px_3px_0px_#000]'
                      : c.isJoined
                      ? 'bg-[#11092a] border-[#593d96] shadow-[3px_3px_0px_#000]'
                      : 'bg-[#0e0722] border-[#2f2352]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2.5">
                        <span className="text-2xl">{c.emoji}</span>
                        <div>
                          <h3 className="text-xs sm:text-sm font-arcade text-white">{c.title}</h3>
                          <span className="text-[9px] text-cyan-300 font-arcade">
                            {c.category.toUpperCase()} • {c.targetDays} DAYS
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 text-yellow-300 font-arcade text-[10px] px-2 py-0.5 bg-[#1b1238] border border-yellow-500/50">
                        <Sparkles className="w-3 h-3 text-yellow-400" />
                        <span>+{c.xpReward} PTS</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 font-retro leading-relaxed">{c.description}</p>
                  </div>

                  <div className="space-y-2">
                    {c.isJoined && (
                      <div className="space-y-1 text-[10px] font-arcade">
                        <div className="flex justify-between text-cyan-300">
                          <span>
                            STAGE {c.currentDay} / {c.targetDays}
                          </span>
                          <span className="text-yellow-400">{progressPercent}%</span>
                        </div>
                        <div className="w-full bg-[#05020c] h-3 border border-[#3b2d60] p-0.5">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="pt-1">
                      {c.isCompleted ? (
                        <div className="w-full py-2 bg-[#0c2419] border-2 border-emerald-400 text-green-300 text-[10px] font-arcade flex items-center justify-center space-x-1.5 shadow-[2px_2px_0px_#000]">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>RAID CLEARED!</span>
                        </div>
                      ) : c.isJoined ? (
                        <div className="w-full py-2 bg-[#170e36] border-2 border-[#453075] text-yellow-300 text-[10px] font-arcade text-center">
                          ⚔️ RAID CAMPAIGN IN PROGRESS
                        </div>
                      ) : (
                        <button
                          id={`join-challenge-${c.id}`}
                          onClick={() => {
                            playSound('powerup');
                            onJoinChallenge(c.id);
                          }}
                          className="w-full arcade-btn-yellow py-2 text-[10px] font-arcade flex items-center justify-center space-x-1"
                        >
                          <Swords className="w-3.5 h-3.5" />
                          <span>ENTER RAID BATTLE</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Quests / Daily & Weekly Bounties */}
      {activeTab === 'quests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-arcade tracking-wider text-amber-400">
              ACTIVE DAILY & WEEKLY BOUNTIES
            </span>
          </div>

          <div className="space-y-2.5">
            {quests.map((q) => {
              const isReady = q.progress >= q.target && !q.isClaimed;
              const progressPct = Math.min(100, Math.round((q.progress / q.target) * 100));

              return (
                <div
                  key={q.id}
                  id={`quest-row-${q.id}`}
                  className={`p-3 sm:p-3.5 border-2 flex items-center justify-between gap-3 transition-all ${
                    q.isClaimed
                      ? 'bg-[#0a0517] border-[#22173d] text-slate-500'
                      : isReady
                      ? 'bg-[#291e0a] border-amber-400 text-amber-100 shadow-[3px_3px_0px_#f59e0b]'
                      : 'bg-[#11092a] border-[#3b2d60] text-slate-300 shadow-[2px_2px_0px_#05020a]'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <div
                      className={`w-9 h-9 flex items-center justify-center shrink-0 border-2 ${
                        q.isClaimed
                          ? 'bg-[#090416] border-slate-800 text-slate-600'
                          : isReady
                          ? 'bg-amber-400 text-black border-yellow-300 font-bold'
                          : 'bg-[#090416] border-[#4a367c] text-amber-400'
                      }`}
                    >
                      <Zap className="w-4 h-4 fill-current" />
                    </div>

                    <div className="truncate">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-xs font-arcade text-white truncate">{q.title}</h4>
                        <span className="px-1.5 py-0.2 text-[8px] font-arcade uppercase bg-[#090416] text-yellow-300 border border-[#3b2d60]">
                          {q.type}
                        </span>
                      </div>
                      <p className="text-xs text-cyan-300 font-retro truncate">{q.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <span className="text-[10px] font-arcade text-yellow-400">+{q.xpReward} PTS</span>
                      <span className="text-[9px] text-slate-400 font-arcade block">
                        {Math.min(q.target, q.progress)}/{q.target}
                      </span>
                    </div>

                    {q.isClaimed ? (
                      <span className="text-[9px] font-arcade text-emerald-400 px-2.5 py-1 bg-[#090416] border border-emerald-500">
                        CLEARED
                      </span>
                    ) : isReady ? (
                      <button
                        id={`quest-claim-btn-${q.id}`}
                        onClick={() => {
                          playSound('streak');
                          onClaimQuest(q.id);
                        }}
                        className="arcade-btn-yellow px-3 py-1.5 text-[10px] font-arcade animate-pulse"
                      >
                        CLAIM!
                      </button>
                    ) : (
                      <div className="w-16 bg-[#05020c] border border-[#3b2d60] h-2.5 p-0.5">
                        <div
                          className="bg-amber-400 h-full"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Achievements Hall of Fame */}
      {activeTab === 'achievements' && (
        <div className="space-y-4">
          {/* Trophy Room Arcade Header & Stats */}
          <div className="bg-[#11092a] border-2 border-yellow-400 p-4 shadow-[3px_3px_0px_#05020a] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-400 border-2 border-yellow-200 text-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
                <Trophy className="w-6 h-6 fill-yellow-400 text-black stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-arcade text-yellow-300">
                  HALL OF GLORY: TROPHY ROOM
                </h3>
                <p className="text-[10px] font-retro text-cyan-300">
                  Unlock prestigious arcade trophies and medals by achieving unbroken streaks & mastery
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="px-2.5 py-1 bg-[#1a0f35] border border-yellow-400/70 text-right">
                <span className="text-[8px] font-arcade text-slate-400 block">COLLECTED</span>
                <span className="text-xs font-arcade text-yellow-400 font-bold">
                  {unlockedCount} / {achievements.length}
                </span>
              </div>
              <div className="px-2.5 py-1 bg-[#1a0f35] border border-cyan-400/70 text-right">
                <span className="text-[8px] font-arcade text-slate-400 block">COMPLETION</span>
                <span className="text-xs font-arcade text-cyan-300 font-bold">
                  {Math.round((unlockedCount / Math.max(1, achievements.length)) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Trophy Filter Tags */}
          <div className="flex flex-wrap gap-1.5 pb-1">
            {[
              { id: 'all', label: `ALL (${achievements.length})` },
              { id: 'unlocked', label: `UNLOCKED (${unlockedCount})` },
              { id: 'locked', label: `LOCKED (${achievements.length - unlockedCount})` },
              { id: 'streaks', label: 'STREAKS' },
              { id: 'completion', label: 'COMPLETION' },
              { id: 'xp', label: 'XP & LEVELS' },
              { id: 'categories', label: 'MASTERY' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  playSound('click');
                  setTrophyFilter(f.id as any);
                }}
                className={`px-2 py-1 text-[9px] font-arcade border transition-all ${
                  trophyFilter === f.id
                    ? 'bg-yellow-400 text-black border-yellow-300 font-bold shadow-[2px_2px_0px_#000]'
                    : 'bg-[#120a28] hover:bg-[#201344] text-slate-300 border-[#3b2d60]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Trophy Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {achievements
              .filter((ach) => {
                if (trophyFilter === 'unlocked') return ach.isUnlocked;
                if (trophyFilter === 'locked') return !ach.isUnlocked;
                if (trophyFilter === 'streaks')
                  return ach.category === 'Streaks' || ach.id.includes('streak') || ach.id.includes('momentum') || ach.id.includes('fire');
                if (trophyFilter === 'completion')
                  return ach.category === 'Completion' || ach.id.includes('step') || ach.id.includes('centurion');
                if (trophyFilter === 'xp')
                  return ach.category === 'XP' || ach.category === 'Levels' || ach.id.includes('xp') || ach.id.includes('level');
                if (trophyFilter === 'categories')
                  return (
                    ach.category === 'Categories' ||
                    ach.id.includes('scholar') ||
                    ach.id.includes('athlete') ||
                    ach.id.includes('zen')
                  );
                return true;
              })
              .map((ach) => {
                const currentVal = ach.progress !== undefined ? ach.progress : (ach.current !== undefined ? ach.current : (ach.isUnlocked ? ach.target : 0));
                const progressPct = Math.min(100, Math.round((currentVal / (ach.target || 1)) * 100));
                const tier = ach.tier || ach.badgeRarity || 'bronze';

                const tierMeta: Record<
                  string,
                  { color: string; bg: string; border: string; label: string; glow: string }
                > = {
                  bronze: {
                    color: '#f97316',
                    bg: '#2b1408',
                    border: '#ea580c',
                    label: 'BRONZE',
                    glow: 'shadow-[0_0_10px_rgba(234,88,12,0.3)]',
                  },
                  silver: {
                    color: '#e2e8f0',
                    bg: '#1e293b',
                    border: '#cbd5e1',
                    label: 'SILVER',
                    glow: 'shadow-[0_0_10px_rgba(203,213,225,0.3)]',
                  },
                  gold: {
                    color: '#facc15',
                    bg: '#2d1e05',
                    border: '#eab308',
                    label: 'GOLD',
                    glow: 'shadow-[0_0_12px_rgba(234,179,8,0.4)]',
                  },
                  diamond: {
                    color: '#38bdf8',
                    bg: '#082f49',
                    border: '#0284c7',
                    label: 'DIAMOND',
                    glow: 'shadow-[0_0_15px_rgba(56,189,248,0.5)]',
                  },
                  legendary: {
                    color: '#c084fc',
                    bg: '#3b0764',
                    border: '#a855f7',
                    label: 'LEGENDARY',
                    glow: 'shadow-[0_0_15px_rgba(168,85,247,0.5)]',
                  },
                };

                const tierInfo = tierMeta[tier] || tierMeta.bronze;
                const IconComponent = getTrophyLucideIcon(ach.icon);

                return (
                  <div
                    key={ach.id}
                    id={`ach-card-${ach.id}`}
                    className={`p-3.5 border-2 flex items-center space-x-3.5 transition-all relative ${
                      ach.isUnlocked
                        ? 'bg-[#130b2e] border-[#553c90] shadow-[3px_3px_0px_#05020a]'
                        : 'bg-[#090416] border-[#22173d] opacity-75'
                    }`}
                  >
                    {/* Trophy Icon Pedestal with Real Lucide Icon */}
                    <div
                      className={`w-12 h-12 flex items-center justify-center shrink-0 border-2 relative transition-all ${
                        ach.isUnlocked ? tierInfo.glow : 'grayscale'
                      }`}
                      style={{
                        backgroundColor: ach.isUnlocked ? tierInfo.bg : '#05020c',
                        borderColor: ach.isUnlocked ? tierInfo.border : '#332454',
                      }}
                    >
                      <IconComponent
                        className={`w-6 h-6 stroke-[2.2] transition-transform ${
                          ach.isUnlocked ? 'scale-110' : 'text-slate-500'
                        }`}
                        style={{ color: ach.isUnlocked ? tierInfo.color : '#64748b' }}
                      />

                      {!ach.isUnlocked && (
                        <div className="absolute inset-0 bg-black/75 flex items-center justify-center text-slate-400">
                          <Lock className="w-4 h-4 text-slate-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4
                          className={`text-xs font-arcade truncate ${
                            ach.isUnlocked ? 'text-yellow-300 font-bold' : 'text-slate-400'
                          }`}
                        >
                          {ach.title}
                        </h4>
                        <span
                          className="text-[8px] uppercase font-arcade px-1.5 py-0.5 border font-bold"
                          style={{
                            color: tierInfo.color,
                            backgroundColor: `${tierInfo.color}15`,
                            borderColor: tierInfo.border,
                          }}
                        >
                          {tierInfo.label}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-300 font-retro leading-tight mt-0.5 line-clamp-2">
                        {ach.description}
                      </p>

                      <div className="mt-2">
                        {ach.isUnlocked ? (
                          <div className="flex items-center justify-between text-[9px] font-arcade">
                            <span className="text-emerald-400 flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>UNLOCKED</span>
                            </span>
                            <span className="text-yellow-400">+{ach.xpReward} PTS</span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[8px] font-arcade text-slate-400">
                              <span>PROGRESS</span>
                              <span className="text-cyan-300">
                                {currentVal} / {ach.target} ({progressPct}%)
                              </span>
                            </div>
                            <div className="w-full bg-[#05020c] border border-[#3b2d60] h-2 p-0.5">
                              <div
                                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};
