import { canonicalize, formQuality } from "@/src/data/compounds";
import { MOCK_LABELS } from "@/src/data/mockData";
import {
  buildProtocol,
  mockRecommendations,
} from "@/src/services/protocolEngine";
import {
  AIProvider,
  Baselines,
  ExtractedLabel,
  Protocol,
  Readiness,
  RecommendationSet,
  Region,
  StashItem,
  TelemetryDay,
} from "@/src/types";

const BACKEND = process.env.EXPO_PUBLIC_BACKEND_URL;

export const PROVIDER_LABEL: Record<AIProvider, string> = {
  mock: "Offline Mock Engine",
  "gemini-direct": "Gemini 2.0 Flash (Direct)",
  "openai-direct": "GPT-4o-mini (Direct)",
  "emergent-gpt": "GPT-5.4 (Emergent Key)",
  "emergent-gemini": "Gemini 3.1 Pro (Emergent Key)",
};

function extractJson(text: string): any {
  if (!text) throw new Error("empty response");
  let t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start >= 0 && end > start) t = t.slice(start, end + 1);
  return JSON.parse(t);
}

function buildContext(input: {
  today: TelemetryDay;
  baselines: Baselines;
  readiness: Readiness;
  stash: StashItem[];
  region: Region;
}) {
  return {
    region: input.region,
    readiness: input.readiness,
    baselines: input.baselines,
    today: {
      deepSleepMin: input.today.deepSleepMin,
      hrvMs: input.today.hrvMs,
      restingHr: input.today.restingHr,
      strain: input.today.strain,
      steps: input.today.steps,
      acuteStressSpike: input.today.sedentaryStressSpike,
    },
    cabinet: input.stash
      .filter((s) => !s.deletedAt)
      .map((s) => ({
        canonical: s.canonical,
        brand: s.brand,
        name: s.name,
        form: s.chemicalForm,
        dosePerUnit: s.dosePerUnit,
        doseUnit: s.doseUnit,
        unit: s.unit,
        stock: s.stockUnits,
      })),
  };
}

const SYSTEM_PROMPT = `You are a chronobiology-aware sports nutrition engine. Given wearable telemetry, 7-day baselines, a readiness score and the user's supplement cabinet, return a JSON supplement protocol.
Rules:
- Respond with STRICT JSON only, no prose.
- Never recommend more than 3 supplements per day.
- If readiness is optimal (high HRV, good deep sleep, low strain) set zeroPill=true, recommendations=[] and give a wholeFoodNote.
- Prefer chelated / bioavailable chemical forms.
- Slots must be one of: "morning", "post_workout", "evening".
JSON schema:
{"zeroPill": boolean, "wholeFoodNote": string, "recommendations": [{"compound": string, "chemicalForm": string, "targetDose": number, "doseUnit": "mg"|"mcg"|"g"|"IU"|"serving", "slot": string, "rationale": string, "window": string, "foodAlternatives": string[]}]}`;

async function geminiDirect(
  context: any,
  key: string,
): Promise<RecommendationSet> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ parts: [{ text: JSON.stringify(context) }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0.4 },
    }),
  });
  if (!res.ok) throw new Error(`gemini ${res.status}`);
  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return extractJson(text);
}

async function openaiDirect(
  context: any,
  key: string,
): Promise<RecommendationSet> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: JSON.stringify(context) },
      ],
    }),
  });
  if (!res.ok) throw new Error(`openai ${res.status}`);
  const json = await res.json();
  const text = json?.choices?.[0]?.message?.content ?? "";
  return extractJson(text);
}

async function emergentGenerate(
  providerKind: "gpt" | "gemini",
  context: any,
): Promise<RecommendationSet> {
  const res = await fetch(`${BACKEND}/api/ai/generate-protocol`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider: providerKind, context }),
  });
  if (!res.ok) throw new Error(`emergent ${res.status}`);
  const json = await res.json();
  return json as RecommendationSet;
}

