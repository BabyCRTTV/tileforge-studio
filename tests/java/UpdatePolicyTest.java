import com.eightbittrade.tileforge.UpdatePolicy;
import java.security.MessageDigest;

public class UpdatePolicyTest {
    private static int checks;
    static void check(boolean v){checks++;if(!v)throw new AssertionError("Check "+checks+" failed");}
    static void rejects(Runnable task){boolean rejected=false;try{task.run();}catch(IllegalArgumentException e){rejected=true;}check(rejected);}
    public static void main(String[] args)throws Exception{
        check(UpdatePolicy.newer("0.10.0","0.9.99"));check(!UpdatePolicy.newer("0.8.0","0.8.0"));check(!UpdatePolicy.newer("0.7.1","0.8.0"));
        rejects(()->UpdatePolicy.version("0.8.0-beta"));rejects(()->UpdatePolicy.version("v0.8.0"));
        String url=UpdatePolicy.apkUrl("0.8.0"),sha=UpdatePolicy.hex(MessageDigest.getInstance("SHA-256").digest(new byte[]{1,2,3}));
        UpdatePolicy.validate("0.8.0",13,UpdatePolicy.PACKAGE,url,3,sha);
        rejects(()->UpdatePolicy.validate("0.8.0",0,UpdatePolicy.PACKAGE,url,3,sha));rejects(()->UpdatePolicy.validate("0.8.0",13,"other",url,3,sha));rejects(()->UpdatePolicy.validate("0.8.0",13,UpdatePolicy.PACKAGE,url+"?x",3,sha));rejects(()->UpdatePolicy.validate("0.8.0",13,UpdatePolicy.PACKAGE,url,UpdatePolicy.MAX_APK_BYTES+1,sha));rejects(()->UpdatePolicy.validate("0.8.0",13,UpdatePolicy.PACKAGE,url,3,"bad"));
        check(UpdatePolicy.requestUrl(url));check(UpdatePolicy.requestUrl(UpdatePolicy.BASE+"update.json?t=12345"));check(UpdatePolicy.requestUrl(UpdatePolicy.BASE+"update.json"));
        for(String bad:new String[]{url.replace("https:","http:"),url.replace("babycrttv.github.io","evil.invalid"),url+"?q",url+"#x",url.replace("https://","https://name@"),url.replace("github.io","github.io:443"),url.replace("downloads/","downloads/%2e%2e/"),UpdatePolicy.BASE+"update.json?other=1"})check(!UpdatePolicy.requestUrl(bad));
        byte[] digest=MessageDigest.getInstance("SHA-256").digest(new byte[]{1,2,3});check(UpdatePolicy.verified(3,3,digest,sha));check(UpdatePolicy.verified(3,3,digest,sha.toUpperCase()));check(!UpdatePolicy.verified(2,3,digest,sha));check(!UpdatePolicy.verified(3,3,digest,"0".repeat(64)));check(!UpdatePolicy.verified(3,3,new byte[0],sha));
        System.out.println("Native update policy: "+checks+" checks passed");
    }
}
