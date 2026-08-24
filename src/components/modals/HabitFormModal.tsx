import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Zap,
  Clock,
  Calendar,
  Layers,
  Award,
  Check,
  Gamepad2,
  Bell,
  BellOff,
} from 'lucide-react';
import {
  Habit,
  HabitDifficulty,
  HabitType,
  LifeCategory,
  TimeOfDay,
  FrequencyType,
} from '../../types';
import {
  DIFFICULTY_BASE_XP,
} from '../../utils/gamification';
import { ROUTINE_TEMPLATE_PACKS, HabitTemplate } from '../../data/initialData';
import { playSound } from '../../utils/sound';

interface HabitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveHabit: (habit: Habit) => void;
  onApplyRoutinePack?: (habits: HabitTemplate[]) => void;
  editingHabit?: Habit | null;
}

const CATEGORIES: LifeCategory[] = [
  'Fitness',
  'Health',
  'Mind',
  'Focus',
  'Discipline',
  'Mindfulness',
  'Creativity',
  'Social',
  'Finance',
  'Sleep',
];

const EMOJI_OPTIONS = ['🏋️', '💧', '⚡', '📚', '🕯️', '👟', '🌙', '🥩', '🎯', '🧘‍♂️', '🚴', '💻', '🎨', '💰', '🧠', '🥗'];

const COLOR_OPTIONS = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899'];

