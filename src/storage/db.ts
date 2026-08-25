import {
  Habit,
  HabitCompletion,
  XPTransaction,
  UserProfile,
  Achievement,
  Challenge,
  Quest,
  DailyReflection,
  RoutineChain,
} from '../types';
import { createDemoDataset, createFreshDataset, DEFAULT_ROUTINE_CHAINS } from '../data/initialData';
import { BuffrWidgetBridge } from '../utils/widgetBridge';
import { BuffrNotificationService } from '../utils/notifications';

const DB_KEYS = {
  USER: 'buffr_user_profile',
  HABITS: 'buffr_habits',
  COMPLETIONS: 'buffr_completions',
  XP_TRANSACTIONS: 'buffr_xp_ledger',
  ACHIEVEMENTS: 'buffr_achievements',
  CHALLENGES: 'buffr_challenges',
  QUESTS: 'buffr_quests',
  REFLECTIONS: 'buffr_reflections',
  ROUTINE_CHAINS: 'buffr_routine_chains',
  HAS_INITIALIZED: 'buffr_db_init_v2',
  ONBOARDING_DONE: 'buffr_onboarding_done_v2',
};

export class BuffrStorage {
  private static isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  public static initialize(): void {
    if (!this.isBrowser()) return;

    const initialized = localStorage.getItem(DB_KEYS.HAS_INITIALIZED);
    if (!initialized) {
      const demoData = createDemoDataset();
      this.saveUserProfile(demoData.user);
      this.saveHabits(demoData.habits);
      this.saveCompletions(demoData.completions);
      this.saveXPTransactions(demoData.xpTransactions);
      this.saveAchievements(demoData.achievements);
      this.saveChallenges(demoData.challenges);
      this.saveQuests(demoData.quests);
      this.saveRoutineChains(demoData.routineChains || DEFAULT_ROUTINE_CHAINS);
      localStorage.setItem(DB_KEYS.HAS_INITIALIZED, 'true');
      localStorage.setItem(DB_KEYS.ONBOARDING_DONE, 'true');
      BuffrWidgetBridge.sync();
    }
  }

  public static hasCompletedOnboarding(): boolean {
    if (!this.isBrowser()) return true;
    return localStorage.getItem(DB_KEYS.ONBOARDING_DONE) === 'true';
  }

