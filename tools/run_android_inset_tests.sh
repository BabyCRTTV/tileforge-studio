#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p android/build/inset-results
trap 'adb logcat -d -t 1000 > android/build/inset-results/logcat.txt; adb shell dumpsys webviewupdate > android/build/inset-results/webview-provider.txt' EXIT
version=$(node -p "JSON.parse(require('fs').readFileSync('package.json','utf8')).version")
capture_screen() {
 local orientation="$1"
 # Instrumentation can leave a closing activity on the task stack. Capture a
 # fresh ordinary launch and wait for real WebView content, not a blank frame.
 adb shell am force-stop com.eightbittrade.tileforge
 adb shell am start -n com.eightbittrade.tileforge/.MainActivity
 for attempt in $(seq 1 8); do
  if adb shell uiautomator dump /sdcard/tileforge-check.xml && adb exec-out cat /sdcard/tileforge-check.xml > "android/build/inset-results/$orientation-ui.xml"; then
   if grep -Fq 'Load your project' "android/build/inset-results/$orientation-ui.xml"; then break; fi
  fi
  sleep 2
 done
 grep -F 'Load your project' "android/build/inset-results/$orientation-ui.xml"
 sleep 2
 adb shell dumpsys window windows > "android/build/inset-results/$orientation-window.txt"
 adb exec-out screencap -p > "android/build/inset-results/$orientation.png"
}
adb install -r "dist/downloads/TileForge-Studio-$version.apk"
adb install -r android/build/inset-tests/TileForge-Inset-Tests.apk
adb shell dumpsys webviewupdate > android/build/inset-results/webview-provider.txt
adb shell am instrument -w -r com.eightbittrade.tileforge.test/.SafeAreaInstrumentation | tee android/build/inset-results/native-checks.txt
grep -F 'native inset checks passed' android/build/inset-results/native-checks.txt
capture_screen portrait
adb shell settings put system accelerometer_rotation 0
adb shell settings put system user_rotation 1
sleep 3
adb shell am instrument -w -r com.eightbittrade.tileforge.test/.SafeAreaInstrumentation | tee android/build/inset-results/landscape-checks.txt
grep -F 'native inset checks passed' android/build/inset-results/landscape-checks.txt
capture_screen landscape
adb logcat -d -t 400 > android/build/inset-results/logcat.txt
