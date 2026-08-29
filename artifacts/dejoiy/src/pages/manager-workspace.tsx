import { useAuth } from "@/hooks/use-auth";
import { useListUsers, useListTasks, useListLeaveRequests, useListExpenses, useListPerformanceReviews } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users, CheckCircle2, Clock, AlertTriangle, Target, Star,
  ArrowRight, Calendar, DollarSign, Briefcase, TrendingUp,
} from "lucide-react";

export default function ManagerWorkspace() {
  const { user } = useAuth();
  const { data: users, isLoading } = useListUsers();
  const { data: tasks } = useListTasks();
  const { data: leaveRequests } = useListLeaveRequests();
  const { data: expenses } = useListExpenses();
  const { data: reviews } = useListPerformanceReviews();

  // Safely coerce all query results to arrays
  const usersArr = Array.isArray(users) ? users : [];
  const tasksArr = Array.isArray(tasks) ? tasks : [];
  const leaveArr = Array.isArray(leaveRequests) ? leaveRequests : [];
  const expensesArr = Array.isArray(expenses) ? expenses : [];
  const reviewsArr = Array.isArray(reviews) ? reviews : [];

  // Manager's team (same department employees)
  const team = usersArr.filter(
    (u) => u.department === user?.department && u.id !== user?.id && u.role === "employee"
  );
  const teamIds = team.map((t) => t.id);

  // Team tasks
  const teamTasks = tasksArr.filter((t) => t.assigneeId && teamIds.includes(t.assigneeId));
  const overdueTasks = teamTasks.filter((t) => t.status !== "done" && t.dueDate && new Date(t.dueDate) < new Date());
  const completedTasks = teamTasks.filter((t) => t.status === "done");

  // Pending leave requests from team
  const pendingLeaves = leaveArr.filter(
    (l) => teamIds.includes(l.employeeId) && l.status === "pending"
  );

  // Pending expenses from team
  const pendingExpenses = expensesArr.filter(
    (e) => teamIds.includes(e.employeeId) && e.status === "pending"
  );

  // Team performance
  const teamReviews = reviewsArr.filter((r) => teamIds.includes(r.employeeId));
  const avgRating = teamReviews.length > 0
    ? (teamReviews.reduce((sum, r) => sum + r.overallRating, 0) / teamReviews.length).toFixed(1)
    : "—";

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-4 gap-4">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manager Workspace</h1>
        <p className="text-gray-500 mt-1">Your team overview and management actions.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{team.length}</p>
                <p className="text-xs text-gray-500">Team Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{pendingLeaves.length + pendingExpenses.length}</p>
                <p className="text-xs text-gray-500">Pending Approvals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{overdueTasks.length}</p>
                <p className="text-xs text-gray-500">Overdue Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{avgRating}</p>
                <p className="text-xs text-gray-500">Avg Performance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Members */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider">My Team</CardTitle>
            <Link href="/people">
              <Button variant="ghost" size="sm" className="text-xs">View All <ArrowRight className="w-3 h-3 ml-1" /></Button>
            </Link>
          </CardHeader>
          <CardContent>
            {team.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No team members in your department.</p>
            ) : (
              <div className="space-y-2">
                {team.map((member) => (
                  <Link key={member.id} href={`/people/${member.id}`}>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-gray-100 text-gray-600 text-xs font-bold">
                          {(member.name || "?").charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{member.name}</p>
                        <p className="text-xs text-gray-500 truncate">{member.jobTitle}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Pending Approvals</CardTitle>
            <Link href="/approvals">
              <Button variant="ghost" size="sm" className="text-xs">View All <ArrowRight className="w-3 h-3 ml-1" /></Button>
            </Link>
          </CardHeader>
          <CardContent>
            {pendingLeaves.length === 0 && pendingExpenses.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">All caught up! No pending approvals.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingLeaves.map((leave) => {
                  const employee = usersArr.find((u) => u.id === leave.employeeId);
                  return (
                    <div key={leave.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-blue-50 text-blue-600 text-xs font-bold">
                          {employee?.name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{employee?.name} — {leave.type} leave</p>
                        <p className="text-xs text-gray-500">
                          {new Date(leave.startDate).toLocaleDateString()} – {new Date(leave.endDate).toLocaleDateString()} ({leave.days} days)
                        </p>
                      </div>
                      <Badge className="bg-amber-100 text-amber-700 text-[10px]">Pending</Badge>
                    </div>
                  );
                })}
                {pendingExpenses.map((expense) => {
                  const employee = usersArr.find((u) => u.id === expense.employeeId);
                  return (
                    <div key={expense.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-green-50 text-green-600 text-xs font-bold">
                          {employee?.name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{employee?.name} — {expense.title}</p>
                        <p className="text-xs text-gray-500">₹{Number(expense.amount).toLocaleString()} · {expense.category}</p>
                      </div>
                      <Badge className="bg-amber-100 text-amber-700 text-[10px]">Pending</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Team Tasks */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Team Tasks</CardTitle>
          <Link href="/tasks">
            <Button variant="ghost" size="sm" className="text-xs">View All <ArrowRight className="w-3 h-3 ml-1" /></Button>
          </Link>
        </CardHeader>
        <CardContent>
          {teamTasks.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No tasks assigned to your team.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {teamTasks.slice(0, 6).map((task) => {
                const assignee = usersArr.find((u) => u.id === task.assigneeId);
                return (
                  <div key={task.id} className="p-3 rounded-lg border border-gray-100 dark:border-white/10 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium line-clamp-2 flex-1">{task.title}</p>
                      <Badge variant={task.status === "done" ? "default" : "secondary"} className="text-[10px] ml-2 shrink-0">
                        {task.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{assignee?.name || "Unassigned"}</span>
                      {task.dueDate && (
                        <span className={new Date(task.dueDate) < new Date() ? "text-red-500 font-medium" : ""}>
                          Due {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
