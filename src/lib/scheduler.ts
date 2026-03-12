import {
  addDays,
  startOfWeek,
  getDay,
  getHours,
  format,
  addWeeks,
  subWeeks,
  startOfDay,
} from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import type { TimezoneConfig } from "./timezones";

// ─── Types ───────────────────────────────────────────────────────────────────

export type SlotQuality = "perfect" | "good" | "compromise" | "unavailable";

export interface LocalTimeInfo {
  timezoneId: string;
  city: string;
  flag: string;
  shortLabel: string;
  colorHex: string;
  timeString: string; // e.g. "9:00 AM"
  dayLabel: string; // e.g. "Mon" (may differ from UTC day due to offset)
  isWorkingHour: boolean;
  isWeekend: boolean;
  hourScore: number; // 0=outside, 1=working edge, 2=core (10am-3pm)
}

export interface HourSlot {
  utcHour: number;
  utcDate: Date;
  quality: SlotQuality;
  score: number;
  localTimes: LocalTimeInfo[];
}

export interface DayAnalysis {
  date: Date;
  dayLabel: string; // 'Monday'
  dateLabel: string; // 'Mar 10'
  slots: HourSlot[]; // 24 slots (one per UTC hour)
  workingBands: WorkingBand[]; // per-timezone working hour bands for this day
  overlapStart: number | null; // UTC hour where overlap starts (or null)
  overlapEnd: number | null; // UTC hour where overlap ends (exclusive)
  hasOverlap: boolean;
}

export interface WorkingBand {
  timezoneId: string;
  city: string;
  flag: string;
  colorHex: string;
  shortLabel: string;
  utcStart: number; // UTC hour for 9am in this timezone (decimal ok)
  utcEnd: number; // UTC hour for 5pm in this timezone
  isNextDay: boolean; // if 5pm UTC wraps to next day
}

export interface BestSlot {
  utcDate: Date;
  dayLabel: string;
  dateLabel: string;
  quality: SlotQuality;
  score: number;
  localTimes: LocalTimeInfo[];
  rank: number;
}

export interface WeekAnalysis {
  weekLabel: string;
  weekStart: Date;
  weekEnd: Date;
  days: DayAnalysis[];
  bestSlots: BestSlot[];
  hasPerfectSlots: boolean;
  hasGoodSlots: boolean;
  totalValidSlots: number;
  displayUTCRange: { start: number; end: number }; // hours to show in timeline
}

// ─── Scoring ─────────────────────────────────────────────────────────────────

function getHourScore(hour: number): number {
  if (hour >= 10 && hour < 15) return 2; // Prime: 10am–3pm
  if (hour >= 9 && hour < 17) return 1; // Working: 9am–5pm
  return 0;
}

function getSlotQuality(localTimes: LocalTimeInfo[]): SlotQuality {
  const allInWorkingHours = localTimes.every((lt) => lt.isWorkingHour);
  const totalScore = localTimes.reduce((sum, lt) => sum + lt.hourScore, 0);
  const maxScore = localTimes.length * 2;

  if (allInWorkingHours && totalScore >= maxScore * 0.7) return "perfect";
  if (allInWorkingHours) return "good";
  if (localTimes.filter((lt) => lt.isWorkingHour).length >= localTimes.length * 0.5)
    return "compromise";
  return "unavailable";
}

// ─── Working bands ────────────────────────────────────────────────────────────

function getWorkingBand(date: Date, tz: TimezoneConfig): WorkingBand {
  // Get UTC equivalent of 9am and 5pm on this date in the given timezone
  // date is a local-midnight Date (from the user's browser)
  const localNineAM = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    9,
    0,
    0
  );
  const localFivePM = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    17,
    0,
    0
  );

  const utcNineAM = fromZonedTime(localNineAM, tz.id);
  const utcFivePM = fromZonedTime(localFivePM, tz.id);

  const utcStart =
    utcNineAM.getUTCHours() + utcNineAM.getUTCMinutes() / 60;
  const utcEnd =
    utcFivePM.getUTCHours() + utcFivePM.getUTCMinutes() / 60;

  // Check if 5pm UTC falls on next day (e.g. US Pacific)
  const isNextDay =
    utcFivePM.getUTCDate() !== utcNineAM.getUTCDate() ||
    utcEnd < utcStart;

  return {
    timezoneId: tz.id,
    city: tz.city,
    flag: tz.flag,
    colorHex: tz.colorHex,
    shortLabel: tz.shortLabel,
    utcStart,
    utcEnd: isNextDay ? 24 : utcEnd,
    isNextDay,
  };
}

// ─── Main analysis ────────────────────────────────────────────────────────────

