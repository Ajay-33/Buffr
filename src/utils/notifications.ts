import { LocalNotifications, ActionPerformed } from '@capacitor/local-notifications';
import { Habit, UserProfile } from '../types';
import { BuffrStorage } from '../storage/db';

export interface NotificationStatus {
  isSupported: boolean;
  isGranted: boolean;
  isNative: boolean;
}

export const BUFFR_QUEST_ACTION_TYPE = 'BUFFR_QUEST_ACTION_TYPE';
export const ACTION_COMPLETE_QUEST = 'ACTION_COMPLETE_QUEST';
export const ACTION_SNOOZE_QUEST = 'ACTION_SNOOZE_QUEST';
export const ACTION_OPEN_APP = 'ACTION_OPEN_APP';

// Generate a deterministic 32-bit positive integer ID from a string key
function stringToId(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash) % 2147483647;
}

export class BuffrNotificationService {
  private static isCapacitorAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(window as any).Capacitor?.isNativePlatform?.();
  }

  /**
   * Initializes notification channels and interactive action buttons for Android
   */
  public static async initChannels(): Promise<void> {
    if (!this.isCapacitorAvailable()) return;

    try {
      // 1. Create Native Notification Channels
      await LocalNotifications.createChannel({
        id: 'buffr_quests',
        name: 'Buffr Daily Quests',
        description: 'Reminders for daily habits and active quest objectives',
        importance: 5, // High importance (heads-up notification)
        visibility: 1, // Public
        sound: 'res_custom_notification',
        vibration: true,
        lights: true,
        lightColor: '#06B6D4',
      });

      await LocalNotifications.createChannel({
        id: 'buffr_streaks',
        name: 'Buffr Streak Shield Alerts',
        description: 'Critical reminders when daily streaks are about to be lost',
        importance: 5,
        visibility: 1,
        vibration: true,
        lights: true,
        lightColor: '#FACC15',
      });

      // 2. Register Interactive Action Buttons (Mark Done, Snooze, Open)
      await LocalNotifications.registerActionTypes({
        types: [
          {
            id: BUFFR_QUEST_ACTION_TYPE,
            actions: [
              {
                id: ACTION_COMPLETE_QUEST,
                title: '✅ Mark Done',
                foreground: false,
              },
              {
                id: ACTION_SNOOZE_QUEST,
                title: '⏰ Snooze 15m',
                foreground: false,
              },
              {
                id: ACTION_OPEN_APP,
                title: '🚀 Open Quest',
                foreground: true,
              },
            ],
          },
        ],
      });
    } catch (err) {
      console.warn('Channel/Action registration error:', err);
    }
  }

  /**
   * Sets up interactive listeners for notification action button clicks
   */
  public static setupActionListeners(onCompleteHabit: (habitId: string) => void): void {
    if (!this.isCapacitorAvailable()) return;

    try {
      LocalNotifications.removeAllListeners();

      LocalNotifications.addListener('localNotificationActionPerformed', async (action: ActionPerformed) => {
        const actionId = action.actionId;
        const extra = action.notification?.extra;

        if (actionId === ACTION_COMPLETE_QUEST && extra?.habitId) {
          onCompleteHabit(extra.habitId);
        } else if (actionId === ACTION_SNOOZE_QUEST) {
          // Reschedule reminder for 15 minutes later
          const snoozeId = (action.notification.id || 1000) + 50000;
          await LocalNotifications.schedule({
            notifications: [
              {
                id: snoozeId,
                title: action.notification.title,
                body: `⏰ Snoozed: ${action.notification.body}`,
                channelId: 'buffr_quests',
                actionTypeId: BUFFR_QUEST_ACTION_TYPE,
                smallIcon: 'ic_launcher_round',
                schedule: { at: new Date(Date.now() + 15 * 60 * 1000) },
                extra: extra,
              },
            ],
          });
        }
      });
    } catch (err) {
      console.warn('Failed to attach notification listeners:', err);
    }
  }

  /**
   * Check notification permissions across Web and Native
   */
  public static async checkPermission(): Promise<NotificationStatus> {
    const isNative = this.isCapacitorAvailable();

    if (isNative) {
      try {
        const check = await LocalNotifications.checkPermissions();
        return {
          isSupported: true,
          isGranted: check.display === 'granted',
          isNative: true,
        };
      } catch {
        return { isSupported: true, isGranted: false, isNative: true };
      }
    }

    // Web Notification fallback
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return {
        isSupported: true,
        isGranted: Notification.permission === 'granted',
        isNative: false,
      };
    }

    return { isSupported: false, isGranted: false, isNative: false };
  }

  /**
   * Request notification permissions from the OS
   */
  public static async requestPermission(): Promise<boolean> {
    const isNative = this.isCapacitorAvailable();

    if (isNative) {
      try {
        await this.initChannels();
        const result = await LocalNotifications.requestPermissions();
        return result.display === 'granted';
      } catch (err) {
        console.error('Failed to request native notification permissions:', err);
        return false;
      }
    }

    // Web Notification fallback
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        return perm === 'granted';
      } catch (err) {
        console.error('Failed to request web notification permissions:', err);
        return false;
      }
    }

    return false;
  }

  /**
   * Schedules a test interactive notification to immediately verify actions
   */
  public static async sendTestNotification(): Promise<boolean> {
    const { isGranted } = await this.checkPermission();
    if (!isGranted) {
      const granted = await this.requestPermission();
      if (!granted) return false;
    }

    const isNative = this.isCapacitorAvailable();
    const title = '⚔️ Buffr Interactive Quest Alert';
    const body = 'System telemetry online! Tap "Mark Done" or "Snooze" to test interactive notification actions.';

    if (isNative) {
      try {
        await this.initChannels();
        await LocalNotifications.schedule({
          notifications: [
            {
              id: 999999,
              title,
              body,
              channelId: 'buffr_quests',
              actionTypeId: BUFFR_QUEST_ACTION_TYPE,
              smallIcon: 'ic_launcher_round',
              schedule: { at: new Date(Date.now() + 1000) }, // in 1 second
              extra: { type: 'test' },
            },
          ],
        });
        return true;
      } catch (err) {
        console.error('Native test notification error:', err);
        return false;
      }
    }

    // Web notification fallback
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        new Notification(title, {
          body,
          icon: '/icon-192.png',
        });
        return true;
      } catch (err) {
        console.error('Web test notification error:', err);
        return false;
      }
    }

    return false;
  }

  /**
   * Reschedules all dynamic notifications with interactive action buttons
   */
  public static async rescheduleAll(customUser?: UserProfile, customHabits?: Habit[]): Promise<void> {
    const user = customUser || BuffrStorage.getUser();
    const habits = (customHabits || BuffrStorage.getHabits()).filter((h) => !h.isArchived && !h.isPaused);

    // If notifications are disabled globally by user, clear all scheduled notifications
    if (user.notificationsEnabled === false) {
      await this.cancelAll();
      return;
    }

    const { isGranted } = await this.checkPermission();
    if (!isGranted) return;

    if (this.isCapacitorAvailable()) {
      try {
        await this.initChannels();
        // Cancel prior scheduled notifications to prevent duplicates
        const pending = await LocalNotifications.getPending();
        if (pending.notifications.length > 0) {
          await LocalNotifications.cancel({ notifications: pending.notifications });
        }

        const notificationsToSchedule: any[] = [];

        // 1. Morning Briefing Notification (default: 08:00 AM)
        if (user.morningReminderEnabled !== false) {
          const timeStr = user.morningReminderTime || '08:00';
          const [hour, minute] = timeStr.split(':').map(Number);
          notificationsToSchedule.push({
            id: 100001,
            title: `🌅 Morning Quest Briefing (${user.name || 'Hero'})`,
            body: `Today has ${habits.length} quests waiting. Boot up to claim daily XP & maintain your combo!`,
            channelId: 'buffr_quests',
            smallIcon: 'ic_launcher_round',
            schedule: {
              on: { hour: hour || 8, minute: minute || 0 },
              allowWhileIdle: true,
            },
            extra: { type: 'morning_briefing' },
          });
        }

        // 2. Evening Streak Shield Alert (default: 21:00 / 9:00 PM)
        if (user.eveningReminderEnabled !== false) {
          const timeStr = user.eveningReminderTime || '21:00';
          const [hour, minute] = timeStr.split(':').map(Number);
          notificationsToSchedule.push({
            id: 100002,
            title: `🔥 Streak Alert (${user.currentStreak || 1} Day Combo)`,
            body: `Don't let your streak freeze! Check in before midnight to record your completed habits.`,
            channelId: 'buffr_streaks',
            smallIcon: 'ic_launcher_round',
            schedule: {
              on: { hour: hour || 21, minute: minute || 0 },
              allowWhileIdle: true,
            },
            extra: { type: 'evening_streak' },
          });
        }

        // 3. Individual Habit/Task Reminders with Interactive Action Buttons
        for (const habit of habits) {
          if (!habit.reminderTime) continue;

          const [hHour, hMinute] = habit.reminderTime.split(':').map(Number);
          if (isNaN(hHour) || isNaN(hMinute)) continue;

          const habitNotificationId = stringToId(`habit_${habit.id}`);

          notificationsToSchedule.push({
            id: habitNotificationId,
            title: `${habit.emoji || '⚔️'} Quest: ${habit.title}`,
            body: habit.description
              ? `${habit.description} (+${habit.xpReward || 50} XP)`
              : `Time to tackle this quest! Earn +${habit.xpReward || 50} XP upon completion.`,
            channelId: 'buffr_quests',
            actionTypeId: BUFFR_QUEST_ACTION_TYPE, // Enables [✅ Mark Done] & [⏰ Snooze]
            smallIcon: 'ic_launcher_round',
            schedule: {
              on: { hour: hHour, minute: hMinute },
              allowWhileIdle: true,
            },
            extra: { type: 'habit_reminder', habitId: habit.id, title: habit.title, xp: habit.xpReward },
          });
        }

        if (notificationsToSchedule.length > 0) {
          await LocalNotifications.schedule({
            notifications: notificationsToSchedule,
          });
        }
      } catch (err) {
        console.error('Failed to reschedule native notifications:', err);
      }
    }
  }

  /**
   * Cancel all pending scheduled notifications
   */
  public static async cancelAll(): Promise<void> {
    if (this.isCapacitorAvailable()) {
      try {
        const pending = await LocalNotifications.getPending();
        if (pending.notifications.length > 0) {
          await LocalNotifications.cancel({ notifications: pending.notifications });
        }
      } catch (err) {
        console.error('Failed to cancel notifications:', err);
      }
    }
  }
}
