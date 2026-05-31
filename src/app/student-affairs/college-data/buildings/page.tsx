"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Search, Pencil, Trash2, X, Loader2 } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const API_BASE = "/buildings";

export default function BuildingsPage() {
  const [buildings, setBuildings] = useState<any[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchValue]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = `${API_BASE}?PageNumber=${pageNumber}&PageSize=${pageSize}${debouncedSearch ? `&SearchValue=${debouncedSearch}` : ""
        }`;

      const response = await axiosInstance.get(url);

      setBuildings(response.data?.items || []);
      setTotalPages(response.data?.totalPages || 1);
    } catch (err) {
      console.error("Error fetching buildings:", err);
      alert("Failed to fetch buildings. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  }, [pageNumber, pageSize, debouncedSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    setPageNumber(1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: "", code: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.code.trim()) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    const payload = {
      id: editingId,
      name: formData.name.trim(),
      code: formData.code.trim(),
    };

    try {
      if (editingId) {
        await axiosInstance.put(`${API_BASE}/${editingId}`, payload);
      } else {
        await axiosInstance.post(API_BASE, payload);
      }

      resetForm();
      fetchData();
    } catch (err: any) {
      const status = err.response?.status;

      if (status === 409) {
        setErrorMessage("A building with this name or code already exists");
      } else if (status === 401) {
        setErrorMessage("Unauthorized. Please login again.");
      } else if (status === 400) {
        setErrorMessage("Bad Request. Please check the data and try again.");
      } else {
        console.error("Error saving building:", err);
        setErrorMessage("Something went wrong. Check console for details.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (building: any) => {
    setEditingId(building.id);
    setFormData({
      name: building.name,
      code: building.code,
    });

    topRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this building?")) return;

    try {
      await axiosInstance.delete(`${API_BASE}/${id}`);
      fetchData();
    } catch (err) {
      console.error("Error deleting building:", err);
      setErrorMessage("Failed to delete building. Check console for details.");
    }
  };

  const renderInputField = (
    label: string,
    name: keyof typeof formData,
    placeholder: string
  ) => (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-[13px] font-bold text-gray-900 ml-1">
        {label}
      </label>

      <input
        type="text"
        name={name}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm font-medium h-auto"
        value={formData[name]}
        onChange={handleInputChange}
      />
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col gap-6 font-inter pb-8">
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage("")} className="cursor-pointer opacity-50 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Form Card ── */}
      <div ref={topRef} className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0] shrink-0 scroll-mt-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-gray-900">
            {editingId ? "Edit Building" : "Adding Buildings"}
          </h1>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-red-500 hover:bg-red-50 rounded-xl text-xs font-bold h-8 px-3 cursor-pointer flex items-center transition-colors gap-1"
            >
              <X size={14} className="mr-1" /> <span>Cancel Edit</span>
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {renderInputField("Building Name", "name", "Ex: Engineering")}
            {renderInputField("Building Code", "code", "Ex: C51")}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "w-full text-white font-semibold py-3.5 rounded-[12px] transition-all shadow-sm cursor-pointer flex items-center justify-center text-sm active:scale-[0.99]",
              editingId ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"
            )}
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : editingId ? "Save Changes" : "Add"}
          </button>
        </form>
      </div>

      {/* ── List Card ── */}
      <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-[22px] font-bold text-gray-900 leading-none">
              Buildings
            </h2>

            <Badge className="bg-[#eff4ff] text-blue-600 text-[11px] font-bold px-3 py-1.5 rounded-full border border-blue-100 hover:bg-[#eff4ff] shadow-none">
              {buildings.length} Buildings
            </Badge>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-[280px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchValue}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-[12px] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm font-medium h-auto"
              />
            </div>
          </div>
        </div>

        {/* Table Header */}
        <div className="hidden md:flex items-center w-full px-5 py-4 mb-3 border border-gray-100 bg-[#fafafa] rounded-xl gap-4">
          <div className="flex items-center gap-4 flex-1">
            <span className="text-[13px] font-bold text-gray-800 w-1/2">Name</span>
            <span className="text-[13px] font-bold text-gray-800 w-1/4">Code</span>
          </div>
          <div className="w-[80px]"></div>
        </div>

        {/* Rows Container */}
        <div className="flex flex-col gap-3 mb-8">
          {isLoading ? (
            <div className="text-center p-4 text-gray-500 text-sm">
              <Loader2 className="w-5 h-5 animate-spin inline-block mr-2 text-blue-600" /> Loading...
            </div>
          ) : buildings.length === 0 ? (
            <div className="text-center p-8 text-gray-400 border border-gray-100 rounded-xl border-dashed">
              No buildings found.
            </div>
          ) : (
            buildings.map((building) => (
              <div
                key={building.id}
                className={cn(
                  "flex flex-col sm:flex-row sm:items-center w-full px-5 py-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-white gap-3 sm:gap-4 relative group",
                  editingId === building.id && "bg-blue-50/50 border-blue-200"
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 flex-1 w-full">
                  <div className="w-full sm:w-1/2 truncate">
                    <span className="text-[10px] uppercase font-bold text-gray-400 sm:hidden block mb-1">Name</span>
                    <span className="text-[14px] font-bold text-gray-900 truncate">{building.name}</span>
                  </div>

                  <div className="w-full sm:w-1/4 truncate">
                    <span className="text-[10px] uppercase font-bold text-gray-400 sm:hidden block mb-1">Code</span>
                    <span className="text-[14px] font-bold text-gray-500 sm:text-gray-900 truncate">{building.code}</span>
                  </div>
                </div>

                {/* Actions Container */}
                <div className="flex items-center justify-end gap-2 absolute right-4 top-4 sm:relative sm:right-auto sm:top-auto">
                  <button
                    onClick={() => handleEdit(building)}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors bg-white cursor-pointer"
                  >
                    <Pencil className="w-[18px] h-[18px]" strokeWidth={2.5} />
                  </button>

                  <button
                    onClick={() => handleDelete(building.id)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors bg-white cursor-pointer"
                  >
                    <Trash2 className="w-[18px] h-[18px]" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            ))
          )}
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
  );
}