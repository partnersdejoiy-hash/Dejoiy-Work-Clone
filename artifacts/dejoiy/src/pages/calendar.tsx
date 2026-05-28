import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { 
  useListEvents, useCreateEvent, useDeleteEvent, getListEventsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, MapPin, Clock, Calendar as CalendarIcon, Trash } from "lucide-react";
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, addMonths, subMonths, isToday } from "date-fns";

const EVENT_COLORS: Record<string, string> = {
  meeting: 'bg-blue-500',
  holiday: 'bg-red-500',
  review: 'bg-purple-500',
  training: 'bg-green-500',
  social: 'bg-orange-500',
  other: 'bg-gray-500'
};

export default function Calendar() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: events } = useListEvents();
  const createEvent = useCreateEvent();
  const deleteEvent = useDeleteEvent();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [viewEvent, setViewEvent] = useState<any>(null);

  const [form, setForm] = useState({ title: "", type: "meeting", startDate: "", endDate: "", location: "", description: "" });

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const getEventsForDay = (day: Date) => {
    return events?.filter(e => isSameDay(new Date(e.startDate), day)) || [];
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEvent.mutateAsync({ data: {
        ...form,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        allDay: false
      }});
      toast({ title: "Event created" });
      queryClient.invalidateQueries({ queryKey: getListEventsQueryKey() });
      setIsModalOpen(false);
    } catch(err) {
      toast({ title: "Error creating event", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteEvent.mutateAsync({ id });
      toast({ title: "Event deleted" });
      queryClient.invalidateQueries({ queryKey: getListEventsQueryKey() });
      setViewEvent(null);
    } catch(err) {
      toast({ title: "Error deleting event", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#0E1B4D]">Calendar</h1>
        <Button onClick={() => { setForm({ title: "", type: "meeting", startDate: "", endDate: "", location: "", description: "" }); setIsModalOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Event
        </Button>
      </div>

      <div className="flex gap-6">
        <Card className="flex-1">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>&lt;</Button>
              <h2 className="text-xl font-bold w-48 text-center">{format(currentMonth, "MMMM yyyy")}</h2>
              <Button variant="outline" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>&gt;</Button>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date())}>Today</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-7 border-b">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 auto-rows-[120px]">
              {/* Padding for first day of month offset */}
              {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="border-b border-r bg-gray-50/50" />
              ))}
              
              {days.map(day => {
                const dayEvents = getEventsForDay(day);
                return (
                  <div 
                    key={day.toISOString()} 
                    className={`border-b border-r p-2 hover:bg-gray-50 cursor-pointer transition-colors ${isToday(day) ? 'bg-blue-50/30' : ''}`}
                    onClick={() => { setSelectedDay(day); setForm({...form, startDate: format(day, "yyyy-MM-dd'T'10:00"), endDate: format(day, "yyyy-MM-dd'T'11:00")}); setIsModalOpen(true); }}
                  >
                    <div className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1 ${isToday(day) ? 'bg-[#F26522] text-white' : 'text-gray-700'}`}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map(e => (
                        <div key={e.id} className="text-xs truncate px-1.5 py-0.5 rounded bg-gray-100 flex items-center gap-1" onClick={(ev) => { ev.stopPropagation(); setViewEvent(e); }}>
                          <div className={`w-1.5 h-1.5 rounded-full ${EVENT_COLORS[e.type] || 'bg-gray-500'}`} />
                          {e.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && <div className="text-[10px] text-gray-500 px-1">+{dayEvents.length - 3} more</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="w-80 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Upcoming</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {events?.filter(e => new Date(e.startDate) >= new Date()).slice(0, 5).map(e => (
                <div key={e.id} className="flex gap-3 cursor-pointer group" onClick={() => setViewEvent(e)}>
                  <div className="flex flex-col items-center justify-center w-12 h-12 bg-gray-50 rounded-xl shrink-0 border border-gray-100 group-hover:border-[#F26522] transition-colors">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">{format(new Date(e.startDate), 'MMM')}</span>
                    <span className="text-sm font-bold text-[#0E1B4D] leading-none">{format(new Date(e.startDate), 'dd')}</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#0E1B4D] group-hover:text-[#F26522] transition-colors line-clamp-1">{e.title}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3"/> {format(new Date(e.startDate), 'h:mm a')}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Event</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2"><Label>Title</Label><Input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={v => setForm({...form, type: v})}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    {Object.keys(EVENT_COLORS).map(k => <SelectItem key={k} value={k} className="capitalize">{k}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Location</Label><Input value={form.location} onChange={e => setForm({...form, location: e.target.value})} /></div>
              <div className="space-y-2"><Label>Start</Label><Input type="datetime-local" required value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} /></div>
              <div className="space-y-2"><Label>End</Label><Input type="datetime-local" required value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} /></div>
            </div>
            <DialogFooter><Button type="submit">Save Event</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewEvent} onOpenChange={() => setViewEvent(null)}>
        <DialogContent className="sm:max-w-[400px]">
          {viewEvent && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`px-2 py-0.5 text-xs font-bold text-white rounded capitalize ${EVENT_COLORS[viewEvent.type] || 'bg-gray-500'}`}>{viewEvent.type}</div>
                </div>
                <DialogTitle className="text-xl">{viewEvent.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p>{format(new Date(viewEvent.startDate), 'EEEE, MMMM d, yyyy')}</p>
                    <p>{format(new Date(viewEvent.startDate), 'h:mm a')} - {format(new Date(viewEvent.endDate), 'h:mm a')}</p>
                  </div>
                </div>
                {viewEvent.location && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <p>{viewEvent.location}</p>
                  </div>
                )}
                {viewEvent.description && (
                  <div className="mt-4 pt-4 border-t text-sm text-gray-700">
                    {viewEvent.description}
                  </div>
                )}
              </div>
              <DialogFooter className="flex justify-between sm:justify-between items-center w-full">
                <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(viewEvent.id)}><Trash className="w-4 h-4 mr-2"/> Delete</Button>
                <Button onClick={() => setViewEvent(null)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
