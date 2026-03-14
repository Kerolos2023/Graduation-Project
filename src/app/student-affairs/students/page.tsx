
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Printer, UserPlus, Pencil, Trash2 } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { Pagination } from '@/components/ui/pagination';
import { StudentContext } from '@/hooks/useStudentContext';

// ─── Constants ────────────────────────────────────────────────────────────────
const COLLEGE_ID = '019c1ea6-1738-71cb-8cfd-a90e126d177e';
const API_BASE = `/colleges/${COLLEGE_ID}/students`;

// ─── Types ────────────────────────────────────────────────────────────────────
interface Student {
    id: string;
    name: string;
    studentCode: string;
    nationalIdOrPassport: string;
    gender: string;
}


// ─── Helper: parse API error to readable message ──────────────────────────────
function parseErrorMessage(err: unknown): string {
    if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as {
            response?: { data?: { errors?: string[]; message?: string; title?: string } };
            message?: string;
        };
        const data = axiosErr.response?.data;
        if (data) {
            if (Array.isArray(data.errors) && data.errors.length > 0) return data.errors.join('\n');
            if (data.message) return data.message;
            if (data.title) return data.title;
        }
        if (axiosErr.message) return axiosErr.message;
    }
    return 'An unexpected error occurred.';
}

// ─── Avatar Placeholder ───────────────────────────────────────────────────────
const AvatarPlaceholder: React.FC<{ name: string }> = ({ name }) => {
    const initials = name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();

    const colours = [
        'from-blue-400 to-blue-600',
        'from-violet-400 to-violet-600',
        'from-emerald-400 to-emerald-600',
        'from-amber-400 to-amber-600',
        'from-pink-400 to-pink-600',
        'from-cyan-400 to-cyan-600',
    ];
    const colourClass = colours[name.charCodeAt(0) % colours.length];

    return (
        <div
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr ${colourClass} flex items-center justify-center text-white text-[12px] sm:text-[13px] font-bold shrink-0`}
        >
            {initials}
        </div>
    );
};

// ─── Students Page ────────────────────────────────────────────────────────────
export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [pageNumber, setPageNumber] = useState(1);
    const pageSize = 10;
    const [searchValue, setSearchValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // ── Context States ─────────────────────────────────────────────────────────
    const [studentId, setStudentId] = useState<string | null>(null);
    const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);

    // ── Fetch ──────────────────────────────────────────────────────────────────
    const fetchStudents = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                PageNumber: String(pageNumber),
                PageSize: String(pageSize),
            });
            if (searchValue) params.append('SearchValue', searchValue);

            const response = await axiosInstance.get(`${API_BASE}?${params.toString()}`);
            const data = response.data;

            const items: Student[] = data?.items ?? data?.data ?? [];
            const pages: number = data?.totalPages ?? data?.meta?.totalPages ?? 1;

            setStudents(Array.isArray(items) ? items : []);
            setTotalPages(pages);
        } catch (err) {
            console.error('Error fetching students:', err);
            alert(parseErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    }, [pageNumber, pageSize, searchValue]);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    // ── Delete ─────────────────────────────────────────────────────────────────
    const handleDeleteClick = async (student: Student) => {
        if (!window.confirm(`Are you sure you want to delete "${student.name}"?`)) return;
        try {
            await axiosInstance.delete(`${API_BASE}/${student.id}`);
            fetchStudents();
        } catch (err) {
            console.error('Error deleting student:', err);
            alert(parseErrorMessage(err));
        }
    };

    // ── Search ─────────────────────────────────────────────────────────────────
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value);
        setPageNumber(1);
    };

    // ──────────────────────────────────────────────────────────────────────────
    return (
        <StudentContext.Provider value={{ studentId, setStudentId, isEditPopupOpen, setIsEditPopupOpen }}>
            <div className="w-full flex flex-col gap-6 font-inter pb-8">

                {/* ── Table Card ── */}
            <div className="bg-white rounded-[24px] p-4 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0]">

                {/* ── Card Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6">

                    {/* Title + static count */}
                    <div className="flex items-center gap-3 shrink-0">
                        <h1 className="text-xl font-bold text-gray-900 leading-none">Students</h1>
                        <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-100 whitespace-nowrap">
                            100 Students
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto flex-wrap sm:flex-nowrap">

                        {/* Search */}
                        <div className="relative flex-1 min-w-[140px] sm:w-56 sm:flex-none">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchValue}
                                onChange={handleSearchChange}
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
                            />
                        </div>

                        {/* Add Student */}
                        <button className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl border border-blue-200 text-blue-600 text-sm font-medium hover:bg-blue-50 active:scale-[0.98] transition-all bg-white cursor-pointer whitespace-nowrap">
                            <UserPlus className="w-4 h-4 shrink-0" />
                            <span className="hidden xs:inline sm:inline">Add Student</span>
                        </button>

                        {/* Print */}
                        <button className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl border border-blue-200 text-blue-600 text-sm font-medium hover:bg-blue-50 active:scale-[0.98] transition-all bg-white cursor-pointer">
                            <Printer className="w-4 h-4 shrink-0" />
                            <span className="hidden xs:inline sm:inline">Print</span>
                        </button>
                    </div>
                </div>

                {/* ── Table Header (desktop) ── */}
                <div className="hidden sm:flex items-center w-full px-4 sm:px-5 py-3.5 mb-3 border border-gray-100 bg-[#fafafa] rounded-xl gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <span className="text-[13px] font-bold text-gray-700 w-[38%]">Name</span>
                        <span className="text-[13px] font-bold text-gray-700 w-[15%]">Gender</span>
                        <span className="text-[13px] font-bold text-gray-700 w-[28%]">National ID</span>
                        <span className="text-[13px] font-bold text-gray-700 flex-1">Student Code</span>
                    </div>
                    {/* Phantom spacer matching action buttons */}
                    <div className="flex items-center gap-2 invisible shrink-0">
                        <button className="p-1.5 w-8 h-8" />
                        <button className="p-1.5 w-8 h-8" />
                    </div>
                </div>

                {/* ── Table Rows ── */}
                <div className="flex flex-col gap-2.5 sm:gap-3 mb-6">

                    {/* Loading */}
                    {isLoading && (
                        <div className="text-center py-12 text-gray-400 text-sm">Loading students…</div>
                    )}

                    {/* Empty */}
                    {!isLoading && students.length === 0 && (
                        <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-xl">
                            No students found.
                        </div>
                    )}

                    {/* Data rows */}
                    {!isLoading && students.map((student) => (
                        <div
                            key={student.id}
                            className="flex flex-row items-center w-full px-4 sm:px-5 py-3 sm:py-3.5 border border-gray-100 rounded-xl hover:bg-gray-50/70 transition-colors bg-white shadow-[0_1px_2px_rgba(0,0,0,0.01)] gap-3 sm:gap-4"
                        >
                            {/* Data columns */}
                            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">

                                {/* Name cell: avatar + name + studentCode below */}
                                <div className="flex items-center gap-2 sm:gap-3 w-[38%] min-w-0">
                                    <AvatarPlaceholder name={student.name} />
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[13px] sm:text-[14px] font-semibold text-gray-900 truncate leading-snug">
                                            {student.name}
                                        </span>
                                        <span className="text-[11px] sm:text-[12px] text-gray-400 truncate font-mono leading-snug">
                                            {student.studentCode}
                                        </span>
                                    </div>
                                </div>

                                {/* Gender */}
                                <span className="hidden sm:block text-[14px] text-gray-600 w-[15%] truncate">
                                    {student.gender}
                                </span>

                                {/* National ID */}
                                <span className="hidden sm:block text-[13px] text-gray-600 w-[28%] truncate font-mono">
                                    {student.nationalIdOrPassport}
                                </span>

                                {/* Student Code (desktop standalone column) */}
                                <span className="hidden sm:block text-[13px] text-gray-600 flex-1 truncate font-mono">
                                    {student.studentCode}
                                </span>

                                {/* Mobile: gender pill */}
                                <span className="sm:hidden ml-auto text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">
                                    {student.gender}
                                </span>
                            </div>

                            {/* Action icons */}
                            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                                {/* Edit – form handled later */}
                                <button
                                    title="Edit student"
                                    onClick={() => {
                                        setStudentId(student.id);
                                        setIsEditPopupOpen(true);
                                    }}
                                    className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                >
                                    <Pencil className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px]" strokeWidth={2.5} />
                                </button>

                                {/* Delete */}
                                <button
                                    title="Delete student"
                                    onClick={() => handleDeleteClick(student)}
                                    className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                >
                                    <Trash2 className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px]" strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Pagination ── */}
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
        </StudentContext.Provider>
    );
}
