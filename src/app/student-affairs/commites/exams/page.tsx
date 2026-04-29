

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
  Printer,
  MoreVertical,
  Search,
  X,
  Loader2,
  ExternalLink,
  AlertCircle
} from "lucide-react";
import { examTermsService } from '@/services/examServices';
import { Checkbox } from '@/components/ui/checkbox';


const ExamTypeOptions = [
  { id: 1, name: "Midterm" },
  { id: 2, name: "Final" },
  { id: 3, name: "Practical" }
];

export default function ExamTermsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);


  const academicProgramId = "019DB291-C74C-730E-B2BC-14893A68B8BA";
  const semesterId = "019d7980-c25c-7793-b137-248b067f98d5";

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
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setFetching(true);
      const examsData = await examTermsService.getProgramExams(academicProgramId, semesterId);
      setExams(examsData.items || []);
    } catch (error) {
      setStatusMessage({ text: "Failed to load data from the server", type: 'error' });
    } finally {
      setFetching(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await examTermsService.togglePublisher(academicProgramId, id);
      loadData();
    } catch (error) {
      setStatusMessage({ text: "Failed to update publish status", type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this term?")) return;
    try {
      await examTermsService.deleteExamTerm(academicProgramId, id);
      loadData();
    } catch (error) {
      setStatusMessage({ text: "Failed to delete the term", type: 'error' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage({ text: "", type: null });

    if (!formData.examType || !formData.startDate || !formData.endDate) {
      setStatusMessage({ text: "Please fill in all required fields", type: 'warning' });
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
        await examTermsService.updateExamTerm(academicProgramId, editingId, payload);
        setStatusMessage({ text: "Successfully updated", type: 'success' });
      } else {
        await examTermsService.addExamTerm(academicProgramId, semesterId, payload);
        setStatusMessage({ text: "Successfully added", type: 'success' });
      }
      resetForm();
      loadData();
    } catch (error: any) {
      const serverErrors = error.response?.data?.errors;
      const serverTitle = error.response?.data?.title;

      const errorText = (serverErrors && serverErrors[0]) ||
        (serverTitle === "ExamTerm.OverlabbingTime"
          ? "There is a scheduling conflict with another exam"
          : "An error occurred while saving the data");

      setStatusMessage({ text: errorText, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ examType: "", startDate: "", endDate: "" });
  };

  const handleEditClick = (item: any) => {
    const typeObj = ExamTypeOptions.find(t => t.name === item.examType);
    setEditingId(item.id);
    setFormData({
      examType: typeObj ? typeObj.id.toString() : "",
      startDate: item.startDate || "",
      endDate: item.endDate || ""
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStatusMessage({ text: "", type: null });
  };

  const filteredExams = useMemo(() => {
    return exams.filter(item =>
      item.examType?.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [exams, searchValue]);

  if (!mounted) return null;

  return (
    <div className="p-4 md:p-8 space-y-8 bg-[#F5F7FA] min-h-screen font-sans">


      {statusMessage.type && (
        <div className={`flex items-center justify-between p-4 rounded-2xl border animate-in fade-in slide-in-from-top-4 ${statusMessage.type === 'error' ? 'bg-red-50 border-red-200 text-red-600 font-bold' :
          statusMessage.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
            'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
          <div className="flex items-center gap-3">
            {statusMessage.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
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
              <Button variant="ghost" onClick={resetForm} className="text-red-500 hover:bg-red-50 rounded-xl gap-1 font-bold">
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
              className={`w-full h-14 rounded-xl text-lg font-bold shadow-md transition-all flex items-center justify-center text-white ${editingId
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-[#2463F0] hover:bg-[#1e51c9]'
                }`}
            >
              {loading ? (
                <Loader2 className="animate-spin w-6 h-6 text-white" />
              ) : (
                editingId ? "Save Changes" : "Add Exam"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
        <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-[#0A0D12]">Exam List</h2>
            <span className="bg-blue-50 text-blue-500 text-xs font-bold px-3 py-1 rounded-full border border-blue-100">
              {filteredExams.length} Terms
            </span>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search..."
                className="pl-11 h-12 bg-white border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-blue-100"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={() => window.print()} className="h-12 border-[#DBEAFE] text-[#2563EB] rounded-xl px-4 font-bold gap-2">
              <Printer className="w-4 h-4" /> Print
            </Button>
          </div>
        </div>

        <div className="px-8 pb-8 overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-[50px_1fr_1fr_1fr_280px] items-center px-6 py-4 bg-[#FAFAFA] rounded-xl text-xs font-semibold text-[#181D27] mb-4 border border-gray-100">
              <div className="text-center flex justify-center"><Checkbox disabled className="h-4 w-4" /></div>
              <div>Name</div>
              <div className="text-center">Start Date</div>
              <div className="text-center ">End Date</div>
              <div className="text-right pr-6">Actions</div>
            </div>

            <div className="space-y-3">
              {fetching ? (
                <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-blue-600 w-10 h-10" /></div>
              ) : filteredExams.length === 0 ? (
                <div className="py-10 text-center text-gray-400 font-bold border-2 border-dashed rounded-2xl">No data found</div>
              ) : (
                filteredExams.map((item) => (
                  <div key={item.id} className="grid grid-cols-[50px_1fr_1fr_1fr_280px] items-center px-6 py-4 border border-[#E2E8F0] rounded-2xl hover:shadow-md transition-all bg-white group">
                    <div className="text-center flex justify-center"><Checkbox className="h-5 w-5 border-slate-300 rounded-lg" /></div>
                    <div className="font-bold text-[#1E293B]">{item.examType}</div>
                    <div className="text-center text-slate-600 font-medium">{item.startDate}</div>
                    <div className="text-center text-slate-600 font-medium">{item.endDate}</div>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(item)} className="h-10 w-10 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl"><Edit2 className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="h-10 w-10 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl"><Trash2 className="w-4 h-4" /></Button>
                      <Button variant="outline" onClick={() => handleToggleStatus(item.id)} className={`min-w-[90px] h-10 rounded-xl font-bold text-[11px] shadow-sm transition-all ${item.isPublished ? 'text-[#2563EB] border-[#DBEAFE] bg-blue-50' : 'text-[#EF4444] border-red-100 bg-red-50'}`}>{item.isPublished ? 'Published' : 'Draft'}</Button>
                      <Button onClick={() => router.push(`/student-affairs/commites/committee/${item.id}`)} className="h-10 px-5 bg-[#2463F0] hover:bg-black text-white rounded-xl font-bold text-[11px] shadow-sm flex items-center gap-1 transition-all">Open <ExternalLink className="w-3 h-3" /></Button>
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










