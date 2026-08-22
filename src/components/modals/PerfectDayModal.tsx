import React, { useEffect } from 'react';
import { Sparkles, Flame, Zap, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { playSound } from '../../utils/sound';

interface PerfectDayModalProps {
  isOpen: boolean;
  totalHabitsCount: number;
  streakDays: number;
  onClose: () => void;
}

export const PerfectDayModal: React.FC<PerfectDayModalProps> = ({
  isOpen,
  totalHabitsCount,
  streakDays,
  onClose,
}) => {
  useEffect(() => {
    if (isOpen) {
      playSound('streak');
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.5 },
          colors: ['#facc15', '#34d399', '#38bdf8', '#fb7185'],
        });
      } catch {
        // Safe fallback
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      id="perfect-day-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <motion.div
        id="perfect-day-modal-card"
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-sm bg-[#11092a] border-4 border-green-400 p-5 sm:p-6 text-center text-slate-100 shadow-[8px_8px_0px_#000] relative overflow-hidden"
      >
        <div className="relative mx-auto w-16 h-16 mb-3 flex items-center justify-center">
          <div className="w-14 h-14 bg-[#0d261b] border-2 border-green-400 flex items-center justify-center text-green-400 shadow-[3px_3px_0px_#000]">
            <Sparkles className="w-8 h-8" />
          </div>
        </div>

        <h2 className="text-xl font-arcade tracking-wider text-green-400 mb-1 animate-pulse">
          ★ PERFECT CLEAR! ★
        </h2>
        <p className="text-xs text-cyan-300 font-retro mb-4">
          100% COMPLETION SCORE ACHIEVED! ALL MISSIONS COMPLETED!
        </p>

        <div className="grid grid-cols-2 gap-2 bg-[#090416] border-2 border-[#3b2d60] p-3 mb-4 text-center">
          <div>
            <span className="text-[8px] text-slate-400 uppercase font-arcade block">MISSIONS DONE</span>
            <span className="text-sm font-arcade text-green-400">
              {totalHabitsCount} / {totalHabitsCount}
            </span>
          </div>
          <div>
            <span className="text-[8px] text-slate-400 uppercase font-arcade block">COMBO BONUS</span>
            <span className="text-sm font-arcade text-yellow-400 flex items-center justify-center space-x-1">
              <Zap className="w-3 h-3 fill-yellow-400" />
              <span>+50 PTS</span>
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-1.5 text-xs text-yellow-300 font-retro mb-5 bg-[#291e0a] border-2 border-amber-400 py-2">
          <Flame className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span>COMBO MULTIPLIER: <strong className="font-arcade text-[10px] text-white">{streakDays} DAYS</strong></span>
        </div>

        <button
          id="perfect-day-continue-btn"
          onClick={() => {
            playSound('click');
            onClose();
          }}
          className="w-full arcade-btn-green py-3 text-xs font-arcade flex items-center justify-center space-x-1"
        >
          <span>LOCK IN SCORE</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
};
