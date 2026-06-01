'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Pencil, Plus, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { getAllCourses } from '@/services/coursesServices';
import { useAcademicContext } from "@/hooks/useAcademicContext";

export default function CoursesPage() {
  const router = useRouter();
  const [allCourses, setAllCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const { selectedProgramId, selectedSemesterId, academicVersion } = useAcademicContext();

  useEffect(() => {
    if (!selectedProgramId || !selectedSemesterId) return;
    setLoading(true);
    getAllCourses(selectedProgramId, selectedSemesterId)
      .then(setAllCourses)
      .catch((err) => console.error("Error loading courses:", err))
      .finally(() => setLoading(false));
  }, [selectedProgramId, selectedSemesterId, academicVersion]);

  const filteredCourses = useMemo(() => {
    return allCourses.filter((course: any) =>
      course.couresName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.couresCode.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allCourses]);

  return (
    <div className="w-full h-full min-h-screen bg-[#F5F5F5] p-4 md:p-8 flex flex-col gap-6 font-sans antialiased" dir="ltr">
      <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.01)] border border-[#eaebf0] max-w-6xl w-full mx-auto space-y-6">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-[#0D1B2A] leading-none">Courses</h2>
            <Badge className="bg-[#EFF4FF] text-[#2563EB] text-xs font-bold px-3 py-1.5 rounded-full border border-blue-50 shadow-none hover:bg-[#EFF4FF]">
              {loading ? "..." : `${filteredCourses.length} Courses`}
            </Badge>
          </div>

          <div className="relative w-full md:w-[280px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium h-12 shadow-none"
            />
          </div>
        </div>

        <div className="hidden md:grid grid-cols-[1.5fr_1fr_1.5fr_60px] px-6 py-4 mb-1 border border-gray-100 bg-[#FAFAFA] rounded-xl font-bold text-gray-500 text-[13px]">
          <div>Name</div>
          <div>Code</div>
          <div>Number of registered students</div>
          <div></div>
        </div>

        {/* Table Body */}
        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="text-center p-12 text-gray-500 text-sm bg-gray-50/30 border border-dashed rounded-xl">
              <Loader2 className="animate-spin w-6 h-6 inline-block mr-2 text-blue-600" /> Loading courses data...
            </div>
          ) : (
            filteredCourses.map((course: any) => {
              const isUpdateState = course.hasExam === true;

              return (
                <div
                  key={course.id}
                  className={`flex flex-col md:grid md:grid-cols-[1.5fr_1fr_1.5fr_60px] items-start md:items-center px-6 py-4 border rounded-xl transition-all bg-white gap-3 md:gap-0 relative text-[14px] text-gray-700 ${isUpdateState
                      ? "border-[#22C55E] ring-1 ring-[#22C55E]/10 shadow-sm"
                      : "border-gray-100 hover:shadow-sm"
                    }`}
                >
                  <div className="flex flex-col md:block w-full md:w-auto">
                    <span className="text-[11px] uppercase font-bold text-gray-400 md:hidden mb-1">Name</span>
                    <div className="font-bold text-gray-900 truncate">{course.couresName}</div>
                  </div>

                  <div className="flex flex-col md:block w-full md:w-auto">
                    <span className="text-[11px] uppercase font-bold text-gray-400 md:hidden mb-1">Code</span>
                    <div className="font-medium text-gray-500 md:text-gray-900 truncate">{course.couresCode}</div>
                  </div>

                  <div className="flex flex-col md:block w-full md:w-auto">
                    <span className="text-[11px] uppercase font-bold text-gray-400 md:hidden mb-1">Students</span>
                    <div className="font-medium text-gray-500 md:text-gray-900 truncate">{course.numberOfStudents}</div>
                  </div>

                  <div className="flex items-center justify-end absolute right-4 top-4 md:relative md:right-auto md:top-auto">
                    <button
                      onClick={() => {
                        const examTermGuid = "019e2720-94e6-7743-9362-bbb1a87cd280";
                        const actualExamId = isUpdateState
                          ? (course.courseOfferingExamId || "")
                          : "00000000-0000-0000-0000-000000000000";

                        router.push(
                          `/student-affairs/commites/adding/${course.id}` +
                          `?termId=${examTermGuid}` +
                          `&semesterId=${selectedSemesterId || "019df777-7a6a-7c4b-af7e-6a7affd69cb7"}` +
                          `&programId=${selectedProgramId || "019df1d0-ddcc-7f90-9a82-1e1d8d1c0cfe"}` +
                          `&courseName=${encodeURIComponent(course.couresName)}` +
                          `&examId=${actualExamId}`
                        );
                      }}
                      className={`p-2 rounded-xl transition-all cursor-pointer border bg-white flex items-center justify-center ${isUpdateState
                          ? "text-[#22C55E] border-green-100 hover:bg-green-50"
                          : "text-[#2563EB] border-blue-100 hover:bg-blue-50"
                        }`}
                    >
                      {isUpdateState ? (
                        <Pencil className="w-[18px] h-[18px]" strokeWidth={2.2} />
                      ) : (
                        <Plus className="w-[18px] h-[18px]" strokeWidth={2.5} />
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {!loading && filteredCourses.length === 0 && (
          <div className="text-center p-12 text-gray-400 border border-gray-100 rounded-xl border-dashed bg-gray-50/40 text-sm font-medium">
            No results found for "{searchQuery}"
          </div>
        )}


        {!loading && filteredCourses.length > 0 && (
          <div className="flex items-center justify-center pt-4 border-t border-gray-50">
            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
              <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-400 transition-colors cursor-pointer flex items-center gap-1">
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-200 font-bold text-gray-900 text-xs">
                01
              </button>
              <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-50 text-xs transition-colors">
                02
              </button>
              <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-50 text-xs transition-colors">
                03
              </button>
              <span className="px-1 text-gray-400 text-xs">...</span>
              <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-50 text-xs transition-colors">
                08
              </button>
              <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-50 text-xs transition-colors">
                09
              </button>
              <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-50 text-xs transition-colors">
                10
              </button>

              <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-[#2563EB] border-blue-100 bg-white transition-colors cursor-pointer flex items-center gap-1 ml-1 font-semibold">
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}