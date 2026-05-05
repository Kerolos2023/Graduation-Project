"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation'; 
import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import { useRole } from '@/hooks/roleCoontext';

const roleRoutes: Record<string, string> = {
  Student: "/student/basic-data-profile",
  Staff: "/staff/course-result",
  AcademicAdvising: "/student-affairs/college-data/courses",
};

export const SettingsNavbar = () => {
    const pathname = usePathname();
    const { activeRole } = useRole();
    
    const navLinks = [
        {
            label: "Switch Role",
            href: "/settings",
            active: pathname === '/settings'
        }
    ];

    const goBackHref = activeRole ? roleRoutes[activeRole] : "/auth/login";

    return (
        <div className="w-full bg-white rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0] flex items-center p-3 gap-2 overflow-x-auto shrink-0 mb-6">
            <Link 
                href={goBackHref}
                className="p-2 mr-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center shrink-0"
                title="Back to Dashboard"
            >
                <ArrowLeft className="w-5 h-5" />
            </Link>

            <div className="w-[1px] h-6 bg-gray-200 mr-2"></div>

            {navLinks.map((link, idx) => (
                <Link
                    key={idx}
                    href={link.href}
                    className={cn(
                        "px-6 py-[9px] rounded-xl font-bold text-[13px] whitespace-nowrap transition-colors",
                        link.active
                            ? "bg-[#f2f7ff] text-blue-600 shadow-sm"
                            : "bg-[#f9fafc] text-[#71717a] hover:bg-gray-100 hover:text-gray-900 border border-transparent shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
                    )}
                >
                    {link.label}
                </Link>
            ))}
        </div>
    );
};
