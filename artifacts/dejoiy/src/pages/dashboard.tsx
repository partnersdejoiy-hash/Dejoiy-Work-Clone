import { useAuth } from "@/hooks/use-auth";
import { useListTasks } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Inbox, MoreHorizontal } from "lucide-react";
import { WorkdayBanner } from "@/components/layout/workday-banner";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: tasks } = useListTasks();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const myTasks = (tasks ?? []).filter((t) => t.assigneeId === user?.id).slice(0, 5);

  return (
    <div className="w-full">
      <WorkdayBanner />

      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1" data-testid="dashboard-welcome">
          Let's Focus on You
        </h1>
        <p className="text-gray-500 mb-5">It's {today}</p>

        <div className="flex flex-wrap gap-3 mb-6">
          <PillLink href="/org-chart" label="My Org Chart" />
          <PillLink href="/payroll" label="My Payslips" />
          <PillLink href="/recruitment" label="Find Jobs" />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <h2 className="text-xl font-bold text-gray-900">Awaiting Your Action</h2>
            <button className="p-1.5 rounded-full hover:bg-gray-100">
              <MoreHorizontal className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {myTasks.length === 0 ? (
              <p className="px-6 py-10 text-center text-gray-500">Nothing awaiting your action right now.</p>
            ) : (
              myTasks.map((task) => {
                const monthsAgo = monthsSince(task.createdAt);
                const overdue = task.dueDate && new Date(task.dueDate) < new Date();
                return (
                  <Link key={task.id} href="/tasks" className="block px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                        <Inbox className="w-5 h-5 text-gray-600" strokeWidth={1.8} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 leading-snug">{task.title}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          My Tasks - {monthsAgo} month(s) ago
                        </p>
                        {overdue && (
                          <span className="inline-block mt-2 text-[11px] font-bold tracking-wide text-[#E53935] bg-red-50 px-2 py-0.5 rounded">
                            OVERDUE {new Date(task.dueDate!).toLocaleDateString("en-GB").replace(/\//g, "/")}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PillLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="px-5 py-2 rounded-full border border-gray-300 text-gray-800 text-sm font-medium hover:bg-gray-50 bg-white"
    >
      {label}
    </Link>
  );
}

function monthsSince(date: string | Date): number {
  const d = new Date(date);
  const now = new Date();
  return Math.max(1, (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth()));
}
