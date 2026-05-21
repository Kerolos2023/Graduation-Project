

"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Edit2, Trash2, Loader2, AlertCircle, X } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import eventService, { AcademicEvent } from '@/services/eventServices';
import { useAcademicContext } from "@/hooks/useAcademicContext";
import { toast } from "sonner";

export default function UniversityEventsPage() {
  const [isClient, setIsClient] = useState(false);
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState("");
  const { selectedProgramId, selectedSemesterId, academicVersion } = useAcademicContext();

  const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'error' | 'success' | 'warning' | null }>({
    text: "",
    type: null
  });

  const [type, setType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");


  const loadData = useCallback(async () => {
    if (!selectedProgramId || !selectedSemesterId) return;
    setLoading(true);
    try {
      const data = await eventService.getEvents(selectedProgramId, selectedSemesterId, "");
      setEvents(data.items || []);
    } catch (error: any) {
      console.error("Fetch Error:", error);
      const errorMsg =
        typeof error.response?.data === "string" ? error.response.data :
          error.response?.data?.errors?.[0] ||
          error.response?.data?.Message ||
          error.response?.data?.message ||
          error.message;
      setStatusMessage({ text: errorMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [selectedProgramId, selectedSemesterId]);

  useEffect(() => {
    setIsClient(true);
    loadData();
  }, [loadData, academicVersion]);

  const filteredEvents = useMemo(() => {
    if (!search.trim()) return events;

    return events.filter((event) => {
      const eventType = event.type?.toLowerCase() || "";
      const searchTerms = search.toLowerCase();

      return eventType.includes(searchTerms);
    });
  }, [search, events]);

  const handleAddEvent = async () => {
    if (!selectedProgramId || !selectedSemesterId || !type || !startDate || !endDate) {
      setStatusMessage({ text: "Please fill in all fields.", type: 'warning' });
      return;
    }


    if (new Date(startDate) > new Date(endDate)) {
      setStatusMessage({ text: "End Date must be after or equal to Start Date.", type: 'warning' });
      return;
    }

    setStatusMessage({ text: "", type: null });
    setActionLoading(true);
    try {
      await eventService.addEvent(selectedProgramId, selectedSemesterId, { type, startDate, endDate });
      setType(""); setStartDate(""); setEndDate("");
      setStatusMessage({ text: "Event added successfully!", type: 'success' });
      toast.success("Event added successfully!");
      loadData();
    } catch (error: any) {
      console.log("Details:", error.response?.data);

      const errorMsg =
        typeof error.response?.data === "string" ? error.response.data :
          error.response?.data?.errors?.[0] ||
          (error.response?.data?.errors ? Object.values(error.response.data.errors).flat().join(" - ") : null) ||
          error.response?.data?.Message ||
          error.response?.data?.message ||
          error.response?.data?.title ||
          error.message;

      setStatusMessage({ text: errorMsg, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!selectedProgramId || !selectedSemesterId || !confirm("Are you sure you want to delete this event?")) return;

    setStatusMessage({ text: "", type: null });
    try {
      await eventService.deleteEvent(selectedProgramId, selectedSemesterId, id);
      toast.success("Deleted successfully");
      loadData();
    } catch (error: any) {
      console.error("Delete Error:", error);
      const errorMsg =
        typeof error.response?.data === "string" ? error.response.data :
          error.response?.data?.errors?.[0] ||
          error.response?.data?.Message ||
          error.response?.data?.message ||
          error.message;

      setStatusMessage({ text: errorMsg, type: 'error' });
    }
  };

  if (!isClient) return null;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-10 bg-[#F5F5F5] min-h-screen font-sans">


      {statusMessage.type && (
        <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${statusMessage.type === 'error' ? 'bg-red-50 border-red-200 text-red-600 font-bold' :
            statusMessage.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
              'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
          <div className="flex items-center gap-3">
            {statusMessage.type === 'error' && <AlertCircle className="w-5 h-5" />}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage({ text: "", type: null })}>
            <X className="w-4 h-4 opacity-50" />
          </button>
        </div>
      )}

      <Card className="bg-[#FFFFFF] p-5 md:p-8 rounded-[20px] md:rounded-[24px] shadow-sm border border-[#E9EAEB] print:hidden">
        <CardContent className="p-0 space-y-6">
          <h2 className="text-lg md:text-xl font-bold text-[#0A0D12]">University calendar</h2>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#090909]">Event</label>
              <Select onValueChange={setType} value={type}>
                <SelectTrigger className="h-11 rounded-xl border-slate-200 focus:ring-blue-600 bg-white">
                  <SelectValue placeholder="Select Event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AdvisorRegistration">Advisor Registration</SelectItem>
                  <SelectItem value="StudentRegistration">Student Registration</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#090909]">Start Date</label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-11 rounded-xl border-slate-200 bg-white" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#090909]">End Date</label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-11 rounded-xl border-slate-200 bg-white" />
              </div>
            </div>
          </div>
          <Button onClick={handleAddEvent} disabled={actionLoading} className="w-full h-11 cursor-pointer font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all">
            {actionLoading ? <Loader2 className="animate-spin" /> : "Add Event"}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-white p-4 md:p-8 rounded-[20px] md:rounded-[24px] shadow-sm border border-slate-100 print:shadow-none print:p-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold text-[#0A0D12]">Events</h2>
            <Badge className="bg-blue-50 text-blue-600 border-none px-3 py-1 rounded-full text-xs font-bold">
              {filteredEvents.length} Events
            </Badge>
          </div>

        </div>

        <h1 className="hidden print:block text-2xl font-bold mb-4 text-center">University Calendar Events</h1>

        <div className="space-y-3">
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_100px] px-6 py-4 bg-[#FAFAFA] rounded-xl mb-4 font-semibold text-[#181D27] tracking-wider border border-[#E9EAEB]">
            <div>Event</div>
            <div>Start Date</div>
            <div>End Date</div>
            <div className="text-right px-2 print:hidden">Actions</div>
          </div>

          {loading ? (
            <div className="text-center py-10 text-slate-400"><Loader2 className="animate-spin text-blue-600 h-10 w-10 mx-auto" /></div>
          ) : filteredEvents.length > 0 ? filteredEvents.map((event) => (
            <div key={event.id} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_100px] items-start md:items-center p-4 md:px-6 md:py-5 border rounded-2xl transition-all bg-white gap-3 md:gap-0 border-[#E2E8F0] hover:shadow-md hover:border-blue-200 print:border-b print:rounded-none">

              <div className="flex flex-col md:block w-full md:w-auto">
                <span className="text-[10px] uppercase font-bold text-slate-400 md:hidden mb-1">Event</span>
                <div className="font-semibold md:font-medium text-[#181D27] text-base md:text-sm truncate">{event.type}</div>
              </div>

              <div className="flex flex-col md:block w-full md:w-auto">
                <span className="text-[10px] uppercase font-bold text-slate-400 md:hidden mb-1">Start Date</span>
                <div className="text-[#181D27] font-semibold">{new Date(event.startDate).toLocaleDateString()}</div>
              </div>

              <div className="flex flex-col md:block w-full md:w-auto">
                <span className="text-[10px] uppercase font-bold text-slate-400 md:hidden mb-1">End Date</span>
                <div className="text-[#181D27] font-semibold">{new Date(event.endDate).toLocaleDateString()}</div>
              </div>

              <div className="w-full md:w-auto flex justify-end items-center gap-1 print:hidden">
                <Button variant="ghost" size="icon" onClick={() => handleDelete(event.id)} className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

            </div>
          )) : (
            <div className="text-center py-20 text-slate-400 border-2 border-dashed border-slate-50 rounded-2xl">
              No events found.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}