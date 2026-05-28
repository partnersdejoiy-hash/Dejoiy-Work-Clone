import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function ProductivityRing({ score, target = 100 }: { score: number; target?: number }) {
  const [displayed, setDisplayed] = useState(0);
  const pct = Math.min(100, Math.round((score / target) * 100));
  const r = 64;
  const c = 2 * Math.PI * r;
  const offset = c - (c * pct) / 100;

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const dur = 1100;
    const animate = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayed(Math.round(eased * score));
      if (p < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  return (
    <div className="relative w-44 h-44 mx-auto">
      <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <circle cx="80" cy="80" r={r} stroke="currentColor" strokeWidth="10" fill="none" className="text-gray-200 dark:text-white/10" />
        <motion.circle
          cx="80"
          cy="80"
          r={r}
          stroke="url(#ring-grad)"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">Productivity</span>
        <span className="text-4xl font-extrabold bg-gradient-to-br from-violet-500 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
          {displayed}
        </span>
        <span className="text-xs text-emerald-500 font-semibold">+6 this week</span>
      </div>
    </div>
  );
}
