"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Pencil,
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

    loading || setLoading(true);
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
      <div className="w-full h-full flex flex-col gap-6 font-inter pb-8">
        <div className="bg-white rounded-[24px] border border-[#eaebf0] p-12 flex flex-col items-center justify-center gap-3 text-center shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-[15px] font-bold text-gray-900">Please select academic program and semester first...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-6 font-inter pb-8">
      
      {statusMessage.type && (
        <div className={cn(
          "border px-4 py-3 rounded-xl text-sm",
          statusMessage.type === 'error' && 'bg-red-50 border-red-200 text-red-700 font-bold',
          statusMessage.type === 'warning' && 'bg-amber-50 border-amber-200 text-amber-800 font-semibold',
          statusMessage.type === 'success' && 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold'
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

      {/* FORM CARD */}
      <div ref={formRef} className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0] shrink-0 scroll-mt-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-gray-900">
            {editingId ? "Updating Exam Term" : "Adding Exam Term"}
          </h1>
          {editingId && (
            <button onClick={resetForm} className="text-red-500 hover:bg-red-50 rounded-xl text-xs font-bold h-9 px-3 cursor-pointer flex items-center gap-1 border border-transparent">
              <X className="w-4 h-4" /> <span>Cancel Edit</span>
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="col-span-full flex flex-col gap-1.5 w-full">
              <label className="text-[13px] font-bold text-gray-900 ml-1">Event</label>
              <Select value={formData.examType} onValueChange={(val) => setFormData({ ...formData, examType: val })}>
                <SelectTrigger className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm font-medium h-auto">
                  <SelectValue placeholder="Select Exam Type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {ExamTypeOptions.map((t) => (
                    <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[13px] font-bold text-gray-900 ml-1">Start Date</label>
              <Input type="date" className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm font-medium h-auto" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[13px] font-bold text-gray-900 ml-1">End Date</label>
              <Input type="date" className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm font-medium h-auto" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full active:scale-[0.99] text-white font-semibold py-3.5 rounded-[12px] transition-all shadow-sm cursor-pointer text-sm flex items-center justify-center ${
              editingId ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : editingId ? "Save Changes" : "Add"}
          </button>
        </form>
      </div>

      {/* LIST CARD */}
      <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-[22px] font-bold text-gray-900 leading-none">Exams</h2>
            <Badge className="bg-[#eff4ff] text-blue-600 text-[11px] font-bold px-3 py-1.5 rounded-full border border-blue-100 hover:bg-[#eff4ff] shadow-none">
              {filteredExams.length} Exams
            </Badge>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-[280px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search" 
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-[12px] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm font-medium h-auto" 
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table Header */}
        <div className="hidden md:grid grid-cols-[1.5fr_1fr_1fr_250px] px-5 py-4 mb-3 border border-gray-100 bg-[#fafafa] rounded-xl font-bold text-gray-800">
          <div className="text-[13px]">Name</div>
          <div className="text-[13px] text-center">Start Date</div>
          <div className="text-[13px] text-center">End Date</div>
          <div className="text-right px-2 text-[13px]">Actions</div>
        </div>

        {/* Table Body */}
        <div className="flex flex-col gap-3 mb-8">
          {fetching ? (
            <div className="text-center p-4 text-gray-500 text-sm">
              <Loader2 className="animate-spin w-5 h-5 inline-block mr-2 text-blue-600" /> Loading...
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="text-center p-8 text-gray-400 border border-gray-100 rounded-xl border-dashed">
              No exam terms found.
            </div>
          ) : (
            filteredExams.map((item) => (
              <div 
                key={item.id} 
                className={cn(
                  "flex flex-col md:grid md:grid-cols-[1.5fr_1fr_1fr_250px] items-start md:items-center px-5 py-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-white group gap-3 md:gap-0 relative",
                  editingId === item.id && "bg-blue-50/50 border-blue-200"
                )}
              >
                <div className="md:hidden flex justify-end w-full mb-2">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleStartEdit(item)} className="h-9 w-9 text-blue-500 bg-blue-50/50 cursor-pointer">
                      <Pencil size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="h-9 w-9 text-red-500 bg-red-50/50 cursor-pointer">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col md:block">
                  <span className="text-[10px] uppercase font-bold text-gray-400 md:hidden mb-1">Name</span>
                  <div className="text-[14px] font-bold text-gray-900 truncate">{item.examType}</div>
                </div>

                <div className="flex flex-col md:text-center w-full md:w-auto">
                  <span className="text-[10px] uppercase font-bold text-gray-400 md:hidden mb-1">Start Date</span>
                  <div className="text-[14px] font-bold text-gray-500 md:text-gray-900">{item.startDate}</div>
                </div>

                <div className="flex flex-col md:text-center w-full md:w-auto">
                  <span className="text-[10px] uppercase font-bold text-gray-400 md:hidden mb-1">End Date</span>
                  <div className="text-[14px] font-bold text-gray-500 md:text-gray-900">{item.endDate}</div>
                </div>

                <div className="w-full md:w-auto flex justify-end items-center gap-2">
                  <div className="hidden md:flex gap-2">
                    <button
                      onClick={() => handleStartEdit(item)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors bg-white cursor-pointer"
                    >
                      <Pencil className="w-[18px] h-[18px]" strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors bg-white cursor-pointer"
                    >
                      <Trash2 className="w-[18px] h-[18px]" strokeWidth={2.5} />
                    </button>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    disabled={togglingIds[item.id]} 
                    onClick={() => handleToggleStatus(item.id)} 
                    className={`h-8 min-w-[90px] rounded-lg font-bold text-[10px] border transition-all flex items-center justify-center gap-1 cursor-pointer ${
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
                    className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[10px] flex items-center gap-1 cursor-pointer"
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