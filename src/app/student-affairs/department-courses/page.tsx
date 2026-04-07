"use client";

import { useState } from "react";

const TABS = [
  "Department Data",
  "Semesters",
  "Grades",
  "Credit Load by Level",
  "Department Courses",
];

interface DynamicField {
  id: number;
  fieldName: string;
  leftValue: string;
  rightValue: string;
}

interface CourseFormData {
  course: string;
  semester: string;
  creditHour: string;
  level: string;
  type: string;
  optionalCode: string;
  passDegree: string;
  numberOfGroups: string;
  maxDegree: string;
  fieldName: string;
  dynamicFields: DynamicField[];
}

export default function DepartmentCoursesPage() {
  const [activeTab, setActiveTab] = useState("Department Courses");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState<CourseFormData>({
    course: "",
    semester: "Term 01",
    creditHour: "",
    level: "",
    type: "",
    optionalCode: "Term 01",
    passDegree: "",
    numberOfGroups: "",
    maxDegree: "0",
    fieldName: "",
    dynamicFields: [
      { id: 1, fieldName: "Field 1", leftValue: "", rightValue: "" },
    ],
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDynamicChange = (
    id: number,
    key: "leftValue" | "rightValue",
    value: string
  ) => {
    setForm({
      ...form,
      dynamicFields: form.dynamicFields.map((f) =>
        f.id === id ? { ...f, [key]: value } : f
      ),
    });
  };

  const addDynamicField = () => {
    const newId = Date.now();
    setForm({
      ...form,
      dynamicFields: [
        ...form.dynamicFields,
        {
          id: newId,
          fieldName: Field ${form.dynamicFields.length + 1},
          leftValue: "",
          rightValue: "",
        },
      ],
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const res = await fetch("/api/department-courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");
      setSuccessMsg("Course saved successfully!");
    } catch (err: unknown) {
      if (err instanceof Error) setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 bg-white rounded-2xl p-3 shadow-sm w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab
                ? "bg-blue-50 text-blue-600 font-semibold"
                : "text-gray-500 hover:text-gray-700"
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Form Card */}
      {activeTab === "Department Courses" && (
        <div className="bg-white rounded-2xl shadow-sm p-6 max-w-2xl">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Department Courses
          </h2>

          {/* Course */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course
            </label>
            <select
              name="course"
              value={form.course}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="">Placeholder</option>
              <option value="CS101">CS101</option>
              <option value="MATH201">MATH201</option>
            </select>
          </div>
{/* Row: Semester / Credit Hour / Level */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Semester
              </label>
              <select
                name="semester"
                value={form.semester}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option>Term 01</option>
                <option>Term 02</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Credit Hour
              </label>
              <input
                name="creditHour"
                value={form.creditHour}
                onChange={handleChange}
                placeholder="Placeholder"
                className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Level
              </label>
              <select
                name="level"
                value={form.level}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="">Placeholder</option>
                <option value="1">Level 1</option>
                <option value="2">Level 2</option>
                <option value="3">Level 3</option>
              </select>
            </div>
          </div>

          {/* Row: Type / Optional Code / Pass Degree */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="">Placeholder</option>
                <option value="mandatory">Mandatory</option>
                <option value="elective">Elective</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Optional Code
              </label>
              <input
                name="optionalCode"
                value={form.optionalCode}
                onChange={handleChange}
                className="w-full border border-gray-200 bg-gray-50 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pass Degree
              </label>
              <input
                name="passDegree"
                value={form.passDegree}
                onChange={handleChange}
                placeholder="Placeholder"
                className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>

          {/* Number of Groups */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Groups
</label>
            <input
              name="numberOfGroups"
              value={form.numberOfGroups}
              onChange={handleChange}
              placeholder="Placeholder"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          {/* Max Degree + Field Name */}
          <div className="grid grid-cols-2 gap-4 mb-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Degree
              </label>
              <input
                name="maxDegree"
                value={form.maxDegree}
                onChange={handleChange}
                className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field Name
                </label>
                <select
                  name="fieldName"
                  value={form.fieldName}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option value="">Placeholder</option>
                  <option value="midterm">Midterm</option>
                  <option value="final">Final</option>
                  <option value="practical">Practical</option>
                </select>
              </div>
              <button
                onClick={addDynamicField}
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0"
              >
                +
              </button>
            </div>
          </div>

          {/* Dynamic Fields */}
          {form.dynamicFields.map((field) => (
            <div key={field.id} className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.fieldName}
                </label>
                <input
                  value={field.leftValue}
                  onChange={(e) =>
                    handleDynamicChange(field.id, "leftValue", e.target.value)
                  }
                  placeholder="Placeholder"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.fieldName}
                </label>
                <input
                  value={field.rightValue}
                  onChange={(e) =>
                    handleDynamicChange(field.id, "rightValue", e.target.value)
                  }
                  placeholder="Placeholder"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
            </div>
          ))}

          {/* Messages */}
          {successMsg && (
            <p className="text-green-600 text-sm mb-3">{successMsg}</p>
          )}
          {errorMsg && (
            <p className="text-red-500 text-sm mb-3">{errorMsg}</p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 rounded-xl transition-colors mt-2"
          >
            {loading ? "Saving..." : "Add or Save"}
          </button>
        </div>
      )}
      {activeTab !== "Department Courses" && (
        <div className="bg-white rounded-2xl shadow-sm p-6 max-w-2xl">
          <h2 className="text-xl font-bold text-gray-800">{activeTab}</h2>
          <p className="text-gray-400 mt-2">Content coming soon...</p>
        </div>
      )}
    </div>
  );
}































































































































































































































































