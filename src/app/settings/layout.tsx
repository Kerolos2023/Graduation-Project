import React from 'react';
import { SettingsNavbar } from '@/components/layout/SettingsNavbar';

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#f7f8fa] p-4 md:p-8 font-inter">
            <div className="max-w-4xl mx-auto">
                {/* Navbar for Settings */}
                <SettingsNavbar />
                
                {/* Page Content */}
                <div className="bg-white rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0] overflow-hidden">
                    {children}
                </div>
            </div>
        </div>
    );
}
