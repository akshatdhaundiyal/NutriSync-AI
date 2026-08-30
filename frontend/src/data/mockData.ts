import { StashItem, TelemetryDay } from "@/src/types";

function dayISO(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

// Deterministic pseudo-noise so charts look organic but stable across renders.
function noise(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x); // 0..1
}

export interface Preset {
  id: string;
  label: string;
  subtitle: string;
  icon: string;
}

export const PRESETS: Preset[] = [
  {
    id: "heavy_leg_day",
    label: "Heavy Leg Day + Strained HRV",
    subtitle: "High strain, suppressed HRV",
    icon: "barbell",
  },
  {
    id: "rest_balanced",
    label: "Rest Day + Balanced Baseline",
    subtitle: "Recovered, whole-food focus",
    icon: "leaf",
  },
  {
    id: "acute_stress",
    label: "Acute Stress Event + Low Deep Sleep",
    subtitle: "Sympathetic spike, poor sleep",
    icon: "pulse",
  },
];

// Builds 14 days of telemetry. Older days form the rolling baseline;
// the last entry (index 13 / today) reflects the chosen scenario.
export function buildTelemetry(presetId: string): TelemetryDay[] {
  const days: TelemetryDay[] = [];
  for (let i = 13; i >= 0; i--) {
    const n = noise(i + 1);
    const n2 = noise(i + 50);
    const intake = i % 2 === 0; // alternating protocol adherence for correlation
    const sleepBoost = intake ? 12 : 0;
    days.push({
      date: dayISO(i),
      deepSleepMin: Math.round(84 + sleepBoost + n * 22),
      hrvMs: Math.round(56 + (intake ? 6 : 0) + n2 * 14),
      restingHr: Math.round(52 + n * 6),
      strain: Math.round(6 + n2 * 8),
      steps: Math.round(6500 + n * 5500),
      sedentaryStressSpike: false,
      intake,
    });
  }

  const today = days[days.length - 1];
  if (presetId === "heavy_leg_day") {
    today.deepSleepMin = 74;
    today.hrvMs = 41;
    today.restingHr = 61;
    today.strain = 16;
    today.steps = 14200;
    today.sedentaryStressSpike = false;
  } else if (presetId === "rest_balanced") {
    today.deepSleepMin = 118;
    today.hrvMs = 78;
    today.restingHr = 48;
    today.strain = 5;
    today.steps = 5200;
    today.sedentaryStressSpike = false;
  } else if (presetId === "acute_stress") {
    today.deepSleepMin = 58;
    today.hrvMs = 38;
    today.restingHr = 64;
    today.strain = 9;
    today.steps = 3100;
    today.sedentaryStressSpike = true;
  }
  return days;
}

export const DEFAULT_STASH: StashItem[] = [
  {
    id: "seed-magnesium",
    brand: "Doctor's Best",
    name: "High Absorption Magnesium",
    canonical: "magnesium",
    chemicalForm: "Glycinate/Lysinate Chelate",
    dosePerUnit: 100,
    doseUnit: "mg",
    unit: "tablet",
    unitsPerContainer: 240,
    stockUnits: 168,
    quality: "optimal",
    createdAt: new Date().toISOString(),
    deletedAt: null,
  },
  {
    id: "seed-d3",
    brand: "Thorne",
    name: "Vitamin D/K2 Liquid",
    canonical: "vitamin-d3",
    chemicalForm: "D3 + K2 (MK-4)",
    dosePerUnit: 1000,
    doseUnit: "IU",
    unit: "softgel",
    unitsPerContainer: 60,
    stockUnits: 44,
    quality: "optimal",
    createdAt: new Date().toISOString(),
    deletedAt: null,
  },
  {
    id: "seed-omega",
    brand: "Nordic Naturals",
    name: "Ultimate Omega",
    canonical: "omega3",
    chemicalForm: "Triglyceride",
    dosePerUnit: 640,
    doseUnit: "mg",
    unit: "softgel",
    unitsPerContainer: 120,
    stockUnits: 72,
    quality: "optimal",
    createdAt: new Date().toISOString(),
    deletedAt: null,
  },
  {
    id: "seed-creatine",
    brand: "Optimum Nutrition",
    name: "Micronized Creatine",
    canonical: "creatine",
    chemicalForm: "Monohydrate",
    dosePerUnit: 5,
    doseUnit: "g",
    unit: "scoop",
    unitsPerContainer: 60,
    stockUnits: 41,
    quality: "optimal",
    createdAt: new Date().toISOString(),
    deletedAt: null,
  },
];

// A rotating set of plausible labels the mock Vision OCR "reads".
export const MOCK_LABELS = [
  {
    brand: "NOW Foods",
    name: "L-Theanine",
    canonical: "l-theanine",
    chemicalForm: "L-Theanine",
    dosePerUnit: 200,
    doseUnit: "mg" as const,
    unit: "capsule" as const,
    unitsPerContainer: 120,
  },
  {
    brand: "Jarrow Formulas",
    name: "Ashwagandha KSM-66",
    canonical: "ashwagandha",
    chemicalForm: "KSM-66 Extract",
    dosePerUnit: 300,
    doseUnit: "mg" as const,
    unit: "capsule" as const,
    unitsPerContainer: 120,
  },
  {
    brand: "Life Extension",
    name: "Zinc",
    canonical: "zinc",
    chemicalForm: "Oxide",
    dosePerUnit: 50,
    doseUnit: "mg" as const,
    unit: "capsule" as const,
    unitsPerContainer: 90,
  },
  {
    brand: "Pure Encapsulations",
    name: "Glycine",
    canonical: "glycine",
    chemicalForm: "Glycine",
    dosePerUnit: 1,
    doseUnit: "g" as const,
    unit: "scoop" as const,
    unitsPerContainer: 100,
  },
];
