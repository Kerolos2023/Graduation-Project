"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Printer, Pencil, Trash2 } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { MultiSelect } from '@/components/ui/multi-select';
import { collegeCoursesService, type Course, type CoursePayload } from '@/services/collegeCoursesServices';

export default function CoursesPage() {
    // ── Table / Pagination state ────────────────────────────────────────────
    const [courses, setCourses] = useState<Course[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(10);
    const [searchValue, setSearchValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // ── Dropdown options ────────────────────────────────────────────────────
    const [allCoursesOpts, setAllCoursesOpts] = useState<{ label: string; value: string }[]>([]);

    // ── Form state ──────────────────────────────────────────────────────────
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<CoursePayload>({
        name: '',
        code: '',
        description: '',
        preRequisiteIds: [],
    });

    // ── API helpers ─────────────────────────────────────────────────────────

    const fetchTableData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await collegeCoursesService.getAll(pageNumber, pageSize, searchValue || undefined);
            const items = data.data ?? data.items ?? [];
            const pages = data.totalPages ?? data.meta?.totalPages ?? 1;
            setCourses(Array.isArray(items) ? items : []);
            setTotalPages(pages);
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

    useEffect(() => { fetchTableData(); }, [fetchTableData]);
    useEffect(() => { fetchDropdownData(); }, [fetchDropdownData]);

    // ── Handlers ────────────────────────────────────────────────────────────

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
            let errorMessage = "An error occurred while saving.";
            if (err.response?.data) {
                const data = err.response.data;
                if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
                    errorMessage = data.errors.join("\n");
                } else if (data.message) {
                    errorMessage = data.message;
                } else if (data.title) {
                    errorMessage = data.title;
                }
            } else if (err.message) {
                errorMessage = err.message;
            }
            alert(errorMessage);
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
        window.scrollTo({ top: 0, behavior: 'smooth' });

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

            // Normalise casing to match dropdown options
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
            <label className="text-sm font-semibold text-gray-800">{label}</label>
            <input
                type="text"
                name={name}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm"
                value={formData[name] as string}
                onChange={handleInputChange}
            />
        </div>
    );

    return (
        <div className="w-full h-full flex flex-col gap-6 font-inter pb-8">

            {/* Upper Form Section */}
            <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0] shrink-0">
                <h1 className="text-xl font-bold text-gray-900 mb-6">Courses</h1>
                <form onSubmit={handleAddOrSave}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
                        {renderInputField("Course Code", "code", "Ex: CS101")}
                        {renderInputField("Course Name", "name", "Ex: Intro to CS")}

                        {/* Prerequisite MultiSelect */}
                        <div className="flex flex-col gap-1.5 w-full">
                            <label className="text-sm font-semibold text-gray-800">Prerequisite</label>
                            <MultiSelect
                                options={allCoursesOpts.filter(opt => opt.value !== editingId)}
                                selectedValues={formData.preRequisiteIds}
                                onChange={(ids) => setFormData(prev => ({ ...prev, preRequisiteIds: ids }))}
                                placeholder="Select Prerequisites..."
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        {renderInputField("Content Summary", "description", "Enter course summary...")}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-medium py-3 rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                        {editingId ? "Save Changes" : "Add Course"}
                    </button>
                </form>
            </div>

            {/* Bottom List Section */}
            <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0]">
                {/* Table Header Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-gray-900 leading-none">Courses</h2>
                        <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-100">
                            {courses.length} Course
                        </span>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchValue}
                                onChange={(e) => {
                                    setSearchValue(e.target.value);
                                    setPageNumber(1);
                                }}
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm"
                            />
                        </div>

                        <button className="flex items-center justify-center gap-2 px-4 py-2 min-w-[100px] rounded-xl border border-blue-200 text-blue-600 font-medium hover:bg-blue-50 transition-colors bg-white cursor-pointer">
                            <Printer className="w-4 h-4" />
                            Print
                        </button>
                    </div>
                </div>

                {/* Table Header */}
                <div className="flex items-center w-full px-5 py-4 mb-3 border border-gray-100 bg-[#fafafa] rounded-xl gap-4">
                    <div className="flex items-center gap-1 sm:gap-4 flex-1 w-full">
                        <span className="text-[13px] font-bold text-gray-800 w-1/3">Name</span>
                        <span className="text-[13px] font-bold text-gray-800 w-1/3">Code</span>
                    </div>
                    <div className="flex items-center justify-end gap-3 invisible">
                        <button className="p-1.5 w-[30px] h-[30px]" />
                        <button className="p-1.5 w-[30px] h-[30px]" />
                    </div>
                </div>

                {/* Table Rows */}
                <div className="flex flex-col gap-3 mb-6">
                    {isLoading && <div className="text-center p-4 text-gray-500 text-sm">Loading...</div>}

                    {!isLoading && courses.length === 0 && (
                        <div className="text-center p-8 text-gray-400 border border-gray-100 rounded-xl border-dashed">
                            No courses found.
                        </div>
                    )}

                    {!isLoading && courses.map((course, idx) => (
                        <div
                            key={course.id ?? idx}
                            className="flex flex-row items-center w-full px-5 py-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors bg-white shadow-[0_1px_2px_rgba(0,0,0,0.01)] group gap-1 sm:gap-4 relative"
                        >
                            <div className="flex flex-row items-center gap-1 sm:gap-4 flex-1 w-full">
                                <span className="text-[15px] text-gray-900 w-1/3 truncate">{course.name}</span>
                                <span className="text-[14px] text-gray-900 w-1/3 truncate">{course.code}</span>
                            </div>

                            <div className="flex items-center justify-end gap-3">
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
