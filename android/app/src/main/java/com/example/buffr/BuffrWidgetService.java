package com.example.buffr;

import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;
import android.widget.RemoteViewsService;
import androidx.core.content.ContextCompat;
import org.json.JSONArray;
import org.json.JSONObject;

public class BuffrWidgetService extends RemoteViewsService {
    @Override
    public RemoteViewsFactory onGetViewFactory(Intent intent) {
        return new BuffrRemoteViewsFactory(this.getApplicationContext());
    }
}

class BuffrRemoteViewsFactory implements RemoteViewsService.RemoteViewsFactory {
    private Context mContext;
    private JSONArray mHabits = new JSONArray();

    public BuffrRemoteViewsFactory(Context context) {
        mContext = context;
    }

    private void updateData() {
        mHabits = BuffrWidgetData.getHabitsArray(mContext);
    }

    @Override
    public void onCreate() {
        updateData();
    }

    @Override
    public void onDataSetChanged() {
        updateData();
    }

    @Override
    public void onDestroy() {
        mHabits = new JSONArray();
    }

    @Override
    public int getCount() {
        return mHabits.length();
    }

    @Override
    public RemoteViews getViewAt(int position) {
        if (position < 0 || position >= mHabits.length()) return null;

        RemoteViews views = new RemoteViews(mContext.getPackageName(), R.layout.widget_quest_item);
        try {
            JSONObject habit = mHabits.getJSONObject(position);
            String id = habit.optString("id");
            String title = habit.optString("title");
            String emoji = habit.optString("emoji", "⚔️");
            int xp = habit.optInt("xp", 50);
            boolean isDone = habit.optBoolean("isCompleted", false);

            views.setTextViewText(R.id.tv_quest_title, emoji + " " + title);
            views.setTextViewText(R.id.tv_quest_xp, "+" + xp + " XP");

            int emeraldColor = ContextCompat.getColor(mContext, R.color.widget_emerald);
            int cyanColor = ContextCompat.getColor(mContext, R.color.widget_cyan);
            int mutedColor = ContextCompat.getColor(mContext, R.color.widget_text_muted);
            int primaryColor = ContextCompat.getColor(mContext, R.color.widget_text_primary);

            if (isDone) {
                views.setTextViewText(R.id.btn_check, "✔");
                views.setTextColor(R.id.btn_check, emeraldColor);
                views.setInt(R.id.btn_check, "setBackgroundResource", R.drawable.widget_checkbox_checked_bg);
                views.setTextColor(R.id.tv_quest_title, mutedColor);
            } else {
                views.setTextViewText(R.id.btn_check, "◻");
                views.setTextColor(R.id.btn_check, cyanColor);
                views.setInt(R.id.btn_check, "setBackgroundResource", R.drawable.widget_checkbox_bg);
                views.setTextColor(R.id.tv_quest_title, primaryColor);
            }

            // Create a fill-in intent for the item click. 
            // The template in the provider will combine with this.
            Intent fillInIntent = new Intent();
            fillInIntent.putExtra(BuffrActionReceiver.EXTRA_HABIT_ID, id);
            views.setOnClickFillInIntent(R.id.btn_check, fillInIntent);
            views.setOnClickFillInIntent(R.id.ll_quest_item_root, fillInIntent);

        } catch (Exception e) {
            e.printStackTrace();
        }

        return views;
    }

    @Override
    public RemoteViews getLoadingView() {
        return null;
    }

    @Override
    public int getViewTypeCount() {
        return 1;
    }

    @Override
    public long getItemId(int position) {
        return position;
    }

    @Override
    public boolean hasStableIds() {
        return true;
    }
}
