package com.eightbittrade.tileforge;

import android.content.Context;
import android.graphics.Insets;
import android.os.Build;
import android.view.DisplayCutout;
import android.view.WindowInsets;
import android.widget.FrameLayout;

/** Own the system insets outside the WebView, so its real viewport is safe. */
public final class SafeAreaLayout extends FrameLayout {
    public SafeAreaLayout(Context context) {
        super(context);
        setBackgroundColor(0xfff5f5ee);
        setOnApplyWindowInsetsListener(new android.view.View.OnApplyWindowInsetsListener() {
            @Override public WindowInsets onApplyWindowInsets(android.view.View view, WindowInsets insets) {
                return applySafeInsets(insets);
            }
        });
    }

    private WindowInsets applySafeInsets(WindowInsets insets) {
        if (Build.VERSION.SDK_INT >= 30) {
            int fixedTypes = WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout();
            int changingTypes = WindowInsets.Type.ime() | WindowInsets.Type.mandatorySystemGestures();
            Insets safe = Insets.max(insets.getInsetsIgnoringVisibility(fixedTypes), insets.getInsets(changingTypes));
            DisplayCutout cutout = insets.getDisplayCutout();
            if (cutout != null) safe = Insets.max(safe, cutout.getWaterfallInsets());
            setPadding(safe.left, safe.top, safe.right, safe.bottom);
            // Forward zeros, rather than CONSUMED, on every update. WebView
            // must see keyboard-hide/rotation updates without padding twice.
            return new WindowInsets.Builder(insets)
                .setInsets(fixedTypes | changingTypes, Insets.NONE)
                .setInsetsIgnoringVisibility(fixedTypes | WindowInsets.Type.mandatorySystemGestures(), Insets.NONE)
                .setDisplayCutout(null).build();
        }
        int left = insets.getSystemWindowInsetLeft(), top = insets.getSystemWindowInsetTop();
        int right = insets.getSystemWindowInsetRight(), bottom = insets.getSystemWindowInsetBottom();
        if (Build.VERSION.SDK_INT >= 28) {
            DisplayCutout cutout = insets.getDisplayCutout();
            if (cutout != null) {
                left = Math.max(left, cutout.getSafeInsetLeft()); top = Math.max(top, cutout.getSafeInsetTop());
                right = Math.max(right, cutout.getSafeInsetRight()); bottom = Math.max(bottom, cutout.getSafeInsetBottom());
            }
        }
        if (Build.VERSION.SDK_INT >= 29) {
            Insets gestures = insets.getMandatorySystemGestureInsets();
            left = Math.max(left, gestures.left); top = Math.max(top, gestures.top);
            right = Math.max(right, gestures.right); bottom = Math.max(bottom, gestures.bottom);
        }
        setPadding(left, top, right, bottom);
        WindowInsets zeroed = insets.replaceSystemWindowInsets(0, 0, 0, 0).consumeStableInsets();
        if (Build.VERSION.SDK_INT >= 28) zeroed = zeroed.consumeDisplayCutout();
        if (Build.VERSION.SDK_INT >= 29) zeroed = new WindowInsets.Builder(zeroed)
            .setSystemGestureInsets(Insets.NONE).setMandatorySystemGestureInsets(Insets.NONE)
            .setTappableElementInsets(Insets.NONE).build();
        return zeroed;
    }
}
