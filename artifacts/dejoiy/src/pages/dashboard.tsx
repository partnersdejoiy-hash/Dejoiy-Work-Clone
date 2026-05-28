import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useGetDashboardStats, useListTasks, useListAnnouncements } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, CheckSquare, Calendar, Receipt, Laptop, Bell } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: tasks, isLoading: tasksLoading } = useListTasks();
  const { data: announcements, isLoading: announcementsLoading } = useListAnnouncements();

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-[#0E1B4D]" data-testid="dashboard-welcome">Good morning, {user?.name}</h1>
        <p className="text-gray-500">{today}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Total Employees" value={stats?.totalEmployees} icon={<Users className="w-5 h-5 text-blue-500" />} isLoading={statsLoading} />
        <StatCard title="Active Tasks" value={stats?.activeTasks} icon={<CheckSquare className="w-5 h-5 text-orange-500" />} isLoading={statsLoading} />
        <StatCard title="Pending Leave" value={stats?.pendingLeaves} icon={<Calendar className="w-5 h-5 text-yellow-500" />} isLoading={statsLoading} />
        <StatCard title="Pending Expenses" value={stats?.pendingExpenses} icon={<Receipt className="w-5 h-5 text-purple-500" />} isLoading={statsLoading} />
        <StatCard title="Open Tickets" value={stats?.openTickets} icon={<Laptop className="w-5 h-5 text-red-500" />} isLoading={statsLoading} />
        <StatCard title="Unread Notifications" value={stats?.unreadNotifications} icon={<Bell className="w-5 h-5 text-teal-500" />} isLoading={statsLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>My Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {tasksLoading ? (
              <div className="space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div>
            ) : tasks?.slice(0, 5).length === 0 ? (
              <p className="text-gray-500 text-sm py-4 text-center">No active tasks.</p>
            ) : (
              <div className="space-y-3">
                {tasks?.slice(0, 5).map(task => (
                  <div key={task.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm text-[#0E1B4D]">{task.title}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{task.status}</Badge>
                        <Badge variant="outline" className="text-xs">{task.priority}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            {announcementsLoading ? (
              <div className="space-y-4"><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /></div>
            ) : announcements?.slice(0, 3).length === 0 ? (
              <p className="text-gray-500 text-sm py-4 text-center">No announcements.</p>
            ) : (
              <div className="space-y-4">
                {announcements?.slice(0, 3).map(ann => (
                  <div key={ann.id} className="border-b pb-3 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-medium text-[#0E1B4D]">{ann.title}</h3>
                      <Badge variant="secondary" className="text-xs capitalize">{ann.type}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{ann.content}</p>
                    <p className="text-xs text-gray-400 mt-2">{new Date(ann.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-4">
        <Link href="/tasks"><Button className="bg-[#F26522] hover:bg-[#d5581e] text-white">Create Task</Button></Link>
        <Link href="/time-off"><Button variant="outline">Request Time Off</Button></Link>
        <Link href="/expenses"><Button variant="outline">Submit Expense</Button></Link>
        <Link href="/it-help"><Button variant="outline">Open IT Ticket</Button></Link>
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, icon, isLoading }: { title: string, value?: number, icon: React.ReactNode, isLoading: boolean }) {
  return (
    <Card className="shadow-sm border-none shadow-[#0E1B4D]/5">
      <CardContent className="p-4 flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
        </div>
        <div>
          {isLoading ? <Skeleton className="h-8 w-16 mt-1" /> : <p className="text-2xl font-bold text-[#0E1B4D]">{value ?? 0}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
