import React from 'react';
import {
  CheckSquare,
  Calendar,
  BarChart3,
  Trophy,
  User,
  Plus,
} from 'lucide-react';
import { ActiveTab } from '../../types';
import { motion } from 'motion/react';

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
    if (onTabChange) onTabChange(tabId);
    if (onChangeTab) onChangeTab(tabId);
  };

  const tabs = [
    { id: 'today' as ActiveTab, label: 'TODAY', icon: CheckSquare },
    { id: 'calendar' as ActiveTab, label: 'MATRIX', icon: Calendar },
    { id: 'progress' as ActiveTab, label: 'STATS', icon: BarChart3 },
    { id: 'challenges' as ActiveTab, label: 'QUESTS', icon: Trophy },
    { id: 'profile' as ActiveTab, label: 'HERO', icon: User },
  ];

  return (
    <nav
      id="buffr-bottom-nav-container"
      aria-label="Arcade Navigation Bar"
      className="sticky bottom-0 z-30 w-full bg-[#0b051c]/95 backdrop-blur-md border-t-2 border-[#3b2d60] px-2 sm:px-4 py-2 shadow-[0_-4px_0_#05020a]"
    >
      <div className="max-w-md mx-auto relative flex items-center justify-between gap-1">
        {/* First 2 tabs */}
        <div className="flex items-center space-x-1 flex-1 justify-around">
          {tabs.slice(0, 2).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => handleTabSelect(tab.id)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-2 rounded-none transition-all duration-100 touch-target-min ${
                  isActive
                    ? 'text-yellow-400 font-bold bg-[#1e1338] border-2 border-yellow-400 shadow-[2px_2px_0px_#000]'
                    : 'text-slate-400 hover:text-cyan-300 border-2 border-transparent hover:border-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 mb-0.5 ${isActive ? 'stroke-[2.5] text-yellow-400' : 'stroke-[2]'}`} />
                <span className={`text-[8px] sm:text-[9px] font-arcade tracking-tight ${isActive ? 'neon-text-yellow' : ''}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Center Floating Creation Button - Arcade Push Button */}
        <div className="px-1 flex-shrink-0">
          <motion.button
            id="nav-btn-create-habit"
            whileTap={{ scale: 0.9, y: 3 }}
            onClick={onOpenCreateHabit}
            className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 bg-emerald-500 hover:bg-emerald-400 border-2 border-emerald-300 text-black shadow-[0_4px_0_#065f46,0_6px_0_#000] active:shadow-[0_1px_0_#065f46] font-bold"
            title="Create New Habit Mission"
          >
            <Plus className="w-6 h-6 stroke-[3.5]" />
          </motion.button>
        </div>

        {/* Last 3 tabs */}
        <div className="flex items-center space-x-1 flex-1 justify-around">
          {tabs.slice(2).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => handleTabSelect(tab.id)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-2 rounded-none transition-all duration-100 touch-target-min ${
                  isActive
                    ? 'text-yellow-400 font-bold bg-[#1e1338] border-2 border-yellow-400 shadow-[2px_2px_0px_#000]'
                    : 'text-slate-400 hover:text-cyan-300 border-2 border-transparent hover:border-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 mb-0.5 ${isActive ? 'stroke-[2.5] text-yellow-400' : 'stroke-[2]'}`} />
                <span className={`text-[8px] sm:text-[9px] font-arcade tracking-tight ${isActive ? 'neon-text-yellow' : ''}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
