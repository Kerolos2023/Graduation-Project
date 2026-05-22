"use client";

import { useEffect, useState } from "react";
import { useStudentContext } from "@/hooks/useStudentContext";
import axiosInstance from "@/lib/axios";
import { COLLEGE_ID } from "@/lib/constants";

type AcademicYear = {
  id: string;
  name: string;
};

type GraduationDetails = {
  gpa: number;
  graduationYear: string;
  graduationSemester: "";
  graduationProjectName: string;
};
const TERM_OPTIONS = [
  { value: 1, label: "Fall" },
  { value: 2, label: "Spring" },
  { value: 3, label: "Summer" },
];

export default function GraduationDetailsPage() {
  const { studentId } = useStudentContext();

  const [years, setYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState<GraduationDetails>({
    gpa: 0,
    graduationYear: "",
    graduationSemester: "",
    graduationProjectName: "",
  });

  useEffect(() => {
    if (!studentId) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const graduationRes = await axiosInstance.get(
          `/students/${studentId}/graduation-details`
        );

        setFormData({
          gpa: graduationRes.data?.gpa || 0,
          graduationYear: graduationRes.data?.graduationYear || "",
          graduationSemester:
            graduationRes.data?.graduationSemester || "",
          graduationProjectName:
            graduationRes.data?.graduationProjectName || "",
        });

        const yearsRes = await axiosInstance.get(
          `/colleges/${COLLEGE_ID}/academic-years`,
          {
            params: {
              PageNumber: 1,
              PageSize: 100,
              collegeId: COLLEGE_ID,
            },
          }
        );

        setYears(yearsRes.data?.items || []);
      } catch {
        setErrorMessage("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  const handleSubmit = async () => {
    try {
      if (!studentId) return;

      setErrorMessage(null);
      setSuccessMessage("");

      // 🔥 FIX ONLY: ensure correct payload (NO UI change)
      await axiosInstance.patch(
        `/students/${studentId}/graduation-details`,
        {
          gpa: formData.gpa,
          graduationYear: formData.graduationYear,
          graduationSemester: formData.graduationSemester,
          graduationProjectName: formData.graduationProjectName,
        }
      );

      setSuccessMessage("Graduation details updated successfully");
    } catch (err: any) {
      const errors = err?.response?.data?.errors;

      if (errors) {
        setErrorMessage(Object.values(errors).flat()[0] as string);
      } else {
        setErrorMessage("Something went wrong");
      }
    }
  };

  return (
    <div className="bg-white w-full p-4 sm:p-6 lg:p-9 shadow-sm rounded-[20px] mx-auto">
      <h2 className="text-lg sm:text-xl font-semibold mb-6">
        Graduation Details
      </h2>

      {loading && (
        <p className="text-gray-500 text-sm sm:text-base">
          Loading data...
        </p>
      )}

      {errorMessage && (
        <div className="bg-red-100 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm break-words">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* GPA */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">GPA</label>
          <input
            type="number"
            step="0.01"
            value={formData.gpa}
            onChange={(e) =>
              setFormData({
                ...formData,
                gpa: Number(e.target.value),
              })
            }
            className="border border-gray-200 rounded-xl px-3 py-3"
          />
        </div>

        {/* Graduation Year */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">
            Graduation Year
          </label>

          <select
            value={formData.graduationYear}
            onChange={(e) =>
              setFormData({
                ...formData,
                graduationYear: e.target.value,
              })
            }
            className="border border-gray-200 rounded-xl px-3 py-3"
          >
            <option value="">Select Year</option>

            {years.map((year) => (
              <option key={year.id} value={year.name}>
                {year.name}
              </option>
            ))}
          </select>
        </div>

        {/* Semester */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">
            Graduation Semester
          </label>

          <select
            value={formData.graduationSemester || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                graduationSemester: e.target.value,
              })
            }
            className="border border-gray-200 rounded-xl px-3 py-3"
          >
            <option value="">Select Semester</option>

            {TERM_OPTIONS.map((term) => (
              <option key={term.value} value={term.value}>
                {term.label}
              </option>
            ))}
          </select>
        </div>

        {/* Graduation Project */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">
            Graduation Project Name
          </label>

          <input
            type="text"
            value={formData.graduationProjectName}
            onChange={(e) =>
              setFormData({
                ...formData,
                graduationProjectName: e.target.value,
              })
            }
            className="border border-gray-200 rounded-xl px-3 py-3"
          />
        </div>

        {/* Button */}
        <button
          onClick={handleSubmit}
          className="md:col-span-2 bg-blue-600 text-white py-3 rounded-xl mt-2"
        >
          Updat
        </button>

        {successMessage && (
          <p className="md:col-span-2 text-green-600 text-sm text-center">
            {successMessage}
          </p>
        )}
      </div>
    </div>
  );
}