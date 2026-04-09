"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";

type Semester = {
  termType: string;
  startDate: string;
  endDate: string;
};

type AcademicYearForm = {
  name: string;
  startDate: string;
  endDate: string;
  semesters: Semester[];
};

type CurrentYear = {
  id: string;
  name: string;
};

export default function StartNewYearConfiguration() {
  const collegeId = "019c1ea6-1738-71cb-8cfd-a90e126d177e";

  const [form, setForm] = useState<AcademicYearForm>({
    name: "",
    startDate: "",
    endDate: "",
    semesters: [
      { termType: "Fall", startDate: "", endDate: "" },
      { termType: "Spring", startDate: "", endDate: "" },
      { termType: "Summer", startDate: "", endDate: "" },
    ],
  });

  const [loading, setLoading] = useState(false);
  const [currentYear, setCurrentYear] = useState<CurrentYear | null>(null);

  // Fetch current academic year
  useEffect(() => {
    const fetchCurrentYear = async () => {
      try {
        const res = await axiosInstance.get(
          `/colleges/${collegeId}/academic-years/current`
        );
        setCurrentYear(res.data);
        // Prefill form name with current year name
        setForm((prev) => ({ ...prev, name: res.data.name }));
      } catch (err) {
        console.error("Failed to fetch current year", err);
      }
    };
    fetchCurrentYear();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof AcademicYearForm,
    index?: number
  ) => {
    if (field === "semesters" && typeof index === "number") {
      const newSemesters = [...form.semesters];
      newSemesters[index] = { ...newSemesters[index], [e.target.name]: e.target.value };
      setForm({ ...form, semesters: newSemesters });
    } else {
      setForm({ ...form, [field]: e.target.value });
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Prepare payload exactly as expected
      const payload: AcademicYearForm = {
        ...form,
        semesters: form.semesters.map((s) => ({
          termType: s.termType,
          startDate: s.startDate,
          endDate: s.endDate,
        })),
      };

      await axiosInstance.post(
        `/colleges/${collegeId}/academic-years`,
        payload
      );
      alert("Academic year saved successfully");
    } catch (error: any) {
      console.error(error.response?.data || error.message);
      alert("Failed to save academic year");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] p-4 md:p-6">
      <div className="mx-auto w-full max-w-[1080px] rounded-[22px] border border-[#e5e7eb] bg-white p-5 md:p-7 shadow-sm">
        <h1 className="text-[20px] font-semibold text-[#1f2937] md:text-[24px] mb-6">
          Start New Year Configuration
        </h1>

        {/* Current Year */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-[#111827]">
            Current Year
          </label>
          <input
            type="text"
            value={currentYear ? currentYear.name : "Loading..."}
            disabled
            className="h-[48px] w-full rounded-[16px] border border-[#e5e7eb] bg-[#f9fafb] px-5 text-sm outline-none"
          />
        </div>

        {/* Academic Year Name / Start / End */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="block mb-2 text-sm font-medium text-[#111827]">Year Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange(e, "name")}
              className="h-[48px] w-full rounded-[16px] border border-[#e5e7eb] px-5 text-sm outline-none focus:border-[#2563eb]"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-[#111827]">Start Date</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => handleChange(e, "startDate")}
              className="h-[48px] w-full rounded-[16px] border border-[#e5e7eb] px-5 text-sm outline-none focus:border-[#2563eb]"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-[#111827]">End Date</label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => handleChange(e, "endDate")}
              className="h-[48px] w-full rounded-[16px] border border-[#e5e7eb] px-5 text-sm outline-none focus:border-[#2563eb]"
            />
          </div>
        </div>

        {/* Semesters */}
        {form.semesters.map((semester, idx) => (
          <div key={idx} className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block mb-2 text-sm font-medium text-[#111827]">Name</label>
              <input
                type="text"
                name="termType"
                value={semester.termType}
                onChange={(e) => handleChange(e, "semesters", idx)}
                className="h-[48px] w-full rounded-[16px] border border-[#e5e7eb] px-5 text-sm outline-none bg-[#f9fafb]"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-[#111827]">Start</label>
              <input
                type="date"
                name="startDate"
                value={semester.startDate}
                onChange={(e) => handleChange(e, "semesters", idx)}
                className="h-[48px] w-full rounded-[16px] border border-[#e5e7eb] px-5 text-sm outline-none focus:border-[#2563eb]"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-[#111827]">End</label>
              <input
                type="date"
                name="endDate"
                value={semester.endDate}
                onChange={(e) => handleChange(e, "semesters", idx)}
                className="h-[48px] w-full rounded-[16px] border border-[#e5e7eb] px-5 text-sm outline-none focus:border-[#2563eb]"
              />
            </div>
          </div>
        ))}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`h-[48px] w-full rounded-[16px] text-sm font-medium text-white ${
            loading ? "bg-gray-400" : "bg-[#2563eb] hover:bg-[#1d4ed8]"
          } transition`}
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}