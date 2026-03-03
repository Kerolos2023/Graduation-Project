



"use client";

import { useEffect, useState, useCallback } from "react";
import { gradeService, GradeSetting } from "@/services/gradeServices";
import { Pagination } from '@/components/ui/pagination';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Pencil, Loader, Search, Printer, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export default function GradesPage() {
  const [grades, setGrades] = useState<GradeSetting[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFetchLoading, setIsFetchLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [formData, setFormData] = useState<GradeSetting>({
    name: "",
    code: "",
    minScore: 0,
    maxScore: 0,
  });

  const loadData = useCallback(async () => {
    setIsFetchLoading(true);
    try {
      const response = await gradeService.getAll({
        PageNumber: pageNumber,
        PageSize: pageSize,
        ...(searchValue ? { SearchValue: searchValue } : {})
      });
      const resData = response.data?.data || response.data?.items || response.data || [];
      const resTotalPages = response.data?.totalPages || response.data?.meta?.totalPages || 1;

      setGrades(Array.isArray(resData) ? resData : []);
      setTotalPages(resTotalPages);
    } catch {
      toast.error("Failed to fetch grades");
    } finally {
      setIsFetchLoading(false);
    }
  }, [pageNumber, pageSize, searchValue]);

  useEffect(() => { loadData(); }, [loadData]);

  const hasOverlap = (min: number, max: number) => {
    return grades.some((g) => {
      if (isEditing && g.id === editId) return false;
      return min <= g.maxScore && max >= g.minScore;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.minScore > formData.maxScore) {
      toast.error("Min score must be less than Max score");
      return;
    }
    if (hasOverlap(formData.minScore, formData.maxScore)) {
      toast.error("Score range overlaps with existing grade");
      return;
    }
    setLoading(true);
    try {
      if (isEditing && editId) {
        await gradeService.update(editId, formData);
        toast.success("Updated successfully");
      } else {
        await gradeService.create(formData);
        toast.success("Added successfully");
      }

      await loadData();
      resetForm();
    } catch (error: any) {
      console.log("STATUS:", error.response?.status);
      console.log("FULL ERROR:", error.response?.data);

      if (error.response?.status === 409) {
        await loadData();
      }

      toast.error(
        error.response?.data?.title ||
        error.response?.data?.message ||
        "Conflict happened"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await gradeService.delete(id);
      toast.success("Deleted successfully");
      loadData();
    } catch {
      toast.error("Delete failed");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", code: "", minScore: 0, maxScore: 0 });
    setIsEditing(false);
    setEditId(null);
  };

  const startEdit = (grade: GradeSetting) => {
    setFormData(grade);
    setEditId(grade.id!);
    setIsEditing(true);
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px]">
        <CardContent className="p-8">
          <h2 className="text-xl font-bold mb-6 text-[#0A0D12]">Grades</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#090909]">Symbol</label>
                <Input
                  placeholder="Placeholder"
                  className="bg-white border-[#E9EAEB] h-12 rounded-xl focus-visible:ring-blue-600"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#090909]">Min</label>
                <Input
                  type="number"
                  placeholder="Placeholder"
                  className="bg-white border-[#E9EAEB] h-12 rounded-xl focus-visible:ring-blue-600"
                  value={formData.minScore}
                  onChange={(e) => setFormData({ ...formData, minScore: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#090909]">Max</label>
                <Input
                  type="number"
                  placeholder="Placeholder"
                  className="bg-white border-[#E9EAEB] h-12 rounded-xl focus-visible:ring-blue-600"
                  value={formData.maxScore}
                  onChange={(e) => setFormData({ ...formData, maxScore: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1A1C1E]">Equivalent Grade</label>
              <Input
                placeholder="Placeholder"
                className="bg-white border-[#E9EAEB] h-12 rounded-xl focus-visible:ring-blue-600 "
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer bg-[#2563EB] hover:bg-blue-700 h-12 rounded-xl text-white font-bold transition-all"
            >
              {loading ? <Loader className="animate-spin" /> : (isEditing ? "Save Changes" : "Add")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-[#0A0D12]">Grades</h2>
              <span className="bg-[#EBF2FF] text-[#2563EB] text-xs font-medium px-3 py-1 rounded-full">100 Room</span>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className=" cursor-pointer absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                <Input
                  placeholder="Search"
                  value={searchValue}
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                    setPageNumber(1);
                  }}
                  className="pl-10 h-11 border-[#E2E8F0] rounded-xl"
                />
              </div>
              <Button variant="outline" className="h-11 cursor-pointer border-[#E2E8F0] text-[#2563EB] gap-2 rounded-xl px-5">
                <Printer className="h-4 w-4 " /> Print
              </Button>
              <Button variant="outline" size="icon" className="h-11 cursor-pointer w-11 border-[#E2E8F0] rounded-xl text-[#94A3B8]">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-[#F1F5F9] overflow-hidden">
            <Table>
              <TableHeader className="bg-[#F8FAFC]">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="w-12 text-center"><Input type="checkbox" className="w-4 h-4 rounded border-gray-300" /></TableHead>
                  <TableHead className="font-medium text-[#181D27]">Name</TableHead>
                  <TableHead className="font-bold text-[#181D27]">Symbol</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isFetchLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-20"><Loader className="animate-spin mx-auto text-blue-600" /></TableCell></TableRow>
                ) : grades.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-20 text-[#94A3B8]">No data found</TableCell></TableRow>
                ) : grades.map((grade) => (
                  <TableRow key={grade.id} className="border-b border-[#F1F5F9] last:border-0 hover:bg-slate-50 transition-colors">
                    <TableCell className="text-center"><Input type="checkbox" className="w-4 h-4 rounded border-gray-300" /></TableCell>
                    <TableCell className="font-medium text-[#475569]">{grade.name}</TableCell>
                    <TableCell className="font-medium text-[#475569]">{grade.code}</TableCell>
                    <TableCell className="text-right space-x-2 p-4">
                      <Button size="icon" variant="ghost" onClick={() => startEdit(grade)} className="text-[#94A3B8] hover:text-blue-600 cursor-pointer hover:bg-blue-50">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => grade.id && handleDelete(grade.id)} className="text-[#94A3B8] hover:text-red-600 cursor-pointer hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Component */}
          <div className="flex justify-center pt-4">
            <Pagination
              currentPage={pageNumber}
              totalPages={totalPages}
              onPageChange={setPageNumber}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



