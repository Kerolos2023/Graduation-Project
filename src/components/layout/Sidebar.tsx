"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, Building2, Settings, LogOut, BookAIcon } from 'lucide-react';
import { PiBuildingOfficeLight } from "react-icons/pi";
import { FaUniversity } from "react-icons/fa";
import { LuClipboardType } from "react-icons/lu";

import { cn } from '@/lib/utils';
import axiosInstance from '@/lib/axios';
import { useAcademicContext } from '@/hooks/useAcademicContext';

interface NavItemProps {
    icon: React.ElementType;
    label: string;
    href: string;
    isActive?: boolean;
    onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, href, isActive, onClick }) => (
    <Link href={href} onClick={onClick}>
        <div className={cn(
            "flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-colors group mx-3",
            isActive ? "bg-white text-gray-900 shadow-sm border border-gray-100" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
        )}>
            <div className="flex items-center gap-3">
                <Icon className={cn("w-5 h-5", isActive ? "text-blue-600" : "text-gray-400 group-hover:text-blue-500")} strokeWidth={1.5} />
                <span className="text-[14px] font-semibold">{label}</span>
            </div>
        </div>
    </Link>
);

interface SidebarProps {
    onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
    const pathname = usePathname();
    const router = useRouter();
    const {
        setSelectedProgramId,
        setSelectedSemesterId,
        setSelectedYearId,
        setSelectedTermId,
    } = useAcademicContext();

    const COLLEGE_ID = "019c1ea6-1738-71cb-8cfd-a90e126d177e";

    const [academicYears, setAcademicYears] = useState<{ id: string; name: string }[]>([]);
    const [programs, setPrograms] = useState<{ id: string; name: string }[]>([]);
    const [selectedYear, setSelectedYear] = useState<string>("");
    const [selectedProgram, setSelectedProgram] = useState<string>("");
    const [currentSemester, setCurrentSemester] = useState<{ id: string; name: string } | null>(null);
    const [selectedTermType, setSelectedTermType] = useState<string>("");

    const termOptions = [
        { value: "1", label: "Fall" },
        { value: "2", label: "Spring" },
        { value: "3", label: "Summer" },
    ];

    const handleLogout = async () => {
        try {
            await axiosInstance.post('/Auth/revoke-refresh-token');
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            if (typeof window !== 'undefined') {
                localStorage.clear();
                sessionStorage.clear();
            }
            router.replace('/auth/login');
        }
    };

    const fetchAcademicYears = async () => {
        try {
            const res = await axiosInstance.get(`/colleges/${COLLEGE_ID}/academic-years`);
            const items = res.data?.items || [];
            const list = Array.isArray(items) ? items : [];
            setAcademicYears(list);
            if (!selectedYear && list.length > 0) {
                const fallbackYearId = list[0].id;
                setSelectedYear(fallbackYearId);
                setSelectedYearId(fallbackYearId);
                await fetchCurrentSemester(fallbackYearId);
            }
        } catch (error) {
            console.error("Error fetching academic years:", error);
        }
    };

    const fetchCurrentYear = async () => {
        try {
            const res = await axiosInstance.get(`/colleges/${COLLEGE_ID}/academic-years/current`);
            const year = res.data;
            if (year?.id) {
                setSelectedYear(year.id);
                setSelectedYearId(year.id);
                await fetchCurrentSemester(year.id);
            }
        } catch (error) {
            console.error("Error fetching current year:", error);
        }
    };

    const fetchCurrentSemester = async (yearId: string) => {
        try {
            const res = await axiosInstance.get(
                `/colleges/${COLLEGE_ID}/academic-years/${yearId}/current-semester`
            );
            const semester = res.data;
            if (semester?.id) {
                setCurrentSemester({ id: semester.id, name: semester.name || "Current" });
                setSelectedSemesterId(semester.id);
                const termFromName =
                    semester.name === "Fall" ? "1" :
                    semester.name === "Spring" ? "2" :
                    semester.name === "Summer" ? "3" : "";
                setSelectedTermType(termFromName);
                setSelectedTermId(termFromName || semester.id);
            } else {
                setCurrentSemester(null);
                setSelectedSemesterId(null);
                setSelectedTermType("");
                setSelectedTermId(null);
            }
        } catch (error) {
            console.error("Error fetching current semester:", error);
            setCurrentSemester(null);
        }
    };

    const fetchPrograms = async () => {
        try {
            const res = await axiosInstance.get(`/colleges/${COLLEGE_ID}/academic-programs`);
            const items = res.data?.items || [];
            const list = Array.isArray(items) ? items : [];
            setPrograms(list);
            if (!selectedProgram && list.length > 0) {
                setSelectedProgram(list[0].id);
                setSelectedProgramId(list[0].id);
            }
        } catch (error) {
            console.error("Error fetching programs:", error);
        }
    };

    useEffect(() => {
        fetchAcademicYears();
        fetchCurrentYear();
        fetchPrograms();
    }, []);

