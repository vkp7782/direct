import { JobMode } from "@/types/job";

// Small best-effort alias map — location strings in these APIs are free text
// (e.g. "San Francisco, CA", "Germany", "EU Timezones", "UK/Remote").
const COUNTRY_ALIASES: Record<string, string> = {
  usa: "United States",
  us: "United States",
  "u.s.": "United States",
  "united states": "United States",
  uk: "United Kingdom",
  "u.k.": "United Kingdom",
  "united kingdom": "United Kingdom",
  england: "United Kingdom",
  germany: "Germany",
  deutschland: "Germany",
  france: "France",
  spain: "Spain",
  italy: "Italy",
  canada: "Canada",
  india: "India",
  netherlands: "Netherlands",
  poland: "Poland",
  portugal: "Portugal",
  brazil: "Brazil",
  mexico: "Mexico",
  australia: "Australia",
  singapore: "Singapore",
  ireland: "Ireland",
  "new zealand": "New Zealand",
  japan: "Japan",
  worldwide: "Worldwide",
  global: "Worldwide",
  anywhere: "Worldwide",
};

export function deriveCountry(location: string): string | null {
  if (!location) return null;
  const cleaned = location.toLowerCase();

  for (const [key, value] of Object.entries(COUNTRY_ALIASES)) {
    if (cleaned.includes(key)) return value;
  }

  // "City, ST" or "City, Country" — take the last comma-separated chunk
  const parts = location.split(",").map((p) => p.trim());
  if (parts.length > 1) {
    const last = parts[parts.length - 1];
    if (last && last.length <= 30) return last;
  }

  return null;
}

export function deriveJobMode(location: string, remoteFlag: boolean): JobMode {
  const text = (location || "").toLowerCase();
  if (text.includes("hybrid")) return "Hybrid";
  if (text.includes("remote") || remoteFlag) return "Remote";
  if (text.includes("on-site") || text.includes("onsite") || text.includes("in office")) {
    return "Onsite";
  }
  // A specific city/country with no remote signal usually means on-site
  if (text.trim().length > 0) return "Onsite";
  return "Unknown";
}
