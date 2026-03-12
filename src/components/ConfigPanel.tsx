"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  RotateCcw,
  Check,
  Plus,
} from "lucide-react";
import { format } from "date-fns";
import { TIMEZONES, REGION_LABELS, type TimezoneConfig } from "@/lib/timezones";
import { isCurrentWeek } from "@/lib/scheduler";
import clsx from "clsx";

interface Props {
  weekStart: Date;
  selectedTimezoneIds: string[];
  onNextWeek: () => void;
  onPrevWeek: () => void;
  onGoToCurrentWeek: () => void;
  onToggleTimezone: (id: string) => void;
}

const REGIONS: Array<"US" | "UK" | "EU"> = ["US", "UK", "EU"];

export function ConfigPanel({
  weekStart,
  selectedTimezoneIds,
  onNextWeek,
  onPrevWeek,
  onGoToCurrentWeek,
  onToggleTimezone,
}: Props) {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 4);
  const isCurrent = isCurrentWeek(weekStart);

  const groupedTimezones = REGIONS.reduce(
    (acc, region) => {
      acc[region] = TIMEZONES.filter((tz) => tz.region === region);
      return acc;
    },
    {} as Record<string, TimezoneConfig[]>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="space-y-3 py-4"
    >
      {/* Week Picker */}
      <div className="bg-navy-800 border border-[#1e2d4a] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Week
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 mb-2">
          <button
            onClick={onPrevWeek}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-navy-700 hover:bg-navy-600 border border-[#1e2d4a] hover:border-[#2d3f5f] text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="text-center flex-1">
            <p className="text-sm font-semibold text-white">
              {format(weekStart, "MMM d")} –{" "}
              <span className="text-slate-300">{format(weekEnd, "MMM d")}</span>
            </p>
            <p className="text-xs text-slate-500">{format(weekStart, "yyyy")}</p>
          </div>

          <button
            onClick={onNextWeek}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-navy-700 hover:bg-navy-600 border border-[#1e2d4a] hover:border-[#2d3f5f] text-slate-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <AnimatePresence>
          {!isCurrent && (
            <motion.button
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onClick={onGoToCurrentWeek}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-navy-700 transition-colors mt-1"
            >
              <RotateCcw className="w-3 h-3" />
              Back to current week
            </motion.button>
          )}
        </AnimatePresence>

        {/* Day pills */}
        <div className="grid grid-cols-5 gap-1 mt-3">
          {["M", "T", "W", "T", "F"].map((d, i) => {
            const dayDate = new Date(weekStart);
            dayDate.setDate(weekStart.getDate() + i);
            const isToday =
              dayDate.toDateString() === new Date().toDateString();
            return (
              <div
                key={i}
                className={clsx(
                  "flex flex-col items-center py-1.5 rounded-lg text-xs",
                  isToday
                    ? "bg-gradient-brand text-white font-semibold"
                    : "bg-navy-700/50 text-slate-500"
                )}
              >
                <span>{d}</span>
                <span className={clsx("text-[10px]", isToday ? "text-white/80" : "text-slate-600")}>
                  {format(dayDate, "d")}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timezone Selector */}
      <div className="bg-navy-800 border border-[#1e2d4a] rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Timezones
          </span>
          <span className="text-xs text-slate-500">
            {selectedTimezoneIds.length} selected
          </span>
        </div>

        <div className="space-y-4">
          {REGIONS.map((region) => (
            <div key={region}>
              <p className="text-xs text-slate-500 mb-2 pl-1">
                {REGION_LABELS[region]}
              </p>
              <div className="space-y-1">
                {groupedTimezones[region].map((tz) => {
                  const isSelected = selectedTimezoneIds.includes(tz.id);
                  return (
                    <TimezoneRow
                      key={tz.id}
                      tz={tz}
                      isSelected={isSelected}
                      onToggle={() => onToggleTimezone(tz.id)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info note */}
      <div className="px-4 py-3 rounded-xl border border-[#1e2d4a] bg-navy-800/50">
        <p className="text-xs text-slate-500 leading-relaxed">
          Working hours are set to{" "}
          <span className="text-slate-300">9:00 AM – 5:00 PM</span>, Monday –
          Friday. DST transitions are handled automatically.
        </p>
      </div>
    </motion.div>
  );
}

function TimezoneRow({
  tz,
  isSelected,
  onToggle,
}: {
  tz: TimezoneConfig;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 0.98 }}
      className={clsx(
        "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all",
        isSelected
          ? "bg-navy-700 border border-[#2d3f5f]"
          : "border border-transparent hover:bg-navy-700/50"
      )}
    >
      {/* Color dot */}
      <div
        className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-opacity"
        style={{
          backgroundColor: tz.colorHex,
          opacity: isSelected ? 1 : 0.3,
        }}
      />

      {/* Flag + city */}
      <span className="text-sm">{tz.flag}</span>
      <div className="flex-1 min-w-0">
        <span
          className={clsx(
            "text-sm truncate",
            isSelected ? "text-white" : "text-slate-500"
          )}
        >
          {tz.city}
        </span>
      </div>

      {/* Short label */}
      <span
        className={clsx(
          "text-[10px] font-mono flex-shrink-0",
          isSelected ? "text-slate-400" : "text-slate-600"
        )}
      >
        {tz.shortLabel}
      </span>

      {/* Toggle icon */}
      <div
        className={clsx(
          "w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-colors",
          isSelected ? "bg-emerald-500/20" : "bg-navy-700"
        )}
      >
        {isSelected ? (
          <Check className="w-2.5 h-2.5 text-emerald-400" />
        ) : (
          <Plus className="w-2.5 h-2.5 text-slate-600" />
        )}
      </div>
    </motion.button>
  );
}
