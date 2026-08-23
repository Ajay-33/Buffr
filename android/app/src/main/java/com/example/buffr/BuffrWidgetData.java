package com.example.buffr;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import org.json.JSONArray;
import org.json.JSONObject;

public class BuffrWidgetData {
    private static final String PREFS_NAME = "buffr_widget_prefs";
    private static final String KEY_HERO_NAME = "hero_name";
    private static final String KEY_LEVEL = "level";
    private static final String KEY_LEVEL_TITLE = "level_title";
    private static final String KEY_CURRENT_XP = "current_xp";
    private static final String KEY_NEXT_LEVEL_XP = "next_level_xp";
    private static final String KEY_XP_PERCENT = "xp_percent";
    private static final String KEY_STREAK = "streak";
    private static final String KEY_GOLD = "gold";
    private static final String KEY_QUESTS_DONE = "quests_done";
    private static final String KEY_QUESTS_TOTAL = "quests_total";
    private static final String KEY_QUEST_PERCENT = "quest_percent";
    private static final String KEY_NEXT_QUEST_TITLE = "next_quest_title";
    private static final String KEY_HABITS_JSON = "habits_json";
    private static final String KEY_PENDING_COMPLETIONS = "pending_completions";

    public static void saveWidgetData(Context context, String jsonString) {
        if (context == null || jsonString == null || jsonString.isEmpty()) return;

        try {
            JSONObject obj = new JSONObject(jsonString);
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            SharedPreferences.Editor editor = prefs.edit();

            if (obj.has("heroName")) editor.putString(KEY_HERO_NAME, obj.getString("heroName"));
            if (obj.has("level")) editor.putInt(KEY_LEVEL, obj.getInt("level"));
            if (obj.has("levelTitle")) editor.putString(KEY_LEVEL_TITLE, obj.getString("levelTitle"));
            if (obj.has("currentXp")) editor.putInt(KEY_CURRENT_XP, obj.getInt("currentXp"));
            if (obj.has("nextLevelXp")) editor.putInt(KEY_NEXT_LEVEL_XP, obj.getInt("nextLevelXp"));
            if (obj.has("xpPercent")) editor.putInt(KEY_XP_PERCENT, obj.getInt("xpPercent"));
            if (obj.has("streak")) editor.putInt(KEY_STREAK, obj.getInt("streak"));
            if (obj.has("gold")) editor.putInt(KEY_GOLD, obj.getInt("gold"));
            if (obj.has("questsDone")) editor.putInt(KEY_QUESTS_DONE, obj.getInt("questsDone"));
            if (obj.has("questsTotal")) editor.putInt(KEY_QUESTS_TOTAL, obj.getInt("questsTotal"));
            if (obj.has("questPercent")) editor.putInt(KEY_QUEST_PERCENT, obj.getInt("questPercent"));
            if (obj.has("nextQuestTitle")) editor.putString(KEY_NEXT_QUEST_TITLE, obj.getString("nextQuestTitle"));
            if (obj.has("habits")) editor.putString(KEY_HABITS_JSON, obj.getJSONArray("habits").toString());

            editor.apply();

            // Refresh all home screen widgets immediately
            updateAllWidgets(context);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void updateAllWidgets(Context context) {
        if (context == null) return;
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);

        // Update Daily HUD Widgets
        ComponentName hudComponentName = new ComponentName(context, BuffrDailyHUDWidget.class);
        int[] hudWidgetIds = appWidgetManager.getAppWidgetIds(hudComponentName);
        if (hudWidgetIds != null && hudWidgetIds.length > 0) {
            for (int widgetId : hudWidgetIds) {
                BuffrDailyHUDWidget.updateAppWidget(context, appWidgetManager, widgetId);
            }
        }

        // Update Quick Stat Mini Widgets
        ComponentName statComponentName = new ComponentName(context, BuffrQuickStatWidget.class);
        int[] statWidgetIds = appWidgetManager.getAppWidgetIds(statComponentName);
        if (statWidgetIds != null && statWidgetIds.length > 0) {
            for (int widgetId : statWidgetIds) {
                BuffrQuickStatWidget.updateAppWidget(context, appWidgetManager, widgetId);
            }
        }
    }

    public static SharedPreferences getPrefs(Context context) {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }

    public static String getHeroName(Context context) {
        return getPrefs(context).getString(KEY_HERO_NAME, "🎮 HERO");
    }

    public static int getLevel(Context context) {
        return getPrefs(context).getInt(KEY_LEVEL, 1);
    }

    public static int getCurrentXp(Context context) {
        return getPrefs(context).getInt(KEY_CURRENT_XP, 0);
    }

    public static int getNextLevelXp(Context context) {
        return getPrefs(context).getInt(KEY_NEXT_LEVEL_XP, 100);
    }

    public static int getXpPercent(Context context) {
        return getPrefs(context).getInt(KEY_XP_PERCENT, 0);
    }

    public static int getStreak(Context context) {
        return getPrefs(context).getInt(KEY_STREAK, 1);
    }

    public static int getGold(Context context) {
        return getPrefs(context).getInt(KEY_GOLD, 100);
    }

    public static int getQuestsDone(Context context) {
        return getPrefs(context).getInt(KEY_QUESTS_DONE, 0);
    }

    public static int getQuestsTotal(Context context) {
        return getPrefs(context).getInt(KEY_QUESTS_TOTAL, 0);
    }

    public static int getQuestPercent(Context context) {
        return getPrefs(context).getInt(KEY_QUEST_PERCENT, 0);
    }

    public static String getNextQuestTitle(Context context) {
        return getPrefs(context).getString(KEY_NEXT_QUEST_TITLE, "Tap to review today's quest list");
    }

    public static JSONArray getHabitsArray(Context context) {
        try {
            String json = getPrefs(context).getString(KEY_HABITS_JSON, "[]");
            return new JSONArray(json);
        } catch (Exception e) {
            return new JSONArray();
        }
    }

    public static String getAndClearPendingCompletions(Context context) {
        SharedPreferences prefs = getPrefs(context);
        String pending = prefs.getString(KEY_PENDING_COMPLETIONS, "[]");
        prefs.edit().putString(KEY_PENDING_COMPLETIONS, "[]").apply();
        return pending;
    }

    public static PendingIntent getLaunchPendingIntent(Context context) {
        Intent intent = new Intent(context, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        return PendingIntent.getActivity(
            context,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
    }

    public static PendingIntent getRefreshPendingIntent(Context context, Class<?> widgetClass) {
        Intent intent = new Intent(context, widgetClass);
        intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        int[] ids = AppWidgetManager.getInstance(context).getAppWidgetIds(new ComponentName(context, widgetClass));
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
        return PendingIntent.getBroadcast(
            context,
            1,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
    }
}
