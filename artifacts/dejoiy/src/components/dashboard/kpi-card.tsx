import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: number;
  suffix?: string;
  delta?: number;
  Icon: LucideIcon;
  accent: "violet" | "blue" | "emerald" | "amber" | "pink";
  delay?: number;
}

const ACCENT: Record<KpiCardProps["accent"], { from: string; to: string; text: string; glow: string }> = {
  violet: { from: "from-violet-500", to: "to-fuchsia-500", text: "text-violet-500", glow: "shadow-violet-500/20" },
  blue: { from: "from-blue-500", to: "to-cyan-400", text: "text-blue-500", glow: "shadow-blue-500/20" },
  emerald: { from: "from-emerald-500", to: "to-teal-400", text: "text-emerald-500", glow: "shadow-emerald-500/20" },
  amber: { from: "from-amber-500", to: "to-orange-400", text: "text-amber-500", glow: "shadow-amber-500/20" },
  pink: { from: "from-pink-500", to: "to-rose-400", text: "text-pink-500", glow: "shadow-pink-500/20" },
};

export function KpiCard({ label, value, suffix = "", delta, Icon, accent, delay = 0 }: KpiCardProps) {
  const a = ACCENT[accent];
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const dur = 900;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const positive = (delta ?? 0) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      whileHover={{ y: -2 }}
      className={`relative overflow-hidden rounded-2xl p-5 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-xl ${a.glow} transition-shadow`}
    >
      <div className={`absolute -top-12 -right-12 w-28 h-28 rounded-full bg-gradient-to-br ${a.from} ${a.to} opacity-10 blur-2xl`} />
      <div className="relative flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.from} ${a.to} flex items-center justify-center shadow-md`}>
          <Icon className="w-5 h-5 text-white" strokeWidth={2.2} />
        </div>
        {typeof delta === "number" && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${positive ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" : "text-rose-600 bg-rose-50 dark:bg-rose-500/10"}`}>
            {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      <div className="relative mt-4">
        <p className="text-3xl font-extrabold text-gray-900 dark:text-white tabular-nums">
          {n.toLocaleString()}
          <span className="text-base font-semibold text-gray-500 dark:text-gray-400 ml-1">{suffix}</span>
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">{label}</p>
      </div>
    </motion.div>
  );
}
