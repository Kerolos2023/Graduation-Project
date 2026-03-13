


"use client"

import React, { useEffect, useState, useCallback } from "react";
import { Trash2, Edit2, Loader2, X, ChevronLeft, ChevronRight } from "lucide-react";
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

  const [formData, setFormData] = useState({ name: "", minHours: "", maxHours: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const collegeId = "019c1ea6-1738-71cb-8cfd-a90e126d177e";


  const loadLevels = useCallback(async () => {
    try {
      setLoading(true);
      const response = await levelService.getAllLevels(collegeId, {
        PageNumber: pageNumber,
        PageSize: pageSize
      });


      const resData = response.items || [];
      const resTotalPages = response.totalPages || 1;

      setLevels(Array.isArray(resData) ? resData : []);
      setTotalPages(resTotalPages);
    } catch (error: any) {
      toast.error("Failed to load levels");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [pageNumber, pageSize, collegeId]);

  useEffect(() => {
    loadLevels();
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
    if (!formData.name || !formData.minHours || !formData.maxHours) {
      toast.warning("Please fill all fields");
      return;
    }
    try {
      setSubmitting(true);
      if (editingId) {
        await levelService.updateLevel(editingId, formData);
        toast.success("Updated successfully");
      } else {
        await levelService.addLevel(collegeId, formData);
        toast.success("Added successfully");
      }
      cancelEdit();
      loadLevels();
    } catch (error: any) {
      toast.error("Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await levelService.deleteLevel(id);
      toast.success("Deleted successfully");
      loadLevels();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="p-8 bg-[#F8F9FB] min-h-screen font-sans">
      <div className="max-w-6xl mx-auto space-y-6">


        <div className="bg-white p-8 rounded-[24px] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#0A0D12]">
              {editingId ? "Update Academic Level" : "Adding Academic Levels"}
            </h2>
            {editingId && (
              <Button variant="ghost" size="sm" onClick={cancelEdit} className="text-red-500">
                <X size={16} className="mr-1" /> Cancel Edit
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#090909]">Level Name</label>
              <Input
                placeholder="e.g. Senior"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-white border-[#E9EAEB] h-12 rounded-xl focus-visible:ring-blue-600"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#090909]">Min Hours</label>
              <Input
                type="number"
                value={formData.minHours}
                onChange={(e) => setFormData({ ...formData, minHours: e.target.value })}
                className="bg-white border-[#E9EAEB] h-12 rounded-xl focus-visible:ring-blue-600"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#090909]">Max Hours</label>
              <Input
                type="number"
                value={formData.maxHours}
                onChange={(e) => setFormData({ ...formData, maxHours: e.target.value })}
                className="bg-white border-[#E9EAEB] h-12 rounded-xl focus-visible:ring-blue-600"
              />
            </div>
          </div>

          <Button
            className="w-full h-12 text-md font-bold cursor-pointer bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl transition-all"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? <Loader2 className="animate-spin" /> : editingId ? "Save Changes" : "Add or Save"}
          </Button>
        </div>


        <div className="bg-white p-8 rounded-[24px] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-bold text-[#0A0D12]">Academic Levels</h2>
            <Badge className="bg-[#EBF2FF] text-[#2563EB] border-none rounded-full px-4 py-1">
              {levels.length} Students
            </Badge>
          </div>

          <div className="grid grid-cols-[50px_1fr_1fr_1fr_120px] items-center px-4 py-4 bg-[#F8FAFC] rounded-xl mb-4 text-sm font-medium text-[#181D27]">
            <div className="flex justify-center"><Checkbox className="w-4 h-4 rounded border-gray-300" /></div>
            <div>Academic Level</div>
            <div className="text-center">Min Hours</div>
            <div className="text-center">Max Hours</div>
            <div className="text-right"></div>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
            ) : levels.length === 0 ? (
              <div className="text-center py-20 text-[#94A3B8]">No data found</div>
            ) : levels.map((level) => (
              <div
                key={level.id}
                className={`grid grid-cols-[50px_1fr_1fr_1fr_120px] items-center px-4 py-4 border border-[#F1F5F9] rounded-2xl transition-all hover:bg-slate-50 ${editingId === level.id ? 'border-blue-500 bg-blue-50/30' : ''
                  }`}
              >
                <div className="flex justify-center"><Checkbox className="w-4 h-4 rounded border-gray-300" /></div>
                <div className="font-medium text-[#535862]">{level.name}</div>
                <div className="text-center text-[#535862]">{level.minHours}</div>
                <div className="text-center text-[#535862]">{level.maxHours}</div>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEditInit(level)} className="text-[#94A3B8] hover:text-blue-600 hover:bg-blue-50 cursor-pointer">
                    <Edit2 size={18} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(level.id, level.name)} className="text-[#94A3B8] hover:text-red-600 hover:bg-red-50 cursor-pointer">
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>
            ))}
          </div>


          {totalPages > 1 && (
            <div className="flex justify-center mt-2">
              <Pagination
                currentPage={pageNumber}
                totalPages={totalPages}
                onPageChange={setPageNumber}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

