import React, { useState } from 'react';
import {
  Sparkles,
  Check,
  ChevronRight,
  ChevronLeft,
  Flame,
  Trophy,
  Shield,
  CheckSquare,
  Bell,
} from 'lucide-react';
import { LifeCategory } from '../../types';
import { ROUTINE_TEMPLATE_PACKS, HabitTemplate } from '../../data/initialData';
import { playSound } from '../../utils/sound';

interface OnboardingModalProps {
  isOpen: boolean;
  onFinishOnboarding: (selectedHabits: HabitTemplate[], userName: string) => void;
  onExploreDemo: () => void;
}

const CATEGORIES: { cat: LifeCategory; emoji: string; desc: string }[] = [
  { cat: 'Fitness', emoji: '🏋️', desc: 'STRENGTH & POWER' },
  { cat: 'Health', emoji: '💧', desc: 'HP & VITALITY' },
  { cat: 'Mind', emoji: '🧠', desc: 'WISDOM & INTEL' },
  { cat: 'Focus', emoji: '⚡', desc: 'DEEP COGNITION' },
  { cat: 'Discipline', emoji: '🛡️', desc: 'IRON WILLPOWER' },
  { cat: 'Mindfulness', emoji: '🕯️', desc: 'INNER SANCTUM' },
  { cat: 'Sleep', emoji: '🌙', desc: 'REGEN BEDS' },
  { cat: 'Finance', emoji: '💰', desc: 'GOLD & LOOT' },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onFinishOnboarding,
  onExploreDemo,
}) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('Alex');
  const [selectedCategories, setSelectedCategories] = useState<LifeCategory[]>([
    'Fitness',
    'Health',
    'Focus',
  ]);
  const [selectedHabits, setSelectedHabits] = useState<HabitTemplate[]>([
    ROUTINE_TEMPLATE_PACKS[0].habits[0], // Water
    ROUTINE_TEMPLATE_PACKS[0].habits[1], // Stretch
    ROUTINE_TEMPLATE_PACKS[1].habits[0], // Workout
  ]);

  if (!isOpen) return null;

  const toggleCategory = (cat: LifeCategory) => {
    playSound('click');
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter((c) => c !== cat));
      }
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const toggleHabit = (template: HabitTemplate) => {
    playSound('click');
    if (selectedHabits.some((h) => h.title === template.title)) {
      setSelectedHabits(selectedHabits.filter((h) => h.title !== template.title));
    } else {
      setSelectedHabits([...selectedHabits, template]);
    }
  };

  const allAvailableTemplates = ROUTINE_TEMPLATE_PACKS.flatMap((p) => p.habits);

  const handleComplete = () => {
    playSound('levelup');
    onFinishOnboarding(selectedHabits, name.trim() || 'Player 1');
  };

  return (
    <div
      id="onboarding-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300"
    >
      <div
        id="onboarding-modal-card"
        className="w-full max-w-lg bg-[#11092a] border-4 border-yellow-400 shadow-[8px_8px_0px_#000] flex flex-col overflow-hidden text-slate-100 max-h-[90vh]"
      >
        {/* Step Indicator */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b-2 border-[#3b2d60] bg-[#090416]">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-yellow-400 text-black flex items-center justify-center font-bold font-arcade text-xs">
              B
            </div>
            <span className="font-arcade text-xs text-yellow-400">
              NEW GAME CONFIG
            </span>
          </div>
          <div className="flex items-center space-x-1.5 font-arcade text-[10px] text-cyan-300">
            STAGE {step}/5
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {step === 1 && (
            <div className="space-y-4 text-center py-2">
              <div className="w-16 h-16 bg-yellow-400 text-black flex items-center justify-center mx-auto shadow-[4px_4px_0px_#000] font-arcade text-2xl font-black">
                B
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-arcade text-yellow-400 tracking-wider">
                  INSERT COIN // BUFFR
                </h1>
                <p className="text-xs text-cyan-300 font-retro mt-1 max-w-sm mx-auto">
                  “BUILD YOUR CHARACTER STATS BY BUILDING YOUR DAILY HABITS.”
                </p>
              </div>

              <div className="p-3.5 bg-[#090416] border-2 border-[#3b2d60] text-left space-y-2">
                <label className="text-[9px] font-arcade text-yellow-400 uppercase tracking-wider block">
                  ENTER PILOT CALLSIGN / HANDLE:
                </label>
                <input
                  id="onboarding-input-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="PLAYER 1"
                  className="w-full bg-[#150b2e] border-2 border-[#3b2d60] px-3 py-2 text-xs font-arcade text-white focus:outline-none focus:border-yellow-400 uppercase"
                />
              </div>

              {/* Demo quick toggle button */}
              <div className="pt-1">
                <button
                  id="onboarding-explore-demo-btn"
                  onClick={() => {
                    playSound('powerup');
                    onExploreDemo();
                  }}
                  className="text-[11px] text-cyan-300 hover:text-yellow-400 font-retro cursor-pointer"
                >
                  ⚡ LOAD DEMO SAVE FILE (30-DAY COMBAT HISTORY) ⚡
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <div className="text-left">
                <h2 className="text-xs sm:text-sm font-arcade text-yellow-400">
                  CHOOSE CORE DISCIPLINES
                </h2>
                <p className="text-[11px] text-cyan-300 font-retro">
                  SELECT PILLARS TO CALIBRATE YOUR CHARACTER ATTRIBUTE TREE.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((c) => {
                  const isSelected = selectedCategories.includes(c.cat);
                  return (
                    <div
                      key={c.cat}
                      onClick={() => toggleCategory(c.cat)}
                      className={`p-2.5 border-2 transition-all cursor-pointer flex items-center space-x-2.5 ${
                        isSelected
                          ? 'bg-[#1f1242] border-yellow-400 shadow-[2px_2px_0px_#000] text-white'
                          : 'bg-[#090416] border-[#3b2d60] text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      <span className="text-xl">{c.emoji}</span>
                      <div className="truncate">
                        <span className="text-[10px] font-arcade block text-white truncate">
                          {c.cat.toUpperCase()}
                        </span>
                        <span className="text-[9px] text-cyan-300 font-retro truncate block">
                          {c.desc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <div className="text-left">
                <h2 className="text-xs sm:text-sm font-arcade text-yellow-400">
                  EQUIP STARTING QUESTS
                </h2>
                <p className="text-[11px] text-cyan-300 font-retro">
                  SELECT ROUTINES TO POPULATE YOUR DAILY QUEST LOG.
                </p>
              </div>

              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {allAvailableTemplates.map((h, i) => {
                  const isSelected = selectedHabits.some((sh) => sh.title === h.title);
                  return (
                    <div
                      key={i}
                      onClick={() => toggleHabit(h)}
                      className={`flex items-center justify-between p-2.5 border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#1f1242] border-green-400 text-white'
                          : 'bg-[#090416] border-[#3b2d60] text-slate-400 hover:border-yellow-400'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        <span className="text-base">{h.emoji}</span>
                        <div className="truncate">
                          <span className="text-xs font-retro block text-white truncate">{h.title}</span>
                          <span className="text-[9px] text-cyan-300 font-arcade">
                            {h.category.toUpperCase()} • {h.timeOfDay.toUpperCase()} • +{h.targetValue} {h.unit || ''}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 flex items-center justify-center border ${
                          isSelected
                            ? 'bg-green-500 border-green-500 text-black'
                            : 'border-[#3b2d60] bg-[#090416]'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3 text-center py-1">
              <div className="w-12 h-12 bg-yellow-400 text-black flex items-center justify-center mx-auto shadow-[3px_3px_0px_#000]">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-arcade text-yellow-400">
                  COMBAT PROGRESSION ENGINE
                </h2>
                <p className="text-[11px] text-cyan-300 font-retro">
                  HOW DAILY DISCIPLINE POWERS YOUR PILOT STATS:
                </p>
              </div>

              <div className="space-y-2 text-left text-xs">
                <div className="p-2.5 bg-[#090416] border-2 border-[#3b2d60] flex items-center space-x-2.5">
                  <CheckSquare className="w-4 h-4 text-green-400 shrink-0" />
                  <div>
                    <strong className="text-[10px] font-arcade text-green-400 block">1. 1-TAP HABIT LOG</strong>
                    <span className="text-cyan-200 font-retro text-[11px]">Earn XP & level up your character attributes directly.</span>
                  </div>
                </div>

                <div className="p-2.5 bg-[#090416] border-2 border-[#3b2d60] flex items-center space-x-2.5">
                  <Flame className="w-4 h-4 text-yellow-400 shrink-0" />
                  <div>
                    <strong className="text-[10px] font-arcade text-yellow-400 block">2. COMBO STREAKS</strong>
                    <span className="text-cyan-200 font-retro text-[11px]">Chaining consecutive days yields up to +30% EXP multiplier.</span>
                  </div>
                </div>

                <div className="p-2.5 bg-[#090416] border-2 border-[#3b2d60] flex items-center space-x-2.5">
                  <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <strong className="text-[10px] font-arcade text-cyan-400 block">3. RANKS & TITLES</strong>
                    <span className="text-cyan-200 font-retro text-[11px]">Ascend from ROOKIE to RELENTLESS and TITAN OF HABITS.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4 text-center py-2">
              <div className="w-12 h-12 bg-green-500 text-black flex items-center justify-center mx-auto shadow-[3px_3px_0px_#000]">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-arcade text-green-400">
                  SYSTEM READY // ALL CLEAR
                </h2>
                <p className="text-[11px] text-cyan-300 font-retro">
                  YOUR PILOT PROFILE HAS BEEN INITIALIZED WITH {selectedHabits.length} ACTIVE QUESTS.
                </p>
              </div>

              <div className="p-3.5 bg-[#090416] border-2 border-[#3b2d60] text-left text-xs font-arcade space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">CALLSIGN:</span>
                  <span className="text-white font-bold">{name.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">START RANK:</span>
                  <span className="text-green-400 font-bold">STARTER (LVL 1)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">SHIELD POTIONS:</span>
                  <span className="text-cyan-400 font-bold">2 FREEZES LOADED</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t-2 border-[#3b2d60] bg-[#090416]">
          {step > 1 ? (
            <button
              id="onboarding-prev-btn"
              onClick={() => {
                playSound('click');
                setStep(step - 1);
              }}
              className="py-2 px-3 bg-[#170e33] border border-[#3b2d60] text-slate-300 text-[10px] font-arcade flex items-center space-x-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>BACK</span>
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              id="onboarding-next-btn"
              onClick={() => {
                playSound('click');
                setStep(step + 1);
              }}
              className="arcade-btn-yellow py-2 px-4 text-[10px] font-arcade flex items-center space-x-1"
            >
              <span>NEXT</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              id="onboarding-finish-btn"
              onClick={handleComplete}
              className="arcade-btn-green py-2 px-5 text-[10px] font-arcade flex items-center space-x-1.5"
            >
              <span>START GAME</span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
