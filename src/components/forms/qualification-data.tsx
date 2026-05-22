"use client";

import { useState, useEffect } from "react";
import { studentProfileService } from "@/services/studentProfileServices";
import { useStudentContext } from "@/hooks/useStudentContext";
import { ADMISSION_TYPE_OPTIONS } from "@/lib/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type PreviousQualificationFormData = {
  schoolName: string;
  enrollmentYear: string;
  seatNumber: string;
  qualification: string;
  graduationYear: string;
  totalGrade: string;
  admissionType: number | "";
};

export default function PreviousQualificationData() {
  const { studentId, setIsEditPopupOpen } = useStudentContext();

  const [formData, setFormData] = useState<PreviousQualificationFormData>({
    schoolName: "",
    enrollmentYear: "",
    seatNumber: "",
    qualification: "",
    graduationYear: "",
    totalGrade: "",
    admissionType: "",
  });

  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);


  // FETCH
  useEffect(() => {
    if (!studentId) return;

    const fetchData = async () => {
      try {
        const data = await studentProfileService.getQualificationDataForStudent(studentId);

        setFormData({
          schoolName: data.schoolName || "",
          enrollmentYear: data.enrollmentYear || "",
          seatNumber: data.seatNumber || "",
          qualification: data.qualification || "",
          graduationYear: data.graduationYear || "",
          totalGrade: data.totalGrade || "",
          admissionType: data.admissionType ?? "",
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [studentId]);

  // SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) return;

    setLoading(true);
    setResponseMessage("");

    const payload = {
      schoolName: formData.schoolName,
      enrollmentYear: formData.enrollmentYear.toString(),
      seatNumber: formData.seatNumber,
      qualification: formData.qualification,
      graduationYear: formData.graduationYear.toString(),
      totalGrade: formData.totalGrade.toString(),

      admissionType:
        formData.admissionType === ""
          ? null
          : Number(formData.admissionType),
    };

    try {
      await studentProfileService.updateQualificationData(payload, studentId);

      setResponseMessage("Updated successfully");
      setIsEditPopupOpen(false);
    } catch (err) {
      const errorsObject = err?.response?.data?.errors;

      if (errorsObject) {
        const allErrors = Object.values(errorsObject).flat();
        setErrorMessage(allErrors[0] as string);
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-9 shadow-sm rounded-4xl">
      <form
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        onSubmit={handleSubmit}
      >
        {Object.entries(formData).map(([key, value]) => (
          <div key={key} className="flex flex-col gap-1">
            <label className="text-[13px] text-gray-500 capitalize">
              {key.replace(/([A-Z])/g, " $1")}
            </label>

            {key === "admissionType" ? (
              <Select
                value={value === "" ? "" : String(value)}
                onValueChange={(val) =>
                  setFormData({
                    ...formData,
                    admissionType: val === "" ? "" : Number(val),
                  })
                }
              >
                <SelectTrigger className="w-full max-w-full min-w-0 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Select Admission Type" />
                </SelectTrigger>
                <SelectContent className="w-full max-w-full min-w-0">
                  {ADMISSION_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={String(option.value)} title={option.label}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <input
                type="text"
                value={value}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    [key]: e.target.value,
                  })
                }
                className="border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />
            )}
          </div>
        ))}
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