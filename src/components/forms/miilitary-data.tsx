"use client";

import { useState, useEffect } from "react";
import { studentProfileService } from "@/services/studentProfile.service";
import { useStudentContext } from "@/hooks/useStudentContext";

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
      await studentProfileService.updateMilitaryData(payload);

      setResponseMessage("Updated successfully");
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
            type={
              key.toLowerCase().includes("date")
                ? "date"
                : key === "militaryStatus"
                ? "number"
                : "text"
            }
            value={value as any}
            onChange={(e) =>
              setFormData({
                ...formData,
                [key]:
                  key === "militaryStatus"
                    ? e.target.value === ""
                      ? ""
                      : Number(e.target.value)
                    : e.target.value,
              })
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