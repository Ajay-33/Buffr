import { BuffrStorage } from '../storage/db';
import { calculateLevelFromTotalXp } from './gamification';

export interface WidgetPayload {
  heroName: string;
  level: number;
  levelTitle: string;
  currentXp: number;
  nextLevelXp: number;
  xpPercent: number;
  streak: number;
  gold: number;
  questsDone: number;
  questsTotal: number;
  questPercent: number;
  nextQuestTitle: string;
}

export class BuffrWidgetBridge {
  public static sync(): void {
    if (typeof window === 'undefined') return;

    try {
      const user = BuffrStorage.getUser();
      const habits = BuffrStorage.getHabits().filter((h) => !h.isArchived && !h.isPaused);
      const completions = BuffrStorage.getCompletions();

      const todayStr = new Date().toISOString().split('T')[0];
      const todayCompletions = completions.filter((c) => c.dateStr === todayStr && c.isCompleted);

      const questsTotal = habits.length;
      const questsDone = todayCompletions.length;
      const questPercent = questsTotal > 0 ? Math.round((questsDone / questsTotal) * 100) : 0;

      // Find first uncompleted habit
      const completedHabitIds = new Set(todayCompletions.map((c) => c.habitId));
      const nextHabit = habits.find((h) => !completedHabitIds.has(h.id));
      const nextQuestTitle = nextHabit
        ? `${nextHabit.emoji || '⚔️'} ${nextHabit.title}`
        : questsTotal > 0 && questsDone >= questsTotal
        ? '🎉 All Quests Completed Today!'
        : 'Tap to review today\'s quests';

      const levelData = calculateLevelFromTotalXp(user.totalXp || 0);

      const payload: WidgetPayload = {
        heroName: `${user.avatarEmoji || '🎮'} ${user.name || 'Hero'}`,
        level: levelData.level,
        levelTitle: user.currentTitle || 'Starter',
        currentXp: levelData.currentLevelXp,
        nextLevelXp: levelData.nextLevelXpRequired,
        xpPercent: levelData.progressPercent,
        streak: user.currentStreak || 1,
        gold: Math.floor((user.totalXp || 100) / 2),
        questsDone,
        questsTotal,
        questPercent,
        nextQuestTitle,
      };

      // 1. Call native Android JavascriptInterface if running in Android app
      const nativeWidget = (window as any).BuffrNativeWidget;
      if (nativeWidget && typeof nativeWidget.updateWidget === 'function') {
        nativeWidget.updateWidget(JSON.stringify(payload));
      }

      // 2. Also keep in localStorage for web caching
      localStorage.setItem('buffr_last_widget_payload', JSON.stringify(payload));
    } catch (err) {
      console.warn('Widget sync error:', err);
    }
  }
}
