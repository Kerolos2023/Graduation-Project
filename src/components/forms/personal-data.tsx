"use client";

import { useState, useEffect } from "react";
import { studentProfileService } from "@/services/studentProfileServices";
import { useStudentContext } from "@/hooks/useStudentContext";
import { useAcademicContext } from "@/hooks/useAcademicContext";
import { MARITAL_STATUS_OPTIONS, RELIGION_OPTIONS } from "@/lib/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const GENDER_OPTIONS = [
  { value: 1, label: "Male" },
  { value: 2, label: "Female" },
];

export default function PersonalData() {
  const { studentId, setIsEditPopupOpen } = useStudentContext();
  const { selectedProgramId } = useAcademicContext();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [responseMessage, setResponseMessage] = useState("");
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
      const data =
        await studentProfileService.getPersonalDataForStudent(studentId);

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

    try {
      if (!studentId || !selectedProgramId) {
        return;
      }
      setErrorMessage("");

      await studentProfileService.updatePersonalData(
        formData,
        studentId,
        selectedProgramId,
      );

      setResponseMessage("Updated successfully");

    } catch (error: any) {
      const errorsObject = error?.response?.data?.errors;

      if (errorsObject) {
        const allErrors = Object.values(errorsObject).flat();

        if (allErrors.length > 0) {
          setErrorMessage(allErrors[0] as string);
        }
      }
    }
  };

  const numericFields = ["religion", "gender", "maritalStatus"];
  const selectFieldOptions: Record<string, { value: number; label: string }[]> =
    {
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
          <div key={key} className="flex flex-col gap-1 min-w-0">
              {/* FIXED LABEL */}
              <label className="text-sm text-gray-500">{getLabel(key)}</label>

              {options ? (
                <Select
                  value={value !== 0 ? String(value) : ""}
                  onValueChange={(val) =>
                    setFormData({
                      ...formData,
                      [key]: val === "" ? 0 : Number(val),
                    })
                  }
                >
                  <SelectTrigger className="w-full max-w-full min-w-0 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder={`Select ${getLabel(key)}`} />
                  </SelectTrigger>
                  <SelectContent className="w-full max-w-full min-w-0">
                    {options.map((option) => (
                      <SelectItem key={option.value} value={String(option.value)} title={option.label}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <input
                  type={
                    numericFields.includes(key)
                      ? "number"
                      : key === "dateOfBirth"
                        ? "date"
                        : "text"
                  }
                  value={value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [key]: numericFields.includes(key)
                        ? parseInt(e.target.value) || 0
                        : e.target.value,
                    })
                  }
                  className="border border-gray-200 rounded-xl px-3 py-2"
                />
              )}
            </div>
          );
        })}
        {errorMessage && (
          <div className="col-span-full bg-red-100 text-red-700 px-4 py-3 rounded-xl text-sm">
            {errorMessage}
          </div>
        )}
        <button className="col-span-full bg-blue-600 text-white py-3 mt-2 rounded-xl">
          Update
        </button>
        {
          responseMessage && (
            <p className="col-span-full text-center text-green-600 text-sm">
              {responseMessage}
            </p>
          )
        }
      </form>
    </div>
  );
}
