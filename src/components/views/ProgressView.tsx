import React, { useState } from 'react';
import {
  TrendingUp,
  Award,
  Sparkles,
  Zap,
  Flame,
  CheckCircle2,
  Shield,
  Layers,
  ChevronRight,
  Gamepad2,
} from 'lucide-react';
import {
  Habit,
  HabitCompletion,
  UserProfile,
  LifeCategory,
  UserSkillTreeState,
  LootItem,
  LootSlotType,
} from '../../types';
import { BuffrRadarChart } from '../common/BuffrRadarChart';
import {
  calculateLifeAttributes,
  generateInsights,
  calculateDailyScore,
  calculateOverallStreak,
} from '../../utils/gamification';
import { getDaysAgo, parseDateStr } from '../../utils/dateUtils';
import { SkillTreeView } from './SkillTreeView';
import { VaultInventoryView } from './VaultInventoryView';
import { calculateTotalSkillPoints } from '../../data/skillTreeData';
import { playSound } from '../../utils/sound';

interface ProgressViewProps {
  user: UserProfile;
  habits: Habit[];
  completions: HabitCompletion[];
  onOpenWeeklyReview: () => void;
  onUpdateSkillTree?: (updated: UserSkillTreeState) => void;
  onOpenCartridgeModal?: () => void;
  onEquipItem?: (item: LootItem) => void;
  onUnequipSlot?: (slot: LootSlotType) => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  user,
  habits,
  completions,
  onOpenWeeklyReview,
  onUpdateSkillTree,
  onOpenCartridgeModal,
  onEquipItem,
  onUnequipSlot,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'stats' | 'skills' | 'vault'>('stats');
  const [periodDays, setPeriodDays] = useState<7 | 30 | 90 | 365>(30);
  const attributes = calculateLifeAttributes(habits, completions, user);
  const insights = generateInsights(habits, completions);
  const overallStreakStats = calculateOverallStreak(habits, completions);

  const totalEarnedSP = calculateTotalSkillPoints(user);
  const availableSP = Math.max(
    0,
    totalEarnedSP - (user.skillTree?.unlockedNodeIds?.length || 0)
  );

  // Period stats calculation
  let periodScheduled = 0;
  let periodCompleted = 0;

  const dayBars: { label: string; rate: number; count: number }[] = [];
  const categoryCounts: Record<LifeCategory, { total: number; done: number }> = {
    Fitness: { total: 0, done: 0 },
    Health: { total: 0, done: 0 },
    Mind: { total: 0, done: 0 },
    Focus: { total: 0, done: 0 },
    Discipline: { total: 0, done: 0 },
    Mindfulness: { total: 0, done: 0 },
    Creativity: { total: 0, done: 0 },
    Social: { total: 0, done: 0 },
    Finance: { total: 0, done: 0 },
    Sleep: { total: 0, done: 0 },
  };

  const sampleCount = Math.min(periodDays, 14);
  for (let i = sampleCount - 1; i >= 0; i--) {
    const dStr = getDaysAgo(i);
    const dayRes = calculateDailyScore(habits, completions, dStr);
    periodScheduled += dayRes.scheduledCount;
    periodCompleted += dayRes.completedCount;

    const shortDay = parseDateStr(dStr).toLocaleDateString('en-US', { weekday: 'narrow' });
    dayBars.push({
      label: `${shortDay} ${dStr.slice(8)}`,
      rate: dayRes.score,
      count: dayRes.completedCount,
    });
  }

  // Category counts
  completions.forEach((c) => {
    const h = habits.find((hb) => hb.id === c.habitId);
    if (h && categoryCounts[h.category]) {
      categoryCounts[h.category].total++;
      if (c.isCompleted) categoryCounts[h.category].done++;
    }
  });

  const periodRate = periodScheduled > 0 ? Math.round((periodCompleted / periodScheduled) * 100) : 84;

