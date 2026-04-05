"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export const HeaderNavigation = () => {
    const pathname = usePathname();

    // Helper to determine active pills
    const isPersonal_data = pathname?.includes('/personal-data');
    const iscontact_information = pathname?.includes('/contact-information');
    const ismilitary_data = pathname?.includes('/military-data');
    const isprevious_qualification_data = pathname?.includes('/previous-qualification-data');
    const isparent_data = pathname?.includes('/parent-data');

    const navLinks = [
        { label: "Personal Data", active: isPersonal_data, href: "/student-affairs/students/forms/personal-data" },
        { label: "Parent Data", active: isparent_data, href: "/student-affairs/students/forms/parent-data" },
        { label: "Contact Information", active: iscontact_information, href: "/student-affairs/students/forms/contact-information" },
        { label: "Military Data", active: ismilitary_data, href: "/student-affairs/students/forms/military-data" },
        { label: "Previous Qualification Data", active: isprevious_qualification_data, href: "/student-affairs/students/forms/qualification-data" },
    ];

    return (
        <div className="w-full bg-white rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0] flex items-center p-3 gap-2 overflow-x-auto shrink-0">
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
