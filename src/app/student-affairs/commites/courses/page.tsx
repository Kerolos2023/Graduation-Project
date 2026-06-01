

"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Search, Pencil, Plus, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useRouter } from 'next/navigation';
import { useAcademicContext } from "@/hooks/useAcademicContext";
import { getAllCourses } from '@/services/coursesServices';

export default function CoursesPage() {
    const router = useRouter();
    const [allCourses, setAllCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
const { selectedProgramId, selectedSemesterId, academicVersion } = useAcademicContext();
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

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
            course.couresName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            course.couresCode.toLowerCase().includes(debouncedSearch.toLowerCase())
        );
    }, [debouncedSearch, allCourses]);

    const totalCount = filteredCourses.length;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPageNumber(1);
    };

     const paginatedCourses = useMemo(() => {
        const startIndex = (pageNumber - 1) * pageSize;
        return filteredCourses.slice(startIndex, startIndex + pageSize);
    }, [filteredCourses, pageNumber, pageSize]);

    
    const renderPageNumbers = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            const isCurrent = i === pageNumber;
            pages.push(
                <button
                    key={i}
                    onClick={() => setPageNumber(i)}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors font-bold text-xs cursor-pointer ${
                        isCurrent
                            ? "bg-gray-50 border border-gray-200 text-gray-900"
                            : "hover:bg-gray-50 text-gray-500"
                    }`}
                >
                    {String(i).padStart(2, '0')}
                </button>
            );
        }
        return pages;
    };

    return (
        <div className="w-full h-full flex flex-col gap-6 font-inter pb-8" dir="ltr">

             <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0]">
                
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <h2 className="text-[22px] font-bold text-gray-900 leading-none">
                            Courses
                        </h2>
                        <Badge className="bg-[#eff4ff] text-blue-600 text-[11px] font-bold px-3 py-1.5 rounded-full border border-blue-100 hover:bg-[#eff4ff] shadow-none">
                            {loading ? "..." : `${totalCount} Courses`}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative w-full md:w-[280px]">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-[12px] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm font-medium h-auto"
                            />
                        </div>
                    </div>
                </div>

                 <div className="hidden md:grid grid-cols-[1.5fr_1fr_1.5fr_60px] px-6 py-4 mb-3 border border-gray-100 bg-[#fafafa] rounded-xl font-bold text-gray-800 text-[13px]">
                    <div>Name</div>
                    <div>Code</div>
                    <div>Number of <br /> registered   students</div>
                    <div></div>
                </div>

                 <div className="flex flex-col gap-3 mb-8">
                    {loading ? (
                        <div className="text-center p-12 text-gray-500 text-sm bg-gray-50/30 border border-dashed rounded-xl">
                            <Loader2 className="w-5 h-5 animate-spin inline-block mr-2 text-blue-600" /> Loading courses data...
                        </div>
                    ) : paginatedCourses.length === 0 ? (
                        <div className="text-center p-8 text-gray-400 border border-gray-100 rounded-xl border-dashed">
                            No courses found.
                        </div>
                    ) : (
                        paginatedCourses.map((course: any) => {
                            const isUpdateState = course.hasExam === true;

                            return (
                                <div
                                    key={course.id}
                                    className={`flex flex-col md:grid md:grid-cols-[1.5fr_1fr_1.5fr_60px] items-start md:items-center px-6 py-4 border rounded-xl transition-all bg-white gap-3 md:gap-0 relative text-[14px] text-gray-700 ${
                                        isUpdateState
                                            ? "border-[#22C55E] ring-1 ring-[#22C55E]/10 shadow-sm"
                                            : "border-gray-100 hover:shadow-sm"
                                    }`}
                                >
                                    <div className="flex flex-col md:block w-full md:w-auto">
                                        <span className="text-[10px] uppercase font-bold text-gray-400 md:hidden mb-1">Name</span>
                                        <div className="font-bold text-gray-900 truncate">{course.couresName}</div>
                                    </div>

                                    <div className="flex flex-col md:block w-full md:w-auto">
                                        <span className="text-[10px] uppercase font-bold text-gray-400 md:hidden mb-1">Code</span>
                                        <div className="font-medium text-gray-500 md:text-gray-900 truncate">{course.couresCode}</div>
                                    </div>

                                    <div className="flex flex-col md:block w-full md:w-auto">
                                        <span className="text-[10px] uppercase font-bold text-gray-400 md:hidden mb-1">Students</span>
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
                                            className={`p-2 rounded-xl transition-all cursor-pointer border bg-white flex items-center justify-center ${
                                                isUpdateState
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
                {!loading && filteredCourses.length > 0 && totalPages > 1 && (
                    <div className="flex justify-center mt-2">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
                            <button
                                disabled={pageNumber === 1}
                                onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                                className={`p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-400 transition-colors flex items-center gap-1 ${
                                    pageNumber === 1 ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
                                }`}
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Previous
                            </button>

                            {renderPageNumbers()}

                            <button
                                disabled={pageNumber === totalPages}
                                onClick={() => setPageNumber(prev => Math.min(prev + 1, totalPages))}
                                className={`p-2 border rounded-xl hover:bg-gray-50 text-[#2563EB] border-blue-100 bg-white transition-colors flex items-center gap-1 ml-1 font-semibold ${
                                    pageNumber === totalPages ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
                                }`}
                            >
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