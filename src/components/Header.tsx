"use client";

import { Globe } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export function Header() {
  const today = new Date();

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 border-b border-[#1e2d4a] glass"
    >
      <div className="max-w-screen-2xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center flex-shrink-0">
            <Globe className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold text-white tracking-tight">
              Meridian
            </span>
            <span className="text-xs text-slate-500 hidden sm:block">
              Global Meeting Scheduler
            </span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-500">Today</p>
            <p className="text-sm text-slate-300 font-medium">
              {format(today, "EEE, MMM d yyyy")}
            </p>
          </div>
          <div className="w-px h-8 bg-[#1e2d4a] hidden sm:block" />
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-slow" />
            <span className="text-xs text-slate-400">DST-aware</span>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
