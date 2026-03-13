"use client";
// import "./student.css"
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { HeaderNavigation } from "@/components/layout/HeaderNavStudents";
import axiosInstance from "@/lib/axios";
export default function StudentProfileForm() {
  const [isOpen, setIsOpen] = useState(true);
  const [collegeId , setCollegeID] = useState("019c1ea6-1738-71cb-8cfd-a90e126d177e")
  const [studentId , setstudentId] = useState("019cd990-1a8b-74fc-a09e-99f881a1dfab")
  const [formData, setFormData] = useState({
    name: "",
    studentCode: "",
    nationalIdOrPassport: "",
    religion: "",
    gender: "",
    MaritalStatus: "",
    dateOfBirth: "",
    placeOfBirth: "",
    nationality: "",
  });
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const fetchPersonalData = async () => {
      try {
        const res = await axiosInstance.get(
          `/colleges/${collegeId}/students/${studentId}`
        );
        setFormData({
          name: res.data.name || "",
          studentCode: res.data.studentCode || "",
          nationalIdOrPassport: res.data.nationalIdOrPassport || "",
          religion: res.data.religion || "",
          gender: res.data.gender || "",
          MaritalStatus: res.data.MaritalStatus || "",
          dateOfBirth: res.data.dateOfBirth || "",
          placeOfBirth: res.data.placeOfBirth || "",
          nationality: res.data.nationality || "",
        });
      } catch (err) {
        console.log(err);
      }
    };
    fetchPersonalData();
  }, [isOpen, collegeId, studentId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResponseMessage("");
    setLoading(true);
    try {
      await axiosInstance.post(
        `/colleges/${collegeId}/students/${studentId}/update-personal`,
        formData
      );
      setResponseMessage("Student updated successfully!");
    } catch (err: any) {
      setResponseMessage(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {isOpen && (
        <div className={`fixed inset-0 bg-black/40 flex justify-center items-start z-50 overflow-y-auto p-4`}>
          <div
            ref={modalRef}
            className="w-full max-w-[1000px] mt-12 bg-gray-100 rounded-2xl p-4"
          >
            <div className="flex justify-end mb-2 relative">
              <button
                className="text-gray-1000 hover:text-red-900 absolute"
                onClick={() => setIsOpen(false)}
              >
                X
              </button>
            </div>

            <div className="mb-4">
              <HeaderNavigation />
            </div>

            <div className="bg-white p-4 rounded-2xl shadow mb-4">
              <h2 className="text-lg font-semibold mb-4">Profile Picture</h2>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center text-sm font-semibold">
                    kero
                  </div>
                  <div>
                    <Link href="" className="text-blue-600 font-medium">
                      Change Photo
                    </Link>
                    <p className="text-sm text-gray-500">
                      JPG, PNG or GIF, Max size 2GB
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button className="bg-black text-white px-4 py-2 rounded-full cursor-pointer">
                    Edit
                  </button>
                  <button className="bg-red-600 text-white px-4 py-2 rounded-full cursor-pointer">
                    Delete
                  </button>
                  <button className="bg-gray-200 px-4 py-2 rounded-full cursor-pointer">
                    Request to change the image
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow">
          <form
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            onSubmit={handleSubmit}
          >
            <div>
              <label className="text-sm text-gray-600">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full mt-1 border rounded-lg px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Student Code</label>
              <input
                type="text"
                value={formData.studentCode}
                onChange={(e) =>
                  setFormData({ ...formData, studentCode: e.target.value })
                }
                className="w-full mt-1 border rounded-lg px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">National ID / Passport</label>
              <input
                type="text"
                value={formData.nationalIdOrPassport}
                onChange={(e) =>
                  setFormData({ ...formData, nationalIdOrPassport: e.target.value })
                }
                className="w-full mt-1 border rounded-lg px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Religion</label>
              <input
                type="text"
                value={formData.religion}
                onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                className="w-full mt-1 border rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Gender</label>
              <input
                type="text"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full mt-1 border rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Marital Status</label>
              <input
                type="text"
                value={formData.MaritalStatus}
                onChange={(e) =>
                  setFormData({ ...formData, MaritalStatus: e.target.value })
                }
                className="w-full mt-1 border rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Date Of Birth</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  setFormData({ ...formData, dateOfBirth: e.target.value })
                }
                className="w-full mt-1 border rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Place Of Birth</label>
              <input
                type="text"
                value={formData.placeOfBirth}
                onChange={(e) =>
                  setFormData({ ...formData, placeOfBirth: e.target.value })
                }
                className="w-full mt-1 border rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Nationality</label>
              <input
                type="text"
                value={formData.nationality}
                onChange={(e) =>
                  setFormData({ ...formData, nationality: e.target.value })
                }
                className="w-full mt-1 border rounded-lg px-3 py-2"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="col-span-1 sm:col-span-2 lg:col-span-3 bg-blue-600 text-white py-2 rounded-xl mt-2"
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