export function analyzeWeek(
  weekStart: Date,
  timezones: TimezoneConfig[]
): WeekAnalysis {
  const days: DayAnalysis[] = [];
  const allBestSlots: BestSlot[] = [];

  for (let d = 0; d < 5; d++) {
    const dayDate = addDays(weekStart, d);
    const slots: HourSlot[] = [];

    // Working bands for overlap visualization
    const workingBands: WorkingBand[] = timezones.map((tz) =>
      getWorkingBand(dayDate, tz)
    );

    // Find overlap: max of all utcStarts, min of all utcEnds
    const overlapStart = Math.max(...workingBands.map((b) => b.utcStart));
    const overlapEnd = Math.min(...workingBands.map((b) => b.utcEnd));
    const hasOverlap = overlapStart < overlapEnd;

    for (let h = 0; h < 24; h++) {
      // Create UTC date for this hour
      const utcDate = new Date(
        Date.UTC(
          dayDate.getFullYear(),
          dayDate.getMonth(),
          dayDate.getDate(),
          h,
          0,
          0,
          0
        )
      );

      const localTimes: LocalTimeInfo[] = timezones.map((tz) => {
        const zonedDate = toZonedTime(utcDate, tz.id);
        const localDay = getDay(zonedDate);
        const localHour = getHours(zonedDate);
        const isWeekend = localDay === 0 || localDay === 6;
        const score = isWeekend ? 0 : getHourScore(localHour);
        const isWorkingHour = !isWeekend && localHour >= 9 && localHour < 17;

        return {
          timezoneId: tz.id,
          city: tz.city,
          flag: tz.flag,
          shortLabel: tz.shortLabel,
          colorHex: tz.colorHex,
          timeString: format(zonedDate, "h:mm a"),
          dayLabel: format(zonedDate, "EEE"),
          isWorkingHour,
          isWeekend,
          hourScore: score,
        };
      });

      const quality = getSlotQuality(localTimes);
      const score = localTimes.reduce((sum, lt) => sum + lt.hourScore, 0);

      slots.push({ utcHour: h, utcDate, quality, score, localTimes });

      if (quality === "perfect" || quality === "good") {
        allBestSlots.push({
          utcDate,
          dayLabel: format(dayDate, "EEEE"),
          dateLabel: format(dayDate, "MMM d"),
          quality,
          score,
          localTimes,
          rank: 0, // set after sorting
        });
      }
    }

    days.push({
      date: dayDate,
      dayLabel: format(dayDate, "EEEE"),
      dateLabel: format(dayDate, "MMM d"),
      slots,
      workingBands,
      overlapStart: hasOverlap ? Math.ceil(overlapStart) : null,
      overlapEnd: hasOverlap ? Math.floor(overlapEnd) : null,
      hasOverlap,
    });
  }

  // Sort best slots: quality first (perfect > good), then by score, then chronologically
  const qualityOrder = { perfect: 0, good: 1, compromise: 2, unavailable: 3 };
  allBestSlots.sort((a, b) => {
    const qDiff = qualityOrder[a.quality] - qualityOrder[b.quality];
    if (qDiff !== 0) return qDiff;
    if (b.score !== a.score) return b.score - a.score;
    return a.utcDate.getTime() - b.utcDate.getTime();
  });

  const ranked = allBestSlots.slice(0, 8).map((slot, i) => ({
    ...slot,
    rank: i + 1,
  }));

  // Calculate the UTC display range
  // Cover 9am–5pm for all timezones: use min utcStart–1 to max utcEnd+1
  const allBands = days.flatMap((d) => d.workingBands);
  const minUTC = Math.max(0, Math.floor(Math.min(...allBands.map((b) => b.utcStart))) - 1);
  const maxUTC = Math.min(24, Math.ceil(Math.max(...allBands.map((b) => Math.min(b.utcEnd, 24)))) + 1);

  const weekEnd = addDays(weekStart, 4);

  return {
    weekLabel: `${format(weekStart, "MMM d")} – ${format(weekEnd, "MMM d, yyyy")}`,
    weekStart,
    weekEnd,
    days,
    bestSlots: ranked,
    hasPerfectSlots: ranked.some((s) => s.quality === "perfect"),
    hasGoodSlots: ranked.some((s) => s.quality === "good"),
    totalValidSlots: ranked.length,
    displayUTCRange: { start: minUTC, end: maxUTC },
  };
}

export function getWeekStart(date: Date): Date {
  return startOfWeek(startOfDay(date), { weekStartsOn: 1 });
}

export function nextWeek(weekStart: Date): Date {
  return addWeeks(weekStart, 1);
}

export function prevWeek(weekStart: Date): Date {
  return subWeeks(weekStart, 1);
}

export function isCurrentWeek(weekStart: Date): boolean {
  const now = getWeekStart(new Date());
  return weekStart.getTime() === now.getTime();
}

export const QUALITY_CONFIG: Record<
  SlotQuality,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  perfect: {
    label: "Perfect",
    color: "text-emerald-400",
    bg: "bg-emerald-500/20",
    border: "border-emerald-500/40",
    dot: "#10b981",
  },
  good: {
    label: "Good",
    color: "text-green-400",
    bg: "bg-green-500/15",
    border: "border-green-500/30",
    dot: "#22c55e",
  },
  compromise: {
    label: "Compromise",
    color: "text-amber-400",
    bg: "bg-amber-500/15",
    border: "border-amber-500/30",
    dot: "#f59e0b",
  },
  unavailable: {
    label: "Unavailable",
    color: "text-slate-500",
    bg: "bg-slate-800/50",
    border: "border-slate-700/30",
    dot: "#334155",
  },
};
