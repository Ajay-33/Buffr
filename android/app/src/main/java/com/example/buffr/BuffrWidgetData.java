package com.example.buffr;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

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
    private static final String KEY_SYNC_TIMESTAMP = "sync_timestamp";
    private static final String KEY_LAST_NATIVE_INTERACTION = "last_native_interaction";
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
            
            // Habit-list propagation rules:
            //
            // 1. STRUCTURAL changes (tasks added / removed / re-created by cloud
            //    sync or onboarding) must ALWAYS propagate to the widget. Under the
            //    old timestamp-only gate such changes could be rejected forever,
            //    leaving the widget showing a permanently stale quest list.
            //
            // 2. VALUE-level flips (isCompleted toggles) are still gated by the
            //    interlock so that stale web payloads don't visually revert a tap
            //    the user just made on the widget itself.
            long incomingTs = obj.optLong("syncTimestamp", 0);
            long lastNativeInteraction = prefs.getLong(KEY_LAST_NATIVE_INTERACTION, 0);
            
            boolean structureChanged = false;
            if (obj.has("habits")) {
                JSONArray incomingHabits = obj.getJSONArray("habits");
                JSONArray currentHabits = getHabitsArray(context);
                structureChanged = !extractSortedIds(incomingHabits)
                        .equals(extractSortedIds(currentHabits));
            }
            
            if (structureChanged || incomingTs >= lastNativeInteraction) {
                if (obj.has("habits")) editor.putString(KEY_HABITS_JSON, obj.getJSONArray("habits").toString());
                if (obj.has("syncTimestamp")) editor.putLong(KEY_SYNC_TIMESTAMP, incomingTs);
            }
            
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
        int done = getPrefs(context).getInt(KEY_QUESTS_DONE, -1);
        if (done >= 0) return done;
        // Calculate dynamically from habits
        JSONArray habits = getHabitsArray(context);
        int d = 0;
        for (int i = 0; i < habits.length(); i++) {
            if (habits.optJSONObject(i) != null && habits.optJSONObject(i).optBoolean("isCompleted", false)) {
                d++;
            }
        }
        return d;
    }

    public static int getQuestsTotal(Context context) {
        int total = getPrefs(context).getInt(KEY_QUESTS_TOTAL, 0);
        if (total > 0) return total;
        return getHabitsArray(context).length();
    }

    public static int getQuestPercent(Context context) {
        int total = getQuestsTotal(context);
        int done = getQuestsDone(context);
        return total > 0 ? Math.round(((float) done / total) * 100) : 0;
    }

    public static String getNextQuestTitle(Context context) {
        return getPrefs(context).getString(KEY_NEXT_QUEST_TITLE, "Tap to review today's quest list");
    }

    public static long getSyncTimestamp(Context context) {
        return getPrefs(context).getLong(KEY_SYNC_TIMESTAMP, 0);
    }

    public static JSONArray getHabitsArray(Context context) {
        try {
            String json = getPrefs(context).getString(KEY_HABITS_JSON, null);
            if (json != null && !json.trim().isEmpty() && !json.trim().equals("[]")) {
                return new JSONArray(json);
            }
            
            // Seed starter quests so widget is never blank on fresh install
            JSONArray defaults = new JSONArray();
            JSONObject h1 = new JSONObject();
            h1.put("id", "starter_h1");
            h1.put("title", "Drink 500ml Water");
            h1.put("emoji", "💧");
            h1.put("xp", 25);
            h1.put("isCompleted", false);
            defaults.put(h1);

            JSONObject h2 = new JSONObject();
            h2.put("id", "starter_h2");
            h2.put("title", "Morning Workout / Walk");
            h2.put("emoji", "⚔️");
            h2.put("xp", 50);
            h2.put("isCompleted", false);
            defaults.put(h2);

            JSONObject h3 = new JSONObject();
            h3.put("id", "starter_h3");
            h3.put("title", "Deep Work Focus Session");
            h3.put("emoji", "📖");
            h3.put("xp", 50);
            h3.put("isCompleted", false);
            defaults.put(h3);

            return defaults;
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

    /**
     * Builds an order-independent identity fingerprint of a habit list so we can
     * detect structural changes (added/removed/re-created tasks) regardless of
     * ordering or completion-state differences.
     */
    private static String extractSortedIds(JSONArray arr) {
        try {
            List<String> ids = new ArrayList<>();
            for (int i = 0; i < arr.length(); i++) {
                JSONObject o = arr.optJSONObject(i);
                if (o != null) ids.add(o.optString("id"));
            }
            Collections.sort(ids);
            return ids.toString();
        } catch (Exception e) {
            return "";
        }
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
