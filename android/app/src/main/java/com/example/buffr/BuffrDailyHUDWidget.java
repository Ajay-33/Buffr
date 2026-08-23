package com.example.buffr;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.widget.RemoteViews;

public class BuffrDailyHUDWidget extends AppWidgetProvider {

    public static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.buffr_daily_hud_widget);

        // Populate dynamic values
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
        String nextQuest = BuffrWidgetData.getNextQuestTitle(context);

        views.setTextViewText(R.id.tv_hero_name, heroName);
        views.setTextViewText(R.id.tv_level_badge, "LVL " + level);
        views.setTextViewText(R.id.tv_streak_badge, "🔥 " + streak + "d");
        views.setTextViewText(R.id.tv_gold_badge, "💰 " + gold + "G");

        views.setTextViewText(R.id.tv_xp_label, "XP: " + currentXp + " / " + nextXp);
        views.setTextViewText(R.id.tv_xp_percent, xpPercent + "%");
        views.setProgressBar(R.id.pb_xp_progress, 100, xpPercent, false);

        views.setTextViewText(R.id.tv_quest_status, "⚔️ Quests: " + questsDone + " / " + questsTotal + " Done");
        views.setTextViewText(R.id.tv_quest_percent, questPercent + "%");
        views.setTextViewText(R.id.tv_next_quest, nextQuest);

        // Pending Intents
        PendingIntent launchIntent = BuffrWidgetData.getLaunchPendingIntent(context);
        views.setOnClickPendingIntent(R.id.widget_root, launchIntent);
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
        // First widget created
        BuffrWidgetData.updateAllWidgets(context);
    }
}
