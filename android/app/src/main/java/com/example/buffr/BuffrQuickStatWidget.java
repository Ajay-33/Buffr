package com.example.buffr;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.widget.RemoteViews;

public class BuffrQuickStatWidget extends AppWidgetProvider {

    public static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.buffr_quick_stat_widget);

        String heroName = BuffrWidgetData.getHeroName(context);
        int level = BuffrWidgetData.getLevel(context);
        int streak = BuffrWidgetData.getStreak(context);
        int questsDone = BuffrWidgetData.getQuestsDone(context);
        int questsTotal = BuffrWidgetData.getQuestsTotal(context);

        views.setTextViewText(R.id.tv_hero_name, heroName);
        views.setTextViewText(R.id.tv_level_badge, "LVL " + level);
        views.setTextViewText(R.id.tv_streak_big, "🔥 " + streak);
        views.setTextViewText(R.id.tv_mini_quests, questsDone + "/" + questsTotal + " Quests Done");

        PendingIntent launchIntent = BuffrWidgetData.getLaunchPendingIntent(context);
        views.setOnClickPendingIntent(R.id.widget_root, launchIntent);
        views.setOnClickPendingIntent(R.id.btn_open_quests, launchIntent);

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
