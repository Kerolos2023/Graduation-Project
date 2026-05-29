"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { MultiSelect } from '@/components/ui/multi-select';
import { collegeCoursesService, type Course, type CoursePayload } from '@/services/collegeCoursesServices';

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(10);
    const [searchValue, setSearchValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const formRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const [allCoursesOpts, setAllCoursesOpts] = useState<{ label: string; value: string }[]>([]);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<CoursePayload>({
        name: '',
        code: '',
        description: '',
        preRequisiteIds: [],
    });

    const fetchTableData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await collegeCoursesService.getAll(pageNumber, pageSize, searchValue || undefined);
            const items = data.data ?? data.items ?? [];
            const pages = data.totalPages ?? data.meta?.totalPages ?? 1;
            const count = data.totalCount ?? data.totalNumber ?? items.length;

            setCourses(Array.isArray(items) ? items : []);
            setTotalPages(pages);
            setTotalCount(count);
        } catch (err) {
            console.error("Error fetching courses:", err);
        } finally {
            setIsLoading(false);
        }
    }, [pageNumber, pageSize, searchValue]);

    const fetchDropdownData = useCallback(async () => {
        try {
            const data = await collegeCoursesService.getAll(1, 1000);
            const items = data.data ?? data.items ?? [];

            if (Array.isArray(items)) {
                setAllCoursesOpts(
                    items.map((c) => ({ label: c.name || 'Unnamed Course', value: c.id }))
                );
            }
        } catch (err) {
            console.error("Error fetching courses dropdown:", err);
        }
    }, []);

    useEffect(() => {
        fetchTableData();
    }, [fetchTableData]);

    useEffect(() => {
        fetchDropdownData();
    }, [fetchDropdownData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({ name: '', code: '', description: '', preRequisiteIds: [] });
    };

    const handleAddOrSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await collegeCoursesService.update(editingId, formData);
            } else {
                await collegeCoursesService.create(formData);
            }

            resetForm();
            fetchTableData();
            fetchDropdownData();
        } catch (err: any) {
            console.error("Error saving course:", err);
            alert("Error occurred while saving.");
        }
    };

    const handleEditClick = async (course: Course) => {
        setEditingId(course.id);
        setFormData({
            name: course.name ?? '',
            code: course.code ?? '',
            description: course.description ?? '',
            preRequisiteIds: [],
        });

        setTimeout(() => {
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });

            formRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });

            inputRef.current?.focus();
        }, 50);

        try {
            const courseData = await collegeCoursesService.getById(course.id);

            const prereqs: any[] =
                (courseData as any).preRequisites ??
                (courseData as any).PreRequisites ??
                (courseData as any).preRequisiteIds ??
                (courseData as any).PreRequisiteIds ?? [];

            let ids: string[] = Array.isArray(prereqs)
                ? prereqs.map((p: any) => {
                    if (typeof p === 'string') return p;
                    if (typeof p === 'object' && p !== null)
                        return p.id ?? p.Id ?? p.courseId ?? p.CourseId ?? p.preRequisiteId ?? p.PreRequisiteId;
                    return null;
                }).filter(Boolean)
                : [];

            ids = ids.map(id => {
                const match = allCoursesOpts.find(opt => opt.value.toLowerCase() === id.toLowerCase());
                return match ? match.value : id;
            });

            setFormData(prev => ({ ...prev, preRequisiteIds: ids }));
        } catch (err) {
            console.error("Error fetching course details:", err);
        }
    };

    const handleDeleteClick = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this course?")) return;
        try {
            await collegeCoursesService.delete(id);
            fetchTableData();
            fetchDropdownData();
        } catch (err) {
            console.error("Error deleting course:", err);
        }
    };

    const renderInputField = (label: string, name: keyof CoursePayload, placeholder = "Placeholder") => (
        <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[13px] font-bold text-gray-900 ml-1">{label}</label>
            <input
                ref={name === "code" ? inputRef : null}
                type="text"
                name={name}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm font-medium h-auto"
                value={formData[name] as string}
                onChange={handleInputChange}
            />
        </div>
    );

    return (
        <div className="w-full h-full flex flex-col gap-6 font-inter pb-8">

            {/* FORM CARD */}
            <div
                ref={formRef}
                className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0] shrink-0"
            >
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-xl font-bold text-gray-900">
                        {editingId ? "Edit Course" : "Adding Courses"}
                    </h1>
                    {editingId && (
                        <button
                            onClick={resetForm}
                            className="text-red-500 hover:bg-red-50 rounded-xl text-xs font-bold h-9 px-3 cursor-pointer flex items-center gap-1 border border-transparent"
                        >
                            <X className="w-4 h-4" />
                            Cancel Edit
                        </button>
                    )}
                </div>

                <form onSubmit={handleAddOrSave}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        {renderInputField("Course Code", "code", "Ex: CS101")}
                        {renderInputField("Course Name", "name", "Ex: Intro to CS")}

                        <div className="flex flex-col gap-1.5 w-full">
                            <label className="text-[13px] font-bold text-gray-900 ml-1">
                                Prerequisite
                            </label>
                            <MultiSelect
                                options={allCoursesOpts.filter(opt => opt.value !== editingId)}
                                selectedValues={formData.preRequisiteIds}
                                onChange={(ids) =>
                                    setFormData(prev => ({ ...prev, preRequisiteIds: ids }))
                                }
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        {renderInputField("Content Summary", "description", "Enter course summary...")}
                    </div>

                    <button
                        type="submit"
                        className={`w-full active:scale-[0.99] text-white font-semibold py-3.5 rounded-[12px] transition-all shadow-sm cursor-pointer text-sm flex items-center justify-center ${
                            editingId ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    >
                        {editingId ? "Save Changes" : "Add"}
                    </button>
                </form>
            </div>

            {/* LIST CARD */}
            <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <h2 className="text-[22px] font-bold text-gray-900 leading-none">
                            Courses
                        </h2>

                        <span className="bg-[#eff4ff] text-blue-600 text-[11px] font-bold px-3 py-1.5 rounded-full border border-blue-100">
                            {totalCount} Courses
                        </span>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative w-full md:w-[280px]">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                            <input
                                type="text"
                                placeholder="Search"
                                value={searchValue}
                                onChange={(e) => {
                                    setSearchValue(e.target.value);
                                    setPageNumber(1);
                                }}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-[12px] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm font-medium h-auto"
                            />
                        </div>
                    </div>
                </div>

                {/* Table Header */}
                <div className="hidden md:flex items-center w-full px-5 py-4 mb-3 border border-gray-100 bg-[#fafafa] rounded-xl">
                    <div className="flex items-center gap-4 flex-1">
                        <span className="text-[13px] font-bold text-gray-800 w-1/2">
                            Name
                        </span>
                        <span className="text-[13px] font-bold text-gray-800 w-1/2">
                            Code
                        </span>
                    </div>
                    <div className="w-[80px]"></div>
                </div>

                {/* Table Body */}
                <div className="flex flex-col gap-3 mb-8">
                    {isLoading && (
                        <div className="text-center p-4 text-gray-500 text-sm">
                            <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" /> Loading...
                        </div>
                    )}

                    {!isLoading && courses.length === 0 && (
                        <div className="text-center p-8 text-gray-400 border border-gray-100 rounded-xl border-dashed">
                            No courses found.
                        </div>
                    )}

                    {!isLoading && courses.map((course) => (
                        <div
                            key={course.id}
                            className="flex flex-col sm:flex-row sm:items-center w-full px-5 py-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-white group gap-3 sm:gap-4 relative"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 flex-1 w-full">
                                <div className="w-full sm:w-1/2 truncate">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 sm:hidden block mb-1">Name</span>
                                    <span className="text-[14px] font-bold text-gray-900 truncate">
                                        {course.name}
                                    </span>
                                </div>

                                <div className="w-full sm:w-1/2 truncate">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 sm:hidden block mb-1">Code</span>
                                    <span className="text-[14px] font-bold text-gray-500 sm:text-gray-900 truncate">
                                        {course.code}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 absolute right-4 top-4 sm:relative sm:right-auto sm:top-auto">
                                <button
                                    onClick={() => handleEditClick(course)}
                                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors bg-white cursor-pointer"
                                >
                                    <Pencil className="w-[18px] h-[18px]" strokeWidth={2.5} />
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(course.id)}
                                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors bg-white cursor-pointer"
                                >
                                    <Trash2 className="w-[18px] h-[18px]" strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-2">
                        <Pagination
                            currentPage={pageNumber}
                            totalPages={totalPages}
                            onPageChange={setPageNumber}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}