import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useListExpenses, useCreateExpense, useUpdateExpense, getListExpensesQueryKey } from "@workspace/api-client-react";
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
import { Plus } from "lucide-react";

const CATEGORIES = ["travel", "meals", "software", "equipment", "other"];

const getCategoryColor = (cat: string) => {
  switch (cat) {
    case 'travel': return 'bg-blue-100 text-blue-800';
    case 'meals': return 'bg-orange-100 text-orange-800';
    case 'software': return 'bg-purple-100 text-purple-800';
    case 'equipment': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function Expenses() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [tab, setTab] = useState("my");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: expensesRaw } = useListExpenses();
  const expenses = Array.isArray(expensesRaw) ? expensesRaw : [];
  
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  
  const [formData, setFormData] = useState({
    title: "", amount: "", category: "travel", expenseDate: "", notes: ""
  });

  const displayExpenses = expenses.filter(e => tab === "all" ? true : e.employeeId === user?.id) || [];
  
  const myExpenses = expenses.filter(e => e.employeeId === user?.id) || [];
  const pendingAmount = myExpenses.filter(e => e.status === "pending").reduce((sum, e) => sum + Number(e.amount), 0);
  const approvedAmount = myExpenses.filter(e => e.status === "approved").reduce((sum, e) => sum + Number(e.amount), 0);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createExpense.mutateAsync({ 
        data: { 
          ...formData, 
          amount: Number(formData.amount) 
        } 
      });
      // Create approval request for workflow
      try {
        await fetch("/api/approvals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entityType: "expense",
            entityId: (result as any)?.id || 0,
            title: `Expense Report — ${formData.title}`,
            summary: `₹${formData.amount} for ${formData.category}${formData.notes ? `: ${formData.notes}` : ""}`,
            amount: formData.amount,
            priority: "normal",
          }),
        });
      } catch {}
      queryClient.invalidateQueries({ queryKey: getListExpensesQueryKey() });
      toast({ title: "Expense submitted for approval" });
      setIsModalOpen(false);
      setFormData({ title: "", amount: "", category: "travel", expenseDate: "", notes: "" });
    } catch (err) {
      toast({ title: "Error submitting expense", variant: "destructive" });
    }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await updateExpense.mutateAsync({ id, data: { status } });
      queryClient.invalidateQueries({ queryKey: getListExpensesQueryKey() });
      toast({ title: `Expense ${status}` });
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
        <h1 className="text-3xl font-bold text-[#0E1B4D]">Expenses</h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#F26522] hover:bg-[#d5581e] text-white">
              <Plus className="w-4 h-4 mr-2" /> Submit Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Submit New Expense</DialogTitle></DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2"><Label>Title</Label><Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Amount ($)</Label><Input type="number" step="0.01" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} /></div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2"><Label>Date</Label><Input type="date" required value={formData.expenseDate} onChange={e => setFormData({...formData, expenseDate: e.target.value})} /></div>
              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createExpense.isPending}>Submit Expense</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-500 mb-1">Total Submitted</p>
            <h3 className="text-2xl font-bold">{myExpenses.length}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-500 mb-1">Pending Amount</p>
            <h3 className="text-2xl font-bold text-yellow-600">${pendingAmount.toFixed(2)}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-500 mb-1">Approved Amount</p>
            <h3 className="text-2xl font-bold text-green-600">${approvedAmount.toFixed(2)}</h3>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b">
            {(user?.role === "admin" || user?.role === "manager") ? (
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList>
                  <TabsTrigger value="my">My Expenses</TabsTrigger>
                  <TabsTrigger value="all">All Expenses</TabsTrigger>
                </TabsList>
              </Tabs>
            ) : (
              <h3 className="font-bold text-lg">My Expenses</h3>
            )}
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayExpenses.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">No expenses found</TableCell></TableRow>
              ) : (
                displayExpenses.map(e => (
                  <TableRow key={e.id}>
                    <TableCell>{new Date(e.expenseDate).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{e.title}</TableCell>
                    <TableCell><Badge variant="outline" className={`${getCategoryColor(e.category)} border-none capitalize`}>{e.category}</Badge></TableCell>
                    <TableCell className="font-bold">${Number(e.amount).toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(e.status)}</TableCell>
                    <TableCell>
                      {tab === "all" && e.status === "pending" && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleStatusUpdate(e.id, 'approved')}>Approve</Button>
                          <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleStatusUpdate(e.id, 'rejected')}>Reject</Button>
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