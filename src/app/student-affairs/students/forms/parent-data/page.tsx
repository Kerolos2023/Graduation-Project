"use client";

import { useState, useEffect, useRef, useContext } from "react";
import { HeaderNavigation } from "@/components/layout/HeaderNavStudents";
import axiosInstance from "@/lib/axios";
import { StudentContext } from "@/hooks/useStudentContext";
import ProfileHeader from "@/components/layout/ProfileHeader";
type ParentFormData = {
  guardianName: string;
  relationshipDegree: string;
  job: string;
  motherName: string;
  guardianCity: string;
  guardianEmail: string;
  guardianPhoneNumber: string;
  guardianAddress: string;
};

export default function StudentParentForm() {
  const [isOpen, setIsOpen] = useState(true);
  const collegeId = "019c1ea6-1738-71cb-8cfd-a90e126d177e";

  const [formData, setFormData] = useState<ParentFormData>({
    guardianName: "",
    relationshipDegree: "",
    job: "",
    motherName: "",
    guardianCity: "",
    guardianEmail: "",
    guardianPhoneNumber: "",
    guardianAddress: "",
  });

  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

  const studentContext = useContext(StudentContext);
  const modalRef = useRef<HTMLDivElement>(null);

  // =========================
  // GET PARENT DATA
  // =========================
  useEffect(() => {
    if (!isOpen || !studentContext?.studentId) return;

    const fetchParentData = async () => {
      try {
        const res = await axiosInstance.get(
          `/colleges/${collegeId}/students/${studentContext.studentId}/parent-data`
        );

        setFormData({
          guardianName: res.data.guardianName || "",
          relationshipDegree: res.data.relationshipDegree || "",
          job: res.data.job || "",
          motherName: res.data.motherName || "",
          guardianCity: res.data.guardianCity || "",
          guardianEmail: res.data.guardianEmail || "",
          guardianPhoneNumber: res.data.guardianPhoneNumber || "",
          guardianAddress: res.data.guardianAddress || "",
        });
      } catch (err) {
        console.log("Error fetching parent data:", err);
      }
    };

    fetchParentData();
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
  // UPDATE PARENT DATA
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
        `/colleges/${collegeId}/students/${studentContext.studentId}/parent-data`,
        {
          studentId: studentContext.studentId,
          guardianName: formData.guardianName,
          relationshipDegree: formData.relationshipDegree,
          job: formData.job,
          motherName: formData.motherName,
          guardianCity: formData.guardianCity,
          guardianEmail: formData.guardianEmail,
          guardianPhoneNumber: formData.guardianPhoneNumber,
          guardianAddress: formData.guardianAddress,
        }
      );

      setResponseMessage("Parent data updated successfully!");
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
              <h2 className="text-xl font-semibold mb-6">Parent Data</h2>

              <form
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                onSubmit={handleSubmit}
              >
                <div>
                  <label className="text-sm text-gray-600">Guardian Name</label>
                  <input
                    type="text"
                    value={formData.guardianName}
                    onChange={(e) =>
                      setFormData({ ...formData, guardianName: e.target.value })
                    }
                    className="w-full mt-1 border rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">
                    Relationship Degree
                  </label>
                  <input
                    type="text"
                    value={formData.relationshipDegree}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        relationshipDegree: e.target.value,
                      })
                    }
                    className="w-full mt-1 border rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Job</label>
                  <input
                    type="text"
                    value={formData.job}
                    onChange={(e) =>
                      setFormData({ ...formData, job: e.target.value })
                    }
                    className="w-full mt-1 border rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Mother Name</label>
                  <input
                    type="text"
                    value={formData.motherName}
                    onChange={(e) =>
                      setFormData({ ...formData, motherName: e.target.value })
                    }
                    className="w-full mt-1 border rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Guardian City</label>
                  <input
                    type="text"
                    value={formData.guardianCity}
                    onChange={(e) =>
                      setFormData({ ...formData, guardianCity: e.target.value })
                    }
                    className="w-full mt-1 border rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Guardian Email</label>
                  <input
                    type="email"
                    value={formData.guardianEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, guardianEmail: e.target.value })
                    }
                    className="w-full mt-1 border rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">
                    Guardian Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.guardianPhoneNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        guardianPhoneNumber: e.target.value,
                      })
                    }
                    className="w-full mt-1 border rounded-lg px-3 py-2"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-2">
                  <label className="text-sm text-gray-600">Guardian Address</label>
                  <input
                    type="text"
                    value={formData.guardianAddress}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        guardianAddress: e.target.value,
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