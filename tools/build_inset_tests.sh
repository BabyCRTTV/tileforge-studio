#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
: "${ANDROID_JAR:?}" "${R8_JAR:?}" "${APKSIGNER_JAR:?}" "${TILEFORGE_KEYSTORE:?}"
AAPT_BIN="${AAPT_BIN:-aapt}"
mkdir -p android/build/inset-tests/classes android/build/inset-tests/dex
if [ -n "${ECJ_JAR:-}" ]; then
 java -jar "$ECJ_JAR" -8 -bootclasspath "$ANDROID_JAR" -d android/build/inset-tests/classes tests/android/SafeAreaInstrumentation.java
else
 javac -source 8 -target 8 -bootclasspath "$ANDROID_JAR" -d android/build/inset-tests/classes tests/android/SafeAreaInstrumentation.java
fi
python3 - <<'PY'
import pathlib,zipfile
with zipfile.ZipFile('android/build/inset-tests/classes.jar','w',zipfile.ZIP_DEFLATED) as z:
 for p in pathlib.Path('android/build/inset-tests/classes').rglob('*.class'):z.write(p,p.relative_to('android/build/inset-tests/classes'))
PY
java -cp "$R8_JAR" com.android.tools.r8.D8 --lib "$ANDROID_JAR" --min-api 30 --output android/build/inset-tests/dex android/build/inset-tests/classes.jar
"$AAPT_BIN" package -f -M tests/android/AndroidManifest.xml -I "$ANDROID_JAR" -F android/build/inset-tests/unsigned.apk
(cd android/build/inset-tests/dex && zip -q -u ../unsigned.apk classes.dex)
java -jar "$APKSIGNER_JAR" sign --ks "$TILEFORGE_KEYSTORE" --ks-key-alias tileforge --ks-pass pass:android --key-pass pass:android --out android/build/inset-tests/TileForge-Inset-Tests.apk android/build/inset-tests/unsigned.apk
echo 'Install the matching app and this separate test APK on an Android API 30+ emulator; run: adb shell am instrument -w com.eightbittrade.tileforge.test/.SafeAreaInstrumentation'
