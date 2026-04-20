 
"use client"
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { gradeService, GradeRequest } from '@/services/gradeServices';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Pencil, Trash2, MoreVertical, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import CollegeDataTabs from "@/components/departmentsTabs";

export default function GradesPage() {
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const { register, handleSubmit, reset, setValue } = useForm<GradeRequest>();

  const fetchGrades = useCallback(async () => {
    try {
      setLoading(true);
      const data = await gradeService.getAllGrades();
      setGrades(data.items || []);
    } catch (error) {
      toast.error("Failed to fetch grades data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchGrades(); 
  }, [fetchGrades]);

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
        await gradeService.updateGrade(editingId, payload);
        toast.success("Grade updated successfully!");
      } else {
        await gradeService.createGrade(payload);
        toast.success("Grade added successfully!");
      }
      setEditingId(null);
      reset();
      await fetchGrades(); 
    } catch (error: any) {
      const serverMessage = error.response?.data?.errors?.[0] || 
                            error.response?.data?.title || 
                            "An unexpected error occurred";
      toast.error(`Error: ${serverMessage}`);
    }
  };

  const handleEdit = (grade: any) => {
    setEditingId(grade.id);
    setValue("name", grade.name);
    setValue("code", grade.code);
    setValue("minScore", grade.minScore);
    setValue("maxScore", grade.maxScore);
    setValue("minGradePoint", grade.minGradePoint);
    setValue("maxGradePoint", grade.maxGradePoint);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onDelete = async (gradeId: string) => {
    if (!confirm("Are you sure you want to delete this grade?")) return;
    try {
      await gradeService.deleteGrade(gradeId);
      toast.success("Grade deleted successfully");
      await fetchGrades(); 
    } catch (error) {
      toast.error("Failed to delete grade");
    }
  };

  const inputClass = "h-12 md:h-14 rounded-xl md:rounded-2xl border-[#f1f1f1] bg-white placeholder:text-[#d1d1d1] focus-visible:ring-1 focus-visible:ring-blue-400 focus-visible:border-blue-400 transition-all";

  return (
    <div className="p-3 md:p-8 max-w-6xl mx-auto space-y-6 md:space-y-10 bg-[#F5F5F5] min-h-screen">
      <CollegeDataTabs />
      
      <Card className="border-none shadow-sm rounded-[1.25rem] md:rounded-[2rem] p-0 md:p-6 bg-[#FFFFFF] overflow-hidden">
        <CardContent className="pt-6 px-4 md:px-6">
          <div className="flex justify-between items-center mb-6 md:mb-8">
            <h2 className="text-lg md:text-2xl font-semibold text-[#0A0D12]">
              {editingId ? "Update Grade" : "Grades"}
            </h2>
            
            {editingId && (
              <button 
                onClick={() => { setEditingId(null); reset(); }}
                className="flex items-center gap-1 text-red-500 hover:text-red-600 text-xs md:text-sm font-bold transition-colors"
              >
                <X className="h-4 w-4" />
                <span>Cancel Edit</span>
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 md:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#090909]">Grade</label>
                <Input {...register("name")} placeholder="Placeholder" required className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#090909]">Equivalent Grade</label>
                <Input {...register("code")} placeholder="Placeholder" required className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-8">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#090909]">Percentage From</label>
                <Input type="number" {...register("minScore")} placeholder="Placeholder" className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#090909]">To</label>
                <Input type="number" {...register("maxScore")} placeholder="Placeholder" className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-8">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#090909]">Points From</label>
                <Input type="number" step="0.01" {...register("minGradePoint")} placeholder="Placeholder" className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#090909]">To</label>
                <Input type="number" step="0.01" {...register("maxGradePoint")} placeholder="Placeholder" className={inputClass} />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#2463F0] hover:bg-[#1d4ed8] h-12 md:h-14 rounded-xl md:rounded-2xl text-md font-semibold transition-all shadow-none"
            >
              {editingId ? "Save Changes" : "Add or Save"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm rounded-[1.25rem] md:rounded-[2rem] p-4 md:p-6 bg-white overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-lg md:text-2xl text-[#0A0D12]">Grades</h3>
            <span className="text-[10px] md:text-[11px] font-bold bg-[#ebf3ff] text-[#3b82f6] px-3 py-1 rounded-full border border-blue-50">
              {filteredGrades.length} Items
            </span>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#d1d1d1]" />
              <Input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 w-full md:w-80 h-11 md:h-12 bg-white border-[#f1f1f1] rounded-xl md:rounded-2xl focus-visible:ring-1 focus-visible:ring-blue-400" 
                placeholder="Search" 
              />
            </div>
            <Button variant="outline" size="icon" className="rounded-xl h-11 w-11 md:h-12 md:w-12 shrink-0 border-[#f1f1f1] text-gray-400">
              <MoreVertical />
            </Button>
          </div>
        </div>

        <div className="space-y-3 md:space-y-4">
          <div className="hidden md:grid grid-cols-4 px-8 py-2 text-sm font-bold text-gray-400">
            <div>Name</div>
            <div>Min Score</div>
            <div>Max Score</div>
            <div className="text-right">Actions</div>
          </div>

          {loading ? (
            <div className="text-center py-10 text-gray-400 animate-pulse font-bold">Updating List...</div>
          ) : filteredGrades.map((grade) => (
            <div key={grade.id} className="grid grid-cols-2 md:grid-cols-4 items-center px-4 md:px-8 py-4 md:py-6 bg-white border border-[#f8f8f8] rounded-[1rem] md:rounded-2xl hover:border-blue-50 transition-all group gap-y-3">
              
              <div className="text-[#181D27] font-semibold md:font-medium text-base md:text-lg col-span-1 flex flex-col md:block">
                {grade.name} 
                <span className="text-gray-400 font-normal text-xs md:text-sm md:ml-2">({grade.code})</span>
              </div>

              <div className="text-[#181D27] font-semibold text-sm md:text-lg text-right md:text-left flex flex-col md:block">
                <span className="md:hidden text-gray-400 text-[10px] font-normal uppercase">Min Score</span>
                <span>{grade.minScore}%</span>
              </div>

              <div className="text-[#181D27] font-semibold text-sm md:text-lg text-left md:block flex flex-col">
                 <span className="md:hidden text-gray-400 text-[10px] font-normal uppercase">Max Score</span>
                 <span>{grade.maxScore}%</span>
              </div>

              <div className="flex justify-end gap-2 col-span-1 md:col-span-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <Button onClick={() => handleEdit(grade)} variant="ghost" size="icon" className="h-9 w-9 md:h-10 md:w-10 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg md:rounded-xl">
                  <Pencil className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
                <Button onClick={() => onDelete(grade.id)} variant="ghost" size="icon" className="h-9 w-9 md:h-10 md:w-10 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg md:rounded-xl">
                  <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}





 