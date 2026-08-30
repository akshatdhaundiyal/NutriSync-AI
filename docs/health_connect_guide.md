# NutriSync AI — Android Health Connect Native Integration & Testing Guide

This guide explains how to build, install, and test NutriSync AI with **native Android Health Connect** using an Expo Development Client (`expo-dev-client`).

It also documents every environment fix applied during our first successful build, so future developers can reproduce the setup from scratch.

---

## 1. Why Standard Expo Go Cannot Be Used

Google Health Connect requires:
- Native Android permissions (`android.permission.health.*`) declared in `AndroidManifest.xml`.
- Native SDK bindings (`react-native-health-connect`).
- Intent filters for permission dialogues and privacy policy display.

Because Expo Go has a fixed, pre-compiled set of native modules, testing Health Connect requires an **Expo Development Build**.

---

## 2. Device Prerequisites

### A. Android Version Compatibility
- **Android 14+ (API 34+)**: Health Connect is a core Android operating system component. Access it via:
  `Settings > Security & Privacy > Health Connect`.
- **Android 13 or lower**: Install the standalone **Health Connect** app from the Google Play Store.

### B. Injecting Realistic Biometric Test Data
To test without waiting days for wearable data to accumulate, use Google's official **Health Connect Toolbox**:
1. Install **Health Connect Toolbox** from the Google Play Store.
2. Open the toolbox and insert simulated historical data:
   - **Sleep Sessions**: Insert 7–14 days of sleep stages (Deep, REM, Light).
   - **Heart Rate Variability**: Insert nocturnal RMSSD records (e.g. 55–80 ms).
   - **Resting Heart Rate**: Insert daily resting HR (e.g. 52–62 BPM).
   - **Steps & Workouts**: Insert steps and exercise sessions.

---

## 3. Build & Run Workflows

### Option A: EAS Cloud Build (Recommended — No Android Studio Needed)

1. **Install EAS CLI and Log In**:
   ```bash
   npm install -g eas-cli
   eas login
   ```

2. **Trigger the Cloud Build**:
   ```bash
   cd frontend
   eas build --profile development --platform android
   ```
   *EAS will build an installable `.apk` file in the cloud.*

3. **Install the APK on Your Android Device**:
   - Download the generated `.apk` directly from the EAS build URL onto your phone and install it.

4. **Start the Local Development Server**:
   ```bash
   npx expo start --dev-client
   ```

5. **Open NutriSync AI on Your Phone**:
   - Launch your installed development app, scan the Metro QR code, and connect.

---

### Option B: Local USB Run (Requires Android Studio & Android SDK)

#### Step 1 — Install Android Studio & SDK

