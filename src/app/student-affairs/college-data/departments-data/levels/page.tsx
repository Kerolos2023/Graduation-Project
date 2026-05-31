"use client";

import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Trash2, Pencil, Loader2, X, Search, AlertCircle } from "lucide-react";
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
  const formRef = useRef<HTMLDivElement>(null);
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
      });

      setLevels(response.items || []);
      setTotalPages(response.totalPages || 1);
    } catch (error: any) {
      console.error("Load Error:", error.response?.data);
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
  }, [pageNumber, pageSize, selectedProgramId]);

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
      const errorMsg =
        typeof error.response?.data === "string" ? error.response.data :
          error.response?.data?.errors?.[0] ||
          (error.response?.data?.errors ? Object.values(error.response.data.errors).flat().join(" - ") : null) ||
          error.response?.data?.Message ||
          error.response?.data?.message ||
          error.message;

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

    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: "", minHours: "", maxHours: "" });
  };

  const handleDelete = async (id: string, name: string) => {
    if (!selectedProgramId || !confirm(`Delete ${name}?`)) return;

    setStatusMessage({ text: "", type: null });

    try {
      await levelService.deleteLevel(selectedProgramId, id);
      toast.success("Deleted successfully");
      loadLevels();
    } catch (error: any) {
      const errorMsg =
        typeof error.response?.data === "string" ? error.response.data :
          error.response?.data?.errors?.[0] ||
          error.response?.data?.Message ||
          error.response?.data?.message ||
          error.message;

      setStatusMessage({ text: errorMsg, type: 'error' });
    }
  };

  if (!selectedProgramId) {
    return (
      <div className="w-full h-full flex flex-col gap-6 font-inter pb-8">
        <CollegeDataTabs />
        <div className="bg-white rounded-[24px] border border-[#eaebf0] p-12 flex flex-col items-center justify-center gap-3 text-center shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
            <AlertCircle className="w-7 h-7 text-blue-400" strokeWidth={1.5} />
          </div>
          <p className="text-[15px] font-bold text-gray-900">No Program Selected</p>
          <p className="text-[13px] text-gray-400">Please select an academic program first to view or manage levels.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-6 font-inter pb-8">
      <CollegeDataTabs />

      {statusMessage.type && (
        <div className={cn(
          "border px-4 py-3 rounded-xl text-sm",
          statusMessage.type === 'error' && 'bg-red-50 border-red-200 text-red-700',
          statusMessage.type === 'warning' && 'bg-amber-50 border-amber-200 text-amber-800',
          statusMessage.type === 'success' && 'bg-emerald-50 border-emerald-200 text-emerald-800'
        )}>
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

      <div ref={formRef} className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0] shrink-0 scroll-mt-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-gray-900">
            {editingId ? "Update Level" : "Adding Levels"}
          </h1>
          {editingId && (
            <Button variant="ghost" size="sm" onClick={cancelEdit} className="text-red-500 hover:bg-red-50 h-8 cursor-pointer">
              <X size={14} className="mr-1" /> <span className="text-xs font-bold">Cancel Edit</span>
            </Button>
          )}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[13px] font-bold text-gray-900 ml-1">Level</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Level One"
                className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm font-medium h-auto"
              />
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[13px] font-bold text-gray-900 ml-1">Minimum Credit Hours</label>
              <Input
                type="number"
                value={formData.minHours}
                onChange={(e) => setFormData({ ...formData, minHours: e.target.value })}
                placeholder="Ex: 0"
                className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm font-medium h-auto"
              />
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[13px] font-bold text-gray-900 ml-1">Maximum Credit Hours</label>
              <Input
                type="number"
                value={formData.maxHours}
                onChange={(e) => setFormData({ ...formData, maxHours: e.target.value })}
                placeholder="Ex: 180"
                className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm font-medium h-auto"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={cn(
              "w-full text-white font-semibold py-3.5 rounded-[12px] transition-all shadow-sm cursor-pointer flex items-center justify-center text-sm active:scale-[0.99]",
              editingId ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"
            )}
          >
            {submitting ? <Loader2 className="animate-spin" /> : editingId ? "Save Changes" : "Add"}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-[22px] font-bold text-gray-900 leading-none">Levels</h2>
            <Badge className="bg-[#eff4ff] text-blue-600 text-[11px] font-bold px-3 py-1.5 rounded-full border border-blue-100 hover:bg-[#eff4ff] shadow-none">
              {filteredLevels.length} Levels
            </Badge>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-[280px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search"
                value={searchValue}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-[12px] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm font-medium h-auto"
              />
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center w-full px-5 py-4 mb-3 border border-gray-100 bg-[#fafafa] rounded-xl">
          <div className="flex items-center w-full flex-1">
            <span className="text-[13px] font-bold text-gray-800 w-2/4">Level Name</span>
            <span className="text-[13px] font-bold text-gray-800 w-1/4 text-center">Min</span>
            <span className="text-[13px] font-bold text-gray-800 w-1/4 text-center">Max</span>
          </div>
          <div className="w-[80px]"></div>
        </div>

        <div className="flex flex-col gap-3 mb-8">
          {loading ? (
            <div className="text-center p-4 text-gray-500 text-sm">
              <Loader2 className="animate-spin inline mr-2 text-blue-600" /> Loading...
            </div>
          ) : filteredLevels.length === 0 ? (
            <div className="text-center p-8 text-gray-400 border border-gray-100 rounded-xl border-dashed">
              No levels found.
            </div>
          ) : (
            filteredLevels.map((level) => (
              <div
                key={level.id}
                className={cn(
                  "flex flex-col sm:flex-row sm:items-center w-full px-5 py-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-white group gap-3 sm:gap-4 relative",
                  editingId === level.id && "bg-blue-50/50 border-blue-200"
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-center w-full flex-1 gap-1 sm:gap-0">
                  <div className="w-full sm:w-2/4 truncate">
                    <span className="text-[10px] uppercase font-bold text-gray-400 sm:hidden block mb-1">Level Name</span>
                    <span className="text-[14px] font-bold text-gray-900 truncate">{level.name}</span>
                  </div>

                  <div className="w-full sm:w-1/4 sm:text-center truncate">
                    <span className="text-[10px] uppercase font-bold text-gray-400 sm:hidden block mb-1">Min Hours</span>
                    <span className="text-[14px] font-bold text-gray-500 sm:text-gray-900">{level.minHours}</span>
                  </div>

                  <div className="w-full sm:w-1/4 sm:text-center truncate">
                    <span className="text-[10px] uppercase font-bold text-gray-400 sm:hidden block mb-1">Max Hours</span>
                    <span className="text-[14px] font-bold text-gray-500 sm:text-gray-900">{level.maxHours}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 absolute right-4 top-4 sm:relative sm:right-auto sm:top-auto">
                  <button
                    onClick={() => handleEditInit(level)}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors bg-white cursor-pointer"
                  >
                    <Pencil className="w-[18px] h-[18px]" strokeWidth={2.5} />
                  </button>

                  <button
                    onClick={() => handleDelete(level.id, level.name)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors bg-white cursor-pointer"
                  >
                    <Trash2 className="w-[18px] h-[18px]" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && !searchValue && (
          <div className="flex justify-center mt-2">
            <Pagination currentPage={pageNumber} totalPages={totalPages} onPageChange={setPageNumber} />
          </div>
        )}
      </div>
    </div>
  );
}
