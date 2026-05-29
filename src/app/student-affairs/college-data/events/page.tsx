"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Search, Trash2, Loader2, AlertCircle, X } from 'lucide-react';
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
  const topRef = useRef<HTMLDivElement>(null);

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
    <div className="w-full h-full flex flex-col gap-6 font-inter pb-8">
      {statusMessage.type && (
        <div className={`border px-4 py-3 rounded-xl text-sm ${
          statusMessage.type === 'error' ? 'bg-red-50 border-red-200 text-red-700 font-bold' :
          statusMessage.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800 font-semibold' :
          'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {statusMessage.type === 'error' && <AlertCircle className="w-5 h-5" />}
              <span>{statusMessage.text}</span>
            </div>
            <button onClick={() => setStatusMessage({ text: "", type: null })} className="cursor-pointer">
              <X className="w-4 h-4 opacity-50" />
            </button>
          </div>
        </div>
      )}

      {/* FORM CARD */}
      <Card ref={topRef} className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0] shrink-0 print:hidden">
        <CardContent className="p-0 flex flex-col gap-6">
          <h1 className="text-xl font-bold text-gray-900">University calendar</h1>
          
          <div className="grid grid-cols-1 gap-6">
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[13px] font-bold text-gray-900 ml-1">Event</label>
              <Select onValueChange={setType} value={type}>
                <SelectTrigger className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm font-medium h-auto">
                  <SelectValue placeholder="Select Event" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="AdvisorRegistration">Advisor Registration</SelectItem>
                  <SelectItem value="StudentRegistration">Student Registration</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[13px] font-bold text-gray-900 ml-1">Start Date</label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm font-medium h-auto" />
              </div>
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[13px] font-bold text-gray-900 ml-1">End Date</label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm font-medium h-auto" />
              </div>
            </div>
          </div>

          <button 
            onClick={handleAddEvent} 
            disabled={actionLoading} 
            className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold py-3.5 rounded-[12px] transition-all shadow-sm cursor-pointer text-sm flex items-center justify-center"
          >
            {actionLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Add"}
          </button>
        </CardContent>
      </Card>

      {/* LIST CARD */}
      <Card className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0] print:border-none print:shadow-none print:p-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 print:hidden">
          <div className="flex items-center gap-3">
            <h2 className="text-[22px] font-bold text-gray-900 leading-none">Events</h2>
            <Badge className="bg-[#eff4ff] text-blue-600 text-[11px] font-bold px-3 py-1.5 rounded-full border border-blue-100 hover:bg-[#eff4ff] shadow-none">
              {filteredEvents.length} Events
            </Badge>
          </div>
        </div>

        <h1 className="hidden print:block text-2xl font-bold mb-4 text-center">University Calendar Events</h1>

        {/* Table Header */}
        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_100px] px-5 py-4 mb-3 border border-gray-100 bg-[#fafafa] rounded-xl font-bold text-gray-800 print:grid print:bg-slate-100 print:grid-cols-[2fr_1fr_1fr]">
          <div className="text-[13px]">Event</div>
          <div className="text-[13px]">Start Date</div>
          <div className="text-[13px]">End Date</div>
          <div className="text-right px-2 print:hidden text-[13px]">Actions</div>
        </div>

        {/* Table Body */}
        <div className="flex flex-col gap-3 mb-8">
          {loading ? (
            <div className="text-center p-4 text-gray-500 text-sm">
              <Loader2 className="animate-spin w-5 h-5 inline-block mr-2 text-blue-600" /> Loading...
            </div>
          ) : filteredEvents.length > 0 ? filteredEvents.map((event) => (
            <div 
              key={event.id} 
              className="flex flex-col md:grid md:grid-cols-[2fr_1fr_1fr_100px] items-start md:items-center px-5 py-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-white group gap-3 md:gap-0 relative print:grid print:grid-cols-[2fr_1fr_1fr] print:border-b print:border-slate-100 print:rounded-none print:px-2 print:py-3 print:shadow-none"
            >
              <div className="flex flex-col md:block w-full md:w-auto">
                <span className="text-[10px] uppercase font-bold text-gray-400 md:hidden print:hidden mb-1">Event</span>
                <div className="text-[14px] font-bold text-gray-900 truncate">{event.type}</div>
              </div>

              <div className="flex flex-col md:block w-full md:w-auto">
                <span className="text-[10px] uppercase font-bold text-gray-400 md:hidden print:hidden mb-1">Start Date</span>
                <div className="text-[14px] font-bold text-gray-500 md:text-gray-900">{new Date(event.startDate).toLocaleDateString()}</div>
              </div>

              <div className="flex flex-col md:block w-full md:w-auto">
                <span className="text-[10px] uppercase font-bold text-gray-400 md:hidden print:hidden mb-1">End Date</span>
                <div className="text-[14px] font-bold text-gray-500 md:text-gray-900">{new Date(event.endDate).toLocaleDateString()}</div>
              </div>

              <div className="flex items-center justify-end gap-2 absolute right-4 top-4 sm:relative sm:right-auto sm:top-auto print:hidden">
                <button 
                  onClick={() => handleDelete(event.id)} 
                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors bg-white cursor-pointer"
                >
                  <Trash2 className="w-[18px] h-[18px]" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          )) : (
            <div className="text-center p-8 text-gray-400 border border-gray-100 rounded-xl border-dashed">
              No events found.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}