export const HabitFormModal: React.FC<HabitFormModalProps> = ({
  isOpen,
  onClose,
  onSaveHabit,
  onApplyRoutinePack,
  editingHabit,
}) => {
  const [activeTab, setActiveTab] = useState<'custom' | 'templates'>('custom');

  // Form State
  const [title, setTitle] = useState(editingHabit ? editingHabit.title : '');
  const [description, setDescription] = useState(editingHabit ? editingHabit.description || '' : '');
  const [category, setCategory] = useState<LifeCategory>(editingHabit ? editingHabit.category : 'Fitness');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(editingHabit ? editingHabit.timeOfDay : 'morning');
  const [habitType, setHabitType] = useState<HabitType>(editingHabit ? editingHabit.habitType : 'boolean');
  const [difficulty, setDifficulty] = useState<HabitDifficulty>(editingHabit ? editingHabit.difficulty : 'medium');
  const [targetValue, setTargetValue] = useState<number>(editingHabit ? editingHabit.targetValue : 1);
  const [unit, setUnit] = useState<string>(editingHabit ? editingHabit.unit || '' : '');
  const [frequencyType, setFrequencyType] = useState<FrequencyType>(editingHabit ? editingHabit.frequencyType : 'daily');
  const [frequencyDays, setFrequencyDays] = useState<number[]>(editingHabit ? editingHabit.frequencyDays : [0, 1, 2, 3, 4, 5, 6]);
  const [intervalDays, setIntervalDays] = useState<number>(
    editingHabit ? editingHabit.intervalDays || editingHabit.frequency?.intervalDays || 2 : 2
  );
  const [timesPerWeek, setTimesPerWeek] = useState<number>(
    editingHabit ? editingHabit.timesPerWeek || editingHabit.frequency?.timesPerWeek || 3 : 3
  );
  const [emoji, setEmoji] = useState<string>(editingHabit ? editingHabit.emoji : '⚡');
  const [color, setColor] = useState<string>(editingHabit ? editingHabit.color : '#10b981');
  const [isReminderEnabled, setIsReminderEnabled] = useState<boolean>(
    editingHabit ? Boolean(editingHabit.reminderTime) : false
  );
  const [reminderTime, setReminderTime] = useState<string>(
    editingHabit ? editingHabit.reminderTime || '08:00' : '08:00'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    playSound('powerup');
    const baseXP = DIFFICULTY_BASE_XP[difficulty] || 20;

    const habit: Habit = {
      id: editingHabit ? editingHabit.id : `h_${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      icon: 'CheckSquare',
      emoji,
      color,
      category,
      timeOfDay,
      habitType,
      difficulty,
      targetValue: habitType === 'boolean' || habitType === 'avoidance' ? 1 : Math.max(1, targetValue),
      unit: habitType === 'boolean' || habitType === 'avoidance' ? undefined : unit.trim() || undefined,
      frequencyType,
      frequencyDays,
      // Dynamic scheduling payloads (mirrored flat + nested for compatibility)
      intervalDays: frequencyType === 'interval' ? Math.max(2, Math.min(365, intervalDays)) : undefined,
      timesPerWeek: frequencyType === 'times_per_week' ? Math.max(1, Math.min(7, timesPerWeek)) : undefined,
      frequency: {
        type: frequencyType,
        days: frequencyDays,
        intervalDays:
          frequencyType === 'interval' ? Math.max(2, Math.min(365, intervalDays)) : undefined,
        timesPerWeek:
          frequencyType === 'times_per_week'
            ? Math.max(1, Math.min(7, timesPerWeek))
            : undefined,
      },
      xpReward: baseXP,
      attributeBoosts: {
        [category === 'Learning' ? 'Mind' : category === 'Productivity' ? 'Focus' : category]: difficulty === 'extreme' ? 4 : difficulty === 'hard' ? 3 : difficulty === 'medium' ? 2 : 1,
        Discipline: 1,
      },
      reminderTime: isReminderEnabled ? (reminderTime || '08:00') : undefined,
      isPaused: editingHabit ? editingHabit.isPaused : false,
      isArchived: editingHabit ? editingHabit.isArchived : false,
      createdAt: editingHabit ? editingHabit.createdAt : new Date().toISOString(),
    };

    onSaveHabit(habit);
    onClose();
  };

  const toggleDay = (dayIndex: number) => {
    playSound('click');
    if (frequencyDays.includes(dayIndex)) {
      if (frequencyDays.length > 1) {
        setFrequencyDays(frequencyDays.filter((d) => d !== dayIndex));
      }
    } else {
      setFrequencyDays([...frequencyDays, dayIndex].sort());
    }
  };

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div
      id="habit-form-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        id="habit-form-modal-card"
        className="w-full max-w-lg max-h-[90vh] bg-[#11092a] border-4 border-yellow-400 shadow-[8px_8px_0px_#000] flex flex-col overflow-hidden text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b-2 border-[#3b2d60] bg-[#090416]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-[#1f1242] border border-yellow-400 flex items-center justify-center text-yellow-400">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-arcade text-xs sm:text-sm text-yellow-400">
                {editingHabit ? 'EDIT QUEST PROTOCOL' : 'CONFIG NEW QUEST'}
              </h2>
              <p className="text-[11px] text-cyan-300 font-retro">
                {editingHabit ? 'MODIFY ATTRIBUTES & TARGET VALUES' : 'FORGE DISCIPLINE & GAIN REWARD EXP'}
              </p>
            </div>
          </div>
          <button
            id="habit-modal-close-btn"
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch (Custom vs Routine Templates) */}
        {!editingHabit && (
          <div className="flex border-b-2 border-[#3b2d60] bg-[#090416] p-1 px-4 sm:px-6 gap-2">
            <button
              id="tab-custom-habit"
              onClick={() => {
                playSound('click');
                setActiveTab('custom');
              }}
              className={`flex-1 py-1.5 text-[9px] font-arcade transition-all ${
                activeTab === 'custom'
                  ? 'bg-yellow-400 text-black font-bold shadow-[2px_2px_0px_#000]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              CUSTOM PROTOCOL
            </button>
            <button
              id="tab-routine-templates"
              onClick={() => {
                playSound('click');
                setActiveTab('templates');
              }}
              className={`flex-1 py-1.5 text-[9px] font-arcade transition-all ${
                activeTab === 'templates'
                  ? 'bg-yellow-400 text-black font-bold shadow-[2px_2px_0px_#000]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ROUTINE CARTRIDGE PACKS
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {activeTab === 'templates' && !editingHabit ? (
            <div className="space-y-3">
              <p className="text-xs text-cyan-300 font-retro">
                SELECT A BATTLE-TESTED HABIT CARTRIDGE TO INSTANTLY LOAD IT:
              </p>
              {ROUTINE_TEMPLATE_PACKS.map((pack) => (
                <div
                  key={pack.id}
                  className="p-3.5 bg-[#0e0722] border-2 border-[#3b2d60] hover:border-yellow-400 transition-all space-y-2 shadow-[2px_2px_0px_#000]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 bg-[#1f1242] border border-yellow-400 flex items-center justify-center text-yellow-400 text-base">
                        {pack.habits[0]?.emoji || '⚡'}
                      </div>
                      <div>
                        <h4 className="text-xs font-arcade text-white">{pack.name}</h4>
                        <p className="text-[11px] text-cyan-300 font-retro">{pack.description}</p>
                      </div>
                    </div>
                    <button
                      id={`apply-pack-${pack.id}`}
                      onClick={() => {
                        if (onApplyRoutinePack) {
                          playSound('powerup');
                          onApplyRoutinePack(pack.habits);
                          onClose();
                        }
                      }}
                      className="arcade-btn-green px-2.5 py-1 text-[9px] font-arcade"
                    >
                      LOAD ({pack.habits.length})
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-2 border-t border-[#2f2352]">
                    {pack.habits.map((h, i) => (
                      <div key={i} className="flex items-center space-x-1.5 text-xs font-retro text-slate-300">
                        <span>{h.emoji}</span>
                        <span className="truncate">{h.title}</span>
                        <span className="text-[8px] text-green-400 font-arcade ml-auto">
                          +{DIFFICULTY_BASE_XP[h.difficulty]} PTS
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Title & Emoji & Color */}
              <div>
                <label className="block text-[9px] font-arcade text-yellow-400 tracking-wider mb-1">
                  QUEST NAME & AVATAR BADGE
                </label>
                <div className="flex items-center space-x-2">
                  {/* Emoji selector */}
                  <div className="relative">
                    <div
                      className="w-10 h-10 flex items-center justify-center text-xl border-2 bg-[#090416]"
                      style={{ borderColor: color }}
                    >
                      {emoji}
                    </div>
                  </div>

                  <input
                    id="habit-input-title"
                    type="text"
                    required
                    placeholder="e.g., Read 30 Mins, Heavy Lifts, Hydrate..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="flex-1 bg-[#090416] border-2 border-[#3b2d60] px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 font-arcade"
                  />
                </div>

                {/* Emoji Quick Picker */}
                <div className="flex items-center space-x-1.5 overflow-x-auto py-1.5 mt-1">
                  {EMOJI_OPTIONS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => {
                        playSound('click');
                        setEmoji(em);
                      }}
                      className={`w-7 h-7 flex items-center justify-center text-sm border ${
                        emoji === em ? 'border-yellow-400 bg-[#1f1242]' : 'border-[#3b2d60] bg-[#090416]'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>

                {/* Color Quick Picker */}
                <div className="flex items-center space-x-2 pt-1">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        playSound('click');
                        setColor(c);
                      }}
                      className={`w-5 h-5 border ${
                        color === c ? 'border-white scale-110' : 'border-black opacity-75 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Life Category */}
              <div>
                <label className="block text-[9px] font-arcade text-cyan-400 tracking-wider mb-1 flex items-center space-x-1">
                  <Layers className="w-3 h-3 text-cyan-400" />
                  <span>LIFE DOMAIN (ATTRIBUTE BUFF)</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        playSound('click');
                        setCategory(cat);
                      }}
                      className={`py-1 px-1.5 text-[9px] font-arcade truncate border ${
                        category === cat
                          ? 'bg-yellow-400 text-black border-black font-bold'
                          : 'bg-[#090416] text-slate-400 border-[#3b2d60] hover:text-white'
                      }`}
                    >
                      {cat.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time of Day */}
              <div>
                <label className="block text-[9px] font-arcade text-amber-400 tracking-wider mb-1 flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>TIME GROUP</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['morning', 'afternoon', 'evening', 'anytime'] as TimeOfDay[]).map((tod) => (
                    <button
                      key={tod}
                      type="button"
                      onClick={() => {
                        playSound('click');
                        setTimeOfDay(tod);
                      }}
                      className={`py-1.5 uppercase text-[9px] font-arcade border ${
                        timeOfDay === tod
                          ? 'bg-amber-400 text-black border-black font-bold'
                          : 'bg-[#090416] text-slate-400 border-[#3b2d60] hover:text-white'
                      }`}
                    >
                      {tod}
                    </button>
                  ))}
                </div>
              </div>

              {/* Habit Type & Target Units */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[9px] font-arcade text-slate-300 tracking-wider mb-1">
                    QUEST TYPE
                  </label>
                  <select
                    id="habit-select-type"
                    value={habitType}
                    onChange={(e) => setHabitType(e.target.value as HabitType)}
                    className="w-full bg-[#090416] border-2 border-[#3b2d60] px-2.5 py-1.5 text-[10px] font-arcade text-yellow-300 focus:outline-none focus:border-yellow-400 cursor-pointer"
                  >
                    <option value="boolean">YES/NO (CHECKBOX)</option>
                    <option value="count">COUNT (e.g. 8 GLASSES)</option>
                    <option value="duration">DURATION (e.g. 30 MINS)</option>
                    <option value="quantity">QUANTITY (e.g. 8000 STEPS)</option>
                    <option value="avoidance">AVOIDANCE (e.g. NO JUNK)</option>
                  </select>
                </div>

                {habitType !== 'boolean' && habitType !== 'avoidance' && (
                  <div className="flex space-x-2">
                    <div className="w-1/2">
                      <label className="block text-[9px] font-arcade text-slate-300 tracking-wider mb-1">
                        TARGET
                      </label>
                      <input
                        id="habit-input-target-val"
                        type="number"
                        min="1"
                        value={targetValue}
                        onChange={(e) => setTargetValue(Number(e.target.value))}
                        className="w-full bg-[#090416] border-2 border-[#3b2d60] px-2.5 py-1 text-xs text-yellow-300 font-arcade"
                      />
                    </div>
                    <div className="w-1/2">
                      <label className="block text-[9px] font-arcade text-slate-300 tracking-wider mb-1">
                        UNIT
                      </label>
                      <input
                        id="habit-input-unit"
                        type="text"
                        placeholder="min, glasses..."
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        className="w-full bg-[#090416] border-2 border-[#3b2d60] px-2.5 py-1 text-xs text-white font-arcade"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Difficulty & XP Reward */}
              <div>
                <label className="block text-[9px] font-arcade text-yellow-400 tracking-wider mb-1 flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    <Award className="w-3 h-3 text-amber-400" />
                    <span>DIFFICULTY RANK</span>
                  </span>
                  <span className="text-green-400 font-arcade text-[9px]">
                    +{DIFFICULTY_BASE_XP[difficulty]} PTS REWARD
                  </span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['easy', 'medium', 'hard', 'extreme'] as HabitDifficulty[]).map((dif) => (
                    <button
                      key={dif}
                      type="button"
                      onClick={() => {
                        playSound('click');
                        setDifficulty(dif);
                      }}
                      className={`py-1.5 uppercase text-[9px] font-arcade border ${
                        difficulty === dif
                          ? 'bg-green-500 text-black border-black font-bold'
                          : 'bg-[#090416] text-slate-400 border-[#3b2d60] hover:text-white'
                      }`}
                    >
                      {dif}
                    </button>
                  ))}
                </div>
              </div>

              {/* Frequency Schedule */}
              <div>
                <label className="block text-[9px] font-arcade text-cyan-400 tracking-wider mb-1 flex items-center space-x-1">
                  <Calendar className="w-3 h-3 text-cyan-400" />
                  <span>FREQUENCY REPEAT</span>
                </label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {[
                    { id: 'daily' as FrequencyType, label: 'EVERY DAY' },
                    { id: 'weekdays' as FrequencyType, label: 'WEEKDAYS' },
                    { id: 'custom_days' as FrequencyType, label: 'CUSTOM' },
                    { id: 'interval' as FrequencyType, label: 'EVERY N DAYS' },
                    { id: 'times_per_week' as FrequencyType, label: 'FLEXIBLE' },
                  ].map((freq) => (
                    <button
                      key={freq.id}
                      type="button"
                      onClick={() => {
                        playSound('click');
                        setFrequencyType(freq.id);
                        if (freq.id === 'daily') setFrequencyDays([0, 1, 2, 3, 4, 5, 6]);
                        if (freq.id === 'weekdays') setFrequencyDays([1, 2, 3, 4, 5]);
                      }}
                      className={`flex-1 min-w-[64px] py-1 text-[8px] font-arcade border ${
                        frequencyType === freq.id
                          ? 'bg-cyan-400 text-black border-black font-bold'
                          : 'bg-[#090416] text-slate-400 border-[#3b2d60]'
                      }`}
                    >
                      {freq.label}
                    </button>
                  ))}
                </div>

                {frequencyType === 'custom_days' && (
                  <div className="flex justify-between space-x-1 pt-1">
                    {dayLabels.map((lbl, idx) => {
                      const active = frequencyDays.includes(idx);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => toggleDay(idx)}
                          className={`w-8 h-8 text-[9px] font-arcade border ${
                            active
                              ? 'bg-yellow-400 text-black border-black font-bold'
                              : 'bg-[#090416] text-slate-400 border-[#3b2d60]'
                          }`}
                        >
                          {lbl}
                        </button>
                      );
                    })}
                  </div>
                )}

                {frequencyType === 'interval' && (
                  <div className="flex items-center justify-between pt-1 px-1">
                    <span className="text-[9px] font-retro text-slate-300">REPEAT EVERY</span>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          playSound('click');
                          setIntervalDays((v) => Math.max(2, v - 1));
                        }}
                        className="w-7 h-7 text-xs font-arcade bg-[#090416] text-cyan-300 border border-[#3b2d60] active:bg-[#3b2d60]"
                      >
                        −
                      </button>
                      <span className="text-[11px] font-arcade text-white min-w-[64px] text-center">
                        {intervalDays} DAY{intervalDays > 1 ? 'S' : ''}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          playSound('click');
                          setIntervalDays((v) => Math.min(365, v + 1));
                        }}
                        className="w-7 h-7 text-xs font-arcade bg-[#090416] text-cyan-300 border border-[#3b2d60] active:bg-[#3b2d60]"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                {frequencyType === 'times_per_week' && (
                  <div className="pt-1 px-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-retro text-slate-300">
                        TARGET PER WEEK (ANY DAYS)
                      </span>
                      <span className="text-[11px] font-arcade text-yellow-300">
                        {timesPerWeek}/7
                      </span>
                    </div>
                    <div className="flex justify-between space-x-1">
                      {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => {
                            playSound('click');
                            setTimesPerWeek(n);
                          }}
                          className={`w-8 h-8 text-[10px] font-arcade border ${
                            timesPerWeek === n
                              ? 'bg-yellow-400 text-black border-black font-bold'
                              : 'bg-[#090416] text-slate-400 border-[#3b2d60]'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Notification Reminder */}
              <div className="p-3 bg-[#0e0722] border-2 border-[#3b2d60] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {isReminderEnabled ? (
                      <Bell className="w-4 h-4 text-yellow-400 animate-pulse" />
                    ) : (
                      <BellOff className="w-4 h-4 text-slate-500" />
                    )}
                    <div>
                      <span className="text-[10px] font-arcade text-white block">QUEST NOTIFICATION ALERTS</span>
                      <span className="text-[11px] text-cyan-300 font-retro">Scheduled Android push reminder</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      playSound('click');
                      setIsReminderEnabled(!isReminderEnabled);
                    }}
                    className={`w-10 h-5 p-0.5 border border-black flex items-center transition-colors ${
                      isReminderEnabled ? 'bg-green-400' : 'bg-slate-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-black transition-transform ${
                        isReminderEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {isReminderEnabled && (
                  <div className="pt-2 border-t border-[#2a1d48] flex items-center justify-between">
                    <label className="text-[9px] font-arcade text-slate-300">ALERT TIME:</label>
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="bg-[#090416] border border-yellow-400/80 px-2 py-1 text-xs font-arcade text-yellow-300 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  id="habit-submit-btn"
                  type="submit"
                  className="w-full arcade-btn-yellow py-2.5 text-xs font-arcade flex items-center justify-center space-x-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingHabit ? 'SAVE QUEST CONFIG' : 'INITIALIZE QUEST!'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
