import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useListLeaveRequests, useCreateLeaveRequest, useUpdateLeaveRequest, getListLeaveRequestsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Plus } from "lucide-react";

const LEAVE_TYPES = ["vacation", "sick", "personal", "maternity", "other"];

export default function TimeOff() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [tab, setTab] = useState("my");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: requestsRaw } = useListLeaveRequests();
  const requests = Array.isArray(requestsRaw) ? requestsRaw : [];
  
  const createRequest = useCreateLeaveRequest();
  const updateRequest = useUpdateLeaveRequest();
  
  const [formData, setFormData] = useState({
    type: "vacation", startDate: "", endDate: "", reason: ""
  });

  const displayRequests = requests.filter(r => tab === "all" ? true : r.employeeId === user?.id) || [];
  
  const myApproved = requests.filter(r => r.employeeId === user?.id && r.status === "approved") || [];
  const usedVacation = myApproved.filter(r => r.type === "vacation").reduce((sum, r) => sum + r.days, 0);
  const usedSick = myApproved.filter(r => r.type === "sick").reduce((sum, r) => sum + r.days, 0);
  const usedPersonal = myApproved.filter(r => r.type === "personal").reduce((sum, r) => sum + r.days, 0);

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = Math.abs(e.getTime() - s.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const days = calculateDays(formData.startDate, formData.endDate);
      const result = await createRequest.mutateAsync({ data: { ...formData, days } });
      // Create approval request for workflow
      try {
        await fetch("/api/approvals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entityType: "leave_request",
            entityId: (result as any)?.id || 0,
            title: `${(formData.type || "leave").charAt(0).toUpperCase() + (formData.type || "leave").slice(1)} Request — ${days} days`,
            summary: `${user?.name} requests ${formData.type} from ${formData.startDate} to ${formData.endDate}`,
            priority: "normal",
          }),
        });
      } catch {}
      queryClient.invalidateQueries({ queryKey: getListLeaveRequestsQueryKey() });
      toast({ title: "Leave request submitted for approval" });
      setIsModalOpen(false);
      setFormData({ type: "vacation", startDate: "", endDate: "", reason: "" });
    } catch (err) {
      toast({ title: "Error submitting request", variant: "destructive" });
    }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await updateRequest.mutateAsync({ id, data: { status } });
      queryClient.invalidateQueries({ queryKey: getListLeaveRequestsQueryKey() });
      toast({ title: `Request ${status}` });
    } catch (err) {
      toast({ title: "Error updating status", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'approved': return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case 'rejected': return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      default: return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#0E1B4D]">Time Off</h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#F26522] hover:bg-[#d5581e] text-white">
              <Plus className="w-4 h-4 mr-2" /> Request Time Off
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Request Time Off</DialogTitle></DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label>Leave Type</Label>
                <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LEAVE_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Start Date</Label><Input type="date" required value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} /></div>
                <div className="space-y-2"><Label>End Date</Label><Input type="date" required value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} /></div>
              </div>
              <div className="space-y-2">
                <Label>Reason (Optional)</Label>
                <Textarea value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createRequest.isPending}>Submit Request</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold mb-4">Vacation (15 days)</h3>
            <Progress value={(usedVacation / 15) * 100} className="mb-2 h-2" />
            <p className="text-sm text-gray-500">{usedVacation} days used, {15 - usedVacation} remaining</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold mb-4">Sick Leave (10 days)</h3>
            <Progress value={(usedSick / 10) * 100} className="mb-2 h-2 [&>div]:bg-orange-500" />
            <p className="text-sm text-gray-500">{usedSick} days used, {10 - usedSick} remaining</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold mb-4">Personal (5 days)</h3>
            <Progress value={(usedPersonal / 5) * 100} className="mb-2 h-2 [&>div]:bg-purple-500" />
            <p className="text-sm text-gray-500">{usedPersonal} days used, {5 - usedPersonal} remaining</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b">
            {(user?.role === "admin" || user?.role === "manager") ? (
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList>
                  <TabsTrigger value="my">My Requests</TabsTrigger>
                  <TabsTrigger value="all">All Requests</TabsTrigger>
                </TabsList>
              </Tabs>
            ) : (
              <h3 className="font-bold text-lg">My Requests</h3>
            )}
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayRequests.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">No requests found</TableCell></TableRow>
              ) : (
                displayRequests.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="capitalize font-medium">{r.type}</TableCell>
                    <TableCell>{new Date(r.startDate).toLocaleDateString()} - {new Date(r.endDate).toLocaleDateString()}</TableCell>
                    <TableCell>{r.days}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{r.reason || '-'}</TableCell>
                    <TableCell>{getStatusBadge(r.status)}</TableCell>
                    <TableCell>
                      {tab === "all" && r.status === "pending" && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleStatusUpdate(r.id, 'approved')}>Approve</Button>
                          <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleStatusUpdate(r.id, 'rejected')}>Reject</Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}