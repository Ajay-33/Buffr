import React, { useState } from 'react';
import { LifeAttributes } from '../../types';
import { motion } from 'motion/react';

interface BuffrRadarChartProps {
  attributes: LifeAttributes;
  size?: number;
}

export const BuffrRadarChart: React.FC<BuffrRadarChartProps> = ({
  attributes,
  size = 280,
}) => {
  const [activeStat, setActiveStat] = useState<keyof LifeAttributes | null>(null);

  const keys: (keyof LifeAttributes)[] = [
    'Strength',
    'Health',
    'Mind',
    'Focus',
    'Discipline',
    'Mindfulness',
    'Creativity',
    'Social',
    'Finance',
  ];

  const count = keys.length;
  const center = size / 2;
  const radius = (size - 60) / 2;

  // Grid levels (25%, 50%, 75%, 100%)
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  // Helper to calculate coordinates for key index and normalized value
  const getCoordinates = (index: number, valPercent: number) => {
    const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
    const r = radius * (valPercent / 100);
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, angle };
  };

  // Polygon points
  const points = keys
    .map((k, i) => {
      const val = attributes[k] || 0;
      const { x, y } = getCoordinates(i, val);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div
      id="buffr-radar-character-sheet"
      className="flex flex-col items-center justify-center relative p-2"
    >
      <svg width={size} height={size} className="overflow-visible">
        {/* Background Grid webs */}
        {gridLevels.map((lvl, idx) => {
          const webPoints = keys
            .map((_, i) => {
              const { x, y } = getCoordinates(i, lvl * 100);
              return `${x},${y}`;
            })
            .join(' ');

          return (
            <polygon
              key={`grid-${idx}`}
              points={webPoints}
              fill="none"
              stroke="#334155"
              strokeWidth={idx === gridLevels.length - 1 ? '1.5' : '1'}
              strokeDasharray={idx === gridLevels.length - 1 ? 'none' : '3 3'}
              className="opacity-40"
            />
          );
        })}

        {/* Axis lines from center */}
        {keys.map((_, i) => {
          const { x, y } = getCoordinates(i, 100);
          return (
            <line
              key={`axis-${i}`}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#334155"
              strokeWidth="1"
              className="opacity-40"
            />
          );
        })}

        {/* User Stats Filled Polygon */}
        <motion.polygon
          points={points}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          fill="rgba(16, 185, 129, 0.25)"
          stroke="#10b981"
          strokeWidth="2.5"
          style={{
            filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.4))',
          }}
        />

        {/* Data points & labels */}
        {keys.map((k, i) => {
          const val = attributes[k] || 0;
          const { x, y } = getCoordinates(i, val);
          const labelCoord = getCoordinates(i, 118);
          const isSelected = activeStat === k;

          return (
            <g
              key={`node-${k}`}
              className="cursor-pointer"
              onMouseEnter={() => setActiveStat(k)}
              onMouseLeave={() => setActiveStat(null)}
              onClick={() => setActiveStat(isSelected ? null : k)}
            >
              {/* Stat Node circle */}
              <circle
                cx={x}
                cy={y}
                r={isSelected ? 6 : 4}
                fill={isSelected ? '#f59e0b' : '#34d399'}
                stroke="#090d16"
                strokeWidth="2"
                className="transition-all duration-200"
              />

              {/* Axis Label */}
              <text
                x={labelCoord.x}
                y={labelCoord.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={isSelected ? '#38bdf8' : '#94a3b8'}
                fontSize={isSelected ? '11px' : '9.5px'}
                fontWeight={isSelected ? '700' : '600'}
                className="font-display tracking-tight transition-colors duration-150"
              >
                {k}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Active Stat Card preview */}
      <div className="mt-2 text-center h-7 flex items-center justify-center">
        {activeStat ? (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono"
          >
            <span className="text-emerald-400 font-bold">{activeStat}</span>
            <span>:</span>
            <span className="font-bold text-white">{attributes[activeStat]} / 100</span>
          </motion.div>
        ) : (
          <span className="text-[11px] text-slate-400 font-mono">
            Hover or tap any attribute to inspect character stat
          </span>
        )}
      </div>
    </div>
  );
};
