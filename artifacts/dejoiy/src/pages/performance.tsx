import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { 
  useListGoals, useCreateGoal, useUpdateGoal, useDeleteGoal, getListGoalsQueryKey,
  useListPerformanceReviews, useCreatePerformanceReview, useUpdatePerformanceReview, getListPerformanceReviewsQueryKey,
  useListUsers
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Plus, Target, Star, Trash } from "lucide-react";

export default function Performance() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: goals } = useListGoals();
  const { data: reviews } = useListPerformanceReviews();
  const { data: users } = useListUsers();
  
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();
  
  const createReview = useCreatePerformanceReview();
  const updateReview = useUpdatePerformanceReview();

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [goalForm, setGoalForm] = useState({ title: "", description: "", category: "professional", dueDate: "", progress: 0, status: "on_track" });

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [reviewForm, setReviewForm] = useState({ employeeId: "", period: "", overallRating: 3, strengths: "", improvements: "", comments: "", status: "draft" });

  const canManageReviews = user?.role === 'admin' || user?.role === 'manager';

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGoal) {
        await updateGoal.mutateAsync({ id: editingGoal.id, data: goalForm });
      } else {
        await createGoal.mutateAsync({ data: goalForm });
      }
      toast({ title: "Goal saved" });
      queryClient.invalidateQueries({ queryKey: getListGoalsQueryKey() });
      setIsGoalModalOpen(false);
    } catch(err) {
      toast({ title: "Error saving goal", variant: "destructive" });
    }
  };

  const handleDeleteGoal = async () => {
    if (!editingGoal) return;
    try {
      await deleteGoal.mutateAsync({ id: editingGoal.id });
      toast({ title: "Goal deleted" });
      queryClient.invalidateQueries({ queryKey: getListGoalsQueryKey() });
      setIsGoalModalOpen(false);
    } catch(err) {
      toast({ title: "Error deleting goal", variant: "destructive" });
    }
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingReview) {
        await updateReview.mutateAsync({ id: editingReview.id, data: reviewForm });
      } else {
        await createReview.mutateAsync({ 
          data: {
            ...reviewForm,
            employeeId: parseInt(reviewForm.employeeId),
            reviewerId: user.id
          } 
        });
      }
      toast({ title: "Review saved" });
      queryClient.invalidateQueries({ queryKey: getListPerformanceReviewsQueryKey() });
      setIsReviewModalOpen(false);
    } catch(err) {
      toast({ title: "Error saving review", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#0E1B4D]">Performance</h1>
      </div>

      <Tabs defaultValue="goals">
        <TabsList>
          <TabsTrigger value="goals">My Goals</TabsTrigger>
          <TabsTrigger value="reviews">Performance Reviews</TabsTrigger>
        </TabsList>
        
        <TabsContent value="goals" className="mt-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Goals Tracker</h2>
            <Button onClick={() => { setEditingGoal(null); setGoalForm({ title: "", description: "", category: "professional", dueDate: "", progress: 0, status: "on_track" }); setIsGoalModalOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Add Goal
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals?.map(goal => (
              <Card key={goal.id} className="cursor-pointer hover:shadow-md transition-all border-l-4" style={{borderLeftColor: goal.status === 'on_track' ? '#10B981' : goal.status === 'at_risk' ? '#EF4444' : goal.status === 'completed' ? '#3B82F6' : '#9CA3AF'}} onClick={() => { setEditingGoal(goal); setGoalForm(goal); setIsGoalModalOpen(true); }}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base leading-tight">{goal.title}</CardTitle>
                    <Badge variant="outline" className="capitalize">{goal.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-500 line-clamp-2">{goal.description}</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span>Progress</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                  </div>
                </CardContent>
                <CardFooter className="pt-0 text-xs text-gray-400 justify-between">
                  <span>Due: {goal.dueDate ? new Date(goal.dueDate).toLocaleDateString() : 'No date'}</span>
                  <span className="capitalize">{goal.status.replace('_', ' ')}</span>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="reviews" className="mt-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Reviews</h2>
            {canManageReviews && (
              <Button onClick={() => { setEditingReview(null); setReviewForm({ employeeId: "", period: "", overallRating: 3, strengths: "", improvements: "", comments: "", status: "draft" }); setIsReviewModalOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" /> Write Review
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {reviews?.map(review => (
              <Card key={review.id} className={canManageReviews ? "cursor-pointer hover:shadow-md" : ""} onClick={() => { if(canManageReviews) { setEditingReview(review); setReviewForm({...review, employeeId: review.employeeId.toString()}); setIsReviewModalOpen(true); } }}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">{users?.find(u => u.id === review.employeeId)?.name}</CardTitle>
                      <p className="text-sm text-gray-500">{review.period} • Reviewed by {users?.find(u => u.id === review.reviewerId)?.name}</p>
                    </div>
                    <div className="flex gap-1 text-yellow-400">
                      {Array.from({length: 5}).map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < review.overallRating ? "fill-current" : "text-gray-200"}`} />
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Strengths</h4>
                    <p className="text-sm text-gray-700">{review.strengths || 'None specified'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Areas for Improvement</h4>
                    <p className="text-sm text-gray-700">{review.improvements || 'None specified'}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isGoalModalOpen} onOpenChange={setIsGoalModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGoal ? "Edit Goal" : "New Goal"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveGoal} className="space-y-4">
            <div className="space-y-2"><Label>Title</Label><Input required value={goalForm.title} onChange={e => setGoalForm({...goalForm, title: e.target.value})} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={goalForm.description} onChange={e => setGoalForm({...goalForm, description: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={goalForm.category} onValueChange={v => setGoalForm({...goalForm, category: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={goalForm.status} onValueChange={v => setGoalForm({...goalForm, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="on_track">On Track</SelectItem>
                    <SelectItem value="at_risk">At Risk</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" value={goalForm.dueDate ? goalForm.dueDate.split('T')[0] : ''} onChange={e => setGoalForm({...goalForm, dueDate: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Progress ({goalForm.progress}%)</Label>
                <Slider max={100} step={5} value={[goalForm.progress]} onValueChange={([v]) => setGoalForm({...goalForm, progress: v})} className="mt-4" />
              </div>
            </div>
            <DialogFooter className="flex justify-between items-center mt-4">
              {editingGoal ? <Button type="button" variant="destructive" onClick={handleDeleteGoal}><Trash className="w-4 h-4" /></Button> : <div/>}
              <Button type="submit">Save Goal</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingReview ? "Edit Review" : "Write Review"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveReview} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Employee</Label>
                <Select disabled={!!editingReview} value={reviewForm.employeeId} onValueChange={v => setReviewForm({...reviewForm, employeeId: v})}>
                  <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                  <SelectContent>
                    {users?.map(u => <SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Period (e.g. Q1 2026)</Label>
                <Input required value={reviewForm.period} onChange={e => setReviewForm({...reviewForm, period: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Overall Rating ({reviewForm.overallRating}/5)</Label>
                <Slider min={1} max={5} step={1} value={[reviewForm.overallRating]} onValueChange={([v]) => setReviewForm({...reviewForm, overallRating: v})} className="mt-4" />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={reviewForm.status} onValueChange={v => setReviewForm({...reviewForm, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Strengths</Label><Textarea value={reviewForm.strengths} onChange={e => setReviewForm({...reviewForm, strengths: e.target.value})} /></div>
            <div className="space-y-2"><Label>Areas for Improvement</Label><Textarea value={reviewForm.improvements} onChange={e => setReviewForm({...reviewForm, improvements: e.target.value})} /></div>
            <div className="space-y-2"><Label>Additional Comments</Label><Textarea value={reviewForm.comments} onChange={e => setReviewForm({...reviewForm, comments: e.target.value})} /></div>
            <DialogFooter>
              <Button type="submit">Save Review</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
