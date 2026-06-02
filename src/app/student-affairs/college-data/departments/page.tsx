"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
    departmentsService,
    type Department,
    type DepartmentPayload,
    DEGREE_OPTIONS,
    LOAD_OPTIONS,
} from '@/services/departmentsServices';

// ── Empty form ────────────────────────────────────────────────────────────────
const EMPTY_FORM: DepartmentPayload = {
    Name: '',
    Code: '',
    Description: '',
    RequiredCreditHours: null,
    AcademicDegree: null,
    AcademicLoad: null,
    CertificateTitle: '',
};

export default function DepartmentsPage() {
    const formRef = useRef<HTMLDivElement>(null);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(10);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // ── Search State with Debounce ──────────────────────────────────────────
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // ── Form state ──────────────────────────────────────────────────────────
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<DepartmentPayload>(EMPTY_FORM);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

    // ── Fetch list ──────────────────────────────────────────────────────────
    const fetchTableData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await departmentsService.getAll(pageNumber, pageSize, debouncedSearch || undefined);
            const items = data.items ?? data.data ?? [];
            const pages = data.totalPages ?? data.meta?.totalPages ?? 1;
            const count = data.totalCount ?? data.totalNumber ?? items.length;
            setDepartments(Array.isArray(items) ? items : []);
            setTotalPages(pages);
            setTotalCount(count);
        } catch (err) {
            console.error('Error fetching departments:', err);
        } finally {
            setIsLoading(false);
        }
    }, [pageNumber, pageSize, debouncedSearch]);

    useEffect(() => {
        fetchTableData();
    }, [fetchTableData]);

    // ── Handlers ────────────────────────────────────────────────────────────

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPageNumber(1);
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'RequiredCreditHours'
                ? (value === '' ? null : Number(value))
                : (value === '' ? null : value),
        }));
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData(EMPTY_FORM);
        setErrorMsg("");
    };

    const handleAddOrSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMsg("");
        try {
            if (editingId) {
                await departmentsService.update(editingId, formData);
            } else {
                await departmentsService.create(formData);
            }
            resetForm();
            fetchTableData();
        } catch (err: unknown) {
            console.error('Error saving department:', err);
            const axErr = err as { response?: { data?: { errors?: string[]; message?: string; title?: string } }; message?: string };
            const d = axErr.response?.data;
            const msg = (d?.errors?.length ? d.errors.join('\n') : null) ?? d?.message ?? d?.title ?? axErr.message ?? 'An error occurred.';
            setErrorMsg(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = async (dept: Department) => {
        setErrorMsg("");
        try {
            const detail = await departmentsService.getById(dept.id);
            setEditingId(dept.id);
            setFormData({
                Name: detail.name ?? (detail as any).Name ?? '',
                Code: detail.code ?? (detail as any).Code ?? '',
                Description: detail.description ?? (detail as any).Description ?? '',
                RequiredCreditHours: detail.requiredCreditHours ?? (detail as any).RequiredCreditHours ?? null,
                AcademicDegree: detail.academicDegree ?? (detail as any).AcademicDegree ?? null,
                AcademicLoad: detail.academicLoad ?? (detail as any).AcademicLoad ?? null,
                CertificateTitle: detail.certificateTitle ?? (detail as any).CertificateTitle ?? '',
            });
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (err) {
            console.error('Error fetching department details:', err);
            setErrorMsg('Error fetching department details.');
        }
    };

    const handleDeleteClick = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this department?')) return;
        try {
            await departmentsService.delete(id);
            fetchTableData();
        } catch (err) {
            console.error('Error deleting department:', err);
        }
    };

    // ── Field helpers ────────────────────────────────────────────────────────

    const inputCls = 'w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm font-medium h-auto';
    const labelCls = 'text-[13px] font-bold text-gray-900 ml-1';

    const renderField = (label: string, name: keyof DepartmentPayload, placeholder = 'Placeholder', type = 'text') => (
        <div className="flex flex-col gap-1.5 w-full">
            <label className={labelCls}>{label}</label>
            <input
                type={type}
                name={name as string}
                placeholder={placeholder}
                className={inputCls}
                value={(formData[name] as string | number | null | undefined) ?? ''}
                onChange={handleInputChange}
            />
        </div>
    );

    const renderSelectField = (label: string, name: keyof DepartmentPayload, options: { value: string; label: string }[]) => (
        <div className="flex flex-col gap-1.5 w-full">
            <label className={labelCls}>{label}</label>
            <select
                name={name as string}
                className={inputCls + ' cursor-pointer'}
                value={(formData[name] as string | null | undefined) ?? ''}
                onChange={handleInputChange}
            >
                <option value="">— Select —</option>
                {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
        </div>
    );

    return (
        <div className="w-full h-full flex flex-col gap-6 font-inter pb-8">

            {/* ── Form Card ── */}
            <div ref={formRef} className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0] shrink-0 scroll-mt-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-xl font-bold text-gray-900">
                        {editingId ? 'Update Department' : 'Adding Departments'}
                    </h1>
                    {editingId && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="text-red-500 hover:bg-red-50 rounded-xl text-xs font-bold h-8 px-3 cursor-pointer flex items-center transition-colors gap-1"
                        >
                            <X size={14} className="mr-1" />
                            <span>Cancel Edit</span>
                        </button>
                    )}
                </div>

                {errorMsg && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 text-red-600">
                        <span className="text-sm font-medium">{errorMsg}</span>
                    </div>
                )}

                <form onSubmit={handleAddOrSave}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {renderField("Name", "Name", "Ex: Computer Science")}
                        {renderField("Code (Shortcut)", "Code", "Ex: CS")}
                        {renderField("Require Credit Hours", "RequiredCreditHours", "Ex: 138", "number")}
                        {renderSelectField("Academic Degree", "AcademicDegree", DEGREE_OPTIONS)}
                        {renderField("Certificate Title", "CertificateTitle", "Ex: Bachelor of Computer Science")}
                        {renderSelectField("Academic Load", "AcademicLoad", LOAD_OPTIONS)}
                    </div>

                    {/* Description — full width */}
                    <div className="flex flex-col gap-1.5 w-full mb-6">
                        <label className={labelCls}>Description</label>
                        <textarea
                            name="Description"
                            placeholder="Short description about this program..."
                            rows={3}
                            className={inputCls + ' resize-none'}
                            value={formData.Description ?? ''}
                            onChange={handleInputChange}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={cn(
                            "w-full text-white font-semibold py-3.5 rounded-[12px] transition-all shadow-sm cursor-pointer flex items-center justify-center text-sm active:scale-[0.99]",
                            editingId ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"
                        )}
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : editingId ? 'Save Changes' : 'Add'}
                    </button>
                </form>
            </div>

            {/* ── List Card ── */}
            <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0]">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <h2 className="text-[22px] font-bold text-gray-900 leading-none">Departments</h2>
                        <Badge className="bg-[#eff4ff] text-blue-600 text-[11px] font-bold px-3 py-1.5 rounded-full border border-blue-100 hover:bg-[#eff4ff] shadow-none">
                            {totalCount} Departments
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

                {/* Table header */}
                <div className="hidden md:flex items-center w-full px-5 py-4 mb-3 border border-gray-100 bg-[#fafafa] rounded-xl gap-4">
                    <div className="flex items-center gap-4 flex-1">
                        <span className="text-[13px] font-bold text-gray-800 w-1/2">Name</span>
                        <span className="text-[13px] font-bold text-gray-800 w-1/4">Code</span>
                    </div>
                    <div className="w-[80px]"></div>
                </div>

                {/* Rows */}
                <div className="flex flex-col gap-3 mb-8">
                    {isLoading ? (
                        <div className="text-center p-4 text-gray-500 text-sm">
                            <Loader2 className="w-5 h-5 animate-spin inline-block mr-2 text-blue-600" /> Loading...
                        </div>
                    ) : departments.length === 0 ? (
                        <div className="text-center p-8 text-gray-400 border border-gray-100 rounded-xl border-dashed">
                            No departments found.
                        </div>
                    ) : (
                        departments.map((dept, idx) => (
                            <div
                                key={dept.id ?? idx}
                                className={cn(
                                    "flex flex-col sm:flex-row sm:items-center w-full px-5 py-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-white gap-3 sm:gap-4 relative group",
                                    editingId === dept.id && "bg-blue-50/50 border-blue-200"
                                )}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 flex-1 w-full">
                                    <div className="w-full sm:w-1/2 truncate">
                                        <span className="text-[10px] uppercase font-bold text-gray-400 sm:hidden block mb-1">Name</span>
                                        <span className="text-[14px] font-bold text-gray-900 truncate">{dept.name}</span>
                                    </div>
                                    <div className="w-full sm:w-1/4 truncate">
                                        <span className="text-[10px] uppercase font-bold text-gray-400 sm:hidden block mb-1">Code</span>
                                        <span className="text-[14px] font-bold text-gray-500 sm:text-gray-900 truncate">{dept.code}</span>
                                    </div>
                                </div>

                                {/* Actions (Unified for mobile & desktop view) */}
                                <div className="flex items-center justify-end gap-2 absolute right-4 top-4 sm:relative sm:right-auto sm:top-auto">
                                    <button
                                        onClick={() => handleEditClick(dept)}
                                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors bg-white cursor-pointer"
                                        title="Edit (loads full details)"
                                    >
                                        <Pencil className="w-[18px] h-[18px]" strokeWidth={2.5} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(dept.id)}
                                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors bg-white cursor-pointer"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-[18px] h-[18px]" strokeWidth={2.5} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
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