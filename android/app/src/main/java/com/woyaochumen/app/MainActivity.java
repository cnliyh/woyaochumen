package com.woyaochumen.app;

import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebView;

import androidx.activity.OnBackPressedCallback;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 状态栏区域用页面底色填充，避免内容顶到信号/时间栏
        getWindow().getDecorView().setBackgroundColor(Color.parseColor("#F2F5EF"));

        // 系统栏（状态栏、导航栏、刘海）留出安全区，安全区用页面底色填充
        View content = findViewById(android.R.id.content);
        content.setBackgroundColor(Color.parseColor("#F2F5EF"));
        ViewCompat.setOnApplyWindowInsetsListener(content, (view, windowInsets) -> {
            Insets bars = windowInsets.getInsets(
                WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout()
            );
            view.setPadding(bars.left, bars.top, bars.right, bars.bottom);
            return windowInsets;
        });

        // 返回键：交给页面自己判断。子页面一次返回回主界面，主界面再按才退出
        getOnBackPressedDispatcher().addCallback(
            this,
            new OnBackPressedCallback(true) {
                @Override
                public void handleOnBackPressed() {
                    WebView webView = getBridge() != null ? getBridge().getWebView() : null;
                    if (webView == null) {
                        exitApp();
                        return;
                    }
                    webView.evaluateJavascript(
                        "(function(){try{return (window.__onBackPressed && window.__onBackPressed()) || 'exit'}catch(e){return 'exit'}})()",
                        value -> {
                            String result = value == null ? "" : value.replace("\"", "").trim();
                            if (!"handled".equals(result)) {
                                exitApp();
                            }
                        }
                    );
                }

                private void exitApp() {
                    setEnabled(false);
                    getOnBackPressedDispatcher().onBackPressed();
                }
            }
        );
    }
}
