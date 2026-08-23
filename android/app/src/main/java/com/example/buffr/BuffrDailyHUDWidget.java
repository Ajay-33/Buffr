package com.example.buffr;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.view.View;
import android.widget.RemoteViews;
import org.json.JSONArray;

public class BuffrDailyHUDWidget extends AppWidgetProvider {

    public static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.buffr_daily_hud_widget);

        // 1. Populate Character HUD (Static fields)
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

        // 2. Setup Scrollable ListView
        Intent intent = new Intent(context, BuffrWidgetService.class);
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
        // Add a unique URI to prevent intent caching/merging issues
        intent.setData(Uri.parse(intent.toUri(Intent.URI_INTENT_SCHEME)));
        views.setRemoteAdapter(R.id.lv_quest_list, intent);

        // 3. Handle Empty State
        JSONArray habits = BuffrWidgetData.getHabitsArray(context);
        boolean allDone = (questsDone >= questsTotal && questsTotal > 0);
        
        if (habits.length() == 0) {
            views.setViewVisibility(R.id.lv_quest_list, View.GONE);
            views.setViewVisibility(R.id.tv_all_done_label, View.VISIBLE);
            views.setTextViewText(R.id.tv_all_done_label, "Tap below to create your first quest!");
        } else if (allDone) {
            views.setViewVisibility(R.id.lv_quest_list, View.GONE);
            views.setViewVisibility(R.id.tv_all_done_label, View.VISIBLE);
            views.setTextViewText(R.id.tv_all_done_label, "🎉 All Daily Quests Conquered! Hero combo active.");
        } else {
            views.setViewVisibility(R.id.lv_quest_list, View.VISIBLE);
            views.setViewVisibility(R.id.tv_all_done_label, View.GONE);
        }

        // 4. Setup Interactive Actions for List Items
        // We set a template intent for the whole list, and specific rows "fill it in" with their habit ID.
        Intent toggleIntent = new Intent(context, BuffrActionReceiver.class);
        toggleIntent.setAction(BuffrActionReceiver.ACTION_TOGGLE_HABIT);
        PendingIntent togglePendingIntent = PendingIntent.getBroadcast(
            context, 0, toggleIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_MUTABLE
        );
        views.setPendingIntentTemplate(R.id.lv_quest_list, togglePendingIntent);

        // 5. General Widget Pending Intents
        PendingIntent launchIntent = BuffrWidgetData.getLaunchPendingIntent(context);
        views.setOnClickPendingIntent(R.id.btn_open_quests, launchIntent);

        PendingIntent refreshIntent = BuffrWidgetData.getRefreshPendingIntent(context, BuffrDailyHUDWidget.class);
        views.setOnClickPendingIntent(R.id.btn_refresh, refreshIntent);

        // Notify that data has changed (forces list to refresh)
        appWidgetManager.notifyAppWidgetViewDataChanged(appWidgetId, R.id.lv_quest_list);
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
