"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Search, Pencil, Trash2, Loader2, X, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
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

  const formRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<StudyLoadResponse[]>([]);
  const [availableLevels, setAvailableLevels] = useState<AcademicLevel[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'error' | 'success' | 'warning' | null }>({
    text: "",
    type: null
  });

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
    } catch (error: any) {
      console.error(error);
      const errorMsg =
        typeof error.response?.data === "string" ? error.response.data :
          error.response?.data?.errors?.[0] ||
          error.response?.data?.Message ||
          error.response?.data?.message ||
          error.message;
      setStatusMessage({ text: errorMsg, type: 'error' });
    }
  }, [selectedProgramId]);

  const fetchData = useCallback(async () => {
    if (!selectedProgramId) return;
    setFetching(true);
    try {
      const result = await StudyLoadService.getAll(selectedProgramId);
      setData(result || []);
    } catch (error: any) {
      const errorMsg =
        typeof error.response?.data === "string" ? error.response.data :
          error.response?.data?.errors?.[0] ||
          error.response?.data?.Message ||
          error.response?.data?.message ||
          error.message;
      setStatusMessage({ text: errorMsg, type: 'error' });
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
    if (!selectedProgramId || !selectedYearId) {
      setStatusMessage({ text: "Context missing: Please check program and year selection", type: 'error' });
      return;
    }
    if (!formData.levelId || !formData.semesterType || !formData.minHours || !formData.maxHours) {
      setStatusMessage({ text: "Fill all fields", type: 'warning' });
      return;
    }

    setStatusMessage({ text: "", type: null });
    loading && setLoading(true);
    try {
      const payload = {
        academicYearId: selectedYearId,
        semesterType: formData.semesterType,
        minHours: Number(formData.minHours),
        maxHours: Number(formData.maxHours),
      };

      if (editingId) {
        await StudyLoadService.update(selectedProgramId, editingId, payload);
        setStatusMessage({ text: "Updated Successfully", type: 'success' });
        toast.success("Updated Successfully");
      } else {
        await StudyLoadService.add(selectedProgramId, formData.levelId, payload);
        setStatusMessage({ text: "Added Successfully", type: 'success' });
        toast.success("Added Successfully");
      }

      cancelEdit();
      fetchData();
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

    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ levelId: "", semesterType: "", minHours: "", maxHours: "" });
  };

  const handleDelete = async (id: string) => {
    if (!selectedProgramId || !confirm("Are you sure you want to delete this credit load?")) return;

    setStatusMessage({ text: "", type: null });
    try {
      await StudyLoadService.remove(selectedProgramId, id);
      toast.success("Deleted successfully");
      fetchData();
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

  if (!selectedProgramId || !selectedYearId) {
    return (
      <div className="w-full h-full flex flex-col gap-6 font-inter pb-8">
        <CollegeDataTabs />
        <div className="bg-white rounded-[24px] border border-[#eaebf0] p-12 flex flex-col items-center justify-center gap-3 text-center shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
            <AlertCircle className="w-7 h-7 text-blue-400" strokeWidth={1.5} />
          </div>
          <p className="text-[15px] font-bold text-gray-900">Context missing</p>
          <p className="text-[13px] text-gray-400">Please select an Academic Program and Year to manage credit loads.</p>
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
          statusMessage.type === 'error' && 'bg-red-50 border-red-200 text-red-700 font-bold',
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

      {/* Form Card */}
      <div ref={formRef} className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0] shrink-0 scroll-mt-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-gray-900">
            {editingId ? "Update Credit Load" : "Credit Load by Level"}
          </h1>
          {editingId && (
            <button onClick={cancelEdit} className="flex items-center gap-1 text-red-500 hover:text-red-600 text-sm font-bold cursor-pointer">
              <X size={14} /> <span>Cancel Edit</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[13px] font-bold text-gray-900 ml-1">Semester</label>
            <Select value={formData.semesterType} onValueChange={v => setFormData({ ...formData, semesterType: v })}>
              <SelectTrigger className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm font-medium h-auto">
                <SelectValue placeholder="Select Semester" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="Fall">Fall</SelectItem>
                <SelectItem value="Spring">Spring</SelectItem>
                <SelectItem value="Summer">Summer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[13px] font-bold text-gray-900 ml-1">Level</label>
            <Select value={formData.levelId} onValueChange={v => setFormData({ ...formData, levelId: v })} disabled={!!editingId}>
              <SelectTrigger className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm font-medium h-auto">
                <SelectValue placeholder="Select Level" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {availableLevels.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[13px] font-bold text-gray-900 ml-1">Minimum Credit Hours</label>
            <Input type="number" value={formData.minHours} onChange={e => setFormData({ ...formData, minHours: e.target.value })} className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm font-medium h-auto" placeholder="e.g. 12" />
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[13px] font-bold text-gray-900 ml-1">Maximum Credit Hours</label>
            <Input type="number" value={formData.maxHours} onChange={e => setFormData({ ...formData, maxHours: e.target.value })} className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm font-medium h-auto" placeholder="e.g. 18" />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className={cn(
            "w-full text-white font-semibold py-3.5 rounded-[12px] transition-all shadow-sm cursor-pointer text-sm flex items-center justify-center active:scale-[0.99]",
            editingId
              ? "bg-purple-600 hover:bg-purple-700"
              : "bg-blue-600 hover:bg-blue-700"
          )}
        >
          {loading ? <Loader2 className="animate-spin" /> : editingId ? "Save Changes" : "Add"}
        </button>
      </div>

      {/* List Card */}
      <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-[22px] font-bold text-gray-900 leading-none">Credit Loads</h2>
            <Badge className="bg-[#eff4ff] text-blue-600 text-[11px] font-bold px-3 py-1.5 rounded-full border border-blue-100 hover:bg-[#eff4ff] shadow-none">
              {filteredData.length} Levels
            </Badge>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-[280px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search" value={search} onChange={handleSearchChange} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-[12px] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm font-medium h-auto" />
            </div>
          </div>
        </div>

        {/* Table Header */}
        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_100px] px-5 py-4 mb-3 border border-gray-100 bg-[#fafafa] rounded-xl font-bold text-gray-800">
          <div className="text-[13px]">Name</div>
          <div className="text-[13px] text-center">Min</div>
          <div className="text-[13px] text-center">Max</div>
          <div className="text-right px-2 text-[13px]">Actions</div>
        </div>

        {/* Table Body */}
        <div className="flex flex-col gap-3 mb-6">
          {fetching ? (
            <div className="text-center p-4 text-gray-500 text-sm">
              <Loader2 className="animate-spin inline mr-2 text-blue-600" /> Loading...
            </div>
          ) : paginatedData.length === 0 ? (
            <div className="text-center p-8 text-gray-400 border border-gray-100 rounded-xl border-dashed">
              No credit loads found.
            </div>
          ) : (
            paginatedData.map((row) => (
              <div
                key={row.id}
                className={cn(
                  "flex flex-col md:grid md:grid-cols-[2fr_1fr_1fr_100px] items-start md:items-center px-5 py-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-white group gap-3 md:gap-0 relative",
                  editingId === row.id && "bg-blue-50/50 border-blue-200"
                )}
              >
                <div className="md:hidden flex justify-end w-full mb-2">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(row)} className="h-9 w-9 text-blue-500 bg-blue-50/50 cursor-pointer">
                      <Pencil size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(row.id)} className="h-9 w-9 text-red-500 bg-red-50/50 cursor-pointer">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col md:block">
                  <span className="text-[10px] uppercase font-bold text-gray-400 md:hidden mb-1">Level / Semester</span>
                  <div className="text-[14px] font-bold text-gray-900 truncate">{row.levelName}</div>
                  <div className="text-[11px] text-blue-600 font-bold mt-0.5">{row.semesterName} Semester</div>
                </div>

                <div className="flex flex-col md:text-center w-full md:w-auto">
                  <span className="text-[10px] uppercase font-bold text-gray-400 md:hidden mb-1">Min Hours</span>
                  <div className="text-[14px] font-bold text-gray-500 md:text-gray-900">{row.minHours}</div>
                </div>

                <div className="flex flex-col md:text-center w-full md:w-auto">
                  <span className="text-[10px] uppercase font-bold text-gray-400 md:hidden mb-1">Max Hours</span>
                  <div className="text-[14px] font-bold text-gray-500 md:text-gray-900">{row.maxHours}</div>
                </div>

                <div className="hidden md:flex justify-end gap-2">
                  <button
                    onClick={() => handleEdit(row)}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors bg-white cursor-pointer"
                  >
                    <Pencil className="w-[18px] h-[18px]" strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={() => handleDelete(row.id)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors bg-white cursor-pointer"
                  >
                    <Trash2 className="w-[18px] h-[18px]" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500 font-medium">
              Showing Page <strong className="text-gray-900">{currentPage}</strong> of <strong className="text-gray-900">{totalPages}</strong>
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="rounded-[12px] border-gray-200 cursor-pointer font-semibold text-sm px-3 py-2"
              >
                <ChevronLeft size={16} className="mr-1" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="rounded-[12px] border-gray-200 cursor-pointer font-semibold text-sm px-3 py-2"
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