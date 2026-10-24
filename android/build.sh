#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
: "${ANDROID_JAR:?Set ANDROID_JAR to the SDK android.jar}"
: "${R8_JAR:?Set R8_JAR to the official R8 jar}"
AAPT_BIN="${AAPT_BIN:-aapt}"
ZIPALIGN_BIN="${ZIPALIGN_BIN:-zipalign}"
APKSIGNER_JAR="${APKSIGNER_JAR:?Set APKSIGNER_JAR}"
mkdir -p android/build/classes android/build/dex android/build/assets/www dist/downloads
cp -R dist/. android/build/assets/www/
# The native app opens the editor directly; the website root is the download landing page.
cp dist/editor.html android/build/assets/www/index.html
rm -rf android/build/assets/www/downloads
rm -f android/build/assets/www/update.json
if [ -n "${ECJ_JAR:-}" ]; then
  java -jar "$ECJ_JAR" -8 -bootclasspath "$ANDROID_JAR" -d android/build/classes android/src/com/eightbittrade/tileforge/*.java
else
  javac -source 8 -target 8 -bootclasspath "$ANDROID_JAR" -d android/build/classes android/src/com/eightbittrade/tileforge/*.java
fi
python3 - <<'PYZIP'
import zipfile,pathlib
with zipfile.ZipFile("android/build/classes.jar","w",zipfile.ZIP_DEFLATED) as z:
 for p in pathlib.Path("android/build/classes").rglob("*.class"):z.write(p,p.relative_to("android/build/classes"))
PYZIP
java -cp "$R8_JAR" com.android.tools.r8.D8 --lib "$ANDROID_JAR" --min-api 26 --output android/build/dex android/build/classes.jar
"$AAPT_BIN" package -f -M android/AndroidManifest.xml -S android/res -A android/build/assets -I "$ANDROID_JAR" -F android/build/unsigned.apk
(cd android/build/dex && zip -q -u ../unsigned.apk classes.dex)
"$ZIPALIGN_BIN" -f 4 android/build/unsigned.apk android/build/aligned.apk
# A local alpha build creates a private keystore once. CI should supply its persistent signing key.
TILEFORGE_KEYSTORE="${TILEFORGE_KEYSTORE:-android/build/tileforge-alpha.jks}"
if [ ! -f "$TILEFORGE_KEYSTORE" ]; then keytool -genkeypair -keystore "$TILEFORGE_KEYSTORE" -storepass android -keypass android -alias tileforge -dname 'CN=8BitTrade TileForge Alpha' -keyalg RSA -keysize 2048 -validity 10000 >/dev/null 2>&1; fi
java -jar "$APKSIGNER_JAR" sign --ks "$TILEFORGE_KEYSTORE" --ks-key-alias tileforge --ks-pass pass:android --key-pass pass:android --out dist/downloads/TileForge-Studio-0.12.0.apk android/build/aligned.apk
java -jar "$APKSIGNER_JAR" verify --verbose dist/downloads/TileForge-Studio-0.12.0.apk
