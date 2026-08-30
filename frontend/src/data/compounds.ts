import { DoseUnit, QualityTier, Slot } from "@/src/types";

export interface CompoundDef {
  canonical: string;
  label: string;
  defaultForm: string;
  doseUnit: DoseUnit;
  defaultTarget: number;
  slot: Slot;
  window: string;
  foods: string[];
  keywords: string[];
}

export const COMPOUNDS: Record<string, CompoundDef> = {
  magnesium: {
    canonical: "magnesium",
    label: "Magnesium",
    defaultForm: "Glycinate",
    doseUnit: "mg",
    defaultTarget: 200,
    slot: "evening",
    window: "60–90 min pre-bed",
    foods: ["Pumpkin seeds", "Spinach", "Dark chocolate"],
    keywords: ["magnesium", "mag "],
  },
  creatine: {
    canonical: "creatine",
    label: "Creatine",
    defaultForm: "Monohydrate",
    doseUnit: "g",
    defaultTarget: 5,
    slot: "post_workout",
    window: "Within 45 min post-training",
    foods: ["Red meat", "Herring", "Salmon"],
    keywords: ["creatine"],
  },
  omega3: {
    canonical: "omega3",
    label: "Omega-3 (EPA/DHA)",
    defaultForm: "Triglyceride",
    doseUnit: "mg",
    defaultTarget: 2000,
    slot: "morning",
    window: "With breakfast fats",
    foods: ["Wild salmon", "Sardines", "Walnuts"],
    keywords: ["omega", "fish oil", "epa", "dha"],
  },
  "vitamin-d3": {
    canonical: "vitamin-d3",
    label: "Vitamin D3 + K2",
    defaultForm: "D3 + K2 (MK-7)",
    doseUnit: "IU",
    defaultTarget: 5000,
    slot: "morning",
    window: "With breakfast fats",
    foods: ["Sunlight (15 min)", "Egg yolk", "Fatty fish"],
    keywords: ["vitamin d", "d3", "cholecalciferol", "vit d"],
  },
  "l-theanine": {
    canonical: "l-theanine",
    label: "L-Theanine",
    defaultForm: "L-Theanine",
    doseUnit: "mg",
    defaultTarget: 200,
    slot: "evening",
    window: "Evening wind-down",
    foods: ["Green tea", "Matcha", "Black tea"],
    keywords: ["theanine"],
  },
  ashwagandha: {
    canonical: "ashwagandha",
    label: "Ashwagandha (KSM-66)",
    defaultForm: "KSM-66 Extract",
    doseUnit: "mg",
    defaultTarget: 600,
    slot: "evening",
    window: "Evening, with dinner",
    foods: ["—"],
    keywords: ["ashwagandha", "ksm", "withania"],
  },
  glycine: {
    canonical: "glycine",
    label: "Glycine",
    defaultForm: "Glycine",
    doseUnit: "g",
    defaultTarget: 3,
    slot: "evening",
    window: "30–60 min pre-bed",
    foods: ["Bone broth", "Gelatin", "Skin-on chicken"],
    keywords: ["glycine"],
  },
  zinc: {
    canonical: "zinc",
    label: "Zinc",
    defaultForm: "Bisglycinate",
    doseUnit: "mg",
    defaultTarget: 15,
    slot: "evening",
    window: "Evening, away from calcium",
    foods: ["Oysters", "Beef", "Pumpkin seeds"],
    keywords: ["zinc"],
  },
  "vitamin-c": {
    canonical: "vitamin-c",
    label: "Vitamin C",
    defaultForm: "Ascorbate (buffered)",
    doseUnit: "mg",
    defaultTarget: 500,
    slot: "morning",
    window: "Morning, with food",
    foods: ["Kiwi", "Bell peppers", "Citrus"],
    keywords: ["vitamin c", "ascorb", "vit c"],
  },
  apigenin: {
    canonical: "apigenin",
    label: "Apigenin",
    defaultForm: "Apigenin",
    doseUnit: "mg",
    defaultTarget: 50,
    slot: "evening",
    window: "30–60 min pre-bed",
    foods: ["Chamomile tea", "Parsley", "Celery"],
    keywords: ["apigenin", "chamomile"],
  },
  electrolytes: {
    canonical: "electrolytes",
    label: "Electrolytes",
    defaultForm: "Na/K/Mg blend",
    doseUnit: "serving",
    defaultTarget: 1,
    slot: "post_workout",
    window: "Immediately post-sweat",
    foods: ["Sea salt + water", "Coconut water", "Bananas"],
    keywords: ["electrolyte", "lmnt", "salt"],
  },
  iron: {
    canonical: "iron",
    label: "Iron",
    defaultForm: "Bisglycinate",
    doseUnit: "mg",
    defaultTarget: 18,
    slot: "morning",
    window: "Morning, with vitamin C, empty stomach",
    foods: ["Red meat", "Lentils", "Spinach + citrus"],
    keywords: ["iron", "ferritin", "ferrous"],
  },
  "vitamin-b12": {
    canonical: "vitamin-b12",
    label: "Vitamin B12",
    defaultForm: "Methylcobalamin",
    doseUnit: "mcg",
    defaultTarget: 1000,
    slot: "morning",
    window: "Morning, sublingual",
    foods: ["Eggs", "Salmon", "Nutritional yeast"],
    keywords: ["b12", "cobalamin", "b-12", "methylcobalamin"],
  },
};

