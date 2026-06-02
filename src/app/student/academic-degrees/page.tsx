"use client";

import { useEffect, useState } from "react";
import { FcViewDetails } from "react-icons/fc";
import { FiInbox } from "react-icons/fi";
import axiosInstance from "@/lib/axios";
import { studentProfileService } from "@/services/studentProfileServices";

export default function AcademicHistory() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [assessmentDetails, setAssessmentDetails] = useState<any[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [emptyMessage, setEmptyMessage] = useState("");
  const [selectedCourseName, setSelectedCourseName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await studentProfileService.getAcademicHistory();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleOpenDetails = async (course: any) => {
    const id =
      course.courseOfferingId || course.id || course.courseId;

    if (!id) return;

    setSelectedCourseName(course.courseName || "Course Details");
    setIsDetailsOpen(true);

    setDetailsLoading(true);
    setAssessmentDetails([]);
    setEmptyMessage("");

    try {
      const res = await axiosInstance.get(
        "/students/assessments-in-course",
        { params: { courseOfferingId: id } }
      );

      const result = Array.isArray(res.data) ? res.data : [];

      if (result.length === 0) {
        setEmptyMessage("Results not published yet");
      } else {
        setAssessmentDetails(result);
      }
    } catch (err) {
      setEmptyMessage("Failed to load data");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setAssessmentDetails([]);
    setEmptyMessage("");
    setDetailsLoading(false);
    setSelectedCourseName("");
  };

  const getGradeColor = (grade: string) => {
    if (!grade) return "bg-gray-100 text-gray-600";

    const g = grade.toUpperCase();

    if (["A+", "A", "A-"].includes(g)) return "bg-green-50 text-green-600";
    if (["B+", "B", "B-"].includes(g)) return "bg-yellow-50 text-yellow-600";
    if (["C+", "C", "C-", "D", "F"].includes(g)) return "bg-red-50 text-red-600";

    return "bg-gray-100 text-gray-600";
  };

  const getDotColor = (grade: string) => {
    const g = grade?.toUpperCase();

    if (["A+", "A", "A-"].includes(g)) return "bg-green-500";
    if (["B+", "B", "B-"].includes(g)) return "bg-yellow-500";
    if (["C+", "C", "C-", "D", "F"].includes(g)) return "bg-red-500";

    return "bg-gray-400";
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 bg-white border rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 bg-[#f6f7fb] min-h-screen">

      {/* SEMESTERS */}
      {data.map((semester, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl shadow-sm border p-5"
        >
          <div className="flex justify-between mb-4">
            <h2 className="font-semibold">
              {semester.semesterName} {semester.academicYear}
            </h2>

            <span className="text-gray-500">
              GPA: <b>{semester.semesterGPA}</b>
            </span>
          </div>

          <div className="overflow-x-auto border rounded-xl">
            <table className="w-full min-w-[700px] text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="p-3 text-left">Code</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-center">Hours</th>
                  <th className="p-3 text-center">Degree</th>
                  <th className="p-3 text-center">Details</th>
                  <th className="p-3 text-center">Grade</th>
                </tr>
              </thead>

              <tbody>
                {semester.courses?.map((course: any, i: number) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="p-3">{course.courseCode}</td>
                    <td className="p-3">{course.courseName}</td>
                    <td className="p-3 text-center">{course.creditHours}</td>
                    <td className="p-3 text-center">{course.totalDegree}</td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleOpenDetails(course)}
                        className="p-2 rounded-lg border hover:bg-gray-100"
                      >
                        <FcViewDetails size={18} />
                      </button>
                    </td>

                    <td className="p-3 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${getGradeColor(
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
          onClick={handleCloseDetails}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="p-4 border-b flex justify-between">
              <div>
                <h3 className="font-semibold">Degree Details</h3>
                <p className="text-sm text-gray-500">
                  {selectedCourseName}
                </p>
              </div>

              <button onClick={handleCloseDetails}>✕</button>
            </div>

            {/* BODY */}
            <div className="p-5 max-h-[70vh] overflow-y-auto">

              <div className="grid grid-cols-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                <span>Name</span>
                <span className="text-right">Score</span>
              </div>

              <div className="mt-3 space-y-3">

                {/* LOADING */}
                {detailsLoading && (
                  <div className="text-center py-6 text-gray-500">
                    Loading...
                  </div>
                )}

                {/* EMPTY / ERROR */}
                {!detailsLoading && emptyMessage && (
                  <div className="flex flex-col items-center py-10 text-gray-500">
                    <FiInbox size={30} className="mb-2" />
                    <p>{emptyMessage}</p>
                  </div>
                )}

                {/* DATA */}
                {!detailsLoading &&
                  !emptyMessage &&
                  assessmentDetails.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="grid grid-cols-2 p-4 border rounded-xl"
                    >
                      <span>{item.assessmentName}</span>
                      <span className="text-right font-semibold text-blue-600">
                        {item.studentScore}/{item.maxScore}
                      </span>
                    </div>
                  ))}

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}