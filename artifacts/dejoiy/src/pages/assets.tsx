import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { 
  useListAssets, useCreateAsset, useUpdateAsset, getListAssetsQueryKey, useListUsers
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
import { Plus, Laptop, Smartphone, Monitor as MonitorIcon, Wrench } from "lucide-react";

const ASSET_TYPES = ['laptop', 'monitor', 'phone', 'keyboard', 'mouse', 'tablet', 'server', 'other'];

export default function Assets() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: assets } = useListAssets();
  const { data: users } = useListUsers();
  
  const createAsset = useCreateAsset();
  const updateAsset = useUpdateAsset();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: "laptop", serialNumber: "", assignedToId: "unassigned", status: "available", purchaseValue: 0 });

  const isAdmin = user?.role === 'admin';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAsset.mutateAsync({ 
        data: {
          ...form,
          assignedToId: form.assignedToId === 'unassigned' ? undefined : parseInt(form.assignedToId),
        }
      });
      toast({ title: "Asset added successfully" });
      queryClient.invalidateQueries({ queryKey: getListAssetsQueryKey() });
      setIsModalOpen(false);
    } catch(err) {
      toast({ title: "Error adding asset", variant: "destructive" });
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getIcon = (type: string) => {
    if(type === 'laptop') return <Laptop className="w-4 h-4" />;
    if(type === 'phone' || type === 'tablet') return <Smartphone className="w-4 h-4" />;
    if(type === 'monitor') return <MonitorIcon className="w-4 h-4" />;
    return <Wrench className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#0E1B4D]">IT Assets</h1>
        {isAdmin && (
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Asset
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center justify-center py-6">
            <h3 className="text-3xl font-bold text-[#0E1B4D] mb-1">{assets?.length || 0}</h3>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Total Assets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center justify-center py-6">
            <h3 className="text-3xl font-bold text-blue-600 mb-1">{assets?.filter(a => a.status === 'assigned').length || 0}</h3>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Assigned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center justify-center py-6">
            <h3 className="text-3xl font-bold text-green-600 mb-1">{assets?.filter(a => a.status === 'available').length || 0}</h3>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Available</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center justify-center py-6">
            <h3 className="text-3xl font-bold text-yellow-600 mb-1">{assets?.filter(a => a.status === 'maintenance').length || 0}</h3>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">In Maintenance</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead>Serial Number</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets?.map(asset => (
              <TableRow key={asset.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                      {getIcon(asset.type)}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[#0E1B4D] leading-tight">{asset.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{asset.type}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm text-gray-500">{asset.serialNumber || '-'}</TableCell>
                <TableCell>
                  {asset.assignedToId ? users?.find(u => u.id === asset.assignedToId)?.name : <span className="text-gray-400 italic">Unassigned</span>}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`border-none ${getStatusColor(asset.status)}`}>{asset.status}</Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {asset.purchaseValue ? `$${asset.purchaseValue.toLocaleString()}` : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add IT Asset</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Name</Label><Input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={v => setForm({...form, type: v})}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    {ASSET_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Serial Number</Label><Input required value={form.serialNumber} onChange={e => setForm({...form, serialNumber: e.target.value})} /></div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assign To</Label>
                <Select value={form.assignedToId} onValueChange={v => setForm({...form, assignedToId: v})}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {users?.map(u => <SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Purchase Value ($)</Label><Input type="number" required value={form.purchaseValue || ''} onChange={e => setForm({...form, purchaseValue: Number(e.target.value)})} /></div>
            </div>
            <DialogFooter><Button type="submit">Add Asset</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
