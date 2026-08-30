# NutriSync AI — Android Health Connect guide

This is the current procedure for installing NutriSync AI on a physical Android device and connecting it to Health Connect. The app uses `react-native-health-connect` v4.1.3 and must run in a native development build; **Expo Go cannot load this native module**.

## What you need

- An Android phone running Android 9 (API 28) or newer, with Google Play services. Health Connect cannot run in a work profile.
- A screen lock (PIN, pattern, or password). Health Connect requires one.
- USB debugging enabled, a USB cable, and Android Platform Tools (`adb`) on the computer.
- Android Studio's JDK and Android SDK installed for a local build. NutriSync compiles and targets API 36.
- Node dependencies installed in `frontend` (`npm ci` when a clean install is required).

Health Connect is part of Android Settings on Android 14 and later. On Android 13 and earlier, install the **Health Connect** app from Google Play first. The device used for this project is Android 16, so it already has the system Health Connect provider.

## Health Connect configuration in this project

- The Expo config plugin is `react-native-health-connect`. Version 4 includes the Expo plugin; do **not** install the deprecated `expo-health-connect` package alongside it.
- The app requests only the record types it syncs: sleep, HRV, resting heart rate, steps, exercise sessions, and total calories.
- The generated manifest includes the required Android 13-and-lower permission-rationale intent and Android 14+ `ViewPermissionUsageActivity` alias. Regenerate native files with `npx expo prebuild --platform android` after changing `app.json`; do not manually duplicate these entries.
- Health Connect permissions can change at any time. NutriSync checks availability and requests them when **Sync Live Data Now** is used.
- The app reads the last 14 days. It does not need the optional `READ_HEALTH_DATA_HISTORY` permission, which is only needed to access records older than 30 days before the first grant.
- The dashboard identifies the current data source and labels each displayed metric as **live**, **estimated**, or **simulated**. A live label means NutriSync read a matching Health Connect record; an estimated label means the metric was derived or fell back because no matching record was available.
- Steps use Health Connect's duplicate-aware aggregate rather than a sum of raw records. This is important when Samsung Health, Google Fit, a watch, and/or the phone all contribute overlapping step records.

Before distributing through Google Play, declare Health Connect data access in Play Console and make the in-app Health Connect privacy-policy destination describe the data use accurately. The required manifest intent is already present, but policy content and Play declarations remain release work.

## Run on a USB-connected phone

1. On the phone, enable **Developer options** and **USB debugging**, connect it, then approve the RSA debugging prompt.

2. Verify the connection from the repository root:

   ```powershell
   adb devices
   ```

   The device must appear with the state `device`, not `unauthorized`.

3. Build, install, and launch the native development app:

   ```powershell
   cd frontend
   npx expo run:android --device
   ```

   Choose the phone if Expo asks. This installs a debug development build and starts Metro. Keep the terminal open while developing.

4. For subsequent JavaScript-only changes, start the development server instead:

   ```powershell
   cd frontend
   npx expo start --dev-client
   ```

   Open the installed **NutriSync AI** app on the phone and connect it to Metro. If USB networking does not connect automatically, use:

   ```powershell
   adb reverse tcp:8081 tcp:8081
   ```

5. Any change to `app.json`, a native dependency, or Android permissions requires another `npx expo run:android --device` build/install.

## Connect and test Health Connect

1. On the phone, open NutriSync AI, go to **Settings**, choose **Live Health Connect**, then tap **Sync Live Data Now**.
2. Approve only the requested Health Connect categories in the system permission screen. You can later review or revoke them in Android Settings > Security & privacy > Privacy > Health Connect > App permissions.
3. If Health Connect reports no data, add a compatible data source such as a wearable/fitness app, or use the official **Health Connect Toolbox** to insert test records. Use test data rather than treating NutriSync's fallback values as live readings.
4. Confirm that the dashboard says **Live Health Connect**, shows the live-measurement count and sync time, and marks individual metrics as `live` or `estimated`.

### Step totals and source selection

NutriSync defaults to **Combined Health Connect total**. This uses Health Connect's aggregate for each daily window, which is the correct default for a total: Health Connect resolves overlapping records rather than adding Samsung Health and Google Fit entries together.

After the first live sync, Settings > Live Health Connect > **Step Count Source** lists the package IDs that contributed step data, using familiar labels where possible:

- **Samsung Health** (`com.sec.android.app.shealth`)
- **Google Fit** (`com.google.android.apps.fitness`)
- **This phone**, when Android's on-device step source is present

Choose a listed source to lock NutriSync to records written by that source only. The app re-syncs the 14-day window immediately. Use this only when you deliberately want one source; it may omit legitimate steps recorded elsewhere. Select **Combined Health Connect total** to return to the duplicate-aware total.

On-device step attribution changed in June 2026: Android may report phone steps using a device-specific synthetic package name. NutriSync obtains origins from Health Connect at sync time and does not hard-code that identifier.

### Assessment and LLM protocol flow

Health Connect does not send data directly to an LLM. NutriSync first calculates a local 7-day baseline and readiness state from the synced telemetry. If an LLM provider is selected, it receives the summarized current metrics, baseline, readiness, cabinet, mode, region, and lab deficiencies to generate a supplement protocol. The local protocol builder then applies the hard limit of three active supplements and falls back to the deterministic offline engine if the LLM request fails.

This is a wellness protocol recommendation feature, not a medical diagnosis. Estimated metrics are deliberately visible so they are not mistaken for a measured signal.

## Troubleshooting

| Symptom | Resolution |
| --- | --- |
| `unauthorized` in `adb devices` | Unlock the phone and accept the RSA USB-debugging prompt; then run `adb devices` again. |
| Health Connect unavailable | Ensure the device is Android 9+ with Google Play services. On Android 13 or lower, install/update the Health Connect app; on Android 14+, update the device's system components. |
| Native module missing | Do not use Expo Go. Rebuild and install with `npx expo run:android --device`. |
| Permission prompt does not appear | Verify the native app was rebuilt after permission changes, then review the app in Health Connect's App permissions. Avoid repeatedly denying the same permission: Health Connect can stop showing its prompt after repeated denials. |
| Steps seem too high | Keep **Combined Health Connect total** selected; it uses Health Connect aggregation to resolve duplicates. If you intentionally need one writer only, choose that source under **Step Count Source** and sync again. |
| A step source is missing | Run **Sync Live Data Now** first. Only sources that contribute records to the synced 14-day window are listed. |
| Metro cannot reach the phone | Keep the phone connected by USB and run `adb reverse tcp:8081 tcp:8081`, then restart Metro with `npx expo start --dev-client --clear`. |
| No historical data | NutriSync only asks for the last 14 days. Health Connect normally limits third-party data to 30 days before the first grant; access older data needs the separate history permission and a user grant. |

## Release note

The debug build is suitable for development only. A production Play release needs its own signing configuration, a current privacy policy, and the Health Connect declarations in Play Console. Do not ship the checked-in debug signing key.
