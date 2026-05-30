"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, Printer, Pencil, Trash2 } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { COLLEGE_ID as collegeId } from "@/lib/constants";
import { Pagination } from "@/components/ui/pagination";

const API_BASE = "/colleges";

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: ""
  });

  // FETCH DATA (same logic)
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = `${API_BASE}/${collegeId}/services?pageNumber=${pageNumber}&pageSize=${pageSize}${
        searchValue ? `&searchValue=${searchValue}` : ""
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
  }, [pageNumber, pageSize, searchValue]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      setPageNumber(1);
      fetchData();
    } catch (err) {
      console.error("Error saving service:", err);
      alert("Something went wrong.");
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString()
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
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
        className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm font-medium"
      />
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col gap-6 font-inter pb-8">

      {/* FORM */}
      <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0]">
        <h1 className="text-xl font-bold text-gray-900 mb-6">
          {editingId ? "Edit Service" : "Add Service"}
        </h1>

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
              rows={4}
              placeholder="Service description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm font-medium resize-none"
            />
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-[12px] font-semibold">
            {editingId ? "Save Changes" : "Add"}
          </button>
        </form>
      </div>

      {/* LIST */}
      <div className="bg-white rounded-[24px] p-6 border">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-[22px] font-bold text-gray-900 inline me-3">
            Services
          </h2>
          <span className="bg-[#eff4ff] text-blue-600 text-[11px] font-bold px-3 py-1.5 rounded-full border border-blue-100">
              {services.length} Services
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


          </div>
        </div>

        {/* TABLE HEADER */}
        <div className="hidden md:flex px-5 py-4 mb-3 bg-gray-50 rounded-xl">
          <span className="w-1/4 font-bold text-gray-800">Name</span>
          <span className="w-1/2 font-bold text-gray-800">Description</span>
          <span className="w-1/4 font-bold text-gray-800">Price</span>
        </div>

        {/* LIST */}
        <div className="flex flex-col gap-3 mb-8">

          {isLoading && (
            <div className="text-center p-4 text-gray-500">
              Loading...
            </div>
          )}

          {!isLoading && services.length === 0 && (
            <div className="text-center p-6 text-gray-400">
              No services found
            </div>
          )}

          {!isLoading &&
            services.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center px-5 py-4 border border-gray-100 rounded-xl bg-white"
              >
                <span className="w-full sm:w-1/4 font-bold text-gray-900">
                  {item.name}
                </span>

                <span className="w-full sm:w-1/2 text-gray-500">
                  {truncateDescription(item.description)}
                </span>

                <span className="w-full sm:w-1/4 font-bold text-gray-900">
                  {item.price} EGP
                </span>

                <div className="flex gap-2 ml-auto">
                  <button onClick={() => handleEdit(item)}>
                    <Pencil className="w-[18px] h-[18px] text-gray-500 hover:text-blue-600" />
                  </button>

                  <button onClick={() => handleDelete(item.id)}>
                    <Trash2 className="w-[18px] h-[18px] text-gray-500 hover:text-red-600" />
                  </button>
                </div>
              </div>
            ))}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center">
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