import { INTERACTIONS, UPPER_LIMITS } from "@/src/data/compounds";
import { Guardrail, ProtocolItem } from "@/src/types";

// Anti-overdose + absorption guardrails computed from the day's active stack.
export function computeGuardrails(items: ProtocolItem[]): Guardrail[] {
  const out: Guardrail[] = [];
  const canon = items.map((i) => i.canonical);

  for (const pair of INTERACTIONS) {
    if (canon.includes(pair.a) && canon.includes(pair.b)) {
      out.push({ type: "interaction", severity: "warn", message: pair.message });
    }
  }

  for (const item of items) {
    const lim = UPPER_LIMITS[item.canonical];
    if (lim && lim.unit === item.doseUnit && item.targetDose > lim.max) {
      out.push({
        type: "ceiling",
        severity: "danger",
        message: `${item.compound} target ${item.targetDose}${item.doseUnit} exceeds the safe daily ceiling of ${lim.max}${lim.unit}.`,
      });
    }
  }

  return out;
}
