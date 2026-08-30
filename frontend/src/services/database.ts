// On-device persistence. expo-sqlite on native, AsyncStorage (KV) on web.
// Collections are stored as JSON blobs keyed by name. Baseline/dosing
// computation happens locally in TypeScript (see baselines.ts / protocolEngine.ts).

import { Platform } from "react-native";

import { storage } from "@/src/utils/storage";

const isWeb = Platform.OS === "web";

type SQLiteDB = {
  execAsync: (sql: string) => Promise<void>;
  runAsync: (sql: string, ...params: any[]) => Promise<unknown>;
  getFirstAsync: (sql: string, ...params: any[]) => Promise<any>;
};

let dbPromise: Promise<SQLiteDB> | null = null;

async function getDb(): Promise<SQLiteDB> {
  if (!dbPromise) {
    dbPromise = (async () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const SQLite = require("expo-sqlite");
      const db = await SQLite.openDatabaseAsync("nutrisync.db");
      await db.execAsync(
        "CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY NOT NULL, value TEXT);",
      );
      return db as SQLiteDB;
    })();
  }
  return dbPromise;
}

export async function initDb(): Promise<void> {
  if (isWeb) return;
  await getDb();
}

export async function getCollection<T>(
  key: string,
  fallback: T,
): Promise<T> {
  if (isWeb) {
    const raw = await storage.getItem<string>(`db:${key}`, "");
    if (!raw) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }
  try {
    const db = await getDb();
    const row = await db.getFirstAsync("SELECT value FROM kv WHERE key = ?", key);
    if (!row || !row.value) return fallback;
    return JSON.parse(row.value) as T;
  } catch {
    return fallback;
  }
}

export async function setCollection<T>(key: string, value: T): Promise<void> {
  const serialized = JSON.stringify(value);
  if (isWeb) {
    await storage.setItem(`db:${key}`, serialized);
    return;
  }
  try {
    const db = await getDb();
    await db.runAsync(
      "INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)",
      key,
      serialized,
    );
  } catch {
    // silent — persistence failures shouldn't crash the UI
  }
}
