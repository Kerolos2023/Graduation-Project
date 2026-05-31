"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Search, Pencil, Trash2, X, Loader2 } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { COLLEGE_ID as collegeId } from "@/lib/constants";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const API_BASE = "/colleges";

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
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
    description: "",
    price: ""
  });
  
  const formRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchValue]);

  // FETCH DATA
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = `${API_BASE}/${collegeId}/services?pageNumber=${pageNumber}&pageSize=${pageSize}${
        debouncedSearch ? `&searchValue=${debouncedSearch}` : ""
      }`;

      const response = await axiosInstance.get(url);

      setServices(response.data?.items || []);
      setTotalPages(response.data?.totalPages || 1);
    } catch (err) {
      console.error("Error fetching services:", err);
      alert("Failed to fetch services.");
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: "", description: "", price: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.description || !formData.price) {
      alert("Please fill all fields.");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: Number(formData.price)
    };

    try {
      if (editingId) {
        await axiosInstance.put(
          `${API_BASE}/${collegeId}/services/${editingId}`,
          payload
        );
      } else {
        await axiosInstance.post(
          `${API_BASE}/${collegeId}/services`,
          payload
        );
      }

      resetForm();
      fetchData();
    } catch (err) {
      console.error("Error saving service:", err);
      alert("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString()
    });

    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete?")) return;

    try {
      await axiosInstance.delete(
        `${API_BASE}/${collegeId}/services/${id}`
      );
      fetchData();
    } catch (err) {
      console.error("Error deleting:", err);
      alert("Delete failed.");
    }
  };

  const truncateDescription = (text: string) => {
    if (!text) return "";
    const words = text.split(" ");
    return words.length > 5
      ? words.slice(0, 5).join(" ") + "..."
      : text;
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
        value={formData[name]}
        onChange={handleInputChange}
        className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm font-medium h-auto"
      />
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col gap-6 font-inter pb-8">

      {/* ── Form Card ── */}
      <div ref={formRef} className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0] shrink-0 scroll-mt-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-gray-900">
            {editingId ? "Edit Service" : "Adding Services"}
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
            {renderInputField("Service Name", "name", "Ex: Cleaning")}
            {renderInputField("Price", "price", "Ex: 300")}
          </div>

          <div className="flex flex-col gap-1.5 w-full mb-6">
            <label className="text-[13px] font-bold text-gray-900 ml-1">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="Service description..."
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm font-medium resize-none"
            />
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

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-[22px] font-bold text-gray-900 leading-none">
              Services
            </h2>
            <Badge className="bg-[#eff4ff] text-blue-600 text-[11px] font-bold px-3 py-1.5 rounded-full border border-blue-100 hover:bg-[#eff4ff] shadow-none">
              {services.length} Services
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

        {/* TABLE HEADER */}
        <div className="hidden md:flex items-center w-full px-5 py-4 mb-3 border border-gray-100 bg-[#fafafa] rounded-xl gap-4">
          <span className="w-1/4 font-bold text-gray-800">Name</span>
          <span className="w-1/2 font-bold text-gray-800">Description</span>
          <span className="w-1/4 font-bold text-gray-800 text-center">Price</span>
          <div className="w-[80px]"></div>
        </div>

        {/* LIST ROWS */}
        <div className="flex flex-col gap-3 mb-8">
          {isLoading ? (
            <div className="text-center p-4 text-gray-500 text-sm">
              <Loader2 className="w-5 h-5 animate-spin inline-block mr-2 text-blue-600" /> Loading...
            </div>
          ) : services.length === 0 ? (
            <div className="text-center p-8 text-gray-400 border border-gray-100 rounded-xl border-dashed">
              No services found.
            </div>
          ) : (
            services.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "flex flex-col sm:flex-row sm:items-center w-full px-5 py-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-white gap-3 sm:gap-4 relative group",
                  editingId === item.id && "bg-blue-50/50 border-blue-200"
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 flex-1 w-full">
                  <div className="w-full sm:w-1/4 truncate">
                    <span className="text-[10px] uppercase font-bold text-gray-400 sm:hidden block mb-1">Name</span>
                    <span className="text-[14px] font-bold text-gray-900 truncate">{item.name}</span>
                  </div>

                  <div className="w-full sm:w-1/2 truncate">
                    <span className="text-[10px] uppercase font-bold text-gray-400 sm:hidden block mb-1">Description</span>
                    <span className="text-[14px] text-gray-500 truncate">{truncateDescription(item.description)}</span>
                  </div>

                  <div className="w-full sm:w-1/4 sm:text-center truncate">
                    <span className="text-[10px] uppercase font-bold text-gray-400 sm:hidden block mb-1">Price</span>
                    <span className="text-[14px] font-bold text-gray-900">{item.price} EGP</span>
                  </div>
                </div>

                {/* Actions Container */}
                <div className="flex items-center justify-end gap-2 absolute right-4 top-4 sm:relative sm:right-auto sm:top-auto">
                  <button
                    type="button"
                    onClick={() => handleEdit(item)}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors bg-white cursor-pointer"
                  >
                    <Pencil className="w-[18px] h-[18px]" strokeWidth={2.5} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors bg-white cursor-pointer"
                  >
                    <Trash2 className="w-[18px] h-[18px]" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* PAGINATION */}
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