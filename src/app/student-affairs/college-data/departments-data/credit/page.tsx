 

 






"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Search, Edit2, Trash2, Loader2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { StudyLoadService, StudyLoadResponse } from "@/services/studyLoadServices";
import { levelService, AcademicLevel } from "@/services/levelsServices";
import CollegeDataTabs from "@/components/departmentsTabs";
import { useAcademicContext } from "@/hooks/useAcademicContext";
import { cn } from "@/lib/utils";

export default function CreditLoadPage() {
  const { selectedProgramId, selectedYearId, isAcademicReady, academicVersion } = useAcademicContext();

  const [data, setData] = useState<StudyLoadResponse[]>([]);
  const [availableLevels, setAvailableLevels] = useState<AcademicLevel[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [formData, setFormData] = useState({
    levelId: "",
    semesterType: "",
    minHours: "",
    maxHours: "",
  });

  const fetchLevels = useCallback(async () => {
    if (!selectedProgramId) return;
    try {
      const res = await levelService.getAllLevels(selectedProgramId, { PageNumber: 1, PageSize: 100 });
      setAvailableLevels(res.items || []);
    } catch (error) { 
      console.error(error); 
    }
  }, [selectedProgramId]);

  const fetchData = useCallback(async () => {
    if (!selectedProgramId) return;
    setFetching(true);
    try {
      const result = await StudyLoadService.getAll(selectedProgramId);
      setData(result || []);
    } catch { 
      toast.error("Error fetching data"); 
    } finally { 
      setFetching(false); 
    }
  }, [selectedProgramId]);

  useEffect(() => {
    if (isAcademicReady) {
      fetchLevels();
      fetchData();
    }
  }, [fetchData, fetchLevels, academicVersion, isAcademicReady]);

   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const filteredData = useMemo(() => {
    const term = search.toLowerCase().trim();
    return data.filter(item => 
      item.levelName?.toLowerCase().includes(term) || 
      item.semesterName?.toLowerCase().includes(term)
    );
  }, [data, search]);

   const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    return filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const handleSave = async () => {
    if (!selectedProgramId || !selectedYearId) return toast.error("Context missing");
    if (!formData.levelId || !formData.semesterType || !formData.minHours || !formData.maxHours) {
      return toast.warning("Fill all fields");
    }

    setLoading(true);
    try {
      const payload = {
        academicYearId: selectedYearId,
        semesterType: formData.semesterType,
        minHours: Number(formData.minHours),
        maxHours: Number(formData.maxHours),
      };
      
      if (editingId) {
        await StudyLoadService.update(selectedProgramId, editingId, payload);
      } else {
        await StudyLoadService.add(selectedProgramId, formData.levelId, payload);
      }
      
      toast.success(editingId ? "Updated Successfully" : "Added Successfully");
      cancelEdit();
      fetchData();
    } catch (error: any) { 
      toast.error("Operation failed"); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleEdit = (item: StudyLoadResponse) => {
    setEditingId(item.id);
    setFormData({ 
      levelId: item.levelId, 
      semesterType: item.semesterName, 
      minHours: item.minHours.toString(), 
      maxHours: item.maxHours.toString() 
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ levelId: "", semesterType: "", minHours: "", maxHours: "" });
  };

  
  const handleDelete = async (id: string) => {
    if (!selectedProgramId || !confirm("Are you sure you want to delete this credit load?")) return;
    try {
      await StudyLoadService.remove(selectedProgramId, id);  
      toast.success("Deleted successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

   if (!selectedProgramId || !selectedYearId) {
    return (
      <div className="p-4 md:p-10 max-w-6xl mx-auto space-y-8 bg-[#F9FAFB] min-h-screen font-sans">
        <CollegeDataTabs />
        <div className="text-center py-20 text-slate-500 bg-white rounded-[2.5rem] border shadow-sm">
          Please select an Academic Program and Year to manage credit loads.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 max-w-6xl mx-auto space-y-8 bg-[#F9FAFB] min-h-screen font-sans">
      <CollegeDataTabs />

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-xl md:text-2xl font-bold text-[#0A0D12]">
            {editingId ? "Update Credit Load" : "Credit Load by Level"}
          </h2>
          {editingId && (
            <button onClick={cancelEdit} className="flex items-center gap-1 text-red-500 hover:text-red-600 text-sm font-bold cursor-pointer">
              <X size={18} /> <span>Cancel Edit</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 mb-10">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#090909]">Semester</label>
            <Select value={formData.semesterType} onValueChange={v => setFormData({ ...formData, semesterType: v })}>
              <SelectTrigger className="h-14 border-slate-200 rounded-2xl px-5 focus:ring-blue-400 bg-[#F9FAFB]/50">
                <SelectValue placeholder="Select Semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fall">Fall</SelectItem>
                <SelectItem value="Spring">Spring</SelectItem>
                <SelectItem value="Summer">Summer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#090909]">Level</label>
            <Select value={formData.levelId} onValueChange={v => setFormData({ ...formData, levelId: v })} disabled={!!editingId}>
              <SelectTrigger className="h-14 border-slate-200 rounded-2xl px-5 focus:ring-blue-400 bg-[#F9FAFB]/50">
                <SelectValue placeholder="Select Level" />
              </SelectTrigger>
              <SelectContent>
                {availableLevels.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#090909]">Minimum Credit Hours</label>
            <Input type="number" value={formData.minHours} onChange={e => setFormData({ ...formData, minHours: e.target.value })} className="h-14 border-slate-200 rounded-2xl px-5 focus:ring-blue-400" placeholder="e.g. 12" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#090909]">Maximum Credit Hours</label>
            <Input type="number" value={formData.maxHours} onChange={e => setFormData({ ...formData, maxHours: e.target.value })} className="h-14 border-slate-200 rounded-2xl px-5 focus:ring-blue-400" placeholder="e.g. 18" />
          </div>
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full h-14 bg-[#2463F0] hover:bg-[#1D4ED8] rounded-2xl font-bold text-white shadow-lg transition-all text-lg cursor-pointer">
          {loading ? <Loader2 className="animate-spin" /> : editingId ? "Save Changes" : "Add Credit Load"}
        </Button>
      </div>

       <div className="bg-white p-8 rounded-[2.5rem] border border-[#E9EAEB] shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-[#0A0D12]">Levels</h2>
            <Badge className="bg-[#EFF8FF] text-[#2463F0] border border-[#BEDAFF] rounded-full px-4 py-0.5 text-xs font-semibold">
              {filteredData.length} Levels
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search" value={search} onChange={handleSearchChange} className="pl-12 h-12 bg-[#F9FAFB] border-slate-200 rounded-xl text-sm" />
            </div>
           </div>
        </div>

         <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F8FAFC] text-[#181D27] text-[11px] font-black uppercase tracking-[0.15em]">
              <tr>
                <th className="px-10 py-5 rounded-l-2xl">Name</th>
                <th className="px-6 py-5 text-center">Min</th>
                <th className="px-6 py-5 text-center">Max</th>
                <th className="px-10 py-5 text-right rounded-r-2xl">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {fetching ? (
                <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600 h-10 w-10" /></td></tr>
              ) : paginatedData.length === 0 ? (
                <tr><td colSpan={4} className="py-16 text-center text-slate-400 font-medium">No credit loads found.</td></tr>
              ) : (
                paginatedData.map((row) => (
                  <tr key={row.id} className={cn("group transition-all", editingId === row.id ? "bg-blue-50/30" : "hover:bg-slate-50/50")}>
                    <td className="px-10 py-6">
                      <div className="font-bold text-[#181D27] text-base">{row.levelName}</div>
                      <div className="text-[10px] text-blue-500 font-black uppercase mt-1 tracking-wider">{row.semesterName} Semester</div>
                    </td>
                    <td className="px-6 py-6 text-center text-[#181D27] font-medium">{row.minHours}</td>
                    <td className="px-6 py-6 text-center text-[#181D27] font-medium">{row.maxHours}</td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(row)} className="h-10 w-10 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl cursor-pointer"><Edit2 size={18} /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(row.id)} className="h-10 w-10 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl cursor-pointer"><Trash2 size={18} /></Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

         {/* Paginatioooooooon */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Showing Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                disabled={currentPage === 1}
                className="rounded-xl border-slate-200 cursor-pointer"
              >
                <ChevronLeft size={16} className="mr-1" /> Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                disabled={currentPage === totalPages}
                className="rounded-xl border-slate-200 cursor-pointer"
              >
                Next <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}