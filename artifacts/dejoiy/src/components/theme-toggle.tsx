import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  const next = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(next)}
      className="relative p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
      aria-label="Toggle theme"
      data-testid="theme-toggle"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme === "system" ? "system" : isDark ? "moon" : "sun"}
          initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {theme === "system" ? (
            <Monitor className="w-5 h-5 text-gray-700 dark:text-gray-200" strokeWidth={2} />
          ) : isDark ? (
            <Moon className="w-5 h-5 text-gray-200" strokeWidth={2} />
          ) : (
            <Sun className="w-5 h-5 text-gray-700" strokeWidth={2} />
          )}
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
