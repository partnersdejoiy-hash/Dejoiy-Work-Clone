import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useListTasks, useCreateTask, useUpdateTask, useDeleteTask, getListTasksQueryKey, useListUsers } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Plus, Search, LayoutGrid, List, Clock, CheckCircle2, AlertTriangle,
  MoreHorizontal, Calendar, User, Filter,
} from "lucide-react";

const COLUMNS = [
  { key: "todo", label: "To Do", color: "bg-gray-100 text-gray-700", icon: Clock },
  { key: "in_progress", label: "In Progress", color: "bg-amber-100 text-amber-700", icon: AlertTriangle },
  { key: "done", label: "Done", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  { key: "cancelled", label: "Cancelled", color: "bg-gray-100 text-gray-400", icon: MoreHorizontal },
];

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-blue-100 text-blue-700",
  low: "bg-gray-100 text-gray-600",
};

export default function TaskCenter() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: tasks, isLoading } = useListTasks();
  const { data: users } = useListUsers();
  const usersArr = Array.isArray(users) ? users : [];
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const [view, setView] = useState<"board" | "list">("board");
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "medium", assigneeId: "", dueDate: "" });

  const tasksArr = Array.isArray(tasks) ? tasks : [];
  const myTasks = tasksArr.filter((t) => t.assigneeId === user?.id || t.creatorId === user?.id);
  const filteredTasks = myTasks.filter((t) => {
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase());
    const matchPriority = filterPriority === "all" || t.priority === filterPriority;
    return matchSearch && matchPriority;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTask.mutateAsync({
        data: {
          title: newTask.title,
          description: newTask.description || undefined,
          priority: newTask.priority,
          assigneeId: newTask.assigneeId ? parseInt(newTask.assigneeId) : undefined,
          dueDate: newTask.dueDate ? new Date(newTask.dueDate).toISOString() : undefined,
        },
      });
      toast({ title: "Task created" });
      queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
      setIsCreateOpen(false);
      setNewTask({ title: "", description: "", priority: "medium", assigneeId: "", dueDate: "" });
    } catch {
      toast({ title: "Failed to create task", variant: "destructive" });
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      await updateTask.mutateAsync({ id: taskId, data: { status: newStatus } });
      queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
    } catch {
      toast({ title: "Failed to update task", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Task Center</h1>
          <p className="text-gray-500 mt-1">{filteredTasks.length} tasks · {filteredTasks.filter(t => t.status === "done").length} completed</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setView(view === "board" ? "list" : "board")}>
            {view === "board" ? <List className="w-4 h-4 mr-1.5" /> : <LayoutGrid className="w-4 h-4 mr-1.5" />}
            {view === "board" ? "List" : "Board"}
          </Button>
          <Button size="sm" onClick={() => setIsCreateOpen(true)} className="bg-[#F26522] hover:bg-[#d5581e] text-white">
            <Plus className="w-4 h-4 mr-1.5" /> New Task
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search tasks..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="urgent">🔴 Urgent</SelectItem>
            <SelectItem value="high">🟠 High</SelectItem>
            <SelectItem value="medium">🔵 Medium</SelectItem>
            <SelectItem value="low">⚪ Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-4 gap-4">{COLUMNS.map((col) => <Skeleton key={col.key} className="h-64 rounded-xl" />)}</div>
      ) : view === "board" ? (
        /* Kanban Board */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {COLUMNS.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.key);
            return (
              <div key={col.key} className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <div className={`w-2 h-2 rounded-full ${col.key === "todo" ? "bg-gray-400" : col.key === "in_progress" ? "bg-amber-500" : col.key === "done" ? "bg-emerald-500" : "bg-gray-300"}`} />
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{col.label}</h3>
                  <Badge variant="secondary" className="text-[10px] ml-auto">{colTasks.length}</Badge>
                </div>
                <div className="space-y-2 min-h-[200px]">
                  {colTasks.map((task) => {
                    const assignee = usersArr.find((u) => u.id === task.assigneeId);
                    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";
                    return (
                      <Card key={task.id} className="shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <p className="text-sm font-medium line-clamp-2 flex-1">{task.title}</p>
                            <Badge className={`text-[10px] ml-2 shrink-0 ${PRIORITY_COLORS[task.priority] || ""}`}>
                              {task.priority}
                            </Badge>
                          </div>
                          {task.description && (
                            <p className="text-xs text-gray-500 line-clamp-2 mb-2">{task.description}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              {assignee && (
                                <Avatar className="w-5 h-5">
                                  <AvatarFallback className="text-[8px] bg-gray-100">{(assignee.name || "?").charAt(0)}</AvatarFallback>
                                </Avatar>
                              )}
                              <span className="text-[10px] text-gray-400">{assignee?.name?.split(" ")[0]}</span>
                            </div>
                            {task.dueDate && (
                              <span className={`text-[10px] ${isOverdue ? "text-red-500 font-medium" : "text-gray-400"}`}>
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          {/* Quick status change */}
                          {task.status !== "done" && task.status !== "cancelled" && (
                            <div className="mt-2 pt-2 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="flex gap-1">
                                {COLUMNS.filter(c => c.key !== task.status && c.key !== "cancelled").map((c) => (
                                  <button
                                    key={c.key}
                                    onClick={(e) => { e.stopPropagation(); handleStatusChange(task.id, c.key); }}
                                    className={`text-[9px] px-1.5 py-0.5 rounded ${c.color} hover:opacity-80`}
                                  >
                                    → {c.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredTasks.map((task) => {
                const assignee = users?.find((u) => u.id === task.assigneeId);
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";
                return (
                  <div key={task.id} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5">
                    <button
                      onClick={() => handleStatusChange(task.id, task.status === "done" ? "todo" : "done")}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${task.status === "done" ? "bg-emerald-500 border-emerald-500" : "border-gray-300 hover:border-gray-400"}`}
                    >
                      {task.status === "done" && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${task.status === "done" ? "line-through text-gray-400" : ""}`}>{task.title}</p>
                      {assignee && <p className="text-xs text-gray-500">{assignee.name}</p>}
                    </div>
                    <Badge className={`text-[10px] ${PRIORITY_COLORS[task.priority] || ""}`}>{task.priority}</Badge>
                    {task.dueDate && (
                      <span className={`text-xs ${isOverdue ? "text-red-500 font-medium" : "text-gray-400"}`}>
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    <Badge variant="outline" className="text-[10px] capitalize">{task.status.replace("_", " ")}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Task Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create New Task</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input required value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} placeholder="What needs to be done?" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} placeholder="Add details..." className="h-20" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={newTask.priority} onValueChange={(v) => setNewTask({ ...newTask, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Assign To</Label>
              <Select value={newTask.assigneeId} onValueChange={(v) => setNewTask({ ...newTask, assigneeId: v })}>
                <SelectTrigger><SelectValue placeholder="Select team member" /></SelectTrigger>
                <SelectContent>
                  {usersArr.map((u) => (
                    <SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createTask.isPending} className="bg-[#F26522] hover:bg-[#d5581e] text-white">
                Create Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
