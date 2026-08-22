import React from 'react';
import { motion } from 'motion/react';
import { Zap, Sparkles } from 'lucide-react';

interface BuffrXPBarProps {
  level: number;
  currentLevelXp: number;
  nextLevelXpRequired: number;
  progressPercent: number;
  streakDays?: number;
  showBonus?: boolean;
}

export const BuffrXPBar: React.FC<BuffrXPBarProps> = ({
  level,
  currentLevelXp,
  nextLevelXpRequired,
  progressPercent,
  streakDays = 0,
  showBonus = true,
}) => {
  let multiplierText = '';
  if (streakDays >= 100) multiplierText = '+30% COMBO';
  else if (streakDays >= 30) multiplierText = '+20% COMBO';
  else if (streakDays >= 7) multiplierText = '+10% COMBO';

  return (
    <div
      id="buffr-xp-bar-container"
      className="w-full bg-[#11092a] border-2 border-[#3b2d60] p-3 sm:p-4 shadow-[3px_3px_0px_#05020a]"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-yellow-400 border-2 border-yellow-200 flex items-center justify-center text-slate-950 font-arcade text-[10px] font-bold shadow-[2px_2px_0px_#000]">
            LV{level}
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs sm:text-sm font-arcade text-yellow-300 tracking-wider">
                STAGE {level}
              </span>
              <Sparkles className="w-3 h-3 text-cyan-400" />
            </div>
            <p className="text-[10px] font-retro text-cyan-300">
              PROGRESSION METER
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {showBonus && multiplierText ? (
            <span className="px-2 py-0.5 bg-amber-950 border border-amber-400 text-amber-300 text-[9px] font-arcade flex items-center space-x-1 shadow-[1px_1px_0px_#000]">
              <Zap className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
              <span>{multiplierText}</span>
            </span>
          ) : null}
          <div className="text-right font-mono">
            <span className="text-xs sm:text-sm font-bold text-green-400 neon-text-green">
              {currentLevelXp.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-400">
              {' '}/ {nextLevelXpRequired.toLocaleString()} PTS
            </span>
          </div>
        </div>
      </div>

      {/* Retro Segmented Bar */}
      <div className="relative w-full bg-[#05020c] h-4 sm:h-5 border-2 border-[#4c3b7a] p-0.5 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-yellow-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(3, progressPercent))}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(0,0,0,0.5) 8px, rgba(0,0,0,0.5) 10px)',
          }}
        />
      </div>

      <div className="flex justify-between items-center mt-1.5 text-[9px] sm:text-[10px] text-slate-300 font-arcade">
        <span className="text-cyan-300">{progressPercent}% CLEARED</span>
        <span className="text-yellow-400">{(nextLevelXpRequired - currentLevelXp).toLocaleString()} PTS TO NEXT LV</span>
      </div>
    </div>
  );
};
