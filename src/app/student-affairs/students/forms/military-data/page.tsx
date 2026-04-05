"use client";

import { useState, useEffect, useRef, useContext } from "react";
import { HeaderNavigation } from "@/components/layout/HeaderNavStudents";
import axiosInstance from "@/lib/axios";
import { StudentContext } from "@/hooks/useStudentContext";
import ProfileHeader from "@/components/layout/ProfileHeader";

type MilitaryFormData = {
  militaryStatus: number | "";
  militaryNumber: string;
  decisionNumber: string;
  decisionDate: string;
  enrollmentDate: string;
  endDate: string;
};

export default function StudentMilitaryForm() {
  const [isOpen, setIsOpen] = useState(true);
  const collegeId = "019c1ea6-1738-71cb-8cfd-a90e126d177e";

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

  const studentContext = useContext(StudentContext);
  const modalRef = useRef<HTMLDivElement>(null);

  // =========================
  // GET MILITARY DATA
  // =========================
  useEffect(() => {
    if (!isOpen || !studentContext?.studentId) return;

    const fetchMilitaryData = async () => {
      try {
        const res = await axiosInstance.get(
          `/colleges/${collegeId}/students/${studentContext.studentId}/military-data`
        );

        setFormData({
          militaryStatus: res.data.militaryStatus ?? "",
          militaryNumber: res.data.militaryNumber || "",
          decisionNumber: res.data.decisionNumber || "",
          decisionDate: res.data.decisionDate?.split("T")[0] || "",
          enrollmentDate: res.data.enrollmentDate?.split("T")[0] || "",
          endDate: res.data.endDate?.split("T")[0] || "",
        });
      } catch (err) {
        console.log("Error fetching military data:", err);
      }
    };

    fetchMilitaryData();
  }, [isOpen, collegeId, studentContext?.studentId]);

  // =========================
  // CLOSE MODAL ON OUTSIDE CLICK
  // =========================
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // =========================
  // UPDATE MILITARY DATA
  // =========================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResponseMessage("");
    setLoading(true);

    if (!studentContext?.studentId) {
      setResponseMessage("Student ID is missing");
      setLoading(false);
      return;
    }

    try {
      await axiosInstance.put(
        `/colleges/${collegeId}/students/${studentContext.studentId}/military-data`,
        {
          studentId: studentContext.studentId,
          militaryStatus:
            formData.militaryStatus === ""
              ? null
              : Number(formData.militaryStatus),
          militaryNumber: formData.militaryNumber,
          decisionNumber: formData.decisionNumber,
          decisionDate: formData.decisionDate || null,
          enrollmentDate: formData.enrollmentDate || null,
          endDate: formData.endDate || null,
        }
      );

      setResponseMessage("Military data updated successfully!");
    } catch (err: any) {
      setResponseMessage(
        err.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-start z-50 overflow-y-auto p-4">
          <div
            ref={modalRef}
            className="w-full max-w-[1000px] mt-12 bg-gray-100 rounded-2xl p-4"
          >
            <div className="flex justify-end mb-2 relative">
              <button
                className="text-black hover:text-red-700 absolute"
                onClick={() => setIsOpen(false)}
              >
                X
              </button>
            </div>

            <div className="mb-4">
              <HeaderNavigation />
            </div>

            <ProfileHeader />

            <div className="bg-white p-6 rounded-2xl shadow mt-4">
              <h2 className="text-xl font-semibold mb-6">Military Data</h2>

              <form
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                onSubmit={handleSubmit}
              >
                <div>
                  <label className="text-sm text-gray-600">Military Status</label>
                  <input
                    type="number"
                    value={formData.militaryStatus}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        militaryStatus:
                          e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                    className="w-full mt-1 border rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Military Number</label>
                  <input
                    type="text"
                    value={formData.militaryNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        militaryNumber: e.target.value,
                      })
                    }
                    className="w-full mt-1 border rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Decision Number</label>
                  <input
                    type="text"
                    value={formData.decisionNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        decisionNumber: e.target.value,
                      })
                    }
                    className="w-full mt-1 border rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Decision Date</label>
                  <input
                    type="date"
                    value={formData.decisionDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        decisionDate: e.target.value,
                      })
                    }
                    className="w-full mt-1 border rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Enrollment Date</label>
                  <input
                    type="date"
                    value={formData.enrollmentDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        enrollmentDate: e.target.value,
                      })
                    }
                    className="w-full mt-1 border rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        endDate: e.target.value,
                      })
                    }
                    className="w-full mt-1 border rounded-lg px-3 py-2"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="col-span-1 sm:col-span-2 lg:col-span-3 bg-blue-600 text-white py-2 rounded-xl mt-2 cursor-pointer"
                >
                  {loading ? "Updating..." : "Update"}
                </button>

                {responseMessage && (
                  <p className="col-span-1 sm:col-span-2 lg:col-span-3 text-center mt-2 text-red-500">
                    {responseMessage}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}