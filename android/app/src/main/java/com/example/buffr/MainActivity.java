package com.example.buffr;

import android.os.Bundle;
import android.webkit.JavascriptInterface;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Expose native widget updater and pending action sync to WebView JavaScript context
        if (this.bridge != null && this.bridge.getWebView() != null) {
            this.bridge.getWebView().addJavascriptInterface(new Object() {
                @JavascriptInterface
                public void updateWidget(String jsonData) {
                    BuffrWidgetData.saveWidgetData(MainActivity.this, jsonData);
                }

                @JavascriptInterface
                public String getPendingCompletions() {
                    return BuffrWidgetData.getAndClearPendingCompletions(MainActivity.this);
                }
            }, "BuffrNativeWidget");
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        // Refresh home screen widgets whenever user enters the app
        BuffrWidgetData.updateAllWidgets(this);
    }
}
