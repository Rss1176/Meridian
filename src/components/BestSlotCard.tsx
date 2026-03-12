"use client";

import { motion } from "framer-motion";
import clsx from "clsx";
import type { BestSlot } from "@/lib/scheduler";
import { QUALITY_CONFIG } from "@/lib/scheduler";

interface Props {
  slot: BestSlot;
  index: number;
}

const RANK_COLORS = [
  "from-yellow-500/30 to-amber-500/10 border-yellow-500/30",
  "from-slate-400/20 to-slate-500/10 border-slate-400/20",
  "from-orange-600/20 to-orange-700/10 border-orange-600/20",
];

const RANK_TEXT = [
  "text-yellow-400",
  "text-slate-400",
  "text-orange-400",
];

export function BestSlotCard({ slot, index }: Props) {
  const quality = QUALITY_CONFIG[slot.quality];
  const isTop3 = index < 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className={clsx(
        "rounded-xl border overflow-hidden",
        isTop3
          ? `bg-gradient-to-r ${RANK_COLORS[index]}`
          : "bg-navy-800 border-[#1e2d4a]"
      )}
    >
      {/* Header */}
      <div className="px-4 pt-3 pb-2 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {/* Rank */}
          <div
            className={clsx(
              "w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0",
              isTop3 ? RANK_TEXT[index] : "text-slate-500",
              isTop3 ? "bg-white/5" : "bg-navy-700"
            )}
          >
            {slot.rank}
          </div>

          <div>
            <p className="text-sm font-semibold text-white leading-tight">
              {slot.dayLabel}
            </p>
            <p className="text-xs text-slate-400">{slot.dateLabel}</p>
          </div>
        </div>

        {/* Quality badge */}
        <span
          className={clsx(
            "px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0",
            quality.color,
            quality.bg,
            quality.border
          )}
        >
          {quality.label}
        </span>
      </div>

      {/* Timezone times */}
      <div className="px-4 pb-3 space-y-1.5">
        {slot.localTimes.map((lt) => (
          <div key={lt.timezoneId} className="flex items-center gap-2">
            <div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: lt.colorHex }}
            />
            <span className="text-sm">{lt.flag}</span>
            <span className="text-sm text-slate-300 flex-1 truncate">
              {lt.city}
            </span>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span
                className={clsx(
                  "text-sm font-mono font-medium",
                  lt.isWorkingHour
                    ? lt.hourScore === 2
                      ? "text-emerald-400"
                      : "text-green-400"
                    : "text-amber-400"
                )}
              >
                {lt.timeString}
              </span>
              {!lt.isWorkingHour && (
                <span className="text-[10px] text-amber-500 border border-amber-500/30 rounded px-1">
                  outside
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Score bar */}
      <div className="px-4 pb-3">
        <div className="h-1 rounded-full bg-navy-700 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${(slot.score / (slot.localTimes.length * 2)) * 100}%`,
            }}
            transition={{ duration: 0.6, delay: index * 0.06 + 0.2 }}
            className="h-full rounded-full bg-gradient-brand"
          />
        </div>
      </div>
    </motion.div>
  );
}
