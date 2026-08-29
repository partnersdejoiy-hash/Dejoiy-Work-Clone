import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2, XCircle, Clock, Send, AlertTriangle,
  ChevronRight, MessageSquare, User,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApprovalStep {
  id: number;
  stepNumber: number;
  stepName: string;
  approverId: number | null;
  approverRole: string | null;
  status: string;
  action: string | null;
  comment: string | null;
  decidedAt: string | null;
  createdAt: string;
  approverName: string | null;
}

interface ApprovalRequest {
  id: number;
  entityType: string;
  entityId: number;
  requesterId: number;
  status: string;
  currentStep: number;
  totalSteps: number;
  title: string;
  summary: string | null;
  amount: string | null;
  priority: string;
  submittedAt: string;
  resolvedAt: string | null;
  createdAt: string;
  requesterName: string | null;
  requesterEmail: string | null;
  steps?: ApprovalStep[];
  requester?: { id: number; name: string; email: string; avatarUrl: string | null };
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
};

const ENTITY_LABELS: Record<string, string> = {
  leave_request: "Leave Request",
  expense: "Expense Report",
  timesheet: "Timesheet",
  access_request: "Access Request",
  job_requisition: "Job Requisition",
  employee_change: "Employee Change",
};

export default function Approvals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchApprovals = async () => {
    try {
      const res = await fetch("/api/approvals");
      if (res.ok) {
        const data = await res.json();
        setApprovals(data);
      }
    } catch (err) {
      console.error("Failed to fetch approvals", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const filteredApprovals = approvals.filter((a) => {
    if (activeTab === "pending") return a.status === "pending";
    if (activeTab === "approved") return a.status === "approved";
    if (activeTab === "rejected") return a.status === "rejected";
    return true;
  });

  const openDetail = async (request: ApprovalRequest) => {
    try {
      const res = await fetch(`/api/approvals/${request.id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedRequest(data);
        setDetailOpen(true);
      }
    } catch {
      setSelectedRequest(request);
      setDetailOpen(true);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/approvals/${selectedRequest.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: comment || undefined }),
      });
      if (res.ok) {
        toast({ title: "Approved", description: "The request has been approved." });
        setDetailOpen(false);
        setComment("");
        fetchApprovals();
      } else {
        const err = await res.json();
        toast({ title: "Error", description: err.error || "Failed to approve", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Network error", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/approvals/${selectedRequest.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: comment || undefined }),
      });
      if (res.ok) {
        toast({ title: "Rejected", description: "The request has been rejected." });
        setDetailOpen(false);
        setComment("");
        fetchApprovals();
      } else {
        const err = await res.json();
        toast({ title: "Error", description: err.error || "Failed to reject", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Network error", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const counts = {
    pending: approvals.filter((a) => a.status === "pending").length,
    approved: approvals.filter((a) => a.status === "approved").length,
    rejected: approvals.filter((a) => a.status === "rejected").length,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Approval Center</h1>
        <p className="text-gray-500 mt-1">Review and manage approval requests across your organization.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Pending
            {counts.pending > 0 && <Badge variant="secondary" className="ml-1 text-[10px]">{counts.pending}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approved
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-1.5">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
            </div>
          ) : filteredApprovals.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">
                  {activeTab === "pending" ? "No pending approvals" : `No ${activeTab} requests`}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredApprovals.map((request) => (
                <Card
                  key={request.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => openDetail(request)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <Avatar className="w-10 h-10 shrink-0">
                      <AvatarFallback className="bg-gray-100 text-gray-600 text-sm font-bold">
                        {request.requesterName?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {request.title}
                        </h3>
                        <Badge className={`text-[10px] ${STATUS_COLORS[request.status] || ""}`}>
                          {request.status}
                        </Badge>
                        {request.priority === "urgent" && (
                          <Badge variant="destructive" className="text-[10px]">Urgent</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {request.requesterName} · {ENTITY_LABELS[request.entityType] || request.entityType}
                        {request.amount && ` · ₹${request.amount}`}
                        {request.summary && ` · ${request.summary}`}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-400">
                        {new Date(request.submittedAt).toLocaleDateString()}
                      </p>
                      {request.status === "pending" && (
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Step {request.currentStep}/{request.totalSteps}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          {selectedRequest && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg">{selectedRequest.title}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gray-100 text-gray-600 text-sm font-bold">
                      {selectedRequest.requesterName?.charAt(0) || selectedRequest.requester?.name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{selectedRequest.requesterName || selectedRequest.requester?.name}</p>
                    <p className="text-xs text-gray-500">{ENTITY_LABELS[selectedRequest.entityType] || selectedRequest.entityType}</p>
                  </div>
                  <Badge className={`ml-auto ${STATUS_COLORS[selectedRequest.status] || ""}`}>
                    {selectedRequest.status}
                  </Badge>
                </div>

                {selectedRequest.summary && (
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selectedRequest.summary}</p>
                )}

                <Separator />

                {/* Workflow Steps */}
                {selectedRequest.steps && selectedRequest.steps.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Approval Workflow</p>
                    <div className="space-y-2">
                      {selectedRequest.steps.map((step) => (
                        <div key={step.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-white/5">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                            step.status === "approved" ? "bg-emerald-100" :
                            step.status === "rejected" ? "bg-red-100" :
                            "bg-gray-100"
                          }`}>
                            {step.status === "approved" ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> :
                             step.status === "rejected" ? <XCircle className="w-3.5 h-3.5 text-red-600" /> :
                             <Clock className="w-3.5 h-3.5 text-gray-400" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{step.stepName}</p>
                            <p className="text-xs text-gray-500">
                              {step.approverName || step.approverRole || "Unassigned"}
                              {step.decidedAt && ` · ${new Date(step.decidedAt).toLocaleDateString()}`}
                            </p>
                            {step.comment && (
                              <p className="text-xs text-gray-400 mt-0.5 italic">"{step.comment}"</p>
                            )}
                          </div>
                          <Badge className={`text-[10px] ${STATUS_COLORS[step.status] || ""}`}>
                            {step.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comment input for pending items */}
                {selectedRequest.status === "pending" && (
                  <div className="space-y-2">
                    <Label>Comment (optional)</Label>
                    <Textarea
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="h-20"
                    />
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2">
                {selectedRequest.status === "pending" && (
                  <>
                    <Button
                      variant="destructive"
                      onClick={handleReject}
                      disabled={actionLoading}
                    >
                      <XCircle className="w-4 h-4 mr-1.5" />
                      Reject
                    </Button>
                    <Button
                      onClick={handleApprove}
                      disabled={actionLoading}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      Approve
                    </Button>
                  </>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
