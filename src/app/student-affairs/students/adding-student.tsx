"use client";

import { useState } from "react";
import axiosInstance from "@/lib/axios";
import { BiHide, BiSolidShow } from "react-icons/bi";
import { COLLEGE_ID } from "@/lib/constants";
import { useAcademicContext } from "@/hooks/useAcademicContext";

export default function PopupForm({
  open,
  setOpen,
  onSuccess,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  onSuccess?: (studentId: string) => void;
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
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const { selectedProgramId } = useAcademicContext();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getErrorMessage = (err: any) => {
    const data = err?.response?.data;

    console.log("API ERROR:", data);

    return (
      data?.message ||
      data?.title ||
      data?.error ||
      (data?.errors &&
        Object.values(data.errors).flat().join(", ")) ||
      "Something went wrong"
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    if (
      !formData.name ||
      !formData.studentCode ||
      !formData.nationalId ||
      !formData.username ||
      !formData.password
    ) {
      setMessage("Please fill all fields");
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post(
        `/students`,
        {
          name: formData.name,
          studentCode: formData.studentCode,
          nationalIdOrPassport: formData.nationalId,
          userName: formData.username,
          password: formData.password,
        },
        {
          params: {
            academicProgramId: selectedProgramId,
            collegeId: COLLEGE_ID,
          },
        }
      );

      const newStudentId =
        response.data?.id || response.data?.studentId || response.data?.student?.id;

      setMessage("Student added successfully");
      setMessageType("success");

      setFormData({
        name: "",
        studentCode: "",
        nationalId: "",
        username: "",
        password: "",
      });
      
      setOpen(false);
      if (newStudentId) {
        onSuccess?.(newStudentId);
      } else {
        onSuccess?.("");
      }
    } catch (err: any) {
      setMessage(getErrorMessage(err));
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      {/* overlay */}
      <div className="absolute inset-0" onClick={() => setOpen(false)} />

      <div className="bg-white w-full max-w-3xl rounded-2xl p-6 relative z-10">

        {/* close */}
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
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter name"
              className="border p-2 rounded-lg"
            />
          </div>

          {/* Student Code */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Student Code</label>
            <input
              name="studentCode"
              value={formData.studentCode}
              onChange={handleChange}
              placeholder="Enter student code"
              className="border p-2 rounded-lg"
            />
          </div>

          {/* National ID */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">National ID</label>
            <input
              name="nationalId"
              value={formData.nationalId}
              onChange={handleChange}
              placeholder="Enter national ID"
              className="border p-2 rounded-lg"
            />
          </div>

          {/* Username */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Username</label>
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
              className="border p-2 rounded-lg"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Password</label>

            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
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
            <p
              className={`col-span-2 text-center text-sm font-medium ${
                messageType === "success"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}