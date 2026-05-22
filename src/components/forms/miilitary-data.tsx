"use client";

import { useState, useEffect } from "react";
import { studentProfileService } from "@/services/studentProfileServices";
import { useStudentContext } from "@/hooks/useStudentContext";
import { MILITARY_STATUS_OPTIONS } from "@/lib/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type MilitaryFormData = {
  militaryStatus: number | "";
  militaryNumber: string;
  decisionNumber: string;
  decisionDate: string;
  enrollmentDate: string;
  endDate: string;
};

export default function MilitaryData() {
  const { studentId, setIsEditPopupOpen } = useStudentContext();

  const [formData, setFormData] = useState<MilitaryFormData>({
    militaryStatus: "",
    militaryNumber: "",
    decisionNumber: "",
    decisionDate: "",
    enrollmentDate: "",
    endDate: "",
  });

  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // FETCH
  useEffect(() => {
    if (!studentId) return;

    const fetchData = async () => {
      const data = await studentProfileService.getMilitaryDataForStudent(studentId);

      setFormData({
        militaryStatus: data.militaryStatus ?? "",
        militaryNumber: data.militaryNumber || "",
        decisionNumber: data.decisionNumber || "",
        decisionDate: data.decisionDate?.split("T")[0] || "",
        enrollmentDate: data.enrollmentDate?.split("T")[0] || "",
        endDate: data.endDate?.split("T")[0] || "",
      });
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
      studentId,
      militaryStatus: formData.militaryStatus,
      militaryNumber: formData.militaryNumber,
      decisionNumber: formData.decisionNumber,
      decisionDate: formData.decisionDate,
      enrollmentDate: formData.enrollmentDate,
      endDate: formData.endDate,
    };
    try {
      await studentProfileService.updateMilitaryData(payload, studentId);

      setResponseMessage("Updated successfully");
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
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {Object.entries(formData).map(([key, value]) => (
          <div key={key} className="flex flex-col gap-1 min-w-0">
            <label className="text-[13px] text-gray-500 capitalize">
              {key.replace(/([A-Z])/g, " $1")}
            </label>

            {key === "militaryStatus" ? (
              <Select
                value={value === "" ? "" : String(value)}
                onValueChange={(val) =>
                  setFormData({
                    ...formData,
                    militaryStatus: val === "" ? "" : Number(val),
                  })
                }
              >
                <SelectTrigger className="w-full max-w-full min-w-0 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Select Military Status" />
                </SelectTrigger>
                <SelectContent className="w-full max-w-full min-w-0">
                  {MILITARY_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={String(option.value)} title={option.label}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <input
                type={
                  key.toLowerCase().includes("date") ? "date" : "text"
                }
                value={String(value)}
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