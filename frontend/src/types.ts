export type Region = "US" | "IN" | "UK" | "EU" | "GLOBAL";

export type AIProvider =
  | "mock"
  | "gemini-direct"
  | "openai-direct"
  | "emergent-gpt"
  | "emergent-gemini";

export type ThemeMode = "dark" | "light" | "system";

export type Slot = "morning" | "post_workout" | "evening";

export type ProtocolMode = "auto" | "travel" | "illness" | "deload";

export type QualityTier = "optimal" | "good" | "low";

export type DoseUnit = "mg" | "mcg" | "g" | "IU" | "serving";

export type UnitType = "capsule" | "softgel" | "tablet" | "scoop" | "gummy";

export interface StashItem {
  id: string;
  brand: string;
  name: string; // e.g. "Magnesium Glycinate"
  canonical: string; // e.g. "magnesium"
  chemicalForm: string; // e.g. "Glycinate"
  dosePerUnit: number; // elemental dose per unit
  doseUnit: DoseUnit;
  unit: UnitType;
  unitsPerContainer: number;
  stockUnits: number;
  quality: QualityTier;
  createdAt: string;
  deletedAt?: string | null;
}

export interface TelemetryDay {
  date: string; // YYYY-MM-DD
  deepSleepMin: number;
  hrvMs: number;
  restingHr: number;
  strain: number; // 0-21
  steps: number;
  sedentaryStressSpike: boolean;
  intake?: boolean; // protocol taken that day (for correlation markers)
}

export interface Baselines {
  deepSleepMin: number;
  hrvMs: number;
  restingHr: number;
  strain: number;
  days: number;
}

export type ReadinessState = "optimal" | "balanced" | "recovery" | "stress";

export interface Readiness {
  score: number; // 0-100
  deepSleepDelta: number; // % vs baseline
  hrvDelta: number; // % vs baseline
  strainDelta: number;
  strain: number;
  state: ReadinessState;
}

export interface Recommendation {
  compound: string;
  canonical?: string;
  chemicalForm?: string;
  targetDose?: number;
  doseUnit?: DoseUnit;
  slot?: Slot;
  rationale?: string;
  window?: string;
  foodAlternatives?: string[];
  tag?: string;
}

export interface RecommendationSet {
  zeroPill: boolean;
  wholeFoodNote?: string;
  recommendations: Recommendation[];
}

export interface BuyOption {
  merchant: string;
  url: string;
}

export interface ProtocolItem {
  id: string;
  compound: string;
  canonical: string;
  chemicalForm: string;
  slot: Slot;
  targetDose: number;
  doseUnit: DoseUnit;
  rationale: string;
  window: string;
  foodAlternatives: string[];
  inStash: boolean;
  matchedStashId?: string | null;
  brand?: string | null;
  unitsToTake?: number | null;
  unit?: UnitType | null;
  quality?: QualityTier | null;
  doseText: string;
  buyOptions?: BuyOption[];
  tag?: string; // e.g. "lab" | "travel" — provenance of the recommendation
}

export interface BloodMarker {
  name: string;
  canonical: string;
  value: number;
  unit: string;
  status: "low" | "normal" | "high";
}

export interface Guardrail {
  type: "interaction" | "ceiling";
  severity: "warn" | "danger";
  message: string;
}

export interface Protocol {
  date: string;
  generatedBy: string;
  readiness: Readiness;
  items: ProtocolItem[];
  zeroPill: boolean;
  wholeFoodNote?: string;
}

export interface IntakeLog {
  id: string; // `${date}:${slot}:${canonical}`
  date: string;
  slot: Slot;
  canonical: string;
  taken: boolean;
  at?: string | null;
}

export interface Permissions {
  sleep: boolean;
  hrv: boolean;
  workouts: boolean;
}

export interface BiometricThresholds {
  targetHrvMs: number;
  minDeepSleepMin: number;
  maxStrain: number;
}

export type TelemetrySource = "mock" | "health_connect";

export interface Settings {
  themeMode: ThemeMode;
  region: Region;
  aiProvider: AIProvider;
  telemetrySource?: TelemetrySource;
  permissions: Permissions;
  activePreset: string;
  mode: ProtocolMode;
  thresholds?: BiometricThresholds;
}

export interface ExtractedLabel {
  brand: string;
  name: string;
  canonical: string;
  chemicalForm: string;
  dosePerUnit: number;
  doseUnit: DoseUnit;
  unit: UnitType;
  unitsPerContainer: number;
  quality: QualityTier;
  source: string;
}
