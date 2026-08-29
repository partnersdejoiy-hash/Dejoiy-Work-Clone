import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { 
  useGetAnalyticsOverview, 
  useGetHeadcountData, 
  useGetTaskStats, 
  useGetExpenseTrends, 
  useGetLeaveBreakdown 
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Users, DollarSign, Briefcase, Star } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  AreaChart, Area
} from "recharts";

const COLORS = ['#0E1B4D', '#F26522', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444'];

export default function Analytics() {
  const { data: overview, isLoading: overviewLoading } = useGetAnalyticsOverview();
  const { data: headcountRaw, isLoading: headcountLoading } = useGetHeadcountData();
  const { data: taskStatsRaw, isLoading: taskStatsLoading } = useGetTaskStats();
  const { data: expenseTrendsRaw, isLoading: expenseTrendsLoading } = useGetExpenseTrends();
  const { data: leaveBreakdownRaw, isLoading: leaveBreakdownLoading } = useGetLeaveBreakdown();
  const headcount = Array.isArray(headcountRaw) ? headcountRaw : [];
  const taskStats = Array.isArray(taskStatsRaw) ? taskStatsRaw : [];
  const expenseTrends = Array.isArray(expenseTrendsRaw) ? expenseTrendsRaw : [];
  const leaveBreakdown = Array.isArray(leaveBreakdownRaw) ? leaveBreakdownRaw : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#0E1B4D]">Analytics & Reports</h1>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" /> Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Employees" 
          value={overview?.totalEmployees} 
          icon={<Users className="w-5 h-5 text-blue-500" />} 
          isLoading={overviewLoading} 
        />
        <StatCard 
          title="Total Payroll This Month" 
          value={overview?.totalPayroll ? `$${overview.totalPayroll.toLocaleString()}` : undefined} 
          icon={<DollarSign className="w-5 h-5 text-green-500" />} 
          isLoading={overviewLoading} 
        />
        <StatCard 
          title="Open Positions" 
          value={overview?.openPositions} 
          icon={<Briefcase className="w-5 h-5 text-orange-500" />} 
          isLoading={overviewLoading} 
        />
        <StatCard 
          title="Avg Performance Rating" 
          value={overview?.avgPerformanceRating ? overview.avgPerformanceRating.toFixed(1) : undefined} 
          icon={<Star className="w-5 h-5 text-yellow-500" />} 
          isLoading={overviewLoading} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Headcount by Department</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {headcountLoading ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={headcount} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="department" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {headcount.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasks by Status</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {taskStatsLoading ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="status"
                  >
                    {taskStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Expense Trends (6 months)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {expenseTrendsLoading ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={expenseTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="amount" stroke="#F26522" fill="#F26522" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leave Type Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {leaveBreakdownLoading ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leaveBreakdown} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" axisLine={false} tickLine={false} />
                  <YAxis dataKey="type" type="category" axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="totalDays" fill="#0E1B4D" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, isLoading }: { title: string, value?: string | number, icon: React.ReactNode, isLoading: boolean }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-3xl font-bold text-[#0E1B4D]">{value ?? 0}</p>
            )}
          </div>
          <div className="p-3 bg-gray-50 rounded-xl">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
