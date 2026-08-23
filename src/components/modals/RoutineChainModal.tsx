import React, { useState } from 'react';
import {
  X,
  Zap,
  Plus,
  Trash2,
  Edit2,
  Check,
  Sparkles,
  Layers,
  ArrowRight,
  Clock,
  Flame,
} from 'lucide-react';
import { Habit, RoutineChain, TimeOfDay } from '../../types';
import { playSound } from '../../utils/sound';

interface RoutineChainModalProps {
  isOpen: boolean;
  onClose: () => void;
  chains: RoutineChain[];
  habits: Habit[];
  onSaveChain: (chain: RoutineChain) => void;
  onDeleteChain: (chainId: string) => void;
}

const EMOJI_OPTIONS = ['🌅', '⚡', '🧠', '🏋️', '🌙', '🎯', '💧', '🕯️', '🚀', '🔥', '🛡️', '⚔️'];
const COLOR_OPTIONS = ['#06b6d4', '#f59e0b', '#8b5cf6', '#10b981', '#ef4444', '#ec4899', '#3b82f6'];

export const RoutineChainModal: React.FC<RoutineChainModalProps> = ({
  isOpen,
  onClose,
  chains,
  habits,
  onSaveChain,
  onDeleteChain,
}) => {
  const [editingChain, setEditingChain] = useState<RoutineChain | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('⚡');
  const [color, setColor] = useState('#06b6d4');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [comboBonusXp, setComboBonusXp] = useState<number>(45);
  const [selectedHabitIds, setSelectedHabitIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const startEdit = (chain: RoutineChain) => {
    playSound('click');
    setEditingChain(chain);
    setIsCreatingNew(false);
    setTitle(chain.title);
    setDescription(chain.description || '');
    setEmoji(chain.emoji);
    setColor(chain.color);
    setTimeOfDay(chain.timeOfDay);
    setComboBonusXp(chain.comboBonusXp);
    setSelectedHabitIds([...chain.habitIds]);
  };

  const startCreate = () => {
    playSound('click');
    setEditingChain(null);
    setIsCreatingNew(true);
    setTitle('');
    setDescription('');
    setEmoji('⚡');
    setColor('#06b6d4');
    setTimeOfDay('morning');
    setComboBonusXp(45);
    setSelectedHabitIds([]);
  };

  const cancelForm = () => {
    playSound('click');
    setEditingChain(null);
    setIsCreatingNew(false);
  };

  const handleToggleHabitInChain = (habitId: string) => {
    playSound('click');
    if (selectedHabitIds.includes(habitId)) {
      setSelectedHabitIds(selectedHabitIds.filter((id) => id !== habitId));
    } else {
      setSelectedHabitIds([...selectedHabitIds, habitId]);
    }
  };

  const moveHabitOrder = (index: number, direction: 'up' | 'down') => {
    playSound('click');
    const newIds = [...selectedHabitIds];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newIds.length) return;
    const temp = newIds[index];
    newIds[index] = newIds[targetIdx];
    newIds[targetIdx] = temp;
    setSelectedHabitIds(newIds);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    playSound('powerup');
    const newChain: RoutineChain = {
      id: editingChain ? editingChain.id : `chain_${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      emoji,
      color,
      timeOfDay,
      comboBonusXp: Math.max(10, Math.min(200, comboBonusXp)),
      habitIds: selectedHabitIds,
      isArchived: editingChain ? editingChain.isArchived : false,
      order: editingChain ? editingChain.order : chains.length,
    };

    onSaveChain(newChain);
    setEditingChain(null);
    setIsCreatingNew(false);
  };

  const activeHabits = habits.filter((h) => !h.isArchived);

  return (
    <div
      id="routine-chain-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        id="routine-chain-modal-card"
        className="w-full max-w-2xl max-h-[90vh] bg-[#11092a] border-4 border-yellow-400 shadow-[8px_8px_0px_#000] flex flex-col overflow-hidden text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b-2 border-[#3b2d60] bg-[#090416]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-[#1f1242] border border-yellow-400 flex items-center justify-center text-yellow-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-arcade text-xs sm:text-sm text-yellow-400">
                {isCreatingNew
                  ? 'CREATE NEW MINI COMBO'
                  : editingChain
                  ? 'EDIT MINI COMBO'
                  : 'MINI COMBOS & QUEST CHAINS'}
              </h2>
              <p className="text-[10px] text-cyan-300 font-retro">
                Chain related habits into high-multiplier combos (+Bonus XP)
              </p>
            </div>
          </div>

          <button
            id="btn-close-chain-modal"
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {isCreatingNew || editingChain ? (
            /* CREATE / EDIT FORM */
            <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
              <div className="p-3 bg-[#180e38] border-2 border-yellow-400 space-y-3">
                {/* Title & Emoji */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-arcade text-slate-300 mb-1">
                      COMBO CHAIN TITLE *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Dawn Anchor Protocol"
                      className="w-full bg-[#0a0518] border-2 border-[#3b2d60] text-yellow-300 px-3 py-2 text-xs font-arcade focus:border-yellow-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-arcade text-slate-300 mb-1">
                      TIME OF DAY
                    </label>
                    <select
                      value={timeOfDay}
                      onChange={(e) => setTimeOfDay(e.target.value as TimeOfDay)}
                      className="w-full bg-[#0a0518] border-2 border-[#3b2d60] text-slate-200 px-2.5 py-2 text-xs focus:border-yellow-400 focus:outline-none"
                    >
                      <option value="morning">🌅 Morning</option>
                      <option value="afternoon">☀️ Afternoon</option>
                      <option value="evening">🌙 Evening</option>
                      <option value="anytime">⚡ Anytime</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] font-arcade text-slate-300 mb-1">
                    CHAIN OBJECTIVE (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Complete in sequence right after waking up"
                    className="w-full bg-[#0a0518] border border-[#3b2d60] text-slate-200 px-3 py-1.5 text-xs focus:border-yellow-400 focus:outline-none"
                  />
                </div>

                {/* Emoji & Color selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-arcade text-slate-300 mb-1">
                      COMBO EMBLEM
                    </label>
                    <div className="flex flex-wrap gap-1.5 p-2 bg-[#090416] border border-[#3b2d60]">
                      {EMOJI_OPTIONS.map((em) => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => {
                            playSound('click');
                            setEmoji(em);
                          }}
                          className={`w-7 h-7 flex items-center justify-center text-sm border ${
                            emoji === em
                              ? 'bg-yellow-400 border-yellow-200 text-black shadow-[1px_1px_0px_#000]'
                              : 'border-[#3b2d60] hover:border-slate-400'
                          }`}
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-arcade text-slate-300 mb-1">
                      COLOR THEME
                    </label>
                    <div className="flex flex-wrap gap-2 p-2 bg-[#090416] border border-[#3b2d60] items-center">
                      {COLOR_OPTIONS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            playSound('click');
                            setColor(c);
                          }}
                          className={`w-6 h-6 border-2 transition-transform ${
                            color === c ? 'scale-125 border-white shadow-[0_0_8px_#fff]' : 'border-black'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Combo XP Bonus Reward */}
                <div>
                  <label className="block text-[10px] font-arcade text-yellow-400 mb-1 flex items-center space-x-1.5">
                    <Zap className="w-3.5 h-3.5 fill-yellow-400" />
                    <span>COMBO CLEAR BONUS XP REWARD</span>
                  </label>
                  <div className="flex items-center space-x-3 bg-[#090416] p-2 border border-[#3b2d60]">
                    <input
                      type="range"
                      min={15}
                      max={100}
                      step={5}
                      value={comboBonusXp}
                      onChange={(e) => setComboBonusXp(parseInt(e.target.value, 10))}
                      className="flex-1 accent-yellow-400 cursor-pointer"
                    />
                    <span className="px-3 py-1 bg-yellow-400 text-black font-arcade text-xs font-bold border border-yellow-200">
                      +{comboBonusXp} XP
                    </span>
                  </div>
                  <p className="text-[10px] font-retro text-cyan-300 mt-1">
                    Awarded automatically when all linked habits in this chain are completed on a single day.
                  </p>
                </div>
              </div>

              {/* Select & Order Habits */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-arcade text-yellow-400 flex items-center space-x-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>ASSIGN HABITS IN SEQUENCE ({selectedHabitIds.length} SELECTED)</span>
                  </span>
                </div>

                {/* Selected Sequence View */}
                {selectedHabitIds.length > 0 && (
                  <div className="p-3 bg-[#0d0720] border-2 border-cyan-500 space-y-1.5">
                    <span className="text-[9px] font-arcade text-cyan-300 block mb-1">
                      EXECUTION SEQUENCE (CLICK ARROWS TO REORDER STEPS):
                    </span>
                    <div className="space-y-1">
                      {selectedHabitIds.map((hid, idx) => {
                        const h = habits.find((item) => item.id === hid);
                        if (!h) return null;
                        return (
                          <div
                            key={hid}
                            className="flex items-center justify-between px-2.5 py-1.5 bg-[#170e33] border border-[#483377] text-slate-200"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="px-1.5 py-0.5 bg-yellow-400 text-black font-arcade text-[8px] font-bold">
                                STEP {idx + 1}
                              </span>
                              <span className="text-base">{h.emoji}</span>
                              <span className="font-arcade text-[10px] text-yellow-200 truncate">
                                {h.title}
                              </span>
                            </div>

                            <div className="flex items-center space-x-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveHabitOrder(idx, 'up')}
                                className="px-1.5 py-0.5 bg-[#25174f] hover:bg-[#392477] disabled:opacity-30 text-[9px] font-arcade border border-[#5d419e]"
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                disabled={idx === selectedHabitIds.length - 1}
                                onClick={() => moveHabitOrder(idx, 'down')}
                                className="px-1.5 py-0.5 bg-[#25174f] hover:bg-[#392477] disabled:opacity-30 text-[9px] font-arcade border border-[#5d419e]"
                              >
                                ▼
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleHabitInChain(hid)}
                                className="px-1.5 py-0.5 bg-red-900/60 hover:bg-red-800 text-red-300 text-[9px] font-arcade border border-red-700 ml-1"
                              >
                                REMOVE
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Available Habits Picker Grid */}
                <div className="p-3 bg-[#0a0518] border border-[#3b2d60] space-y-2">
                  <span className="text-[9px] font-arcade text-slate-400 block">
                    TOGGLE HABITS TO INCLUDE IN THIS COMBO:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {activeHabits.map((h) => {
                      const isSelected = selectedHabitIds.includes(h.id);
                      return (
                        <div
                          key={h.id}
                          onClick={() => handleToggleHabitInChain(h.id)}
                          className={`p-2 border cursor-pointer flex items-center justify-between transition-colors ${
                            isSelected
                              ? 'bg-[#1e1342] border-yellow-400 text-yellow-300 shadow-[1px_1px_0px_#000]'
                              : 'bg-[#0e0722] border-[#2f2352] text-slate-400 hover:border-slate-500'
                          }`}
                        >
                          <div className="flex items-center space-x-2 truncate mr-2">
                            <span className="text-base">{h.emoji}</span>
                            <span className="text-[10px] font-arcade truncate">{h.title}</span>
                          </div>

                          <div
                            className={`w-5 h-5 border flex items-center justify-center ${
                              isSelected
                                ? 'bg-yellow-400 border-yellow-200 text-black'
                                : 'border-[#4c3b7a] bg-[#090416]'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#3b2d60]">
                <button
                  type="button"
                  onClick={cancelForm}
                  className="px-4 py-2 bg-[#1a0f35] hover:bg-[#28174f] border border-[#553c90] text-slate-300 font-arcade text-xs"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={!title.trim() || selectedHabitIds.length === 0}
                  className="px-5 py-2 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black font-arcade text-xs font-bold border-2 border-yellow-200 shadow-[2px_2px_0px_#000] active:translate-y-0.5 flex items-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>SAVE MINI COMBO</span>
                </button>
              </div>
            </form>
          ) : (
            /* LIST OF CHAINS */
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-[#180e38] p-3 border-2 border-[#3b2d60]">
                <div>
                  <h3 className="text-xs font-arcade text-yellow-400">ACTIVE COMBO PROTOCOLS</h3>
                  <p className="text-[10px] text-cyan-300 font-retro">
                    {chains.length} routine chains configured
                  </p>
                </div>

                <button
                  id="btn-add-new-chain"
                  onClick={startCreate}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-arcade text-[10px] sm:text-xs font-bold border border-emerald-300 shadow-[2px_2px_0px_#000] flex items-center space-x-1.5 active:translate-y-0.5"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>NEW COMBO CHAIN</span>
                </button>
              </div>

              {chains.length === 0 ? (
                <div className="p-8 text-center bg-[#090416] border-2 border-dashed border-[#3b2d60] space-y-3">
                  <div className="text-2xl">⚡</div>
                  <p className="text-xs text-yellow-400 font-arcade">NO MINI COMBOS ACTIVE</p>
                  <p className="text-[11px] text-slate-400 font-retro max-w-sm mx-auto">
                    Create your first habit stack chain to link related habits together and unlock streak bonuses!
                  </p>
                  <button
                    onClick={startCreate}
                    className="px-4 py-2 bg-yellow-400 text-black font-arcade text-xs font-bold border border-yellow-200 shadow-[2px_2px_0px_#000]"
                  >
                    CREATE FIRST COMBO
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {chains.map((chain) => {
                    const chainHabits = chain.habitIds
                      .map((id) => habits.find((h) => h.id === id))
                      .filter(Boolean) as Habit[];

                    return (
                      <div
                        key={chain.id}
                        className="p-3.5 bg-[#120a28] border-2 shadow-[3px_3px_0px_#05020a] space-y-2.5 transition-all"
                        style={{ borderColor: chain.color }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2.5">
                            <span className="text-xl">{chain.emoji}</span>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="text-xs font-arcade text-yellow-300">{chain.title}</h4>
                                <span className="px-1.5 py-0.2 bg-[#090416] border border-[#483377] text-[8px] font-arcade text-cyan-300">
                                  {chain.timeOfDay.toUpperCase()}
                                </span>
                              </div>
                              {chain.description && (
                                <p className="text-[10px] text-slate-400 font-retro">{chain.description}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 bg-yellow-400 text-black font-arcade text-[9px] font-bold border border-yellow-200 flex items-center space-x-1">
                              <Zap className="w-2.5 h-2.5 fill-black" />
                              <span>+{chain.comboBonusXp} XP</span>
                            </span>

                            <button
                              onClick={() => startEdit(chain)}
                              className="p-1.5 bg-[#1e1338] hover:bg-[#2e1c50] text-yellow-300 border border-[#553c90]"
                              title="Edit Chain"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                playSound('click');
                                if (window.confirm(`Delete mini combo "${chain.title}"?`)) {
                                  onDeleteChain(chain.id);
                                }
                              }}
                              className="p-1.5 bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-700"
                              title="Delete Chain"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Sequential Step List */}
                        <div className="p-2 bg-[#080414] border border-[#2b1f4c] flex flex-wrap items-center gap-1.5">
                          {chainHabits.length === 0 ? (
                            <span className="text-[9px] font-retro text-slate-500">
                              No habits assigned yet. Click edit to assign habits.
                            </span>
                          ) : (
                            chainHabits.map((ch, idx) => (
                              <React.Fragment key={ch.id}>
                                <div className="flex items-center space-x-1.5 px-2 py-1 bg-[#1a0f35] border border-[#483377]">
                                  <span className="text-[8px] font-arcade text-yellow-400">
                                    {idx + 1}.
                                  </span>
                                  <span className="text-xs">{ch.emoji}</span>
                                  <span className="text-[9px] font-mono text-slate-200 truncate max-w-[120px]">
                                    {ch.title}
                                  </span>
                                </div>
                                {idx < chainHabits.length - 1 && (
                                  <ArrowRight className="w-3 h-3 text-cyan-400 shrink-0" />
                                )}
                              </React.Fragment>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
