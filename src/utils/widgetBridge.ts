import { BuffrStorage } from '../storage/db';
import { calculateLevelFromTotalXp } from './gamification';
import { getTodayStr, isHabitScheduledForDate } from './dateUtils';

export interface WidgetHabitItem {
  id: string;
  title: string;
  emoji: string;
  xp: number;
  isCompleted: boolean;
}

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
  syncTimestamp: number;
  habits: WidgetHabitItem[];
}

export class BuffrWidgetBridge {
  // Dedupe ledger for externally-triggered completions. The native layer clears
  // its queue on read, but overlapping pollers / page reloads can still observe
  // the same event twice; each delivery is stamped with habitId + timestamp.
  private static processedSignatures = new Set<string>();

  public static sync(): void {
    if (typeof window === 'undefined') return;

    try {
      const user = BuffrStorage.getUser();
      const completions = BuffrStorage.getCompletions();

      // IMPORTANT: must use the LOCAL date (same as getTodayStr() used when
      // logging completions), NOT the UTC ISO date — otherwise between midnight
      // and timezone offset (e.g. 00:00–05:30 IST) the widget would filter out
      // ALL of today's completions and render every quest as unchecked.
      const todayStr = getTodayStr();

      // Only surface quests that are actually DUE today on the widget:
      // interval quests vanish on rest days, flexible ones always show.
      const habits = BuffrStorage.getHabits().filter(
        (h) => !h.isArchived && !h.isPaused && isHabitScheduledForDate(h, todayStr, completions)
      );
      const todayCompletions = completions.filter((c) => c.dateStr === todayStr && c.isCompleted);
      const completedHabitIds = new Set(todayCompletions.map((c) => c.habitId));

      const questsTotal = habits.length;
      const questsDone = todayCompletions.length;
      const questPercent = questsTotal > 0 ? Math.round((questsDone / questsTotal) * 100) : 0;

      // Find first uncompleted habit
      const nextHabit = habits.find((h) => !completedHabitIds.has(h.id));
      const nextQuestTitle = nextHabit
        ? `${nextHabit.emoji || '⚔️'} ${nextHabit.title}`
        : questsTotal > 0 && questsDone >= questsTotal
        ? '🎉 All Quests Completed Today!'
        : "Tap to review today's quests";

      const levelData = calculateLevelFromTotalXp(user.totalXp || 0);

      const widgetHabits: WidgetHabitItem[] = habits.map((h) => ({
        id: h.id,
        title: h.title,
        emoji: h.emoji || '⚔️',
        xp: h.xpReward || 50,
        isCompleted: completedHabitIds.has(h.id),
      }));

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
        syncTimestamp: Date.now(),
        habits: widgetHabits,
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

  /**
   * Consumes any pending completions triggered from native home screen widgets
   */
  public static consumePendingWidgetActions(
    onToggleAction: (habitId: string, isCompleted: boolean) => void
  ): void {
    if (typeof window === 'undefined') return;

    try {
      const nativeWidget = (window as any).BuffrNativeWidget;
      if (nativeWidget && typeof nativeWidget.getPendingCompletions === 'function') {
        const rawJson = nativeWidget.getPendingCompletions();
        if (rawJson && rawJson !== '[]') {
          const pendingList: Array<{ habitId: string; isCompleted: boolean; timestamp?: number }> = JSON.parse(rawJson);
          for (const item of pendingList) {
            if (!item.habitId) continue;

            // Skip events we have already applied (double-delivery protection)
            const signature = `${item.habitId}|${item.timestamp ?? ''}`;
            if (BuffrWidgetBridge.processedSignatures.has(signature)) continue;
            BuffrWidgetBridge.processedSignatures.add(signature);

            // Keep the ledger bounded
            if (BuffrWidgetBridge.processedSignatures.size > 500) {
              const recent = [...BuffrWidgetBridge.processedSignatures].slice(-250);
              BuffrWidgetBridge.processedSignatures = new Set(recent);
            }

            onToggleAction(item.habitId, item.isCompleted);
          }
        }
      }
    } catch (err) {
      console.warn('Error consuming pending widget actions:', err);
    }
  }
}
