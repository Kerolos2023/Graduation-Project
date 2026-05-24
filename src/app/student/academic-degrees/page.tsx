"use client";

import { useEffect, useState } from "react";
import { FcViewDetails } from "react-icons/fc";
import axiosInstance from "@/lib/axios";
import { studentProfileService } from "@/services/studentProfileServices";

export default function AcademicHistory() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [assessmentDetails, setAssessmentDetails] = useState<any[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [selectedCourseName, setSelectedCourseName] = useState("");

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

  const getErrorMessage = (err: unknown, fallback: string) => {
    const axiosErr = err as {
      message?: string;
      response?: { data?: any };
    };

    const responseData = axiosErr.response?.data;
    if (!responseData) return axiosErr.message || fallback;
    if (typeof responseData === "string") return responseData;
    if (responseData.message) return responseData.message;
    if (responseData.error) return responseData.error;
    if (Array.isArray(responseData.errors)) return responseData.errors.join(" ");

    if (typeof responseData === "object") {
      const values = Object.values(responseData).flat();
      return values.filter(Boolean).join(" ") || axiosErr.message || fallback;
    }

    return axiosErr.message || fallback;
  };

  const handleOpenDetails = async (course: any) => {
    const courseOfferingId =
      course.courseOfferingId || course.id || course.courseId;

    if (!courseOfferingId) {
      setDetailsError("Course details are not available.");
      setIsDetailsOpen(true);
      return;
    }

    setSelectedCourseName(
      course.courseName || course.courseCode || "Course details"
    );
    setDetailsLoading(true);
    setDetailsError("");
    setAssessmentDetails([]);
    setIsDetailsOpen(true);

    try {
      const res = await axiosInstance.get(
        "/students/assessments-in-course",
        { params: { courseOfferingId } }
      );
      setAssessmentDetails(res.data || []);
    } catch (err) {
      setDetailsError(getErrorMessage(err, "Failed to load degree details."));
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setAssessmentDetails([]);
    setDetailsLoading(false);
    setDetailsError("");
    setSelectedCourseName("");
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
              GPA: <span className="text-gray-800">{semester.semesterGPA}</span>
            </div>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto rounded-xl border border-gray-300">
            <table className="min-w-[700px] w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-[12px]">
                <tr>
                  <th className="px-4 py-3 text-left">Course Code</th>
                  <th className="px-4 py-3 text-left">Course Name</th>
                  <th className="px-4 py-3 text-center">Credit Hours</th>
                  <th className="px-4 py-3 text-center">Degree</th>
                  <th className="px-4 py-3 text-center">Degree Details</th>
                  <th className="px-4 py-3 text-center">Grade</th>
                </tr>
              </thead>

              <tbody>
                {(semester.courses || []).map((course: any, i: number) => (
                  <tr
                    key={i}
                    className="border-t border-gray-200 hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3">{course.courseCode}</td>
                    <td className="px-4 py-3">{course.courseName}</td>
                    <td className="px-4 py-3 text-center">
                      {course.creditHours}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {course.totalDegree}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleOpenDetails(course)}
                        className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white p-2 hover:bg-gray-100"
                      >
                        <FcViewDetails size={20} />
                      </button>
                    </td>

                    <td className="px-4 py-3 text-center">
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
        </div>
      ))}

      {/* MODAL */}
      {isDetailsOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={handleCloseDetails} // 👈 click outside closes
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()} // 👈 prevent inside click close
          >
            {/* Header */}
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Degree Details</h3>
                <p className="text-sm text-gray-500">{selectedCourseName}</p>
              </div>

              <button
                onClick={handleCloseDetails}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-5 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-500 font-medium">
                <span>Name</span>
                <span className="text-right">Your Degree</span>
              </div>

              <div className="mt-3 space-y-3">
                {detailsLoading ? (
                  <p>Loading...</p>
                ) : detailsError ? (
                  <p className="text-red-600">{detailsError}</p>
                ) : assessmentDetails.length === 0 ? (
                  <p>No degree details found.</p>
                ) : (
                  assessmentDetails.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="grid grid-cols-2 bg-white border rounded-xl px-4 py-4"
                    >
                      <span>{item.assessmentName}</span>
                      <span className="text-right font-semibold text-blue-600">
                        {item.studentScore}
                        <span className="text-gray-400">
                          /{item.maxScore}
                        </span>
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}