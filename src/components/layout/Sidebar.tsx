"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, Building2, Settings, LogOut } from 'lucide-react';
import { PiBuildingOfficeLight } from "react-icons/pi";
import { FaUniversity } from "react-icons/fa";
import { LuClipboardType } from "react-icons/lu";

import { cn } from '@/lib/utils';
import axiosInstance from '@/lib/axios';

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

    return (
        <aside className="w-[280px] h-full bg-white rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col border border-gray-100/50 shrink-0">

            {/* Brand Logo & Version */}
            <div className="flex items-center gap-3 p-8 pb-6">
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
                    <span className="bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded ml-1 tracking-wider uppercase">Beta Version</span>
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
                <NavItem
                    icon={FaUniversity}
                    label="Grades"
                    href="/student-affairs/college-data/grades"
                    isActive={pathname?.includes('/grades')}
                    onClick={onClose}
                />
                
            </nav>

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