  public static setOnboardingCompleted(completed: boolean): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(DB_KEYS.ONBOARDING_DONE, completed ? 'true' : 'false');
  }

  public static resetToDemoData(): void {
    if (!this.isBrowser()) return;
    const demoData = createDemoDataset();
    this.saveUserProfile(demoData.user);
    this.saveHabits(demoData.habits);
    this.saveCompletions(demoData.completions);
    this.saveXPTransactions(demoData.xpTransactions);
    this.saveAchievements(demoData.achievements);
    this.saveChallenges(demoData.challenges);
    this.saveQuests(demoData.quests);
    this.saveRoutineChains(demoData.routineChains || DEFAULT_ROUTINE_CHAINS);
    localStorage.removeItem(DB_KEYS.REFLECTIONS);
    localStorage.setItem(DB_KEYS.ONBOARDING_DONE, 'true');
    BuffrWidgetBridge.sync();
  }

  public static resetToFresh(): void {
    if (!this.isBrowser()) return;
    const freshData = createFreshDataset();
    this.saveUserProfile(freshData.user);
    this.saveHabits(freshData.habits);
    this.saveCompletions(freshData.completions);
    this.saveXPTransactions(freshData.xpTransactions);
    this.saveAchievements(freshData.achievements);
    this.saveChallenges(freshData.challenges);
    this.saveQuests(freshData.quests);
    this.saveRoutineChains(freshData.routineChains || DEFAULT_ROUTINE_CHAINS);
    localStorage.removeItem(DB_KEYS.REFLECTIONS);
    localStorage.setItem(DB_KEYS.ONBOARDING_DONE, 'false');
    BuffrWidgetBridge.sync();
  }

  // User Profile
  public static getUser(): UserProfile {
    return this.getUserProfile();
  }

  public static getUserProfile(): UserProfile {
    if (!this.isBrowser()) return createDemoDataset().user;
    const data = localStorage.getItem(DB_KEYS.USER);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return createDemoDataset().user;
      }
    }
    return createDemoDataset().user;
  }

  public static saveUser(user: UserProfile): void {
    this.saveUserProfile(user);
  }

  public static saveUserProfile(user: UserProfile): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(DB_KEYS.USER, JSON.stringify(user));
    BuffrWidgetBridge.sync();
    BuffrNotificationService.rescheduleAll(user);
  }

  // Habits
  public static getHabits(): Habit[] {
    if (!this.isBrowser()) return [];
    const data = localStorage.getItem(DB_KEYS.HABITS);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return [];
      }
    }
    return [];
  }

  public static saveHabits(habits: Habit[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(DB_KEYS.HABITS, JSON.stringify(habits));
    BuffrWidgetBridge.sync();
    BuffrNotificationService.rescheduleAll(undefined, habits);
  }

  public static saveHabit(habit: Habit): void {
    const habits = this.getHabits();
    const idx = habits.findIndex((h) => h.id === habit.id);
    if (idx >= 0) {
      habits[idx] = habit;
    } else {
      habits.unshift(habit);
    }
    this.saveHabits(habits);
  }

  public static deleteHabit(habitId: string): void {
    const habits = this.getHabits().filter((h) => h.id !== habitId);
    this.saveHabits(habits);
  }

  // Completions
  public static getCompletions(): HabitCompletion[] {
    if (!this.isBrowser()) return [];
    const data = localStorage.getItem(DB_KEYS.COMPLETIONS);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return [];
      }
    }
    return [];
  }

  public static saveCompletions(completions: HabitCompletion[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(DB_KEYS.COMPLETIONS, JSON.stringify(completions));
    BuffrWidgetBridge.sync();
  }

  public static saveCompletion(completion: HabitCompletion): void {
    // Hard guarantee: exactly ONE record per habit+date pair. Filtering-then-push
    // also heals any duplicate ghosts left by older builds instead of letting
    // stale entries resurface in the Archive Replay view.
    const others = this
      .getCompletions()
      .filter(
        (c) => !(c.habitId === completion.habitId && c.dateStr === completion.dateStr)
      );
    others.push(completion);
    this.saveCompletions(others);
  }

  // XP Transactions
  public static getXpTransactions(): XPTransaction[] {
    return this.getXPTransactions();
  }

  public static getXPTransactions(): XPTransaction[] {
    if (!this.isBrowser()) return [];
    const data = localStorage.getItem(DB_KEYS.XP_TRANSACTIONS);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return [];
      }
    }
    return [];
  }

  public static saveXPTransactions(transactions: XPTransaction[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(DB_KEYS.XP_TRANSACTIONS, JSON.stringify(transactions));
    BuffrWidgetBridge.sync();
  }

  public static saveXPTransaction(tx: XPTransaction): void {
    const txs = this.getXPTransactions();
    txs.unshift(tx);
    // Keep max 200 items in history
    if (txs.length > 200) txs.length = 200;
    this.saveXPTransactions(txs);
  }

  // Achievements
  public static getAchievements(): Achievement[] {
    if (!this.isBrowser()) return [];
    const data = localStorage.getItem(DB_KEYS.ACHIEVEMENTS);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return [];
      }
    }
    return [];
  }

  public static saveAchievements(achievements: Achievement[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(DB_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  }

  // Challenges
  public static getChallenges(): Challenge[] {
    if (!this.isBrowser()) return [];
    const data = localStorage.getItem(DB_KEYS.CHALLENGES);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return [];
      }
    }
    return [];
  }

  public static saveChallenges(challenges: Challenge[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(DB_KEYS.CHALLENGES, JSON.stringify(challenges));
  }

  // Quests
  public static getQuests(): Quest[] {
    if (!this.isBrowser()) return [];
    const data = localStorage.getItem(DB_KEYS.QUESTS);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return [];
      }
    }
    return [];
  }

  public static saveQuests(quests: Quest[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(DB_KEYS.QUESTS, JSON.stringify(quests));
  }

  // Reflections
  public static getReflections(): DailyReflection[] {
    if (!this.isBrowser()) return [];
    const data = localStorage.getItem(DB_KEYS.REFLECTIONS);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return [];
      }
    }
    return [];
  }

  public static saveReflections(reflections: DailyReflection[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(DB_KEYS.REFLECTIONS, JSON.stringify(reflections));
  }

  public static saveDailyReflection(reflection: DailyReflection): void {
    const list = this.getReflections();
    const idx = list.findIndex((r) => r.dateStr === reflection.dateStr);
    if (idx >= 0) {
      list[idx] = reflection;
    } else {
      list.unshift(reflection);
    }
    this.saveReflections(list);
  }

  // Routine Chains (Mini Combos)
  public static getRoutineChains(): RoutineChain[] {
    if (!this.isBrowser()) return DEFAULT_ROUTINE_CHAINS;
    const data = localStorage.getItem(DB_KEYS.ROUTINE_CHAINS);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        return DEFAULT_ROUTINE_CHAINS;
      }
    }
    return DEFAULT_ROUTINE_CHAINS;
  }

  public static saveRoutineChains(chains: RoutineChain[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(DB_KEYS.ROUTINE_CHAINS, JSON.stringify(chains));
  }

  public static saveRoutineChain(chain: RoutineChain): void {
    const chains = this.getRoutineChains();
    const idx = chains.findIndex((c) => c.id === chain.id);
    if (idx >= 0) {
      chains[idx] = chain;
    } else {
      chains.push(chain);
    }
    this.saveRoutineChains(chains);
  }

  public static deleteRoutineChain(chainId: string): void {
    const chains = this.getRoutineChains().filter((c) => c.id !== chainId);
    this.saveRoutineChains(chains);
  }

  // Export JSON
  public static exportJSON(): string {
    const exportData = {
      user: this.getUserProfile(),
      habits: this.getHabits(),
      completions: this.getCompletions(),
      xpTransactions: this.getXPTransactions(),
      achievements: this.getAchievements(),
      challenges: this.getChallenges(),
      quests: this.getQuests(),
      reflections: this.getReflections(),
      routineChains: this.getRoutineChains(),
      exportedAt: new Date().toISOString(),
      version: '1.1.0',
    };
    return JSON.stringify(exportData, null, 2);
  }

  // Export CSV
  public static exportCompletionsCSV(): string {
    const habits = this.getHabits();
    const completions = this.getCompletions();
    const habitMap = new Map(habits.map((h) => [h.id, h.title]));

    const headers = ['Date', 'Habit ID', 'Habit Title', 'Is Completed', 'Progress Value', 'Reason Missed', 'Completed At'];
    const rows = completions.map((c) => [
      c.dateStr,
      c.habitId,
      `"${(habitMap.get(c.habitId) || 'Unknown').replace(/"/g, '""')}"`,
      c.isCompleted ? 'YES' : 'NO',
      c.progressValue,
      `"${(c.reasonMissed || '').replace(/"/g, '""')}"`,
      c.completedAt || '',
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  // Import JSON
  public static importJSON(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.user) this.saveUserProfile(data.user);
      if (data.habits) this.saveHabits(data.habits);
      if (data.completions) this.saveCompletions(data.completions);
      if (data.xpTransactions) this.saveXPTransactions(data.xpTransactions);
      if (data.achievements) this.saveAchievements(data.achievements);
      if (data.challenges) this.saveChallenges(data.challenges);
      if (data.quests) this.saveQuests(data.quests);
      if (data.reflections) this.saveReflections(data.reflections);
      if (data.routineChains) this.saveRoutineChains(data.routineChains);
      return true;
    } catch (err) {
      console.error('Import failed', err);
      return false;
    }
  }
}

// Standalone function exports for components
export const exportDataAsJson = () => BuffrStorage.exportJSON();
export const exportCompletionsAsCsv = () => BuffrStorage.exportCompletionsCSV();
export const importDataFromJson = (jsonStr: string) => BuffrStorage.importJSON(jsonStr);
