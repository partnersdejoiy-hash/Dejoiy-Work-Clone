import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useListItTickets, useCreateItTicket, useUpdateItTicket, getListItTicketsQueryKey } from "@workspace/api-client-react";
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
import { Plus } from "lucide-react";

const CATEGORIES = ["hardware", "software", "network", "access", "other"];
const PRIORITIES = ["urgent", "high", "medium", "low"];

const getPriorityColor = (p: string) => {
  switch (p) {
    case 'urgent': return 'bg-red-100 text-red-800';
    case 'high': return 'bg-orange-100 text-orange-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusBadge = (status: string) => {
  switch(status) {
    case 'open': return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Open</Badge>;
    case 'in_progress': return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">In Progress</Badge>;
    case 'resolved': return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Resolved</Badge>;
    case 'closed': return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Closed</Badge>;
    default: return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Unknown</Badge>;
  }
};

export default function ItHelp() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  
  const { data: ticketsRaw } = useListItTickets();
  const tickets = Array.isArray(ticketsRaw) ? ticketsRaw : [];
  const createTicket = useCreateItTicket();
  const updateTicket = useUpdateItTicket();
  
  const [formData, setFormData] = useState({
    title: "", description: "", category: "hardware", priority: "medium"
  });

  const openCount = tickets.filter(t => t.status === "open").length || 0;
  const inProgressCount = tickets.filter(t => t.status === "in_progress").length || 0;
  const resolvedCount = tickets.filter(t => t.status === "resolved").length || 0;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTicket.mutateAsync({ data: formData });
      queryClient.invalidateQueries({ queryKey: getListItTicketsQueryKey() });
      toast({ title: "Ticket submitted successfully" });
      setIsModalOpen(false);
      setFormData({ title: "", description: "", category: "hardware", priority: "medium" });
    } catch (err) {
      toast({ title: "Error submitting ticket", variant: "destructive" });
    }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await updateTicket.mutateAsync({ id, data: { status } });
      queryClient.invalidateQueries({ queryKey: getListItTicketsQueryKey() });
      toast({ title: `Ticket status updated` });
      setSelectedTicket(null);
    } catch (err) {
      toast({ title: "Error updating status", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#0E1B4D]">IT Help Desk</h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#F26522] hover:bg-[#d5581e] text-white">
              <Plus className="w-4 h-4 mr-2" /> Submit Ticket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Submit IT Support Ticket</DialogTitle></DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2"><Label>Title</Label><Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} /></div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea required className="h-32" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
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
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createTicket.isPending}>Submit Ticket</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-t-4 border-t-red-500">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-500 mb-1">Open Tickets</p>
            <h3 className="text-3xl font-bold text-red-600">{openCount}</h3>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-yellow-500">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-500 mb-1">In Progress</p>
            <h3 className="text-3xl font-bold text-yellow-600">{inProgressCount}</h3>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-green-500">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-500 mb-1">Resolved</p>
            <h3 className="text-3xl font-bold text-green-600">{resolvedCount}</h3>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!tickets?.length ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">No tickets found</TableCell></TableRow>
              ) : (
                tickets.map(t => (
                  <TableRow key={t.id} className="cursor-pointer hover:bg-gray-50" onClick={() => setSelectedTicket(t)}>
                    <TableCell className="font-mono text-xs">#{t.id}</TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">{t.title}</TableCell>
                    <TableCell className="capitalize">{t.category}</TableCell>
                    <TableCell><Badge variant="outline" className={`${getPriorityColor(t.priority)} border-none px-2`}>{t.priority}</Badge></TableCell>
                    <TableCell>{getStatusBadge(t.status)}</TableCell>
                    <TableCell>{new Date(t.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedTicket} onOpenChange={(o) => !o && setSelectedTicket(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ticket #{selectedTicket?.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-lg">{selectedTicket?.title}</h3>
              <div className="flex gap-2 mt-2">
                {getStatusBadge(selectedTicket?.status || '')}
                <Badge variant="outline" className={`${getPriorityColor(selectedTicket?.priority || '')} border-none`}>{selectedTicket?.priority}</Badge>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-wrap">
              {selectedTicket?.description}
            </div>
            <div className="text-xs text-gray-500">
              Submitted: {selectedTicket && new Date(selectedTicket.createdAt).toLocaleString()}
            </div>
          </div>
          <DialogFooter className="flex justify-between w-full border-t pt-4">
            <div className="flex gap-2 w-full flex-wrap">
              {user?.role === "admin" || user?.role === "it" ? (
                <>
                  <Button variant="outline" onClick={() => handleStatusUpdate(selectedTicket?.id, 'in_progress')}>Mark In Progress</Button>
                  <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusUpdate(selectedTicket?.id, 'resolved')}>Resolve</Button>
                </>
              ) : (
                <Button variant="secondary" onClick={() => setSelectedTicket(null)}>Close</Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}