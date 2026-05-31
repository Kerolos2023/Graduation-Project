"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import { useAcademicContext } from "@/hooks/useAcademicContext";
import { committeeService } from "@/services/committeeServices";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Pencil, Trash2, Loader2, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function CommitteesPage() {
  const params = useParams();
  const examTermId = params.id as string;
  const { selectedProgramId } = useAcademicContext();
  const formRef = useRef<HTMLDivElement>(null);
  const [committees, setCommittees] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
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
        setValidationErrors([]);
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


  useEffect(() => {
    if (!isLoading && examTermId && examTermId !== 'undefined') {
      const timer = setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, examTermId]);

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
    setValidationErrors([]);
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
    setValidationErrors([]);

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
      if (apiError?.errors && typeof apiError.errors === 'object') {
        setErrorMsg(apiError.title || "One or more validation errors occurred.");
        setValidationErrors(Object.values(apiError.errors).flat() as string[]);
      } else {
        setErrorMsg(apiError?.errors?.[0] || apiError?.title || "Operation failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ number: "", capacity: "", buildingId: "", roomId: "" });
    setErrorMsg(null);
    setValidationErrors([]);
    setRooms([]);
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setErrorMsg(null);
    setValidationErrors([]);
    setForm({
      number: item.committeeNumber.toString(),
      capacity: item.maxCapacity.toString(),
      buildingId: "",
      roomId: ""
    });

    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?") || !examTermId) return;
    try {
      await committeeService.delete(examTermId, id);
      setCommittees(p => p.filter(c => c.id !== id));
      toast.success("Committee deleted successfully");
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  if (!examTermId || examTermId === 'undefined') {
    return (
      <div className="w-full h-full flex flex-col gap-6 font-inter pb-8">
        <div className="bg-white rounded-[24px] border border-[#eaebf0] p-12 flex flex-col items-center justify-center gap-3 text-center shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <Loader2 className="animate-spin text-blue-600 w-12 h-12" />
          <span className="text-gray-900 font-bold text-lg">Initializing Context...</span>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col gap-6 font-inter pb-8">
        <div className="bg-white rounded-[24px] border border-[#eaebf0] p-12 flex flex-col items-center justify-center gap-3 text-center shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <Loader2 className="animate-spin text-blue-600 w-12 h-12" />
          <span className="text-gray-900 font-bold text-lg">Fetching Committee Details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-6 font-inter pb-8">
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm relative transition-all">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1.5 flex-1">
            <span className="font-bold block">{errorMsg}</span>
            {validationErrors.length > 0 && (
              <ul className="list-disc list-inside space-y-1 font-medium pl-1 text-[13px] opacity-90">
                {validationErrors.map((msg, index) => (
                  <li key={index}>{msg}</li>
                ))}
              </ul>
            )}
          </div>
          <button
            onClick={() => { setErrorMsg(null); setValidationErrors([]); }}
            className="absolute top-3 right-3 opacity-50 hover:opacity-100 transition-opacity cursor-pointer text-red-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* FORM CARD */}
      <div ref={formRef} className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0] shrink-0 scroll-mt-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-gray-900">
            {editingId ? "Update Committee" : "Adding Committee"}
          </h1>
          {editingId && (
            <button onClick={resetForm} className="text-red-500 hover:bg-red-50 rounded-xl text-xs font-bold h-9 px-3 cursor-pointer flex items-center gap-1 border border-transparent">
              <X className="w-4 h-4" /> <span>Cancel Edit</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[13px] font-bold text-gray-900 ml-1">Committee Number</label>
            <Input value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} placeholder="Ex: 17" className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm font-medium h-auto" />
          </div>
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[13px] font-bold text-gray-900 ml-1">Capacity</label>
            <Input value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder="Ex: 5" className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm font-medium h-auto" />
          </div>
          {!editingId && (
            <>
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[13px] font-bold text-gray-900 ml-1">Building</label>
                <Select onValueChange={handleBuildingChange} value={form.buildingId}>
                  <SelectTrigger className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm font-medium h-auto">
                    <SelectValue placeholder="Select Building" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {buildings.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[13px] font-bold text-gray-900 ml-1">Room</label>
                <Select onValueChange={(v) => setForm({ ...form, roomId: v })} value={form.roomId} disabled={isLoadingRooms || !form.buildingId}>
                  <SelectTrigger className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm font-medium h-auto">
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
                  <SelectContent className="rounded-xl">
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

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full active:scale-[0.99] text-white font-semibold py-3.5 rounded-[12px] transition-all shadow-sm cursor-pointer text-sm flex items-center justify-center gap-2 ${editingId ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'
            } ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin w-4 h-4" />
              <span>Saving Changes...</span>
            </>
          ) : editingId ? (
            "Save Changes"
          ) : (
            "Add"
          )}
        </button>
      </div>

      {/* LIST CARD */}
      <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-[22px] font-bold text-gray-900 leading-none">Committees</h2>
            <Badge className="bg-[#eff4ff] text-blue-600 text-[11px] font-bold px-3 py-1.5 rounded-full border border-blue-100 hover:bg-[#eff4ff] shadow-none">
              {filteredCommittees.length} Rooms
            </Badge>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-[280px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-[12px] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm font-medium h-auto" />
            </div>
          </div>
        </div>

        {/* Table Header */}
        <div className="hidden lg:grid grid-cols-[1.5fr_1.5fr_1fr_100px] items-center px-5 py-4 mb-3 border border-gray-100 bg-[#fafafa] rounded-xl font-bold text-gray-800">
          <div className="text-[13px]">Name</div>
          <div className="text-[13px]">Place</div>
          <div className="text-[13px] text-center">Capacity</div>
          <div className="text-right px-2 text-[13px]">Actions</div>
        </div>

        {/* Table Body */}
        <div className="flex flex-col gap-3 mb-8">
          {filteredCommittees.length === 0 ? (
            <div className="text-center p-8 text-gray-400 border border-gray-100 rounded-xl border-dashed">
              <p>{searchTerm ? "No committees match your search" : "No committees found for this exam term"}</p>
            </div>
          ) : (
            filteredCommittees.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "flex flex-col lg:grid lg:grid-cols-[1.5fr_1.5fr_1fr_100px] items-start lg:items-center px-5 py-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-white group gap-3 lg:gap-0 relative",
                  editingId === item.id && "bg-blue-50/50 border-blue-200"
                )}
              >
                <div className="flex flex-col lg:block w-full lg:w-auto">
                  <span className="text-[10px] uppercase font-bold text-gray-400 lg:hidden mb-1">Name</span>
                  <div className="text-[14px] font-bold text-gray-900 truncate">Committee {item.committeeNumber}</div>
                </div>

                <div className="flex flex-col lg:block w-full lg:w-auto">
                  <span className="text-[10px] uppercase font-bold text-gray-400 lg:hidden mb-1">Place</span>
                  <div className="text-[14px] font-bold text-gray-500 md:text-gray-900 truncate">{item.place || "Not Assigned"}</div>
                </div>

                <div className="flex flex-col lg:block w-full lg:w-auto lg:text-center">
                  <span className="text-[10px] uppercase font-bold text-gray-400 lg:hidden mb-1">Capacity</span>
                  <div className="text-[14px] font-bold text-gray-500 md:text-gray-900 truncate">{item.maxCapacity} Seats</div>
                </div>

                <div className="flex items-center justify-end gap-2 absolute right-4 top-4 lg:relative lg:right-auto lg:top-auto">
                  <button onClick={() => startEdit(item)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors bg-white cursor-pointer">
                    <Pencil className="w-[18px] h-[18px]" strokeWidth={2.5} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors bg-white cursor-pointer">
                    <Trash2 className="w-[18px] h-[18px]" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}