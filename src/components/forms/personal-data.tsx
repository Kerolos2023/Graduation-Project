"use client";

import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";
import { useStudentContext } from "@/hooks/useStudentContext";

export default function PersonalData() {
  const collegeId = "019c1ea6-1738-71cb-8cfd-a90e126d177e";
  const { studentId, setIsEditPopupOpen } = useStudentContext();

  const [formData, setFormData] = useState({
    name: "",
    studentCode: "",
    nationalIdOrPassport: "",
    religion: "",
    gender: "",
    maritalStatus: "",
    dateOfBirth: "",
    placeOfBirth: "",
    nationality: "",
  });

  // ✅ LABEL MAPPING (ONLY ADDITION)
  const getLabel = (key: string) => {
    const labels: Record<string, string> = {
      name: "Name",
      studentCode: "Student Code",
      nationalIdOrPassport: "National ID / Passport",
      religion: "Religion",
      gender: "Gender",
      maritalStatus: "Marital Status",
      dateOfBirth: "Date of Birth",
      placeOfBirth: "Place of Birth",
      nationality: "Nationality",
    };

    return labels[key] || key;
  };

  useEffect(() => {
    if (!studentId) return;

    const fetchData = async () => {
      const res = await axiosInstance.get(
        `/colleges/${collegeId}/students/${studentId}/personal-data`
      );

      setFormData({
        name: res.data.name || "",
        studentCode: res.data.studentCode || "",
        nationalIdOrPassport: res.data.nationalIdOrPassport || "",
        religion: res.data.religion || "",
        gender: res.data.gender || "",
        maritalStatus: res.data.maritalStatus || "",
        dateOfBirth: res.data.dateOfBirth || "",
        placeOfBirth: res.data.placeOfBirth || "",
        nationality: res.data.nationality || "",
      });
    };

    fetchData();
  }, [studentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await axiosInstance.put(
      `/colleges/${collegeId}/students/${studentId}/personal-data`,
      formData
    );

    setIsEditPopupOpen(false);
  };

  return (
  <div className="bg-white p-9 shadow-sm rounded-[20px]"> 
      <form
      onSubmit={handleSubmit}
      className="bg-white rounded-[20px] p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 "
    >
      {Object.entries(formData).map(([key, value]) => (
        <div key={key} className="flex flex-col gap-1">
          
          {/* ✅ FIXED LABEL */}
          <label className="text-sm text-gray-500">
            {getLabel(key)}
          </label>

          <input
            type={key === "dateOfBirth" ? "date" : "text"}
            value={value}
            onChange={(e) =>
              setFormData({ ...formData, [key]: e.target.value })
            }
            className="border border-gray-200 rounded-xl px-3 py-2"
          />
        </div>
      ))}

      <button className="col-span-full bg-blue-600 text-white py-3 rounded-xl">
        Update
      </button>
    </form>
  </div>
  );
}