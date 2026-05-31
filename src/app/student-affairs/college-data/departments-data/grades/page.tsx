"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { gradeService, GradeRequest } from '@/services/gradeServices';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Pencil, Trash2, Loader2, X, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import CollegeDataTabs from "@/components/departmentsTabs";
import { Badge } from "@/components/ui/badge";
import { useAcademicContext } from "@/hooks/useAcademicContext";
import { toast } from "sonner";

export default function GradesPage() {
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const { selectedProgramId, isAcademicReady, academicVersion } = useAcademicContext();
  const formRef = useRef<HTMLDivElement>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'error' | 'success' | 'warning' | null }>({
    text: "",
    type: null
  });
  const { register, handleSubmit, reset, setValue } = useForm<GradeRequest>();

  const fetchGrades = useCallback(async () => {
    if (!selectedProgramId) return;
    try {
      setLoading(true);
      const data = await gradeService.getAllGrades(selectedProgramId);
      setGrades(data.items || []);
    } catch (error: any) {
      console.error(error);
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
  }, [selectedProgramId]);

  useEffect(() => {
    if (isAcademicReady && selectedProgramId) {
      fetchGrades();
    }
  }, [fetchGrades, isAcademicReady, academicVersion, selectedProgramId]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredGrades = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return grades;

    return grades.filter(g =>
      (g.name && g.name.toLowerCase().includes(term)) ||
      (g.code && g.code.toLowerCase().includes(term))
    );
  }, [grades, searchTerm]);

  const onSubmit = async (data: GradeRequest) => {
    const payload = {
      name: data.name,
      code: data.code,
      minScore: Number(data.minScore),
      maxScore: Number(data.maxScore),
      minGradePoint: Number(data.minGradePoint),
      maxGradePoint: Number(data.maxGradePoint),
    };

    setStatusMessage({ text: "", type: null });

    try {
      if (editingId) {
        await gradeService.updateGrade(selectedProgramId!, editingId, payload);
        setStatusMessage({ text: "Grade updated successfully!", type: 'success' });
        toast.success("Grade updated successfully!");
      } else {
        await gradeService.createGrade(selectedProgramId!, payload);
        setStatusMessage({ text: "Grade added successfully!", type: 'success' });
        toast.success("Grade added successfully!");
      }
      cancelEdit();
      await fetchGrades();
    } catch (error: any) {
      const errorMsg =
        typeof error.response?.data === "string" ? error.response.data :
          error.response?.data?.errors?.[0] ||
          (error.response?.data?.errors ? Object.values(error.response.data.errors).flat().join(" - ") : null) ||
          error.response?.data?.Message ||
          error.response?.data?.message ||
          error.message;

      setStatusMessage({ text: errorMsg, type: 'error' });
    }
  };

  const handleEditClick = (grade: any) => {
    setEditingId(grade.id);
    setValue("name", grade.name);
    setValue("code", grade.code);
    setValue("minScore", grade.minScore);
    setValue("maxScore", grade.maxScore);
    setValue("minGradePoint", grade.minGradePoint);
    setValue("maxGradePoint", grade.maxGradePoint);

    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    reset();
  };

  const onDelete = async (gradeId: string) => {
    if (!selectedProgramId || !confirm("Are you sure?")) return;

    setStatusMessage({ text: "", type: null });

    try {
      await gradeService.deleteGrade(selectedProgramId, gradeId);
      toast.success("Deleted successfully");
      setGrades(prev => prev.filter(g => g.id !== gradeId));
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
          <p className="text-[13px] text-gray-400">Please select an academic program first to view or manage grades.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-6 font-inter pb-8 print:p-0 print:bg-white">
      <div className="print:hidden">
        <CollegeDataTabs />
      </div>

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
      <div ref={formRef} className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0] shrink-0 print:hidden scroll-mt-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-gray-900">
            {editingId ? "Update Grade" : "Adding Grades"}
          </h1>
          {editingId && (
            <Button variant="ghost" size="sm" onClick={cancelEdit} className="text-red-500 hover:bg-red-50 h-8 cursor-pointer">
              <X size={14} className="mr-1" /> <span className="text-xs font-bold">Cancel Edit</span>
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[13px] font-bold text-gray-900 ml-1">Grade Name</label>
              <Input
                {...register("name")}
                placeholder="e.g. Excellent"
                required
                className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm font-medium h-auto"
              />
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[13px] font-bold text-gray-900 ml-1">Equivalent Grade (Code)</label>
              <Input
                {...register("code")}
                placeholder="e.g. A+"
                required
                className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm font-medium h-auto"
              />
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[13px] font-bold text-gray-900 ml-1">Percentage From</label>
              <Input
                type="number"
                {...register("minScore")}
                placeholder="0"
                className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm font-medium h-auto"
              />
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[13px] font-bold text-gray-900 ml-1">To</label>
              <Input
                type="number"
                {...register("maxScore")}
                placeholder="100"
                className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm font-medium h-auto"
              />
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[13px] font-bold text-gray-900 ml-1">Points From</label>
              <Input
                type="number"
                step="0.01"
                {...register("minGradePoint")}
                placeholder="0.00"
                className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm font-medium h-auto"
              />
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[13px] font-bold text-gray-900 ml-1">To</label>
              <Input
                type="number"
                step="0.01"
                {...register("maxGradePoint")}
                placeholder="4.00"
                className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm font-medium h-auto"
              />
            </div>
          </div>

          <button
            type="submit"
            className={cn(
              "w-full text-white font-semibold py-3.5 rounded-[12px] transition-all shadow-sm cursor-pointer flex items-center justify-center text-sm active:scale-[0.99]",
              editingId ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"
            )}
          >
            {editingId ? "Save Changes" : "Add"}
          </button>
        </form>
      </div>

      {/* List Card */}
      <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0] print:border-none print:shadow-none print:p-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 print:mb-8">
          <div className="flex items-center gap-3">
            <h2 className="text-[22px] font-bold text-gray-900 leading-none">Grades</h2>
            <Badge className="bg-[#eff4ff] text-blue-600 text-[11px] font-bold px-3 py-1.5 rounded-full border border-blue-100 hover:bg-[#eff4ff] shadow-none print:hidden">
              {filteredGrades.length} Grades
            </Badge>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto print:hidden">
            <div className="relative w-full md:w-[280px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-[12px] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm font-medium h-auto bg-white placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Table Header */}
        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_100px] px-5 py-4 mb-3 border border-gray-100 bg-[#fafafa] rounded-xl font-bold text-gray-800 print:grid print:bg-slate-100 print:grid-cols-[2fr_1fr_1fr_1fr]">
          <div className="text-[13px]">Name</div>
          <div className="text-[13px] text-center">Code</div>
          <div className="text-[13px] text-center">Min</div>
          <div className="text-[13px] text-center">Max</div>
          <div className="text-right px-2 print:hidden text-[13px]">Actions</div>
        </div>

        {/* Table Body */}
        <div className="flex flex-col gap-3 mb-8">
          {loading ? (
            <div className="text-center p-4 text-gray-500 text-sm print:hidden">
              <Loader2 className="animate-spin inline mr-2 text-blue-600" /> Loading...
            </div>
          ) : filteredGrades.length === 0 ? (
            <div className="text-center p-8 text-gray-400 border border-gray-100 rounded-xl border-dashed">
              No grades found.
            </div>
          ) : (
            filteredGrades.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "flex flex-col md:grid md:grid-cols-[2fr_1fr_1fr_1fr_100px] items-start md:items-center px-5 py-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-white group gap-3 md:gap-0 relative print:grid print:grid-cols-[2fr_1fr_1fr_1fr] print:border-b print:border-slate-100 print:rounded-none print:px-2 print:py-3 print:shadow-none",
                  editingId === item.id && "bg-blue-50/50 border-blue-200 print:bg-transparent"
                )}
              >
                
                <div className="flex flex-col md:contents gap-1 w-full">
                  <div className="flex flex-col md:block">
                    <span className="text-[10px] uppercase font-bold text-gray-400 md:hidden print:hidden mb-1">Grade Name</span>
                    <div className="text-[14px] font-bold text-gray-900 truncate">{item.name}</div>
                  </div>

                  <div className="flex flex-col md:text-center w-full md:w-auto">
                    <span className="text-[10px] uppercase font-bold text-gray-400 md:hidden print:hidden mb-1">Code</span>
                    <div className="text-[14px] font-bold text-gray-500 md:text-gray-900">{item.code}</div>
                  </div>

                  <div className="flex flex-col md:text-center w-full md:w-auto">
                    <span className="text-[10px] uppercase font-bold text-gray-400 md:hidden print:hidden mb-1">Min Score</span>
                    <div className="text-[14px] font-bold text-gray-500 md:text-gray-900">{item.minScore}</div>
                  </div>

                  <div className="flex flex-col md:text-center w-full md:w-auto">
                    <span className="text-[10px] uppercase font-bold text-gray-400 md:hidden print:hidden mb-1">Max Score</span>
                    <div className="text-[14px] font-bold text-gray-500 md:text-gray-900">{item.maxScore}</div>
                  </div>
                </div>

                 <div className="flex items-center justify-end gap-2 absolute right-4 top-4 md:relative md:right-auto md:top-auto print:hidden">
                  <button
                    type="button"
                    onClick={() => handleEditClick(item)}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors bg-white cursor-pointer"
                  >
                    <Pencil className="w-[18px] h-[18px]" strokeWidth={2.5} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors bg-white cursor-pointer"
                  >
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