"use client";

import { useState } from "react";
import axiosInstance from "@/lib/axios";
import { BiHide, BiSolidShow } from "react-icons/bi";
import { COLLEGE_ID } from "@/lib/constants";

export default function PopupForm({
  open,
  setOpen,
  onSuccess,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  onSuccess?: () => void;
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
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    // validation
    if (
      !formData.name ||
      !formData.studentCode ||
      !formData.nationalId ||
      !formData.username ||
      !formData.password
    ) {
      setMessage("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      await axiosInstance.post(
        `colleges/${COLLEGE_ID}/students`,
        {
          name: formData.name,
          studentCode: formData.studentCode,
          nationalIdOrPassport: formData.nationalId,
          userName: formData.username,
          password: formData.password,
        }
      );

      setMessage("Student added successfully");

      setFormData({
        name: "",
        studentCode: "",
        nationalId: "",
        username: "",
        password: "",
      });

      setOpen(false);
      onSuccess?.();
    } catch (err: any) {
      setMessage(
        err?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      {/* overlay close */}
      <div
        className="absolute inset-0"
        onClick={() => setOpen(false)}
      />

      <div className="bg-white w-full max-w-3xl rounded-2xl p-6 relative z-10">

        {/* close button */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-3 right-4 text-gray-500"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-5 text-center">
          Add Student
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {/* Name */}
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            className="border p-2 rounded-lg"
          />

          {/* Student Code */}
          <input
            name="studentCode"
            value={formData.studentCode}
            onChange={handleChange}
            placeholder="Student Code"
            className="border p-2 rounded-lg"
          />

          {/* National ID */}
          <input
            name="nationalId"
            value={formData.nationalId}
            onChange={handleChange}
            placeholder="National ID"
            className="border p-2 rounded-lg"
          />

          {/* Username */}
          <input
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
            className="border p-2 rounded-lg"
          />

          {/* Password */}
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="border p-2 rounded-lg w-full"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2 text-gray-500"
            >
              {showPassword ? (
                <BiHide size={20} />
              ) : (
                <BiSolidShow size={20} />
              )}
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="col-span-1 sm:col-span-2 bg-blue-600 text-white py-2 rounded-xl"
          >
            {loading ? "Adding..." : "Add Student"}
          </button>

          {/* Message */}
          {message && (
            <p className="col-span-2 text-center text-sm text-gray-600">
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}