import { BuyOption, Region } from "@/src/types";

interface MerchantTemplate {
  merchant: string;
  build: (q: string) => string;
}

const MERCHANTS: Record<Region, MerchantTemplate[]> = {
  US: [
    { merchant: "Amazon", build: (q) => `https://www.amazon.com/s?k=${q}` },
    { merchant: "iHerb", build: (q) => `https://www.iherb.com/search?kw=${q}` },
  ],
  IN: [
    { merchant: "Amazon", build: (q) => `https://www.amazon.in/s?k=${q}` },
    {
      merchant: "Tata 1mg",
      build: (q) => `https://www.1mg.com/search/all?name=${q}`,
    },
  ],
  UK: [
    { merchant: "Amazon", build: (q) => `https://www.amazon.co.uk/s?k=${q}` },
    { merchant: "iHerb", build: (q) => `https://www.iherb.com/search?kw=${q}` },
  ],
  EU: [
    { merchant: "Amazon", build: (q) => `https://www.amazon.de/s?k=${q}` },
    { merchant: "iHerb", build: (q) => `https://www.iherb.com/search?kw=${q}` },
  ],
  GLOBAL: [
    { merchant: "iHerb", build: (q) => `https://www.iherb.com/search?kw=${q}` },
    { merchant: "Amazon", build: (q) => `https://www.amazon.com/s?k=${q}` },
  ],
};

export const REGION_LABELS: Record<Region, string> = {
  US: "United States",
  IN: "India",
  UK: "United Kingdom",
  EU: "Europe",
  GLOBAL: "Global",
};

export function buyOptions(
  compoundLabel: string,
  chemicalForm: string,
  region: Region,
): BuyOption[] {
  const term = encodeURIComponent(`${compoundLabel} ${chemicalForm}`.trim());
  return MERCHANTS[region].map((m) => ({
    merchant: m.merchant,
    url: m.build(term),
  }));
}
