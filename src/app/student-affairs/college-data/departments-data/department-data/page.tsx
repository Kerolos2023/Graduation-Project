"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import CollegeDataTabs from '@/components/departmentsTabs';
import { useAcademicContext } from '@/hooks/useAcademicContext';
import {
    departmentsService,
    type DepartmentDetail,
    type DepartmentPayload,
    DEGREE_OPTIONS,
    LOAD_OPTIONS,
} from '@/services/departmentsServices';

// ── Shared styles matching the first page ─────────────────────────────────────
const inputCls = 'w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed h-auto';
const labelCls = 'text-[13px] font-bold text-gray-900 ml-1';

export default function DepartmentDataPage() {
    const { selectedProgramId } = useAcademicContext();

    const [detail, setDetail] = useState<DepartmentDetail | null>(null);
    const [formData, setFormData] = useState<DepartmentPayload | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // ── Fetch on program change ──────────────────────────────────────────────
    useEffect(() => {
        if (!selectedProgramId) {
            setDetail(null);
            setFormData(null);
            return;
        }
        const load = async () => {
            setIsLoading(true);
            setError(null);
            setSuccessMsg(null);
            try {
                const data = await departmentsService.getById(selectedProgramId);
                setDetail(data);
                setFormData({
                    Name: data.name ?? '',
                    Code: data.code ?? '',
                    Description: data.description ?? '',
                    RequiredCreditHours: data.requiredCreditHours ?? null,
                    AcademicDegree: data.academicDegree ?? null,
                    AcademicLoad: data.academicLoad ?? null,
                    CertificateTitle: data.certificateTitle ?? '',
                });
            } catch (err) {
                console.error('Error fetching program detail:', err);
                setError('Failed to load department data.');
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [selectedProgramId]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? {
            ...prev,
            [name]: name === 'RequiredCreditHours'
                ? (value === '' ? null : Number(value))
                : (value === '' ? null : value),
        } : prev);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProgramId || !formData) return;
        setIsSaving(true);
        setError(null);
        setSuccessMsg(null);
        try {
            const updated = await departmentsService.update(selectedProgramId, formData);
            setDetail(updated);
            setSuccessMsg('Saved successfully.');
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err) {
            console.error('Error saving:', err);
            const axErr = err as { response?: { data?: { errors?: string[]; message?: string; title?: string } }; message?: string };
            const d = axErr.response?.data;
            setError((d?.errors?.length ? d.errors.join('\n') : null) ?? d?.message ?? d?.title ?? axErr.message ?? 'Failed to save.');
        } finally {
            setIsSaving(false);
        }
    };

    // ── Helpers ──────────────────────────────────────────────────────────────

    const Field = ({ label, name, placeholder = '', type = 'text' }: {
        label: string; name: keyof DepartmentPayload; placeholder?: string; type?: string;
    }) => (
        <div className="flex flex-col gap-1.5 w-full">
            <label className={labelCls}>{label}</label>
            <input
                type={type}
                name={name as string}
                placeholder={placeholder}
                className={inputCls}
                value={(formData?.[name] as string | number | null | undefined) ?? ''}
                onChange={handleChange}
                disabled={!formData}
            />
        </div>
    );

    const SelectField = ({ label, name, options }: {
        label: string; name: keyof DepartmentPayload; options: { value: string; label: string }[];
    }) => (
        <div className="flex flex-col gap-1.5 w-full">
            <label className={labelCls}>{label}</label>
            <select
                name={name as string}
                className={inputCls + ' cursor-pointer'}
                value={(formData?.[name] as string | null | undefined) ?? ''}
                onChange={handleChange}
                disabled={!formData}
            >
                <option value="">— Not set —</option>
                {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
        </div>
    );

    return (
        <div className="w-full h-full flex flex-col gap-6 font-inter pb-8">
            {/* Tabs */}
            <CollegeDataTabs />

            {/* No program selected */}
            {!selectedProgramId && (
                <div className="bg-white rounded-[24px] border border-[#eaebf0] p-12 flex flex-col items-center justify-center gap-3 text-center shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                        <AlertCircle className="w-7 h-7 text-blue-400" strokeWidth={1.5} />
                    </div>
                    <p className="text-[15px] font-bold text-gray-900">No Program Selected</p>
                    <p className="text-[13px] text-gray-400">Select an academic program from the sidebar.</p>
                </div>
            )}

            {/* Loading */}
            {selectedProgramId && isLoading && (
                <div className="bg-white rounded-[24px] border border-[#eaebf0] p-12 flex items-center justify-center gap-3 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                    <span className="text-gray-500 text-sm font-medium">Loading department data...</span>
                </div>
            )}

            {/* Error */}
            {selectedProgramId && !isLoading && error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Form */}
            {selectedProgramId && !isLoading && formData && (
                <form onSubmit={handleSave} className="flex flex-col gap-6">
                    <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0] shrink-0">
                        <h1 className="text-xl font-bold text-gray-900 mb-6">Department Data</h1>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <Field label="Department Name" name="Name" placeholder="Ex: Computer Science" />
                            <Field label="Department Code" name="Code" placeholder="Ex: CS" />
                            <Field label="Required Credit Hours" name="RequiredCreditHours" placeholder="Ex: 138" type="number" />
                            <SelectField label="Academic Degree" name="AcademicDegree" options={DEGREE_OPTIONS} />
                            <Field label="Certificate Title" name="CertificateTitle" placeholder="Ex: Bachelor of Computer Science" />
                            <SelectField label="Academic Load" name="AcademicLoad" options={LOAD_OPTIONS} />
                        </div>

                        {/* Description — full width */}
                        <div className="flex flex-col gap-1.5 w-full">
                            <label className={labelCls}>Description</label>
                            <textarea
                                name="Description"
                                placeholder="Short description about this program..."
                                rows={3}
                                className={inputCls + ' resize-none'}
                                value={formData.Description ?? ''}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Success message */}
                    {successMsg && (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-medium text-center">
                            {successMsg}
                        </div>
                    )}

                    {/* Save button */}
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold py-3.5 rounded-[12px] transition-all shadow-sm cursor-pointer text-sm flex items-center justify-center"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                    </button>
                </form>
            )}
        </div>
    );
}