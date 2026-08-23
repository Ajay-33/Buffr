import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Download,
  Share2,
  Copy,
  Check,
  X,
  Sparkles,
  Trophy,
  Crown,
  Zap,
  Flame,
  Shield,
  Palette,
} from 'lucide-react';
import { UserProfile, Habit, HabitCompletion, LifeAttributes } from '../../types';
import { calculateLifeAttributes } from '../../utils/gamification';
import { playSound, triggerHapticPulse } from '../../utils/sound';

interface RetroCartridgeModalProps {
  isOpen: boolean;
  user: UserProfile;
  habits: Habit[];
  completions: HabitCompletion[];
  onClose: () => void;
}

type CartridgeShellTheme = 'dmg' | 'purple' | 'gold' | 'cyan' | 'crimson';

interface ShellConfig {
  name: string;
  bodyBg: string;
  labelBg: string;
  borderColor: string;
  accentColor: string;
  canvasBody: string;
  canvasLabel: string;
  canvasBorder: string;
}

const SHELL_THEMES: Record<CartridgeShellTheme, ShellConfig> = {
  dmg: {
    name: 'CLASSIC DMG GREY',
    bodyBg: 'bg-[#9ca3af]',
    labelBg: 'bg-[#1e1b4b]',
    borderColor: 'border-[#6b7280]',
    accentColor: '#9333ea',
    canvasBody: '#9ca3af',
    canvasLabel: '#1e1b4b',
    canvasBorder: '#4b5563',
  },
  purple: {
    name: 'ATOMIC PURPLE',
    bodyBg: 'bg-[#581c87]',
    labelBg: 'bg-[#0f0826]',
    borderColor: 'border-[#9333ea]',
    accentColor: '#c084fc',
    canvasBody: '#581c87',
    canvasLabel: '#0f0826',
    canvasBorder: '#9333ea',
  },
  gold: {
    name: '24K ZELDA GOLD',
    bodyBg: 'bg-[#ca8a04]',
    labelBg: 'bg-[#1c1917]',
    borderColor: 'border-[#eab308]',
    accentColor: '#fde047',
    canvasBody: '#ca8a04',
    canvasLabel: '#1c1917',
    canvasBorder: '#eab308',
  },
  cyan: {
    name: 'CYBERPUNK NEON',
    bodyBg: 'bg-[#0891b2]',
    labelBg: 'bg-[#042f2e]',
    borderColor: 'border-[#22d3ee]',
    accentColor: '#67e8f9',
    canvasBody: '#0891b2',
    canvasLabel: '#042f2e',
    canvasBorder: '#22d3ee',
  },
  crimson: {
    name: 'BERSERKER RUBY',
    bodyBg: 'bg-[#991b1b]',
    labelBg: 'bg-[#450a0a]',
    borderColor: 'border-[#f43f5e]',
    accentColor: '#fda4af',
    canvasBody: '#991b1b',
    canvasLabel: '#450a0a',
    canvasBorder: '#f43f5e',
  },
};

