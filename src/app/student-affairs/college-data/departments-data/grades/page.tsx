"use client"
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { gradeService, GradeRequest } from '@/services/gradeServices';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Pencil, Trash2, MoreHorizontal, Loader2, X, Printer } from "lucide-react";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import CollegeDataTabs from "@/components/departmentsTabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useAcademicContext } from "@/hooks/useAcademicContext";

export default function GradesPage() {
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const { selectedProgramId, isAcademicReady, academicVersion } = useAcademicContext();

  const { register, handleSubmit, reset, setValue } = useForm<GradeRequest>();

  const fetchGrades = useCallback(async () => {
    if (!selectedProgramId) return;
    try {
      setLoading(true);
      const data = await gradeService.getAllGrades(selectedProgramId);
      setGrades(data.items || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [selectedProgramId]);

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades, academicVersion]);

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

    try {
      if (editingId) {
        await gradeService.updateGrade(selectedProgramId!, editingId, payload);
        alert("Grade updated successfully!");
      } else {
        await gradeService.createGrade(selectedProgramId!, payload);
        alert("Grade added successfully!");
      }
      cancelEdit();
      await fetchGrades();
    } catch (error: any) {
      const errorData = error.response?.data;
      const msg = errorData?.errors?.[0] || errorData?.title || "Something went wrong. Please check your data.";
      alert(`Error: ${msg}`);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    reset();
  };

  const onDelete = async (gradeId: string) => {
    if (!selectedProgramId || !confirm("Are you sure?")) return;
    try {
      await gradeService.deleteGrade(selectedProgramId, gradeId);
      setGrades(prev => prev.filter(g => g.id !== gradeId));
    } catch (error) {
      alert("Failed to delete grade");
    }
  };

  const inputClass = "h-14 border-slate-200 rounded-2xl px-5 focus-visible:ring-blue-400";

  return (
    <div className="p-4 md:p-10 bg-[#F9FAFB] min-h-screen font-sans">
      <CollegeDataTabs />

      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm mb-10 transition-all">
        <div className="flex justify-between items-center mb-8 md:mb-10">
          <h1 className="text-xl md:text-2xl font-bold text-[#0A0D12]">
            {editingId ? "Update Grade" : "Adding Grade"}
          </h1>

          {editingId && (
            <button onClick={cancelEdit} className="flex items-center gap-1 text-red-500 hover:text-red-600 text-xs md:text-sm font-bold transition-colors">
              <X className="h-4 w-4" />
              <span>Cancel Edit</span>
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#090909]">Grade Name</label>
            <Input {...register("name")} placeholder="Name" required className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#090909]">Equivalent Grade (Code)</label>
            <Input {...register("code")} placeholder="Code" required className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#090909]">Percentage From</label>
            <Input type="number" {...register("minScore")} placeholder="0" className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#090909]">Percentage To</label>
            <Input type="number" {...register("maxScore")} placeholder="100" className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#090909]">Points From</label>
            <Input type="number" step="0.01" {...register("minGradePoint")} placeholder="0.00" className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#090909]">Points To</label>
            <Input type="number" step="0.01" {...register("maxGradePoint")} placeholder="4.00" className={inputClass} />
          </div>

          <Button type="submit" className={cn(
            "col-span-full h-14 rounded-2xl font-bold shadow-lg transition-all",
            editingId ? "bg-red-600 hover:bg-red-700" : "bg-[#2463F0] hover:bg-[#1D4ED8]"
          )}>
            {editingId ? "Save Changes" : "Add Grade"}
          </Button>
        </form>
      </div>

      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-[#E9EAEB] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-[#0A0D12]">Grades List</h2>
            <Badge className="bg-[#EFF8FF] text-[#2463F0] border border-[#BEDAFF] rounded-full px-4 py-0.5 text-xs font-semibold">
              {filteredGrades.length} Items
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search" className="pl-12 h-12 w-full md:w-[300px] bg-[#F9FAFB] border-slate-200 rounded-xl" onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-blue-100"><Printer className="h-5 w-5 text-blue-600" /></Button>
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-slate-200"><MoreHorizontal className="h-5 w-5 text-slate-400" /></Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="hidden md:grid grid-cols-[60px_1.5fr_1.5fr_1fr_1fr_100px] items-center gap-4 px-10 py-5 bg-[#F8FAFC] rounded-2xl text-[11px] font-black text-[#181D27] uppercase tracking-widest">
            <div className="flex justify-start"><Checkbox className="h-5 w-5 border-slate-300 rounded-lg" /></div>
            <div>Name</div>
            <div>Code</div>
            <div>Min</div>
            <div>Max</div>
            <div className="text-right">Actions</div>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-blue-600 h-10 w-10" /></div>
          ) : (
            filteredGrades.map((item) => (
              <div key={item.id} className={cn(
                "grid grid-cols-1 md:grid-cols-[60px_1.5fr_1.5fr_1fr_1fr_100px] items-center gap-4 px-6 md:px-10 py-6 bg-white rounded-[2rem] border transition-all text-sm group",
                editingId === item.id ? "border-blue-500 bg-blue-50/30" : "border-slate-100"
              )}>
                <div className="hidden md:flex justify-start"><Checkbox className="h-5 w-5 border-slate-300 rounded-xl" /></div>

                <div className="flex md:block justify-between items-center">
                  <span className="md:hidden font-black text-slate-400">Name:</span>
                  <div className="font-bold text-[#181D27]">{item.name}</div>
                </div>

                <div className="flex md:block justify-between items-center">
                  <span className="md:hidden font-black text-slate-400">Code:</span>
                  <div className="text-[#181D27]">{item.code}</div>
                </div>

                <div className="flex md:block justify-between items-center">
                  <span className="md:hidden font-black text-slate-400">Min:</span>
                  <div className="text-[#181D27]">{item.minScore}%</div>
                </div>

                <div className="flex md:block justify-between items-center">
                  <span className="md:hidden font-black text-slate-400">Max:</span>
                  <div className="text-[#181D27]">{item.maxScore}%</div>
                </div>

                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEditClick(item)} className="h-9 w-9 text-slate-400 hover:text-blue-600"><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)} className="h-9 w-9 text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}


