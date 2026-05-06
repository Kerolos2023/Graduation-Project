"use client";

import { useState } from "react";
import axiosInstance from "@/lib/axios";
import { COLLEGE_ID as collegeId } from "@/lib/constants";

type Semester = {
  termType: string;
  startDate: string;
  endDate: string;
};

type AcademicYearForm = {
  startDate: string;
  endDate: string;
  semesters: Semester[];
};

export default function StartNewYearConfiguration() {


  const [form, setForm] = useState<AcademicYearForm>({
    startDate: "",
    endDate: "",
    semesters: [
      { termType: "Fall", startDate: "", endDate: "" },
      { termType: "Spring", startDate: "", endDate: "" },
      { termType: "Summer", startDate: "", endDate: "" },
    ],
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ================= VALIDATION =================
  const validateForm = (form: AcademicYearForm) => {
    if (!form.startDate || !form.endDate) {
      return "Please fill start and end dates";
    }

    if (new Date(form.startDate) >= new Date(form.endDate)) {
      return "End date must be after start date";
    }

    for (let i = 0; i < form.semesters.length; i++) {
      const s = form.semesters[i];

      if (!s.startDate || !s.endDate) {
        return `Fill dates for ${s.termType}`;
      }

      if (new Date(s.startDate) >= new Date(s.endDate)) {
        return `${s.termType}: end must be after start`;
      }

      if (
        new Date(s.startDate) < new Date(form.startDate) ||
        new Date(s.endDate) > new Date(form.endDate)
      ) {
        return `${s.termType} is outside academic year range`;
      }

      for (let j = i + 1; j < form.semesters.length; j++) {
        const next = form.semesters[j];

        if (
          new Date(s.startDate) <= new Date(next.endDate) &&
          new Date(next.startDate) <= new Date(s.endDate)
        ) {
          return `${s.termType} overlaps with ${next.termType}`;
        }
      }
    }

    return null;
  };

  // ================= HANDLERS =================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof AcademicYearForm,
    index?: number
  ) => {
    if (field === "semesters" && typeof index === "number") {
      const newSemesters = [...form.semesters];
      newSemesters[index] = {
        ...newSemesters[index],
        [e.target.name]: e.target.value,
      };
      setForm({ ...form, semesters: newSemesters });
    } else {
      setForm({ ...form, [field]: e.target.value });
    }
  };

  const handleSubmit = async () => {
    const errorMsg = validateForm(form);

    if (errorMsg) {
      alert(errorMsg);
      return;
    }

    try {
      setLoading(true);
      setSuccess(false);

      const payload = {
        ...form,
        name: `${form.startDate.split("-")[0]}-${form.endDate.split("-")[0]}`,
      };

      await axiosInstance.post(
        `/colleges/${collegeId}/academic-years`,
        payload
      );

      setSuccess(true);

      // reset form
      setForm({
        startDate: "",
        endDate: "",
        semesters: [
          { termType: "Fall", startDate: "", endDate: "" },
          { termType: "Spring", startDate: "", endDate: "" },
          { termType: "Summer", startDate: "", endDate: "" },
        ],
      });
    } catch (error: any) {
      console.error(error.response?.data);
      alert("Failed to save academic year");
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================
  return (
    <div className="min-h-screen bg-[#f5f5f7] p-4 md:p-6">
      <div className="mx-auto w-full max-w-[1080px] rounded-[22px] border border-[#e5e7eb] bg-white p-5 md:p-7 shadow-sm">
        <h1 className="text-[20px] font-semibold text-[#1f2937] md:text-[24px] mb-6">
          Start New Year Configuration
        </h1>

        {/* SUCCESS MESSAGE */}
        {success && (
          <div className="mb-4 rounded-[12px] bg-green-100 text-green-700 px-4 py-3 text-sm font-medium">
            Academic year created successfully
          </div>
        )}

        {/* Start / End */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block mb-2 text-sm font-medium text-[#111827]">
              Start Date
            </label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => handleChange(e, "startDate")}
              className="h-[48px] w-full rounded-[16px] border border-[#e5e7eb] px-5 text-sm outline-none focus:border-[#2563eb]"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-[#111827]">
              End Date
            </label>
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
              <label className="block mb-2 text-sm font-medium text-[#111827]">
                Name
              </label>
              <input
                type="text"
                name="termType"
                value={semester.termType}
                readOnly
                className="h-[48px] w-full rounded-[16px] border border-[#e5e7eb] px-5 text-sm bg-[#f9fafb]"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-[#111827]">
                Start
              </label>
              <input
                type="date"
                name="startDate"
                value={semester.startDate}
                onChange={(e) => handleChange(e, "semesters", idx)}
                className="h-[48px] w-full rounded-[16px] border border-[#e5e7eb] px-5 text-sm outline-none focus:border-[#2563eb]"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-[#111827]">
                End
              </label>
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