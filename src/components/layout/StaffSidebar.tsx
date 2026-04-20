"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LogOut,
  Settings,
  ClipboardList,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import axiosInstance from "@/lib/axios";
import { useStaffContext } from "@/hooks/useStaffContext";

const COLLEGE_ID = "019c1ea6-1738-71cb-8cfd-a90e126d177e";

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  isActive?: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({
  icon: Icon,
  label,
  href,
  isActive,
  onClick,
}) => (
  <Link href={href} onClick={onClick}>
    <div
      className={cn(
        "flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all group mx-3",
        isActive
          ? "bg-white text-gray-900 shadow-sm border border-gray-100"
          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
      )}
    >
      <div className="flex items-center gap-3">
        <Icon
          className={cn(
            "w-5 h-5 flex-shrink-0",
            isActive ? "text-blue-600" : "text-gray-400 group-hover:text-blue-500"
          )}
          strokeWidth={1.5}
        />
        <span className="text-[14px] font-semibold">{label}</span>
      </div>
    </div>
  </Link>
);

interface StaffSidebarProps {
  onClose?: () => void;
}

export const StaffSidebar: React.FC<StaffSidebarProps> = ({ onClose }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { setSelectedProgramId, setCurrentAcademicYearId } = useStaffContext();

  const [programs, setPrograms] = useState<{ id: string; name: string }[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>("");

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

  const fetchCurrentAcademicYear = async () => {
    try {
      // Same pattern as Sidebar.tsx in student-affairs
      const res = await axiosInstance.get(`/colleges/${COLLEGE_ID}/academic-years/current`);
      const year = res.data;
      if (year?.id) {
        setCurrentAcademicYearId(year.id);
      }
    } catch (error) {
      console.error("Error fetching current academic year:", error);
    }
  };

  useEffect(() => {
    fetchPrograms();
    fetchCurrentAcademicYear();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/Auth/revoke-refresh-token");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
      }
      router.replace("/auth/login");
    }
  };

  return (
    <aside className="w-[280px] h-full bg-white rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col border border-gray-100/50 shrink-0 overflow-hidden">
      {/* ── Brand ── */}
      <div className="flex items-center gap-3 p-6 pb-4 shrink-0">
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
          <span className="font-bold text-[19px] tracking-tight text-gray-900">
            Universe
          </span>
          <span className="bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded ml-1 tracking-wider uppercase whitespace-nowrap">
            Beta Version
          </span>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="mx-4 border-t border-gray-100 mb-2 shrink-0" />

      {/* ── Nav Items ── */}
      <nav className="flex-1 flex flex-col gap-1 overflow-y-auto px-1 py-2 custom-scrollbar min-h-0">
        <NavItem
          icon={ClipboardList}
          label="Course Result"
          href="/staff/course-result"
          isActive={pathname?.startsWith("/staff/course-result")}
          onClick={onClose}
        />
      </nav>

      {/* ── Footer ── */}
      <div className="p-4 mt-auto border-t border-gray-100/50 flex flex-col gap-2 shrink-0">

        {/* ── Program Selector ── */}
        <div className="relative mb-1">
          <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1 block px-1">
            Program
          </label>
          <div className="relative">
            <select
              value={selectedProgram}
              onChange={(e) => {
                setSelectedProgram(e.target.value);
                setSelectedProgramId(e.target.value);
              }}
              className="appearance-none w-full h-[44px] px-3 pr-9 rounded-[14px] border border-[#D5D7DA] bg-[#F7F7F8] text-[13px] font-medium text-[#101828] focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              {programs.length === 0 && <option value="">Select Program</option>}
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#344054]" />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 my-1" />

        {/* Static Profile */}
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
          <div className="w-10 h-10 rounded-full shrink-0 border border-blue-100 bg-gradient-to-tr from-blue-400 to-violet-500 flex items-center justify-center text-white text-[13px] font-bold">
            MO
          </div>
          <div className="flex flex-col">
            <span className="text-[14px] font-bold text-gray-900">
              Mohamed Osama
            </span>
            <span className="bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded w-fit uppercase tracking-wider mt-0.5">
              Staff
            </span>
          </div>
        </div>

        <Link
          href="/settings"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors group font-semibold text-[14px] cursor-pointer"
        >
          <Settings
            className="w-5 h-5 text-gray-500 group-hover:text-gray-800 shrink-0"
            strokeWidth={1.5}
          />
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
