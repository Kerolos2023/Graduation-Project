"use client";

import { useState, useEffect } from "react";
import { studentProfileService } from "@/services/studentProfileServices";
import { useStudentContext } from "@/hooks/useStudentContext";
import { useAcademicContext } from "@/hooks/useAcademicContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


const RELIGION_OPTIONS = [
  { value: "Muslim", label: "Muslim" },
  { value: "Christian", label: "Christian" },
  { value: "Other", label: "Other" },
];

const MARITAL_STATUS_OPTIONS = [
  { value: "Single", label: "Single" },
  { value: "Married", label: "Married" },
  { value: "Divorced", label: "Divorced" },
  { value: "Widowed", label: "Widowed" },
];

const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
];

type PersonalDataFormData = {
  name: string;
  studentCode: string;
  nationalIdOrPassport: string;

  religion: string;
  gender: string;
  maritalStatus: string;

  dateOfBirth: string;
  placeOfBirth: string;
  nationality: string;
};

export default function PersonalData() {
  const { studentId } = useStudentContext();
  const { selectedProgramId } = useAcademicContext();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [responseMessage, setResponseMessage] = useState("");

  const [formData, setFormData] = useState<PersonalDataFormData>({
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

  const selectFieldOptions: Record<
    string,
    { value: string; label: string }[]
  > = {
    religion: RELIGION_OPTIONS,
    gender: GENDER_OPTIONS,
    maritalStatus: MARITAL_STATUS_OPTIONS,
  };

  const fields: {
    key: keyof PersonalDataFormData;
    label: string;
    type: "text" | "date" | "select";
  }[] = [
    { key: "name", label: "Name", type: "text" },
    { key: "studentCode", label: "Student Code", type: "text" },
    {
      key: "nationalIdOrPassport",
      label: "National ID / Passport",
      type: "text",
    },
    { key: "religion", label: "Religion", type: "select" },
    { key: "gender", label: "Gender", type: "select" },
    { key: "maritalStatus", label: "Marital Status", type: "select" },
    { key: "dateOfBirth", label: "Date of Birth", type: "date" },
    { key: "placeOfBirth", label: "Place of Birth", type: "text" },
    { key: "nationality", label: "Nationality", type: "text" },
  ];

  // ================= FETCH =================
  useEffect(() => {
    if (!studentId) return;

    const fetchData = async () => {
      try {
        const data =
          await studentProfileService.getPersonalDataForStudent(studentId);

        console.log("API DATA:", data);

        setFormData({
          name: data?.name ?? "",
          studentCode: data?.studentCode ?? "",
          nationalIdOrPassport:
            data?.nationalIdOrPassport ?? "",

            religion: data?.religion ?? "",
          gender: data?.gender ?? "",
          maritalStatus: data?.maritalStatus ?? "",

          dateOfBirth: data?.dateOfBirth ?? "",
          placeOfBirth: data?.placeOfBirth ?? "",
          nationality: data?.nationality ?? "",
        });
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [studentId]);

  // ================= SUBMIT =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      if (!studentId || !selectedProgramId) return;

      setErrorMessage(null);
      setResponseMessage("");

      await studentProfileService.updatePersonalData(
        formData,
        studentId,
        selectedProgramId
      );

      setResponseMessage("Updated successfully");
      setLoading(false);
      const updatedData =
        await studentProfileService.getPersonalDataForStudent(studentId);

      setFormData({
        name: updatedData?.name ?? "",
        studentCode: updatedData?.studentCode ?? "",
        nationalIdOrPassport:
          updatedData?.nationalIdOrPassport ?? "",

        religion: updatedData?.religion ?? "",
        gender: updatedData?.gender ?? "",
        maritalStatus: updatedData?.maritalStatus ?? "",

        dateOfBirth: updatedData?.dateOfBirth ?? "",
        placeOfBirth: updatedData?.placeOfBirth ?? "",
        nationality: updatedData?.nationality ?? "",
      });
    } catch (error: any) {
      console.error(error);

      const errorsObject = error?.response?.data?.errors;

      if (errorsObject) {
        const allErrors = Object.values(errorsObject).flat();

        if (allErrors.length > 0) {
          setErrorMessage(allErrors[0] as string);
        }
      }
    }
  };

  // ================= UI =================
  return (
    <div className="bg-white p-9 shadow-sm rounded-[20px]">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {fields.map((field) => {
          const options = selectFieldOptions[field.key];

          return (
            <div
              key={field.key}
              className="flex flex-col gap-1 min-w-0"
            >
              <label className="text-sm text-gray-500">
                {field.label}
              </label>

              {/* SELECT */}
              {field.type === "select" && options ? (
                <Select
                  value={formData[field.key] ?? ""}
                  onValueChange={(val) =>
                    setFormData((prev) => ({
                      ...prev,
                      [field.key]: val,
                    }))
                  }
                >
                  <SelectTrigger className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm">
                    <SelectValue
                      placeholder={`Select ${field.label}`}
                    />
                  </SelectTrigger>

                  <SelectContent>
                    {options.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                /* INPUT */
                <input
                  type={field.type}
                  value={formData[field.key] as string}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [field.key]: e.target.value,
                    }))
                  }
                  className="border border-gray-200 rounded-xl px-3 py-2"
                />
              )}
            </div>
          );
        })}

        {/* ERROR */}
        {errorMessage && (
          <div className="col-span-full bg-red-100 text-red-700 px-4 py-3 rounded-xl text-sm">
            {errorMessage}
          </div>
        )}

      <button
          type="submit"
          disabled={loading}
          className="col-span-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl mt-2 transition"
        >
          {loading
            ? "Updating..."
            : "Update"}
        </button>

        {/* SUCCESS */}
        {responseMessage && (
          <p className="col-span-full text-center text-green-600 text-sm">
            {responseMessage}
          </p>
        )}
      </form>
    </div>
  );
}