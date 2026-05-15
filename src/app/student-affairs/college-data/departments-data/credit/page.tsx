"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Search, Edit2, Trash2, MoreVertical, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { StudyLoadService, StudyLoadResponse } from "@/services/studyLoadServices";
import CollegeDataTabs from "@/components/departmentsTabs";

export default function CreditLoadPage() {
  const [data, setData] = useState<StudyLoadResponse[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [levels] = useState([
    { id: "019d633d-de5d-70e7-880e-74fbf767b8d7", name: "Level One" },
    { id: "019d633f-a679-7636-9d5e-79ce2c134d19", name: "Level Two" },
    { id: "019d6342-1347-7462-b31c-4f7cbfdd978f", name: "Level Three" },
    { id: "019d6342-bfe6-7c06-abd1-e3254b492515", name: "Level Four" },
  ]);

  const [formData, setFormData] = useState({
    academicYearId: "019D5A2B-1719-72BB-9D05-981C78B99A14",
    levelId: "",
    semesterType: "",
    minHours: "",
    maxHours: "",
  });

  const PROGRAM_ID = "019D5C67-392B-74A6-8E1F-2221FC6BBF0A";

  const fetchData = useCallback(async () => {
    setFetching(true);
    try {
      const result = await StudyLoadService.getAll(PROGRAM_ID);
      setData(result || []);
    } catch {
      toast.error("Error fetching data");
    } finally {
      setFetching(false);
    }
  }, [PROGRAM_ID]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredData = useMemo(() => {
    return data.filter((item) =>
      item.levelName?.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  const handleSave = async () => {
    if (!formData.levelId || !formData.semesterType || !formData.minHours || !formData.maxHours) {
      toast.warning("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        academicYearId: formData.academicYearId,
        semesterType: formData.semesterType,
        minHours: Number(formData.minHours),
        maxHours: Number(formData.maxHours),
      };

      if (editingId) {
        await StudyLoadService.update(PROGRAM_ID, editingId, payload);
        toast.success("Updated successfully");
      } else {
        await StudyLoadService.add(PROGRAM_ID, formData.levelId, payload);
        toast.success("Added successfully");
      }

      setEditingId(null);
      setFormData({ ...formData, levelId: "", semesterType: "", minHours: "", maxHours: "" });
      fetchData();
    } catch (error: any) {
      toast.error("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: StudyLoadResponse) => {
    setEditingId(item.id);
    setFormData({
      academicYearId: "019D5A2B-1719-72BB-9D05-981C78B99A14",
      levelId: item.levelId,
      semesterType: item.semesterName,
      minHours: item.minHours.toString(),
      maxHours: item.maxHours.toString(),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await StudyLoadService.remove(PROGRAM_ID, id);
      toast.success("Deleted successfully");
      fetchData();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-10 bg-[#F5F5F5] min-h-screen">
      <CollegeDataTabs />

       <div className="bg-[#FFFFFF] p-5 md:p-8 rounded-[20px] md:rounded-[24px] shadow-sm border border-[#E9EAEB]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg md:text-xl font-bold text-[#0A0D12]">
            {editingId ? "Update Credit Load" : "Add Credit Load"}
          </h2>
          {editingId && (
            <Button variant="ghost" size="sm" onClick={() => { setEditingId(null); setFormData({ ...formData, levelId: '', semesterType: '', minHours: '', maxHours: '' }); }} className="text-red-500 hover:bg-red-50 h-8">
              <X size={14} className="mr-1" /> <span className="text-xs">Cancel Edit</span>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[#090909]">Semester</label>
            <Select value={formData.semesterType} onValueChange={v => setFormData({ ...formData, semesterType: v })}>
              <SelectTrigger className="h-11 rounded-xl border-slate-200 focus:ring-blue-600 bg-white">
                <SelectValue placeholder="Select Semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fall">Fall</SelectItem>
                <SelectItem value="Spring">Spring</SelectItem>
                <SelectItem value="Summer">Summer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[#090909]">Level</label>
            <Select value={formData.levelId} onValueChange={v => setFormData({ ...formData, levelId: v })}>
              <SelectTrigger className="h-11 rounded-xl border-slate-200 focus:ring-blue-600 bg-white">
                <SelectValue placeholder="Select Level" />
              </SelectTrigger>
              <SelectContent>
                {levels.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[#090909]">Minimum Credit Hours</label>
            <Input
              type="number"
              placeholder="e.g. 12"
              value={formData.minHours}
              onChange={e => setFormData({ ...formData, minHours: e.target.value })}
              className="h-11 rounded-xl border-slate-200 focus-visible:ring-blue-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[#090909]">Maximum Credit Hours</label>
            <Input
              type="number"
              placeholder="e.g. 18"
              value={formData.maxHours}
              onChange={e => setFormData({ ...formData, maxHours: e.target.value })}
              className="h-11 rounded-xl border-slate-200 focus-visible:ring-blue-600"
            />
          </div>
        </div>

        <Button
          className={`w-full h-11 cursor-pointer font-semibold rounded-xl transition-all ${editingId ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? <Loader2 className="animate-spin" /> : editingId ? "Save Changes" : "Add Level"}
        </Button>
      </div>

       <div className="bg-white p-4 md:p-8 rounded-[20px] md:rounded-[24px] shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold text-[#0A0D12]">Levels</h2>
            <Badge className="bg-blue-50 text-blue-600 border-none px-3 py-1 rounded-full text-xs font-bold">
              {filteredData.length} Levels
            </Badge>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10 border-slate-200 rounded-xl focus-visible:ring-slate-300 w-full"
              />
            </div>
           
          </div>
        </div>

         <div className="hidden md:grid grid-cols-[50px_2fr_1fr_1fr_120px] px-6 py-4 bg-slate-50 rounded-xl mb-4 text-sm font-semibold text-[#181D27]  tracking-wider">
          <div className="flex justify-center"></div>
          <div>Name</div>
          <div className="text-center">Min</div>
          <div className="text-center">Max</div>
          <div className="text-right">Actions</div>
        </div>

         <div className="space-y-4 md:space-y-2">
          {fetching ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-16 text-slate-400 border-2 border-dashed border-slate-50 rounded-2xl">
              No study loads found.
            </div>
          ) : (
            filteredData.map((row) => (
              <div
                key={row.id}
                className="flex flex-col md:grid md:grid-cols-[50px_2fr_1fr_1fr_120px] items-start md:items-center px-4 md:px-6 py-4 border border-slate-100 md:border-transparent md:hover:bg-slate-50 rounded-2xl transition-all gap-3 md:gap-0 bg-white md:bg-transparent shadow-sm md:shadow-none"
              >
                <div className="flex justify-between items-center w-full md:w-auto md:justify-center">
                  <div className="w-4 h-4" /> 
                  <div className="md:hidden flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(row)} className="h-9 w-9 text-blue-500 bg-blue-50/50">
                      <Edit2 size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(row.id)} className="h-9 w-9 text-red-500 bg-red-50/50">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col md:block">
                  <span className="text-[10px] uppercase font-bold text-slate-400 md:hidden mb-1">Level</span>
                  <div className="font-bold md:font-medium text-slate-800 text-base md:text-sm truncate">
                    {row.levelName} <span className="text-xs text-slate-400 font-normal ml-1">({row.semesterName})</span>
                  </div>
                </div>

                <div className="flex flex-col md:text-center w-full md:w-auto">
                  <span className="text-[10px] uppercase font-bold text-slate-400 md:hidden mb-1">Min Hours</span>
                  <div className="text-slate-600 text-sm font-semibold md:font-normal">{row.minHours}</div>
                </div>

                <div className="flex flex-col md:text-center w-full md:w-auto">
                  <span className="text-[10px] uppercase font-bold text-slate-400 md:hidden mb-1">Max Hours</span>
                  <div className="text-slate-600 text-sm font-semibold md:font-normal">{row.maxHours}</div>
                </div>

                <div className="hidden md:flex justify-end gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(row)} className="h-8 w-8 cursor-pointer text-blue-500 hover:bg-blue-100 transition-colors">
                    <Edit2 size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(row.id)} className="h-8 w-8 cursor-pointer text-red-500 hover:bg-red-100 transition-colors">
                    <Trash2 size={16} />
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