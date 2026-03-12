"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { ConfigPanel } from "@/components/ConfigPanel";
import { ResultsPanel } from "@/components/ResultsPanel";
import {
  analyzeWeek,
  getWeekStart,
  nextWeek,
  prevWeek,
  type WeekAnalysis,
} from "@/lib/scheduler";
import { TIMEZONES, DEFAULT_TIMEZONE_IDS } from "@/lib/timezones";

export default function Home() {
  const [weekStart, setWeekStart] = useState<Date>(() =>
    getWeekStart(new Date())
  );
  const [selectedTimezoneIds, setSelectedTimezoneIds] = useState<string[]>(
    DEFAULT_TIMEZONE_IDS
  );
  const [analysis, setAnalysis] = useState<WeekAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runAnalysis = useCallback(
    (week: Date, tzIds: string[]) => {
      if (tzIds.length === 0) {
        setAnalysis(null);
        return;
      }

      setIsLoading(true);

      // Small delay for UX — lets the loading animation show
      setTimeout(() => {
        const selectedTimezones = TIMEZONES.filter((tz) =>
          tzIds.includes(tz.id)
        );
        const result = analyzeWeek(week, selectedTimezones);
        setAnalysis(result);
        setIsLoading(false);
      }, 350);
    },
    []
  );

  // Run analysis on mount and whenever inputs change
  useEffect(() => {
    runAnalysis(weekStart, selectedTimezoneIds);
  }, [weekStart, selectedTimezoneIds, runAnalysis]);

  const handleNextWeek = () => setWeekStart((w) => nextWeek(w));
  const handlePrevWeek = () => setWeekStart((w) => prevWeek(w));
  const handleGoToCurrentWeek = () => setWeekStart(getWeekStart(new Date()));

  const handleToggleTimezone = (id: string) => {
    setSelectedTimezoneIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col lg:flex-row gap-0 max-w-screen-2xl mx-auto w-full px-4 pb-8 pt-4">
        {/* Left: Config panel */}
        <aside className="lg:w-80 lg:min-w-80 lg:max-w-80 lg:sticky lg:top-4 lg:h-fit">
          <ConfigPanel
            weekStart={weekStart}
            selectedTimezoneIds={selectedTimezoneIds}
            onNextWeek={handleNextWeek}
            onPrevWeek={handlePrevWeek}
            onGoToCurrentWeek={handleGoToCurrentWeek}
            onToggleTimezone={handleToggleTimezone}
          />
        </aside>

        {/* Right: Results */}
        <div className="flex-1 min-w-0 lg:pl-4">
          <ResultsPanel
            analysis={analysis}
            isLoading={isLoading}
            selectedTimezoneIds={selectedTimezoneIds}
          />
        </div>
      </main>
    </div>
  );
}
