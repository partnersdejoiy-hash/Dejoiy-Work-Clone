import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { 
  useListPayroll, useCreatePayrollRecord, useUpdatePayrollRecord, getListPayrollQueryKey,
  useListUsers
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Plus, Check } from "lucide-react";

export default function Payroll() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: payrollRecordsRaw } = useListPayroll();
  const { data: usersRaw } = useListUsers();
  const payrollRecords = Array.isArray(payrollRecordsRaw) ? payrollRecordsRaw : [];
  const users = Array.isArray(usersRaw) ? usersRaw : [];
  
  const createRecord = useCreatePayrollRecord();
  const updateRecord = useUpdatePayrollRecord();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ employeeId: "", period: "", baseSalary: 0, bonus: 0, deductions: 0 });

  const isAdmin = user?.role === 'admin';
  const totalPayroll = payrollRecords.reduce((sum, r) => sum + r.netPay, 0) || 0;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const netPay = form.baseSalary + form.bonus - form.deductions;
      await createRecord.mutateAsync({ 
        data: {
          employeeId: parseInt(form.employeeId),
          period: form.period,
          baseSalary: form.baseSalary,
          bonus: form.bonus,
          deductions: form.deductions,
          netPay
        } 
      });
      toast({ title: "Payroll processed" });
      queryClient.invalidateQueries({ queryKey: getListPayrollQueryKey() });
      setIsModalOpen(false);
    } catch(err) {
      toast({ title: "Error processing payroll", variant: "destructive" });
    }
  };

  const handleMarkPaid = async (id: number) => {
    try {
      await updateRecord.mutateAsync({ id, data: { status: 'paid', paidAt: new Date().toISOString() } });
      toast({ title: "Marked as paid" });
      queryClient.invalidateQueries({ queryKey: getListPayrollQueryKey() });
    } catch(err) {
      toast({ title: "Error updating status", variant: "destructive" });
    }
  };

  const downloadPayslip = () => {
    toast({ title: "Payslip downloaded" });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#0E1B4D]">Payroll</h1>
        {isAdmin && (
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Process Payroll
          </Button>
        )}
      </div>

      {isAdmin && (
        <Card className="bg-[#0E1B4D] text-white">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-blue-200 mb-1 font-medium">Total Payroll</p>
              <p className="text-4xl font-bold">${totalPayroll.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-blue-200 mb-1 font-medium">Records Processed</p>
              <p className="text-2xl font-bold">{payrollRecords?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Base Salary</TableHead>
              <TableHead>Bonus</TableHead>
              <TableHead>Deductions</TableHead>
              <TableHead>Net Pay</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payrollRecords?.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-6 text-gray-500">No payroll records</TableCell></TableRow>
            ) : (
              payrollRecords.map(record => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{users.find(u => u.id === record.employeeId)?.name}</TableCell>
                  <TableCell>{record.period}</TableCell>
                  <TableCell>${record.baseSalary.toLocaleString()}</TableCell>
                  <TableCell className="text-green-600">${record.bonus.toLocaleString()}</TableCell>
                  <TableCell className="text-red-500">-${record.deductions.toLocaleString()}</TableCell>
                  <TableCell className="font-bold">${record.netPay.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      record.status === 'paid' ? 'bg-green-100 text-green-800 border-none' : 
                      record.status === 'processed' ? 'bg-blue-100 text-blue-800 border-none' : 'bg-yellow-100 text-yellow-800 border-none'
                    }>
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button variant="ghost" size="sm" onClick={downloadPayslip}><Download className="w-4 h-4" /></Button>
                    {isAdmin && record.status !== 'paid' && (
                      <Button variant="outline" size="sm" onClick={() => handleMarkPaid(record.id)} className="text-green-600 border-green-200 hover:bg-green-50">
                        <Check className="w-4 h-4 mr-1" /> Paid
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payroll</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Employee</Label>
              <Select value={form.employeeId} onValueChange={v => setForm({...form, employeeId: v})}>
                <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  {users.map(u => <SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Period</Label><Input required placeholder="e.g. May 2026" value={form.period} onChange={e => setForm({...form, period: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Base Salary</Label><Input type="number" required value={form.baseSalary || ''} onChange={e => setForm({...form, baseSalary: Number(e.target.value)})} /></div>
              <div className="space-y-2"><Label>Bonus</Label><Input type="number" value={form.bonus || ''} onChange={e => setForm({...form, bonus: Number(e.target.value)})} /></div>
              <div className="space-y-2"><Label>Deductions</Label><Input type="number" value={form.deductions || ''} onChange={e => setForm({...form, deductions: Number(e.target.value)})} /></div>
              <div className="space-y-2"><Label>Net Pay</Label><Input readOnly value={`$${form.baseSalary + form.bonus - form.deductions}`} className="bg-gray-50 font-bold" /></div>
            </div>
            <DialogFooter>
              <Button type="submit">Process Record</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
