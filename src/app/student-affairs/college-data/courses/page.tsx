"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Printer, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { Pagination } from '@/components/ui/pagination';
import { MultiSelect } from '@/components/ui/multi-select';

// Constants
const COLLEGE_ID = '019c1ea6-1738-71cb-8cfd-a90e126d177e';
const API_BASE = `/college/${COLLEGE_ID}/course`;

export default function CoursesPage() {
    // State for Table/Pagination
    const [courses, setCourses] = useState<any[]>([]);
    const [totalCourses, setTotalCourses] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(10);
    const [searchValue, setSearchValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // State for Dropdown Options (All Courses)
    const [allCoursesOpts, setAllCoursesOpts] = useState<{ label: string; value: string }[]>([]);

    // State for Form
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        nameAr: '',
        courseType: '',
        description: '',
        descriptionAr: '',
        preRequisiteIds: [] as string[],
    });

    // --- API Calls ---

    const fetchTableData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Get Paginated Data
            const url = `${API_BASE}?pageNumber=${pageNumber}&pageSize=${pageSize}${searchValue ? `&SearchValue=${searchValue}` : ''}`;
            const response = await axiosInstance.get(url);

            const resData = response.data?.data || response.data?.items || response.data || [];
            const resTotalPages = response.data?.totalPages || response.data?.meta?.totalPages || 1;

            setCourses(Array.isArray(resData) ? resData : []);
            setTotalPages(resTotalPages);
        } catch (err) {
            console.error("Error fetching table data:", err);
        } finally {
            setIsLoading(false);
        }
    }, [pageNumber, pageSize, searchValue]);

    const fetchDropdownData = useCallback(async () => {
        try {
            // Get All Courses for dropdown (using large arbitrary page size to ensure all are loaded)
            const url = `${API_BASE}?pageNumber=1&pageSize=1000`;
            const response = await axiosInstance.get(url);

            const resData = response.data?.data || response.data?.items || response.data || [];
            if (Array.isArray(resData)) {
                setAllCoursesOpts(resData.map((c: any) => ({ label: c.name || c.Name, value: c.id || c.Id })));
            }
        } catch (err) {
            console.error("Error fetching all courses for dropdown:", err);
        }
    }, []);

    useEffect(() => {
        fetchTableData();
    }, [fetchTableData]);

    useEffect(() => {
        fetchDropdownData();
    }, [fetchDropdownData]);

    // --- Handlers ---

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            code: '',
            name: '',
            nameAr: '',
            courseType: '',
            description: '',
            descriptionAr: '',
            preRequisiteIds: [],
        });
    };

    const handleAddOrSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                Name: formData.name,
                Code: formData.code,
                Description: formData.description,
                PreRequisiteIds: formData.preRequisiteIds
            };

            if (editingId) {
                // Update
                await axiosInstance.put(`${API_BASE}/${editingId}`, payload);
            } else {
                // Create
                await axiosInstance.post(API_BASE, payload);
            }
            resetForm();
            fetchTableData();
            fetchDropdownData(); // Re-fetch dependencies if new added
        } catch (err) {
            console.error("Error saving course:", err);
            // Depending on setup, you might show a toast here
        }
    };

    const handleEditClick = async (course: any) => {
        const targetId = course.id || course.Id;
        setEditingId(targetId);

        // Set basic fields available in table row
        setFormData(prev => ({
            ...prev,
            code: course.code || course.Code || '',
            name: course.name || course.Name || '',
            description: course.description || course.Description || '',
            courseType: course.type || course.Type || '',
            // Mapping back if you store arabic fields in DB:
            nameAr: course.nameAr || '',
            descriptionAr: course.descriptionAr || '',
        }));

        try {
            // Fetch PreRequisites (now changed to courses endpoint per request)
            const response = await axiosInstance.get(`${API_BASE}/${targetId}/courses?PageNumber=1&PageSize=1000`);
            const prereqs = response.data?.data || response.data?.items || response.data || [];

            // Expected prereqs either an array of objects ({id: '...', name: '...'}) or array of IDs.
            const ids = Array.isArray(prereqs)
                ? prereqs.map((p: any) => typeof p === 'string' ? p : p.id || p.Id)
                : [];

            setFormData(prev => ({ ...prev, preRequisiteIds: ids.filter(Boolean) }));
        } catch (err) {
            console.error("Error fetching pre-requisites:", err);
        }
    };

    const handleDeleteClick = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this course?")) return;
        try {
            await axiosInstance.delete(`${API_BASE}/${id}`);
            fetchTableData();
            fetchDropdownData();
        } catch (err) {
            console.error("Error deleting course:", err);
        }
    };

    const renderInputField = (label: string, name: keyof typeof formData, placeholder: string = "Placeholder") => (
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
                        {renderInputField("Course Name (Arabic)", "nameAr", "Enter course name in Arabic...")}
                        {renderInputField("Course Name (English)", "name", "Ex: Intro to CS")}
                        {renderInputField("Course Type", "courseType", "Ex: Mandatory")}

                        {/* Prerequisite MultiSelect */}
                        <div className="flex flex-col gap-1.5 w-full">
                            <label className="text-sm font-semibold text-gray-800">Prerequisite</label>
                            <MultiSelect
                                options={allCoursesOpts.filter(opt => opt.value !== editingId)} // Filter out itself to prevent cyclic prereqs
                                selectedValues={formData.preRequisiteIds}
                                onChange={(ids) => setFormData(prev => ({ ...prev, preRequisiteIds: ids }))}
                                placeholder="Select Prerequisites..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                        {renderInputField("Content Summary (English)", "description", "Enter course summary...")}
                        {renderInputField("Content Summary (Arabic)", "descriptionAr", "Enter course summary in Arabic...")}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-medium py-3 rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                        {editingId ? "Save Changes" : "Add or Save"}
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
                            100 Course
                        </span>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {/* Search Input */}
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchValue}
                                onChange={(e) => {
                                    setSearchValue(e.target.value);
                                    setPageNumber(1); // Reset to page 1 on search
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

                {/* Table List Items */}
                <div className="flex flex-col gap-3 mb-6">
                    {isLoading && <div className="text-center p-4 text-gray-500 text-sm">Loading...</div>}

                    {!isLoading && courses.length === 0 && (
                        <div className="text-center p-8 text-gray-400 border border-gray-100 rounded-xl border-dashed">
                            No courses found.
                        </div>
                    )}

                    {!isLoading && courses.map((course, idx) => {
                        const id = course.id || course.Id;
                        const name = course.name || course.Name || 'Unknown';
                        const code = course.code || course.Code || 'Unknown';

                        return (
                            <div key={id || idx} className="flex flex-col sm:flex-row sm:items-center w-full px-5 py-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors bg-white shadow-[0_1px_2px_rgba(0,0,0,0.01)] group gap-3 sm:gap-4 relative">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 flex-1 w-full">
                                    <span className="text-[15px] font-semibold text-gray-900 w-full sm:w-1/3 truncate">{name}</span>
                                    <span className="text-[14px] text-gray-500 w-full sm:w-1/3 truncate">{code}</span>
                                </div>

                                <div className="flex items-center justify-end gap-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity absolute right-4 top-4 sm:relative sm:right-auto sm:top-auto">
                                    <button
                                        onClick={() => handleEditClick(course)}
                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                    >
                                        <Pencil className="w-[18px] h-[18px]" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(course.id || course.Id)}
                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                    >
                                        <Trash2 className="w-[18px] h-[18px]" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Pagination Wrapper */}
                <div className="flex justify-center mt-2">
                    <Pagination
                        currentPage={pageNumber}
                        totalPages={totalPages}
                        onPageChange={setPageNumber}
                    />
                </div>
            </div>
        </div>
    );
}
