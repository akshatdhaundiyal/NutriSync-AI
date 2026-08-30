import * as Localization from "expo-localization";
import { create } from "zustand";

import { DEFAULT_STASH, buildTelemetry } from "@/src/data/mockData";
import { COMPOUNDS } from "@/src/data/compounds";
import { extractBloodTest, extractLabel, generateProtocol } from "@/src/services/ai";
import { Deficiency } from "@/src/services/protocolEngine";
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
  BiometricThresholds,
  BloodMarker,
  ExtractedLabel,
  IntakeLog,
  Protocol,
  ProtocolMode,
  Readiness,
  Region,
  Settings,
  Slot,
  StashItem,
  TelemetryDay,
  TelemetrySource,
  ThemeMode,
} from "@/src/types";
import { syncHealthConnect } from "@/src/services/healthConnect";

const SETTINGS_KEY = "settings:v2";

const DEFAULT_SETTINGS: Settings = {
  themeMode: "system",
  region: "US",
  aiProvider: "mock",
  telemetrySource: "mock",
  permissions: { sleep: false, hrv: false, workouts: false },
  activePreset: "heavy_leg_day",
  mode: "auto",
  thresholds: {
    targetHrvMs: 65,
    minDeepSleepMin: 75,
    maxStrain: 15.0,
  },
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
  adherenceDates: string[];
  bloodMarkers: BloodMarker[];

  hydrate: () => Promise<void>;
  reanalyze: () => Promise<void>;
  setThemeMode: (m: ThemeMode) => Promise<void>;
  setRegion: (r: Region) => Promise<void>;
  setProvider: (p: AIProvider) => Promise<void>;
  setTelemetrySource: (source: TelemetrySource) => Promise<string>;
  setPermission: (k: keyof Settings["permissions"], v: boolean) => Promise<void>;
  setMode: (m: ProtocolMode) => Promise<void>;
  setThresholds: (t: BiometricThresholds) => Promise<void>;
  applyPreset: (id: string) => Promise<void>;
  addStashItem: (item: StashItem) => Promise<void>;
  updateStashItem: (item: StashItem) => Promise<void>;
  removeStashItem: (id: string) => Promise<void>;
  adjustStock: (id: string, delta: number) => Promise<void>;
  toggleIntake: (slot: Slot, canonical: string) => Promise<void>;
  saveKey: (which: "gemini" | "openai", value: string) => Promise<void>;
  scanLabel: (base64: string, mime: string) => Promise<ExtractedLabel>;
  importBloodTest: (base64: string, mime: string) => Promise<BloodMarker[]>;
  clearBloodMarkers: () => Promise<void>;
  exportBackup: () => string;
  importBackup: (jsonStr: string) => Promise<boolean>;
}

