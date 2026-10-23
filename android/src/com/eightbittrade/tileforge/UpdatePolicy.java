package com.eightbittrade.tileforge;

import java.net.URI;
import java.security.MessageDigest;
import java.util.Locale;

/** Android-independent update validation, also exercised on the JVM. */
public final class UpdatePolicy {
    public static final String BASE = "https://babycrttv.github.io/tileforge-studio/";
    public static final String PACKAGE = "com.eightbittrade.tileforge";
    public static final long MAX_APK_BYTES = 100L * 1024 * 1024;
    private UpdatePolicy() {}
    public static String version(String v) {
        if (v == null || !v.matches("[0-9]{1,5}\\.[0-9]{1,5}\\.[0-9]{1,5}")) throw new IllegalArgumentException("Invalid release version");
        return v;
    }
    public static boolean newer(String next, String old) {
        String[] a = version(next).split("\\."), b = version(old).split("\\.");
        for (int i=0;i<3;i++) { int x=Integer.parseInt(a[i]), y=Integer.parseInt(b[i]); if(x!=y)return x>y; }
        return false;
    }
    public static void validate(String v, int code, String packageId, String url, long size, String sha) {
        version(v);
        if(code<1 || !PACKAGE.equals(packageId) || !apkUrl(v).equals(url) || size<1 || size>MAX_APK_BYTES || sha==null || !sha.matches("[a-fA-F0-9]{64}")) throw new IllegalArgumentException("The update information is incomplete or invalid. Try again later.");
    }
    public static String apkUrl(String v) { return BASE+"downloads/TileForge-Studio-"+version(v)+".apk"; }
    public static boolean requestUrl(String value) {
        try {
            URI u=new URI(value);
            if(!"https".equals(u.getScheme()) || !"babycrttv.github.io".equals(u.getHost()) || u.getPort()!=-1 || u.getUserInfo()!=null || u.getFragment()!=null)return false;
            if("/tileforge-studio/update.json".equals(u.getRawPath()))return u.getRawQuery()==null || u.getRawQuery().matches("t=[0-9]{1,16}");
            return u.getRawQuery()==null && u.getRawPath().matches("/tileforge-studio/downloads/TileForge-Studio-[0-9]{1,5}\\.[0-9]{1,5}\\.[0-9]{1,5}\\.apk");
        }catch(Exception e){return false;}
    }
    public static String hex(byte[] bytes) { StringBuilder out=new StringBuilder();for(byte b:bytes)out.append(String.format(Locale.US,"%02x",b&255));return out.toString(); }
    public static boolean verified(long bytes, long expectedBytes, byte[] digest, String expectedHash) {
        if(expectedHash==null || !expectedHash.matches("[a-fA-F0-9]{64}") || digest==null || digest.length!=32)return false;
        return bytes==expectedBytes && bytes>0 && bytes<=MAX_APK_BYTES && MessageDigest.isEqual(hex(digest).getBytes(java.nio.charset.StandardCharsets.US_ASCII),expectedHash.toLowerCase(Locale.US).getBytes(java.nio.charset.StandardCharsets.US_ASCII));
    }
}
