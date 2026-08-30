import { StashItem } from "@/src/types";

// A bottle is "running low" at <= 15% of a full container (min 10 units).
export function isLowStock(item: StashItem): boolean {
  return item.stockUnits <= Math.max(10, Math.round(item.unitsPerContainer * 0.15));
}

export function daysOfSupply(item: StashItem, unitsPerDay = 2): number {
  if (unitsPerDay <= 0) return 999;
  return Math.floor(item.stockUnits / unitsPerDay);
}

function prevDay(dateISO: string): string {
  const d = new Date(dateISO + "T00:00:00");
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

// Consecutive adhered days ending today (or yesterday if today isn't complete yet).
export function computeStreak(adherenceDates: string[], todayKey: string): number {
  const set = new Set(adherenceDates);
  let cursor = set.has(todayKey) ? todayKey : prevDay(todayKey);
  let streak = 0;
  while (set.has(cursor)) {
    streak += 1;
    cursor = prevDay(cursor);
  }
  return streak;
}

// Longest consecutive run anywhere in the history.
export function computeBestStreak(adherenceDates: string[]): number {
  if (adherenceDates.length === 0) return 0;
  const sorted = [...new Set(adherenceDates)].sort();
  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (prevDay(sorted[i]) === sorted[i - 1]) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
  }
  return best;
}
