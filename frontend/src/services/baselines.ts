import { Baselines, Readiness, ReadinessState, TelemetryDay } from "@/src/types";

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

// 7-day rolling baseline computed from days strictly before `today`.
// Falls back to whatever prior history exists (or today itself if none).
export function computeBaselines(
  telemetry: TelemetryDay[],
  todayDate: string,
): Baselines {
  const prior = telemetry
    .filter((d) => d.date < todayDate)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 7);

  const source = prior.length > 0 ? prior : telemetry.slice(-1);
  const n = source.length || 1;
  const sum = source.reduce(
    (acc, d) => {
      acc.deep += d.deepSleepMin;
      acc.hrv += d.hrvMs;
      acc.rhr += d.restingHr;
      acc.strain += d.strain;
      return acc;
    },
    { deep: 0, hrv: 0, rhr: 0, strain: 0 },
  );

  return {
    deepSleepMin: Math.round(sum.deep / n),
    hrvMs: Math.round(sum.hrv / n),
    restingHr: Math.round(sum.rhr / n),
    strain: Math.round((sum.strain / n) * 10) / 10,
    days: source.length,
  };
}

export function pct(current: number, base: number): number {
  if (!base) return 0;
  return Math.round(((current - base) / base) * 100);
}

export function computeReadiness(
  today: TelemetryDay,
  base: Baselines,
): Readiness {
  const deepSleepDelta = pct(today.deepSleepMin, base.deepSleepMin);
  const hrvDelta = pct(today.hrvMs, base.hrvMs);
  const strainDelta = pct(today.strain, base.strain);

  const hrvComponent = clamp(hrvDelta * 0.65, -22, 22);
  const sleepComponent = clamp(deepSleepDelta * 0.45, -16, 16);
  const strainComponent = clamp(-(today.strain - 8) * 1.6, -18, 6);

  const score = Math.round(
    clamp(72 + hrvComponent + sleepComponent + strainComponent, 3, 99),
  );

  const stress =
    today.sedentaryStressSpike || (hrvDelta <= -25 && deepSleepDelta <= -25);

  let state: ReadinessState;
  if (stress) state = "stress";
  else if (
    score >= 82 &&
    hrvDelta >= -2 &&
    deepSleepDelta >= -5 &&
    today.strain < 10
  )
    state = "optimal";
  else if (score < 66) state = "recovery";
  else state = "balanced";

  return { score, deepSleepDelta, hrvDelta, strainDelta, strain: today.strain, state };
}