// Safe supplemental daily ceilings (upper limits) — anti-overdose guardrails.
export const UPPER_LIMITS: Record<
  string,
  { max: number; unit: string; note?: string }
> = {
  magnesium: { max: 350, unit: "mg", note: "supplemental elemental magnesium" },
  zinc: { max: 40, unit: "mg" },
  "vitamin-d3": { max: 4000, unit: "IU" },
  "vitamin-c": { max: 2000, unit: "mg" },
  iron: { max: 45, unit: "mg" },
};

// Absorption-competition pairs — warn when both land in the same day's stack.
export const INTERACTIONS: { a: string; b: string; message: string }[] = [
  {
    a: "zinc",
    b: "magnesium",
    message:
      "Zinc + Magnesium compete for the same transporters — space them at least 2 hours apart.",
  },
  {
    a: "zinc",
    b: "iron",
    message: "Zinc + Iron compete for uptake — take at different meals.",
  },
  {
    a: "iron",
    b: "magnesium",
    message: "Iron absorbs best away from Magnesium — separate by 2 hours.",
  },
  {
    a: "iron",
    b: "vitamin-d3",
    message: "Take Iron away from fat-soluble D3 for cleaner absorption.",
  },
];

const OPTIMAL_FORMS = [
  "glycinate",
  "bisglycinate",
  "chelate",
  "chelated",
  "malate",
  "monohydrate",
  "triglyceride",
  "methylcobalamin",
  "methylfolate",
  "picolinate",
  "ksm",
  "mk-7",
  "liposomal",
];
const GOOD_FORMS = [
  "citrate",
  "ascorbate",
  "gluconate",
  "aspartate",
  "taurate",
  "l-",
  "d3",
];
const LOW_FORMS = [
  "oxide",
  "carbonate",
  "cyanocobalamin",
  "dl-alpha",
  "ethyl ester",
  "sulfate",
];

export function formQuality(form: string): QualityTier {
  const f = (form || "").toLowerCase();
  if (LOW_FORMS.some((k) => f.includes(k))) return "low";
  if (OPTIMAL_FORMS.some((k) => f.includes(k))) return "optimal";
  if (GOOD_FORMS.some((k) => f.includes(k))) return "good";
  return "good";
}

export function qualityLabel(q: QualityTier, form: string): string {
  const f = form || "Form";
  if (q === "optimal") return `${f} · Optimal`;
  if (q === "good") return `${f} · Good`;
  return `${f} · Low Bioavailability`;
}

export function canonicalize(name: string): string {
  const n = (name || "").toLowerCase();
  for (const key of Object.keys(COMPOUNDS)) {
    if (COMPOUNDS[key].keywords.some((kw) => n.includes(kw))) return key;
  }
  return n.trim().replace(/\s+/g, "-") || "unknown";
}
