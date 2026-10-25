#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p android/build/inset-results
version=$(node -p "JSON.parse(require('fs').readFileSync('package.json','utf8')).version")
adb install -r "dist/downloads/TileForge-Studio-$version.apk"
adb install -r android/build/inset-tests/TileForge-Inset-Tests.apk
adb shell am instrument -w -r com.eightbittrade.tileforge.test/.SafeAreaInstrumentation | tee android/build/inset-results/native-checks.txt
rg 'native inset checks passed' android/build/inset-results/native-checks.txt
adb shell am start -n com.eightbittrade.tileforge/.MainActivity
sleep 3
adb shell dumpsys window windows > android/build/inset-results/portrait-window.txt
adb exec-out screencap -p > android/build/inset-results/portrait.png
adb shell settings put system accelerometer_rotation 0
adb shell settings put system user_rotation 1
sleep 3
adb shell am instrument -w -r com.eightbittrade.tileforge.test/.SafeAreaInstrumentation | tee android/build/inset-results/landscape-checks.txt
rg 'native inset checks passed' android/build/inset-results/landscape-checks.txt
adb shell am start -n com.eightbittrade.tileforge/.MainActivity
sleep 3
adb shell dumpsys window windows > android/build/inset-results/landscape-window.txt
adb exec-out screencap -p > android/build/inset-results/landscape.png
adb logcat -d -t 400 > android/build/inset-results/logcat.txt
