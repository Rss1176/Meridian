"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import type { DayAnalysis, HourSlot } from "@/lib/scheduler";
import { QUALITY_CONFIG } from "@/lib/scheduler";

interface Props {
  days: DayAnalysis[];
  displayRange: { start: number; end: number };
}

interface TooltipData {
  slot: HourSlot;
  x: number;
  y: number;
  dayLabel: string;
  dateLabel: string;
}

export function OverlapVisualizer({ days, displayRange }: Props) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const totalHours = displayRange.end - displayRange.start;

  function getBarStyle(utcStart: number, utcEnd: number): React.CSSProperties {
    const clampedStart = Math.max(utcStart, displayRange.start);
    const clampedEnd = Math.min(utcEnd, displayRange.end);
    if (clampedStart >= clampedEnd) return { display: "none" };

    const left = ((clampedStart - displayRange.start) / totalHours) * 100;
    const width = ((clampedEnd - clampedStart) / totalHours) * 100;
    return { left: `${left}%`, width: `${width}%` };
  }

  function getSlotStyle(utcHour: number): React.CSSProperties {
    const left = ((utcHour - displayRange.start) / totalHours) * 100;
    const width = (1 / totalHours) * 100;
    return { left: `${left}%`, width: `${width}%` };
  }

  function handleSlotHover(
    e: React.MouseEvent,
    slot: HourSlot,
    day: DayAnalysis
  ) {
    if (slot.quality === "unavailable") {
      setTooltip(null);
      return;
    }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTooltip({
      slot,
      x: rect.left + rect.width / 2,
      y: rect.top,
      dayLabel: day.dayLabel,
      dateLabel: day.dateLabel,
    });
  }

  // Generate hour labels for x-axis
  const hourLabels: number[] = [];
  for (let h = displayRange.start; h <= displayRange.end; h++) {
    if (h % 2 === 0) hourLabels.push(h);
  }

  return (
    <div className="bg-navy-800 border border-[#1e2d4a] rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Working Hours Overlap
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Hover over coloured slots to see local times
          </p>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-slate-500">
          <span>UTC timeline</span>
        </div>
      </div>

      {/* Hour axis */}
      <div className="relative h-5 mb-2 ml-16">
        {hourLabels.map((h) => {
          const left = ((h - displayRange.start) / totalHours) * 100;
          return (
            <span
              key={h}
              className="absolute text-[10px] text-slate-600 -translate-x-1/2 font-mono"
              style={{ left: `${left}%` }}
            >
              {h === 0 || h === 24
                ? "0"
                : h < 12
                ? `${h}am`
                : h === 12
                ? "12pm"
                : `${h - 12}pm`}
            </span>
          );
        })}
      </div>

      {/* Day rows */}
      <div className="space-y-3">
        {days.map((day, di) => (
          <motion.div
            key={day.dayLabel}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: di * 0.07 }}
            className="flex items-center gap-3"
          >
            {/* Day label */}
            <div className="w-14 flex-shrink-0 text-right">
              <p className="text-xs font-medium text-slate-300">
                {day.dayLabel.slice(0, 3)}
              </p>
              <p className="text-[10px] text-slate-600">{day.dateLabel}</p>
            </div>

            {/* Timeline */}
            <div className="flex-1 relative h-9">
              {/* Background track */}
              <div className="absolute inset-y-1 left-0 right-0 rounded-md bg-navy-700/60" />

              {/* Hour grid lines */}
              {hourLabels.map((h) => {
                const left = ((h - displayRange.start) / totalHours) * 100;
                return (
                  <div
                    key={h}
                    className="absolute top-0 bottom-0 w-px bg-navy-600/40"
                    style={{ left: `${left}%` }}
                  />
                );
              })}

              {/* Timezone working bands */}
              {day.workingBands.map((band) => (
                <div
                  key={band.timezoneId}
                  className="absolute top-0.5 h-1.5 rounded-sm opacity-40"
                  style={{
                    ...getBarStyle(band.utcStart, band.utcEnd),
                    backgroundColor: band.colorHex,
                  }}
                  title={`${band.city} 9am–5pm`}
                />
              ))}

              {/* Quality-colored hour blocks (interactive) */}
              {day.slots.map((slot) => {
                if (
                  slot.utcHour < displayRange.start ||
                  slot.utcHour >= displayRange.end
                )
                  return null;
                const q = QUALITY_CONFIG[slot.quality];
                const isVisible = slot.quality !== "unavailable";
                return (
                  <div
                    key={slot.utcHour}
                    className={clsx(
                      "absolute bottom-0.5 h-5 rounded transition-all cursor-pointer",
                      isVisible
                        ? "opacity-80 hover:opacity-100 hover:scale-y-110"
                        : "opacity-0"
                    )}
                    style={{
                      ...getSlotStyle(slot.utcHour),
                      backgroundColor: q.dot,
                    }}
                    onMouseEnter={(e) => handleSlotHover(e, slot, day)}
                    onMouseLeave={() => setTooltip(null)}
                  />
                );
              })}

              {/* Overlap highlight */}
              {day.hasOverlap &&
                day.overlapStart !== null &&
                day.overlapEnd !== null && (
                  <div
                    className="absolute inset-y-1 rounded-md border border-emerald-500/30 pointer-events-none"
                    style={getBarStyle(day.overlapStart, day.overlapEnd)}
                  >
                    <div className="absolute inset-0 rounded-md bg-emerald-500/5" />
                  </div>
                )}

              {/* No overlap indicator */}
              {!day.hasOverlap && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] text-slate-600">
                    No overlap
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-[#1e2d4a] flex flex-wrap gap-3">
        {[
          { label: "Working hours per zone", type: "band" },
          { label: "Perfect", dot: "#10b981" },
          { label: "Good", dot: "#22c55e" },
          { label: "Compromise", dot: "#f59e0b" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            {item.type === "band" ? (
              <div className="w-6 h-1.5 rounded-sm bg-violet-500/40" />
            ) : (
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: item.dot }}
              />
            )}
            <span className="text-[10px] text-slate-500">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {tooltip && <SlotTooltip data={tooltip} />}
    </div>
  );
}

function SlotTooltip({ data }: { data: TooltipData }) {
  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        left: data.x,
        top: data.y - 8,
        transform: "translate(-50%, -100%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.1 }}
        className="bg-navy-700 border border-[#2d3f5f] rounded-xl p-3 shadow-xl w-52"
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-white">
            {data.dayLabel} · {data.dateLabel}
          </p>
          <span
            className={clsx(
              "text-[10px] px-1.5 py-0.5 rounded-full border",
              QUALITY_CONFIG[data.slot.quality].color,
              QUALITY_CONFIG[data.slot.quality].bg,
              QUALITY_CONFIG[data.slot.quality].border
            )}
          >
            {QUALITY_CONFIG[data.slot.quality].label}
          </span>
        </div>
        <div className="space-y-1.5">
          {data.slot.localTimes.map((lt) => (
            <div key={lt.timezoneId} className="flex items-center gap-1.5">
              <span className="text-xs">{lt.flag}</span>
              <span className="text-xs text-slate-400 flex-1 truncate">
                {lt.city}
              </span>
              <span
                className={clsx(
                  "text-xs font-mono font-medium",
                  lt.isWorkingHour ? "text-white" : "text-amber-400"
                )}
              >
                {lt.timeString}
              </span>
            </div>
          ))}
        </div>
        {/* Arrow */}
        <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#2d3f5f]" />
      </motion.div>
    </div>
  );
}
