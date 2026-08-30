import { COMPOUNDS, canonicalize } from "@/src/data/compounds";
import { buyOptions } from "@/src/services/procurement";
import {
  Baselines,
  DoseUnit,
  Protocol,
  ProtocolItem,
  Readiness,
  Recommendation,
  RecommendationSet,
  Region,
  Slot,
  StashItem,
  TelemetryDay,
  UnitType,
} from "@/src/types";

const SLOT_ORDER: Record<Slot, number> = {
  morning: 0,
  post_workout: 1,
  evening: 2,
};

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function pluralUnit(unit: UnitType, n: number): string {
  if (n === 1) return unit;
  if (unit === "gummy") return "gummies";
  return `${unit}s`;
}

function doseUnitLabel(u: DoseUnit): string {
  if (u === "IU") return " IU";
  if (u === "serving") return " serving";
  return u;
}

// ---- Local deterministic protocol engine (Offline Mock) ----

export function mockRecommendations(ctx: {
  today: TelemetryDay;
  readiness: Readiness;
}): RecommendationSet {
  const { today, readiness } = ctx;

  if (readiness.state === "optimal") {
    return {
      zeroPill: true,
      wholeFoodNote:
        "HRV, deep sleep and strain are all at or above baseline. No pills needed today — anchor recovery with whole foods, sunlight and hydration.",
      recommendations: [],
    };
  }

  const highStrain = today.strain >= 12;
  const lowHrv = readiness.hrvDelta <= -6;
  const lowSleep = readiness.deepSleepDelta <= -8;
  const stress = readiness.state === "stress";

  // Build a prioritized candidate list, then dedupe + cap at 3 (guardrail).
  const candidates: { canonical: string; priority: number; rationale: string }[] =
    [];
  const push = (canonical: string, priority: number, rationale: string) =>
    candidates.push({ canonical, priority, rationale });

  if (stress) {
    push(
      "magnesium",
      100,
      "Sympathetic spike detected — magnesium glycinate blunts cortisol and eases the nervous system into parasympathetic tone.",
    );
    push(
      "l-theanine",
      95,
      "Raises alpha brain waves to calm an acute stress response without sedation.",
    );
    push(
      "ashwagandha",
      80,
      "KSM-66 lowers evening cortisol after a high-stress day.",
    );
  }
  if (lowSleep) {
    push(
      "magnesium",
      92,
      "Deep sleep is below your 7-day baseline — magnesium supports GABA and slow-wave sleep.",
    );
    push(
      "glycine",
      78,
      "3g glycine pre-bed lowers core temperature and deepens slow-wave sleep.",
    );
    push(
      "apigenin",
      70,
      "Binds GABA-A receptors to shorten sleep latency after a poor night.",
    );
  }
  if (lowHrv) {
    push(
      "magnesium",
      88,
      "Suppressed HRV signals autonomic load — magnesium restores vagal tone.",
    );
    push(
      "omega3",
      74,
      "EPA/DHA raises HRV and dampens systemic inflammation.",
    );
  }
  if (highStrain) {
    push(
      "creatine",
      85,
      "Heavy training load — 5g creatine replenishes phosphocreatine and speeds recovery.",
    );
    push(
      "electrolytes",
      72,
      "Replace sodium, potassium and magnesium lost through heavy sweat.",
    );
    push(
      "omega3",
      68,
      "Blunts exercise-induced inflammation after a high-strain session.",
    );
  }

  // Always keep a foundational morning anchor if room remains.
  push("vitamin-d3", 40, "Foundational immune and hormonal support with breakfast fats.");

  // Dedupe by canonical keeping the highest priority + its rationale.
  const byCanonical = new Map<string, { priority: number; rationale: string }>();
  for (const c of candidates) {
    const existing = byCanonical.get(c.canonical);
    if (!existing || c.priority > existing.priority) {
      byCanonical.set(c.canonical, { priority: c.priority, rationale: c.rationale });
    }
  }

  const ranked = [...byCanonical.entries()]
    .sort((a, b) => b[1].priority - a[1].priority)
    .slice(0, 3); // hard cap: <= 3 active supplements per day

  const recommendations: Recommendation[] = ranked.map(([canonical, meta]) => {
    const lib = COMPOUNDS[canonical];
    return {
      compound: lib?.label ?? canonical,
      canonical,
      chemicalForm: lib?.defaultForm,
      targetDose: lib?.defaultTarget,
      doseUnit: lib?.doseUnit,
      slot: lib?.slot,
      rationale: meta.rationale,
      window: lib?.window,
      foodAlternatives: lib?.foods,
    };
  });

  return { zeroPill: false, recommendations };
}

// ---- Resolve recommendations against the user's actual cabinet ----

export function buildProtocol(
  recSet: RecommendationSet,
  ctx: {
    stash: StashItem[];
    region: Region;
    readiness: Readiness;
    baselines: Baselines;
    date: string;
    generatedBy: string;
  },
): Protocol {
  const { stash, region, readiness, date, generatedBy } = ctx;

  const capped = recSet.recommendations.slice(0, 3); // enforce guardrail regardless of source

  const items: ProtocolItem[] = capped.map((rec, idx) => {
    const canonical = rec.canonical || canonicalize(rec.compound);
    const lib = COMPOUNDS[canonical];
    const label = lib?.label ?? rec.compound;
    const slot: Slot = (rec.slot as Slot) || lib?.slot || "morning";
    const doseUnit: DoseUnit = (rec.doseUnit as DoseUnit) || lib?.doseUnit || "mg";
    const targetDose = rec.targetDose ?? lib?.defaultTarget ?? 0;
    const chemicalForm = rec.chemicalForm || lib?.defaultForm || "Standard";
    const window = rec.window || lib?.window || "As directed";
    const foodAlternatives =
      rec.foodAlternatives && rec.foodAlternatives.length
        ? rec.foodAlternatives
        : lib?.foods ?? [];
    const rationale = rec.rationale || "Supports today's recovery target.";

    const match = stash
      .filter((s) => !s.deletedAt && s.canonical === canonical && s.stockUnits > 0)
      .sort((a, b) => qualityRank(b.quality) - qualityRank(a.quality))[0];

    const base: ProtocolItem = {
      id: `${date}-${canonical}-${idx}`,
      compound: label,
      canonical,
      chemicalForm,
      slot,
      targetDose,
      doseUnit,
      rationale,
      window,
      foodAlternatives,
      inStash: false,
      doseText: "",
    };

    if (match) {
      const units = clamp(Math.round(targetDose / match.dosePerUnit), 1, 6);
      return {
        ...base,
        inStash: true,
        matchedStashId: match.id,
        brand: match.brand,
        unitsToTake: units,
        unit: match.unit,
        quality: match.quality,
        chemicalForm: match.chemicalForm,
        doseText: `Take ${units} ${pluralUnit(match.unit, units)} of your ${match.brand} ${match.name}`,
      };
    }

    return {
      ...base,
      inStash: false,
      matchedStashId: null,
      doseText: `Add ~${targetDose}${doseUnitLabel(doseUnit)} ${label}`,
      buyOptions: buyOptions(label, chemicalForm, region),
    };
  });

  items.sort((a, b) => SLOT_ORDER[a.slot] - SLOT_ORDER[b.slot]);

  return {
    date,
    generatedBy,
    readiness,
    items: recSet.zeroPill ? [] : items,
    zeroPill: recSet.zeroPill,
    wholeFoodNote: recSet.wholeFoodNote,
  };
}

function qualityRank(q: string): number {
  if (q === "optimal") return 3;
  if (q === "good") return 2;
  return 1;
}
