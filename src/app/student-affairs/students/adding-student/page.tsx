"use client";
import { useState } from "react";
import axiosInstance from "@/lib/axios";
import { BiHide, BiSolidShow } from "react-icons/bi";
import "./student.css"
export default function PopupForm() {
  const [open, setOpen] = useState(true);
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

  const handleSubmit = async (e) => {
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
      const response = await axiosInstance.post(
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
      setFormData({ name: "", studentCode: "", nationalId: "", username: "", password: "" });
    } catch (error) {
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

  return (
    <>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
          <div className={`bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative ${open ? 'animate-popup' : 'animate-popout'}`}>
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-3 text-gray-500 animate-popout"
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold mb-6 text-center">Adding Student</h2>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {/* Name */}
              <div>
                <label className="text-sm text-gray-600">Name</label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  type="text"
                  placeholder="Enter name"
                  className="w-full mt-1 border rounded-lg px-3 py-2"
                  required
                />
              </div>

              {/* Student Code */}
              <div>
                <label className="text-sm text-gray-600">Student Code</label>
                <input
                  value={formData.studentCode}
                  onChange={(e) => setFormData({ ...formData, studentCode: e.target.value })}
                  type="text"
                  placeholder="Enter student code"
                  className="w-full mt-1 border rounded-lg px-3 py-2"
                  required
                />
              </div>

              {/* National ID / Passport */}
              <div>
                <label className="text-sm text-gray-600">National ID / Passport</label>
                <input
                  value={formData.nationalId}
                  onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                  type="text"
                  placeholder="Enter ID or Passport"
                  className="w-full mt-1 border rounded-lg px-3 py-2"
                  required
                />
              </div>

              {/* Username */}
              <div>
                <label className="text-sm text-gray-600">Username</label>
                <input
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  type="text"
                  placeholder="Enter username"
                  className="w-full mt-1 border rounded-lg px-3 py-2"
                  required
                />
              </div>

              {/* Password */}
              <div className="relative">
                <label className="text-sm text-gray-600">Password</label>
                <input
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  className="w-full mt-1 border rounded-lg px-3 py-2"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[70%] -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <BiHide size={20} /> : <BiSolidShow size={20} />}
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="col-span-1 sm:col-span-2 lg:col-span-3 bg-blue-600 text-white py-2 rounded-xl"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Add"}
              </button>

              {/* Response Message */}
              {responseMessage && (
                <p
                  className={`col-span-1 sm:col-span-2 lg:col-span-3 text-center mt-2 ${
                    responseMessage === "Student added successfully!" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {responseMessage}
              </p>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}