Install [Android Studio](https://developer.android.com/studio) and ensure the following SDK components are installed (via SDK Manager):
- Android SDK Platform 34
- Android SDK Build-Tools 34
- Android SDK Platform-Tools (provides `adb`)

#### Step 2 — Environment Variables

The build requires three environment variables. These were permanently set in the Windows User environment during our initial setup:

| Variable | Value | Notes |
| :--- | :--- | :--- |
| `JAVA_HOME` | `C:\Program Files\Android\Android Studio\jbr` | Android Studio's bundled OpenJDK 21 |
| `ANDROID_HOME` | `C:\Users\akshat\AppData\Local\Android\Sdk` | Default SDK location |
| `PATH` (appended) | `%JAVA_HOME%\bin` and `%ANDROID_HOME%\platform-tools` | Provides `java`, `javac`, and `adb` |

**Set them permanently** (run once in an elevated PowerShell):
```powershell
[System.Environment]::SetEnvironmentVariable('JAVA_HOME', 'C:\Program Files\Android\Android Studio\jbr', 'User')
[System.Environment]::SetEnvironmentVariable('ANDROID_HOME', 'C:\Users\akshat\AppData\Local\Android\Sdk', 'User')

# Append to PATH (only if not already present):
$currentPath = [System.Environment]::GetEnvironmentVariable('PATH', 'User')
$javabin = 'C:\Program Files\Android\Android Studio\jbr\bin'
$plattools = 'C:\Users\akshat\AppData\Local\Android\Sdk\platform-tools'
if ($currentPath -notlike "*$javabin*") {
  [System.Environment]::SetEnvironmentVariable('PATH', "$javabin;$plattools;$currentPath", 'User')
}
```

> [!TIP]
> After setting these permanently, **restart your terminal** for the changes to take effect.

**Or set them per-session** (if you don't want to modify the system):
```powershell
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME = "C:\Users\akshat\AppData\Local\Android\Sdk"
$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:PATH"
```

#### Step 3 — Enable USB Debugging

1. On your phone: `Settings > About Phone > Tap 'Build Number' 7 times`.
2. Go to `Settings > System > Developer Options` and enable **USB Debugging**.
3. Connect your phone to your PC via USB and authorize the computer when prompted.

#### Step 4 — Verify ADB Connection

```bash
adb devices
```
Ensure your device appears with `device` status (not `unauthorized`).

#### Step 5 — Build & Launch

```powershell
cd frontend
npx expo run:android
```

Or, to build the APK directly via Gradle and install manually:
```powershell
cd frontend/android
.\gradlew.bat app:assembleDebug -x lint -x test
adb install -r app\build\outputs\apk\debug\app-debug.apk
```

Then start the dev server:
```powershell
cd frontend
npx expo start --dev-client
```

---

## 4. Troubleshooting — Issues Encountered & Fixes Applied

This section documents every blocker we hit during the first build attempt and the exact fix for each.

### 4.1 `JAVA_HOME is not set` (Error Code 9009)

**Symptom**: Running `npx expo run:android` produced:
```
ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH.
Error: gradlew.bat app:assembleDebug ... exited with non-zero code: 9009
```

**Root Cause**: The `JAVA_HOME` environment variable was never configured. Gradle could not locate a JDK.

**Fix (two layers)**:

1. **Permanent env vars** — Set `JAVA_HOME` pointing to Android Studio's bundled OpenJDK 21 at `C:\Program Files\Android\Android Studio\jbr` (see Step 2 above).

2. **`gradlew.bat` auto-detection fallback** — We patched [`frontend/android/gradlew.bat`](file:///d:/lab/projects/NutriSync-AI/frontend/android/gradlew.bat) line 42 to auto-detect Android Studio's JBR if `JAVA_HOME` is not set:
   ```batch
   @rem Find java.exe
   if not defined JAVA_HOME if exist "C:\Program Files\Android\Android Studio\jbr\bin\java.exe" set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
   ```
   This means the build will succeed even in a fresh terminal where `JAVA_HOME` hasn't been exported.

3. **`gradle.properties` pinning** — Added to [`frontend/android/gradle.properties`](file:///d:/lab/projects/NutriSync-AI/frontend/android/gradle.properties):
   ```properties
   org.gradle.java.home=C:\\Program Files\\Android\\Android Studio\\jbr
   ```
   This tells the Gradle daemon itself which JDK to use, independent of the shell environment.

---

### 4.2 Gradle DNS / Network Failures (`dl.google.com` unreachable)

**Symptom**: After fixing JAVA_HOME, Gradle started but failed to resolve Maven dependencies:
```
Could not resolve com.android.tools.build:gradle:8.x.x
> Could not resolve dl.google.com
```

**Root Cause**: The local Wi-Fi router was blocking outbound UDP port 53 to static DNS servers (like `8.8.8.8`). Gradle's JVM could not resolve `dl.google.com` or `maven.google.com`.

**Fix (three layers)**:

#### A. Force IPv4 Stack

Added to [`frontend/android/gradle.properties`](file:///d:/lab/projects/NutriSync-AI/frontend/android/gradle.properties):
```properties
# Prefer IPv4 stack to prevent dl.google.com DNS/network resolution failures
systemProp.java.net.preferIPv4Stack=true
org.gradle.internal.http.connectionTimeout=60000
org.gradle.internal.http.socketTimeout=60000
```

#### B. Add Google Maven Mirror to Root Gradle Files

Added `maven { url 'https://maven.aliyun.com/repository/google' }` as the **first** repository entry (before `google()`) in both:

- [`frontend/android/settings.gradle`](file:///d:/lab/projects/NutriSync-AI/frontend/android/settings.gradle) — `pluginManagement.repositories`
- [`frontend/android/build.gradle`](file:///d:/lab/projects/NutriSync-AI/frontend/android/build.gradle) — `buildscript.repositories` and `allprojects.repositories`

#### C. Patch Composite Build Repositories (Critical!)

> [!IMPORTANT]
> Expo and React Native use **Gradle composite builds** (`includeBuild()`) for their plugins. These composite builds have their **own** `settings.gradle.kts` and `build.gradle.kts` files with independently declared repositories. Adding a mirror to your root `settings.gradle` does **NOT** propagate to composite builds.

The following files inside `node_modules` were patched to add the mirror. **These patches will be lost on `npm install`** — see the persistence note below.

**Expo Dev Launcher** (`node_modules/expo-dev-launcher/expo-dev-launcher-gradle-plugin/`):
- [`build.gradle.kts`](file:///d:/lab/projects/NutriSync-AI/frontend/node_modules/expo-dev-launcher/expo-dev-launcher-gradle-plugin/build.gradle.kts) — added mirror to `repositories`

**Expo Modules Core** (`node_modules/expo-modules-core/expo-module-gradle-plugin/`):
- [`build.gradle.kts`](file:///d:/lab/projects/NutriSync-AI/frontend/node_modules/expo-modules-core/expo-module-gradle-plugin/build.gradle.kts) — added mirror to `repositories`

**Expo Modules Autolinking** (`node_modules/expo-modules-autolinking/android/expo-gradle-plugin/`):
- [`settings.gradle.kts`](file:///d:/lab/projects/NutriSync-AI/frontend/node_modules/expo-modules-autolinking/android/expo-gradle-plugin/settings.gradle.kts) — added mirror to `pluginManagement.repositories`
- [`expo-autolinking-settings-plugin/build.gradle.kts`](file:///d:/lab/projects/NutriSync-AI/frontend/node_modules/expo-modules-autolinking/android/expo-gradle-plugin/expo-autolinking-settings-plugin/build.gradle.kts) — added mirror to `repositories`
- [`expo-autolinking-plugin/build.gradle.kts`](file:///d:/lab/projects/NutriSync-AI/frontend/node_modules/expo-modules-autolinking/android/expo-gradle-plugin/expo-autolinking-plugin/build.gradle.kts) — added mirror to `repositories`

**React Native Gradle Plugin** (`node_modules/@react-native/gradle-plugin/`):
- [`settings.gradle.kts`](file:///d:/lab/projects/NutriSync-AI/frontend/node_modules/@react-native/gradle-plugin/settings.gradle.kts) — added mirror
- [`react-native-gradle-plugin/build.gradle.kts`](file:///d:/lab/projects/NutriSync-AI/frontend/node_modules/@react-native/gradle-plugin/react-native-gradle-plugin/build.gradle.kts) — added mirror
- [`settings-plugin/build.gradle.kts`](file:///d:/lab/projects/NutriSync-AI/frontend/node_modules/@react-native/gradle-plugin/settings-plugin/build.gradle.kts) — added mirror

> [!WARNING]
> **Persistence after `npm install`**: These `node_modules` patches are overwritten every time you run `npm install`. If your network still has DNS issues, you need to re-apply them. Consider creating a `postinstall` script in `package.json` to automate this, or use `patch-package`:
> ```bash
> npx patch-package expo-modules-autolinking @react-native/gradle-plugin
> ```

---

### 4.3 Summary of All Modified Files

| File | Change |
| :--- | :--- |
| [`gradlew.bat`](file:///d:/lab/projects/NutriSync-AI/frontend/android/gradlew.bat) | Auto-detect Android Studio JBR as JAVA_HOME fallback |
| [`gradle.properties`](file:///d:/lab/projects/NutriSync-AI/frontend/android/gradle.properties) | Pinned `org.gradle.java.home`, enabled IPv4 stack, increased timeouts |
| [`settings.gradle`](file:///d:/lab/projects/NutriSync-AI/frontend/android/settings.gradle) | Added Aliyun Google Maven mirror to `pluginManagement.repositories` |
| [`build.gradle`](file:///d:/lab/projects/NutriSync-AI/frontend/android/build.gradle) | Added mirror to `buildscript.repositories` and `allprojects.repositories` |
| 8× `node_modules` `.gradle.kts` files | Added mirror to composite build repositories (see §4.2C) |

---

## 5. How Biometrics Are Mapped into NutriSync

When you tap **"Sync Live Data Now"** in NutriSync Settings:

| Health Connect Record | NutriSync Metric | Protocol Impact |
| :--- | :--- | :--- |
| **`SleepSessionRecord`** *(Stage 5 / Stage 3 NREM)* | **Deep Sleep (min)** | If < 60 min, increases evening Glycine/Apigenin and schedules GABA-ergic recovery. |
| **`HeartRateVariabilityRmssdRecord`** | **HRV RMSSD (ms)** | Drop >10% below baseline triggers parasympathetic recovery stack (Ashwagandha, L-Theanine, Magnesium). |
| **`RestingHeartRateRecord`** | **Resting HR (BPM)** | Elevated RHR combined with low HRV signals sympathetic dominance / acute stress. |
| **`ExerciseSessionRecord`** | **Daily Strain (0–21)** | Workouts exceeding strain ceiling trigger post-workout phosphocreatine replenishment. |
| **`StepsRecord`** | **Daily Steps** | Calibrates daily energy expenditure baseline. |

### 14-Day Rolling History & Baselines
- Upon initial synchronization, NutriSync queries 14 consecutive 24-hour windows.
- The 7 days prior to today form your **personal rolling baseline**.
- Today's metrics are compared against this 7-day baseline to compute your **Readiness Score (0–100)** and state (*Optimal*, *Recovery Needed*, or *Acute Stress*).

---

## 6. Intelligent Metric Fallback

If your wearable device only tracks a subset of metrics (for instance, Steps and Heart Rate, but not HRV RMSSD):
- NutriSync uses your established rolling baseline or population targets for missing values.
- A status badge in protocol insights informs you which values are live vs. baseline-projected.

---

## 7. Known Devices Tested

| Device | Identifier | Type |
| :--- | :--- | :--- |
| Physical Phone | `9adaee04` | USB-connected Android device |
| Android Emulator | `emulator-5554` | Local AVD |
