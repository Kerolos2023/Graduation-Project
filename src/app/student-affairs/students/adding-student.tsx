"use client";

import { useState } from "react";
import axiosInstance from "@/lib/axios";
import { BiHide, BiSolidShow } from "react-icons/bi";

export default function PopupForm({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    studentCode: "",
    nationalId: "",
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResponseMessage("");

    if (
      !formData.name.trim() ||
      !formData.studentCode.trim() ||
      !formData.nationalId.trim() ||
      !formData.username.trim() ||
      !formData.password.trim()
    ) {
      setResponseMessage("Please fill all fields correctly.");
      return;
    }

    setLoading(true);

    try {
      await axiosInstance.post(
        "colleges/019c1ea6-1738-71cb-8cfd-a90e126d177e/students",
        {
          name: formData.name,
          studentCode: formData.studentCode,
          nationalIdOrPassport: formData.nationalId,
          userName: formData.username,
          password: formData.password,
        }
      );

      setResponseMessage("Student added successfully!");

      setFormData({
        name: "",
        studentCode: "",
        nationalId: "",
        username: "",
        password: "",
      });
    } catch (error: any) {
      if (error.response?.status === 409) {
        setResponseMessage("This student already exists!");
      } else if (error.response?.status === 400) {
        setResponseMessage("Invalid data. Please check your inputs.");
      } else {
        setResponseMessage(error.response?.data?.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
      {/* click outside */}
      <div className="absolute inset-0" onClick={() => setOpen(false)} />

      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl relative z-10">
        {/* close button */}
        <button
          onClick={() => setOpen(false)}
          className="absolute right-4 top-3 text-gray-500 cursor-pointer"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold mb-6 text-center">
          Adding Student
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <div>
            <label className="text-sm text-gray-600">Name</label>
            <input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full mt-1 border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Student Code</label>
            <input
              value={formData.studentCode}
              onChange={(e) =>
                setFormData({ ...formData, studentCode: e.target.value })
              }
              className="w-full mt-1 border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">
              National ID / Passport
            </label>
            <input
              value={formData.nationalId}
              onChange={(e) =>
                setFormData({ ...formData, nationalId: e.target.value })
              }
              className="w-full mt-1 border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Username</label>
            <input
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className="w-full mt-1 border rounded-lg px-3 py-2"
            />
          </div>

          <div className="relative">
            <label className="text-sm text-gray-600">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full mt-1 border rounded-lg px-3 py-2"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[70%] -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <BiHide size={20} /> : <BiSolidShow size={20} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="col-span-full bg-blue-600 text-white py-2 rounded-xl"
          >
            {loading ? "Submitting..." : "Add"}
          </button>

          {responseMessage && (
            <p className="col-span-full text-center mt-2 text-sm">
              {responseMessage}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}