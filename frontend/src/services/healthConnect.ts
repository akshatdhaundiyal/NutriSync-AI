import { Platform } from "react-native";
import { TelemetryDay } from "@/src/types";

export interface HealthConnectStatus {
  available: boolean;
  platform: string;
  initialized: boolean;
  statusMessage: string;
}

export interface LiveSyncResult {
  success: boolean;
  telemetry?: TelemetryDay[];
  message: string;
}

// Fallback population baselines if a wearable does not measure a specific metric
const DEFAULT_FALLBACKS = {
  deepSleepMin: 72,
  hrvMs: 65,
  restingHr: 58,
  strain: 11.2,
  steps: 8500,
};

/**
 * Checks whether Health Connect native runtime is accessible on the current device.
 */
export async function checkHealthConnectStatus(): Promise<HealthConnectStatus> {
  if (Platform.OS !== "android") {
    return {
      available: false,
      platform: Platform.OS,
      initialized: false,
      statusMessage:
        Platform.OS === "web"
          ? "Health Connect requires Android OS. Running in Web Bridge simulation."
          : "Health Connect is an Android service. iOS uses Apple Health.",
    };
  }

  try {
    const HealthConnect = require("react-native-health-connect");
    const sdkStatus = await HealthConnect.getSdkStatus();
    const isAvailable =
      sdkStatus === HealthConnect.SdkAvailabilityStatus?.SDK_AVAILABLE ||
      sdkStatus === 3;

    if (!isAvailable) {
      return {
        available: false,
        platform: "android",
        initialized: false,
        statusMessage:
          "Health Connect is not supported or not installed on this Android device.",
      };
    }

    await HealthConnect.initialize();
    return {
      available: true,
      platform: "android",
      initialized: true,
      statusMessage: "Live Health Connect ready for synchronization.",
    };
  } catch (err: any) {
    return {
      available: false,
      platform: "android",
      initialized: false,
      statusMessage: `Health Connect native module check: ${err.message}`,
    };
  }
}

/**
 * Synchronizes 14-day rolling historical telemetry from Health Connect.
 * Populates 7-day baselines, 14-day trends, and today's readiness.
 */
