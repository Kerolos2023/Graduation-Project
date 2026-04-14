"use client";

import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";
import { useStudentContext } from "@/hooks/useStudentContext";

export default function ContactInformation() {
  const { studentId, setIsEditPopupOpen } = useStudentContext();

  const [formData, setFormData] = useState({
    city: "",
    address: "",
    postalCode: "",
    phoneNumber: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

  const collegeId = "019c1ea6-1738-71cb-8cfd-a90e126d177e";

  // ✅ FETCH
  useEffect(() => {
    if (!studentId) return;

    const fetchData = async () => {
      const res = await axiosInstance.get(
        `/colleges/${collegeId}/students/${studentId}/contact-data`
      );

      setFormData({
        city: res.data.city || "",
        address: res.data.address || "",
        postalCode: res.data.postalCode || "",
        phoneNumber: res.data.phoneNumber || "",
        email: res.data.email || "",
      });
    };

    fetchData();
  }, [studentId]);

  // ✅ SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentId) return;

    setLoading(true);
    setResponseMessage("");

    try {
      await axiosInstance.put(
        `/colleges/${collegeId}/students/${studentId}/contact-data`,
        formData
      );

      setResponseMessage("Updated successfully ✅");
      setIsEditPopupOpen(false);
    } catch (err: any) {
      setResponseMessage(
        err.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="bg-white p-9 shadow-sm rounded-[20px]"> 
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
    >
      {Object.entries(formData).map(([key, value]) => (
        <div key={key} className="flex flex-col gap-1">
          <label className="text-[13px] text-gray-500 capitalize">
            {key.replace(/([A-Z])/g, " $1")}
          </label>

          <input
            type={key === "email" ? "email" : "text"}
            value={value}
            onChange={(e) =>
              setFormData({ ...formData, [key]: e.target.value })
            }
            className="border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>
      ))}

      <button
        type="submit"
        disabled={loading}
        className="col-span-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl mt-2 transition"
      >
        {loading ? "Updating..." : "Update"}
      </button>

      {responseMessage && (
        <p className="col-span-full text-center text-green-600 text-sm">
          {responseMessage}
        </p>
      )}
    </form>
    </div>
  );
}