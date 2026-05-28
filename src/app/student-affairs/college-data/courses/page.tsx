"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Pencil, Trash2 } from 'lucide-react';
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
            <label className="text-sm font-semibold text-gray-800">{label}</label>
            <input
                ref={name === "code" ? inputRef : null}
                type="text"
                name={name}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                value={formData[name] as string}
                onChange={handleInputChange}
            />
        </div>
    );

    return (
        <div className="w-full h-full flex flex-col gap-6 font-inter pb-8">

            {/* FORM */}
            <div
                ref={formRef}
                className="bg-white rounded-[24px] p-6 shadow border border-[#eaebf0]"
            >
                <h1 className="text-xl font-bold text-gray-900 mb-6">Courses</h1>

                <form onSubmit={handleAddOrSave}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
                        {renderInputField("Course Code", "code", "Ex: CS101")}
                        {renderInputField("Course Name", "name", "Ex: Intro to CS")}

                        <div className="flex flex-col gap-1.5 w-full">
                            <label className="text-sm font-semibold text-gray-800">
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
                        className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition"
                    >
                        {editingId ? "Save Changes" : "Add Course"}
                    </button>
                </form>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-[24px] p-6 shadow border border-[#eaebf0]">
                <div className="flex justify-between mb-6">
                    <h2 className="text-xl font-bold">Courses</h2>

                    <input
                        type="text"
                        placeholder="Search"
                        value={searchValue}
                        onChange={(e) => {
                            setSearchValue(e.target.value);
                            setPageNumber(1);
                        }}
                        className="border px-3 py-2 rounded-lg text-sm"
                    />
                </div>

                {isLoading && <p className="text-center">Loading...</p>}

                {!isLoading && courses.map((course) => (
                    <div
                        key={course.id}
                        className="flex justify-between items-center p-4 border rounded-lg mb-2"
                    >
                        <div>
                            <p className="font-medium">{course.name}</p>
                            <p className="text-sm text-gray-500">{course.code}</p>
                        </div>

                        <div className="flex gap-2">
                            <button onClick={() => handleEditClick(course)}>
                                <Pencil />
                            </button>
                            <button onClick={() => handleDeleteClick(course.id)}>
                                <Trash2 />
                            </button>
                        </div>
                    </div>
                ))}

                {totalPages > 1 && (
                    <div className="flex justify-center mt-4">
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