


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

  const filteredGrades = useMemo(() => {
    return grades.filter(g =>
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.code.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handlePrint = () => {
    window.print();
  };

  const inputClass = "h-11 rounded-xl border-slate-200 focus-visible:ring-blue-600 bg-white";

  if (!selectedProgramId) {
    return (
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen space-y-6">
        <CollegeDataTabs />
        <div className="bg-white rounded-[20px] border border-[#eaebf0] p-12 flex flex-col items-center justify-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
            <AlertCircle className="w-7 h-7 text-blue-400" strokeWidth={1.5} />
          </div>
          <p className="text-[15px] font-semibold text-gray-700">No Program Selected</p>
          <p className="text-[13px] text-gray-400">Please select an academic program first to view or manage grades.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen space-y-6 print:p-0 print:bg-white">
      <div className="print:hidden">
        <CollegeDataTabs />
      </div>

      {statusMessage.type && (
        <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${statusMessage.type === 'error' ? 'bg-red-50 border-red-200 text-red-600 font-bold' :
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

      <div ref={formRef} className="bg-white rounded-[20px] border border-[#eaebf0] shadow-sm overflow-hidden print:hidden scroll-mt-6">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#0A0D12]">
            {editingId ? "Update Grade" : "Grade"}
          </h2>
          {editingId && (
            <Button variant="ghost" size="sm" onClick={cancelEdit} className="text-red-500 hover:bg-red-50 h-8">
              <X size={14} className="mr-1" /> <span className="text-xs font-bold">Cancel Edit</span>
            </Button>
          )}
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-[#090909]">Grade Name</label>
              <Input {...register("name")} placeholder="e.g. Excellent" required className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-[#090909]">Equivalent Grade (Code)</label>
              <Input {...register("code")} placeholder="e.g. A+" required className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-[#090909]">Percentage From</label>
              <Input type="number" {...register("minScore")} placeholder="0" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-[#090909]">To</label>
              <Input type="number" {...register("maxScore")} placeholder="100" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-[#090909]">Points From</label>
              <Input type="number" step="0.01" {...register("minGradePoint")} placeholder="0.00" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-[#090909]">To</label>
              <Input type="number" step="0.01" {...register("maxGradePoint")} placeholder="4.00" className={inputClass} />
            </div>

            <Button type="submit" className={cn(
              "col-span-full h-11 cursor-pointer font-bold rounded-xl transition-all text-white",
              editingId ? "bg-purple-600 hover:bg-purple-700" : "bg-[#2463F0] hover:bg-blue-700"
            )}>
              {editingId ? "Save Changes" : "Add Grade"}
            </Button>
          </form>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[20px] border border-[#eaebf0] shadow-sm overflow-hidden print:border-none print:shadow-none print:p-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4 print:mb-8">
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold text-[#0A0D12]">Grades</h2>
            <Badge className="bg-blue-50 text-blue-600 border-none px-3 py-1 rounded-full text-xs font-bold print:hidden">
              {filteredGrades.length} Grades
            </Badge>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto print:hidden">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search"
                className="pl-10 h-10 border-slate-200 rounded-xl focus-visible:ring-slate-300 w-full"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>


          </div>
        </div>

        <div className="hidden md:grid grid-cols-[50px_1.5fr_1fr_1fr_1fr_100px] px-6 py-4 bg-[#FAFAFA] rounded-xl mb-4 font-semibold text-[#181D27] tracking-wider print:grid print:bg-slate-100 print:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="flex justify-center print:hidden"></div>
          <div>Name</div>
          <div className="text-center">Code</div>
          <div className="text-center">Min</div>
          <div className="text-center">Max</div>
          <div className="text-right px-2 print:hidden">Actions</div>
        </div>

        <div className="space-y-4 md:space-y-2">
          {loading ? (
            <div className="py-20 flex justify-center print:hidden"><Loader2 className="animate-spin text-blue-600 h-10 w-10" /></div>
          ) : filteredGrades.length === 0 ? (
            <div className="text-center py-16 text-slate-400 border-2 border-dashed border-slate-50 rounded-2xl">
              No grades found.
            </div>
          ) : (
            filteredGrades.map((item) => (
              <div key={item.id} className={cn(
                "flex flex-col md:grid md:grid-cols-[50px_1.5fr_1fr_1fr_1fr_100px] items-start md:items-center px-4 md:px-6 py-4 border border-slate-100 md:border-transparent md:hover:bg-slate-50 rounded-2xl transition-all gap-3 md:gap-0 bg-white md:bg-transparent shadow-sm md:shadow-none print:grid print:grid-cols-[1.5fr_1fr_1fr_1fr] print:border-b print:border-slate-100 print:rounded-none print:px-2 print:py-3 print:shadow-none",
                editingId === item.id && "bg-blue-50/50 md:bg-blue-50/50 border-blue-200 print:bg-transparent"
              )}>
                <div className="flex justify-between items-center w-full md:w-auto md:justify-center print:hidden">
                  <div className="w-4 h-4" />
                  <div className="md:hidden flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(item)} className="h-9 w-9 text-blue-500 bg-blue-50/50">
                      <Pencil size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)} className="h-9 w-9 text-red-500 bg-red-50/50">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col md:block">
                  <span className="text-[10px] uppercase font-bold text-slate-400 md:hidden print:hidden mb-1">Grade Name</span>
                  <div className="font-bold md:font-semibold text-[#181D27] text-base md:text-sm truncate">{item.name}</div>
                </div>

                <div className="flex flex-col md:text-center w-full md:w-auto">
                  <span className="text-[10px] uppercase font-bold text-slate-400 md:hidden print:hidden mb-1">Code</span>
                  <div className="text-[#181D27] font-semibold ">{item.code}</div>
                </div>

                <div className="flex flex-col md:text-center w-full md:w-auto">
                  <span className="text-[10px] uppercase font-bold text-slate-400 md:hidden print:hidden mb-1">Min Score</span>
                  <div className="text-[#181D27] font-semibold">{item.minScore}</div>
                </div>

                <div className="flex flex-col md:text-center w-full md:w-auto">
                  <span className="text-[10px] uppercase font-bold text-slate-400 md:hidden print:hidden mb-1">Max Score</span>
                  <div className="text-[#181D27] font-semibold">{item.maxScore}</div>
                </div>

                <div className="hidden md:flex justify-end gap-1 print:hidden">
                  <Button variant="ghost" size="icon" onClick={() => handleEditClick(item)} className="h-8 w-8 cursor-pointer text-blue-500 hover:bg-blue-100 transition-colors">
                    <Pencil size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)} className="h-8 w-8 cursor-pointer text-red-500 hover:bg-red-100 transition-colors">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}