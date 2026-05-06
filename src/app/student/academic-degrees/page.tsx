"use client";

import { useEffect, useState } from "react";
import { studentProfileService } from "@/services/studentProfileServices";

export default function AcademicHistory() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await studentProfileService.getAcademicHistory();
        setData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getGradeColor = (grade: string) => {
    if (!grade) return "bg-gray-100 text-gray-600";

    const normalized = grade.toUpperCase();

    const green = ["A+", "A", "A-"];
    const yellow = ["B+", "B", "B-"];
    const red = ["C+", "C", "C-", "D", "F"];

    if (green.includes(normalized)) return "bg-green-50 text-green-600";
    if (yellow.includes(normalized)) return "bg-yellow-50 text-yellow-600";
    if (red.includes(normalized)) return "bg-red-50 text-red-600";

    return "bg-gray-100 text-gray-600";
  };

  const getDotColor = (grade: string) => {
    const normalized = grade?.toUpperCase();

    if (["A+", "A", "A-"].includes(normalized)) return "bg-green-500";
    if (["B+", "B", "B-"].includes(normalized)) return "bg-yellow-500";
    if (["C+", "C", "C-", "D", "D-", "D+", "F-", "F+", "F"].includes(normalized))
      return "bg-red-500";

    return "bg-gray-400";
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6 p-3 sm:p-4 bg-[#f6f7fb] min-h-screen">

      {data.map((semester, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
            <h2 className="font-semibold text-[15px] sm:text-[16px] text-gray-800">
              {semester.semesterName} {semester.academicYear}
            </h2>

            <div className="text-sm font-medium text-gray-500">
              GPA:{" "}
              <span className="text-gray-800">{semester.semesterGPA}</span>
            </div>
          </div>

          {/* Table Wrapper → SCROLL FIX */}
          <div className="w-full overflow-x-auto rounded-xl border border-gray-300">
            <table className="min-w-[700px] w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-[12px]">
                <tr>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Course Code</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Course Name</th>
                  <th className="px-4 py-3 text-center whitespace-nowrap">Credit Hours</th>
                  <th className="px-4 py-3 text-center whitespace-nowrap">Degree</th>
                  <th className="px-4 py-3 text-center whitespace-nowrap">Grade</th>
                </tr>
              </thead>

              <tbody>
                {(semester.courses || []).map((course: any, i: number) => (
                  <tr
                    key={i}
                    className="border-t border-gray-200 hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {course.courseCode}
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {course.courseName}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600 whitespace-nowrap">
                      {course.creditHours}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600 whitespace-nowrap">
                      {course.finalGrade}
                    </td>

                    {/* Grade Badge */}
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getGradeColor(
                          course.letterGrade
                        )}`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${getDotColor(
                            course.letterGrade
                          )}`}
                        />
                        {course.letterGrade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer → Responsive */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-[12px] text-gray-500 border-t border-gray-300 pt-4">
            <span>Attempted Hours: {semester.attemptedHours}</span>
            <span>Earned Hours: {semester.earnedHours}</span>
            <span>Semester Grade: {semester.semesterGrade}</span>
            <span>Cumulative Grade: {semester.cumulativeGrade}</span>
            <span>Cumulative GPA: {semester.cumulativeGPA}</span>
          </div>
        </div>
      ))}
    </div>
  );
}