import React, { useEffect } from 'react';
import { Sparkles, Trophy, Shield, ChevronRight, Award } from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { playSound } from '../../utils/sound';

interface LevelUpModalProps {
  isOpen: boolean;
  newLevel: number;
  unlockedTitle?: string;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  newLevel,
  unlockedTitle,
  onClose,
}) => {
  useEffect(() => {
    if (isOpen) {
      playSound('levelup');
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#facc15', '#06b6d4', '#10b981', '#f43f5e', '#a855f7'],
        });
      } catch {
        // Fallback if canvas is unavailable
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      id="level-up-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <motion.div
        id="level-up-modal-card"
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-sm bg-[#11092a] border-4 border-yellow-400 p-5 sm:p-6 text-center text-slate-100 shadow-[8px_8px_0px_#000] relative overflow-hidden"
      >
        {/* Glow backdrop */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-yellow-400/20 blur-2xl pointer-events-none" />

        {/* Level Icon Badge */}
        <div className="relative mx-auto w-20 h-20 mb-3 flex items-center justify-center">
          <div className="w-16 h-16 bg-[#1f1242] border-2 border-yellow-400 flex items-center justify-center text-yellow-400 shadow-[4px_4px_0px_#000]">
            <Trophy className="w-8 h-8" />
          </div>
          <div className="absolute -bottom-2 px-2 py-0.5 bg-yellow-400 border border-black text-[9px] font-arcade text-black font-bold">
            LVL {newLevel}
          </div>
        </div>

        <h2 className="text-xl font-arcade tracking-wider text-yellow-400 mb-1 animate-pulse">
          ★ LEVEL UP! ★
        </h2>
        <p className="text-xs text-cyan-300 font-retro mb-4">
          DISCIPLINE RANK ELEVATED TO BUFFR LVL {newLevel}!
        </p>

        {/* Rewards Box */}
        <div className="space-y-2 bg-[#090416] border-2 border-[#3b2d60] p-3 mb-4 text-left shadow-[2px_2px_0px_#000]">
          <div className="text-[9px] font-arcade text-yellow-400">
            UNLOCKED BUFFS & UPGRADES:
          </div>

          {unlockedTitle && (
            <div className="flex items-center space-x-2 text-xs font-retro text-yellow-300">
              <Award className="w-4 h-4 text-yellow-400 shrink-0" />
              <span>NEW TITLE: <strong className="text-white font-arcade text-[10px]">{unlockedTitle}</strong></span>
            </div>
          )}

          <div className="flex items-center space-x-2 text-xs font-retro text-green-300">
            <Shield className="w-4 h-4 text-green-400 shrink-0" />
            <span>+1 COMBO SHIELD CHARGE ACQUIRED</span>
          </div>

          <div className="flex items-center space-x-2 text-xs font-retro text-cyan-300">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>CHARACTER ATTRIBUTE CAP EXPANDED</span>
          </div>
        </div>

        <button
          id="level-up-continue-btn"
          onClick={() => {
            playSound('click');
            onClose();
          }}
          className="w-full arcade-btn-yellow py-3 text-xs font-arcade flex items-center justify-center space-x-1"
        >
          <span>CONTINUE QUEST</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
};
