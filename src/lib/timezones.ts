export interface TimezoneConfig {
  id: string;
  city: string;
  country: string;
  region: "US" | "UK" | "EU";
  shortLabel: string;
  flag: string;
  color: string; // Tailwind color class stem for bars
  colorHex: string;
}

export const TIMEZONES: TimezoneConfig[] = [
  // US
  {
    id: "America/New_York",
    city: "New York",
    country: "United States",
    region: "US",
    shortLabel: "ET",
    flag: "🇺🇸",
    color: "blue",
    colorHex: "#3b82f6",
  },
  {
    id: "America/Chicago",
    city: "Chicago",
    country: "United States",
    region: "US",
    shortLabel: "CT",
    flag: "🇺🇸",
    color: "sky",
    colorHex: "#0ea5e9",
  },
  {
    id: "America/Denver",
    city: "Denver",
    country: "United States",
    region: "US",
    shortLabel: "MT",
    flag: "🇺🇸",
    color: "cyan",
    colorHex: "#06b6d4",
  },
  {
    id: "America/Los_Angeles",
    city: "Los Angeles",
    country: "United States",
    region: "US",
    shortLabel: "PT",
    flag: "🇺🇸",
    color: "indigo",
    colorHex: "#6366f1",
  },
  // UK
  {
    id: "Europe/London",
    city: "London",
    country: "United Kingdom",
    region: "UK",
    shortLabel: "GMT/BST",
    flag: "🇬🇧",
    color: "violet",
    colorHex: "#8b5cf6",
  },
  // EU
  {
    id: "Europe/Paris",
    city: "Paris",
    country: "France",
    region: "EU",
    shortLabel: "CET/CEST",
    flag: "🇫🇷",
    color: "purple",
    colorHex: "#a855f7",
  },
  {
    id: "Europe/Berlin",
    city: "Berlin",
    country: "Germany",
    region: "EU",
    shortLabel: "CET/CEST",
    flag: "🇩🇪",
    color: "fuchsia",
    colorHex: "#d946ef",
  },
  {
    id: "Europe/Amsterdam",
    city: "Amsterdam",
    country: "Netherlands",
    region: "EU",
    shortLabel: "CET/CEST",
    flag: "🇳🇱",
    color: "pink",
    colorHex: "#ec4899",
  },
  {
    id: "Europe/Stockholm",
    city: "Stockholm",
    country: "Sweden",
    region: "EU",
    shortLabel: "CET/CEST",
    flag: "🇸🇪",
    color: "rose",
    colorHex: "#f43f5e",
  },
  {
    id: "Europe/Warsaw",
    city: "Warsaw",
    country: "Poland",
    region: "EU",
    shortLabel: "CET/CEST",
    flag: "🇵🇱",
    color: "orange",
    colorHex: "#f97316",
  },
  {
    id: "Europe/Helsinki",
    city: "Helsinki",
    country: "Finland",
    region: "EU",
    shortLabel: "EET/EEST",
    flag: "🇫🇮",
    color: "amber",
    colorHex: "#f59e0b",
  },
];

export const DEFAULT_TIMEZONE_IDS = [
  "America/New_York",
  "Europe/London",
  "Europe/Berlin",
];

export function getTimezoneById(id: string): TimezoneConfig | undefined {
  return TIMEZONES.find((tz) => tz.id === id);
}

export const REGION_LABELS: Record<string, string> = {
  US: "United States",
  UK: "United Kingdom",
  EU: "Europe",
};
