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

        // 返回键：逐级返回上一页；只有已经在主界面时，页面才返回 exit，此时把 App 收到后台。
        // 注意：回调永远保持启用，绝不能 setEnabled(false)，否则后续返回会直接漏到系统导致 App 被切走。
        getOnBackPressedDispatcher().addCallback(
            this,
            new OnBackPressedCallback(true) {
                @Override
                public void handleOnBackPressed() {
                    WebView webView = getBridge() != null ? getBridge().getWebView() : null;
                    if (webView == null) {
                        moveTaskToBack(true);
                        return;
                    }
                    webView.evaluateJavascript(
                        "(function(){try{return (window.__onBackPressed && window.__onBackPressed()) || 'exit'}catch(e){return 'exit'}})()",
                        value -> {
                            String result = value == null ? "" : value.replace("\"", "").trim();
                            if (!"handled".equals(result)) {
                                moveTaskToBack(true);
                            }
                        }
                    );
                }
            }
        );
    }
}
