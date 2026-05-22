"use client";

import { useState, useEffect } from "react";
import { studentProfileService } from "@/services/studentProfileServices";
import { useStudentContext } from "@/hooks/useStudentContext";
import { useAcademicContext } from "@/hooks/useAcademicContext";
import { MARITAL_STATUS_OPTIONS, RELIGION_OPTIONS } from "@/lib/constants";

const GENDER_OPTIONS = [
  { value: 1, label: "Male" },
  { value: 2, label: "Female" },
];

export default function PersonalData() {
  const { studentId, setIsEditPopupOpen } = useStudentContext();
  const { selectedProgramId } = useAcademicContext();
  type PersonalDataFormData = {
    name: string;
    studentCode: string;
    nationalIdOrPassport: string;
    religion: number;
    gender: number;
    maritalStatus: number;
    dateOfBirth: string;
    placeOfBirth: string;
    nationality: string;
  };

  const [formData, setFormData] = useState<PersonalDataFormData>({
    name: "",
    studentCode: "",
    nationalIdOrPassport: "",
    religion: 0,
    gender: 0,
    maritalStatus: 0,
    dateOfBirth: "",
    placeOfBirth: "",
    nationality: "",
  });

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
      const data = await studentProfileService.getPersonalDataForStudent(studentId);

      setFormData({
        name: data.name || "",
        studentCode: data.studentCode || "",
        nationalIdOrPassport: data.nationalIdOrPassport || "",
        religion: Number(data.religion) || 0,
        gender: Number(data.gender) || 0,
        dateOfBirth: data.dateOfBirth || "",
        maritalStatus: Number(data.maritalStatus) || 0,
        placeOfBirth: data.placeOfBirth || "",
        nationality: data.nationality || "",
      });
    };

    fetchData();
  }, [studentId]);
  console.log({
  studentId,
  selectedProgramId,
});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentId || !selectedProgramId) {
      console.error("Missing studentId or selectedProgramId");
      return;
    }

    await studentProfileService.updatePersonalData(formData, studentId, selectedProgramId);

    setIsEditPopupOpen(false);
  };

  const numericFields = ["religion", "gender", "maritalStatus"];
  const selectFieldOptions: Record<string, { value: number; label: string }[]> = {
    religion: RELIGION_OPTIONS,
    gender: GENDER_OPTIONS,
    maritalStatus: MARITAL_STATUS_OPTIONS,
  };

  return (
    <div className="bg-white p-9 shadow-sm rounded-[20px]">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-[20px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 "
      >
        {Object.entries(formData).map(([key, value]) => {
          const options = selectFieldOptions[key];

          return (
            <div key={key} className="flex flex-col gap-1">

              {/* FIXED LABEL */}
              <label className="text-sm text-gray-500">
                {getLabel(key)}
              </label>

              {options ? (
                <select
                  value={value !== 0 ? value : ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [key]: e.target.value === "" ? 0 : Number(e.target.value),
                    })
                  }
                  className="border border-gray-200 rounded-xl px-3 py-2"
                >
                  <option value="">Select {getLabel(key)}</option>
                  {options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={numericFields.includes(key) ? "number" : key === "dateOfBirth" ? "date" : "text"}
                  value={value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [key]: numericFields.includes(key) ? parseInt(e.target.value) || 0 : e.target.value,
                    })
                  }
                  className="border border-gray-200 rounded-xl px-3 py-2"
                />
              )}
            </div>
          );
        })}

        <button className="col-span-full bg-blue-600 text-white py-3 mt-2 rounded-xl">
          Update
        </button>
      </form>
    </div>
  );
}