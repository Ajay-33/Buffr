package com.example.buffr;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.view.View;
import android.widget.RemoteViews;
import org.json.JSONArray;
import org.json.JSONObject;

public class BuffrDailyHUDWidget extends AppWidgetProvider {

    public static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.buffr_daily_hud_widget);

        // Populate Character HUD
        String heroName = BuffrWidgetData.getHeroName(context);
        int level = BuffrWidgetData.getLevel(context);
        int currentXp = BuffrWidgetData.getCurrentXp(context);
        int nextXp = BuffrWidgetData.getNextLevelXp(context);
        int xpPercent = BuffrWidgetData.getXpPercent(context);
        int streak = BuffrWidgetData.getStreak(context);
        int gold = BuffrWidgetData.getGold(context);
        int questsDone = BuffrWidgetData.getQuestsDone(context);
        int questsTotal = BuffrWidgetData.getQuestsTotal(context);
        int questPercent = BuffrWidgetData.getQuestPercent(context);

        views.setTextViewText(R.id.tv_hero_name, heroName);
        views.setTextViewText(R.id.tv_level_badge, "LVL " + level);
        views.setTextViewText(R.id.tv_streak_badge, "🔥 " + streak + "d");
        views.setTextViewText(R.id.tv_gold_badge, "💰 " + gold + "G");

        views.setTextViewText(R.id.tv_xp_label, "XP: " + currentXp + " / " + nextXp);
        views.setTextViewText(R.id.tv_xp_percent, xpPercent + "%");
        views.setProgressBar(R.id.pb_xp_progress, 100, xpPercent, false);

        views.setTextViewText(R.id.tv_quest_status, "⚔️ TODAY'S QUESTS");
        views.setTextViewText(R.id.tv_quest_percent, questsDone + "/" + questsTotal + " (" + questPercent + "%)");

        // Populate Quest Rows from Habits Array
        JSONArray habits = BuffrWidgetData.getHabitsArray(context);
        int questRows = 3;

        int[] rowIds = { R.id.ll_quest_row_1, R.id.ll_quest_row_2, R.id.ll_quest_row_3 };
        int[] checkBtnIds = { R.id.btn_check_1, R.id.btn_check_2, R.id.btn_check_3 };
        int[] titleIds = { R.id.tv_quest_title_1, R.id.tv_quest_title_2, R.id.tv_quest_title_3 };
        int[] xpIds = { R.id.tv_quest_xp_1, R.id.tv_quest_xp_2, R.id.tv_quest_xp_3 };

        if (habits.length() == 0) {
            // No habits configured yet
            views.setViewVisibility(R.id.ll_quest_row_1, View.GONE);
            views.setViewVisibility(R.id.ll_quest_row_2, View.GONE);
            views.setViewVisibility(R.id.ll_quest_row_3, View.GONE);
            views.setViewVisibility(R.id.tv_all_done_label, View.VISIBLE);
            views.setTextViewText(R.id.tv_all_done_label, "Tap below to create your first quest!");
        } else {
            boolean allDone = (questsDone >= questsTotal && questsTotal > 0);
            views.setViewVisibility(R.id.tv_all_done_label, allDone ? View.VISIBLE : View.GONE);
            if (allDone) {
                views.setTextViewText(R.id.tv_all_done_label, "🎉 All Daily Quests Conquered! Hero combo active.");
            }

            for (int i = 0; i < questRows; i++) {
                if (i < habits.length()) {
                    try {
                        JSONObject h = habits.getJSONObject(i);
                        String habitId = h.optString("id", "");
                        String emoji = h.optString("emoji", "⚔️");
                        String title = h.optString("title", "Quest");
                        int xp = h.optInt("xp", 50);
                        boolean isDone = h.optBoolean("isCompleted", false);

                        views.setViewVisibility(rowIds[i], View.VISIBLE);
                        views.setTextViewText(titleIds[i], emoji + " " + title);
                        views.setTextViewText(xpIds[i], "+" + xp + " XP");

                        if (isDone) {
                            views.setTextViewText(checkBtnIds[i], "✔");
                            views.setTextColor(checkBtnIds[i], context.getColor(R.color.widget_emerald));
                            views.setInt(checkBtnIds[i], "setBackgroundResource", R.drawable.widget_checkbox_checked_bg);
                            views.setTextColor(titleIds[i], context.getColor(R.color.widget_text_muted));
                        } else {
                            views.setTextViewText(checkBtnIds[i], "◻");
                            views.setTextColor(checkBtnIds[i], context.getColor(R.color.widget_cyan));
                            views.setInt(checkBtnIds[i], "setBackgroundResource", R.drawable.widget_checkbox_bg);
                            views.setTextColor(titleIds[i], context.getColor(R.color.widget_text_primary));
                        }

                        // Attach 1-tap interactive PendingIntent directly to the checkbox
                        PendingIntent toggleIntent = BuffrActionReceiver.createTogglePendingIntent(context, habitId, 1000 + i + (appWidgetId * 10));
                        views.setOnClickPendingIntent(checkBtnIds[i], toggleIntent);

                    } catch (Exception e) {
                        views.setViewVisibility(rowIds[i], View.GONE);
                    }
                } else {
                    views.setViewVisibility(rowIds[i], View.GONE);
                }
            }
        }

        // Whole widget / Open Quests Pending Intents
        PendingIntent launchIntent = BuffrWidgetData.getLaunchPendingIntent(context);
        views.setOnClickPendingIntent(R.id.btn_open_quests, launchIntent);

        PendingIntent refreshIntent = BuffrWidgetData.getRefreshPendingIntent(context, BuffrDailyHUDWidget.class);
        views.setOnClickPendingIntent(R.id.btn_refresh, refreshIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    @Override
    public void onEnabled(Context context) {
        BuffrWidgetData.updateAllWidgets(context);
    }
}
