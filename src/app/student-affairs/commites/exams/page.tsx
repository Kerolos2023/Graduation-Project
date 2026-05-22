"use client"

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Edit2,
  Trash2,
  Search,
  X,
  Loader2,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { examTermsService } from '@/services/examServices';
import { Badge } from "@/components/ui/badge";
import { useAcademicContext } from '@/hooks/useAcademicContext';

const ExamTypeOptions = [
  { id: 1, name: "Midterm" },
  { id: 2, name: "Final" },
  { id: 3, name: "Practical" }
];

export default function ExamTermsPage() {
  const router = useRouter();
  const { selectedProgramId, selectedSemesterId, isAcademicReady } = useAcademicContext();
  const [mounted, setMounted] = useState(false);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  
   const formRef = useRef<HTMLDivElement>(null);
  
  const [togglingIds, setTogglingIds] = useState<Record<string, boolean>>({});

  const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'error' | 'success' | 'warning' | null }>({
    text: "",
    type: null
  });

  const [formData, setFormData] = useState({
    examType: "",
    startDate: "",
    endDate: ""
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isAcademicReady) {
      loadData();
    }
  }, [isAcademicReady, selectedProgramId, selectedSemesterId]);

  const loadData = async () => {
    if (!selectedProgramId || !selectedSemesterId) return;

    try {
      setFetching(true);
      const examsData = await examTermsService.getProgramExams(selectedProgramId, selectedSemesterId);
      setExams(examsData.items || []);
    } catch (error: any) {
      const errorMsg = error.response?.data?.errors?.[0] || "Failed to load data";
      setStatusMessage({ text: errorMsg, type: 'error' });
    } finally {
      setFetching(false);
    }
  };

  
  const handleStartEdit = (item: any) => {
    const typeObj = ExamTypeOptions.find(t => t.name === item.examType);
    setEditingId(item.id);
    setFormData({
      examType: typeObj ? typeObj.id.toString() : "",
      startDate: item.startDate || "",
      endDate: item.endDate || ""
    });
    
    
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleToggleStatus = async (id: string) => {
    if (!selectedProgramId) return;
    
    const previousExams = [...exams];

    setExams(prevExams => 
      prevExams.map(exam => 
        exam.id === id ? { ...exam, isPublished: !exam.isPublished } : exam
      )
    );
    
    setTogglingIds(prev => ({ ...prev, [id]: true }));

    try {
      await examTermsService.togglePublisher(selectedProgramId, id);
    } catch (error) {
      setExams(previousExams);
      setStatusMessage({ text: "Failed to update status", type: 'error' });
    } finally {
      setTogglingIds(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?") || !selectedProgramId) return;
    try {
      await examTermsService.deleteExamTerm(selectedProgramId, id);
      loadData();
    } catch (error) {
      setStatusMessage({ text: "Failed to delete", type: 'error' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAcademicReady) return;

    setStatusMessage({ text: "", type: null });
    if (!formData.examType || !formData.startDate || !formData.endDate) {
      setStatusMessage({ text: "Please fill all fields", type: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        examType: parseInt(formData.examType),
        startDate: formData.startDate,
        endDate: formData.endDate
      };

      if (editingId) {
        await examTermsService.updateExamTerm(selectedProgramId!, editingId, payload);
        setStatusMessage({ text: "Successfully updated", type: 'success' });
      } else {
        await examTermsService.addExamTerm(selectedProgramId!, selectedSemesterId!, payload);
        setStatusMessage({ text: "Successfully added", type: 'success' });
      }
      resetForm();
      loadData();
    } catch (error: any) {
      setStatusMessage({ text: error.response?.data?.errors?.[0] || "Save failed", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ examType: "", startDate: "", endDate: "" });
  };

  const filteredExams = useMemo(() => {
    return exams.filter(item =>
      item.examType?.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [exams, searchValue]);

  if (!mounted) return null;

  if (!isAcademicReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-gray-500 font-bold text-lg">Please select academic program and semester first...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-10 bg-[#F5F5F5] min-h-screen font-sans">
      
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

        <div ref={formRef} className="bg-[#FFFFFF] p-5 md:p-8 rounded-[20px] md:rounded-[24px] shadow-sm border border-[#E9EAEB] scroll-mt-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg md:text-xl font-bold text-[#0A0D12]">
            {editingId ? "Updating Exam Term" : "Adding Exam Term"}
          </h2>
          {editingId && (
            <Button variant="ghost" size="sm" onClick={resetForm} className="text-red-500 hover:bg-red-50 h-8">
              <X size={14} className="mr-1" /> <span className="text-xs font-bold">Cancel Edit</span>
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-full space-y-1.5">
            <label className="text-sm font-semibold text-[#090909]">Event</label>
            <Select value={formData.examType} onValueChange={(val) => setFormData({ ...formData, examType: val })}>
              <SelectTrigger className="h-11 rounded-xl border-slate-200 focus:ring-blue-600 bg-white">
                <SelectValue placeholder="Select Exam Type" />
              </SelectTrigger>
              <SelectContent>
                {ExamTypeOptions.map((t) => (
                  <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[#090909]">Start Date</label>
            <Input type="date" className="h-11 rounded-xl border-slate-200 bg-white" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[#090909]">End Date</label>
            <Input type="date" className="h-11 rounded-xl border-slate-200 bg-white" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className={`col-span-full h-11 cursor-pointer font-bold rounded-xl transition-all text-white ${
              editingId ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : editingId ? "Save Changes" : "Add Exam"}
          </Button>
        </form>
      </div>

       <div className="bg-white p-4 md:p-8 rounded-[20px] md:rounded-[24px] shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-semibold text-[#0A0D12]">Exams</h2>
            <Badge className="bg-[#EFF8FF] text-[#2463F0] border-[#BEDAFF] px-3 py-1 rounded-full text-xs font-bold">
              {filteredExams.length} Exams
            </Badge>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search" 
                className="pl-10 h-10 border-slate-200 rounded-xl focus-visible:ring-slate-300 w-full" 
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
          </div>
        </div>

         <div className="hidden md:grid grid-cols-[50px_1fr_1fr_1fr_250px] px-6 py-4 bg-slate-50 rounded-xl mb-4   font-semibold text-[#181D27] tracking-wider">
          <div className="flex justify-center"></div>
          <div>Name</div>
          <div className="text-center">Start Date</div>
          <div className="text-center">End Date</div>
          <div className="text-right px-2">Actions</div>
        </div>

         <div className="space-y-4 md:space-y-2">
          {fetching ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-blue-600 h-10 w-10" /></div>
          ) : filteredExams.length === 0 ? (
            <div className="text-center py-16 text-slate-400 border-2 border-dashed border-slate-50 rounded-2xl">
              No exam terms found.
            </div>
          ) : (
            filteredExams.map((item) => (
              <div key={item.id} className={cn(
                "flex flex-col md:grid md:grid-cols-[50px_1fr_1fr_1fr_250px] items-start md:items-center px-4 md:px-6 py-4 border border-slate-100 md:border-transparent md:hover:bg-slate-50 rounded-2xl transition-all gap-3 md:gap-0 bg-white md:bg-transparent shadow-sm md:shadow-none",
                editingId === item.id && "bg-blue-50/50 border-blue-200"
              )}>
                <div className="flex justify-between items-center w-full md:w-auto md:justify-center">
                  <div className="w-4 h-4" /> 
                  <div className="md:hidden flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleStartEdit(item)} className="h-9 w-9 text-blue-500 bg-blue-50/50">
                      <Edit2 size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="h-9 w-9 text-red-500 bg-red-50/50">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col md:block">
                  <span className="text-[10px] uppercase font-bold text-slate-400 md:hidden mb-1">Name</span>
                  <div className="font-semibold text-[#181D27] text-base md:text-sm truncate">{item.examType}</div>
                </div>

                <div className="flex flex-col md:text-center w-full md:w-auto">
                  <span className="text-[10px] uppercase font-bold text-slate-400 md:hidden mb-1">Start Date</span>
                  <div className="text-[#181D27] text-sm font-semibold">{item.startDate}</div>
                </div>

                <div className="flex flex-col md:text-center w-full md:w-auto">
                  <span className="text-[10px] uppercase font-bold text-slate-400 md:hidden mb-1">End Date</span>
                  <div className="text-[#181D27] text-sm font-semibold">{item.endDate}</div>
                </div>

                <div className="w-full md:w-auto flex justify-end items-center gap-2">
                  <div className="hidden md:flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleStartEdit(item)} className="h-8 w-8 text-blue-500 hover:bg-blue-100 transition-colors">
                      <Edit2 size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="h-8 w-8 text-red-500 hover:bg-red-100 transition-colors">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    disabled={togglingIds[item.id]} 
                    onClick={() => handleToggleStatus(item.id)} 
                    className={`h-8 min-w-[90px] rounded-lg font-bold text-[10px] border transition-all flex items-center justify-center gap-1 ${
                      item.isPublished 
                        ? 'text-blue-600 border-blue-100 bg-blue-50 hover:bg-blue-100' 
                        : 'text-amber-600 border-amber-100 bg-amber-50 hover:bg-amber-100'
                    }`}
                  >
                    {togglingIds[item.id] ? (
                      <Loader2 className="animate-spin w-3 h-3" />
                    ) : (
                      item.isPublished ? 'Published' : 'Draft'
                    )}
                  </Button>

                  <Button 
                    onClick={() => router.push(`/student-affairs/commites/committee/${item.id}`)} 
                    className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[10px] flex items-center gap-1"
                  >
                    Open <ExternalLink className="w-3 h-3" />
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

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}