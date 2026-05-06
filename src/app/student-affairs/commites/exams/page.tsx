
"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  AlertCircle
} from "lucide-react";
import { examTermsService } from '@/services/examServices';
import { Checkbox } from '@/components/ui/checkbox';
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
  const [fetching, setFetching] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

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

  const handleToggleStatus = async (id: string) => {
    if (!selectedProgramId) return;
    try {
      await examTermsService.togglePublisher(selectedProgramId, id);
      loadData();
    } catch (error) {
      setStatusMessage({ text: "Failed to update status", type: 'error' });
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
    if (!isAcademicReady) {
      setStatusMessage({ text: "Academic context is not ready", type: 'error' });
      return;
    }

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
    <div className="p-4 md:p-8 space-y-8 bg-[#F5F7FA] min-h-screen font-sans">

      {/* Alert System */}
      {statusMessage.type && (
        <div className={`flex items-center justify-between p-4 rounded-2xl border ${statusMessage.type === 'error' ? 'bg-red-50 border-red-200 text-red-600 font-bold' :
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
      <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
        <CardHeader className="pb-2 pt-8 px-8 border-b border-gray-50">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-[#0A0D12]">
              {editingId ? "Update Exam Term" : "Adding Exam Terms"}
            </CardTitle>
            {editingId && (
              <Button variant="ghost" onClick={resetForm} className="text-red-500 hover:bg-red-50 rounded-xl font-bold">
                <X className="w-4 h-4" /> Cancel Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#090909] ml-1">Exam Term</label>
              <Select value={formData.examType} onValueChange={(val) => setFormData({ ...formData, examType: val })}>
                <SelectTrigger className="h-14 bg-gray-50/50 border-[#E2E8F0] rounded-xl">
                  <SelectValue placeholder="Select Exam Type" />
                </SelectTrigger>
                <SelectContent>
                  {ExamTypeOptions.map((t) => (
                    <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 flex flex-col">
                <label className="text-sm font-semibold text-[#090909] ml-1">Start Date</label>
                <Input type="date" className="h-14 rounded-xl border-[#E2E8F0] bg-gray-50/50" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
              </div>
              <div className="space-y-2 flex flex-col">
                <label className="text-sm font-bold text-gray-700 ml-1">End Date</label>
                <Input type="date" className="h-14 rounded-xl border-[#E2E8F0] bg-gray-50/50" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className={`w-full h-14 rounded-xl text-lg font-bold shadow-md transition-all flex items-center justify-center text-white ${editingId ? 'bg-purple-600 hover:bg-purple-700' : 'bg-[#2463F0] hover:bg-[#1e51c9]'
                }`}
            >
              {loading ? <Loader2 className="animate-spin w-6 h-6 text-white" /> : editingId ? "Save Changes" : "Add Exam"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
        <div className="p-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#0A0D12]">Exam List</h2>
          <div className="relative w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search..."
              className="pl-11 h-12 bg-white border-[#E2E8F0] rounded-xl"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
        </div>

        <div className="px-8 pb-8 overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-[50px_1fr_1fr_1fr_280px] items-center px-6 py-4 bg-[#FAFAFA] rounded-xl text-xs font-semibold text-[#181D27] mb-4">
              <div className="text-center flex justify-center"><Checkbox disabled /></div>
              <div>Name</div>
              <div className="text-center">Start Date</div>
              <div className="text-center">End Date</div>
              <div className="text-right pr-6">Actions</div>
            </div>

            <div className="space-y-3">
              {fetching ? (
                <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-blue-600 w-10 h-10" /></div>
              ) : filteredExams.length === 0 ? (
                <div className="py-10 text-center text-gray-400 font-bold border-2 border-dashed rounded-2xl">No data found</div>
              ) : (
                filteredExams.map((item) => (
                  <div key={item.id} className="grid grid-cols-[50px_1fr_1fr_1fr_280px] items-center px-6 py-4 border border-[#E2E8F0] rounded-2xl bg-white hover:shadow-md transition-all">
                    <div className="text-center flex justify-center"><Checkbox className="rounded-lg" /></div>
                    <div className="font-bold text-[#1E293B]">{item.examType}</div>
                    <div className="text-center text-slate-600 font-medium">{item.startDate}</div>
                    <div className="text-center text-slate-600 font-medium">{item.endDate}</div>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => {
                        const typeObj = ExamTypeOptions.find(t => t.name === item.examType);
                        setEditingId(item.id);
                        setFormData({
                          examType: typeObj ? typeObj.id.toString() : "",
                          startDate: item.startDate || "",
                          endDate: item.endDate || ""
                        });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }} className="text-gray-400 hover:text-blue-600"><Edit2 className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
                      <Button variant="outline" onClick={() => handleToggleStatus(item.id)} className={`min-w-[90px] h-10 rounded-xl font-bold text-[11px] ${item.isPublished ? 'text-blue-600 border-blue-100 bg-blue-50' : 'text-red-600 border-red-100 bg-red-50'}`}>
                        {item.isPublished ? 'Published' : 'Draft'}
                      </Button>
                      <Button onClick={() => router.push(`/student-affairs/commites/committee/${item.id}`)} className="h-10 px-5 bg-[#2463F0] hover:bg-blue-800 text-white rounded-xl font-bold text-[11px] flex items-center gap-1">
                        Open <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}