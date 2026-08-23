import React from 'react';
import {
  CheckSquare,
  Calendar,
  BarChart3,
  Trophy,
  User,
  Plus,
  Sparkles,
} from 'lucide-react';
import { ActiveTab } from '../../types';
import { motion } from 'motion/react';
import { playSound } from '../../utils/sound';

interface BuffrBottomNavProps {
  activeTab: ActiveTab;
  onTabChange?: (tab: ActiveTab) => void;
  onChangeTab?: (tab: ActiveTab) => void;
  onOpenCreateHabit: () => void;
}

export const BuffrBottomNav: React.FC<BuffrBottomNavProps> = ({
  activeTab,
  onTabChange,
  onChangeTab,
  onOpenCreateHabit,
}) => {
  const handleTabSelect = (tabId: ActiveTab) => {
    playSound('click');
    if (onTabChange) onTabChange(tabId);
    if (onChangeTab) onChangeTab(tabId);
  };

  const tabs: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'today', label: 'TODAY', icon: CheckSquare },
    { id: 'calendar', label: 'MATRIX', icon: Calendar },
    { id: 'progress', label: 'STATS', icon: BarChart3 },
    { id: 'challenges', label: 'QUESTS', icon: Trophy },
    { id: 'profile', label: 'HERO', icon: User },
  ];

  return (
    <>
      {/* Floating Action Button (FAB) for New Mission Creation - Perfectly Positioned Above Symmetrical Nav Bar */}
      <div className="fixed right-4 sm:right-6 bottom-20 z-40 pointer-events-auto">
        <motion.button
          id="fab-create-habit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92, y: 2 }}
          onClick={() => {
            playSound('powerup');
            onOpenCreateHabit();
          }}
          className="group flex items-center space-x-1.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black border-2 border-emerald-200 px-3 sm:px-4 py-2.5 shadow-[0_4px_0_#064e3b,0_8px_0_#000] active:shadow-[0_1px_0_#064e3b] transition-all"
          title="Create New Habit Mission (+)"
        >
          <div className="w-6 h-6 bg-black text-emerald-400 border border-emerald-300 flex items-center justify-center font-bold">
            <Plus className="w-4 h-4 stroke-[3.5]" />
          </div>
          <span className="text-[10px] sm:text-xs font-arcade tracking-wider font-bold">
            NEW MISSION
          </span>
          <Sparkles className="w-3 h-3 text-yellow-300 animate-pulse hidden sm:inline" />
        </motion.button>
      </div>

      {/* Symmetrical 5-Column Navigation Bar */}
      <nav
        id="buffr-bottom-nav-container"
        aria-label="Arcade Navigation Bar"
        className="sticky bottom-0 z-30 w-full bg-[#0b051c]/95 backdrop-blur-md border-t-2 border-[#3b2d60] px-1 sm:px-4 py-1.5 shadow-[0_-4px_0_#05020a]"
      >
        <div className="max-w-md mx-auto grid grid-cols-5 gap-1 items-center">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => handleTabSelect(tab.id)}
                className={`relative flex flex-col items-center justify-center py-1 px-1 transition-all duration-100 touch-target-min ${
                  isActive
                    ? 'text-yellow-400 font-bold bg-[#1e1338] border-2 border-yellow-400 shadow-[2px_2px_0px_#000]'
                    : 'text-slate-400 hover:text-cyan-300 border-2 border-transparent hover:border-slate-800'
                }`}
              >
                <Icon
                  className={`w-4 h-4 sm:w-5 sm:h-5 mb-0.5 ${
                    isActive ? 'stroke-[2.5] text-yellow-400' : 'stroke-[2]'
                  }`}
                />
                <span
                  className={`text-[8px] sm:text-[9px] font-arcade tracking-tight truncate ${
                    isActive ? 'neon-text-yellow' : ''
                  }`}
                >
                  {tab.label}
                </span>
                {isActive && (
                  <div className="w-1.5 h-1.5 bg-yellow-400 absolute top-0.5 right-1 animate-ping" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

