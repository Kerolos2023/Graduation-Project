"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, Save } from 'lucide-react';
import CollegeDataTabs from '@/components/departmentsTabs';
import { useAcademicContext } from '@/hooks/useAcademicContext';
import {
    departmentsService,
    type DepartmentDetail,
    type DepartmentPayload,
    DEGREE_OPTIONS,
    LOAD_OPTIONS,
} from '@/services/departmentsServices';


// ── Shared styles ────────────────────────────────────────────────────────────
const inputCls = 'w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed';
const labelCls = 'text-[13px] font-semibold text-gray-700';

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
        <div className="flex flex-col gap-1.5">
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
        <div className="flex flex-col gap-1.5">
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
        <div className="p-4 md:p-6 bg-gray-50 min-h-screen space-y-6">

            {/* Tabs */}
            <CollegeDataTabs />

            {/* No program selected */}
            {!selectedProgramId && (
                <div className="bg-white rounded-[20px] border border-[#eaebf0] p-12 flex flex-col items-center justify-center gap-3 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                        <AlertCircle className="w-7 h-7 text-blue-400" strokeWidth={1.5} />
                    </div>
                    <p className="text-[15px] font-semibold text-gray-700">No Program Selected</p>
                    <p className="text-[13px] text-gray-400">Select an academic program from the sidebar.</p>
                </div>
            )}

            {/* Loading */}
            {selectedProgramId && isLoading && (
                <div className="bg-white rounded-[20px] border border-[#eaebf0] p-12 flex items-center justify-center gap-3">
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                    <span className="text-gray-500 text-sm">Loading department data...</span>
                </div>
            )}

            {/* Error */}
            {selectedProgramId && !isLoading && error && (
                <div className="bg-red-50 border border-red-200 rounded-[16px] p-4 flex items-center gap-3 text-red-600">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            {/* Form */}
            {selectedProgramId && !isLoading && formData && (
                <form onSubmit={handleSave}>
                    <div className="bg-white rounded-[20px] border border-[#eaebf0] shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">Department Data</h2>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                            <Field label="Department Name" name="Name" placeholder="Ex: Computer Science" />
                            <Field label="Department Code" name="Code" placeholder="Ex: CS" />
                            <Field label="Require Credit Hours" name="RequiredCreditHours" placeholder="Ex: 138" type="number" />
                            <SelectField label="Academic Degree" name="AcademicDegree" options={DEGREE_OPTIONS} />
                            <Field label="Certificate Title" name="CertificateTitle" placeholder="Ex: Bachelor of Computer Science" />
                            <SelectField label="Academic Load" name="AcademicLoad" options={LOAD_OPTIONS} />
                        </div>

                        {/* Description — full width */}
                        <div className="px-6 pb-6">
                            <div className="flex flex-col gap-1.5">
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
                    </div>

                    {/* Success message */}
                    {successMsg && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-[16px] p-4 text-emerald-700 text-sm font-medium text-center">
                            {successMsg}
                        </div>
                    )}

                    {/* Save button */}
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-[16px] transition-all shadow-sm cursor-pointer"
                    >
                        {isSaving
                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                            : <><Save className="w-4 h-4" /> Save</>
                        }
                    </button>
                </form>
            )}
        </div>
    );
}