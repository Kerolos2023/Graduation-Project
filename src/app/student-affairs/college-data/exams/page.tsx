


"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit2, Trash2, Printer, MoreVertical, Search, ChevronLeft, ChevronRight, X, Loader2 } from "lucide-react";
import { examTermsService } from '@/services/examServices';
import { toast } from "sonner";
import { Checkbox } from '@/components/ui/checkbox';

export default function ExamTermsPage() {
  const academicProgramId = "019DB291-C74C-730E-B2BC-14893A68B8BA";
  const semesterId = "019d7980-c25c-7793-b137-248b067f98d5";

  const [exams, setExams] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ examType: "", startDate: "", endDate: "" });

  const loadData = async () => {
    try {
      setFetching(true);
      const [examsData, typesData] = await Promise.all([
        examTermsService.getProgramExams(academicProgramId, semesterId),
        examTermsService.getExamTypes(academicProgramId)
      ]);
      setExams(examsData.items || []);
      setTypes(typesData || []);
    } catch (error) {
      toast.error("Error connecting to server");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

   const filteredExams = exams.filter(item =>
    item.examType?.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.examType || !formData.startDate || !formData.endDate) {
      toast.warning("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        await examTermsService.updateExamTerm(academicProgramId, editingId, formData);
        toast.success("Updated successfully");
      } else {
        await examTermsService.addExamTerm(academicProgramId, semesterId, formData);
        toast.success("Added successfully");
      }
      resetForm();
      loadData();
    } catch (error) {
      toast.error("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ examType: "", startDate: "", endDate: "" });
  };

  const handleEditClick = (item: any) => {
    setEditingId(item.id);
    setFormData({
      examType: item.examType,
      startDate: item.startDate,
      endDate: item.endDate
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await examTermsService.togglePublisher(academicProgramId, id);
      toast.success("Status updated");
      loadData();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 bg-[#F5F7FA] min-h-screen font-sans">

       <Card className="border-none shadow-sm rounded-2xl md:rounded-3xl overflow-hidden bg-white">
        <CardHeader className="pb-2 pt-6 md:pt-8 px-4 md:px-8">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl md:text-2xl font-bold text-[#0A0D12]">
              {editingId ? "Update Exam Term" : "Adding Exam Terms"}
            </CardTitle>
            {editingId && (
              <Button
                variant="ghost"
                onClick={resetForm}
                className="text-red-500 hover:bg-red-50 rounded-xl font-semibold"
              >
                <X className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">Cancel Edit</span>
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4 md:p-8 pt-2 md:pt-4">
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#090909] px-1">Exam Terms</label>
              <Select value={formData.examType} onValueChange={(val) => setFormData({ ...formData, examType: val })}>
                <SelectTrigger className="h-12 md:h-14 bg-white border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Select Exam Type" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((t: any) => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#090909] px-1">Start date</label>
                <Input type="date" className="h-12 md:h-14 rounded-xl border-[#E2E8F0]" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#090909] px-1">End date</label>
                <Input type="date" className="h-12 md:h-14 rounded-xl border-[#E2E8F0]" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className={`w-full cursor-pointer h-12 md:h-14 rounded-xl text-lg font-bold transition-all shadow-md ${editingId ? 'bg-purple-600 hover:bg-purple-700' : 'bg-[#2463F0] hover:bg-blue-700'}`}
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : editingId ? "Save Changes" : "Add Event"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm rounded-2xl md:rounded-3xl overflow-hidden bg-white">
        <div className="p-4 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold text-[#0A0D12]">Exam Terms</h2>
            <span className="bg-[#EFF6FF] text-[#2563EB] px-3 py-1 rounded-full text-[10px] font-bold border border-[#DBEAFE]">
              {filteredExams.length} Exams
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search"
                className="pl-12 w-full h-12 bg-white border-[#E2E8F0] rounded-xl"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto justify-end">
              <Button variant="outline" onClick={() => window.print()} className="h-12 border-[#DBEAFE] text-[#2563EB] rounded-xl px-4 md:px-6 font-bold gap-2">
                <Printer className="w-5 h-5" /> <span className="hidden sm:inline">Print</span>
              </Button>
              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-slate-400 border border-[#E2E8F0]"><MoreVertical /></Button>
            </div>
          </div>
        </div>

        <div className="px-4 md:px-8 pb-8 overflow-x-auto">
          <div className="min-w-[750px]">
            {/* Header */}
            <div className="grid grid-cols-[50px_1fr_1fr_1fr_200px] items-center px-6 py-4 bg-[#FAFAFA] rounded-xl text-sm font-bold text-[#181D27] mb-4">
              <div className="text-center"> </div>
              <div>Name</div>
              <div className="text-center">Start date</div>
              <div className="text-center">End date</div>
              <div className="text-right pr-4">Actions</div>
            </div>

            <div className="space-y-3">
              {fetching ? (
                <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>
              ) : filteredExams.length === 0 ? (
                <div className="py-10 text-center text-gray-400 font-bold">No data found</div>
              ) : (
                filteredExams.map((item) => (
                  <div key={item.id} className="grid grid-cols-[50px_1fr_1fr_1fr_200px] items-center px-6 py-4 border border-[#E2E8F0] rounded-2xl hover:shadow-sm transition-all bg-white group">
                    <div className="text-center">

                      <Checkbox className="h-5 w-5 border-slate-300 rounded-xl" />
                    </div>
                    <div className="font-bold text-[#1E293B]">{item.examType}</div>
                    <div className="text-center text-slate-600 font-medium">{item.startDate}</div>
                    <div className="text-center text-slate-600 font-medium">{item.endDate}</div>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(item)}
                        className="h-9 w-9 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {  }}
                        className="h-9 w-9 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleToggleStatus(item.id)}
                        className={`min-w-[90px] h-9 rounded-xl font-bold shadow-sm transition-all ${item.isPublished
                            ? 'text-[#2563EB] border-[#DBEAFE] bg-blue-50/50 hover:bg-blue-100'
                            : 'text-[#EF4444] border-red-100 bg-red-50/50 hover:bg-red-100'
                          }`}
                      >
                        {item.isPublished ? 'Published' : 'Draft'}
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