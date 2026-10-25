package com.eightbittrade.tileforge.test;

import android.app.Activity;
import android.app.Instrumentation;
import android.content.Intent;
import android.graphics.Insets;
import android.os.Bundle;
import android.os.SystemClock;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowInsets;
import android.widget.FrameLayout;
import android.webkit.WebView;

/** Separate test APK: exercises the real Android view hierarchy, not CSS mocks. */
public final class SafeAreaInstrumentation extends Instrumentation {
    private int checks;
    private String expectedOrientation;
    private void check(boolean value,String message) { if(!value)throw new AssertionError(message);checks++; }
    @Override public void onCreate(Bundle arguments) { super.onCreate(arguments); expectedOrientation=arguments.getString("orientation","portrait"); start(); }
    @Override public void onStart() {
        Bundle result=new Bundle();
        try {
            final Activity activity=startActivitySync(new Intent().setClassName("com.eightbittrade.tileforge","com.eightbittrade.tileforge.MainActivity").addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
            waitForIdleSync();SystemClock.sleep(500);
            final Throwable[] failure=new Throwable[1];
            runOnMainSync(new Runnable() { public void run() { try { verify(activity); } catch(Throwable error) { failure[0]=error; } } });
            if(failure[0]!=null)throw failure[0];
            result.putString("result","native inset checks passed: "+checks);finish(Activity.RESULT_OK,result);
        } catch(Throwable error) { result.putString("error",error.toString());finish(Activity.RESULT_CANCELED,result); }
    }
    private void verify(Activity activity) {
        ViewGroup content=activity.findViewById(android.R.id.content);
        check(content.getChildAt(0) instanceof FrameLayout,"WebView must have an actual native safe-area container");
        final FrameLayout host=(FrameLayout)content.getChildAt(0);final WebView web=(WebView)host.getChildAt(0);
        final WindowInsets original=host.getRootWindowInsets();check(original!=null,"Root insets available");
        int width=host.getWidth(),height=host.getHeight();check(width>0&&height>0,"Host laid out");
        check("landscape".equals(expectedOrientation)?width>height:height>width,"Expected "+expectedOrientation+" host, got "+width+"x"+height);
        final WindowInsets[] received=new WindowInsets[1];
        web.setOnApplyWindowInsetsListener(new View.OnApplyWindowInsetsListener() { public WindowInsets onApplyWindowInsets(View view,WindowInsets insets) {received[0]=insets;return view.onApplyWindowInsets(insets);} });
        // top bar, nav right/bottom, cutout left/right, keyboard, caption, gesture
        int[][] profiles={{28,0,48,0,0,0,0,0},{24,48,0,120,0,0,0,0},{24,0,32,0,120,0,0,0},{28,0,48,0,0,400,0,0},{28,0,48,0,0,0,0,0},{0,0,0,0,0,0,36,24}};
        try {
            for(int[] p:profiles) {
                WindowInsets.Builder builder=new WindowInsets.Builder();
                int[] types={WindowInsets.Type.statusBars(),WindowInsets.Type.navigationBars(),WindowInsets.Type.displayCutout(),WindowInsets.Type.captionBar(),WindowInsets.Type.mandatorySystemGestures()};
                Insets[] values={Insets.of(0,p[0],0,0),Insets.of(0,0,p[1],p[2]),Insets.of(p[3],0,p[4],0),Insets.of(0,p[6],0,0),Insets.of(0,0,0,p[7])};
                for(int i=0;i<types.length;i++)builder.setInsets(types[i],values[i]).setInsetsIgnoringVisibility(types[i],values[i]);
                builder.setInsets(WindowInsets.Type.ime(),Insets.of(0,0,0,p[5])).setVisible(WindowInsets.Type.ime(),p[5]>0);
                received[0]=null;host.dispatchApplyWindowInsets(builder.build());
                host.measure(View.MeasureSpec.makeMeasureSpec(width,View.MeasureSpec.EXACTLY),View.MeasureSpec.makeMeasureSpec(height,View.MeasureSpec.EXACTLY));host.layout(host.getLeft(),host.getTop(),host.getLeft()+width,host.getTop()+height);
                int left=p[3],top=Math.max(p[0],p[6]),right=Math.max(p[1],p[4]),bottom=Math.max(Math.max(p[2],p[5]),p[7]);
                check(web.getLeft()==left&&web.getTop()==top&&web.getRight()==width-right&&web.getBottom()==height-bottom,"Real WebView bounds exclude bars, cutouts and keyboard");
                check(web.getPaddingLeft()==0&&web.getPaddingTop()==0&&web.getPaddingRight()==0&&web.getPaddingBottom()==0,"Inset padding belongs to native parent");
                check(received[0]!=null,"Zero inset update reaches WebView, including keyboard hide");
                check(received[0].getInsets(WindowInsets.Type.systemBars()|WindowInsets.Type.displayCutout()|WindowInsets.Type.ime()|WindowInsets.Type.mandatorySystemGestures()).equals(Insets.NONE),"No duplicate WebView insets");
            }
        } finally { web.setOnApplyWindowInsetsListener(null);host.dispatchApplyWindowInsets(original);host.requestLayout();host.requestApplyInsets(); }
        int appearance=activity.getWindow().getInsetsController().getSystemBarsAppearance();
        check((appearance&android.view.WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS)!=0,"Readable dark status icons");
        check((appearance&android.view.WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS)!=0,"Readable dark navigation icons");
    }
}
