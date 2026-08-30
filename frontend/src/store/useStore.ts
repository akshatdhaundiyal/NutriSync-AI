import * as Localization from "expo-localization";
import { create } from "zustand";

import { DEFAULT_STASH, buildTelemetry } from "@/src/data/mockData";
import { extractLabel, generateProtocol } from "@/src/services/ai";
import {
  computeBaselines,
  computeReadiness,
} from "@/src/services/baselines";
import {
  getCollection,
  initDb,
  setCollection,
} from "@/src/services/database";
import { storage } from "@/src/utils/storage";
import {
  AIProvider,
  Baselines,
  ExtractedLabel,
  IntakeLog,
  Protocol,
  Readiness,
  Region,
  Settings,
  Slot,
  StashItem,
  TelemetryDay,
  ThemeMode,
} from "@/src/types";

const SETTINGS_KEY = "settings:v2";

const DEFAULT_SETTINGS: Settings = {
  themeMode: "system",
  region: "US",
  aiProvider: "mock",
  permissions: { sleep: false, hrv: false, workouts: false },
  activePreset: "heavy_leg_day",
};

const EU_CODES = new Set([
  "DE", "FR", "IT", "ES", "NL", "BE", "AT", "IE", "PT", "SE", "DK", "FI", "PL",
]);

