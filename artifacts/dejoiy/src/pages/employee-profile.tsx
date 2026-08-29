import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useListUsers, useListTasks, useListGoals, useListPerformanceReviews, useListPayroll, useListAssets } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft, Mail, Phone, MapPin, Calendar, Briefcase, Building2,
  Clock, DollarSign, Target, Star, FileText, Monitor, Activity,
  Edit, Shield, ChevronRight, Users,
} from "lucide-react";

export default function EmployeeProfile() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user: currentUser } = useAuth();
  const employeeId = params.id ? parseInt(params.id) : null;

  const { data: users, isLoading: usersLoading } = useListUsers();
  const { data: tasks } = useListTasks();
  const { data: goals } = useListGoals();
  const { data: reviews } = useListPerformanceReviews();
  const { data: payroll } = useListPayroll();
  const { data: assets } = useListAssets();

  const employee = users?.find((u) => u.id === employeeId);
  const isLoading = usersLoading;

  // Related data
  const tasksArr = Array.isArray(tasks) ? tasks : [];
  const goalsArr = Array.isArray(goals) ? goals : [];
  const reviewsArr = Array.isArray(reviews) ? reviews : [];
  const payrollArr = Array.isArray(payroll) ? payroll : [];
  const assetsArr = Array.isArray(assets) ? assets : [];
  const employeeTasks = tasksArr.filter((t) => t.assigneeId === employeeId);
  const employeeGoals = goalsArr.filter((g) => g.employeeId === employeeId);
  const employeeReviews = reviewsArr.filter((r) => r.employeeId === employeeId);
  const employeePayroll = payrollArr.filter((p) => p.employeeId === employeeId);
  const employeeAssets = assetsArr.filter((a) => a.assignedToId === employeeId);

  const isActive = currentUser?.id === employeeId;
  const canEdit = currentUser?.role === "admin" || currentUser?.role === "hr" || currentUser?.role === "manager" || isActive;

  // Calculate tenure
  const tenure = employee?.hireDate ? Math.floor((Date.now() - new Date(employee.hireDate).getTime()) / (1000 * 60 * 60 * 24 * 30)) : 0;

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="max-w-6xl mx-auto text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900">Employee Not Found</h2>
        <p className="text-gray-500 mt-2">The employee you're looking for doesn't exist.</p>
        <Button onClick={() => navigate("/people")} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Directory
        </Button>
      </div>
    );
  }

  const getDeptColor = (dept?: string | null) => {
    switch (dept) {
      case "Executive": return "bg-indigo-100 text-indigo-700";
      case "Engineering": return "bg-blue-100 text-blue-700";
      case "Product": return "bg-purple-100 text-purple-700";
      case "Design": return "bg-pink-100 text-pink-700";
      case "HR": return "bg-rose-100 text-rose-700";
      case "Finance": return "bg-emerald-100 text-emerald-700";
      case "Sales": return "bg-amber-100 text-amber-700";
      case "Marketing": return "bg-cyan-100 text-cyan-700";
      case "Operations": return "bg-orange-100 text-orange-700";
      case "IT": return "bg-violet-100 text-violet-700";
      case "Legal": return "bg-slate-100 text-slate-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back button + header */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate("/people")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Directory
        </Button>
      </div>

      {/* Profile Header Card */}
      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-[#0E1B4D] via-[#1a2f6e] to-[#2d4a9e]" />
        <CardContent className="relative px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-10">
            <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
              <AvatarFallback className={`text-2xl font-bold ${getDeptColor(employee.department)}`}>
                {(employee.name || "?").charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 pt-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{employee.name}</h1>
                {isActive && <Badge variant="outline" className="text-xs">You</Badge>}
              </div>
              <p className="text-gray-600">{employee.jobTitle}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {employee.department}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {employee.location}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {tenure} months</span>
              </div>
            </div>
            {canEdit && (
              <Button variant="outline" size="sm" className="mt-2">
                <Edit className="w-4 h-4 mr-1.5" /> Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-white dark:bg-zinc-900 border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employment">Employment</TabsTrigger>
          <TabsTrigger value="time">Time & Leave</TabsTrigger>
          <TabsTrigger value="pay">Pay</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contact Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{employee.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{employee.phone || "Not provided"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{employee.location || "Not specified"}</span>
                </div>
              </CardContent>
            </Card>

            {/* Employment Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Employment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Status</span>
                  <Badge variant={employee.status === "active" ? "default" : "secondary"}>
                    {employee.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Department</span>
                  <Badge className={getDeptColor(employee.department)}>{employee.department}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Hire Date</span>
                  <span className="text-sm font-medium">{employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : "N/A"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Employee ID</span>
                  <span className="text-sm font-mono">EMP-{String(employee.id).padStart(4, "0")}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                    <p className="text-2xl font-bold text-gray-900">{employeeTasks.length}</p>
                    <p className="text-xs text-gray-500">Tasks</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                    <p className="text-2xl font-bold text-gray-900">{employeeGoals.length}</p>
                    <p className="text-xs text-gray-500">Goals</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                    <p className="text-2xl font-bold text-gray-900">{employeeReviews.length}</p>
                    <p className="text-xs text-gray-500">Reviews</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                    <p className="text-2xl font-bold text-gray-900">{employeeAssets.length}</p>
                    <p className="text-xs text-gray-500">Assets</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Employment Tab */}
        <TabsContent value="employment" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Employment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div><p className="text-xs text-gray-500 mb-1">Job Title</p><p className="text-sm font-medium">{employee.jobTitle}</p></div>
                <div><p className="text-xs text-gray-500 mb-1">Department</p><p className="text-sm font-medium">{employee.department}</p></div>
                <div><p className="text-xs text-gray-500 mb-1">Location</p><p className="text-sm font-medium">{employee.location}</p></div>
                <div><p className="text-xs text-gray-500 mb-1">Role</p><p className="text-sm font-medium capitalize">{employee.role}</p></div>
                <div><p className="text-xs text-gray-500 mb-1">Hire Date</p><p className="text-sm font-medium">{employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : "N/A"}</p></div>
                <div><p className="text-xs text-gray-500 mb-1">Employment Status</p><p className="text-sm font-medium capitalize">{employee.status}</p></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Time & Leave Tab */}
        <TabsContent value="time" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Recent Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {employeeTasks.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No tasks assigned.</p>
              ) : (
                <div className="space-y-2">
                  {employeeTasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <div className={`w-2 h-2 rounded-full ${task.status === "done" ? "bg-emerald-500" : task.status === "in_progress" ? "bg-amber-500" : "bg-gray-300"}`} />
                      <span className="text-sm flex-1">{task.title}</span>
                      <Badge variant="outline" className="text-[10px] capitalize">{task.status.replace("_", " ")}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pay Tab */}
        <TabsContent value="pay" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Payroll History</CardTitle>
            </CardHeader>
            <CardContent>
              {employeePayroll.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No payroll records.</p>
              ) : (
                <div className="space-y-2">
                  {employeePayroll.slice(0, 6).map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                      <div>
                        <p className="text-sm font-medium">{p.period}</p>
                        <p className="text-xs text-gray-500">Base: ₹{Number(p.baseSalary).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-600">₹{Number(p.netPay).toLocaleString()}</p>
                        <Badge variant={p.status === "paid" ? "default" : "secondary"} className="text-[10px]">{p.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Goals */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Goals</CardTitle>
              </CardHeader>
              <CardContent>
                {employeeGoals.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No goals set.</p>
                ) : (
                  <div className="space-y-3">
                    {employeeGoals.map((goal) => (
                      <div key={goal.id} className="p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium truncate">{goal.title}</p>
                          <Badge variant="outline" className="text-[10px] capitalize">{goal.status.replace("_", " ")}</Badge>
                        </div>
                        <Progress value={goal.progress} className="h-1.5" />
                        <p className="text-xs text-gray-400 mt-1">{goal.progress}% complete</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {employeeReviews.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No reviews yet.</p>
                ) : (
                  <div className="space-y-3">
                    {employeeReviews.map((review) => (
                      <div key={review.id} className="p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium">{review.period}</p>
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < review.overallRating ? "text-amber-400 fill-current" : "text-gray-200"}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">{review.strengths || "No comments"}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Assets Tab */}
        <TabsContent value="assets" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Assigned Assets</CardTitle>
            </CardHeader>
            <CardContent>
              {employeeAssets.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No assets assigned.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {employeeAssets.map((asset) => (
                    <div key={asset.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Monitor className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{asset.name}</p>
                        <p className="text-xs text-gray-500">{asset.type} · {asset.serialNumber}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employee.hireDate && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <Briefcase className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Joined DEJOIY</p>
                      <p className="text-xs text-gray-500">{new Date(employee.hireDate).toLocaleDateString()} · {employee.department}</p>
                    </div>
                  </div>
                )}
                {employeeReviews.length > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                      <Star className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Performance Review: {employeeReviews[0].period}</p>
                      <p className="text-xs text-gray-500">Rating: {employeeReviews[0].overallRating}/5</p>
                    </div>
                  </div>
                )}
                {employeeGoals.length > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                      <Target className="w-4 h-4 text-violet-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{employeeGoals.length} Active Goals</p>
                      <p className="text-xs text-gray-500">{employeeGoals.filter(g => g.status === "on_track").length} on track</p>
                    </div>
                  </div>
                )}
                {employeeAssets.length > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <Monitor className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{employeeAssets.length} Assets Assigned</p>
                      <p className="text-xs text-gray-500">{employeeAssets.map(a => a.name).join(", ")}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