    return (
        <aside className="w-[280px] h-full bg-white rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col border border-gray-100/50 shrink-0">

            {/* Brand Logo & Version */}
            <div className="flex items-center gap-2.5 p-5 pb-3">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0">
                    <Image
                        src="/auth/Vector.svg"
                        alt="Universe Logo"
                        width={24}
                        height={24}
                        className="w-full h-full object-contain"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-bold text-[15px] tracking-tight text-gray-900">Universe</span>
                    <span className="bg-blue-500 text-white text-[7px] font-bold px-1.5 py-0.5 rounded ml-1 tracking-wider uppercase">Beta Version</span>
                </div>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 flex flex-col gap-1.5 overflow-y-auto px-1 py-2 custom-scrollbar">
                <NavItem
                    icon={BookOpen}
                    label="Courses"
                    href="/student-affairs/college-data/courses"
                    isActive={pathname?.includes('/courses')}
                    onClick={onClose}
                />
                <NavItem
                    icon={Building2}
                    label="Departments"
                    href="/student-affairs/college-data/departments"
                    isActive={pathname?.includes('/departments')}
                    onClick={onClose}
                />
                <NavItem
                    icon={BookAIcon}
                    label="Departments"
                    href="/student-affairs/college-data/department-data"
                    isActive={pathname?.includes('/department-data')}
                    onClick={onClose}
                />
                <NavItem
                    icon={PiBuildingOfficeLight}
                    label="Buildings"
                    href="/student-affairs/college-data/buildings"
                    isActive={pathname?.includes('/buildings')}
                    onClick={onClose}
                />
                <NavItem
                    icon={LuClipboardType}
                    label="Room Types"
                    href="/student-affairs/college-data/roomtype"
                    isActive={pathname?.includes('/roomtype')}
                    onClick={onClose}
                />
                <NavItem
                    icon={FaUniversity}
                    label="Rooms"
                    href="/student-affairs/college-data/rooms"
                    isActive={pathname?.includes('/rooms')}
                    onClick={onClose}
                />
                {/* <NavItem
                    icon={FaUniversity}
                    label="Grades"
                    href="/student-affairs/college-data/grades"
                    isActive={pathname?.includes('/grades')}
                    onClick={onClose}
                />
                <NavItem
                    icon={FaUniversity}
                    label="Levels"
                    href="/student-affairs/college-data/levels"
                    isActive={pathname?.includes('/levels')}
                    onClick={onClose}
                /> */}
                <NavItem
                    icon={LuClipboardType}
                    label="Definition of Periods"
                    href="/student-affairs/college-data/definition-of-periods"
                    isActive={pathname?.includes('/definition-of-periods')}
                    onClick={onClose}
                />
                <NavItem
                    icon={BookOpen}
                    label="Schedule"
                    href="/student-affairs/college-data/schedule"
                    isActive={pathname?.includes('/schedule')}
                    onClick={onClose}
                />
                
            </nav>

            {/* Academic Controls */}
            <div className="px-4 pb-3 space-y-2">
                <div className="space-y-2">
                    <select
                        value={selectedProgram}
                        onChange={(e) => {
                            setSelectedProgram(e.target.value);
                            setSelectedProgramId(e.target.value);
                        }}
                        className="w-full px-2.5 py-1.5 rounded-[10px] border border-gray-200 bg-[#f9fafc] text-[11px] font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                    >
                        {programs.length === 0 && <option value="">Select Program</option>}
                        {programs.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <select
                        value={selectedYear}
                        onChange={(e) => {
                            const yearId = e.target.value;
                            setSelectedYear(yearId);
                            setSelectedYearId(yearId);
                            if (yearId) fetchCurrentSemester(yearId);
                        }}
                        className="w-full px-2.5 py-1.5 rounded-[10px] border border-gray-200 bg-[#f9fafc] text-[11px] font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                    >
                        {academicYears.length === 0 && <option value="">Select Year</option>}
                        {academicYears.map((y) => (
                            <option key={y.id} value={y.id}>
                                {y.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <select
                        value={selectedTermType}
                        onChange={(e) => {
                            const termValue = e.target.value;
                            setSelectedTermType(termValue);
                            setSelectedTermId(termValue || null);
                        }}
                        className="w-full px-2.5 py-1.5 rounded-[10px] border border-gray-200 bg-[#f9fafc] text-[11px] font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                    >
                        {termOptions.map((t) => (
                            <option key={t.value} value={t.value}>
                                {t.label}
                            </option>
                        ))}
                    </select>
                </div>

                <button className="w-full h-8 rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold transition-colors cursor-pointer">
                    <Link href="/student-affairs/college-data/new-year">Start a New Year</Link>
                </button>
            </div>

            {/* Footer Settings & User Profile */}
            <div className="p-4 mt-auto border-t border-gray-100/50 flex flex-col gap-2">
                {/* Profile Card */}
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors mb-2">
                    {/* Faking the avatar */}
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center text-gray-400 font-bold bg-gradient-to-tr from-gray-100 to-gray-200 cursor-pointer">
                        MO
                    </div>
                    <div className="flex flex-col cursor-pointer">
                        <span className="text-[14px] font-bold text-gray-900">Mohamed Osama</span>
                        <span className="bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded w-fit uppercase tracking-wider mt-0.5">Admin</span>
                    </div>
                </div>

                <Link href="/settings" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors group font-semibold text-[14px] cursor-pointer">
                    <Settings className="w-5 h-5 text-gray-500 group-hover:text-gray-800" strokeWidth={1.5} />
                    Settings
                </Link>

                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-semibold text-[14px] text-left w-full cursor-pointer">
                    <LogOut className="w-5 h-5" strokeWidth={1.5} />
                    Log out
                </button>
            </div>

        </aside>
    );
};
