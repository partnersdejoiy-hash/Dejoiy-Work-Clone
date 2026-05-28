import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useListTasks, useListUsers, useCreateTask, useUpdateTask, useDeleteTask, getListTasksQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Clock } from "lucide-react";

const PRIORITIES = ["urgent", "high", "medium", "low"];
const STATUSES = ["todo", "in_progress", "done"];

const getPriorityColor = (p: string) => {
  switch (p) {
    case 'urgent': return 'bg-red-100 text-red-800';
    case 'high': return 'bg-orange-100 text-orange-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function Tasks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [filter, setFilter] = useState("all");
  const { data: tasks } = useListTasks();
  const { data: users } = useListUsers();
  
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    title: "", description: "", assigneeId: "", status: "todo", priority: "medium", dueDate: ""
  });

  const displayTasks = tasks?.filter(t => filter === "all" || t.assigneeId === user?.id) || [];

  const handleOpenNew = () => {
    setEditingTask(null);
    setFormData({ title: "", description: "", assigneeId: "", status: "todo", priority: "medium", dueDate: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task: any) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      assigneeId: task.assigneeId?.toString() || "",
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : ""
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        assigneeId: formData.assigneeId ? parseInt(formData.assigneeId) : undefined,
      };
      
      if (editingTask) {
        await updateTask.mutateAsync({ id: editingTask.id, data });
        toast({ title: "Task updated" });
      } else {
        await createTask.mutateAsync({ data });
        toast({ title: "Task created" });
      }
      queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
      setIsModalOpen(false);
    } catch (err) {
      toast({ title: "Error saving task", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!editingTask) return;
    try {
      await deleteTask.mutateAsync({ id: editingTask.id });
      queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
      toast({ title: "Task deleted" });
      setIsModalOpen(false);
    } catch (err) {
      toast({ title: "Error deleting task", variant: "destructive" });
    }
  };

  const isOverdue = (dateStr: string) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date(new Date().setHours(0,0,0,0));
  };

  const Column = ({ title, status, color }: { title: string, status: string, color: string }) => {
    const columnTasks = displayTasks.filter(t => t.status === status);
    
    return (
      <div className="flex flex-col bg-gray-50 rounded-xl p-4 h-full min-h-[500px]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[#0E1B4D]">{title}</h3>
          <Badge className={`${color} text-white`}>{columnTasks.length}</Badge>
        </div>
        <div className="flex-1 space-y-3">
          {columnTasks.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No tasks here</p>}
          {columnTasks.map(task => (
            <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleOpenEdit(task)}>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-medium text-sm text-[#0E1B4D] leading-tight">{task.title}</h4>
                  <Badge variant="outline" className={`${getPriorityColor(task.priority)} border-none text-[10px] px-1.5 py-0`}>{task.priority}</Badge>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{users?.find(u => u.id === task.assigneeId)?.name || 'Unassigned'}</span>
                  {task.dueDate && (
                    <span className={`flex items-center gap-1 ${isOverdue(task.dueDate) ? 'text-red-500 font-medium' : ''}`}>
                      <Clock className="w-3 h-3" />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-[#0E1B4D]">Tasks</h1>
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList>
              <TabsTrigger value="all">All Tasks</TabsTrigger>
              <TabsTrigger value="my">My Tasks</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <Button className="bg-[#F26522] hover:bg-[#d5581e] text-white" onClick={handleOpenNew}>
          <Plus className="w-4 h-4 mr-2" /> Create Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Column title="To Do" status="todo" color="bg-gray-400" />
        <Column title="In Progress" status="in_progress" color="bg-blue-500" />
        <Column title="Done" status="done" color="bg-green-500" />
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingTask ? "Edit Task" : "Create Task"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2"><Label>Title</Label><Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={formData.priority} onValueChange={v => setFormData({...formData, priority: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assignee</Label>
                <Select value={formData.assigneeId} onValueChange={v => setFormData({...formData, assigneeId: v})}>
                  <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {users?.map(u => <SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
              </div>
            </div>
            
            <DialogFooter className="flex justify-between w-full sm:justify-between items-center mt-4 pt-4 border-t border-gray-100">
              {editingTask ? (
                <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleteTask.isPending}>Delete</Button>
              ) : <div></div>}
              <Button type="submit" className="bg-[#0E1B4D] hover:bg-[#1a2e7a]" disabled={createTask.isPending || updateTask.isPending}>
                {editingTask ? "Save Changes" : "Create Task"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}