export async function generateProtocol(input: {
  provider: AIProvider;
  today: TelemetryDay;
  baselines: Baselines;
  readiness: Readiness;
  stash: StashItem[];
  region: Region;
  keys: { gemini: string; openai: string };
  date: string;
}): Promise<Protocol> {
  const { provider, today, baselines, readiness, stash, region, keys, date } =
    input;

  const finalize = (recSet: RecommendationSet, generatedBy: string) =>
    buildProtocol(recSet, {
      stash,
      region,
      readiness,
      baselines,
      date,
      generatedBy,
    });

  if (provider === "mock") {
    return finalize(
      mockRecommendations({ today, readiness }),
      PROVIDER_LABEL.mock,
    );
  }

  try {
    const context = buildContext({ today, baselines, readiness, stash, region });
    let recSet: RecommendationSet;
    if (provider === "gemini-direct") {
      if (!keys.gemini) throw new Error("missing gemini key");
      recSet = await geminiDirect(context, keys.gemini);
    } else if (provider === "openai-direct") {
      if (!keys.openai) throw new Error("missing openai key");
      recSet = await openaiDirect(context, keys.openai);
    } else if (provider === "emergent-gpt") {
      recSet = await emergentGenerate("gpt", context);
    } else {
      recSet = await emergentGenerate("gemini", context);
    }
    if (!recSet || !Array.isArray(recSet.recommendations)) {
      throw new Error("invalid recommendation set");
    }
    return finalize(recSet, PROVIDER_LABEL[provider]);
  } catch (e) {
    // Self-contained fallback: never dead-end the user.
    return finalize(mockRecommendations({ today, readiness }), "Offline fallback");
  }
}

// ---- Vision OCR ----

const OCR_PROMPT = `Extract supplement facts from this bottle label as STRICT JSON only:
{"brand": string, "name": string, "compound": string, "chemicalForm": string, "dosePerUnit": number, "doseUnit": "mg"|"mcg"|"g"|"IU"|"serving", "unit": "capsule"|"softgel"|"tablet"|"scoop"|"gummy", "unitsPerContainer": number}
compound is the primary active ingredient (e.g. "Magnesium"). dosePerUnit is the elemental amount per single capsule/scoop.`;

function labelToExtracted(raw: any, source: string): ExtractedLabel {
  const chemicalForm = String(raw.chemicalForm ?? "Standard");
  return {
    brand: String(raw.brand ?? "Unknown Brand"),
    name: String(raw.name ?? raw.compound ?? "Supplement"),
    canonical: canonicalize(String(raw.compound ?? raw.name ?? "")),
    chemicalForm,
    dosePerUnit: Number(raw.dosePerUnit) || 100,
    doseUnit: (["mg", "mcg", "g", "IU", "serving"].includes(raw.doseUnit)
      ? raw.doseUnit
      : "mg") as ExtractedLabel["doseUnit"],
    unit: (["capsule", "softgel", "tablet", "scoop", "gummy"].includes(raw.unit)
      ? raw.unit
      : "capsule") as ExtractedLabel["unit"],
    unitsPerContainer: Number(raw.unitsPerContainer) || 60,
    quality: formQuality(chemicalForm),
    source,
  };
}

function mockExtract(): ExtractedLabel {
  const pick = MOCK_LABELS[Math.floor(Math.random() * MOCK_LABELS.length)];
  return {
    ...pick,
    canonical: pick.canonical,
    quality: formQuality(pick.chemicalForm),
    source: "Mock Vision",
  };
}

async function geminiVision(
  base64: string,
  mime: string,
  key: string,
): Promise<ExtractedLabel> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: OCR_PROMPT },
            { inlineData: { mimeType: mime, data: base64 } },
          ],
        },
      ],
      generationConfig: { responseMimeType: "application/json" },
    }),
  });
  if (!res.ok) throw new Error(`gemini vision ${res.status}`);
  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return labelToExtracted(extractJson(text), "Gemini Vision");
}

async function openaiVision(
  base64: string,
  mime: string,
  key: string,
): Promise<ExtractedLabel> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: OCR_PROMPT },
            {
              type: "image_url",
              image_url: { url: `data:${mime};base64,${base64}` },
            },
          ],
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`openai vision ${res.status}`);
  const json = await res.json();
  const text = json?.choices?.[0]?.message?.content ?? "";
  return labelToExtracted(extractJson(text), "GPT-4o Vision");
}

async function emergentVision(
  base64: string,
  mime: string,
): Promise<ExtractedLabel> {
  const res = await fetch(`${BACKEND}/api/ai/ocr-label`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_base64: base64, mime_type: mime }),
  });
  if (!res.ok) throw new Error(`emergent vision ${res.status}`);
  const json = await res.json();
  return labelToExtracted(json, "Gemini 3 Flash Vision");
}

export async function extractLabel(input: {
  base64: string;
  mime: string;
  provider: AIProvider;
  keys: { gemini: string; openai: string };
}): Promise<ExtractedLabel> {
  const { base64, mime, provider, keys } = input;
  try {
    if (provider === "gemini-direct" && keys.gemini)
      return await geminiVision(base64, mime, keys.gemini);
    if (provider === "openai-direct" && keys.openai)
      return await openaiVision(base64, mime, keys.openai);
    if (provider === "emergent-gpt" || provider === "emergent-gemini")
      return await emergentVision(base64, mime);
    return mockExtract();
  } catch {
    return mockExtract();
  }
}
