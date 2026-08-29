import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useListUsers, useCreateUser, getListUsersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus } from "lucide-react";

const DEPARTMENTS = ["Engineering", "HR", "Finance", "IT", "Operations"];
const ROLES = ["admin", "manager", "employee"];

const getDeptColor = (dept?: string | null) => {
  switch (dept) {
    case 'Engineering': return 'bg-blue-100 text-blue-800';
    case 'HR': return 'bg-pink-100 text-pink-800';
    case 'Finance': return 'bg-green-100 text-green-800';
    case 'IT': return 'bg-purple-100 text-purple-800';
    case 'Operations': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function People() {
  const { user } = useAuth();
  const { data: usersRaw, isLoading } = useListUsers();
  const users = Array.isArray(usersRaw) ? usersRaw : [];
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const createUser = useCreateUser();

  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "employee", department: "Engineering", jobTitle: "" });

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === "all" || u.department === deptFilter;
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesDept && matchesRole;
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser.mutateAsync({ data: formData });
      queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
      toast({ title: "Employee added successfully" });
      setIsAddOpen(false);
      setFormData({ name: "", email: "", password: "", role: "employee", department: "Engineering", jobTitle: "" });
    } catch (err) {
      toast({ title: "Error adding employee", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-[#0E1B4D]">People</h1>
          <Badge variant="secondary" className="bg-gray-200">{users?.length || 0}</Badge>
        </div>
        {user?.role === "admin" && (
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#F26522] hover:bg-[#d5581e] text-white">
                <Plus className="w-4 h-4 mr-2" /> Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New Employee</DialogTitle></DialogHeader>
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div className="space-y-2"><Label>Name</Label><Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                <div className="space-y-2"><Label>Email</Label><Input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
                <div className="space-y-2"><Label>Password</Label><Input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select value={formData.role} onValueChange={v => setFormData({...formData, role: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select value={formData.department} onValueChange={v => setFormData({...formData, department: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2"><Label>Job Title</Label><Input required value={formData.jobTitle} onChange={e => setFormData({...formData, jobTitle: e.target.value})} /></div>
                <DialogFooter><Button type="submit" disabled={createUser.isPending}>Save Employee</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search employees..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Department" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {ROLES.map(r => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : filteredUsers?.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No employees found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredUsers.map(u => (
            <Link key={u.id} href={`/people/${u.id}`}>
            <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Avatar className="w-20 h-20 mb-4 border-2 border-white shadow-sm">
                  <AvatarFallback className={`text-xl font-bold ${getDeptColor(u.department)}`}>{(u.name || "?").charAt(0)}</AvatarFallback>
                </Avatar>
                <h3 className="font-bold text-[#0E1B4D] mb-1">{u.name}</h3>
                <p className="text-sm text-gray-500 mb-3">{u.jobTitle}</p>
                <Badge variant="outline" className={`${getDeptColor(u.department)} border-none mb-4`}>{u.department || 'No Dept'}</Badge>
                <div className="w-full text-left space-y-2 mt-2 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 truncate" title={u.email}>{u.email}</p>
                  <p className="text-xs text-gray-500">{u.phone || 'No phone'}</p>
                </div>
              </CardContent>
            </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}