export const RetroCartridgeModal: React.FC<RetroCartridgeModalProps> = ({
  isOpen,
  user,
  habits,
  completions,
  onClose,
}) => {
  const [shellTheme, setShellTheme] = useState<CartridgeShellTheme>('dmg');
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  if (!isOpen) return null;

  const shell = SHELL_THEMES[shellTheme];
  const attributes = calculateLifeAttributes(habits, completions);
  const completedTotal = completions.filter((c) => c.isCompleted).length;
  const winRate =
    completions.length > 0
      ? Math.min(100, Math.round((completedTotal / completions.length) * 100))
      : 100;

  const cartridgeCode = `BFR-${user.level.toString().padStart(2, '0')}-${user.totalXp
    .toString()
    .slice(-4)}`;

  // Download high-res Canvas snapshot
  const handleDownloadPNG = () => {
    setIsExporting(true);
    playSound('powerup');
    triggerHapticPulse('heavy');

    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 760;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Draw Cartridge Shell
    ctx.fillStyle = shell.canvasBody;
    ctx.fillRect(0, 0, 600, 760);

    // Cartridge Top Grip Ridges
    ctx.fillStyle = '#00000033';
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(60, 25 + i * 14, 480, 6);
    }

    // Outer Bevel
    ctx.lineWidth = 8;
    ctx.strokeStyle = shell.canvasBorder;
    ctx.strokeRect(10, 10, 580, 740);

    // Cartridge Label Area
    ctx.fillStyle = shell.canvasLabel;
    ctx.fillRect(50, 130, 500, 540);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ffffff44';
    ctx.strokeRect(50, 130, 500, 540);

    // Label Header
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('BUFFR RPG HERO CARTRIDGE', 70, 170);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '14px monospace';
    ctx.fillText(`SERIAL: ${cartridgeCode} | NINTENDO APPROVED`, 70, 195);

    // Divider
    ctx.strokeStyle = '#38bdf866';
    ctx.beginPath();
    ctx.moveTo(70, 210);
    ctx.lineTo(530, 210);
    ctx.stroke();

    // User Avatar & Title
    ctx.font = '36px sans-serif';
    ctx.fillText(user.avatarEmoji || '⚡', 75, 260);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px monospace';
    ctx.fillText(user.name.toUpperCase(), 130, 250);

    ctx.fillStyle = '#facc15';
    ctx.font = '15px monospace';
    ctx.fillText(`TITLE: [${user.currentTitle.toUpperCase()}]`, 130, 275);

    // Core Hero Stats Box
    ctx.fillStyle = '#080314';
    ctx.fillRect(70, 300, 460, 130);
    ctx.strokeStyle = '#4c1d95';
    ctx.strokeRect(70, 300, 460, 130);

    ctx.fillStyle = '#a855f7';
    ctx.font = 'bold 15px monospace';
    ctx.fillText(`LEVEL ${user.level} HERO`, 90, 330);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '14px monospace';
    ctx.fillText(`TOTAL XP: ${user.totalXp} XP`, 90, 360);
    ctx.fillText(`STREAK: ${user.currentStreak} DAYS (MAX: ${user.longestStreak || 0})`, 90, 385);
    ctx.fillText(`PERFECT S-RANK DAYS: ${user.perfectDaysCount || 0}`, 90, 410);

    // Life Attributes Mini-Matrix
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('LIFE ATTRIBUTE MATRIX', 70, 460);

    const attrsList: [string, number][] = [
      ['STR', attributes.Strength],
      ['HLT', attributes.Health],
      ['MND', attributes.Mind],
      ['FOC', attributes.Focus],
      ['DISC', attributes.Discipline],
      ['CALM', attributes.Mindfulness],
    ];

    attrsList.forEach(([label, val], idx) => {
      const x = 70 + (idx % 3) * 155;
      const y = 490 + Math.floor(idx / 3) * 35;

      ctx.fillStyle = '#1e1338';
      ctx.fillRect(x, y - 18, 145, 26);
      ctx.strokeStyle = '#38bdf844';
      ctx.strokeRect(x, y - 18, 145, 26);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`${label}: +${val}`, x + 10, y);
    });

    // Equipped Gear Line
    ctx.fillStyle = '#a855f7';
    ctx.font = '13px monospace';
    const weaponName = user.equippedGear?.weapon?.name || 'Wooden Practice Blade';
    const relicName = user.equippedGear?.relic?.name || 'None';
    ctx.fillText(`GEAR: ${weaponName.slice(0, 24)}`, 70, 585);
    ctx.fillText(`RELIC: ${relicName.slice(0, 24)}`, 70, 610);

    // Footer Stamp
    ctx.fillStyle = '#f43f5e';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('★ OFFICIAL BUFFR HARDCORE RECORD ★', 120, 650);

    // Bottom Cartridge Notch
    ctx.fillStyle = '#00000055';
    ctx.fillRect(250, 730, 100, 20);

    // Trigger Download
    setTimeout(() => {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `BUFFR_CARTRIDGE_${user.name.replace(/\s+/g, '_')}_LVL${user.level}.png`;
      link.href = dataUrl;
      link.click();
      setIsExporting(false);
    }, 250);
  };

  // Copy share card text
  const handleCopyShare = () => {
    playSound('click');
    triggerHapticPulse('light');

    const shareText = `🎮 BUFFR RPG HERO RECORD 🎮
━━━━━━━━━━━━━━━━━━━━
👤 HERO: ${user.name} [${user.currentTitle}]
⭐ LEVEL: ${user.level} (${user.totalXp} XP)
🔥 COMBO STREAK: ${user.currentStreak} Days (Max: ${user.longestStreak || 0})
🏆 S-RANK DAYS: ${user.perfectDaysCount || 0}
🛡️ WEAPON: ${user.equippedGear?.weapon?.name || 'Standard Focus Blade'}
💎 ATTRIBUTES: STR +${attributes.Strength} | MND +${attributes.Mind} | DISC +${attributes.Discipline}
━━━━━━━━━━━━━━━━━━━━
Level up your real life with Buffr!`;

    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div
        id="retro-cartridge-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-lg bg-[#0e0722] border-4 border-yellow-400 p-4 sm:p-6 shadow-[0_0_40px_rgba(0,0,0,0.9)] text-white space-y-4 my-auto relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-[#3b2d60] pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <h2 className="font-arcade text-xs sm:text-sm text-yellow-400 tracking-wider">
                RETRO GAME CARTRIDGE WRAP
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white bg-[#1e1338] border border-slate-700 hover:border-slate-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Theme Shell Selector */}
          <div className="flex items-center justify-between text-[10px] font-arcade bg-[#080314] p-2 border border-slate-800">
            <div className="flex items-center space-x-1 text-slate-400">
              <Palette className="w-3.5 h-3.5 text-cyan-400" />
              <span>SHELL COLOR:</span>
            </div>
            <div className="flex items-center space-x-1.5">
              {(Object.keys(SHELL_THEMES) as CartridgeShellTheme[]).map((themeKey) => (
                <button
                  key={themeKey}
                  onClick={() => {
                    playSound('click');
                    setShellTheme(themeKey);
                  }}
                  className={`w-5 h-5 border-2 transition-transform ${
                    shellTheme === themeKey ? 'scale-125 ring-2 ring-yellow-400' : ''
                  } ${
                    themeKey === 'dmg'
                      ? 'bg-slate-400 border-slate-600'
                      : themeKey === 'purple'
                      ? 'bg-purple-600 border-purple-800'
                      : themeKey === 'gold'
                      ? 'bg-yellow-500 border-yellow-700'
                      : themeKey === 'cyan'
                      ? 'bg-cyan-500 border-cyan-700'
                      : 'bg-red-600 border-red-800'
                  }`}
                  title={SHELL_THEMES[themeKey].name}
                />
              ))}
            </div>
          </div>

          {/* The Physical Retro Cartridge Rendering */}
          <div
            id="retro-cartridge-visual"
            className={`w-full max-w-sm mx-auto p-4 sm:p-5 ${shell.bodyBg} border-4 ${shell.borderColor} shadow-[6px_6px_0px_#000] relative overflow-hidden select-none`}
          >
            {/* Cartridge Top Grip Lines */}
            <div className="space-y-1.5 mb-3 opacity-30">
              <div className="h-1.5 bg-black rounded-sm w-full" />
              <div className="h-1.5 bg-black rounded-sm w-full" />
              <div className="h-1.5 bg-black rounded-sm w-full" />
            </div>

            {/* Inner Sticker Label */}
            <div
              className={`p-3.5 sm:p-4 ${shell.labelBg} border-2 border-white/20 text-white shadow-inner space-y-3 relative overflow-hidden`}
            >
              {/* Scanline overlay effect */}
              <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.15)_2px,rgba(0,0,0,0.15)_4px)] pointer-events-none" />

              {/* Cartridge Brand */}
              <div className="flex justify-between items-center border-b border-white/20 pb-1.5 text-[8px] sm:text-[9px] font-arcade">
                <span className="text-yellow-400 font-bold tracking-wider">
                  BUFFR ENTERTAINMENT SYSTEM
                </span>
                <span className="text-cyan-300">{cartridgeCode}</span>
              </div>

              {/* Hero Profile Block */}
              <div className="flex items-center space-x-3 bg-black/40 p-2 border border-white/10">
                <div className="text-3xl sm:text-4xl bg-black/60 p-1 border border-yellow-400/50">
                  {user.avatarEmoji || '⚡'}
                </div>
                <div className="truncate">
                  <h3 className="font-arcade text-xs sm:text-sm text-white font-bold truncate">
                    {user.name.toUpperCase()}
                  </h3>
                  <span className="text-[9px] font-retro text-yellow-300 block">
                    [{user.currentTitle}]
                  </span>
                  <div className="flex items-center space-x-2 text-[8px] font-mono text-cyan-300 mt-0.5">
                    <span>LVL {user.level}</span>
                    <span>•</span>
                    <span>{user.totalXp} XP</span>
                  </div>
                </div>
              </div>

              {/* Stats Highlights */}
              <div className="grid grid-cols-3 gap-1 text-center font-arcade text-[8px] sm:text-[9px]">
                <div className="bg-black/50 p-1.5 border border-white/10">
                  <span className="text-slate-400 block text-[7px]">COMBO</span>
                  <span className="text-orange-400 font-bold">{user.currentStreak}d</span>
                </div>
                <div className="bg-black/50 p-1.5 border border-white/10">
                  <span className="text-slate-400 block text-[7px]">S-RANK</span>
                  <span className="text-yellow-400 font-bold">{user.perfectDaysCount || 0}★</span>
                </div>
                <div className="bg-black/50 p-1.5 border border-white/10">
                  <span className="text-slate-400 block text-[7px]">WIN RATE</span>
                  <span className="text-emerald-400 font-bold">{winRate}%</span>
                </div>
              </div>

              {/* Mini Attributes Badge Bar */}
              <div className="bg-black/40 p-2 border border-white/10 text-[8px] font-mono flex justify-around text-center text-slate-300">
                <div>
                  <span className="text-[7px] text-red-400 block">STR</span>
                  <span>+{attributes.Strength}</span>
                </div>
                <div>
                  <span className="text-[7px] text-purple-400 block">MND</span>
                  <span>+{attributes.Mind}</span>
                </div>
                <div>
                  <span className="text-[7px] text-amber-400 block">DISC</span>
                  <span>+{attributes.Discipline}</span>
                </div>
                <div>
                  <span className="text-[7px] text-cyan-400 block">FOC</span>
                  <span>+{attributes.Focus}</span>
                </div>
              </div>

              {/* Bottom Hologram Stamp */}
              <div className="flex justify-between items-center text-[7px] font-arcade text-slate-400 border-t border-white/10 pt-1">
                <span>OFFICIAL SEAL OF QUALITY</span>
                <span className="text-yellow-400 font-bold">★ 100% DISCIPLINE ★</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              type="button"
              id="btn-download-cartridge"
              disabled={isExporting}
              onClick={handleDownloadPNG}
              className="py-2.5 bg-gradient-to-r from-yellow-500 to-amber-400 hover:from-yellow-400 text-black font-arcade text-xs border-2 border-yellow-200 shadow-[3px_3px_0px_#000] font-bold active:translate-y-0.5 flex items-center justify-center space-x-1.5"
            >
              <Download className="w-4 h-4 stroke-[3]" />
              <span>{isExporting ? 'GENERATING...' : 'SAVE CARTRIDGE PNG'}</span>
            </button>

            <button
              type="button"
              id="btn-copy-share-card"
              onClick={handleCopyShare}
              className="py-2.5 bg-[#1e1338] hover:bg-[#2c1d5e] text-white font-arcade text-xs border-2 border-[#4b3a7a] shadow-[3px_3px_0px_#000] active:translate-y-0.5 flex items-center justify-center space-x-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">COPIED!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-cyan-400" />
                  <span>SHARE WRAP</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
