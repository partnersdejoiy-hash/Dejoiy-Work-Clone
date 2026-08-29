import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useListAnnouncements, useCreateAnnouncement, getListAnnouncementsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus } from "lucide-react";

const TYPES = ["general", "hr", "it", "finance", "urgent"];

const getTypeBadge = (type: string) => {
  switch (type) {
    case 'urgent': return 'bg-red-100 text-red-800';
    case 'hr': return 'bg-pink-100 text-pink-800';
    case 'it': return 'bg-purple-100 text-purple-800';
    case 'finance': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function Announcements() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: announcementsRaw } = useListAnnouncements();
  const announcements = Array.isArray(announcementsRaw) ? announcementsRaw : [];
  const createAnnouncement = useCreateAnnouncement();
  
  const [formData, setFormData] = useState({
    title: "", content: "", type: "general"
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAnnouncement.mutateAsync({ data: formData });
      queryClient.invalidateQueries({ queryKey: getListAnnouncementsQueryKey() });
      toast({ title: "Announcement posted successfully" });
      setIsModalOpen(false);
      setFormData({ title: "", content: "", type: "general" });
    } catch (err) {
      toast({ title: "Error posting announcement", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#0E1B4D]">Announcements</h1>
        {(user?.role === "admin" || user?.role === "manager") && (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#F26522] hover:bg-[#d5581e] text-white">
                <Plus className="w-4 h-4 mr-2" /> Post Announcement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Post New Announcement</DialogTitle></DialogHeader>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2"><Label>Title</Label><Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} /></div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea required className="h-40" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createAnnouncement.isPending}>Post to Company</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-6">
        {announcements.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100">No announcements yet.</div>
        ) : (
          announcements.map(ann => (
            <Card key={ann.id} className="overflow-hidden border-none shadow-md shadow-[#0E1B4D]/5">
              <div className={`h-1.5 w-full ${ann.type === 'urgent' ? 'bg-red-500' : ann.type === 'hr' ? 'bg-pink-500' : 'bg-gray-200'}`} />
              <CardContent className="p-6 sm:p-8">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#0E1B4D]">{ann.title}</h2>
                  <Badge className={`${getTypeBadge(ann.type)} uppercase tracking-wider text-[10px]`}>{ann.type}</Badge>
                </div>
                <div className="prose prose-sm sm:prose-base max-w-none text-gray-700 whitespace-pre-wrap mb-6">
                  {ann.content}
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-[#0E1B4D] text-white text-xs">DT</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-[#0E1B4D]">Dejoiy Team</p>
                    <p className="text-xs text-gray-500">{new Date(ann.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}