import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { 
  useListJobPostings, useCreateJobPosting, useUpdateJobPosting, getListJobPostingsQueryKey,
  useListApplications, useCreateApplication, useUpdateApplication, getListApplicationsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, MapPin, Building, Briefcase } from "lucide-react";

export default function Recruitment() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: jobPostingsRaw } = useListJobPostings();
  const jobPostings = Array.isArray(jobPostingsRaw) ? jobPostingsRaw : [];
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  
  const { data: applicationsRaw } = useListApplications(selectedJobId as number, { query: { enabled: !!selectedJobId, queryKey: getListApplicationsQueryKey(selectedJobId as number) } });
  const applications = Array.isArray(applicationsRaw) ? applicationsRaw : [];
  
  const createJob = useCreateJobPosting();
  const updateJob = useUpdateJobPosting();
  const createApp = useCreateApplication();
  const updateApp = useUpdateApplication();

  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [jobForm, setJobForm] = useState({ title: "", department: "", location: "Remote", type: "full_time", description: "", requirements: "", salaryMin: 0, salaryMax: 0 });

  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [appForm, setAppForm] = useState({ applicantName: "", applicantEmail: "", phone: "", coverLetter: "" });

  const [viewAppDetail, setViewAppDetail] = useState<any>(null);

  const isAdmin = user?.role === 'admin' || user?.role === 'manager';

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createJob.mutateAsync({ data: jobForm });
      toast({ title: "Job posting created" });
      queryClient.invalidateQueries({ queryKey: getListJobPostingsQueryKey() });
      setIsJobModalOpen(false);
    } catch(err) {
      toast({ title: "Error creating job", variant: "destructive" });
    }
  };

  const handleSaveApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobId) return;
    try {
      await createApp.mutateAsync({ id: selectedJobId, data: appForm });
      toast({ title: "Application added" });
      queryClient.invalidateQueries({ queryKey: getListApplicationsQueryKey(selectedJobId) });
      setIsAppModalOpen(false);
    } catch(err) {
      toast({ title: "Error adding application", variant: "destructive" });
    }
  };

  const handleUpdateAppStatus = async (id: number, status: string) => {
    try {
      await updateApp.mutateAsync({ id, data: { status } });
      toast({ title: "Status updated" });
      if (selectedJobId) queryClient.invalidateQueries({ queryKey: getListApplicationsQueryKey(selectedJobId) });
      setViewAppDetail({...viewAppDetail, status});
    } catch(err) {
      toast({ title: "Error updating status", variant: "destructive" });
    }
  };

  const columns = [
    { id: 'new', label: 'New' },
    { id: 'screening', label: 'Screening' },
    { id: 'interview', label: 'Interview' },
    { id: 'offer', label: 'Offer' },
    { id: 'hired', label: 'Hired' },
    { id: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-6">
      <div className="flex justify-between items-center shrink-0">
        <h1 className="text-3xl font-bold text-[#0E1B4D]">Recruitment</h1>
        {isAdmin && (
          <Button onClick={() => setIsJobModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Post Job
          </Button>
        )}
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Left Panel: Jobs */}
        <div className="w-1/3 flex flex-col gap-4 overflow-y-auto pr-2">
          <h2 className="text-xl font-bold sticky top-0 bg-[#F5F7FA] pb-2">Job Postings</h2>
          {jobPostings.map(job => (
            <Card 
              key={job.id} 
              className={`cursor-pointer transition-all ${selectedJobId === job.id ? 'ring-2 ring-[#F26522] border-transparent shadow-md' : 'hover:border-gray-300'}`}
              onClick={() => setSelectedJobId(job.id)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-[#0E1B4D]">{job.title}</h3>
                  <Badge variant="outline" className={job.status === 'open' ? 'bg-green-50 text-green-700' : ''}>{job.status}</Badge>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                  <span className="flex items-center"><Building className="w-3 h-3 mr-1"/>{job.department}</span>
                  <span className="flex items-center"><MapPin className="w-3 h-3 mr-1"/>{job.location}</span>
                  <span className="flex items-center"><Briefcase className="w-3 h-3 mr-1"/>{job.type.replace('_', ' ')}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Right Panel: Applications Pipeline */}
        <div className="w-2/3 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          {selectedJobId ? (
            <>
              <div className="p-4 border-b flex justify-between items-center bg-gray-50/50">
                <h2 className="text-lg font-bold text-[#0E1B4D]">Pipeline: {jobPostings.find(j => j.id === selectedJobId)?.title}</h2>
                <Button variant="outline" size="sm" onClick={() => setIsAppModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-1" /> Add Applicant
                </Button>
              </div>
              <div className="flex-1 overflow-x-auto p-4">
                <div className="flex gap-4 min-w-max h-full">
                  {columns.map(col => {
                    const colApps = applications.filter(a => a.status === col.id) || [];
                    return (
                      <div key={col.id} className="w-64 flex flex-col bg-gray-50 rounded-lg p-3 h-full">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-bold text-sm text-gray-700">{col.label}</h3>
                          <Badge variant="secondary">{colApps.length}</Badge>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2">
                          {colApps.map(app => (
                            <Card key={app.id} className="cursor-pointer hover:shadow-md" onClick={() => setViewAppDetail(app)}>
                              <CardContent className="p-3">
                                <p className="font-medium text-sm text-[#0E1B4D]">{app.applicantName}</p>
                                <p className="text-xs text-gray-500 mt-1">{new Date(app.appliedAt).toLocaleDateString()}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a job posting to view applications
            </div>
          )}
        </div>
      </div>

      <Dialog open={isJobModalOpen} onOpenChange={setIsJobModalOpen}>
        <DialogContent className="max-w-[600px]">
          <DialogHeader><DialogTitle>Create Job Posting</DialogTitle></DialogHeader>
          <form onSubmit={handleSaveJob} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Title</Label><Input required value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})} /></div>
              <div className="space-y-2"><Label>Department</Label><Input required value={jobForm.department} onChange={e => setJobForm({...jobForm, department: e.target.value})} /></div>
              <div className="space-y-2"><Label>Location</Label><Input required value={jobForm.location} onChange={e => setJobForm({...jobForm, location: e.target.value})} /></div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={jobForm.type} onValueChange={v => setJobForm({...jobForm, type: v})}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Full Time</SelectItem>
                    <SelectItem value="part_time">Part Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="intern">Intern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Description</Label><Textarea rows={4} required value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})} /></div>
            <DialogFooter><Button type="submit">Post Job</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isAppModalOpen} onOpenChange={setIsAppModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Applicant</DialogTitle></DialogHeader>
          <form onSubmit={handleSaveApp} className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input required value={appForm.applicantName} onChange={e => setAppForm({...appForm, applicantName: e.target.value})} /></div>
            <div className="space-y-2"><Label>Email</Label><Input required type="email" value={appForm.applicantEmail} onChange={e => setAppForm({...appForm, applicantEmail: e.target.value})} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={appForm.phone} onChange={e => setAppForm({...appForm, phone: e.target.value})} /></div>
            <div className="space-y-2"><Label>Notes/Cover Letter</Label><Textarea value={appForm.coverLetter} onChange={e => setAppForm({...appForm, coverLetter: e.target.value})} /></div>
            <DialogFooter><Button type="submit">Add Applicant</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewAppDetail} onOpenChange={() => setViewAppDetail(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Applicant Details</DialogTitle></DialogHeader>
          {viewAppDetail && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-xl">{viewAppDetail.applicantName}</h3>
                <p className="text-gray-500">{viewAppDetail.applicantEmail} • {viewAppDetail.phone}</p>
              </div>
              <div className="space-y-2">
                <Label>Pipeline Status</Label>
                <Select value={viewAppDetail.status} onValueChange={(v) => handleUpdateAppStatus(viewAppDetail.id, v)}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    {columns.map(c => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1 block">Cover Letter / Notes</Label>
                <div className="bg-gray-50 p-3 rounded-md text-sm whitespace-pre-wrap">
                  {viewAppDetail.coverLetter || viewAppDetail.notes || "No notes"}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
