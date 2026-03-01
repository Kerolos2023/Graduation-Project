"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, Pencil, Trash2, Printer } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { Pagination } from "@/components/ui/pagination";

const API_BASE = "/RoomType";

export default function RoomTypePage() {
  const [types, setTypes] = useState<any[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "" });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = `${API_BASE}/all?PageNumber=${pageNumber}&PageSize=${pageSize}${
        searchValue ? `&SearchValue=${searchValue}` : ""
      }`;

      const response = await axiosInstance.get(url);

      setTypes(response.data?.items || []);
      setTotalPages(response.data?.totalPages || 1);
    } catch (err) {
      console.error("Error fetching Room Types:", err);
    } finally {
      setIsLoading(false);
    }
  }, [pageNumber, pageSize, searchValue]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ name: e.target.value });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Please enter a name.");
      return;
    }

    try {
      if (editingId) {
        await axiosInstance.put(`${API_BASE}/${editingId}`, formData);
      } else {
        await axiosInstance.post(API_BASE, formData);
      }

      resetForm();
      fetchData();
    } catch (err) {
      console.error("Error saving Room Type:", err);
      alert("Error saving data.");
    }
  };

  const handleEdit = (type: any) => {
    setEditingId(type.id);
    setFormData({ name: type.name });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this type?")) return;

    try {
      await axiosInstance.delete(`${API_BASE}/${id}`);
      fetchData();
    } catch (err) {
      console.error("Error deleting Room Type:", err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 font-inter pb-8 print:p-0">
      <div className="bg-white rounded-[24px] p-6 shadow border border-[#eaebf0] print:hidden">
        <h1 className="text-xl font-bold text-gray-900 mb-6">
          {editingId ? "Edit Room Type" : "Add Room Type"}
        </h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[13px] font-bold text-gray-900 ml-1">
              Name
            </label>
            <input
              type="text"
              placeholder="Ex: Lab"
              className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-[12px] transition-all shadow-sm cursor-pointer"
          >
            {editingId ? "Save Changes" : "Add"}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-[24px] p-6 shadow border border-[#eaebf0]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 print:hidden">
          <div className="flex items-center gap-3">
            <h2 className="text-[22px] font-bold text-gray-900">
              Room Types
            </h2>
            <span className="bg-[#eff4ff] text-blue-600 text-[11px] font-bold px-3 py-1.5 rounded-full border border-blue-100">
              {types.length} Types
            </span>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-[280px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  setPageNumber(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-[12px] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm font-medium"
              />
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 px-4 py-2.5 min-w-[90px] rounded-[12px] border border-blue-200 text-blue-600 font-semibold hover:bg-blue-50 transition-colors bg-white text-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200 text-gray-600">
                <th className="py-3 px-4 font-semibold">Name</th>
                <th className="py-3 px-4 font-semibold text-right print:hidden">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={2} className="text-center py-6 text-gray-500">
                    Loading...
                  </td>
                </tr>
              )}

              {!isLoading && types.length === 0 && (
                <tr>
                  <td
                    colSpan={2}
                    className="text-center py-6 text-gray-400"
                  >
                    No types found.
                  </td>
                </tr>
              )}

              {!isLoading &&
                types.map((type) => (
                  <tr
                    key={type.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4 font-semibold text-gray-900">
                      {type.name}
                    </td>

                    <td className="py-4 px-4 text-right print:hidden">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(type)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(type.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-center pt-6 print:hidden">
          <Pagination
            currentPage={pageNumber}
            totalPages={totalPages}
            onPageChange={setPageNumber}
          />
        </div>
      </div>
    </div>
  );
}