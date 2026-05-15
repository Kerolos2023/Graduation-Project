"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Printer, Pencil, Trash2 } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
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
    const [searchValue, setSearchValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // ── Form state ──────────────────────────────────────────────────────────
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<DepartmentPayload>(EMPTY_FORM);

    // ── Fetch list ──────────────────────────────────────────────────────────
    const fetchTableData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await departmentsService.getAll(pageNumber, pageSize, searchValue || undefined);
            const items = data.items ?? data.data ?? [];
            const pages = data.totalPages ?? data.meta?.totalPages ?? 1;
            const count = data.totalCount ?? items.length;
            setDepartments(Array.isArray(items) ? items : []);
            setTotalPages(pages);
            setTotalCount(count);
        } catch (err) {
            console.error('Error fetching departments:', err);
        } finally {
            setIsLoading(false);
        }
    }, [pageNumber, pageSize, searchValue]);

    useEffect(() => { fetchTableData(); }, [fetchTableData]);

    // ── Handlers ────────────────────────────────────────────────────────────

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
        } catch (err: unknown) {
            console.error('Error saving department:', err);
            const axErr = err as { response?: { data?: { errors?: string[]; message?: string; title?: string } }; message?: string };
            const d = axErr.response?.data;
            const msg = (d?.errors?.length ? d.errors.join('\n') : null) ?? d?.message ?? d?.title ?? axErr.message ?? 'An error occurred.';
            alert(msg);
        }
    };

    /** On edit click: fetch full detail via getById, populate all form fields */
    const handleEditClick = async (dept: Department) => {
        try {
            const detail = await departmentsService.getById(dept.id);
            setEditingId(dept.id);
            setFormData({
                Name: detail.name ?? '',
                Code: detail.code ?? '',
                Description: detail.description ?? '',
                RequiredCreditHours: detail.requiredCreditHours ?? null,
                AcademicDegree: detail.academicDegree ?? null,
                AcademicLoad: detail.academicLoad ?? null,
                CertificateTitle: detail.certificateTitle ?? '',
            });
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (err) {
            console.error('Error fetching department details:', err);
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

    const inputCls = 'w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm font-medium';
    const labelCls = 'text-[13px] font-bold text-gray-900 ml-1';

    const Field = ({ label, name, placeholder = 'Placeholder', type = 'text' }: {
        label: string; name: keyof DepartmentPayload; placeholder?: string; type?: string;
    }) => (
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

    const SelectField = ({ label, name, options }: {
        label: string;
        name: keyof DepartmentPayload;
        options: { value: string; label: string }[];
    }) => (
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
            <div ref={formRef} className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0] shrink-0">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-xl font-bold text-gray-900">
                        {editingId ? 'Edit Department' : 'Adding Departments'}
                    </h1>
                    {editingId && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="text-sm text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                        >
                            Cancel edit
                        </button>
                    )}
                </div>

                <form onSubmit={handleAddOrSave}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                        <Field label="Name" name="Name" placeholder="Ex: Computer Science" />
                        <Field label="Code (Shortcut)" name="Code" placeholder="Ex: CS" />
                        <Field label="Require Credit Hours" name="RequiredCreditHours" placeholder="Ex: 138" type="number" />
                        <SelectField label="Academic Degree" name="AcademicDegree" options={DEGREE_OPTIONS} />
                        <Field label="Certificate Title" name="CertificateTitle" placeholder="Ex: Bachelor of Computer Science" />
                        <SelectField label="Academic Load" name="AcademicLoad" options={LOAD_OPTIONS} />
                    </div>

                    {/* Description — full width */}
                    <div className="flex flex-col gap-1.5 w-full mb-5">
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
                        className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold py-3.5 rounded-[12px] transition-all shadow-sm cursor-pointer"
                    >
                        {editingId ? 'Save Changes' : 'Add'}
                    </button>
                </form>
            </div>

            {/* ── List Card ── */}
            <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0]">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <h2 className="text-[22px] font-bold text-gray-900 leading-none">Departments</h2>
                        <span className="bg-[#eff4ff] text-blue-600 text-[11px] font-bold px-3 py-1.5 rounded-full border border-blue-100">
                            {totalCount} Department
                        </span>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative w-full md:w-[280px]">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchValue}
                                onChange={(e) => { setSearchValue(e.target.value); setPageNumber(1); }}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-[12px] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm font-medium"
                            />
                        </div>
                        <button className="flex items-center justify-center gap-2 px-4 py-2.5 min-w-[90px] rounded-[12px] border border-blue-200 text-blue-600 font-semibold hover:bg-blue-50 transition-colors bg-white text-sm cursor-pointer">
                            <Printer className="w-4 h-4" />
                            Print
                        </button>
                    </div>
                </div>

                {/* Table header */}
                <div className="flex items-center w-full px-5 py-4 mb-3 border border-gray-100 bg-[#fafafa] rounded-xl gap-4">
                    <div className="flex items-center gap-4 flex-1">
                        <span className="text-[13px] font-bold text-gray-800 w-1/2">Name</span>
                        <span className="text-[13px] font-bold text-gray-800 w-1/4">Code</span>
                    </div>
                    <div className="flex items-center justify-end gap-2 invisible">
                        <button className="p-1.5 w-[30px] h-[30px]" />
                        <button className="p-1.5 w-[30px] h-[30px]" />
                    </div>
                </div>

                {/* Rows */}
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
                            className="flex flex-row items-center w-full px-5 py-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-white gap-4"
                        >
                            <div className="flex flex-row items-center gap-4 flex-1">
                                <span className="text-[14px] font-semibold text-gray-900 w-1/2 truncate">{dept.name}</span>
                                <span className="text-[13px] font-mono text-gray-500 w-1/4 truncate">{dept.code}</span>
                            </div>

                            <div className="flex items-center justify-end gap-2 shrink-0">
                                <button
                                    onClick={() => handleEditClick(dept)}
                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                    title="Edit (loads full details)"
                                >
                                    <Pencil className="w-[18px] h-[18px]" strokeWidth={2.5} />
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(dept.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                    title="Delete"
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