async function persistSettings(s: Settings) {
  await storage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

function deficienciesFrom(markers: BloodMarker[]): Deficiency[] {
  return markers
    .filter((m) => m.status === "low" && !!COMPOUNDS[m.canonical])
    .map((m) => ({ canonical: m.canonical, name: m.name, value: m.value, unit: m.unit }));
}

// A day is "adhered" when it's a zero-pill day OR every active item was taken.
function computeAdherenceDates(
  protocol: Protocol | null,
  intake: IntakeLog[],
  adherenceDates: string[],
  day: string,
): string[] {
  const complete = protocol
    ? protocol.zeroPill ||
      (protocol.items.length > 0 &&
        protocol.items.every(
          (it) =>
            intake.find((i) => i.id === `${day}:${it.slot}:${it.canonical}`)?.taken,
        ))
    : false;
  const set = new Set(adherenceDates);
  if (complete) set.add(day);
  else set.delete(day);
  return [...set];
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
  adherenceDates: [],
  bloodMarkers: [],

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

    const stash = await getCollection<StashItem[]>("stash", DEFAULT_STASH);
    const telemetry = await getCollection<TelemetryDay[]>(
      "telemetry",
      buildTelemetry(settings.activePreset),
    );
    const intake = await getCollection<IntakeLog[]>("intake", []);
    const adherenceDates = await getCollection<string[]>("adherence", [
      "2026-08-28",
      "2026-08-29",
    ]);
    const bloodMarkers = await getCollection<BloodMarker[]>("bloodMarkers", []);

    const keys = await loadKeys();

    set({
      hydrated: true,
      settings,
      stash,
      telemetry,
      intake,
      keys,
      adherenceDates,
      bloodMarkers,
    });

    await get().reanalyze();
  },

  reanalyze: async () => {
    const { telemetry, stash, settings, keys, bloodMarkers } = get();
    if (telemetry.length === 0) return;

    set({ generating: true });

    try {
      const today = telemetry[telemetry.length - 1];
      const baselines = computeBaselines(telemetry, today.date);
      const readiness = computeReadiness(today, baselines);

      const activeStash = stash.filter((s) => !s.deletedAt);
      const labDeficiencies = deficienciesFrom(bloodMarkers);

      const protocol = await generateProtocol({
        today,
        baselines,
        readiness,
        stash: activeStash,
        region: settings.region,
        mode: settings.mode,
        provider: settings.aiProvider,
        keys,
        deficiencies: labDeficiencies,
        date: today.date,
      });

      const day = todayISO();
      const adherenceDates = computeAdherenceDates(
        protocol,
        get().intake,
        get().adherenceDates,
        day,
      );

      set({
        baselines,
        readiness,
        protocol,
        adherenceDates,
        generating: false,
      });

      await setCollection("adherence", adherenceDates);
    } catch (err) {
      console.warn("reanalyze error:", err);
      set({ generating: false });
    }
  },

  setThemeMode: async (m) => {
    const settings = { ...get().settings, themeMode: m };
    set({ settings });
    await persistSettings(settings);
  },

  setRegion: async (r) => {
    const settings = { ...get().settings, region: r };
    set({ settings });
    await persistSettings(settings);
    await get().reanalyze();
  },

  setProvider: async (p) => {
    const settings = { ...get().settings, aiProvider: p };
    set({ settings });
    await persistSettings(settings);
    await get().reanalyze();
  },

  setTelemetrySource: async (source) => {
    const settings = { ...get().settings, telemetrySource: source };
    set({ settings });
    await persistSettings(settings);

    if (source === "health_connect") {
      const res = await syncHealthConnect();
      if (res.telemetry && res.telemetry.length > 0) {
        set({ telemetry: res.telemetry });
        await setCollection("telemetry", res.telemetry);
      }
      await get().reanalyze();
      return res.message;
    } else {
      const telemetry = buildTelemetry(settings.activePreset);
      set({ telemetry });
      await setCollection("telemetry", telemetry);
      await get().reanalyze();
      return "Switched to Mock / Telemetry Simulator";
    }
  },

  setPermission: async (k, v) => {
    const settings = {
      ...get().settings,
      permissions: { ...get().settings.permissions, [k]: v },
    };
    set({ settings });
    await persistSettings(settings);
  },

  setMode: async (m) => {
    const settings = { ...get().settings, mode: m };
    set({ settings });
    await persistSettings(settings);
    await get().reanalyze();
  },

  setThresholds: async (thresholds) => {
    const settings = { ...get().settings, thresholds };
    set({ settings });
    await persistSettings(settings);
    await get().reanalyze();
  },

  applyPreset: async (id) => {
    const telemetry = buildTelemetry(id);
    const settings = { ...get().settings, activePreset: id };
    set({ telemetry, settings });
    await setCollection("telemetry", telemetry);
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

    const adherenceDates = computeAdherenceDates(
      get().protocol,
      intake,
      get().adherenceDates,
      date,
    );

    set({ intake, stash, telemetry, adherenceDates });
    await setCollection("intake", intake);
    await setCollection("stash", stash);
    await setCollection("telemetry", telemetry);
    await setCollection("adherence", adherenceDates);
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

  importBloodTest: async (base64, mime) => {
    const { settings, keys } = get();
    const markers = await extractBloodTest({
      base64,
      mime,
      provider: settings.aiProvider,
      keys,
    });
    set({ bloodMarkers: markers });
    await setCollection("bloodMarkers", markers);
    await get().reanalyze();
    return markers;
  },

  clearBloodMarkers: async () => {
    set({ bloodMarkers: [] });
    await setCollection("bloodMarkers", []);
    await get().reanalyze();
  },

  exportBackup: () => {
    const { settings, stash, telemetry, intake, adherenceDates, bloodMarkers } = get();
    const payload = {
      version: 2,
      exportedAt: new Date().toISOString(),
      settings,
      stash,
      telemetry,
      intake,
      adherenceDates,
      bloodMarkers,
    };
    return JSON.stringify(payload, null, 2);
  },

  importBackup: async (jsonStr: string) => {
    try {
      const data = JSON.parse(jsonStr);
      if (!data || typeof data !== "object") return false;

      if (Array.isArray(data.stash)) {
        await setCollection("stash", data.stash);
        set({ stash: data.stash });
      }
      if (Array.isArray(data.telemetry)) {
        await setCollection("telemetry", data.telemetry);
        set({ telemetry: data.telemetry });
      }
      if (Array.isArray(data.intake)) {
        await setCollection("intake", data.intake);
        set({ intake: data.intake });
      }
      if (Array.isArray(data.adherenceDates)) {
        await setCollection("adherence", data.adherenceDates);
        set({ adherenceDates: data.adherenceDates });
      }
      if (Array.isArray(data.bloodMarkers)) {
        await setCollection("bloodMarkers", data.bloodMarkers);
        set({ bloodMarkers: data.bloodMarkers });
      }
      if (data.settings && typeof data.settings === "object") {
        await persistSettings(data.settings);
        set({ settings: data.settings });
      }

      await get().reanalyze();
      return true;
    } catch (err) {
      console.warn("importBackup error:", err);
      return false;
    }
  },
}));
