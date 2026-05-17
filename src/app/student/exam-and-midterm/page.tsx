"use client";

import { useEffect, useState } from "react";
import {
  studentExamsService,
  type StudentExamSemester,
  type StudentExamCourse,
} from "@/services/studentExamsServices";
import {
  BookOpen,
  TrendingUp,
  Award,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getGradeBadgeStyle(grade: string) {
  const g = grade?.toUpperCase();
  if (["A+", "A", "A-"].includes(g))
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (["B+", "B", "B-"].includes(g))
    return "bg-blue-50 text-blue-700 border-blue-200";
  if (["C+", "C", "C-"].includes(g))
    return "bg-yellow-50 text-yellow-700 border-yellow-200";
  if (["D+", "D", "D-", "F"].includes(g))
    return "bg-red-50 text-red-700 border-red-200";
  return "bg-gray-100 text-gray-500 border-gray-200";
}

function getDotColor(grade: string) {
  const g = grade?.toUpperCase();
  if (["A+", "A", "A-"].includes(g)) return "bg-emerald-500";
  if (["B+", "B", "B-"].includes(g)) return "bg-blue-500";
  if (["C+", "C", "C-"].includes(g)) return "bg-yellow-500";
  if (["D+", "D", "D-", "F"].includes(g)) return "bg-red-500";
  return "bg-gray-400";
}

function getGpaColor(gpa: number) {
  if (gpa >= 3.5) return "text-emerald-600";
  if (gpa >= 2.5) return "text-blue-600";
  if (gpa >= 1.5) return "text-yellow-600";
  return "text-gray-500";
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function StatPill({
  label,
  value,
  className,
}: {
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 min-w-[90px]",
        className
      )}
    >
      <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap">
        {label}
      </span>
      <span className="text-[15px] font-bold text-gray-800 mt-0.5">
        {value}
      </span>
    </div>
  );
}

function CourseRow({ course, index }: { course: StudentExamCourse; index: number }) {
  return (
    <tr
      className={cn(
        "border-t border-gray-100 transition-colors hover:bg-gray-50/80",
        index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
      )}
    >
      <td className="px-4 py-3.5 whitespace-nowrap">
        <span className="font-mono text-[12px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
          {course.courseCode}
        </span>
      </td>
      <td className="px-4 py-3.5 text-[13px] text-gray-700 font-medium whitespace-nowrap">
        {course.courseName}
      </td>
      <td className="px-4 py-3.5 text-center">
        <span className="inline-flex items-center gap-1 text-[13px] text-gray-600">
          <Clock className="w-3 h-3 text-gray-400" />
          {course.creditHours}
        </span>
      </td>
      <td className="px-4 py-3.5 text-center text-[13px] font-semibold text-gray-700">
        {course.finalGrade}
      </td>
      <td className="px-4 py-3.5 text-center">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold border",
            getGradeBadgeStyle(course.letterGrade)
          )}
        >
          <span
            className={cn("w-1.5 h-1.5 rounded-full", getDotColor(course.letterGrade))}
          />
          {course.letterGrade}
        </span>
      </td>
    </tr>
  );
}

function SemesterCard({ semester }: { semester: StudentExamSemester }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* ── Card Header ── */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 hover:bg-gray-50/60 transition-colors cursor-pointer text-left"
      >
        {/* Title + GPA */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 text-blue-500" strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="font-bold text-[15px] text-gray-900">
              {semester.semesterName}{" "}
              <span className="text-gray-500 font-medium">
                {semester.academicYear}
              </span>
            </h2>
            <p className="text-[12px] text-gray-400 mt-0.5">
              {semester.courses.length} courses enrolled
            </p>
          </div>
        </div>

        {/* Right: Stats + toggle */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-400" strokeWidth={1.75} />
            <span className="text-[13px] text-gray-500 font-medium">GPA</span>
            <span
              className={cn(
                "text-[15px] font-bold",
                getGpaColor(semester.semesterGPA)
              )}
            >
              {semester.semesterGPA > 0 ? semester.semesterGPA.toFixed(2) : "—"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-gray-400" strokeWidth={1.75} />
            <span className="text-[13px] text-gray-500 font-medium">Grade</span>
            <span
              className={cn(
                "text-[12px] font-bold px-2 py-0.5 rounded-full border",
                getGradeBadgeStyle(semester.semesterGrade)
              )}
            >
              {semester.semesterGrade}
            </span>
          </div>
          <div className="ml-2 text-gray-400">
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>
      </button>

      {/* ── Expandable Body ── */}
      {expanded && (
        <div className="px-5 sm:px-6 pb-6 space-y-4">
          {/* Course Table */}
          <div className="w-full overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-[620px] w-full text-sm">
              <thead className="bg-gray-50 text-gray-400 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Code</th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Course Name
                  </th>
                  <th className="px-4 py-3 text-center font-semibold">
                    Credit Hrs
                  </th>
                  <th className="px-4 py-3 text-center font-semibold">
                    Final Grade
                  </th>
                  <th className="px-4 py-3 text-center font-semibold">
                    Letter
                  </th>
                </tr>
              </thead>
              <tbody>
                {semester.courses.length > 0 ? (
                  semester.courses.map((course, i) => (
                    <CourseRow key={i} course={course} index={i} />
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-gray-400 text-[13px]"
                    >
                      No courses found for this semester.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap gap-2.5 pt-1">
            <StatPill label="Attempted" value={`${semester.attemptedHours}h`} />
            <StatPill label="Earned" value={`${semester.earnedHours}h`} />
            <StatPill label="Sem. Grade" value={semester.semesterGrade} />
            <StatPill label="Cum. Grade" value={semester.cumulativeGrade} />
            <StatPill
              label="Cum. GPA"
              value={
                semester.cumulativeGPA > 0
                  ? semester.cumulativeGPA.toFixed(2)
                  : "—"
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ExamAndMidtermPage() {
  const [data, setData] = useState<StudentExamSemester[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await studentExamsService.getStudentExams();
        setData(result);
      } catch (err) {
        console.error(err);
        setError("Failed to load exam results. Please try again.");
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
          <span className="text-[14px] font-medium">Loading exam results…</span>
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
    <div className="space-y-5 p-3 sm:p-4 bg-[#f6f7fb] min-h-screen">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm shrink-0">
          <BookOpen className="w-5 h-5 text-white" strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="font-bold text-[17px] text-gray-900">Exam Results</h1>
          <p className="text-[12px] text-gray-400">
            Your semester-by-semester academic performance
          </p>
        </div>
      </div>

      {/* Semester Cards */}
      {data.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
          <BookOpen className="w-10 h-10" strokeWidth={1.25} />
          <p className="text-[14px] font-medium">No exam results available.</p>
        </div>
      ) : (
        data.map((semester, index) => (
          <SemesterCard key={index} semester={semester} />
        ))
      )}
    </div>
  );
}

