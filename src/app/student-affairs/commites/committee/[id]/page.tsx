"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useAcademicContext } from "@/hooks/useAcademicContext"; 
import { committeeService } from "@/services/committeeServices";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Edit2, Trash2, Loader2, X, AlertCircle, MoreVertical, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function CommitteesPage() {
  const params = useParams();
  const examTermId = params.id as string;
  const { selectedProgramId } = useAcademicContext();

  const [committees, setCommittees] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // حالة لمتابعة ما إذا كان يتم تحميل الغرف حالياً
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);

  const [form, setForm] = useState({
    number: "",
    capacity: "",
    buildingId: "",
    roomId: ""
  });

  useEffect(() => {
    const init = async () => {
      if (!examTermId || examTermId === 'undefined') return;
      
      try {
        setIsLoading(true);
        setErrorMsg(null);
        const [commRes, buildRes] = await Promise.all([
          committeeService.getAll(examTermId),
          committeeService.getBuildings()
        ]);
        setCommittees(commRes?.items || []);
        setBuildings(buildRes?.items || []);
      } catch (error: any) {
        const errorDetail = error.response?.data?.errors?.[0] || "Failed to load data";
        setErrorMsg(errorDetail);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [examTermId]);

  const filteredCommittees = useMemo(() => {
    return committees.filter(item => {
      const search = searchTerm.toLowerCase();
      return (
        item.committeeNumber?.toString().includes(search) ||
        (item.place && item.place.toLowerCase().includes(search))
      );
    });
  }, [committees, searchTerm]);

  const handleBuildingChange = async (bId: string) => {
    if (!examTermId || examTermId === 'undefined') return;
    
    setForm((prev) => ({ ...prev, buildingId: bId, roomId: "" }));
    setRooms([]);
    setErrorMsg(null);
    setIsLoadingRooms(true); 
    
    try {
      const res = await committeeService.getAvailableRooms(bId, examTermId);
      setRooms(res?.items || []);
    } catch (error) {
      toast.error("Error loading rooms for this building");
    } finally {
      setIsLoadingRooms(false);   
    }
  };

  const handleSubmit = async () => {
    if (!examTermId || examTermId === 'undefined') {
      toast.error("Exam ID is missing");
      return;
    }
    setErrorMsg(null);
    if (!form.number || (!editingId && !form.roomId)) {
      setErrorMsg("Please fill in all required fields (Number and Room).");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = { CommitteeNumber: Number(form.number), MaxCapacity: Number(form.capacity) };
      if (editingId) {
        await committeeService.update(examTermId, editingId, payload);
        toast.success("Committee updated successfully");
      } else {
        await committeeService.add(examTermId, form.roomId, payload);
        toast.success("New committee added successfully");
      }
      resetForm();
      const res = await committeeService.getAll(examTermId);
      setCommittees(res?.items || []);
    } catch (error: any) {
      const apiError = error.response?.data;
      setErrorMsg(apiError?.errors?.[0] || apiError?.title || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ number: "", capacity: "", buildingId: "", roomId: "" });
    setErrorMsg(null);
    setRooms([]);
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setErrorMsg(null);
    setForm({
      number: item.committeeNumber.toString(),
      capacity: item.maxCapacity.toString(),
      buildingId: "", 
      roomId: "" 
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?") || !examTermId) return;
    try {
      await committeeService.delete(examTermId, id);
      setCommittees(p => p.filter(c => c.id !== id));
      toast.success("Committee deleted successfully");
    } catch (e) { toast.error("Delete failed"); }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCommittees.length) setSelectedIds([]);
    else setSelectedIds(filteredCommittees.map(c => c.id));
  };

  if (!examTermId || examTermId === 'undefined') {
    return (
      <div className="py-20 text-center flex flex-col items-center gap-3 min-h-screen justify-center bg-[#F5F5F5]">
        <Loader2 className="animate-spin text-blue-600 w-12 h-12" />
        <span className="text-slate-500 font-bold text-lg">Initializing Context...</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="py-20 text-center flex flex-col items-center gap-3 min-h-screen justify-center bg-[#F5F5F5]">
        <Loader2 className="animate-spin text-blue-600 w-12 h-12" />
        <span className="text-slate-500 font-bold text-lg">Fetching Committee Details...</span>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto bg-[#F5F5F5] min-h-screen font-sans">
      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardHeader className="pb-2 pt-8 px-8 border-b border-gray-50">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-[#0A0D12]">
              {editingId ? "Update Committee" : "Adding Committee"}
            </CardTitle>
            {editingId && (
              <Button variant="ghost" size="sm" onClick={resetForm} className="text-red-500 hover:bg-red-50 rounded-xl font-bold gap-1">
                <X className="w-4 h-4" /> Cancel Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 flex flex-col">
              <label className="text-sm font-semibold text-[#090909] ml-1">Committee Number</label>
              <Input value={form.number} onChange={(e) => setForm({...form, number: e.target.value})} placeholder="Ex: 17" className="h-14 bg-gray-50/50 border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-blue-100" />
            </div>
            <div className="space-y-2 flex flex-col">
              <label className="text-sm font-semibold text-[#090909] ml-1">Capacity</label>
              <Input value={form.capacity} onChange={(e) => setForm({...form, capacity: e.target.value})} placeholder="Ex: 5" className="h-14 bg-gray-50/50 border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-blue-100" />
            </div>
            {!editingId && (
              <>
                <div className="space-y-2 flex flex-col">
                  <label className="text-sm font-semibold text-[#090909] ml-1">Building</label>
                  <Select onValueChange={handleBuildingChange} value={form.buildingId}>
                    <SelectTrigger className="h-14 bg-gray-50/50 border-[#E2E8F0] rounded-xl">
                      <SelectValue placeholder="Select Building" />
                    </SelectTrigger>
                    <SelectContent>
                      {buildings.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 flex flex-col">
                  <label className="text-sm font-semibold text-[#090909] ml-1">Room</label>
                  <Select onValueChange={(v) => setForm({...form, roomId: v})} value={form.roomId} disabled={isLoadingRooms || !form.buildingId}>
                    <SelectTrigger className="h-14 bg-gray-50/50 border-[#E2E8F0] rounded-xl">
                      <SelectValue 
                        placeholder={
                          isLoadingRooms 
                            ? "Loading rooms..." 
                            : !form.buildingId 
                              ? "Select Building First" 
                              : rooms.length === 0 
                                ? "No rooms available" 
                                : "Select Room"
                        } 
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms.length > 0 ? (
                        rooms.map((r: any) => (
                          <SelectItem key={r.id} value={r.id}>
                            Room {r.roomNumber} (Cap: {r.capacity})
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm text-slate-400">
                          {form.buildingId ? "No rooms available in this building" : "Please select a building"}
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
          <Button onClick={handleSubmit} disabled={isSubmitting} className={`w-full h-14 rounded-xl text-lg font-bold shadow-md transition-all ${editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-[#2B59FF] hover:bg-blue-700'}`}>
            {isSubmitting ? <Loader2 className="animate-spin w-6 h-6" /> : editingId ? "Save Changes" : "Add Committee"}
          </Button>
          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-600 font-bold">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </CardContent>
      </Card>

       <Card className="border-none shadow-sm rounded-3xl bg-white p-4 md:p-8 overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-[#0A0D12]">Committees</h2>
            <span className="bg-blue-50 text-[#2B59FF] text-xs font-bold px-3 py-1 rounded-full border border-blue-100">
              {filteredCommittees.length} Rooms
            </span>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-11 h-12 bg-white border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-blue-50" />
            </div>
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl text-slate-400 border-[#E2E8F0] hover:bg-slate-50"><MoreVertical className="w-5 h-5" /></Button>
          </div>
        </div>

        <div className="hidden lg:grid grid-cols-[50px_1.5fr_1.5fr_1fr_150px] items-center px-6 py-4 bg-[#FAFAFA] rounded-xl text-xs font-semibold text-[#181D27] mb-4 border border-gray-50">
          <div className="flex justify-center">
            <Checkbox checked={selectedIds.length === filteredCommittees.length && filteredCommittees.length > 0} onCheckedChange={toggleSelectAll} className="h-5 w-5 rounded-lg" />
          </div>
          <div>Name</div>
          <div>Place</div>
          <div>Capacity</div>
          <div className="text-right pr-4">Actions</div>
        </div>

        <div className="space-y-3">
          {filteredCommittees.length === 0 ? (
            <div className="py-20 text-center text-gray-400 font-bold bg-gray-50 rounded-3xl border-2 border-dashed flex flex-col items-center gap-3">
              <Search className="w-10 h-10 opacity-10" />
              <p>{searchTerm ? "No committees match your search" : "No committees found for this exam term"}</p>
            </div>
          ) : (
            filteredCommittees.map((item) => (
              <div 
                key={item.id} 
                className={`grid grid-cols-1 lg:grid-cols-[50px_1.5fr_1.5fr_1fr_150px] items-center p-4 lg:px-6 lg:py-5 border rounded-2xl transition-all bg-white gap-3 lg:gap-0 ${selectedIds.includes(item.id) ? 'border-[#2B59FF] shadow-sm bg-blue-50/5' : 'border-[#E2E8F0] hover:shadow-md hover:border-blue-200'}`}
              >
                <div className="flex items-center justify-between lg:contents">
                  <div className="flex items-center gap-3 lg:justify-center">
                    <Checkbox checked={selectedIds.includes(item.id)} onCheckedChange={() => toggleSelect(item.id)} className="h-5 w-5 rounded-lg" />
                    <div className="lg:hidden font-bold text-[#1E293B]">Committee {item.committeeNumber}</div>
                  </div>
                  <div className="flex lg:hidden gap-1">
                    <Button onClick={() => startEdit(item)} variant="ghost" size="sm" className="h-9 w-9 p-0 text-blue-600 hover:bg-blue-50"><Edit2 className="w-4 h-4" /></Button>
                    <Button onClick={() => handleDelete(item.id)} variant="ghost" size="sm" className="h-9 w-9 p-0 text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
                <div className="hidden lg:block font-bold text-[#1E293B]">Committee {item.committeeNumber}</div>
                <div className="text-slate-600 font-medium">
                  <span className="lg:hidden text-[10px] text-slate-400 uppercase font-bold block mb-1">Place:</span>
                  {item.place || "Not Assigned"}
                </div>
                <div className="text-slate-600 font-medium">
                  <span className="lg:hidden text-[10px] text-slate-400 uppercase font-bold block mb-1">Capacity:</span>
                  {item.maxCapacity} Seats
                </div>
                <div className="hidden lg:flex items-center justify-end gap-2">
                  <Button onClick={() => startEdit(item)} variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-[#2B59FF] hover:bg-blue-50 rounded-xl transition-all"><Edit2 className="w-5 h-5" /></Button>
                  <Button onClick={() => handleDelete(item.id)} variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}