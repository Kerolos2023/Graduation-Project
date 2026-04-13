
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Search, Edit2, Trash2, MoreVertical, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-10 bg-[#F5F5F5] min-h-screen ">
         <CollegeDataTabs />

         <div className="bg-[#FFFFFF] p-5 md:p-8 rounded-[20px] md:rounded-[24px] shadow-sm border border-[#E9EAEB]">

         

      
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#0A0D12]">
            {editingId ? "Edit Credit Load" : "Credit Load by Level"}
          </h2>
          {editingId && (
            <Button
              variant="ghost"
              onClick={() => { setEditingId(null); setFormData({ ...formData, levelId: '', semesterType: '', minHours: '', maxHours: '' }); }}
              className="text-red-500 hover:bg-red-50 rounded-xl"
            >
              <X className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">Cancel Edit</span>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-2 flex flex-col">
            <label className="text-xs font-semibold text-[#090909] ml-1">Semester</label>
            <Select value={formData.semesterType} onValueChange={v => setFormData({ ...formData, semesterType: v })}>
              <SelectTrigger className="w-full h-12 rounded-xl border-gray-100 bg-gray-50/50 text-gray-900">
                <SelectValue placeholder="Select Semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fall">Fall</SelectItem>
                <SelectItem value="Spring">Spring</SelectItem>
                <SelectItem value="Summer">Summer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 flex flex-col">
            <label className="text-xs font-semibold text-[#090909] ml-1">Level</label>
            <Select value={formData.levelId} onValueChange={v => setFormData({ ...formData, levelId: v })}>
              <SelectTrigger className="w-full h-12 rounded-xl border-gray-100 bg-gray-50/50 text-gray-900">
                <SelectValue placeholder="Select Level" />
              </SelectTrigger>
              <SelectContent>
                {levels.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 flex flex-col">
            <label className="text-xs font-semibold text-[#090909] ml-1">Minimum Credit Hours</label>
            <Input
              type="number"
              className="w-full h-12 rounded-xl border-gray-100 bg-gray-50/50 placeholder:text-gray-300"
              placeholder="e.g. 12"
              value={formData.minHours}
              onChange={e => setFormData({ ...formData, minHours: e.target.value })}
            />
          </div>

          <div className="space-y-2 flex flex-col">
            <label className="text-xs font-semibold text-[#090909] ml-1">Maximum Credit Hours</label>
            <Input
              type="number"
              className="w-full h-12 rounded-xl border-gray-100 bg-gray-50/50 placeholder:text-gray-300"
              placeholder="e.g. 18"
              value={formData.maxHours}
              onChange={e => setFormData({ ...formData, maxHours: e.target.value })}
            />
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={loading}
          className={`w-full cursor-pointer h-12 rounded-xl font-bold text-white transition-all shadow-sm ${editingId ? 'bg-[#8B5CF6] hover:bg-purple-600' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? (
            <Loader2 className="animate-spin w-5 h-5" />
          ) : editingId ? (
            'Save Changes'
          ) : (
            'Add Level'
          )}
        </Button>
      </section>
      </div>

          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">

        

      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-[#0A0D12]">Levels</h2>
            <span className="bg-blue-50 text-blue-500 text-[10px] font-bold px-3 py-1 rounded-full border border-blue-100">
              {filteredData.length} Levels
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                className="pl-9 h-10 w-full sm:w-64 rounded-xl border-gray-200 bg-white"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="rounded-xl border-gray-200 bg-white shrink-0">
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </Button>
          </div>
        </div>
        

        

        
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {fetching ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>
          ) : filteredData.length === 0 ? (
            <div className="py-10 text-center text-gray-400">No data found</div>
          ) : (
            filteredData.map((row) => (
              <div key={row.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Level Name</h3>
                    <p className="font-bold text-[#181D27] text-lg">{row.levelName}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-blue-600 bg-blue-50 rounded-xl"
                      onClick={() => handleEdit(row)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-red-600 bg-red-50 rounded-xl"
                      onClick={() => handleDelete(row.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Min Hours</span>
                    <p className="text-[#181D27] font-semibold">{row.minHours}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Max Hours</span>
                    <p className="text-[#181D27] font-semibold">{row.maxHours}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-3">
            <thead>
              <tr className="text-left text-[#181D27] text-xs font-semibold uppercase tracking-wider">
                <th className="px-8 py-2">Name</th>
                <th className="px-8 py-2">Min</th>
                <th className="px-8 py-2">Max</th>
                <th className="px-8 py-2 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {fetching ? (
                <tr><td colSpan={4} className="text-center py-20"><Loader2 className="animate-spin mx-auto text-blue-600" /></td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-20 text-gray-400">No data found</td></tr>
              ) : (
                filteredData.map((row) => (
                  <tr key={row.id} className="group shadow-sm hover:shadow-md transition-shadow">
                    <td className="bg-white px-8 py-5 rounded-l-2xl border-y border-l border-gray-100 font-semibold text-[#181D27]">
                      {row.levelName}
                    </td>
                    <td className="bg-white px-8 py-5 border-y border-gray-100 font-semibold text-[#181D27]">
                      {row.minHours}
                    </td>
                    <td className="bg-white px-8 py-5 border-y border-gray-100 font-semibold text-[#181D27]">
                      {row.maxHours}
                    </td>
                    <td className="bg-white px-8 py-5 rounded-r-2xl border-y border-r border-gray-100 text-right">
                      <div className="flex items-center gap-2 justify-end md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                          onClick={() => handleEdit(row)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                          onClick={() => handleDelete(row.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
     </div>
  );
}