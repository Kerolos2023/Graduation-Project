
"use client";

import { useState, useEffect } from "react";
import { committeeService } from "@/services/committeeServices";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Edit2, Trash2, Loader2, X, AlertCircle, MoreVertical, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import ExamCommitteeTabs from "@/components/layout/Committee";
 const EXAM_TERM_ID = "019dda85-b914-7ca1-aefe-4843ec2fe9f4";
const BUILDING_ID = "019D64EF-1A80-7B40-A9B3-3D56F4B3A805";

export default function CommitteesPage() {
   const [committees, setCommittees] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [form, setForm] = useState({
    number: "",
    capacity: "",
    buildingId: "",
    roomId: ""
  });

   useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        setErrorMsg(null);
        const [commRes, buildRes, roomsRes] = await Promise.all([
          committeeService.getAll(EXAM_TERM_ID),
          committeeService.getBuildings(),
          committeeService.getAvailableRooms(BUILDING_ID, EXAM_TERM_ID)
        ]);
        setCommittees(commRes?.items || []);
        setBuildings(buildRes?.items || []);
        setRooms(roomsRes?.items || []);
      } catch (error: any) {
        setErrorMsg("Failed to connect to the server. Please check your connection.");
        console.error("Init Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

   const filteredCommittees = committees.filter(item => {
    const search = searchTerm.toLowerCase();
    return (
      item.committeeNumber?.toString().includes(search) ||
      (item.place && item.place.toLowerCase().includes(search))
    );
  });

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCommittees.length) setSelectedIds([]);
    else setSelectedIds(filteredCommittees.map(c => c.id));
  };

  const handleBuildingChange = async (bId: string) => {
    setForm((prev) => ({ ...prev, buildingId: bId, roomId: "" }));
    setRooms([]);
    setErrorMsg(null);
    try {
      const res = await committeeService.getAvailableRooms(bId, EXAM_TERM_ID);
      setRooms(res?.items || []);
    } catch (error) {
      toast.error("Error loading rooms for this building");
    }
  };

  const handleSubmit = async () => {
    setErrorMsg(null);
    if (!form.number || (!editingId && !form.roomId)) {
      setErrorMsg("Please fill in all required fields (Number and Room).");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        CommitteeNumber: Number(form.number),
        MaxCapacity: Number(form.capacity)
      };

      if (editingId) {
        await committeeService.update(EXAM_TERM_ID, editingId, payload);
        toast.success("Committee updated successfully", { icon: <CheckCircle2 className="text-green-500" /> });
      } else {
        await committeeService.add(EXAM_TERM_ID, form.roomId, payload);
        toast.success("New committee added successfully");
      }
      
      setEditingId(null);
      setForm({ ...form, number: "", capacity: "", roomId: "" });
      const res = await committeeService.getAll(EXAM_TERM_ID);
      setCommittees(res?.items || []);
    } catch (error: any) {
      const apiError = error.response?.data;
      const message = apiError?.errors?.[0] || apiError?.title || "An unexpected error occurred. Please try again.";
      setErrorMsg(message);
      toast.error("Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setErrorMsg(null);
    setForm({
      number: item.committeeNumber.toString(),
      capacity: item.maxCapacity.toString(),
      buildingId: BUILDING_ID,
      roomId: "" 
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="p-3 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto bg-[#F5F5F5] min-h-screen">
      <ExamCommitteeTabs />

      {/* 1. Add/Edit Card */}
      <Card className="border-none shadow-sm rounded-2xl md:rounded-3xl overflow-hidden bg-white">
        <CardHeader className="pb-2 pt-6 md:pt-8 px-5 md:px-8 border-b border-gray-50">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg md:text-2xl font-bold text-[#0A0D12]">
              {editingId ? "Update Committee" : "Adding Committee"}
            </CardTitle>
            {editingId && (
              <Button variant="ghost" size="sm" onClick={() => { setEditingId(null); setForm({...form, number: "", capacity: ""}); setErrorMsg(null); }} className="text-red-500 hover:bg-red-50 rounded-xl font-semibold gap-1">
                <X className="w-4 h-4" /> <span className="hidden sm:inline">Cancel Edit</span>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-5  md:p-8 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2  flex flex-col">
              <label className="text-sm font-semibold text-[#090909] ml-1">Committee Number</label>
              <Input value={form.number} onChange={(e) => setForm({...form, number: e.target.value})} placeholder="Ex: 17" className={`h-12 bg-gray-50/50 border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-blue-500 ${errorMsg && !form.number ? "border-red-500" : ""}`} />
            </div>
            <div className="space-y-2 flex flex-col">
              <label className="text-sm font-semibold text-[#090909] ml-1">Capacity</label>
              <Input value={form.capacity} onChange={(e) => setForm({...form, capacity: e.target.value})} placeholder="Ex: 5" className="h-12 bg-gray-50/50 border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-blue-500" />
            </div>
            {!editingId && (
              <>
                <div className="space-y-2 flex flex-col">
                  <label className="text-sm font-semibold text-[#090909] ml-1">Building</label>
                  <Select onValueChange={handleBuildingChange} value={form.buildingId}>
                    <SelectTrigger className="h-12 bg-gray-50/50 border-[#E2E8F0] rounded-xl"><SelectValue placeholder="Select Building" /></SelectTrigger>
                    <SelectContent>
                      {buildings.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 flex flex-col">
                  <label className="text-sm font-semibold text-[#090909] ml-1">Room </label>
                  <Select onValueChange={(v) => setForm({...form, roomId: v})} value={form.roomId}>
                    <SelectTrigger className={`h-12 bg-gray-50/50 border-[#E2E8F0] rounded-xl ${errorMsg && !form.roomId ? "border-red-500" : ""}`}>
                      <SelectValue placeholder={rooms.length === 0 ? "No rooms available" : "Select Room"} />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms.map((r: any) => <SelectItem key={r.id} value={r.id}>Room {r.roomNumber} (Cap: {r.capacity})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          <Button onClick={handleSubmit} disabled={isSubmitting} className={`w-full h-12 md:h-14 rounded-xl text-lg font-bold shadow-sm ${editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-[#2B59FF] hover:bg-blue-700'}`}>
            {isSubmitting ? <Loader2 className="animate-spin" /> : editingId ? "Save Changes" : "Add"}
          </Button>

          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div className="text-sm font-bold tracking-tight">{errorMsg}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. List Section */}
      <Card className="border-none shadow-sm rounded-2xl md:rounded-3xl bg-white p-4 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold text-[#0A0D12]">Committees</h2>
            <span className="bg-blue-50 text-[#2B59FF] text-[10px] md:text-xs font-semibold px-2 py-1 rounded-full border border-blue-100  tracking-tight">
              {filteredCommittees.length} Rooms
            </span>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 h-11 bg-white border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-blue-100 w-full" />
            </div>
            <Button variant="ghost" size="icon" className="h-11 w-11 flex-shrink-0 rounded-xl text-slate-400 border border-[#E2E8F0] hover:bg-slate-50"><MoreVertical className="w-5 h-5" /></Button>
          </div>
        </div>

         <div className="hidden lg:grid grid-cols-[50px_1.5fr_1.5fr_1fr_120px] items-center px-6 py-4 bg-[#FAFAFA] rounded-xl text-xs font-semibold text-[#181D27] tracking-wider mb-4 border border-gray-100">
          <div className="flex justify-center">
            <Checkbox checked={selectedIds.length === filteredCommittees.length && filteredCommittees.length > 0} onCheckedChange={toggleSelectAll} className="h-5 w-5 border-slate-300 rounded-lg data-[state=checked]:bg-[#2B59FF] data-[state=checked]:border-[#2B59FF]" />
          </div>
          <div>Name</div>
          <div>Place</div>
          <div>Capacity</div>
          <div className="text-right pr-4">Actions</div>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <div className="py-20 text-center flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
              <span className="text-slate-400 font-medium tracking-tight">Fetching committees...</span>
            </div>
          ) : filteredCommittees.length === 0 ? (
            <div className="py-10 text-center text-gray-400 font-bold bg-gray-50 rounded-2xl border border-dashed flex flex-col items-center gap-2">
              <Search className="w-8 h-8 opacity-20" />
              {searchTerm ? "No results match your search" : "No committees found in this term"}
            </div>
          ) : (
            filteredCommittees.map((item) => (
              <div 
                key={item.id} 
                className={`grid grid-cols-1 lg:grid-cols-[50px_1.5fr_1.5fr_1fr_120px] items-start lg:items-center p-4 lg:px-6 lg:py-5 border rounded-2xl transition-all group bg-white gap-3 lg:gap-0 ${selectedIds.includes(item.id) ? 'border-[#2B59FF] shadow-sm bg-blue-50/10' : 'border-[#E2E8F0] hover:shadow-md'}`}
              >
                
                <div className="flex items-center justify-between w-full lg:contents">
                   <div className="flex items-center gap-3 lg:justify-center">
                      <Checkbox checked={selectedIds.includes(item.id)} onCheckedChange={() => toggleSelect(item.id)} className="h-5 w-5 border-slate-300 rounded-lg data-[state=checked]:bg-[#2B59FF] data-[state=checked]:border-[#2B59FF]" />
                      <div className="lg:hidden font-bold text-[#1E293B] text-sm">Committee {item.committeeNumber}</div>
                   </div>
                   
                   <div className="flex lg:hidden gap-1">
                      <Button onClick={() => startEdit(item)} variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50"><Edit2 className="w-4 h-4" /></Button>
                      <Button onClick={async () => {}} variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                   </div>
                </div>

                <div className="hidden lg:block font-bold text-[#1E293B] text-[15px]">Committee {item.committeeNumber}</div>
                
                <div className="flex flex-col lg:block text-slate-600 font-medium">
                  <span className="lg:hidden text-[10px] text-slate-400 uppercase font-bold mb-1">Place:</span>
                  <span className="text-sm lg:text-base">{item.place || "Not Assigned"}</span>
                </div>
                
                <div className="flex flex-col lg:block text-slate-600 font-medium">
                  <span className="lg:hidden text-[10px] text-slate-400 uppercase font-bold mb-1">Capacity:</span>
                  <span className="text-sm lg:text-base">{item.maxCapacity}</span>
                </div>

                <div className="hidden lg:flex items-center justify-end gap-2">
                  <Button onClick={() => startEdit(item)} variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-[#2B59FF] hover:bg-blue-50 rounded-xl transition-all"><Edit2 className="w-[18px] h-[18px]" /></Button>
                  <Button onClick={async () => { 
                    if(confirm("Are you sure?")) {
                      try {
                        await committeeService.delete(EXAM_TERM_ID, item.id);
                        setCommittees(p => p.filter(c => c.id !== item.id));
                        toast.success("Deleted");
                      } catch (e) { toast.error("Delete failed"); }
                    }
                  }} variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-[18px] h-[18px]" /></Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}








 

 