import { motion } from "framer-motion";

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const WEEKS = 12;

function gen() {
  return Array.from({ length: WEEKS * 7 }).map(() => Math.round(Math.random() * 4));
}

export function ActivityHeatmap() {
  const cells = gen();

  return (
    <div>
      <div className="flex items-end gap-1">
        <div className="flex flex-col gap-1 mr-1 text-[10px] text-gray-400 dark:text-gray-500 font-medium">
          {DAYS.map((d, i) => (
            <span key={i} className="h-3 leading-3">{i % 2 === 0 ? d : ""}</span>
          ))}
        </div>
        <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto">
          {cells.map((v, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.25, delay: i * 0.004 }}
              className={`w-3 h-3 rounded-[3px] ${
                v === 0 ? "bg-gray-100 dark:bg-white/5"
                : v === 1 ? "bg-violet-200 dark:bg-violet-500/30"
                : v === 2 ? "bg-violet-400 dark:bg-violet-500/60"
                : v === 3 ? "bg-blue-500 dark:bg-blue-500/80"
                : "bg-cyan-400 dark:bg-cyan-400"
              }`}
              title={`Activity level ${v}`}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center justify-end gap-1.5 mt-3 text-[10px] text-gray-500 dark:text-gray-400">
        <span>less</span>
        {[0, 1, 2, 3, 4].map((v) => (
          <div key={v} className={`w-3 h-3 rounded-[3px] ${
            v === 0 ? "bg-gray-100 dark:bg-white/5"
            : v === 1 ? "bg-violet-200 dark:bg-violet-500/30"
            : v === 2 ? "bg-violet-400 dark:bg-violet-500/60"
            : v === 3 ? "bg-blue-500 dark:bg-blue-500/80"
            : "bg-cyan-400 dark:bg-cyan-400"
          }`} />
        ))}
        <span>more</span>
      </div>
    </div>
  );
}
