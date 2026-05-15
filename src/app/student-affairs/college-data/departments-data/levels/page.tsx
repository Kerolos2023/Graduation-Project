 











"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Trash2, Edit2, Loader2, X, Search} from "lucide-react";
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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const [formData, setFormData] = useState({ name: "", minHours: "", maxHours: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadLevels = useCallback(async () => {
    if (!selectedProgramId) return;

    try {
      setLoading(true);
      const response = await levelService.getAllLevels(selectedProgramId, {
        PageNumber: pageNumber,
        PageSize: pageSize,
      });

      setLevels(response.items || []);
      setTotalPages(response.totalPages || 1);
    } catch (error: any) {
      console.error("Load Error:", error.response?.data);
      toast.error("Failed to load levels");
    } finally {
      setLoading(false);
    }
  }, [pageNumber, pageSize, selectedProgramId]);

  useEffect(() => {
    if (isAcademicReady) {
      loadLevels();
    }
  }, [loadLevels, isAcademicReady, academicVersion]);

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
      toast.error("Please select a program first");
      return;
    }
    if (!formData.name || formData.minHours === "" || formData.maxHours === "") {
      toast.warning("All fields are required");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name,
        minHours: Number(formData.minHours),
        maxHours: Number(formData.maxHours)
      };

      if (editingId) {
        await levelService.updateLevel(selectedProgramId, editingId, payload);
        toast.success("Level updated successfully");
      } else {
        await levelService.addLevel(selectedProgramId, payload);
        toast.success("Level added successfully");
      }
      cancelEdit();
      loadLevels();
    } catch (error: any) {
      toast.error(error.response?.data?.Message || "Operation failed");
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
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  if (!selectedProgramId && loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-10 bg-[#F5F5F5] min-h-screen font-sans">
      <CollegeDataTabs />

       <div className="bg-[#FFFFFF] p-5 md:p-8 rounded-[20px] md:rounded-[24px] shadow-sm border border-[#E9EAEB]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg md:text-xl font-bold text-[#0A0D12]">
            {editingId ? "Update Level" : "Levels"}
          </h2>
          {editingId && (
            <Button variant="ghost" size="sm" onClick={cancelEdit} className="text-red-500 hover:bg-red-50 h-8">
              <X size={14} className="mr-1" /> <span className="text-xs font-bold">Cancel Edit</span>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
            editingId ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"
          )}
        >
          {submitting ? <Loader2 className="animate-spin" /> : editingId ? "Save Changes" : "Add Level"}
        </Button>
      </div>

       <div className="bg-[#FFFFFF] p-4 md:p-8 rounded-[20px] md:rounded-[24px] shadow-sm border border-[#E9EAEB]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
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
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-10 h-10 border-slate-200 rounded-xl focus-visible:ring-slate-300 w-full"
              />
            </div>
            
          </div>
        </div>

         <div className="hidden md:grid grid-cols-[50px_2fr_1fr_1fr_120px] px-6 py-4 bg-[#FAFAFA] rounded-xl mb-4 text-[11px] font-bold text-[#181D27]  tracking-wider">
          <div className="flex justify-center"></div>
          <div>Level Name</div>
          <div className="text-center">Min Hours</div>
          <div className="text-center">Max Hours</div>
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
                  <div className="font-bold md:font-medium text-[#181D27] text-base md:text-sm truncate">{level.name}</div>
                </div>

                <div className="flex flex-col md:text-center w-full md:w-auto">
                  <span className="text-[10px] uppercase font-bold text-slate-400 md:hidden mb-1">Min Hours</span>
                  <div className="text-[#181D27] text-sm font-semibold md:font-normal">{level.minHours}</div>
                </div>

                <div className="flex flex-col md:text-center w-full md:w-auto">
                  <span className="text-[10px] uppercase font-bold text-slate-400 md:hidden mb-1">Max Hours</span>
                  <div className="text-[#181D27] text-sm font-semibold md:font-normal">{level.maxHours}</div>
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




 


 