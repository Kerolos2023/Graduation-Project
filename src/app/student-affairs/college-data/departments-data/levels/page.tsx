 


"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Trash2, Edit2, Loader2, X, Search, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pagination } from '@/components/ui/pagination';

import { levelService, AcademicLevel } from "@/services/levelsServices";
import CollegeDataTabs from "@/components/departmentsTabs";
import { useAcademicContext } from "@/hooks/useAcademicContext";
import { cn } from "@/lib/utils";

export default function AcademicLevelsPage() {
  const { selectedProgramId, isAcademicReady, academicVersion } = useAcademicContext();

  const [levels, setLevels] = useState<AcademicLevel[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(false);         
  const [submitting, setSubmitting] = useState(false);
  const [searchValue, setSearchValue] = useState("");

   const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'error' | 'success' | 'warning' | null }>({
    text: "",
    type: null
  });

  const [formData, setFormData] = useState({ name: "", minHours: "", maxHours: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadLevels = useCallback(async () => {
    if (!selectedProgramId) return;

    try {
      setLoading(true);
      const response = await levelService.getAllLevels(selectedProgramId, {
        PageNumber: pageNumber,
        PageSize: pageSize,
        SearchValue: searchValue,
      });

      setLevels(response.items || []);
      setTotalPages(response.totalPages || 1);
    } catch (error: any) {
      console.error("Load Error:", error.response?.data);
       const errorMsg = error.response?.data?.errors?.[0] || error.response?.data?.Message || error.response?.data?.message || "Failed to load levels";
      setStatusMessage({ text: errorMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [pageNumber, pageSize, selectedProgramId, searchValue]);

  useEffect(() => {
    if (isAcademicReady && selectedProgramId) {
      loadLevels();
    }
  }, [loadLevels, isAcademicReady, academicVersion, selectedProgramId]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    setPageNumber(1); 
  };

  const filteredLevels = useMemo(() => {
    const term = searchValue.toLowerCase().trim();
    if (!term) return levels;

    return levels.filter((level) =>
      level.name.toLowerCase().includes(term) ||
      String(level.minHours).includes(term) ||
      String(level.maxHours).includes(term)
    );
  }, [levels, searchValue]);

  const handleSubmit = async () => {
    if (!selectedProgramId) {
      setStatusMessage({ text: "Please select a program first", type: 'error' });
      return;
    }
    if (!formData.name || formData.minHours === "" || formData.maxHours === "") {
      setStatusMessage({ text: "All fields are required", type: 'warning' });
      return;
    }

    
    setStatusMessage({ text: "", type: null });

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name,
        minHours: Number(formData.minHours),
        maxHours: Number(formData.maxHours)
      };

      if (editingId) {
        await levelService.updateLevel(selectedProgramId, editingId, payload);
        setStatusMessage({ text: "Level updated successfully", type: 'success' });
        toast.success("Level updated successfully");
      } else {
        await levelService.addLevel(selectedProgramId, payload);
        setStatusMessage({ text: "Level added successfully", type: 'success' });
        toast.success("Level added successfully");
      }
      cancelEdit();
      loadLevels();
    } catch (error: any) {
       const errorMsg = error.response?.data?.errors?.[0] || error.response?.data?.Message || error.response?.data?.message || "Operation failed";
      setStatusMessage({ text: errorMsg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditInit = (level: AcademicLevel) => {
    setEditingId(level.id);
    setFormData({
      name: level.name,
      minHours: String(level.minHours),
      maxHours: String(level.maxHours)
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: "", minHours: "", maxHours: "" });
  };

  const handleDelete = async (id: string, name: string) => {
    if (!selectedProgramId || !confirm(`Delete ${name}?`)) return;
    try {
      await levelService.deleteLevel(selectedProgramId, id);
      toast.success("Deleted successfully");
      loadLevels();
    } catch (error: any) {
      const errorMsg = error.response?.data?.errors?.[0] || error.response?.data?.Message || error.response?.data?.message || "Failed to delete";
      setStatusMessage({ text: errorMsg, type: 'error' });
    }
  };

  
  if (!selectedProgramId) {
    return (
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen space-y-6">
        <CollegeDataTabs />
        <div className="bg-white rounded-[20px] border border-[#eaebf0] p-12 flex flex-col items-center justify-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
            <AlertCircle className="w-7 h-7 text-blue-400" strokeWidth={1.5} />
          </div>
          <p className="text-[15px] font-semibold text-gray-700">No Program Selected</p>
          <p className="text-[13px] text-gray-400">Please select an academic program first to view or manage levels.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen space-y-6">
      <CollegeDataTabs />

      
      {statusMessage.type && (
        <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
          statusMessage.type === 'error' ? 'bg-red-50 border-red-200 text-red-600 font-bold' :
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

       <div className="bg-white rounded-[20px] border border-[#eaebf0] shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#0A0D12]">
            {editingId ? "Update Level" : "Levels"}
          </h2>
          {editingId && (
            <Button variant="ghost" size="sm" onClick={cancelEdit} className="text-red-500 hover:bg-red-50 h-8">
              <X size={14} className="mr-1" /> <span className="text-xs font-bold">Cancel Edit</span>
            </Button>
          )}
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#090909]">Level</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Level One"
                className="h-11 rounded-xl border-slate-200 focus-visible:ring-blue-600 bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#090909]">Minimum Credit Hours</label>
              <Input
                type="number"
                value={formData.minHours}
                onChange={(e) => setFormData({ ...formData, minHours: e.target.value })}
                className="h-11 rounded-xl border-slate-200 focus-visible:ring-blue-600 bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#090909]">Maximum Credit Hours</label>
              <Input
                type="number"
                value={formData.maxHours}
                onChange={(e) => setFormData({ ...formData, maxHours: e.target.value })}
                className="h-11 rounded-xl border-slate-200 focus-visible:ring-blue-600 bg-white"
              />
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className={cn(
              "w-full h-11 cursor-pointer font-bold rounded-xl transition-all text-white",
              editingId ? "bg-purple-600 hover:bg-purple-700" : "bg-[#2463F0] hover:bg-blue-700"
            )}
          >
            {submitting ? <Loader2 className="animate-spin" /> : editingId ? "Save Changes" : "Add Level"}
          </Button>
        </div>
      </div>

       <div className="bg-white p-6 rounded-[20px] border border-[#eaebf0] shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold text-[#0A0D12]">Levels</h2>
            <Badge className="bg-[#EFF8FF] text-[#2463F0] border-[#BEDAFF] px-3 py-1 rounded-full text-xs font-bold">
              {filteredLevels.length} Levels
            </Badge>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search"
                value={searchValue}
                onChange={handleSearchChange}
                className="pl-10 h-10 border-slate-200 rounded-xl focus-visible:ring-slate-300 w-full"
              />
            </div>
          </div>
        </div>

        <div className="hidden md:grid grid-cols-[50px_2fr_1fr_1fr_120px] px-6 py-4 bg-[#FAFAFA] rounded-xl mb-4  font-semibold text-[#181D27] tracking-wider">
          <div className="flex justify-center"></div>
          <div>Level Name</div>
          <div className="text-center">Min</div>
          <div className="text-center">Max</div>
          <div className="text-right px-2">Actions</div>
        </div>

        <div className="space-y-4 md:space-y-2">
          {loading ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-blue-600 h-10 w-10" /></div>
          ) : filteredLevels.length === 0 ? (
            <div className="text-center py-16 text-slate-400 border-2 border-dashed border-slate-50 rounded-2xl">
              No levels found matching your search.
            </div>
          ) : (
            filteredLevels.map((level) => (
              <div
                key={level.id}
                className={cn(
                  "flex flex-col md:grid md:grid-cols-[50px_2fr_1fr_1fr_120px] items-start md:items-center px-4 md:px-6 py-4 border border-slate-100 md:border-transparent md:hover:bg-slate-50 rounded-2xl transition-all gap-3 md:gap-0 bg-white md:bg-transparent shadow-sm md:shadow-none",
                  editingId === level.id && "bg-blue-50/50 md:bg-blue-50/50 border-blue-200"
                )}
              >
                <div className="flex justify-between items-center w-full md:w-auto md:justify-center">
                  <div className="w-4 h-4" /> 
                  <div className="md:hidden flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEditInit(level)} className="h-9 w-9 text-blue-500 bg-blue-50/50">
                      <Edit2 size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(level.id, level.name)} className="h-9 w-9 text-red-500 bg-red-50/50">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col md:block">
                  <span className="text-[10px] uppercase font-bold text-slate-400 md:hidden mb-1">Level Name</span>
                  <div className="font-semibold md:font-medium text-[#181D27] text-base md:text-sm truncate">{level.name}</div>
                </div>

                <div className="flex flex-col md:text-center w-full md:w-auto">
                  <span className="text-[10px] uppercase font-bold text-slate-400 md:hidden mb-1">Min Hours</span>
                  <div className="text-[#181D27]  font-semibold md:font-normal">{level.minHours}</div>
                </div>

                <div className="flex flex-col md:text-center w-full md:w-auto">
                  <span className="text-[10px] uppercase font-bold text-slate-400 md:hidden mb-1">Max Hours</span>
                  <div className="text-[#181D27]  font-semibold md:font-normal">{level.maxHours}</div>
                </div>

                <div className="hidden md:flex justify-end gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEditInit(level)} className="h-8 w-8 cursor-pointer text-blue-500 hover:bg-blue-100 transition-colors">
                    <Edit2 size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(level.id, level.name)} className="h-8 w-8 cursor-pointer text-red-500 hover:bg-red-100 transition-colors">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && !searchValue && (
          <div className="flex justify-center mt-8 pt-4 border-t border-slate-50">
            <Pagination currentPage={pageNumber} totalPages={totalPages} onPageChange={setPageNumber} />
          </div>
        )}
      </div>
    </div>
  );
}