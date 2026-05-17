"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  CalendarPlus,
  ClipboardCheck,
  GraduationCap,
  IdCard,
  LogOut,
  ShoppingBag,
  ClipboardList,
  TrendingUp,
  ChartBarIncreasing,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { authService } from "@/services/authServices";
import { useAuth, getInitials } from "@/hooks/useAuth";
import { isMultiRole } from "@/lib/roles";

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

interface StudentSidebarProps {
  onClose?: () => void;
}

const NAV_ITEMS = [
  {
    icon: IdCard,
    label: "Basic Data Profile",
    href: "/student/basic-data-profile",
  },
  {
    icon: GraduationCap,
    label: "Academic Degrees",
    href: "/student/academic-degrees",
  },
  {
    icon: ClipboardCheck,
    label: "Exam and Midterm",
    href: "/student/exam-and-midterm",
  },
  {
    icon: TrendingUp,
    label: "Student Progress",
    href: "/student/student-progress",
  },
  {
    icon: CalendarDays,
    label: "Schedule",
    href: "/student/schedule",
  },
  {
    icon: CalendarPlus,
    label: "Register Schedule",
    href: "/student/register-schedule",
  },
  {
    icon: ClipboardList,
    label: "My Services",
    href: "/student/services-history",
  },
  {
    icon: ShoppingBag,
    label: "Buy Services",
    href: "/student/services",
  },
  {
    icon: ChartBarIncreasing,
    label: "Service Status",
    href: "/student/service-request",
  },
] as const;

const STATIC_PROFILE = {
  name: "Tarek Ahmed",
  code: "2020203051",
  initials: "TA",
};

export const StudentSidebar: React.FC<StudentSidebarProps> = ({ onClose }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const initials = user?.name ? getInitials(user.name) : "?";
  const hasMultipleRoles = user ? isMultiRole(user.roles) : false;

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch { /* ignore */ }
    logout();
    router.replace("/auth/login");
  };

  const isRootStudent = pathname === "/student";

  return (
    <aside className="w-[280px] h-full bg-white rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col border border-gray-100/50 shrink-0">
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
          <span className="font-bold text-[19px] tracking-tight text-gray-900">
            Universe
          </span>
          <span className="bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded ml-1 tracking-wider uppercase whitespace-nowrap">
            Beta Version
          </span>
        </div>
      </div>

      {/* ── Nav Items ── */}
      <nav className="flex-1 flex flex-col gap-1.5 overflow-y-auto px-1 py-2 custom-scrollbar min-h-0">
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
            isActive={
              pathname?.startsWith(item.href) ||
              (isRootStudent && item.href === "/student/basic-data-profile")
            }
            onClick={onClose}
          />
        ))}
      </nav>

      {/* ── Footer ── */}
      <div className="p-4 mt-auto border-t border-gray-100/50 flex flex-col gap-2 shrink-0">
        {/* Profile → links to profile picture page */}
        <Link
          href="/student/profile-picture"
          onClick={onClose}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors mb-2"
        >
          {user?.profilePictureUrl ? (
            <Image
              src={user.profilePictureUrl}
              alt="Profile"
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover border border-blue-100 shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full shrink-0 border border-blue-100 bg-gradient-to-tr from-blue-400 to-violet-500 flex items-center justify-center text-white text-[13px] font-bold">
              {initials}
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-[14px] font-bold text-gray-900">{user?.name || "—"}</span>
            <span className="text-[12px] text-gray-500">Student</span>
          </div>
        </Link>

        {/* Settings — only for multi-role users */}
        {hasMultipleRoles && (
          <Link
            href="/student-affairs/settings"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors group font-semibold text-[14px] cursor-pointer"
          >
            Settings
          </Link>
        )}

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
