
"use client"

import React, { useEffect, useState, useCallback } from "react";
import { Trash2, Edit2, Loader2, X, Search, MoreVertical } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Pagination } from '@/components/ui/pagination';

import { levelService, AcademicLevel } from "@/services/levelsServices";

export default function AcademicLevelsPage() {
  const [levels, setLevels] = useState<AcademicLevel[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const [formData, setFormData] = useState({ name: "", minHours: "", maxHours: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  const academicProgramId = "019D5C67-392B-74A6-8E1F-2221FC6BBF0A";

  const loadLevels = useCallback(async () => {
    try {
      setLoading(true);
      const response = await levelService.getAllLevels(academicProgramId, {
        PageNumber: pageNumber,
        PageSize: pageSize,
        SearchValue: searchValue
      });

      setLevels(response.items || []);
      setTotalPages(response.totalPages || 1);
    } catch (error: any) {
      console.error("Load Error:", error.response?.data);
      toast.error("Failed to load levels");
    } finally {
      setLoading(false);
    }
  }, [pageNumber, pageSize, academicProgramId, searchValue]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadLevels();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [loadLevels]);

  const handleEditInit = (level: AcademicLevel) => {
    setEditingId(level.id);
    setFormData({
      name: level.name,
      minHours: String(level.minHours),
      maxHours: String(level.maxHours)
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: "", minHours: "", maxHours: "" });
  };

  const handleSubmit = async () => {
    if (!formData.name || formData.minHours === "" || formData.maxHours === "") {
      toast.warning("Please fill all fields");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name,
        minHours: Number(formData.minHours),
        maxHours: Number(formData.maxHours)
      };

      if (editingId) {
        await levelService.updateLevel(academicProgramId, editingId, payload);
        toast.success("Updated successfully");
      } else {
        await levelService.addLevel(academicProgramId, payload);
        toast.success("Added successfully");
      }
      cancelEdit();
      loadLevels();
    } catch (error: any) {
      toast.error(error.response?.data?.Message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await levelService.deleteLevel(academicProgramId, id);
      toast.success("Deleted successfully");
      loadLevels();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  return (

    <div className="p-4 md:p-8 bg-[#F8F9FB] min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Form Container */}
        <div className="bg-white p-6 md:p-8 rounded-[24px] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg md:text-xl font-bold text-[#0A0D12]">
              {editingId ? "Update Academic Level" : "Add Academic Level"}
            </h2>
            {editingId && (
              <Button variant="ghost" size="sm" onClick={cancelEdit} className="text-red-500 hover:bg-red-50 h-8">
                <X size={14} className="mr-1" /> <span className="text-xs md:text-sm">Cancel Edit</span>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-950">Level</label>
              <Input
                placeholder="e.g. Level 1"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-12 rounded-xl border-[#E2E8F0] focus-visible:ring-blue-600"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-950">Min Credit Hours</label>
              <Input
                type="number"
                value={formData.minHours}
                onChange={(e) => setFormData({ ...formData, minHours: e.target.value })}
                className="h-12 rounded-xl border-[#E2E8F0] focus-visible:ring-blue-600"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-950">Max Credit Hours</label>
              <Input
                type="number"
                value={formData.maxHours}
                onChange={(e) => setFormData({ ...formData, maxHours: e.target.value })}
                className="h-12 rounded-xl border-[#E2E8F0] focus-visible:ring-blue-600"
              />
            </div>
          </div>

          <Button
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer transition-all"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? <Loader2 className="animate-spin" /> : editingId ? "Save Changes" : "Add Level"}
          </Button>
        </div>

        <div className="bg-white p-4 md:p-8 rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl md:text-2xl font-bold text-[#0A0D12]">Levels</h2>
              <Badge className="bg-blue-50 text-blue-600 border-none px-3 py-1 rounded-full text-[10px] md:text-xs">
                {levels.length} Levels
              </Badge>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="pl-10 h-11 border-slate-200 rounded-xl focus-visible:ring-slate-300"
                />
              </div>
              <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-slate-200 text-slate-400 shrink-0">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto -mx-4 md:mx-0">
            <div className="min-w-[600px] p-4 md:p-0">
              <div className="grid grid-cols-[50px_1fr_1fr_1fr_100px] px-4 py-4 bg-slate-50 rounded-xl mb-4 text-sm font-bold text-slate-600">
                <div className="text-center"></div>
                <div className="text-left">Name</div>
                <div className="text-center">Min</div>
                <div className="text-center">Max</div>
                <div className="text-right">Actions</div>
              </div>

              <div className="space-y-3">
                {loading ? (
                  <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
                ) : levels.length === 0 ? (
                  <div className="text-center py-20 text-slate-400">No results found.</div>
                ) : (
                  levels.map((level) => (
                    <div key={level.id} className="grid grid-cols-[50px_1fr_1fr_1fr_100px] items-center px-4 py-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all">
                      <div className="flex justify-center"><Checkbox className="rounded" /></div>
                      <div className="font-medium text-slate-800 truncate pr-2">{level.name}</div>
                      <div className="text-center text-slate-600 text-sm">{level.minHours}</div>
                      <div className="text-center text-slate-600 text-sm">{level.maxHours}</div>
                      <div className="flex justify-end gap-1 md:gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditInit(level)} className="h-8 w-8 text-blue-500 hover:bg-blue-50 cursor-pointer ">
                          <Edit2 size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(level.id, level.name)} className="h-8 w-8 text-red-500 hover:bg-red-50 cursor-pointer">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination currentPage={pageNumber} totalPages={totalPages} onPageChange={setPageNumber} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}