  return (
    <div id="progress-view-container" className="p-3 sm:p-6 max-w-4xl mx-auto space-y-4 sm:space-y-6 pb-28">
      {/* Sub-Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#090416] p-1.5 border-2 border-[#3b2d60] shadow-[2px_2px_0px_#05020a]">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            id="tab-progress-stats"
            onClick={() => {
              playSound('click');
              setActiveSubTab('stats');
            }}
            className={`px-3 py-1.5 font-arcade text-[9px] sm:text-xs flex items-center space-x-1.5 transition-all ${
              activeSubTab === 'stats'
                ? 'bg-yellow-400 text-black font-bold shadow-[2px_2px_0px_#000]'
                : 'text-slate-400 hover:text-white bg-[#120a28] border border-slate-700'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>RADAR & STATS</span>
          </button>

          <button
            id="tab-progress-skills"
            onClick={() => {
              playSound('click');
              setActiveSubTab('skills');
            }}
            className={`px-3 py-1.5 font-arcade text-[9px] sm:text-xs flex items-center space-x-1.5 transition-all ${
              activeSubTab === 'skills'
                ? 'bg-purple-500 text-white font-bold shadow-[2px_2px_0px_#000]'
                : 'text-slate-400 hover:text-white bg-[#120a28] border border-slate-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
            <span>SKILL TREE ({availableSP} SP)</span>
          </button>

          <button
            id="tab-progress-vault"
            onClick={() => {
              playSound('click');
              setActiveSubTab('vault');
            }}
            className={`px-3 py-1.5 font-arcade text-[9px] sm:text-xs flex items-center space-x-1.5 transition-all ${
              activeSubTab === 'vault'
                ? 'bg-cyan-500 text-black font-bold shadow-[2px_2px_0px_#000]'
                : 'text-slate-400 hover:text-white bg-[#120a28] border border-slate-700'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>ARMORY & VAULT</span>
          </button>
        </div>

        {onOpenCartridgeModal && (
          <button
            id="btn-open-cartridge-wrap"
            onClick={() => {
              playSound('powerup');
              onOpenCartridgeModal();
            }}
            className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-black font-arcade text-[9px] sm:text-xs font-bold border border-yellow-200 shadow-[2px_2px_0px_#000] active:translate-y-0.5 flex items-center space-x-1.5"
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>CARTRIDGE WRAP 🕹️</span>
          </button>
        )}
      </div>

      {activeSubTab === 'skills' && onUpdateSkillTree ? (
        <SkillTreeView user={user} onUpdateSkillTree={onUpdateSkillTree} />
      ) : activeSubTab === 'vault' && onEquipItem && onUnequipSlot ? (
        <VaultInventoryView
          user={user}
          inventory={user.inventory || []}
          equippedGear={user.equippedGear || {}}
          onEquipItem={onEquipItem}
          onUnequipSlot={onUnequipSlot}
        />
      ) : (
        <>
          {/* Header & Period Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#11092a] border-2 border-[#3b2d60] p-3 sm:p-4 shadow-[3px_3px_0px_#05020a]">
        <div>
          <h1 className="text-base sm:text-lg font-arcade text-yellow-400 tracking-wider flex items-center space-x-2">
            <span>HERO ATTRIBUTES & TELEMETRY</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </h1>
          <p className="text-xs text-cyan-300 font-retro mt-0.5">
            REAL-TIME STAT SCALING, POWER RADAR & TACTICAL ANALYSIS
          </p>
        </div>

        <div className="flex items-center space-x-1 bg-[#090416] border-2 border-[#3b2d60] p-1 font-mono text-xs shadow-[2px_2px_0px_#000]">
          {([7, 30, 90, 365] as (7 | 30 | 90 | 365)[]).map((p) => (
            <button
              key={p}
              id={`period-btn-${p}`}
              onClick={() => setPeriodDays(p)}
              className={`px-2 py-1 text-[9px] font-arcade transition-all ${
                periodDays === p
                  ? 'bg-yellow-400 text-black font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {p === 365 ? '1Y' : `${p}D`}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Overview 4-Stat Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="p-3 bg-[#11092a] border-2 border-[#3b2d60] shadow-[2px_2px_0px_#05020a] flex flex-col justify-between">
          <span className="text-[8px] sm:text-[9px] text-slate-400 font-arcade">WIN RATE</span>
          <div className="text-xl sm:text-2xl font-arcade text-green-400 mt-1 neon-text-green">
            {periodRate}%
          </div>
          <span className="text-[9px] text-cyan-300 font-retro mt-1">PAST {periodDays} CYCLES</span>
        </div>

        <div className="p-3 bg-[#11092a] border-2 border-[#3b2d60] shadow-[2px_2px_0px_#05020a] flex flex-col justify-between">
          <span className="text-[8px] sm:text-[9px] text-slate-400 font-arcade">COMBO STREAK</span>
          <div className="text-xl sm:text-2xl font-arcade text-amber-400 flex items-center space-x-1 mt-1">
            <Flame className="w-5 h-5 fill-amber-400" />
            <span>x{user.currentStreak}</span>
          </div>
          <span className="text-[9px] text-cyan-300 font-retro mt-1">MAX: x{overallStreakStats.longestStreak}</span>
        </div>

        <div className="p-3 bg-[#11092a] border-2 border-[#3b2d60] shadow-[2px_2px_0px_#05020a] flex flex-col justify-between">
          <span className="text-[8px] sm:text-[9px] text-slate-400 font-arcade">TOTAL SCORE</span>
          <div className="text-xl sm:text-2xl font-arcade text-yellow-300 mt-1">
            {user.totalXp.toLocaleString()}
          </div>
          <span className="text-[9px] text-yellow-400 font-arcade mt-1 truncate">LV{user.level} {user.currentTitle}</span>
        </div>

        <div className="p-3 bg-[#11092a] border-2 border-[#3b2d60] shadow-[2px_2px_0px_#05020a] flex flex-col justify-between">
          <span className="text-[8px] sm:text-[9px] text-slate-400 font-arcade">S-RANK DAYS</span>
          <div className="text-xl sm:text-2xl font-arcade text-cyan-400 mt-1">
            {overallStreakStats.perfectDaysCount}
          </div>
          <span className="text-[9px] text-cyan-300 font-retro mt-1">100% CLEARS</span>
        </div>
      </div>

      {/* Life Attributes & Character Sheet Radar Section */}
      <div className="p-3.5 sm:p-5 bg-[#11092a] border-2 border-[#3b2d60] shadow-[3px_3px_0px_#05020a] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs sm:text-sm font-arcade text-yellow-400 flex items-center space-x-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>CHARACTER STAT ATTRIBUTE MATRIX</span>
            </h2>
            <p className="text-xs text-cyan-300 font-retro mt-0.5">
              Attributes level up as real-world habit missions are accomplished
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
          {/* SVG Radar Chart */}
          <div className="flex justify-center p-2 bg-[#090416] border-2 border-[#2f2352]">
            <BuffrRadarChart attributes={attributes} size={250} />
          </div>

          {/* Stat Progress Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
            {Object.entries(attributes).map(([attrName, val]) => (
              <div
                key={attrName}
                className="p-2 bg-[#0e0722] border-2 border-[#2f2352] space-y-1 shadow-[1px_1px_0px_#000]"
              >
                <div className="flex justify-between items-center text-[10px] font-arcade">
                  <span className="text-slate-200">{attrName.toUpperCase()}</span>
                  <span className="text-yellow-400">{val}/100</span>
                </div>
                <div className="w-full bg-[#05020c] h-2.5 border border-[#3b2d60] p-0.5">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full"
                    style={{ width: `${val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Performance Bar Chart */}
      <div className="p-3.5 sm:p-5 bg-[#11092a] border-2 border-[#3b2d60] shadow-[3px_3px_0px_#05020a] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs sm:text-sm font-arcade text-yellow-400">
              DAILY POWER TIMELINE
            </h2>
            <p className="text-xs text-cyan-300 font-retro mt-0.5">
              Performance output across active operational days
            </p>
          </div>
        </div>

        <div className="h-40 flex items-end justify-between gap-1 sm:gap-2 pt-3 px-1 bg-[#090416] border-2 border-[#2f2352]">
          {dayBars.map((bar, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
              <div className="text-[8px] font-arcade text-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity">
                {bar.rate}%
              </div>
              <div className="w-full bg-[#05020c] h-24 flex items-end p-0.5 border border-[#3b2d60]">
                <div
                  className={`w-full transition-all duration-300 ${
                    bar.rate >= 95
                      ? 'bg-yellow-400 shadow-[0_0_6px_#facc15]'
                      : bar.rate >= 80
                      ? 'bg-emerald-400'
                      : bar.rate >= 50
                      ? 'bg-cyan-400'
                      : bar.rate > 0
                      ? 'bg-purple-500'
                      : 'bg-slate-800'
                  }`}
                  style={{ height: `${Math.max(6, bar.rate)}%` }}
                />
              </div>
              <span className="text-[8px] sm:text-[9px] font-arcade text-slate-300 truncate w-full text-center">
                {bar.label.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Category Breakdown Pillars */}
      <div className="p-3.5 sm:p-5 bg-[#11092a] border-2 border-[#3b2d60] shadow-[3px_3px_0px_#05020a] space-y-3">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-purple-400" />
          <h2 className="text-xs sm:text-sm font-arcade text-yellow-400">
            CLASS GUILD ALLOCATION
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.entries(categoryCounts)
            .filter(([_, data]) => data.total > 0)
            .map(([cat, data]) => {
              const compPercent = data.total > 0 ? Math.round((data.done / data.total) * 100) : 0;
              return (
                <div
                  key={cat}
                  className="p-2.5 bg-[#0e0722] border-2 border-[#2f2352] space-y-1"
                >
                  <div className="flex justify-between items-center text-[10px] font-arcade">
                    <span className="text-white">{cat.toUpperCase()}</span>
                    <span className="text-cyan-300">
                      {data.done} / {data.total} • <strong className="text-yellow-400">{compPercent}%</strong>
                    </span>
                  </div>
                  <div className="w-full bg-[#05020c] h-2.5 border border-[#3b2d60] p-0.5">
                    <div
                      className="bg-emerald-400 h-full"
                      style={{ width: `${compPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Algorithmic Smart Insights List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <h2 className="text-xs sm:text-sm font-arcade text-yellow-400">
              TACTICAL INTEL & WEAKNESS SCAN
            </h2>
          </div>
          <button
            onClick={onOpenWeeklyReview}
            className="text-[10px] font-arcade text-cyan-400 hover:text-yellow-400 flex items-center space-x-1"
          >
            <span>FULL DEBRIEF</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className="p-3 bg-[#11092a] border-2 border-[#3b2d60] space-y-1 shadow-[2px_2px_0px_#05020a]"
            >
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-yellow-400 border border-black text-black flex items-center justify-center text-xs font-bold">
                  ⚡
                </div>
                <h4 className="text-[10px] sm:text-[11px] font-arcade text-yellow-300 tracking-wider">
                  {insight.title.toUpperCase()}
                </h4>
              </div>
              <p className="text-xs text-slate-300 font-retro leading-relaxed pl-8">
                {insight.description}
              </p>
            </div>
          ))}
        </div>
      </div>
      </>
      )}
    </div>
  );
};
