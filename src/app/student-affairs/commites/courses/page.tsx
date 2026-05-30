'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Pencil, Loader2 } from "lucide-react";
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
      .finally(() => setLoading(false));
  }, [selectedProgramId, selectedSemesterId, academicVersion]);

  const filteredCourses = useMemo(() => {
    return allCourses.filter((course: any) =>
      course.couresName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.couresCode.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allCourses]);

  return (
    <div className="w-full h-full flex flex-col gap-6 font-inter pb-8">

      <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0]">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-[22px] font-bold text-gray-900 leading-none">Courses</h2>
            <Badge className="bg-[#eff4ff] text-blue-600 text-[11px] font-bold px-3 py-1.5 rounded-full border border-blue-100 hover:bg-[#eff4ff] shadow-none">
              {loading ? "..." : `${filteredCourses.length} Courses`}
            </Badge>
          </div>

          <div className="relative w-full md:w-[280px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-[12px] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm font-medium h-auto"
            />
          </div>
        </div>

        {/* Table Header */}
        <div className="hidden md:grid grid-cols-[1.5fr_1fr_1.5fr_100px] px-5 py-4 mb-3 border border-gray-100 bg-[#fafafa] rounded-xl font-bold text-gray-800">
          <div className="text-[13px]">Name</div>
          <div className="text-[13px]">Code</div>
          <div className="text-[13px]">Number of registered students</div>
          <div className="text-right px-2 text-[13px]">Action</div>
        </div>

        {/* Table Body */}
        <div className="flex flex-col gap-3 mb-8">
          {loading ? (
            <div className="text-center p-4 text-gray-500 text-sm">
              <Loader2 className="animate-spin w-5 h-5 inline-block mr-2 text-blue-600" /> Loading...
            </div>
          ) : (
            filteredCourses.map((course: any) => (
              <div
                key={course.id}
                className="flex flex-col md:grid md:grid-cols-[1.5fr_1fr_1.5fr_100px] items-start md:items-center px-5 py-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-white group gap-3 md:gap-0 relative"
              >
                <div className="flex flex-col md:block w-full md:w-auto">
                  <span className="text-[10px] uppercase font-bold text-gray-400 md:hidden mb-1">Name</span>
                  <div className="text-[14px] font-bold text-gray-900 truncate">{course.couresName}</div>
                </div>

                <div className="flex flex-col md:block w-full md:w-auto">
                  <span className="text-[10px] uppercase font-bold text-gray-400 md:hidden mb-1">Code</span>
                  <div className="text-[14px] font-bold text-gray-500 md:text-gray-900 truncate">{course.couresCode}</div>
                </div>

                <div className="flex flex-col md:block w-full md:w-auto">
                  <span className="text-[10px] uppercase font-bold text-gray-400 md:hidden mb-1">Students</span>
                  <div className="text-[14px] font-bold text-gray-500 md:text-gray-900 truncate">{course.numberOfStudents}</div>
                </div>

                <div className="flex items-center justify-end gap-2 absolute right-4 top-4 md:relative md:right-auto md:top-auto">
                  <button
                    onClick={() => {
                      const examTermGuid = "019e2720-94e6-7743-9362-bbb1a87cd280";
                      const actualExamId = course.courseOfferingExamId || "";

                      router.push(
                        `/student-affairs/commites/adding/${course.id}` +
                        `?termId=${examTermGuid}` +
                        `&courseName=${encodeURIComponent(course.couresName)}` +
                        `&examId=${actualExamId}`
                      );
                    }}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors bg-white cursor-pointer"
                  >
                    <Pencil className="w-[18px] h-[18px] rotate-90" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {!loading && filteredCourses.length === 0 && (
          <div className="text-center p-8 text-gray-400 border border-gray-100 rounded-xl border-dashed">
            No results found for "{searchQuery}"
          </div>
        )}

      </div>
    </div>
  );
}