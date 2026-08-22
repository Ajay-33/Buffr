import React, { useState } from 'react';
import { X, Moon, Heart, Sparkles, Check } from 'lucide-react';
import { MoodType, DailyReflection } from '../../types';
import { getTodayStr } from '../../utils/dateUtils';
import { playSound } from '../../utils/sound';

interface DailyReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveReflection: (reflection: DailyReflection) => void;
  existingReflection?: DailyReflection | null;
}

const MOODS: { type: MoodType; emoji: string; label: string; color: string }[] = [
  { type: 'terrible', emoji: '😫', label: 'CRITICAL', color: '#f43f5e' },
  { type: 'bad', emoji: '😕', label: 'LOW HP', color: '#fb923c' },
  { type: 'okay', emoji: '😐', label: 'NEUTRAL', color: '#facc15' },
  { type: 'good', emoji: '🙂', label: 'CHARGED', color: '#38bdf8' },
  { type: 'great', emoji: '🔥', label: 'GODMODE', color: '#34d399' },
];

export const DailyReflectionModal: React.FC<DailyReflectionModalProps> = ({
  isOpen,
  onClose,
  onSaveReflection,
  existingReflection,
}) => {
  const [selectedMood, setSelectedMood] = useState<MoodType>(
    existingReflection ? existingReflection.mood : 'good'
  );
  const [whatWentWell, setWhatWentWell] = useState(
    existingReflection ? existingReflection.whatWentWell || '' : ''
  );
  const [whatCouldImprove, setWhatCouldImprove] = useState(
    existingReflection ? existingReflection.whatCouldImprove || '' : ''
  );
  const [notes, setNotes] = useState(existingReflection ? existingReflection.notes || '' : '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playSound('powerup');
    const reflection: DailyReflection = {
      dateStr: existingReflection ? existingReflection.dateStr : getTodayStr(),
      mood: selectedMood,
      whatWentWell: whatWentWell.trim() || undefined,
      whatCouldImprove: whatCouldImprove.trim() || undefined,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    onSaveReflection(reflection);
    onClose();
  };

  return (
    <div
      id="daily-reflection-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        id="daily-reflection-modal-card"
        className="w-full max-w-md bg-[#11092a] border-4 border-yellow-400 shadow-[8px_8px_0px_#000] flex flex-col overflow-hidden text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b-2 border-[#3b2d60] bg-[#090416]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-[#1f1242] border border-yellow-400 flex items-center justify-center text-yellow-400">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-arcade text-xs sm:text-sm text-yellow-400">DAILY LOG DEBRIEF</h2>
              <p className="text-[11px] text-cyan-300 font-retro">
                RECORD HP, VICTORIES & RECALIBRATE FOR NEXT STAGE
              </p>
            </div>
          </div>
          <button
            id="reflection-modal-close-btn"
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Mood scale */}
          <div>
            <label className="block text-[9px] font-arcade text-cyan-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Heart className="w-3 h-3 text-pink-400" />
              <span>PLAYER ENERGY & SYSTEM STATUS</span>
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {MOODS.map((m) => {
                const active = selectedMood === m.type;
                return (
                  <button
                    key={m.type}
                    type="button"
                    onClick={() => {
                      playSound('click');
                      setSelectedMood(m.type);
                    }}
                    className={`py-2 px-1 border flex flex-col items-center justify-center transition-all ${
                      active
                        ? 'bg-[#1f1242] border-yellow-400 shadow-[2px_2px_0px_#000]'
                        : 'bg-[#090416] border-[#3b2d60] hover:border-slate-500'
                    }`}
                  >
                    <span className="text-xl mb-0.5">{m.emoji}</span>
                    <span
                      className="text-[8px] font-arcade"
                      style={{ color: active ? '#facc15' : '#94a3b8' }}
                    >
                      {m.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* What went well */}
          <div>
            <label className="block text-[9px] font-arcade text-green-400 uppercase tracking-wider mb-1 flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-green-400" />
              <span>KEY VICTORIES TODAY (STAGE WINS)</span>
            </label>
            <input
              id="reflection-input-wins"
              type="text"
              placeholder="e.g. Cleared heavy training, 8hr deep focus..."
              value={whatWentWell}
              onChange={(e) => setWhatWentWell(e.target.value)}
              className="w-full bg-[#090416] border-2 border-[#3b2d60] px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 font-arcade"
            />
          </div>

          {/* What could improve */}
          <div>
            <label className="block text-[9px] font-arcade text-amber-400 uppercase tracking-wider mb-1">
              TACTICAL UPGRADES FOR NEXT ROUND
            </label>
            <input
              id="reflection-input-improve"
              type="text"
              placeholder="e.g. Hydrate earlier, avoid late screen time..."
              value={whatCouldImprove}
              onChange={(e) => setWhatCouldImprove(e.target.value)}
              className="w-full bg-[#090416] border-2 border-[#3b2d60] px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 font-arcade"
            />
          </div>

          {/* Notes / Thoughts */}
          <div>
            <label className="block text-[9px] font-arcade text-slate-300 uppercase tracking-wider mb-1">
              PILOT MEMORY LOG (OPTIONAL)
            </label>
            <textarea
              id="reflection-input-notes"
              rows={2}
              placeholder="Any extra combat logs, lessons, or thoughts..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#090416] border-2 border-[#3b2d60] px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 resize-none font-retro"
            />
          </div>

          {/* Submit */}
          <div className="pt-1">
            <button
              id="reflection-submit-btn"
              type="submit"
              className="w-full arcade-btn-yellow py-2.5 text-xs font-arcade flex items-center justify-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>COMMIT LOG (+25 PTS EXP)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
