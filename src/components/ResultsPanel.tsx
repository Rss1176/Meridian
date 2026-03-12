"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, AlertTriangle, Globe2, Users } from "lucide-react";
import type { WeekAnalysis } from "@/lib/scheduler";
import { BestSlotCard } from "./BestSlotCard";
import { OverlapVisualizer } from "./OverlapVisualizer";
import { LoadingSpinner } from "./LoadingSpinner";


interface Props {
  analysis: WeekAnalysis | null;
  isLoading: boolean;
  selectedTimezoneIds: string[];
}

export function ResultsPanel({ analysis, isLoading, selectedTimezoneIds }: Props) {
  if (selectedTimezoneIds.length === 0) {
    return (
      <EmptyState
        icon={<Users className="w-8 h-8 text-slate-600" />}
        title="No timezones selected"
        message="Select at least one timezone in the config panel to get started."
      />
    );
  }

  return (
    <div className="py-4 space-y-4 relative">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-24 gap-4"
          >
            <LoadingSpinner size={44} color="#8b5cf6" />
            <p className="text-sm text-slate-400">Analysing week…</p>
          </motion.div>
        ) : analysis ? (
          <motion.div
            key={analysis.weekLabel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* Week header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">
                  {analysis.weekLabel}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedTimezoneIds.length} timezone
                  {selectedTimezoneIds.length !== 1 ? "s" : ""} · Mon – Fri
                </p>
              </div>
              <StatusBadge analysis={analysis} />
            </div>

            {/* Best slots section */}
            <div>
              <SectionHeader
                icon={<Sparkles className="w-3.5 h-3.5" />}
                title="Best Meeting Windows"
                subtitle={
                  analysis.bestSlots.length > 0
                    ? `${analysis.bestSlots.length} slot${analysis.bestSlots.length !== 1 ? "s" : ""} found`
                    : "No valid slots this week"
                }
              />

              {analysis.bestSlots.length === 0 ? (
                <NoOverlapWarning count={selectedTimezoneIds.length} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {analysis.bestSlots.map((slot, i) => (
                    <BestSlotCard key={slot.utcDate.toISOString()} slot={slot} index={i} />
                  ))}
                </div>
              )}
            </div>

            {/* Overlap visualizer */}
            <div>
              <SectionHeader
                icon={<Globe2 className="w-3.5 h-3.5" />}
                title="Weekly Overview"
                subtitle="Working hours per timezone on UTC timeline"
              />
              <OverlapVisualizer
                days={analysis.days}
                displayRange={analysis.displayUTCRange}
              />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-5 h-5 rounded flex items-center justify-center bg-gradient-brand text-white">
        {icon}
      </div>
      <div className="flex items-baseline gap-2">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <span className="text-xs text-slate-500">{subtitle}</span>
      </div>
    </div>
  );
}

function StatusBadge({ analysis }: { analysis: WeekAnalysis }) {
  if (analysis.hasPerfectSlots) {
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
        ✓ Perfect slots available
      </span>
    );
  }
  if (analysis.hasGoodSlots) {
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/15 text-green-400 border border-green-500/30">
        Good slots available
      </span>
    );
  }
  if (analysis.totalValidSlots > 0) {
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30">
        ⚠ Compromises only
      </span>
    );
  }
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/30">
      No overlap found
    </span>
  );
}

function NoOverlapWarning({ count }: { count: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 flex gap-3"
    >
      <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-medium text-amber-300">
          No working-hours overlap found
        </p>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          With {count} timezone{count !== 1 ? "s" : ""} selected, there is no
          hour that falls within 9am–5pm for all of them simultaneously this
          week. Consider checking the overlap visualizer below to understand
          the gap, or try removing a timezone to find partial overlap.
        </p>
      </div>
    </motion.div>
  );
}

function EmptyState({
  icon,
  title,
  message,
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-24 gap-3 text-center"
    >
      {icon}
      <p className="text-sm font-medium text-slate-400">{title}</p>
      <p className="text-xs text-slate-600 max-w-xs">{message}</p>
    </motion.div>
  );
}
