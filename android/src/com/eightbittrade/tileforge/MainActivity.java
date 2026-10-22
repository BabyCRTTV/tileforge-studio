package com.eightbittrade.tileforge;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.*;
import android.util.Base64;
import android.widget.Toast;
import java.io.*;

/** Offline-first editor shell. Only packaged appassets pages receive the save bridge. */
public class MainActivity extends Activity {
    private static final String ORIGIN = "https://appassets.androidplatform.net";
    private WebView web;
    private ValueCallback<Uri[]> chooser;
    private File pendingFile;
    private FileOutputStream output;
    private String pendingName, pendingMime;
    private boolean saving;
    private long savedBytes;
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        web = new WebView(this);
        setContentView(web);
        web.setOnApplyWindowInsetsListener(new android.view.View.OnApplyWindowInsetsListener(){public android.view.WindowInsets onApplyWindowInsets(android.view.View v,android.view.WindowInsets insets){v.setPadding(insets.getSystemWindowInsetLeft(),insets.getSystemWindowInsetTop(),insets.getSystemWindowInsetRight(),insets.getSystemWindowInsetBottom());return insets;}});
        web.setBackgroundColor(0xfff5f5ee);
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        web.addJavascriptInterface(new SaveBridge(), "AndroidFiles");
        web.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
                Uri u = req.getUrl();
                if (!ORIGIN.equals(u.getScheme()+"://"+u.getHost())) return null;
                String path = u.getPath();
                if (path == null || !path.startsWith("/assets/www/") || path.contains("..")) return new WebResourceResponse("text/plain","UTF-8",null);
                path = path.substring("/assets/".length());
                if (path.endsWith("/")) path += "index.html";
                String mime = path.endsWith(".mjs")||path.endsWith(".js")?"text/javascript":path.endsWith(".css")?"text/css":path.endsWith(".html")?"text/html":path.endsWith(".svg")?"image/svg+xml":path.endsWith(".png")?"image/png":path.endsWith(".webmanifest")?"application/manifest+json":"application/octet-stream";
                try {return new WebResourceResponse(mime,"UTF-8",getAssets().open(path));}
                catch(IOException e) {return new WebResourceResponse("text/plain","UTF-8",null);}
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (url.startsWith(ORIGIN+"/assets/www/") && !url.endsWith(".apk")) return false;
                if(url.startsWith(ORIGIN) && url.endsWith(".apk")) url="https://babycrttv.github.io/tileforge-studio/downloads/TileForge-Studio-0.1.0.apk";
                if(url.startsWith("https://")) {try {startActivity(new Intent(Intent.ACTION_VIEW,Uri.parse(url)));} catch(Exception e){message("No browser available");}}
                return true;
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if(chooser!=null) chooser.onReceiveValue(null);
                chooser=callback;
                Intent i=new Intent(Intent.ACTION_OPEN_DOCUMENT);i.addCategory(Intent.CATEGORY_OPENABLE);i.setType("*/*");
                try {startActivityForResult(i,100);} catch(Exception e){chooser.onReceiveValue(null);chooser=null;message("File picker unavailable");}
                return true;
            }
        });
        web.loadUrl(ORIGIN+"/assets/www/index.html");
    }
    private void message(final String s){runOnUiThread(new Runnable(){public void run(){Toast.makeText(MainActivity.this,s,Toast.LENGTH_LONG).show();}});}
    private synchronized void clearPending() {try {if(output!=null)output.close();}catch(IOException ignored){}output=null;if(pendingFile!=null)pendingFile.delete();pendingFile=null;saving=false;}
    private class SaveBridge {
        @JavascriptInterface public synchronized void beginSave(String name,String mime) {
            if(saving)throw new IllegalStateException("A save is already pending");
            clearPending();saving=true;savedBytes=0;pendingName=name.replaceAll("[^A-Za-z0-9._-]","_");pendingMime=mime;
            try {pendingFile=File.createTempFile("tileforge-export-",".tmp",getCacheDir());output=new FileOutputStream(pendingFile);}catch(IOException e){clearPending();throw new IllegalStateException("Could not prepare export");}
        }
        @JavascriptInterface public synchronized void appendSave(String encoded) {
            if(output==null)throw new IllegalStateException("No export in progress");
            byte[] data=Base64.decode(encoded,Base64.DEFAULT);savedBytes+=data.length;
            if(savedBytes>400L*1024*1024){clearPending();throw new IllegalStateException("Export exceeds 400 MB");}
            try {output.write(data);}catch(IOException e){clearPending();throw new IllegalStateException("Not enough storage for export");}
        }
        @JavascriptInterface public synchronized void finishSave() {
            if(output==null)return;
            try {output.close();output=null;}catch(IOException e){clearPending();return;}
            runOnUiThread(new Runnable(){public void run(){Intent i=new Intent(Intent.ACTION_CREATE_DOCUMENT);i.addCategory(Intent.CATEGORY_OPENABLE);i.setType(pendingMime);i.putExtra(Intent.EXTRA_TITLE,pendingName);try{startActivityForResult(i,101);}catch(Exception e){clearPending();message("Save picker unavailable");}}});
        }
    }
    @Override protected void onActivityResult(int request,int result,Intent data) {
        super.onActivityResult(request,result,data);
        if(request==100&&chooser!=null){chooser.onReceiveValue(result==RESULT_OK&&data!=null?new Uri[]{data.getData()}:null);chooser=null;}
        if(request==101){if(result==RESULT_OK&&data!=null&&pendingFile!=null){final Uri destination=data.getData();final File file=pendingFile;new Thread(new Runnable(){public void run(){try(InputStream in=new FileInputStream(file);OutputStream out=getContentResolver().openOutputStream(destination)){byte[] b=new byte[65536];int n;while((n=in.read(b))!=-1)out.write(b,0,n);message("Export saved");}catch(Exception e){message("Export failed. Please try again.");}finally{clearPending();}}}).start();}else clearPending();}
    }
    @Override public void onBackPressed(){web.evaluateJavascript("document.querySelector('dialog[open]') ? (document.querySelector('dialog[open]').close(), true) : false",new ValueCallback<String>(){public void onReceiveValue(String result){if(!"true".equals(result))new android.app.AlertDialog.Builder(MainActivity.this).setTitle("Close TileForge?").setMessage("Export or save your project before closing. Source edits also have a local draft.").setNegativeButton("Keep editing",null).setPositiveButton("Close",new android.content.DialogInterface.OnClickListener(){public void onClick(android.content.DialogInterface d,int w){finish();}}).show();}});}
    @Override protected void onDestroy(){if(chooser!=null)chooser.onReceiveValue(null);clearPending();web.destroy();super.onDestroy();}
}
