import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Sparkles,
  Zap,
  Flame,
  Check,
  X,
  Filter,
  Trophy,
  ArrowUpRight,
  Trash2,
} from 'lucide-react';
import {
  LootItem,
  LootSlotType,
  LootRarity,
  EquippedGear,
  UserProfile,
} from '../../types';
import { RARITY_CONFIGS, calculateEquippedBuffs } from '../../data/lootPool';
import { playSound, triggerHapticPulse } from '../../utils/sound';

interface VaultInventoryViewProps {
  user: UserProfile;
  inventory: LootItem[];
  equippedGear: EquippedGear;
  onEquipItem: (item: LootItem) => void;
  onUnequipSlot: (slot: LootSlotType) => void;
  onDisenchantItem?: (itemId: string) => void;
}

export const VaultInventoryView: React.FC<VaultInventoryViewProps> = ({
  user,
  inventory,
  equippedGear,
  onEquipItem,
  onUnequipSlot,
  onDisenchantItem,
}) => {
  const [selectedSlotFilter, setSelectedSlotFilter] = useState<LootSlotType | 'all'>('all');
  const [selectedRarityFilter, setSelectedRarityFilter] = useState<LootRarity | 'all'>('all');
  const [selectedItem, setSelectedItem] = useState<LootItem | null>(null);

  const activeBuffs = calculateEquippedBuffs(equippedGear);

  // Filter inventory
  const filteredInventory = inventory.filter((item) => {
    if (selectedSlotFilter !== 'all' && item.slot !== selectedSlotFilter) return false;
    if (selectedRarityFilter !== 'all' && item.rarity !== selectedRarityFilter) return false;
    return true;
  });

  const handleSelect = (item: LootItem) => {
    playSound('click');
    setSelectedItem(item);
  };

  const handleEquip = (item: LootItem) => {
    playSound('equip');
    triggerHapticPulse('medium');
    onEquipItem(item);
  };

  const handleUnequip = (slot: LootSlotType) => {
    playSound('click');
    onUnequipSlot(slot);
  };

  const isItemEquipped = (item: LootItem) => {
    return (
      equippedGear.weapon?.id === item.id ||
      equippedGear.armor?.id === item.id ||
      equippedGear.relic?.id === item.id ||
      equippedGear.charm?.id === item.id
    );
  };

  const gearSlots: { slot: LootSlotType; name: string; icon: string; equippedItem: LootItem | null | undefined }[] = [
    { slot: 'weapon', name: 'MAIN WEAPON', icon: '🗡️', equippedItem: equippedGear.weapon },
    { slot: 'armor', name: 'BODY ARMOR', icon: '🥋', equippedItem: equippedGear.armor },
    { slot: 'relic', name: 'SACRED RELIC', icon: '⏳', equippedItem: equippedGear.relic },
    { slot: 'charm', name: 'LUCK CHARM', icon: '🍀', equippedItem: equippedGear.charm },
  ];

  return (
    <div id="vault-inventory-container" className="space-y-4 max-w-4xl mx-auto pb-24">
      {/* Armory Header */}
      <div className="bg-[#11092a] border-2 border-[#3b2d60] p-3 sm:p-4 shadow-[3px_3px_0px_#05020a] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h1 className="font-arcade text-sm sm:text-base text-amber-400 tracking-wider">
              HERO ARMORY & RELIC VAULT
            </h1>
          </div>
          <p className="text-xs text-cyan-300 font-retro mt-0.5">
            Equip looted artifacts to boost XP generation, drop rates, and streak protections.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-[10px] font-arcade bg-[#080314] border border-[#2f2352] px-3 py-1.5">
          <span className="text-slate-400">TOTAL LOOT:</span>
          <span className="text-yellow-400 font-bold">{inventory.length} ITEMS</span>
        </div>
      </div>

      {/* 4 Equipped Gear Slots */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {gearSlots.map(({ slot, name, icon, equippedItem }) => {
          const config = equippedItem ? RARITY_CONFIGS[equippedItem.rarity] : null;

          return (
            <div
              key={slot}
              id={`gear-slot-${slot}`}
              className={`p-3 bg-[#0e0722] border-2 flex flex-col justify-between transition-all ${
                equippedItem
                  ? `${config?.border || 'border-cyan-400'} shadow-[2px_2px_0px_#000]`
                  : 'border-dashed border-slate-700 opacity-80'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-[8px] font-arcade text-slate-400 tracking-wider">
                  {name}
                </span>
                <span className="text-xs">{icon}</span>
              </div>

              {equippedItem ? (
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{equippedItem.emoji}</span>
                    <div className="truncate">
                      <span className={`text-[10px] font-arcade block truncate ${config?.color}`}>
                        {equippedItem.name}
                      </span>
                      <span className="text-[8px] font-retro text-emerald-300 block">
                        +{equippedItem.stats.xpBonusPercent || 0}% XP
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleUnequip(slot)}
                    className="w-full py-1 bg-red-950/60 hover:bg-red-900 border border-red-500/50 text-red-300 font-arcade text-[8px] flex items-center justify-center space-x-1"
                  >
                    <X className="w-2.5 h-2.5" />
                    <span>UNEQUIP</span>
                  </button>
                </div>
              ) : (
                <div className="py-4 text-center">
                  <span className="text-[9px] font-arcade text-slate-600">EMPTY SLOT</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Active Buffs Multiplier Telemetry */}
      <div className="p-3 bg-[#0a0518] border border-[#2f2352] grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-arcade">
        <div className="flex items-center space-x-2 bg-[#120a28] p-2 border border-slate-800">
          <Zap className="w-3.5 h-3.5 text-yellow-400" />
          <div>
            <span className="text-[8px] text-slate-400 block">GEAR XP BUFF</span>
            <span className="text-yellow-400 font-bold">+{activeBuffs.xpBonusPercent}%</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-[#120a28] p-2 border border-slate-800">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <div>
            <span className="text-[8px] text-slate-400 block">LOOT LUCK</span>
            <span className="text-cyan-400 font-bold">+{activeBuffs.luckBonusPercent}%</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-[#120a28] p-2 border border-slate-800">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <div>
            <span className="text-[8px] text-slate-400 block">STREAK SHIELD</span>
            <span className="text-emerald-400 font-bold">+{activeBuffs.streakShieldChance}%</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-[#120a28] p-2 border border-slate-800">
          <Flame className="w-3.5 h-3.5 text-rose-400" />
          <div>
            <span className="text-[8px] text-slate-400 block">2x CRIT XP CHANCE</span>
            <span className="text-rose-400 font-bold">{activeBuffs.critXpChance}%</span>
          </div>
        </div>
      </div>

      {/* Inventory Filters & Item Grid */}
      <div className="space-y-3">
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2f2352] pb-2">
          <div className="flex items-center space-x-1 overflow-x-auto py-1">
            {(['all', 'weapon', 'armor', 'relic', 'charm'] as const).map((slot) => (
              <button
                key={slot}
                onClick={() => {
                  playSound('click');
                  setSelectedSlotFilter(slot);
                }}
                className={`px-2.5 py-1 font-arcade text-[9px] border transition-all ${
                  selectedSlotFilter === slot
                    ? 'bg-yellow-400 text-black border-yellow-200 font-bold shadow-[1px_1px_0px_#000]'
                    : 'bg-[#120a28] border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                {slot.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-1">
            <Filter className="w-3 h-3 text-slate-400" />
            <select
              value={selectedRarityFilter}
              onChange={(e) => setSelectedRarityFilter(e.target.value as any)}
              className="bg-[#120a28] border border-slate-700 text-slate-300 text-[9px] font-arcade px-2 py-1 focus:outline-none"
            >
              <option value="all">ALL RARITIES</option>
              <option value="common">COMMON</option>
              <option value="uncommon">UNCOMMON</option>
              <option value="rare">RARE</option>
              <option value="epic">EPIC</option>
              <option value="legendary">LEGENDARY</option>
              <option value="mythic">MYTHIC</option>
              <option value="artifact">ARTIFACT</option>
            </select>
          </div>
        </div>

        {/* Item Grid & Selected Item Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Item Grid (2 cols) */}
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-96 overflow-y-auto pr-1">
            {filteredInventory.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-500 bg-[#0e0722] border border-dashed border-slate-800">
                <span className="text-2xl block mb-1">📦</span>
                <span className="font-arcade text-[10px]">NO ITEMS FOUND</span>
                <p className="text-[10px] font-retro text-slate-600 mt-1">
                  Complete habits to roll for victory loot drops!
                </p>
              </div>
            ) : (
              filteredInventory.map((item) => {
                const config = RARITY_CONFIGS[item.rarity];
                const equipped = isItemEquipped(item);
                const isSelected = selectedItem?.id === item.id;

                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelect(item)}
                    className={`p-2.5 bg-[#0e0722] border-2 cursor-pointer transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'ring-2 ring-yellow-400 shadow-[0_0_10px_#facc15]'
                        : ''
                    } ${config.border} ${config.glow}`}
                  >
                    {equipped && (
                      <div className="absolute top-1 right-1 bg-emerald-500 text-black text-[7px] font-arcade px-1 font-bold">
                        EQUIPPED
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{item.emoji}</span>
                      <div className="truncate">
                        <span className={`font-arcade text-[9px] block truncate ${config.color}`}>
                          {item.name}
                        </span>
                        <span className="text-[8px] font-retro text-slate-400">
                          {config.name}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 pt-1 border-t border-slate-800 flex justify-between items-center text-[8px] font-mono">
                      <span className="text-emerald-300">
                        {item.stats.xpBonusPercent ? `+${item.stats.xpBonusPercent}% XP` : item.slot.toUpperCase()}
                      </span>
                      <span className="text-yellow-400">
                        {item.stats.luckBonusPercent ? `+${item.stats.luckBonusPercent}% LUCK` : ''}
                      </span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Selected Item Detail Panel (1 col) */}
          <div className="p-3 bg-[#11092a] border-2 border-[#3b2d60] shadow-[2px_2px_0px_#05020a] flex flex-col justify-between space-y-3">
            {selectedItem ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span
                    className={`text-[9px] font-arcade px-2 py-0.5 border ${
                      RARITY_CONFIGS[selectedItem.rarity].border
                    } ${RARITY_CONFIGS[selectedItem.rarity].color}`}
                  >
                    ★ {RARITY_CONFIGS[selectedItem.rarity].name} ★
                  </span>
                  <span className="text-[8px] font-arcade text-slate-400">
                    SLOT: {selectedItem.slot.toUpperCase()}
                  </span>
                </div>

                <div className="text-center space-y-1">
                  <div className="text-4xl mx-auto">{selectedItem.emoji}</div>
                  <h3
                    className={`font-arcade text-xs ${
                      RARITY_CONFIGS[selectedItem.rarity].color
                    }`}
                  >
                    {selectedItem.name}
                  </h3>
                  <p className="text-[9px] font-retro text-slate-300">
                    {selectedItem.subtitle}
                  </p>
                </div>

                <div className="p-2 bg-[#080314] border border-slate-800 text-[10px] font-retro text-emerald-300">
                  ⚡ {selectedItem.description}
                </div>

                <p className="text-[9px] font-retro text-slate-400 italic">
                  "{selectedItem.flavorText}"
                </p>

                {isItemEquipped(selectedItem) ? (
                  <button
                    onClick={() => handleUnequip(selectedItem.slot)}
                    className="w-full py-2 bg-red-950/80 hover:bg-red-900 border-2 border-red-500 text-red-300 font-arcade text-xs flex items-center justify-center space-x-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>UNEQUIP ITEM</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleEquip(selectedItem)}
                    className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-black font-arcade text-xs border-2 border-emerald-200 shadow-[2px_2px_0px_#000] font-bold active:translate-y-0.5 flex items-center justify-center space-x-1"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>EQUIP ITEM</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 space-y-1">
                <span className="text-3xl block">🛡️</span>
                <p className="text-xs font-retro">
                  Select an item from your vault to inspect its stats or equip it.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
