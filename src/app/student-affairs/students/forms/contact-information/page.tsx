"use client";

import { useState, useEffect, useRef, useContext } from "react";
import Link from "next/link";
import { HeaderNavigation } from "@/components/layout/HeaderNavStudents";
import axiosInstance from "@/lib/axios";
import { StudentContext } from "@/hooks/useStudentContext";
import ProfileHeader from "@/components/layout/ProfileHeader";
export default function StudentProfileForm() {
  const [isOpen, setIsOpen] = useState(true);
  const [collegeId, setCollegeID] = useState(
    "019c1ea6-1738-71cb-8cfd-a90e126d177e"
  );

  const [formData, setFormData] = useState({
    city: "",
    address: "",
    postalCode: "",
    phoneNumber: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

  const studentContext = useContext(StudentContext);
  const modalRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (!isOpen) return;

    const fetchContactData = async () => {
      if (!studentContext?.studentId) {
        console.log("studentId is missing");
        return;
      }

      try {
        const res = await axiosInstance.get(
          `/colleges/${collegeId}/students/${studentContext.studentId}/contact-data`
        );

        setFormData({
          city: res.data.city || "",
          address: res.data.address || "",
          postalCode: res.data.postalCode || "",
          phoneNumber: res.data.phoneNumber || "",
          email: res.data.email || "",
        });
      } catch (err) {
        console.log("Error fetching contact data:", err);
      }
    };

    fetchContactData();
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
        `/colleges/${collegeId}/students/${studentContext.studentId}/contact-data`,
        {
          studentId: studentContext.studentId,
          city: formData.city,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          postalCode: formData.postalCode,
        }
      );

      setResponseMessage("Student updated successfully!");
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
              <form
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                onSubmit={handleSubmit}
              >
                <div>
                  <label className="text-sm text-gray-600">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="w-full mt-1 border rounded-lg px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full mt-1 border rounded-lg px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Postal Code</label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        postalCode: e.target.value,
                      })
                    }
                    className="w-full mt-1 border rounded-lg px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phoneNumber: e.target.value,
                      })
                    }
                    className="w-full mt-1 border rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full mt-1 border rounded-lg px-3 py-2"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="col-span-1 sm:col-span-2 lg:col-span-3 bg-blue-600 text-white py-2 rounded-xl mt-2 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
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