function detectRegion(): Region {
  try {
    const code = Localization.getLocales?.()[0]?.regionCode?.toUpperCase();
    if (code === "IN") return "IN";
    if (code === "GB") return "UK";
    if (code === "US") return "US";
    if (code && EU_CODES.has(code)) return "EU";
  } catch {
    // ignore
  }
  return "GLOBAL";
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

async function loadKeys(): Promise<{ gemini: string; openai: string }> {
  const gemini = (await storage.secureGet<string>("apikey:gemini", "")) || "";
  const openai = (await storage.secureGet<string>("apikey:openai", "")) || "";
  return { gemini, openai };
}

interface AppState {
  hydrated: boolean;
  settings: Settings;
  stash: StashItem[];
  telemetry: TelemetryDay[];
  intake: IntakeLog[];
  baselines: Baselines | null;
  readiness: Readiness | null;
  protocol: Protocol | null;
  generating: boolean;
  keys: { gemini: string; openai: string };

  hydrate: () => Promise<void>;
  reanalyze: () => Promise<void>;
  setThemeMode: (m: ThemeMode) => Promise<void>;
  setRegion: (r: Region) => Promise<void>;
  setProvider: (p: AIProvider) => Promise<void>;
  setPermission: (k: keyof Settings["permissions"], v: boolean) => Promise<void>;
  applyPreset: (id: string) => Promise<void>;
  addStashItem: (item: StashItem) => Promise<void>;
  updateStashItem: (item: StashItem) => Promise<void>;
  removeStashItem: (id: string) => Promise<void>;
  adjustStock: (id: string, delta: number) => Promise<void>;
  toggleIntake: (slot: Slot, canonical: string) => Promise<void>;
  saveKey: (which: "gemini" | "openai", value: string) => Promise<void>;
  scanLabel: (base64: string, mime: string) => Promise<ExtractedLabel>;
}

async function persistSettings(s: Settings) {
  await storage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

export const useStore = create<AppState>((set, get) => ({
  hydrated: false,
  settings: DEFAULT_SETTINGS,
  stash: [],
  telemetry: [],
  intake: [],
  baselines: null,
  readiness: null,
  protocol: null,
  generating: false,
  keys: { gemini: "", openai: "" },

  hydrate: async () => {
    await initDb();

    const rawSettings = await storage.getItem<string>(SETTINGS_KEY, "");
    let settings: Settings;
    if (rawSettings) {
      try {
        settings = { ...DEFAULT_SETTINGS, ...JSON.parse(rawSettings) };
      } catch {
        settings = { ...DEFAULT_SETTINGS, region: detectRegion() };
      }
    } else {
      settings = { ...DEFAULT_SETTINGS, region: detectRegion() };
      await persistSettings(settings);
    }

    let stash = await getCollection<StashItem[] | null>("stash", null);
    if (!stash) {
      stash = DEFAULT_STASH;
      await setCollection("stash", stash);
    }

    let telemetry = await getCollection<TelemetryDay[] | null>("telemetry", null);
    if (!telemetry || telemetry.length === 0) {
      telemetry = buildTelemetry(settings.activePreset);
      await setCollection("telemetry", telemetry);
    }

    const intake = (await getCollection<IntakeLog[]>("intake", [])) || [];
    const keys = await loadKeys();

    set({ settings, stash, telemetry, intake, keys, hydrated: true });
    await get().reanalyze();
  },

  reanalyze: async () => {
    set({ generating: true });
    const { telemetry, settings, stash } = get();
    const date = todayISO();
    const today = telemetry[telemetry.length - 1];
    const baselines = computeBaselines(telemetry, today.date);
    const readiness = computeReadiness(today, baselines);
    const keys = await loadKeys();

    const protocol: Protocol = await generateProtocol({
      provider: settings.aiProvider,
      today,
      baselines,
      readiness,
      stash,
      region: settings.region,
      keys,
      date,
    });

    set({ baselines, readiness, protocol, generating: false, keys });
  },

  setThemeMode: async (themeMode) => {
    const settings = { ...get().settings, themeMode };
    set({ settings });
    await persistSettings(settings);
  },

  setRegion: async (region) => {
    const settings = { ...get().settings, region };
    set({ settings });
    await persistSettings(settings);
    await get().reanalyze();
  },

  setProvider: async (aiProvider) => {
    const settings = { ...get().settings, aiProvider };
    set({ settings });
    await persistSettings(settings);
    await get().reanalyze();
  },

  setPermission: async (k, v) => {
    const settings = {
      ...get().settings,
      permissions: { ...get().settings.permissions, [k]: v },
    };
    set({ settings });
    await persistSettings(settings);
  },

  applyPreset: async (id) => {
    const telemetry = buildTelemetry(id);
    const settings = { ...get().settings, activePreset: id };
    set({ telemetry, settings, intake: [] });
    await setCollection("telemetry", telemetry);
    await setCollection("intake", []);
    await persistSettings(settings);
    await get().reanalyze();
  },

  addStashItem: async (item) => {
    const stash = [item, ...get().stash];
    set({ stash });
    await setCollection("stash", stash);
    await get().reanalyze();
  },

  updateStashItem: async (item) => {
    const stash = get().stash.map((s) => (s.id === item.id ? item : s));
    set({ stash });
    await setCollection("stash", stash);
    await get().reanalyze();
  },

  removeStashItem: async (id) => {
    // soft delete
    const stash = get().stash.map((s) =>
      s.id === id ? { ...s, deletedAt: new Date().toISOString() } : s,
    );
    set({ stash });
    await setCollection("stash", stash);
    await get().reanalyze();
  },

  adjustStock: async (id, delta) => {
    const stash = get().stash.map((s) =>
      s.id === id
        ? { ...s, stockUnits: Math.max(0, s.stockUnits + delta) }
        : s,
    );
    set({ stash });
    await setCollection("stash", stash);
  },

  toggleIntake: async (slot, canonical) => {
    const date = todayISO();
    const id = `${date}:${slot}:${canonical}`;
    const existing = get().intake.find((i) => i.id === id);
    const nowTaken = !(existing?.taken ?? false);

    let intake: IntakeLog[];
    if (existing) {
      intake = get().intake.map((i) =>
        i.id === id ? { ...i, taken: nowTaken, at: nowTaken ? new Date().toISOString() : null } : i,
      );
    } else {
      intake = [
        ...get().intake,
        { id, date, slot, canonical, taken: nowTaken, at: new Date().toISOString() },
      ];
    }

    // Adjust stock for the matched item based on the protocol dose.
    const item = get().protocol?.items.find(
      (p) => p.canonical === canonical && p.slot === slot,
    );
    let stash = get().stash;
    if (item?.inStash && item.matchedStashId && item.unitsToTake) {
      const delta = nowTaken ? -item.unitsToTake : item.unitsToTake;
      stash = stash.map((s) =>
        s.id === item.matchedStashId
          ? { ...s, stockUnits: Math.max(0, s.stockUnits + delta) }
          : s,
      );
    }

    // Mark today's telemetry as an intake day for correlation once anything is taken.
    const anyTaken = intake.some((i) => i.date === date && i.taken);
    const telemetry = get().telemetry.map((t, idx) =>
      idx === get().telemetry.length - 1 ? { ...t, intake: anyTaken } : t,
    );

    set({ intake, stash, telemetry });
    await setCollection("intake", intake);
    await setCollection("stash", stash);
    await setCollection("telemetry", telemetry);
  },

  saveKey: async (which, value) => {
    await storage.secureSet(`apikey:${which}`, value);
    set({ keys: { ...get().keys, [which]: value } });
  },

  scanLabel: async (base64, mime) => {
    const { settings, keys } = get();
    return extractLabel({
      base64,
      mime,
      provider: settings.aiProvider,
      keys,
    });
  },
}));
