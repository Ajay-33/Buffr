import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Shield,
  Zap,
  Flame,
  CheckCircle2,
  Lock,
  RotateCcw,
  Info,
  Crown,
  ChevronRight,
} from 'lucide-react';
import {
  SkillBranchId,
  SkillNode,
  UserSkillTreeState,
  UserProfile,
} from '../../types';
import {
  SKILL_BRANCHES,
  MASTER_SKILL_NODES,
  calculateTotalSkillPoints,
  calculateSkillTreeBonuses,
} from '../../data/skillTreeData';
import { playSound, triggerHapticPulse } from '../../utils/sound';

interface SkillTreeViewProps {
  user: UserProfile;
  onUpdateSkillTree: (updatedState: UserSkillTreeState) => void;
  onClose?: () => void;
}

export const SkillTreeView: React.FC<SkillTreeViewProps> = ({
  user,
  onUpdateSkillTree,
}) => {
  const [activeBranch, setActiveBranch] = useState<SkillBranchId>('warrior');
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Initialize or read skill tree state
  const totalEarnedSP = calculateTotalSkillPoints(user);
  const userTreeState: UserSkillTreeState = user.skillTree || {
    unlockedNodeIds: [],
    totalSkillPointsEarned: totalEarnedSP,
    availableSkillPoints: totalEarnedSP,
  };

  const unlockedSet = new Set(userTreeState.unlockedNodeIds || []);
  const availableSP = Math.max(
    0,
    totalEarnedSP - (userTreeState.unlockedNodeIds?.length || 0)
  );

  const currentBranchInfo = SKILL_BRANCHES[activeBranch];
  const branchNodes = MASTER_SKILL_NODES.filter((n) => n.branch === activeBranch);
  const activeBonuses = calculateSkillTreeBonuses(userTreeState);

  // Check if a node is unlockable
  const isNodeUnlockable = (node: SkillNode): boolean => {
    if (unlockedSet.has(node.id)) return false;
    if (availableSP < node.cost) return false;
    if (node.requiresNodeId && !unlockedSet.has(node.requiresNodeId)) return false;
    return true;
  };

  const handleUnlockNode = (node: SkillNode) => {
    if (!isNodeUnlockable(node)) return;

    playSound('skill');
    triggerHapticPulse('heavy');

    const nextUnlocked = [...userTreeState.unlockedNodeIds, node.id];
    const nextState: UserSkillTreeState = {
      unlockedNodeIds: nextUnlocked,
      totalSkillPointsEarned: totalEarnedSP,
      availableSkillPoints: totalEarnedSP - nextUnlocked.length,
    };

    onUpdateSkillTree(nextState);
    setSelectedNode(node);
  };

  const handleResetPoints = () => {
    playSound('powerup');
    triggerHapticPulse('medium');
    const resetState: UserSkillTreeState = {
      unlockedNodeIds: [],
      totalSkillPointsEarned: totalEarnedSP,
      availableSkillPoints: totalEarnedSP,
    };
    onUpdateSkillTree(resetState);
    setShowResetConfirm(false);
    setSelectedNode(null);
  };

  // Group nodes by tier (1, 2, 3)
  const tier1Nodes = branchNodes.filter((n) => n.tier === 1);
  const tier2Nodes = branchNodes.filter((n) => n.tier === 2);
  const tier3Nodes = branchNodes.filter((n) => n.tier === 3);

  return (
    <div id="skill-tree-view-container" className="space-y-4 max-w-4xl mx-auto pb-24">
      {/* SP HUD Banner */}
      <div className="bg-[#11092a] border-2 border-[#3b2d60] p-3 sm:p-4 shadow-[3px_3px_0px_#05020a] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
            <h1 className="font-arcade text-sm sm:text-base text-yellow-400 tracking-wider">
              SKILL MATRIX & ATTRIBUTE TREES
            </h1>
          </div>
          <p className="text-xs text-cyan-300 font-retro mt-0.5">
            Earn Skill Points (SP) by leveling up and mastering S-Rank days to unlock permanent passives.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 bg-[#080314] border-2 border-yellow-400 px-3 py-1.5 shadow-[2px_2px_0px_#000]">
            <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <div className="text-left font-arcade text-xs">
              <span className="text-slate-400 text-[8px] block">AVAILABLE SP</span>
              <span className="text-yellow-300 text-sm font-bold">{availableSP} SP</span>
            </div>
          </div>

          <button
            id="btn-reset-skills"
            onClick={() => setShowResetConfirm(true)}
            className="p-2 bg-[#1e1338] hover:bg-[#2c1d5e] border-2 border-slate-600 text-slate-300 hover:text-white text-xs font-arcade flex items-center space-x-1 shadow-[2px_2px_0px_#000] active:translate-y-0.5"
            title="Refund and re-allocate all Skill Points"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="text-[9px] hidden sm:inline">RESPEC</span>
          </button>
        </div>
      </div>

      {/* 5-Branch Selection Tabs */}
      <div className="grid grid-cols-5 gap-1 sm:gap-2">
        {(Object.keys(SKILL_BRANCHES) as SkillBranchId[]).map((branchKey) => {
          const bInfo = SKILL_BRANCHES[branchKey];
          const isSelected = activeBranch === branchKey;
          const branchUnlockedCount = MASTER_SKILL_NODES.filter(
            (n) => n.branch === branchKey && unlockedSet.has(n.id)
          ).length;

          return (
            <button
              key={branchKey}
              id={`tab-branch-${branchKey}`}
              onClick={() => {
                playSound('click');
                setActiveBranch(branchKey);
                setSelectedNode(null);
              }}
              className={`p-2 flex flex-col items-center justify-center transition-all border-2 ${
                isSelected
                  ? `${bInfo.badgeBg} ${bInfo.borderColor} text-white shadow-[2px_2px_0px_#000] scale-[1.02]`
                  : 'bg-[#0e0722] border-[#2f2352] text-slate-400 hover:text-white hover:border-slate-600'
              }`}
            >
              <span className="text-base sm:text-xl mb-0.5">{bInfo.emoji}</span>
              <span className="text-[8px] sm:text-[10px] font-arcade truncate w-full text-center">
                {bInfo.name}
              </span>
              <span className="text-[7px] font-mono text-cyan-300">
                {branchUnlockedCount}/5
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Tree Graph & Node Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2-Cols: Tree Canvas / Graph */}
        <div
          className={`lg:col-span-2 p-4 sm:p-6 bg-[#0c061e] border-2 ${currentBranchInfo.borderColor} shadow-[3px_3px_0px_#05020a] relative overflow-hidden`}
        >
          {/* Discipline Tagline */}
          <div className="flex items-center justify-between mb-4 border-b border-[#2f2352] pb-2">
            <div>
              <h2 className="font-arcade text-xs sm:text-sm text-yellow-400 flex items-center space-x-1.5">
                <span>{currentBranchInfo.emoji}</span>
                <span>{currentBranchInfo.name} DISCIPLINE TREE</span>
              </h2>
              <p className="text-[10px] font-retro text-cyan-300">
                {currentBranchInfo.tagline}
              </p>
            </div>
            <span className="text-[8px] font-arcade bg-[#1a0e36] text-slate-300 border border-slate-700 px-2 py-1">
              TIER 1 ➔ TIER 3 CAPSTONE
            </span>
          </div>

          {/* Symmetrical 3-Tier Node Architecture */}
          <div className="space-y-6 sm:space-y-8 relative">
            {/* TIER 1: Foundations */}
            <div className="space-y-1">
              <div className="text-[9px] font-arcade text-slate-400 text-center tracking-wider">
                ─── TIER 1: FOUNDATION PRIMERS (1 SP) ───
              </div>
              <div className="flex justify-around items-center pt-2">
                {tier1Nodes.map((node) => {
                  const isUnlocked = unlockedSet.has(node.id);
                  const unlockable = isNodeUnlockable(node);
                  const isSelected = selectedNode?.id === node.id;

                  return (
                    <motion.div
                      key={node.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        playSound('click');
                        setSelectedNode(node);
                      }}
                      className={`cursor-pointer w-28 sm:w-36 p-2.5 bg-[#120a28] border-2 transition-all text-center flex flex-col items-center ${
                        isSelected
                          ? 'ring-2 ring-yellow-400 shadow-[0_0_12px_#facc15]'
                          : ''
                      } ${
                        isUnlocked
                          ? 'border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                          : unlockable
                          ? 'border-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.4)] animate-pulse'
                          : 'border-slate-700 opacity-60'
                      }`}
                    >
                      <div className="text-xl mb-1">{node.emoji}</div>
                      <span className="font-arcade text-[9px] sm:text-[10px] text-white leading-tight">
                        {node.title}
                      </span>
                      <div className="mt-1 flex items-center space-x-1 text-[8px] font-mono">
                        {isUnlocked ? (
                          <span className="text-emerald-400 font-bold flex items-center">
                            <CheckCircle2 className="w-2.5 h-2.5 mr-0.5 inline" /> ACTIVE
                          </span>
                        ) : unlockable ? (
                          <span className="text-yellow-400 font-bold">READY</span>
                        ) : (
                          <span className="text-slate-500 flex items-center">
                            <Lock className="w-2.5 h-2.5 mr-0.5 inline" /> LOCKED
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Connecting Flow Lines */}
            <div className="flex justify-center text-slate-600 font-mono text-xs">
              ↓ ↓
            </div>

            {/* TIER 2: Specializations */}
            <div className="space-y-1">
              <div className="text-[9px] font-arcade text-slate-400 text-center tracking-wider">
                ─── TIER 2: SPECIALIZATION HARMONY (2 SP) ───
              </div>
              <div className="flex justify-around items-center pt-2">
                {tier2Nodes.map((node) => {
                  const isUnlocked = unlockedSet.has(node.id);
                  const unlockable = isNodeUnlockable(node);
                  const isSelected = selectedNode?.id === node.id;

                  return (
                    <motion.div
                      key={node.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        playSound('click');
                        setSelectedNode(node);
                      }}
                      className={`cursor-pointer w-28 sm:w-36 p-2.5 bg-[#120a28] border-2 transition-all text-center flex flex-col items-center ${
                        isSelected
                          ? 'ring-2 ring-yellow-400 shadow-[0_0_12px_#facc15]'
                          : ''
                      } ${
                        isUnlocked
                          ? 'border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                          : unlockable
                          ? 'border-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.4)] animate-pulse'
                          : 'border-slate-700 opacity-60'
                      }`}
                    >
                      <div className="text-xl mb-1">{node.emoji}</div>
                      <span className="font-arcade text-[9px] sm:text-[10px] text-white leading-tight">
                        {node.title}
                      </span>
                      <div className="mt-1 flex items-center space-x-1 text-[8px] font-mono">
                        {isUnlocked ? (
                          <span className="text-emerald-400 font-bold flex items-center">
                            <CheckCircle2 className="w-2.5 h-2.5 mr-0.5 inline" /> ACTIVE
                          </span>
                        ) : unlockable ? (
                          <span className="text-yellow-400 font-bold">READY</span>
                        ) : (
                          <span className="text-slate-500 flex items-center">
                            <Lock className="w-2.5 h-2.5 mr-0.5 inline" /> LOCKED
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Connecting Flow Lines */}
            <div className="flex justify-center text-slate-600 font-mono text-xs">
              ↓
            </div>

            {/* TIER 3: Master Capstone */}
            <div className="space-y-1">
              <div className="text-[9px] font-arcade text-amber-400 text-center tracking-wider flex items-center justify-center space-x-1">
                <Crown className="w-3 h-3 text-amber-400" />
                <span>TIER 3: MASTER CAPSTONE (3 SP)</span>
                <Crown className="w-3 h-3 text-amber-400" />
              </div>
              <div className="flex justify-center items-center pt-2">
                {tier3Nodes.map((node) => {
                  const isUnlocked = unlockedSet.has(node.id);
                  const unlockable = isNodeUnlockable(node);
                  const isSelected = selectedNode?.id === node.id;

                  return (
                    <motion.div
                      key={node.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        playSound('click');
                        setSelectedNode(node);
                      }}
                      className={`cursor-pointer w-44 sm:w-56 p-3 bg-gradient-to-b from-[#241344] to-[#120a28] border-2 transition-all text-center flex flex-col items-center ${
                        isSelected
                          ? 'ring-2 ring-yellow-400 shadow-[0_0_15px_#facc15]'
                          : ''
                      } ${
                        isUnlocked
                          ? 'border-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.6)]'
                          : unlockable
                          ? 'border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)] animate-pulse'
                          : 'border-slate-700 opacity-60'
                      }`}
                    >
                      <div className="text-2xl mb-1">{node.emoji}</div>
                      <span className="font-arcade text-[10px] sm:text-xs text-yellow-300 font-bold">
                        {node.title}
                      </span>
                      <div className="mt-1 flex items-center space-x-1 text-[8px] font-mono">
                        {isUnlocked ? (
                          <span className="text-amber-300 font-bold flex items-center">
                            <Crown className="w-3 h-3 mr-0.5 inline text-yellow-400" /> MASTERED
                          </span>
                        ) : unlockable ? (
                          <span className="text-yellow-400 font-bold">READY TO ASCEND</span>
                        ) : (
                          <span className="text-slate-500 flex items-center">
                            <Lock className="w-2.5 h-2.5 mr-0.5 inline" /> REQUIRES TIER 2
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1-Col: Selected Node Details / Action Panel */}
        <div className="space-y-3">
          <div className="p-4 bg-[#11092a] border-2 border-[#3b2d60] shadow-[3px_3px_0px_#05020a] space-y-3">
            <h3 className="font-arcade text-xs text-yellow-400 flex items-center space-x-1.5">
              <Info className="w-4 h-4 text-cyan-400" />
              <span>NODE TELEMETRY & PASSIVE</span>
            </h3>

            {selectedNode ? (
              <div className="space-y-3">
                <div className="p-3 bg-[#090416] border border-[#2f2352] space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{selectedNode.emoji}</span>
                    <div>
                      <h4 className="font-arcade text-xs text-white">
                        {selectedNode.title}
                      </h4>
                      <span className="text-[9px] font-retro text-yellow-400">
                        {selectedNode.subtitle}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-[#0e0722] border border-slate-700 text-xs font-retro text-emerald-300 leading-relaxed">
                  ⚡ {selectedNode.description}
                </div>

                <div className="flex justify-between items-center text-[10px] font-arcade border-t border-slate-800 pt-2 text-slate-300">
                  <span>COST: {selectedNode.cost} SP</span>
                  <span>
                    STATUS:{' '}
                    {unlockedSet.has(selectedNode.id)
                      ? 'MASTERED'
                      : isNodeUnlockable(selectedNode)
                      ? 'AVAILABLE'
                      : 'LOCKED'}
                  </span>
                </div>

                {/* Allocate Button */}
                {unlockedSet.has(selectedNode.id) ? (
                  <div className="w-full py-2.5 bg-emerald-950/80 border-2 border-emerald-500 text-emerald-300 text-center font-arcade text-xs flex items-center justify-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>PASSIVE ACTIVATED</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    id="btn-unlock-skill-node"
                    disabled={!isNodeUnlockable(selectedNode)}
                    onClick={() => handleUnlockNode(selectedNode)}
                    className={`w-full py-2.5 font-arcade text-xs border-2 shadow-[2px_2px_0px_#000] flex items-center justify-center space-x-1.5 transition-all ${
                      isNodeUnlockable(selectedNode)
                        ? 'bg-gradient-to-r from-yellow-500 to-amber-400 hover:from-yellow-400 hover:to-amber-300 text-black border-yellow-200 active:translate-y-0.5'
                        : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>ALLOCATE {selectedNode.cost} SP</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 space-y-2">
                <span className="text-3xl block">🔮</span>
                <p className="text-xs font-retro">
                  Select any node on the matrix tree to view its passive telemetry and allocate Skill Points.
                </p>
              </div>
            )}
          </div>

          {/* Active Bonuses Summary Card */}
          <div className="p-3.5 bg-[#11092a] border-2 border-[#3b2d60] shadow-[2px_2px_0px_#05020a] space-y-2 text-[10px] font-arcade">
            <span className="text-cyan-300 block border-b border-slate-800 pb-1">
              CURRENT MATRIX MULTIPLIERS
            </span>
            <div className="space-y-1 text-slate-300 font-mono text-[11px]">
              <div className="flex justify-between">
                <span>XP Multiplier:</span>
                <span className="text-yellow-400 font-bold">
                  {Math.round(activeBonuses.xpMultiplier * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Loot Luck Bonus:</span>
                <span className="text-emerald-400 font-bold">
                  +{activeBonuses.lootLuckBonus}%
                </span>
              </div>
              {activeBonuses.morningBonusPercent > 0 && (
                <div className="flex justify-between">
                  <span>Morning Habit XP:</span>
                  <span className="text-cyan-400 font-bold">
                    +{activeBonuses.morningBonusPercent}%
                  </span>
                </div>
              )}
              {activeBonuses.eveningBonusPercent > 0 && (
                <div className="flex justify-between">
                  <span>Evening Habit XP:</span>
                  <span className="text-purple-400 font-bold">
                    +{activeBonuses.eveningBonusPercent}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-sm bg-[#0e0722] border-4 border-yellow-400 p-5 text-center space-y-4 shadow-2xl">
              <h3 className="font-arcade text-sm text-yellow-400">
                REFUND ALL SKILL POINTS?
              </h3>
              <p className="text-xs font-retro text-slate-300">
                You will refund all {unlockedSet.size} allocated skills and regain {totalEarnedSP} SP to redistribute freely across any discipline.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={handleResetPoints}
                  className="py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-arcade text-xs border border-black shadow-[2px_2px_0px_#000] active:translate-y-0.5"
                >
                  CONFIRM RESPEC
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="py-2 bg-slate-800 hover:bg-slate-700 text-white font-arcade text-xs border border-slate-600 active:translate-y-0.5"
                >
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
