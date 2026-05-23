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
  }, [pageNumber, pageSize, collegeId, searchValue]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      await axiosInstance.delete(`${API_BASE}/${collegeId}/services/${id}`);
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
        className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm font-medium"
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
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value
                }))
              }
              className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm font-medium resize-none"
            />
          </div>

          <button className="w-full bg-blue-600 text-white py-3 rounded-[12px] font-semibold">
            {editingId ? "Save Changes" : "Add"}
          </button>
        </form>
      </div>

      {/* LIST */}
      <div className="bg-white rounded-[24px] p-6 border">

        <div className="flex justify-between mb-6">
          <h2 className="text-[22px] font-bold">Services</h2>

          <button className="flex items-center gap-2 px-4 py-2 border rounded-[12px] text-blue-600">
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>

        {/* HEADER */}
        <div className="hidden md:flex px-5 py-4 mb-3 bg-gray-50 rounded-xl">
          <span className="w-1/4 font-bold">Name</span>
          <span className="w-1/2 font-bold">Description</span>
          <span className="w-1/4 font-bold">Price</span>
        </div>

        {/* LIST */}
        <div className="flex flex-col gap-3 mb-8">

          {isLoading && (
            <div className="text-center p-4">Loading...</div>
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
                className="flex flex-col sm:flex-row sm:items-center px-5 py-4 border rounded-xl"
              >
                <span className="w-full sm:w-1/4 font-bold">
                  {item.name}
                </span>

                {/* ✔️ FIXED DESCRIPTION */}
                <span className="w-full sm:w-1/2 text-gray-500 break-words">
                  {truncateDescription(item.description)}
                </span>

                <span className="w-full sm:w-1/4 font-bold">
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