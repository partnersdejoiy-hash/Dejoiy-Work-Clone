import { useAuth } from "@/hooks/use-auth";
import { useListTasks, useListUsers } from "@workspace/api-client-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Inbox, Sparkles, ArrowUpRight, CheckCircle2, Clock, Users,
  Briefcase, Target, Search,
} from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ProductivityRing } from "@/components/dashboard/productivity-ring";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { ActivityHeatmap } from "@/components/dashboard/heatmap";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: tasks } = useListTasks();
  const { data: users } = useListUsers();

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const tasksArr = Array.isArray(tasks) ? tasks : [];
  const myTasks = tasksArr.filter((t) => t.assigneeId === user?.id);
  const overdue = myTasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date());
  const teamSize = users?.length ?? 0;
  const completed = myTasks.filter((t) => t.status === "completed").length;

  return (
    <div className="relative min-h-full bg-[#F2F2F2] dark:bg-zinc-950">
      {/* Ambient gradient */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[400px] overflow-hidden">
        <div className="absolute top-[-150px] left-1/4 w-[500px] h-[500px] bg-violet-500/15 dark:bg-violet-500/10 blur-3xl rounded-full" />
        <div className="absolute top-[-100px] right-[10%] w-[400px] h-[400px] bg-blue-500/15 dark:bg-blue-500/10 blur-3xl rounded-full" />
        <div className="absolute top-[50px] left-[60%] w-[300px] h-[300px] bg-cyan-400/10 dark:bg-cyan-400/5 blur-3xl rounded-full" />
      </div>

      <div className="relative px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{today}</p>
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mt-1 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-600 dark:from-white dark:via-white dark:to-gray-400 bg-clip-text text-transparent"
            data-testid="dashboard-welcome"
          >
            {greet}, {user?.name?.split(" ")[0] ?? "there"} ✨
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">
            Here's the pulse of your workspace today. Your AI copilot has 3 new insights for you.
          </p>
        </motion.div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard label="My Open Tasks" value={myTasks.length} delta={-12} Icon={Inbox} accent="violet" delay={0.05} />
          <KpiCard label="Completed This Week" value={completed + 8} delta={18} Icon={CheckCircle2} accent="emerald" delay={0.1} />
          <KpiCard label="Active Teammates" value={teamSize} delta={3} Icon={Users} accent="blue" delay={0.15} />
          <KpiCard label="Open Roles" value={4} delta={0} Icon={Briefcase} accent="amber" delay={0.2} />
        </div>

        {/* Hero row: ring + AI insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="lg:col-span-1 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 p-6 shadow-sm overflow-hidden relative"
          >
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-gradient-to-br from-violet-500/20 to-blue-500/10 blur-3xl rounded-full" />
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Today's Score</h3>
            <ProductivityRing score={84} />
            <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
              You're in your top 15% week so far. Keep going.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-2 rounded-2xl bg-gradient-to-br from-violet-500 via-blue-500 to-cyan-500 p-[1px] shadow-lg shadow-violet-500/20"
          >
            <div className="rounded-2xl bg-white dark:bg-zinc-950 p-6 h-full relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-violet-500/10 blur-3xl rounded-full" />
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">AI Insights</h3>
                <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600">LIVE</span>
              </div>
              <div className="space-y-3">
                {[
                  { tone: "violet", title: "Productivity is up 6% this week", body: "Your morning focus blocks are paying off — keep the 9–11am routine." },
                  { tone: "amber", title: "1 task is overdue", body: `\"${overdue[0]?.title ?? "Q2 self-assessment"}\" — block 30 min to clear it.` },
                  { tone: "blue", title: "Burnout risk: low", body: "Workload is balanced across the team. Two members could take on more." },
                ].map((i, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 + idx * 0.08 }}
                    className="flex gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5"
                  >
                    <div className={`w-1 rounded-full shrink-0 ${
                      i.tone === "violet" ? "bg-violet-500"
                      : i.tone === "amber" ? "bg-amber-500"
                      : "bg-blue-500"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{i.title}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{i.body}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Chart + Awaiting */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="lg:col-span-2 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Workspace Activity</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Last 14 days · Productivity & Focus</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-violet-500" /> Productivity</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400" /> Focus</span>
              </div>
            </div>
            <ActivityChart />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden flex flex-col"
          >
            <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100 dark:border-white/5">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Awaiting Your Action</h3>
              <Link href="/tasks" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5">
                All <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="flex-1 overflow-y-auto">
              {myTasks.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">All caught up.</p>
                </div>
              ) : (
                myTasks.slice(0, 5).map((task) => {
                  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
                  return (
                    <Link key={task.id} href="/tasks" className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-white/5 border-b border-gray-50 dark:border-white/5 last:border-0">
                      <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4 text-violet-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">{task.title}</p>
                        {isOverdue && (
                          <span className="inline-block mt-1 text-[10px] font-bold tracking-wide text-rose-600 bg-rose-50 dark:bg-rose-500/10 px-1.5 py-0.5 rounded">
                            OVERDUE
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>

        {/* Heatmap + quick links */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="lg:col-span-2 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Engagement Heatmap</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Last 12 weeks across your team</p>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1"><Target className="w-3.5 h-3.5" /> +14% vs. last quarter</span>
            </div>
            <ActivityHeatmap />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 p-6 shadow-sm"
          >
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Jump back in</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Shortcuts tailored for you</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { l: "Org Chart", p: "/org-chart" },
                { l: "Payslips", p: "/payroll" },
                { l: "Open Roles", p: "/recruitment" },
                { l: "My OKRs", p: "/performance" },
              ].map((q) => (
                <Link
                  key={q.p}
                  href={q.p}
                  className="px-3 py-3 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gradient-to-br hover:from-violet-50 hover:to-blue-50 dark:hover:from-violet-500/10 dark:hover:to-blue-500/10 border border-transparent hover:border-violet-200 dark:hover:border-violet-500/20 text-sm font-medium text-gray-800 dark:text-gray-200 text-center transition-all"
                >
                  {q.l}
                </Link>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-xl bg-gradient-to-br from-violet-500/5 to-blue-500/5 dark:from-violet-500/10 dark:to-blue-500/10 border border-violet-200/40 dark:border-violet-500/20 flex items-center gap-2">
              <Search className="w-4 h-4 text-violet-500" />
              <span className="text-xs text-gray-700 dark:text-gray-300 flex-1">Press <kbd className="px-1.5 py-0.5 bg-white dark:bg-white/10 rounded text-[10px] font-mono">⌘K</kbd> to search anywhere</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
