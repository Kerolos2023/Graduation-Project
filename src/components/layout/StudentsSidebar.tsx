"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Settings, LogOut, Users, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { authService } from '@/services/authServices';
import { academicService } from '@/services/academicServices';
import { useAcademicContext } from '@/hooks/useAcademicContext';
import { useAuth, getInitials } from '@/hooks/useAuth';
import { SETTINGS_ROUTE, roleLabels } from '@/lib/roles';

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
            "flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all group mx-3",
            isActive
                ? "bg-white text-gray-900 shadow-sm border border-gray-100"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
        )}>
            <div className="flex items-center gap-3">
                <Icon
                    className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-blue-600" : "text-gray-400 group-hover:text-blue-500")}
                    strokeWidth={1.5}
                />
                <span className="text-[14px] font-semibold">{label}</span>
            </div>
        </div>
    </Link>
);

interface StudentsSidebarProps {
    onClose?: () => void;
}

export const StudentsSidebar: React.FC<StudentsSidebarProps> = ({ onClose }) => {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuth();
    const initials = user?.name ? getInitials(user.name) : "?";
    const badge = user?.roles?.filter(r => r !== "Student")[0] ?? "AcademicAdvising";

    const { setSelectedProgramId, incrementAcademicVersion } = useAcademicContext();

    const [programs, setPrograms] = useState<{ id: string; name: string }[]>([]);
    const [selectedProgram, setSelectedProgram] = useState<string>("");

    const handleLogout = async () => {
        try {
            await authService.logout();
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

    // ── Fetch programs on mount ────────────────────────────────────────────────
    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                const list = await academicService.getAllPrograms();
                setPrograms(list);
                if (list.length > 0) {
                    setSelectedProgram(list[0].id);
                    setSelectedProgramId(list[0].id);
                    incrementAcademicVersion();
                }
            } catch (error) {
                console.error("Error fetching programs:", error);
            }
        };
        fetchPrograms();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <aside className="w-[280px] h-full bg-white rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col border border-gray-100/50 shrink-0 overflow-hidden">

            {/* ── Brand ── */}
            <div className="flex items-center gap-3 p-8 pb-6 shrink-0">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                    <Image
                        src="/auth/Vector.svg"
                        alt="Universe Logo"
                        width={32}
                        height={32}
                        className="w-full h-full object-contain"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-bold text-[19px] tracking-tight text-gray-900">Universe</span>
                    <span className="bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded ml-1 tracking-wider uppercase whitespace-nowrap">
                        Beta Version
                    </span>
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar flex flex-col">

                {/* ── Nav Items ── */}
                <nav className="flex flex-col gap-1.5 px-1 py-2">
                    <NavItem
                        icon={Users}
                        label="Students"
                        href="/student-affairs/students"
                        isActive={pathname?.startsWith('/student-affairs/students')}
                        onClick={onClose}
                    />
                </nav>

                {/* ── Program Selector ── */}
                <div className="px-4 pt-2 pb-4 mt-auto">
                    <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-1 mb-1.5 block">
                        Academic Program
                    </label>
                    <div className="relative">
                        <select
                            value={selectedProgram}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSelectedProgram(val);
                                setSelectedProgramId(val);
                                incrementAcademicVersion();
                            }}
                            className="appearance-none w-full h-[56px] px-4 pr-10 rounded-[16px] border border-[#D5D7DA] bg-[#F7F7F8] text-[14px] font-medium text-[#101828] focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                        >
                            {programs.length === 0 && <option value="">Loading...</option>}
                            {programs.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#344054]" />
                    </div>
                </div>
            </div>

            {/* ── Footer ── */}
            <div className="p-4 border-t border-gray-100/50 flex flex-col gap-2 shrink-0">
                {/* Profile */}
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors mb-2">
                    {user?.profilePictureUrl ? (
                        <Image
                            src={user.profilePictureUrl}
                            alt="Profile"
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover border border-gray-100 shrink-0"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full shrink-0 border border-blue-100 bg-gradient-to-tr from-blue-400 to-violet-500 flex items-center justify-center text-white text-[13px] font-bold">
                            {initials}
                        </div>
                    )}
                    <div className="flex flex-col">
                        <span className="text-[14px] font-bold text-gray-900">{user?.name || "—"}</span>
                        <span className="bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded w-fit uppercase tracking-wider mt-0.5">
                            {roleLabels[badge] ?? badge}
                        </span>
                    </div>
                </div>

                <Link
                    href={SETTINGS_ROUTE}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors group font-semibold text-[14px] cursor-pointer"
                >
                    <Settings className="w-5 h-5 text-gray-500 group-hover:text-gray-800 shrink-0" strokeWidth={1.5} />
                    Settings
                </Link>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-semibold text-[14px] text-left w-full cursor-pointer"
                >
                    <LogOut className="w-5 h-5 shrink-0" strokeWidth={1.5} />
                    Log out
                </button>
            </div>
        </aside>
    );
};
