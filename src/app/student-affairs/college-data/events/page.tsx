 

  "use client"

import React, { useState, useEffect } from 'react';
import { Search, Printer, Edit2, Trash2, Loader2, MoreHorizontal } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import eventService, { AcademicEvent } from '@/services/eventServices';

export default function UniversityEventsPage() {
  const [isClient, setIsClient] = useState(false);
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Form State
  const [type, setType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  
  useEffect(() => {
    setIsClient(true);
    loadData();
  }, []);

  const loadData = async (query = "") => {
    setLoading(true);
    try {
      const data = await eventService.getEvents(query);
      setEvents(data.items || []);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

     
 
  const handlePrint = () => {
    window.print();
  };

  const handleAddEvent = async () => {
    if (!type || !startDate || !endDate) {
      alert("Please fill in all fields.");
      return;
    }
    setActionLoading(true);
    try {
      await eventService.addEvent({ type, startDate, endDate });
      setType(""); setStartDate(""); setEndDate("");
      loadData(search);
    } catch (error: any) {
      console.log("Details:", error.response?.data);
      alert("Error adding event: " + (error.response?.data?.title || "Bad Request"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm( "Are you sure you want to delete this event?")) return;
    try {
      await eventService.deleteEvent(id);
      loadData(search);
    } catch (error) {
      console.error("Delete Error:", error);
    }
  };

  if (!isClient) return null;

  return (
    <div className="p-6 bg-[#F9FAFB] min-h-screen space-y-8 font-sans print:p-0">
      
       <Card className="border-none shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] rounded-[20px] p-4 print:hidden">
        <CardContent className="pt-4 space-y-6">
          <h2 className="text-[22px] font-bold text-[#0A0D12]">University calendar</h2>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-[#090909]">Event</label>
              <Select onValueChange={setType} value={type}>
                <SelectTrigger className="h-[55px] rounded-[15px] border-[#E8E8E8] bg-white">
                  <SelectValue placeholder="Select Event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AdvisorRegistration">Advisor Registration</SelectItem>
                  <SelectItem value="StudentRegistration">Student Registration</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-[#090909]">Start Date</label>
                <Input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} className="h-[55px] rounded-[15px] border-[#E8E8E8]" />
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-[#090909]">End Date</label>
                <Input type="date" value={endDate} onChange={(e)=>setEndDate(e.target.value)} className="h-[55px] rounded-[15px] border-[#E8E8E8]" />
              </div>
            </div>
          </div>
          <Button onClick={handleAddEvent} disabled={actionLoading} className="w-full h-[55px] bg-[#2463F0] hover:bg-blue-700 rounded-[15px] text-[16px] font-bold">
            {actionLoading ? <Loader2 className="animate-spin mr-2" /> : "Add Event"}
          </Button>
        </CardContent>
      </Card>

       <Card className="border-none shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] rounded-[20px] p-6 print:shadow-none print:p-0">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <h2 className="text-[24px] font-bold text-[#0A0D12]">Events</h2>
            <span className="bg-[#E8F0FF] text-[#2D60FF] text-[11px] px-3 py-1 rounded-full font-bold">
              {events.length} Events
            </span>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#888888]" />
              <Input 
                placeholder="Search" 
                value={search}
                onChange={(e) => { 
                  setSearch(e.target.value); 
                  loadData(e.target.value);        
                }}
                className="pl-12 h-[50px] rounded-[15px] bg-[#F9FAFB] border-none" 
              />
              
            </div>
            <Button 
              onClick={handlePrint} 
              variant="outline" 
              className="h-[50px] rounded-[15px] border-[#2D60FF] text-[#2D60FF] font-bold px-6"
            >
              <Printer className="h-5 w-5 mr-2" /> Print
            </Button>
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-slate-200">
              <MoreHorizontal className="h-5 w-5 text-slate-400" />
            </Button>
          </div>
        </div>

         <h1 className="hidden print:block text-2xl font-bold mb-4 text-center">University Calendar Events</h1>

        <div className="space-y-3">
          {/* Header */}
          <div className="grid grid-cols-[50px_2fr_1fr_1fr_100px] items-center px-6 py-4 bg-[#F9FAFB] rounded-[15px] text-[14px] font-bold text-[#181D27] print:bg-gray-100">
            <input type="checkbox" className="h-4 w-4 accent-[#2D60FF] print:hidden" />
            <div>Event</div>
            <div>Start Date</div>
            <div>End Date</div>
            <div className="text-right px-2 print:hidden">Actions</div>
          </div>

          {/* Data Rows */}
          {loading ? (
             <div className="text-center py-10 text-gray-400">Loading events...</div>
          ) : events.length > 0 ? events.map((event) => (
            <div key={event.id} className="grid grid-cols-[50px_2fr_1fr_1fr_100px] items-center px-6 py-4 bg-white border border-[#F2F4F7] rounded-[15px] text-[14px] text-[#181D27] hover:shadow-md transition-all print:border-b print:rounded-none">
              <input type="checkbox" className="h-4 w-4 accent-[#2D60FF] print:hidden" />
              <div className="font-semibold text-[#181D27]">{event.type}</div>
              <div>{new Date(event.startDate).toLocaleDateString()}</div>
              <div>{new Date(event.endDate).toLocaleDateString()}</div>
              <div className="flex justify-end gap-2 print:hidden">
                <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-blue-600">
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(event.id)} className="h-9 w-9 text-gray-400 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )) : (
            <div className="text-center py-20 text-gray-400">No events found.</div>
          )}
        </div>
      </Card>
    </div>
  );
}