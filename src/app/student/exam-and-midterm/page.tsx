"use client";

import { useEffect, useState } from "react";
import {
  studentExamsService,
  type StudentExamTimeResponse,
  type StudentExamTimeData,
} from "@/services/studentExamsServices";
import { Loader2, AlertCircle } from "lucide-react";

function formatTimeRange(start: string, end: string) {
  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";
    const [hh, mm] = timeStr.split(":");
    let hours = parseInt(hh, 10);
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 becomes 12
    const hoursStr = hours < 10 ? `0${hours}` : `${hours}`;
    return `${hoursStr}:${mm} ${ampm}`;
  };
  if (!start && !end) return "—";
  return `${formatTime(start)} to ${formatTime(end)}`;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const [yyyy, mm, dd] = parts;
    return `${dd}/${mm}/${yyyy}`;
  }
  return dateStr;
}

function ExamTable({ exam }: { exam: StudentExamTimeData }) {
  return (
    <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 mb-6 last:mb-0">
      <h2 className="text-[20px] font-bold text-gray-900 mb-6">
        {exam.examName} Exam Time Table
      </h2>
      <div className="w-full overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Header Row */}
          <div className="grid grid-cols-[1fr_1fr_1.5fr_1.5fr_1fr_1.5fr_1fr] gap-4 px-6 py-4 bg-[#f8f9fb] rounded-xl mb-4 text-[13px] font-bold text-gray-700 items-center">
            <div>Date</div>
            <div>Course Code</div>
            <div>Course Name</div>
            <div>Time</div>
            <div>Seat Number</div>
            <div>Place</div>
            <div>Committie Number</div>
          </div>
          
          {/* Data Rows */}
          <div className="flex flex-col gap-3">
            {exam.courses?.map((course, idx) => (
              <div 
                key={idx}
                className="grid grid-cols-[1fr_1fr_1.5fr_1.5fr_1fr_1.5fr_1fr] gap-4 px-6 py-5 bg-white border border-gray-100 rounded-2xl items-center text-[13px] text-gray-800 font-semibold transition-colors hover:border-gray-200"
              >
                <div>{formatDate(course.date)}</div>
                <div>{course.courseCode}</div>
                <div>{course.courseName}</div>
                <div className="text-gray-600">{formatTimeRange(course.startTime, course.endTime)}</div>
                <div>{course.seatNumber}</div>
                <div>{course.place}</div>
                <div>{course.committeeNumber}</div>
              </div>
            ))}
            {(!exam.courses || exam.courses.length === 0) && (
              <div className="px-6 py-10 text-center text-gray-400 text-[14px] bg-white border border-gray-100 rounded-2xl">
                No exams scheduled for this category.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExamAndMidtermPage() {
  const [data, setData] = useState<StudentExamTimeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await studentExamsService.getStudentExams();
        setData(result);
      } catch (err) {
        console.error(err);
        setError("Failed to load exam time table. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="text-[14px] font-medium">Loading time table…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3 text-red-400 max-w-sm text-center">
          <AlertCircle className="w-9 h-9" strokeWidth={1.5} />
          <p className="text-[14px] font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 w-full max-w-[1200px]">
      {(!data || !data.exams || data.exams.length === 0) ? (
        <div className="bg-white rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
          <p className="text-[14px] font-medium">No exam schedules available.</p>
        </div>
      ) : (
        data.exams.map((exam, index) => (
          <ExamTable key={index} exam={exam} />
        ))
      )}
    </div>
  );
}


