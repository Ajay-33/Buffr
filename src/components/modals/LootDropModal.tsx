import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Shield, Zap, Flame, Trophy, Check, ArrowRight, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { LootItem } from '../../types';
import { RARITY_CONFIGS } from '../../data/lootPool';
import { playSound, triggerHapticPulse } from '../../utils/sound';

interface LootDropModalProps {
  lootItem: LootItem | null;
  isOpen: boolean;
  onEquipItem: (item: LootItem) => void;
  onSendToVault: (item: LootItem) => void;
  onClose: () => void;
}

export const LootDropModal: React.FC<LootDropModalProps> = ({
  lootItem,
  isOpen,
  onEquipItem,
  onSendToVault,
  onClose,
}) => {
  const [chestOpened, setChestOpened] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    if (isOpen && lootItem) {
      setChestOpened(false);
      setIsOpening(false);
      playSound('loot');
      triggerHapticPulse('medium');
    }
  }, [isOpen, lootItem]);

  if (!isOpen || !lootItem) return null;

  const config = RARITY_CONFIGS[lootItem.rarity] || RARITY_CONFIGS.common;
  const isHighTier = ['epic', 'legendary', 'mythic', 'artifact'].includes(lootItem.rarity);

  const handleOpenChest = () => {
    if (chestOpened || isOpening) return;
    setIsOpening(true);
    triggerHapticPulse('heavy');

    setTimeout(() => {
      setChestOpened(true);
      setIsOpening(false);

      if (isHighTier) {
        playSound('legendary');
      } else {
        playSound('powerup');
      }

      // Fire retro confetti
      try {
        confetti({
          particleCount: isHighTier ? 90 : 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: isHighTier
            ? ['#facc15', '#ec4899', '#38bdf8', '#a855f7', '#10b981']
            : ['#38bdf8', '#10b981', '#facc15'],
        });
      } catch {}
    }, 450);
  };

  const handleEquip = () => {
    playSound('equip');
    triggerHapticPulse('medium');
    onEquipItem(lootItem);
    onClose();
  };

  const handleVault = () => {
    playSound('click');
    onSendToVault(lootItem);
    onClose();
  };

  return (
    <AnimatePresence>
      <div
        id="loot-drop-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md"
        onClick={(e) => {
          if (e.target === e.currentTarget && chestOpened) onClose();
        }}
      >
        <motion.div
          id="loot-drop-modal-card"
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 24, stiffness: 300 }}
          className={`w-full max-w-md bg-[#0e0722] border-4 ${config.border} p-4 sm:p-6 shadow-[0_0_30px_rgba(0,0,0,0.9),0_0_15px_rgba(34,211,238,0.2)] text-white relative overflow-hidden`}
        >
          {/* Header Banner */}
          <div className="flex items-center justify-between border-b-2 border-[#3b2d60] pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
              <span className="font-arcade text-xs sm:text-sm text-yellow-400 tracking-wider">
                {chestOpened ? 'MYSTERY LOOT UNLOCKED!' : 'VICTORY LOOT DROP!'}
              </span>
            </div>
            {chestOpened && (
              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-white bg-[#1e1338] border border-slate-700 hover:border-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {!chestOpened ? (
            /* UNOPENED CHEST STATE */
            <div className="text-center py-6 space-y-5">
              <motion.div
                animate={
                  isOpening
                    ? { scale: [1, 1.25, 0.9, 1.3], rotate: [0, -8, 8, -12, 12, 0] }
                    : { y: [0, -8, 0], scale: [1, 1.02, 1] }
                }
                transition={{ repeat: isOpening ? 0 : Infinity, duration: 1.8 }}
                onClick={handleOpenChest}
                className="w-28 h-28 mx-auto bg-gradient-to-b from-[#2a1b4e] to-[#120a28] border-4 border-yellow-400 flex flex-col items-center justify-center cursor-pointer shadow-[0_0_20px_rgba(250,204,21,0.4)] group active:scale-95 transition-transform"
              >
                <span className="text-5xl group-hover:scale-110 transition-transform">🎁</span>
                <span className="text-[8px] font-arcade text-yellow-300 mt-1">TAP TO OPEN</span>
              </motion.div>

              <div className="space-y-1">
                <h3 className="font-arcade text-sm sm:text-base text-yellow-300">
                  MYSTERY ARCADE POD DISCOVERED!
                </h3>
                <p className="text-xs font-retro text-cyan-300">
                  Your habit execution triggered an unpredictable bonus reward.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenChest}
                disabled={isOpening}
                className="w-full py-3 bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 hover:from-yellow-400 hover:to-amber-300 text-black font-arcade text-xs sm:text-sm border-2 border-yellow-200 shadow-[0_4px_0_#78350f,0_8px_0_#000] active:translate-y-1 transition-all"
              >
                {isOpening ? 'OPENING POD...' : 'CRACK OPEN LOOT POD ⚡'}
              </button>
            </div>
          ) : (
            /* REVEALED ITEM STATE */
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 20 }}
              className="space-y-4 text-center"
            >
              {/* Rarity Tag */}
              <div className="flex justify-center">
                <span
                  className={`px-3 py-1 font-arcade text-[10px] sm:text-xs font-bold border-2 ${config.border} bg-gradient-to-r ${config.bgGradient} ${config.color} ${config.glow}`}
                >
                  ★ {config.name} {lootItem.slot.toUpperCase()} ★
                </span>
              </div>

              {/* Item Avatar Card */}
              <div
                className={`p-4 bg-gradient-to-b ${config.bgGradient} border-2 ${config.border} flex flex-col items-center justify-center relative overflow-hidden`}
              >
                <div className="w-16 h-16 bg-[#05020c] border-2 border-slate-700 flex items-center justify-center text-4xl shadow-inner mb-2">
                  {lootItem.emoji}
                </div>
                <h3 className={`font-arcade text-sm sm:text-base ${config.color} tracking-wide`}>
                  {lootItem.name.toUpperCase()}
                </h3>
                <p className="text-[10px] font-retro text-slate-300 mt-0.5">
                  {lootItem.subtitle}
                </p>
              </div>

              {/* Lore / Flavor Text */}
              <div className="p-2.5 bg-[#080314] border border-[#2f2352] text-left">
                <p className="text-xs font-retro text-emerald-300 leading-relaxed font-semibold">
                  ⚡ {lootItem.description}
                </p>
                <p className="text-[10px] font-retro text-slate-400 italic mt-1 border-t border-slate-800 pt-1">
                  "{lootItem.flavorText}"
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-arcade text-left">
                {lootItem.stats.xpBonusPercent && (
                  <div className="p-1.5 bg-[#170e36] border border-cyan-500/50 text-cyan-300">
                    XP BOOST: +{lootItem.stats.xpBonusPercent}%
                  </div>
                )}
                {lootItem.stats.luckBonusPercent && (
                  <div className="p-1.5 bg-[#170e36] border border-yellow-500/50 text-yellow-300">
                    LOOT LUCK: +{lootItem.stats.luckBonusPercent}%
                  </div>
                )}
                {lootItem.stats.critXpChance && (
                  <div className="p-1.5 bg-[#170e36] border border-purple-500/50 text-purple-300">
                    2x CRIT XP: {lootItem.stats.critXpChance}%
                  </div>
                )}
                {lootItem.stats.freezeSlotsBonus && (
                  <div className="p-1.5 bg-[#170e36] border border-blue-500/50 text-blue-300">
                    FREEZE CAP: +{lootItem.stats.freezeSlotsBonus}
                  </div>
                )}
                {lootItem.stats.strengthBoost && (
                  <div className="p-1.5 bg-[#170e36] border border-red-500/50 text-red-300">
                    STR BOOST: +{lootItem.stats.strengthBoost}
                  </div>
                )}
                {lootItem.stats.disciplineBoost && (
                  <div className="p-1.5 bg-[#170e36] border border-amber-500/50 text-amber-300">
                    DISC BOOST: +{lootItem.stats.disciplineBoost}
                  </div>
                )}
                {lootItem.stats.mindBoost && (
                  <div className="p-1.5 bg-[#170e36] border border-purple-500/50 text-purple-300">
                    MIND BOOST: +{lootItem.stats.mindBoost}
                  </div>
                )}
                {lootItem.stats.focusBoost && (
                  <div className="p-1.5 bg-[#170e36] border border-cyan-500/50 text-cyan-300">
                    FOCUS BOOST: +{lootItem.stats.focusBoost}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  id="btn-equip-loot"
                  onClick={handleEquip}
                  className="py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-arcade text-xs border-2 border-emerald-200 shadow-[0_3px_0_#064e3b] active:translate-y-0.5 flex items-center justify-center space-x-1.5 font-bold"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>EQUIP NOW</span>
                </button>
                <button
                  type="button"
                  id="btn-vault-loot"
                  onClick={handleVault}
                  className="py-2.5 bg-[#1e1338] hover:bg-[#2c1d5e] text-slate-200 font-arcade text-xs border-2 border-[#4b3a7a] shadow-[0_3px_0_#05020a] active:translate-y-0.5 flex items-center justify-center space-x-1.5"
                >
                  <span>VAULT ITEM</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
