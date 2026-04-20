"use client";

import React, { useState } from "react";
import { StaffSidebar } from "@/components/layout/StaffSidebar";
import { Menu } from "lucide-react";
import { StaffProvider } from "@/hooks/useStaffContext";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <StaffProvider>
      <div className="flex h-[100dvh] w-full bg-[#e7e9ef] p-0 md:p-5 gap-0 md:gap-6 font-inter overflow-hidden relative">

        {/* ── Mobile Sidebar Overlay ── */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ── */}
        <div
          className={`
            fixed md:relative inset-y-0 left-0 z-50
            transform transition-transform duration-300 ease-in-out
            md:translate-x-0 bg-transparent h-full
            shadow-2xl md:shadow-none p-4 md:p-0
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
            md:block
          `}
        >
          <StaffSidebar onClose={() => setIsSidebarOpen(false)} />
        </div>

        {/* ── Main Content ── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden gap-4 md:gap-6 w-full p-4 md:p-0 bg-[#e7e9ef]">
          {/* Mobile Hamburger */}
          <div className="flex items-center gap-2 shrink-0 md:hidden">
            <button
              className="p-2.5 bg-white rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0] text-gray-700 hover:bg-gray-50 flex-shrink-0 cursor-pointer"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Page Content */}
          <div className="flex-1 overflow-y-auto min-h-0 md:pr-2 pb-4 scroll-smooth custom-scrollbar">
            {children}
          </div>
        </div>
      </div>
    </StaffProvider>
  );
}
