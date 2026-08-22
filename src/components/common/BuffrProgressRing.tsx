import React from 'react';
import { motion } from 'motion/react';

interface BuffrProgressRingProps {
  score: number; // 0 - 100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  color?: string;
  showPercentage?: boolean;
}

export const BuffrProgressRing: React.FC<BuffrProgressRingProps> = ({
  score,
  size = 140,
  strokeWidth = 10,
  label,
  sublabel,
  color,
  showPercentage = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Determine dynamic ring color if not passed
  let ringColor = color;
  if (!ringColor) {
    if (score >= 95) ringColor = '#f59e0b'; // Amber / Gold
    else if (score >= 80) ringColor = '#10b981'; // Emerald
    else if (score >= 60) ringColor = '#14b8a6'; // Teal
    else if (score >= 40) ringColor = '#38bdf8'; // Sky
    else ringColor = '#f43f5e'; // Rose
  }

  return (
    <div
      id={`buffr-progress-ring-${size}`}
      className="relative flex flex-col items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-800/80"
          fill="transparent"
        />

        {/* Progress Arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
          strokeLinecap="round"
          fill="transparent"
          style={{
            filter: `drop-shadow(0 0 8px ${ringColor}44)`,
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
        {showPercentage ? (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-3xl font-extrabold tracking-tight font-display text-slate-100"
          >
            {Math.round(score)}%
          </motion.span>
        ) : null}

        {label ? (
          <span className="text-[11px] font-semibold text-slate-300 tracking-wider uppercase mt-0.5 max-w-[85px] truncate">
            {label}
          </span>
        ) : null}

        {sublabel ? (
          <span className="text-[10px] text-slate-400 font-mono mt-0.5">
            {sublabel}
          </span>
        ) : null}
      </div>
    </div>
  );
};
