import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Home, Users, Briefcase, Wallet, BarChart3, FileText, Inbox,
  Calendar, Mail, IdCard, BookOpen, Award, ClipboardList,
  Sparkles, ArrowRight, User as UserIcon
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard", Icon: Home, group: "Navigate" },
  { label: "Profile", path: "/profile", Icon: IdCard, group: "Navigate" },
  { label: "People Directory", path: "/people", Icon: Users, group: "Navigate" },
  { label: "Org Chart", path: "/org-chart", Icon: Users, group: "Navigate" },
  { label: "Tasks", path: "/tasks", Icon: Inbox, group: "Navigate" },
  { label: "Timesheets", path: "/timesheets", Icon: ClipboardList, group: "Navigate" },
  { label: "Time Off", path: "/time-off", Icon: Calendar, group: "Navigate" },
  { label: "Calendar", path: "/calendar", Icon: Calendar, group: "Navigate" },
  { label: "Performance & OKRs", path: "/performance", Icon: Award, group: "Navigate" },
  { label: "Payroll & Pay", path: "/payroll", Icon: Wallet, group: "Navigate" },
  { label: "Recruitment", path: "/recruitment", Icon: Briefcase, group: "Navigate" },
  { label: "Expenses", path: "/expenses", Icon: Wallet, group: "Navigate" },
  { label: "Analytics", path: "/analytics", Icon: BarChart3, group: "Navigate" },
  { label: "Announcements", path: "/announcements", Icon: Mail, group: "Navigate" },
  { label: "IT Help & Requests", path: "/it-help", Icon: BookOpen, group: "Navigate" },
  { label: "Assets", path: "/assets", Icon: FileText, group: "Navigate" },
];

const QUICK_ACTIONS = [
  { label: "Request Time Off", path: "/time-off", Icon: Calendar },
  { label: "Submit an Expense", path: "/expenses", Icon: Wallet },
  { label: "Open My Tasks", path: "/tasks", Icon: Inbox },
  { label: "View My Payslip", path: "/payroll", Icon: Wallet },
  { label: "Browse Open Roles", path: "/recruitment", Icon: Briefcase },
];

const AI_SUGGESTIONS = [
  "Summarize this week's team activity",
  "Who is on leave next week?",
  "Draft a thank-you message to my team",
  "What's my OKR progress this quarter?",
];

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAskAi?: (q: string) => void;
}

export function CommandPalette({ open, onOpenChange, onAskAi }: CommandPaletteProps) {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape" && open) {
        e.preventDefault();
        onOpenChange(false);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  const go = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div
            className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0.15 }}
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            className="relative w-full max-w-2xl"
          >
            <Command
              className="overflow-hidden rounded-2xl border border-white/20 dark:border-white/10 bg-white/95 dark:bg-zinc-950/90 backdrop-blur-2xl shadow-[0_20px_70px_-15px_rgba(8,117,225,0.35)]"
              shouldFilter
            >
              <div className="flex items-center gap-3 px-5 border-b border-gray-100 dark:border-white/5">
                <Search className="w-5 h-5 text-gray-400 shrink-0" />
                <Command.Input
                  value={search}
                  onValueChange={setSearch}
                  placeholder="Search Dejoiy, ask AI, or jump to anywhere…"
                  className="flex-1 h-14 bg-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400 text-base"
                  data-testid="command-palette-input"
                />
                <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-[11px] font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 rounded border border-gray-200 dark:border-white/10">
                  ESC
                </kbd>
              </div>

              <Command.List className="max-h-[60vh] overflow-y-auto p-2">
                <Command.Empty className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  No matches. Try asking the AI Assistant.
                </Command.Empty>

                {search && onAskAi && (
                  <Command.Group heading="AI" className="text-[11px] uppercase tracking-wider text-gray-400 dark:text-gray-500 px-3 pt-2 pb-1 font-semibold">
                    <Command.Item
                      onSelect={() => {
                        onOpenChange(false);
                        onAskAi(search);
                      }}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer aria-selected:bg-gradient-to-r aria-selected:from-violet-500/10 aria-selected:to-blue-500/10 dark:aria-selected:from-violet-500/20 dark:aria-selected:to-blue-500/20"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">Ask AI: "{search}"</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Get instant insights from your workspace</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </Command.Item>
                  </Command.Group>
                )}

                {!search && (
                  <Command.Group heading="Suggestions" className="text-[11px] uppercase tracking-wider text-gray-400 dark:text-gray-500 px-3 pt-2 pb-1 font-semibold">
                    {AI_SUGGESTIONS.map((s) => (
                      <Command.Item
                        key={s}
                        value={s}
                        onSelect={() => {
                          onOpenChange(false);
                          onAskAi?.(s);
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer aria-selected:bg-gray-100 dark:aria-selected:bg-white/5"
                      >
                        <Sparkles className="w-4 h-4 text-violet-500 shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-200">{s}</span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                <Command.Group heading="Quick Actions" className="text-[11px] uppercase tracking-wider text-gray-400 dark:text-gray-500 px-3 pt-3 pb-1 font-semibold">
                  {QUICK_ACTIONS.map((a) => (
                    <Command.Item
                      key={a.label}
                      value={`action ${a.label}`}
                      onSelect={() => go(a.path)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer aria-selected:bg-gray-100 dark:aria-selected:bg-white/5"
                    >
                      <a.Icon className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-200">{a.label}</span>
                    </Command.Item>
                  ))}
                </Command.Group>

                <Command.Group heading="Navigate" className="text-[11px] uppercase tracking-wider text-gray-400 dark:text-gray-500 px-3 pt-3 pb-1 font-semibold">
                  {NAV_ITEMS.map((n) => (
                    <Command.Item
                      key={n.path}
                      value={n.label}
                      onSelect={() => go(n.path)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer aria-selected:bg-gray-100 dark:aria-selected:bg-white/5"
                    >
                      <n.Icon className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-200">{n.label}</span>
                    </Command.Item>
                  ))}
                </Command.Group>

                {user && (
                  <Command.Group heading="Account" className="text-[11px] uppercase tracking-wider text-gray-400 dark:text-gray-500 px-3 pt-3 pb-1 font-semibold">
                    <Command.Item
                      value="my profile"
                      onSelect={() => go("/profile")}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer aria-selected:bg-gray-100 dark:aria-selected:bg-white/5"
                    >
                      <UserIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-200">View my profile · {user.name}</span>
                    </Command.Item>
                  </Command.Group>
                )}
              </Command.List>

              <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 dark:border-white/5 text-[11px] text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-violet-500" />
                  Powered by Dejoiy AI
                </span>
                <span className="flex items-center gap-3">
                  <span><kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-white/5 rounded">↑↓</kbd> nav</span>
                  <span><kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-white/5 rounded">↵</kbd> open</span>
                </span>
              </div>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
