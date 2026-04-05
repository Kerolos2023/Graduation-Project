"use client";

import { useState, useEffect, useRef, useContext } from "react";
import { HeaderNavigation } from "@/components/layout/HeaderNavStudents";
import axiosInstance from "@/lib/axios";
import { StudentContext } from "@/hooks/useStudentContext";
import ProfileHeader from "@/components/layout/ProfileHeader";
type PreviousQualificationFormData = {
  schoolName: string;
  enrollmentYear: string;
  seatNumber: string;
  qualification: string;
  graduationYear: string;
  totalGrade: string;
  admissionType: number | "";
};

export default function StudentPreviousQualificationForm() {
  const [isOpen, setIsOpen] = useState(true);
  const collegeId = "019c1ea6-1738-71cb-8cfd-a90e126d177e";

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

  const studentContext = useContext(StudentContext);
  const modalRef = useRef<HTMLDivElement>(null);

  // =========================
  // GET PREVIOUS QUALIFICATION DATA
  // =========================
  useEffect(() => {
    if (!isOpen || !studentContext?.studentId) return;

    const fetchPreviousQualificationData = async () => {
      try {
        const res = await axiosInstance.get(
          `/colleges/${collegeId}/students/${studentContext.studentId}/previous-qualification-data`
        );

        setFormData({
          schoolName: res.data.schoolName || "",
          enrollmentYear: res.data.enrollmentYear || "",
          seatNumber: res.data.seatNumber || "",
          qualification: res.data.qualification || "",
          graduationYear: res.data.graduationYear || "",
          totalGrade: res.data.totalGrade || "",
          admissionType: res.data.admissionType ?? "",
        });
      } catch (err) {
        console.log("Error fetching previous qualification data:", err);
      }
    };

    fetchPreviousQualificationData();
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
  // UPDATE PREVIOUS QUALIFICATION DATA
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
        `/colleges/${collegeId}/students/${studentContext.studentId}/previous-qualification-data`,
        {
          studentId: studentContext.studentId,
          schoolName: formData.schoolName,
          enrollmentYear: formData.enrollmentYear,
          seatNumber: formData.seatNumber,
          qualification: formData.qualification,
          graduationYear: formData.graduationYear,
          totalGrade: formData.totalGrade,
          admissionType:
            formData.admissionType === "" ? null : Number(formData.admissionType),
        }
      );

      setResponseMessage("Previous qualification data updated successfully!");
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

            <div className="bg-white p-6 rounded-2xl shadow">
              <h2 className="text-xl font-semibold mb-6">
                Previous Qualification Data
              </h2>

              <form
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                onSubmit={handleSubmit}
              >
                <div>
                  <label className="text-sm text-gray-600">School Name</label>
                  <input
                    type="text"
                    value={formData.schoolName}
                    onChange={(e) =>
                      setFormData({ ...formData, schoolName: e.target.value })
                    }
                    className="w-full mt-1 border rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Enrollment Year</label>
                  <input
                    type="text"
                    value={formData.enrollmentYear}
                    onChange={(e) =>
                      setFormData({ ...formData, enrollmentYear: e.target.value })
                    }
                    className="w-full mt-1 border rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Seat Number</label>
                  <input
                    type="text"
                    value={formData.seatNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, seatNumber: e.target.value })
                    }
                    className="w-full mt-1 border rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Qualification</label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) =>
                      setFormData({ ...formData, qualification: e.target.value })
                    }
                    className="w-full mt-1 border rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Graduation Year</label>
                  <input
                    type="text"
                    value={formData.graduationYear}
                    onChange={(e) =>
                      setFormData({ ...formData, graduationYear: e.target.value })
                    }
                    className="w-full mt-1 border rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Total Grade</label>
                  <input
                    type="text"
                    value={formData.totalGrade}
                    onChange={(e) =>
                      setFormData({ ...formData, totalGrade: e.target.value })
                    }
                    className="w-full mt-1 border rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Admission Type</label>
                  <input
                    type="number"
                    value={formData.admissionType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        admissionType:
                          e.target.value === "" ? "" : Number(e.target.value),
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