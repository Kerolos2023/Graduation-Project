import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { HeaderNavigation } from '@/components/layout/HeaderNavigation';

export default function StudentAffairsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen w-full bg-[#e7e9ef] p-5 gap-6 font-inter overflow-hidden">

            {/* Side Navigation Block */}
            <Sidebar />

            {/* Main Flow Right-Side */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden gap-6">

                {/* Top Navigation Block */}
                <HeaderNavigation />

                {/* Dynamic Pages Render Area (Scrolling) */}
                <div className="flex-1 overflow-y-auto min-h-0 pr-2 pb-4 scroll-smooth custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
}
