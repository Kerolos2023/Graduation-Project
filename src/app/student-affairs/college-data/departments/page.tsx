"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Printer, Pencil, Trash2 } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { departmentsService, type Department, type DepartmentPayload } from '@/services/departmentsService';

export default function DepartmentsPage() {
    // ── Table / Pagination state ────────────────────────────────────────────
    const [departments, setDepartments] = useState<Department[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(10);
    const [searchValue, setSearchValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // ── Form state ──────────────────────────────────────────────────────────
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<DepartmentPayload>({
        Name: '',
        Code: '',
    });

    // ── API helpers ─────────────────────────────────────────────────────────

    const fetchTableData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await departmentsService.getAll(pageNumber, pageSize, searchValue || undefined);
            const items = data.data ?? data.items ?? [];
            const pages = data.totalPages ?? data.meta?.totalPages ?? 1;
            setDepartments(Array.isArray(items) ? items : []);
            setTotalPages(pages);
        } catch (err) {
            console.error("Error fetching departments:", err);
        } finally {
            setIsLoading(false);
        }
    }, [pageNumber, pageSize, searchValue]);

    useEffect(() => { fetchTableData(); }, [fetchTableData]);

    // ── Handlers ────────────────────────────────────────────────────────────

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({ Name: '', Code: '' });
    };

    const handleAddOrSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await departmentsService.update(editingId, formData);
            } else {
                await departmentsService.create(formData);
            }
            resetForm();
            fetchTableData();
        } catch (err: any) {
            console.error("Error saving department:", err);
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

    const handleEditClick = async (department: Department) => {
        const targetId = department.id;
        try {
            const freshData = await departmentsService.getById(targetId);
            setEditingId(targetId);
            setFormData({
                Name: freshData.name ?? '',
                Code: freshData.code ?? '',
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            console.error("Error fetching department details:", err);
        }
    };

    const handleDeleteClick = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this department?")) return;
        try {
            await departmentsService.delete(id);
            fetchTableData();
        } catch (err) {
            console.error("Error deleting department:", err);
        }
    };

    const renderInputField = (label: string, name: keyof DepartmentPayload, placeholder = "Placeholder") => (
        <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[13px] font-bold text-gray-900 ml-1">{label}</label>
            <input
                type="text"
                name={name}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm font-medium"
                value={formData[name] as string}
                onChange={handleInputChange}
            />
        </div>
    );

    return (
        <div className="w-full h-full flex flex-col gap-6 font-inter pb-8">

            {/* Upper Form Section */}
            <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0] shrink-0">
                <h1 className="text-xl font-bold text-gray-900 mb-6">Adding Departments</h1>
                <form onSubmit={handleAddOrSave}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {renderInputField("Name", "Name", "Ex: Computer Science")}
                        {renderInputField("Code (Shortcut)", "Code", "Ex: CS")}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold py-3.5 rounded-[12px] transition-all shadow-sm cursor-pointer"
                    >
                        {editingId ? "Save Changes" : "Add"}
                    </button>
                </form>
            </div>

            {/* Bottom List Section */}
            <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0]">
                {/* Table Header Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <h2 className="text-[22px] font-bold text-gray-900 leading-none">Departments</h2>
                        <span className="bg-[#eff4ff] text-blue-600 text-[11px] font-bold px-3 py-1.5 rounded-full border border-blue-100">
                            {departments.length} Department
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
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-[12px] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm font-medium"
                            />
                        </div>

                        <button className="flex items-center justify-center gap-2 px-4 py-2.5 min-w-[90px] rounded-[12px] border border-blue-200 text-blue-600 font-semibold hover:bg-blue-50 transition-colors bg-white text-sm cursor-pointer">
                            <Printer className="w-4 h-4" />
                            Print
                        </button>
                    </div>
                </div>

                {/* Table Header */}
                <div className="flex items-center w-full px-5 py-4 mb-3 border border-gray-100 bg-[#fafafa] rounded-xl gap-4">
                    <div className="flex items-center gap-4 flex-1 w-full">
                        <span className="text-[13px] font-bold text-gray-800 w-1/3">Name</span>
                        <span className="text-[13px] font-bold text-gray-800 w-1/3">Code (Shortcut)</span>
                    </div>
                    <div className="flex items-center justify-end gap-2 invisible">
                        <button className="p-1.5 w-[30px] h-[30px]" />
                        <button className="p-1.5 w-[30px] h-[30px]" />
                    </div>
                </div>

                {/* Table Rows */}
                <div className="flex flex-col gap-3 mb-8">
                    {isLoading && <div className="text-center p-4 text-gray-500 text-sm">Loading...</div>}

                    {!isLoading && departments.length === 0 && (
                        <div className="text-center p-8 text-gray-400 border border-gray-100 rounded-xl border-dashed">
                            No departments found.
                        </div>
                    )}

                    {!isLoading && departments.map((dept, idx) => (
                        <div
                            key={dept.id ?? idx}
                            className="flex flex-row items-center w-full px-5 py-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-white group gap-1 sm:gap-4 relative"
                        >
                            <div className="flex flex-row items-center gap-1 sm:gap-4 flex-1 w-full">
                                <span className="text-[14px] text-gray-900 w-1/3 truncate">{dept.name}</span>
                                <span className="text-[14px] text-gray-500 sm:text-gray-900 w-1/3 truncate">{dept.code}</span>
                            </div>

                            <div className="flex items-center justify-end gap-2 absolute right-4 top-4 sm:relative sm:right-auto sm:top-auto">
                                <button
                                    onClick={() => handleEditClick(dept)}
                                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors bg-white cursor-pointer"
                                >
                                    <Pencil className="w-[18px] h-[18px]" strokeWidth={2.5} />
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(dept.id)}
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
