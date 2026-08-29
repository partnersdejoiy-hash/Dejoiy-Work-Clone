import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { 
  useListTimesheets, useCreateTimesheet, useUpdateTimesheet, useDeleteTimesheet, getListTimesheetsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Timesheets() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: timesheetsRaw } = useListTimesheets();
  const timesheets = Array.isArray(timesheetsRaw) ? timesheetsRaw : [];
  
  const createTimesheet = useCreateTimesheet();
  const deleteTimesheet = useDeleteTimesheet();
  // const updateTimesheet = useUpdateTimesheet();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], project: "", hoursWorked: 8, description: "" });

  const totalHours = timesheets.reduce((sum, t) => sum + Number(t.hoursWorked), 0) || 0;
  
  // Basic chart data group by date
  const chartData = timesheets.reduce((acc: any[], t) => {
    const dateStr = new Date(t.date).toLocaleDateString(undefined, { weekday: 'short' });
    const existing = acc.find(a => a.name === dateStr);
    if (existing) {
      existing.hours += Number(t.hoursWorked);
    } else {
      acc.push({ name: dateStr, hours: Number(t.hoursWorked) });
    }
    return acc;
  }, []) || [];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTimesheet.mutateAsync({ data: form });
      toast({ title: "Time logged successfully" });
      queryClient.invalidateQueries({ queryKey: getListTimesheetsQueryKey() });
      setIsModalOpen(false);
      setForm({ ...form, project: "", description: "" });
    } catch(err) {
      toast({ title: "Error logging time", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTimesheet.mutateAsync({ id });
      toast({ title: "Entry deleted" });
      queryClient.invalidateQueries({ queryKey: getListTimesheetsQueryKey() });
    } catch(err) {
      toast({ title: "Error deleting entry", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#0E1B4D]">Timesheets</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Log Time
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#0E1B4D] text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-200 mb-1 font-medium text-sm">Total Hours Logged</p>
                <p className="text-4xl font-bold">{totalHours.toFixed(1)}h</p>
              </div>
              <Clock className="w-8 h-8 text-blue-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-2">
          <CardContent className="p-4 h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <YAxis hide />
                <Tooltip cursor={{fill: '#f3f4f6'}} />
                <Bar dataKey="hours" fill="#F26522" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Hours</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {timesheets?.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-6 text-gray-500">No time logged yet</TableCell></TableRow>
            ) : (
              timesheets.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{new Date(t.date).toLocaleDateString()}</TableCell>
                  <TableCell>{t.project}</TableCell>
                  <TableCell className="text-gray-500 text-sm">{t.description}</TableCell>
                  <TableCell className="text-right font-bold">{t.hoursWorked}h</TableCell>
                  <TableCell><Badge variant="secondary" className="capitalize">{t.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(t.id)} className="text-red-500 hover:bg-red-50 hover:text-red-600"><Trash className="w-4 h-4"/></Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Log Time</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Date</Label><Input type="date" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} /></div>
              <div className="space-y-2"><Label>Hours Worked</Label><Input type="number" step="0.5" required value={form.hoursWorked || ''} onChange={e => setForm({...form, hoursWorked: Number(e.target.value)})} /></div>
            </div>
            <div className="space-y-2"><Label>Project</Label><Input required placeholder="e.g. Website Redesign" value={form.project} onChange={e => setForm({...form, project: e.target.value})} /></div>
            <div className="space-y-2"><Label>Description</Label><Input placeholder="What did you work on?" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
            <DialogFooter><Button type="submit">Log Time</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
