package com.eightbittrade.tileforge;

import android.app.Activity;
import android.content.Intent;
import android.content.ClipData;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.net.Uri;
import android.webkit.WebView;
import org.json.JSONObject;
import org.json.JSONArray;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.MessageDigest;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;

/** User-initiated updates only. Android owns installation approval and preserves app data. */
public final class AppUpdater {
    private final Activity activity;
    private final WebView web;
    private final ExecutorService executor=Executors.newSingleThreadExecutor();
    private final AtomicBoolean busy=new AtomicBoolean(false);
    private final String installedVersion;
    private final int installedCode;
    private volatile boolean destroyed,waitingForPermission;
    private volatile Candidate candidate;
    private volatile File readyFile;
    private volatile String status="idle",message="Check for the latest TileForge update.",latestVersion="",notes="";
    private volatile int progress;
    private volatile long checkedAt;
    private static final class Candidate {
        final String version,url,sha;final int code;final long size;
        Candidate(JSONObject data)throws Exception{
            if(!"tileforge-update".equals(data.getString("format")))throw new IOException("Unsupported update information.");
            version=UpdatePolicy.version(data.getString("version"));code=data.getInt("versionCode");JSONObject apk=data.getJSONObject("android");url=apk.getString("url");sha=apk.getString("sha256");size=apk.getLong("size");
            UpdatePolicy.validate(version,code,apk.getString("packageId"),url,size,sha);
        }
    }
    public AppUpdater(Activity a,WebView w){
        activity=a;web=w;String v="0.0.0";int c=0;try{PackageInfo p=a.getPackageManager().getPackageInfo(a.getPackageName(),0);v=p.versionName;c=p.versionCode;}catch(Exception ignored){}installedVersion=v;installedCode=c;
        File dir=new File(a.getCacheDir(),"updates");File[] old=dir.listFiles();if(old!=null)for(File f:old)if(f.isFile())f.delete();
    }
    public String snapshot(){JSONObject data=new JSONObject();try{data.put("status",status);data.put("message",message);data.put("progress",progress);data.put("installedVersion",installedVersion);data.put("installedCode",installedCode);data.put("latestVersion",latestVersion);data.put("available",candidate!=null);data.put("downloaded",readyFile!=null&&readyFile.isFile());data.put("checkedAt",checkedAt);data.put("notes",notes);}catch(Exception ignored){}return data.toString();}
    private void emit(String next,String text,int percent){status=next;message=text;progress=percent;final String json=snapshot();if(!destroyed)activity.runOnUiThread(new Runnable(){public void run(){if(!destroyed&&trusted())web.evaluateJavascript("window.dispatchEvent(new CustomEvent('tileforge:update',{detail:"+json+"}));",null);}});}
    public boolean trusted(){String u=web.getUrl();return u!=null&&(u.equals("https://appassets.androidplatform.net/assets/www/index.html")||u.equals("https://appassets.androidplatform.net/assets/www/editor.html"));}
    public void check(){
        if(destroyed||!busy.compareAndSet(false,true))return;
        executor.execute(new Runnable(){public void run(){
            candidate=null;readyFile=null;latestVersion="";notes="";waitingForPermission=false;emit("checking","Checking for updates…",0);
            try{
                HttpURLConnection c=connect(UpdatePolicy.BASE+"update.json?t="+System.currentTimeMillis());String text;
                try(InputStream in=c.getInputStream()){ByteArrayOutputStream out=new ByteArrayOutputStream();byte[] b=new byte[4096];int n;while((n=in.read(b))!=-1){if(out.size()+n>65536)throw new IOException("Update information is too large.");out.write(b,0,n);}text=out.toString("UTF-8");}finally{c.disconnect();}
                JSONObject data=new JSONObject(text);Candidate next=new Candidate(data);latestVersion=next.version;checkedAt=System.currentTimeMillis();JSONArray releaseNotes=data.optJSONArray("notes");StringBuilder summary=new StringBuilder();if(releaseNotes!=null)for(int i=0;i<Math.min(8,releaseNotes.length());i++){String line=releaseNotes.optString(i);summary.append(line.substring(0,Math.min(300,line.length()))).append('\n');}notes=summary.toString().trim();
                if(UpdatePolicy.newer(next.version,installedVersion)){if(next.code<=installedCode)throw new IOException("The new update build is not ready. Please try again shortly.");candidate=next;emit("available","TileForge "+next.version+" is available.",0);}else emit("current","You are using the latest version available for this installation.",0);
            }catch(Exception e){emit("error",friendly(e,"Could not check for updates. Check your connection and try again."),0);}finally{busy.set(false);}
        }});
    }
    public void download(){
        final Candidate next=candidate;if(next==null||destroyed||!busy.compareAndSet(false,true))return;
        executor.execute(new Runnable(){public void run(){
            File dir=new File(activity.getCacheDir(),"updates"),partial=new File(dir,"pending.apk"),complete=new File(dir,"verified.apk");readyFile=null;
            try{
                if(!dir.isDirectory()&&!dir.mkdirs())throw new IOException("Could not prepare update storage.");emit("downloading","Downloading TileForge "+next.version+"…",0);
                HttpURLConnection c=connect(next.url);MessageDigest digest=MessageDigest.getInstance("SHA-256");long total=0,last=0;
                try(InputStream in=c.getInputStream();FileOutputStream out=new FileOutputStream(partial)){byte[] b=new byte[32768];int n;while((n=in.read(b))!=-1){if(destroyed||Thread.currentThread().isInterrupted())throw new InterruptedIOException();total+=n;if(total>next.size||total>UpdatePolicy.MAX_APK_BYTES)throw new IOException("The update size did not match. Check for updates again.");out.write(b,0,n);digest.update(b,0,n);long now=System.currentTimeMillis();if(now-last>250){last=now;emit("downloading","Downloading update…",(int)(total*100/next.size));}}out.getFD().sync();}finally{c.disconnect();}
                if(destroyed||Thread.currentThread().isInterrupted())throw new InterruptedIOException();
                if(!UpdatePolicy.verified(total,next.size,digest.digest(),next.sha))throw new IOException("The download could not be verified. Check for updates and try again.");verifyPackage(partial,next);
                if(complete.exists()&&!complete.delete())throw new IOException("Could not replace the previous update.");if(!partial.renameTo(complete))throw new IOException("Could not finish the download.");readyFile=complete;emit("ready","Update verified. Opening Android installation…",100);activity.runOnUiThread(new Runnable(){public void run(){install();}});
            }catch(Exception e){partial.delete();emit("error",friendly(e,"Could not download the update. Please try again."),0);}finally{busy.set(false);}
        }});
    }
    private void verifyPackage(File file,Candidate next)throws Exception{
        PackageManager pm=activity.getPackageManager();PackageInfo downloaded=pm.getPackageArchiveInfo(file.getAbsolutePath(),PackageManager.GET_SIGNATURES),installed=pm.getPackageInfo(activity.getPackageName(),PackageManager.GET_SIGNATURES);
        if(downloaded==null||!activity.getPackageName().equals(downloaded.packageName)||!next.version.equals(downloaded.versionName)||downloaded.versionCode!=next.code||downloaded.versionCode<=installed.versionCode)throw new IOException("This is not the expected TileForge update.");
        Set<String> a=signatures(downloaded),b=signatures(installed);if(a.isEmpty()||!a.equals(b))throw new IOException("The update signer does not match this installation. Use the official downloads page for help.");
    }
    private Set<String> signatures(PackageInfo info)throws Exception{Set<String> out=new HashSet<String>();if(info.signatures!=null)for(Signature s:info.signatures)out.add(UpdatePolicy.hex(MessageDigest.getInstance("SHA-256").digest(s.toByteArray())));return out;}
    private boolean allowedToInstall(){try{return Boolean.TRUE.equals(PackageManager.class.getMethod("canRequestPackageInstalls").invoke(activity.getPackageManager()));}catch(Exception e){return false;}}
    public void install(){
        final Candidate next=candidate;final File file=readyFile;if(destroyed||next==null||file==null||!file.isFile())return;
        try{
            if(!allowedToInstall()){waitingForPermission=true;emit("permission","Allow updates from TileForge in Android settings, then return here.",100);activity.startActivity(new Intent("android.settings.MANAGE_UNKNOWN_APP_SOURCES",Uri.parse("package:"+activity.getPackageName())));return;}
            waitingForPermission=false;verifyPackage(file,next);Uri uri=Uri.parse("content://"+activity.getPackageName()+".updates/update.apk");Intent intent=new Intent(Intent.ACTION_VIEW);intent.setDataAndType(uri,"application/vnd.android.package-archive");intent.setClipData(ClipData.newRawUri("TileForge update",uri));intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);emit("installing","Confirm Update in Android. Your drafts and settings stay in place.",100);activity.startActivity(intent);
        }catch(Exception e){waitingForPermission=false;emit("error",friendly(e,"Could not open Android installation. Try again or use the official download."),100);}
    }
    public void onResume(){if(destroyed)return;if(waitingForPermission){waitingForPermission=false;if(allowedToInstall())install();else emit("ready","Installation permission was not granted. Tap Install update to try again.",100);}else if("installing".equals(status))emit("ready","If installation was cancelled, tap Install update to reopen it.",100);}
    public void destroy(){destroyed=true;executor.shutdownNow();}
    private HttpURLConnection connect(String address)throws Exception{
        if(!UpdatePolicy.requestUrl(address))throw new IOException("The update address is not trusted.");HttpURLConnection c=(HttpURLConnection)new URL(address).openConnection();c.setInstanceFollowRedirects(false);c.setUseCaches(false);c.setConnectTimeout(15000);c.setReadTimeout(30000);c.setRequestProperty("User-Agent","TileForge-Android/"+installedVersion);c.setRequestProperty("Cache-Control","no-cache");int code=c.getResponseCode();if(code!=200){c.disconnect();throw new IOException(code==404?"Update information is not ready. Please try again shortly.":"Could not reach the update server. Please try again later.");}return c;
    }
    private static String friendly(Exception e,String fallback){return (e instanceof IOException||e instanceof IllegalArgumentException)&&e.getMessage()!=null?e.getMessage():fallback;}
}
