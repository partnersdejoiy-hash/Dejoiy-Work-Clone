import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  useListTasks,
  useListNotifications,
  useListUsers,
  useListLeaveRequests,
  useListPayroll,
  useListAnnouncements,
  useListExpenses,
} from "@workspace/api-client-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ChevronLeft, ChevronRight, MoreHorizontal,
  FileText, Bell, AlertCircle,
} from "lucide-react";

/* ═══════════════════════════════════════════════
   Home Page — Workday-style Enterprise Dashboard
   ═══════════════════════════════════════════════ */

function HeroBanner() {
  return (
    <div className="w-full overflow-hidden rounded-b-xl" style={{ height: 220 }}>
      <svg viewBox="0 0 1440 220" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
        {/* Background sections */}
        <rect x="0" y="0" width="240" height="220" fill="#FF6B9D" />
        <rect x="240" y="0" width="240" height="220" fill="#00BCD4" />
        <rect x="480" y="0" width="240" height="220" fill="#FFC107" />
        <rect x="720" y="0" width="240" height="220" fill="#FF9800" />
        <rect x="960" y="0" width="240" height="220" fill="#E91E63" />
        <rect x="1200" y="0" width="240" height="220" fill="#9C27B0" />

        {/* Pink section - houses & trees */}
        <rect x="20" y="140" width="50" height="60" fill="#fff" rx="4" />
        <rect x="28" y="125" width="34" height="20" fill="#FF5252" />
        <rect x="80" y="120" width="45" height="80" fill="#fff" rx="4" />
        <rect x="88" y="105" width="29" height="20" fill="#E91E63" />
        <rect x="140" y="100" width="30" height="100" fill="#fff" rx="3" />
        <rect x="148" y="88" width="14" height="16" fill="#FF5252" />

        {/* Decorative arches on pink */}
        <path d="M 30 160 Q 60 100 90 160" stroke="#fff" strokeWidth="5" fill="none" opacity="0.7" />
        <path d="M 100 160 Q 130 100 160 160" stroke="#fff" strokeWidth="5" fill="none" opacity="0.7" />

        {/* Teal section - geometric shapes */}
        <circle cx="280" cy="80" r="30" fill="#fff" opacity="0.3" />
        <circle cx="320" cy="130" r="20" fill="#fff" opacity="0.2" />
        <rect x="360" y="60" width="40" height="80" fill="#fff" opacity="0.2" rx="20" />
        <path d="M 260 180 L 290 100 L 320 180 Z" fill="#fff" opacity="0.3" />
        <circle cx="400" cy="160" r="25" fill="#fff" opacity="0.25" />

        {/* Yellow section - dots pattern */}
        {Array.from({ length: 6 }).map((_, row) =>
          Array.from({ length: 5 }).map((_, col) => (
            <circle key={`dot-${row}-${col}`} cx={500 + col * 35} cy={30 + row * 30} r="5" fill="#fff" opacity="0.5" />
          ))
        )}

        {/* Orange section - wavy lines */}
        <path d="M 740 180 Q 770 100 800 180 T 860 180" stroke="#fff" strokeWidth="4" fill="none" opacity="0.5" />
        <path d="M 760 180 Q 790 100 820 180 T 880 180" stroke="#fff" strokeWidth="4" fill="none" opacity="0.5" />
        <path d="M 780 180 Q 810 100 840 180 T 900 180" stroke="#fff" strokeWidth="4" fill="none" opacity="0.5" />

        {/* People silhouettes */}
        <circle cx="820" cy="70" r="18" fill="#fff" opacity="0.8" />
        <ellipse cx="820" cy="120" rx="20" ry="25" fill="#fff" opacity="0.8" />

        <circle cx="920" cy="80" r="16" fill="#fff" opacity="0.7" />
        <ellipse cx="920" cy="125" rx="18" ry="22" fill="#fff" opacity="0.7" />

        {/* Pink/magenta section - flowers */}
        <circle cx="1020" cy="120" r="15" fill="#fff" opacity="0.5" />
        <circle cx="1010" cy="110" r="8" fill="#FFC107" opacity="0.7" />
        <circle cx="1030" cy="110" r="8" fill="#FFC107" opacity="0.7" />
        <circle cx="1015" cy="125" r="8" fill="#FFC107" opacity="0.7" />
        <circle cx="1025" cy="125" r="8" fill="#FFC107" opacity="0.7" />
        <circle cx="1020" cy="115" r="6" fill="#FF5722" opacity="0.8" />

        <circle cx="1100" cy="140" r="12" fill="#fff" opacity="0.4" />
        <circle cx="1090" cy="132" r="6" fill="#FFC107" opacity="0.6" />
        <circle cx="1110" cy="132" r="6" fill="#FFC107" opacity="0.6" />
        <circle cx="1100" cy="128" r="5" fill="#E91E63" opacity="0.7" />

        {/* Purple section - stripes and arches */}
        <rect x="1220" y="40" width="60" height="3" fill="#fff" opacity="0.4" />
        <rect x="1220" y="55" width="60" height="3" fill="#fff" opacity="0.4" />
        <rect x="1220" y="70" width="60" height="3" fill="#fff" opacity="0.4" />
        <rect x="1220" y="85" width="60" height="3" fill="#fff" opacity="0.4" />
        <rect x="1220" y="100" width="60" height="3" fill="#fff" opacity="0.4" />

        <path d="M 1300 180 Q 1340 100 1380 180" stroke="#fff" strokeWidth="5" fill="none" opacity="0.5" />
        <path d="M 1340 180 Q 1380 100 1420 180" stroke="#fff" strokeWidth="5" fill="none" opacity="0.5" />

        <circle cx="1350" cy="60" r="20" fill="#fff" opacity="0.3" />
        <circle cx="1350" cy="60" r="10" fill="#FFC107" opacity="0.5" />

        {/* Tree silhouettes */}
        <circle cx="160" cy="80" r="22" fill="#4CAF50" opacity="0.7" />
        <rect x="157" y="100" width="6" height="30" fill="#795548" opacity="0.7" />

        <circle cx="620" cy="70" r="18" fill="#4CAF50" opacity="0.6" />
        <rect x="617" y="86" width="6" height="25" fill="#795548" opacity="0.6" />

        {/* Plant in teal section */}
        <path d="M 350 190 Q 360 140 380 190" stroke="#fff" strokeWidth="4" fill="none" opacity="0.6" />
        <path d="M 370 190 Q 380 150 395 190" stroke="#4CAF50" strokeWidth="4" fill="none" opacity="0.6" />

        {/* Person silhouettes (darker) */}
        <circle cx="180" cy="110" r="14" fill="#5D4037" opacity="0.8" />
        <ellipse cx="180" cy="150" rx="16" ry="20" fill="#5D4037" opacity="0.8" />

        <circle cx="1120" cy="70" r="14" fill="#5D4037" opacity="0.7" />
        <ellipse cx="1120" cy="108" rx="16" ry="18" fill="#5D4037" opacity="0.7" />
      </svg>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [annPage, setAnnPage] = useState(0);

  // Data fetches
  const { data: tasksRaw } = useListTasks();
  const { data: announcementsRaw } = useListAnnouncements();

  // Safe arrays
  const tasks = useMemo(() => Array.isArray(tasksRaw) ? tasksRaw : [], [tasksRaw]);
  const announcements = useMemo(() => Array.isArray(announcementsRaw) ? announcementsRaw : [], [announcementsRaw]);

  // Derived
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const firstName = user?.name?.split(" ")[0] ?? "Employee";

  const myTasks = useMemo(() => tasks.filter((t) => t.assigneeId === user?.id), [tasks, user?.id]);
  const actionItems = useMemo(() => myTasks.filter((t) => t.status === "todo" || t.status === "in_progress"), [myTasks]);

  const annTotal = announcements.length || 1;
  const annIdx = annPage % annTotal;
  const currentAnn = announcements[annIdx];

  return (
    <div className="w-full space-y-0 bg-[#F0F0F0] min-h-full">
      {/* ═══ COLORFUL HERO BANNER ═══ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <HeroBanner />
      </motion.div>

      {/* ═══ GREETING + DATE ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="bg-white px-6 sm:px-10 py-6"
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Let's Focus on You
          </h1>
          <p className="text-sm text-gray-500 shrink-0">
            It's {today}
          </p>
        </div>
      </motion.div>

      {/* ═══ PILL BUTTONS ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        className="bg-white px-6 sm:px-10 pb-5"
      >
        <div className="max-w-6xl mx-auto flex flex-wrap gap-3">
          <Link
            href="/org-chart"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
          >
            My Org Chart
          </Link>
          <Link
            href="/payroll"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
          >
            My Payslips
          </Link>
          <Link
            href="/recruitment"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
          >
            Find Jobs
          </Link>
        </div>
      </motion.div>

      {/* ═══ TWO-COLUMN: AWAITING ACTION + ANNOUNCEMENTS ═══ */}
      <div className="bg-[#F0F0F0] px-6 sm:px-10 py-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* ── Awaiting Your Action ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Awaiting Your Action</h2>
              <button className="p-1 rounded hover:bg-gray-100 transition-colors text-gray-400">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              {actionItems.length === 0 ? (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">No pending actions</p>
                    <p className="text-xs text-gray-500">You're all caught up!</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {actionItems.slice(0, 5).map((task) => {
                    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
                    return (
                      <Link
                        key={task.id}
                        href="/tasks"
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                          {isOverdue ? (
                            <AlertCircle className="w-5 h-5 text-red-500" />
                          ) : (
                            <FileText className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 leading-snug group-hover:text-blue-600 transition-colors">
                            {task.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            My Tasks
                            {task.dueDate && (
                              <> · {isOverdue ? "Overdue" : `Due ${new Date(task.dueDate).toLocaleDateString()}`}</>
                            )}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>

          {/* ── Announcements ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.25 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Announcements</h2>
              {announcements.length > 1 && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{annIdx + 1} of {annTotal}</span>
                  <button
                    onClick={() => setAnnPage((p) => (p - 1 + annTotal) % annTotal)}
                    className="p-1 rounded hover:bg-gray-100 transition-colors"
                    aria-label="Previous announcement"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setAnnPage((p) => (p + 1) % annTotal)}
                    className="p-1 rounded hover:bg-gray-100 transition-colors"
                    aria-label="Next announcement"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="p-5">
              {announcements.length === 0 ? (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <Bell className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">No announcements yet</p>
                    <p className="text-xs text-gray-500">Check back later for updates</p>
                  </div>
                </div>
              ) : currentAnn ? (
                <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
                  <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center">
                      <Bell className="w-10 h-10 text-gray-300" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                      {currentAnn.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1.5 line-clamp-3">
                      {currentAnn.content}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-2">
                      {new Date(currentAnn.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>

        </div>
      </div>

      {/* ═══ BOTTOM SPACER ═══ */}
      <div className="h-8" />
    </div>
  );
}
