package com.example.buffr;

import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.Toast;
import org.json.JSONArray;
import org.json.JSONObject;

public class BuffrActionReceiver extends BroadcastReceiver {

    public static final String ACTION_TOGGLE_HABIT = "com.example.buffr.ACTION_TOGGLE_HABIT";
    public static final String EXTRA_HABIT_ID = "extra_habit_id";
    public static final String EXTRA_HABIT_TITLE = "extra_habit_title";
    public static final String EXTRA_HABIT_XP = "extra_habit_xp";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (context == null || intent == null) return;

        String action = intent.getAction();
        if (ACTION_TOGGLE_HABIT.equals(action)) {
            String habitId = intent.getStringExtra(EXTRA_HABIT_ID);
            if (habitId == null || habitId.isEmpty()) return;

            toggleHabitFromWidget(context, habitId);
        }
    }

    private void toggleHabitFromWidget(Context context, String habitId) {
        try {
            SharedPreferences prefs = BuffrWidgetData.getPrefs(context);
            String habitsJsonStr = prefs.getString("habits_json", "[]");
            JSONArray habitsArray = new JSONArray(habitsJsonStr);

            boolean found = false;
            boolean newCompletedState = true;
            String habitTitle = "Quest";
            int habitXp = 50;

            for (int i = 0; i < habitsArray.length(); i++) {
                JSONObject habitObj = habitsArray.getJSONObject(i);
                if (habitId.equals(habitObj.optString("id"))) {
                    boolean currentDone = habitObj.optBoolean("isCompleted", false);
                    newCompletedState = !currentDone;
                    habitObj.put("isCompleted", newCompletedState);
                    habitTitle = habitObj.optString("title", "Quest");
                    habitXp = habitObj.optInt("xp", 50);
                    found = true;
                    break;
                }
            }

            if (!found) return;

            // Recalculate Quests Done & Total
            int total = habitsArray.length();
            int done = 0;
            for (int i = 0; i < habitsArray.length(); i++) {
                if (habitsArray.getJSONObject(i).optBoolean("isCompleted", false)) {
                    done++;
                }
            }
            int percent = total > 0 ? Math.round(((float) done / total) * 100) : 0;

            // Adjust XP & Gold
            int currentXp = prefs.getInt("current_xp", 0);
            int nextLevelXp;
            int gold = prefs.getInt("gold", 50);
            int level = prefs.getInt("level", 1);

            if (newCompletedState) {
                currentXp += habitXp;
                gold += Math.max(1, habitXp / 2);
                
                // Sound and Haptic Feedback
                try {
                    android.os.Vibrator v;
                    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
                        android.os.VibratorManager vm = (android.os.VibratorManager) context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE);
                        v = vm != null ? vm.getDefaultVibrator() : null;
                    } else {
                        v = (android.os.Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
                    }

                    if (v != null && v.hasVibrator()) {
                        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                            v.vibrate(android.os.VibrationEffect.createOneShot(50, android.os.VibrationEffect.DEFAULT_AMPLITUDE));
                        } else {
                            v.vibrate(50);
                        }
                    }
                    android.net.Uri notification = android.media.RingtoneManager.getDefaultUri(android.media.RingtoneManager.TYPE_NOTIFICATION);
                    android.media.Ringtone r = android.media.RingtoneManager.getRingtone(context, notification);
                    r.play();
                } catch (Exception e) { e.printStackTrace(); }

            } else {
                currentXp = Math.max(0, currentXp - habitXp);
                gold = Math.max(0, gold - Math.max(1, habitXp / 2));
            }

            // Level Up Logic
            boolean leveledUp = false;
            
            // Match React XP Formula: Math.round(75 * Math.pow(level, 1.45) + 25)
            int neededXp = (level <= 1) ? 100 : (int) Math.round(75 * Math.pow(level, 1.45) + 25);
            
            while (currentXp >= neededXp) {
                currentXp -= neededXp;
                level++;
                neededXp = (int) Math.round(75 * Math.pow(level, 1.45) + 25);
                leveledUp = true;
            }
            
            // Handle XP being negative (rare but possible if habit XP changes)
            if (currentXp < 0 && level > 1) {
                level--;
                neededXp = (level <= 1) ? 100 : (int) Math.round(75 * Math.pow(level, 1.45) + 25);
                currentXp = neededXp + currentXp; 
            }

            nextLevelXp = neededXp;
            int xpPercent = nextLevelXp > 0 ? Math.min(100, Math.round(((float) currentXp / nextLevelXp) * 100)) : 0;

            // Save updated state in SharedPreferences
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("habits_json", habitsArray.toString());
            editor.putInt("quests_done", done);
            editor.putInt("quests_total", total);
            editor.putInt("quest_percent", percent);
            editor.putInt("level", level);
            editor.putInt("current_xp", currentXp);
            editor.putInt("next_level_xp", nextLevelXp);
            editor.putInt("xp_percent", xpPercent);
            editor.putInt("gold", gold);
            editor.putLong("last_native_interaction", System.currentTimeMillis());

            // Record in pending completions queue for Web DB synchronization
            String pendingStr = prefs.getString("pending_completions", "[]");
            JSONArray pendingArray = new JSONArray(pendingStr);
            JSONObject pendingAction = new JSONObject();
            pendingAction.put("habitId", habitId);
            pendingAction.put("isCompleted", newCompletedState);
            pendingAction.put("timestamp", System.currentTimeMillis());
            pendingArray.put(pendingAction);
            editor.putString("pending_completions", pendingArray.toString());

            // Use commit() for widget actions to ensure data is written before AppWidgetManager refresh
            editor.commit();

            // Refresh all widgets immediately
            BuffrWidgetData.updateAllWidgets(context);

            // Toast feedback
            String feedback = newCompletedState
                ? (leveledUp ? "🌟 LEVEL UP! LVL " + level + " 🌟" : "⚔️ Quest Complete: " + habitTitle + "! (+" + habitXp + " XP)")
                : "↩️ Quest Unchecked: " + habitTitle;
            Toast.makeText(context, feedback, Toast.LENGTH_SHORT).show();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static PendingIntent createTogglePendingIntent(Context context, String habitId, int requestCode) {
        Intent intent = new Intent(context, BuffrActionReceiver.class);
        intent.setAction(ACTION_TOGGLE_HABIT);
        intent.putExtra(EXTRA_HABIT_ID, habitId);
        return PendingIntent.getBroadcast(
            context,
            requestCode,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
    }
}