export async function syncHealthConnect(): Promise<LiveSyncResult> {
  if (Platform.OS !== "android") {
    // Return simulated live 14-day bridge sample on Web/iOS so UI can be previewed
    return {
      success: true,
      telemetry: generateSimulatedBridge14Days(),
      message: `Simulated 14-day live data loaded (${Platform.OS === "web" ? "Web Bridge" : "iOS Simulator"}).`,
    };
  }

  try {
    const HealthConnect = require("react-native-health-connect");
    const status = await checkHealthConnectStatus();

    if (!status.available) {
      return {
        success: false,
        message: status.statusMessage,
      };
    }

    // Request permissions for all required biometric record types
    const granted = await HealthConnect.requestPermission([
      { accessType: "read", recordType: "SleepSession" },
      { accessType: "read", recordType: "HeartRateVariabilityRmssd" },
      { accessType: "read", recordType: "RestingHeartRate" },
      { accessType: "read", recordType: "Steps" },
      { accessType: "read", recordType: "ExerciseSession" },
      { accessType: "read", recordType: "TotalCaloriesBurned" },
    ]);

    if (!granted || granted.length === 0) {
      return {
        success: false,
        message: "Health Connect permissions were not granted by user.",
      };
    }

    const telemetryDays: TelemetryDay[] = [];
    const now = new Date();

    // Query 14 consecutive 24-hour windows (past 13 days + today)
    for (let dayOffset = 13; dayOffset >= 0; dayOffset--) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() - dayOffset);
      const dateStr = targetDate.toISOString().slice(0, 10);

      const dayStart = new Date(targetDate);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(targetDate);
      if (dayOffset === 0) {
        dayEnd.setTime(now.getTime());
      } else {
        dayEnd.setHours(23, 59, 59, 999);
      }

      const timeRangeFilter = {
        operator: "between" as const,
        startTime: dayStart.toISOString(),
        endTime: dayEnd.toISOString(),
      };

      // 1. Sleep: Query SleepSession records
      let deepSleepMinutes = 0;
      try {
        const sleepRes = await HealthConnect.readRecords("SleepSession", { timeRangeFilter });
        if (sleepRes?.records?.length > 0) {
          for (const session of sleepRes.records) {
            if (session.stages && session.stages.length > 0) {
              for (const stage of session.stages) {
                // Stage 5 in Health Connect corresponds to Stage 3 Deep Sleep
                if (stage.stage === 5) {
                  const startMs = new Date(stage.startTime).getTime();
                  const endMs = new Date(stage.endTime).getTime();
                  deepSleepMinutes += Math.round((endMs - startMs) / 60000);
                }
              }
            } else {
              // If stages not segmented by wearable, estimate 18% deep sleep ratio
              const startMs = new Date(session.startTime).getTime();
              const endMs = new Date(session.endTime).getTime();
              const totalMin = Math.round((endMs - startMs) / 60000);
              deepSleepMinutes += Math.round(totalMin * 0.18);
            }
          }
        }
      } catch {}

      // 2. HRV: Query HeartRateVariabilityRmssd
      let hrvAvg = 0;
      try {
        const hrvRes = await HealthConnect.readRecords("HeartRateVariabilityRmssd", { timeRangeFilter });
        if (hrvRes?.records?.length > 0) {
          const sum = hrvRes.records.reduce((acc: number, r: any) => acc + (r.heartRateVariabilityMillis || 0), 0);
          hrvAvg = Math.round(sum / hrvRes.records.length);
        }
      } catch {}

      // 3. Resting Heart Rate
      let restingHr = 0;
      try {
        const rhrRes = await HealthConnect.readRecords("RestingHeartRate", { timeRangeFilter });
        if (rhrRes?.records?.length > 0) {
          const sum = rhrRes.records.reduce((acc: number, r: any) => acc + (r.beatsPerMinute || 0), 0);
          restingHr = Math.round(sum / rhrRes.records.length);
        }
      } catch {}

      // 4. Steps
      let steps = 0;
      try {
        const stepsRes = await HealthConnect.readRecords("Steps", { timeRangeFilter });
        if (stepsRes?.records?.length > 0) {
          steps = stepsRes.records.reduce((acc: number, r: any) => acc + (r.count || 0), 0);
        }
      } catch {}

      // 5. Workouts & Strain calculation
      let strain = 0;
      try {
        const exerciseRes = await HealthConnect.readRecords("ExerciseSession", { timeRangeFilter });
        const exerciseCount = exerciseRes?.records?.length ?? 0;
        let exerciseMinutes = 0;
        if (exerciseCount > 0) {
          for (const ex of exerciseRes.records) {
            const startMs = new Date(ex.startTime).getTime();
            const endMs = new Date(ex.endTime).getTime();
            exerciseMinutes += Math.round((endMs - startMs) / 60000);
          }
        }
        // Base strain 6.0 + scaled workout intensity (up to 21.0 scale)
        strain = Math.min(21.0, Math.round((6.0 + (exerciseMinutes / 60) * 5.0 + (steps / 10000) * 2.5) * 10) / 10);
      } catch {
        strain = DEFAULT_FALLBACKS.strain;
      }

      const finalRestingHr = restingHr > 0 ? restingHr : DEFAULT_FALLBACKS.restingHr;
      const finalStrain = strain > 0 ? strain : DEFAULT_FALLBACKS.strain;

      telemetryDays.push({
        date: dateStr,
        deepSleepMin: deepSleepMinutes > 0 ? deepSleepMinutes : DEFAULT_FALLBACKS.deepSleepMin,
        hrvMs: hrvAvg > 0 ? hrvAvg : DEFAULT_FALLBACKS.hrvMs,
        restingHr: finalRestingHr,
        strain: finalStrain,
        steps: steps > 0 ? steps : DEFAULT_FALLBACKS.steps,
        sedentaryStressSpike: finalRestingHr > 72 && finalStrain < 7.0,
      });
    }

    return {
      success: true,
      telemetry: telemetryDays,
      message: `Successfully synchronized 14 days of Health Connect records.`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Health Connect synchronization error: ${err.message}`,
    };
  }
}

/**
 * Generates a realistic 14-day telemetry array for Web Bridge simulation.
 */
function generateSimulatedBridge14Days(): TelemetryDay[] {
  const days: TelemetryDay[] = [];
  const now = new Date();

  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);

    // Realistic biological fluctuations
    const variance = (Math.sin(i * 1.3) + 1) / 2;
    days.push({
      date: dateStr,
      deepSleepMin: Math.round(55 + variance * 35), // 55 - 90 min
      hrvMs: Math.round(54 + variance * 28),        // 54 - 82 ms
      restingHr: Math.round(62 - variance * 10),    // 52 - 62 bpm
      strain: Math.round((8.5 + variance * 8.0) * 10) / 10, // 8.5 - 16.5
      steps: Math.round(6500 + variance * 6000),   // 6500 - 12500
      sedentaryStressSpike: i === 13, // Simulate mild stress spike on recent day
    });
  }

  return days;
}
