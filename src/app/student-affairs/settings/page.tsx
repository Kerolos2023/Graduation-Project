"use client";

import { useRouter } from "next/navigation";
import { useAuth, getInitials } from "@/hooks/useAuth";
import { roleRoutes, roleLabels, roleModuleAccess, SETTINGS_ROUTE } from "@/lib/roles";
import { Building2, ClipboardList, Users, LogOut, CheckCircle2, ChevronRight } from "lucide-react";
import axiosInstance from "@/lib/axios";
import Image from "next/image";

// ─── Module card definitions ───────────────────────────────────────────────────

const MODULE_CARDS: Record<string, { label: string; description: string; icon: React.ElementType; color: string; bg: string }> = {
  AcademicAdvising: {
    label: "Student Affairs",
    description: "Manage college data, departments, courses, schedules & students",
    icon: Building2,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  Staff: {
    label: "Staff Portal",
    description: "View and manage course results, grades & academic records",
    icon: ClipboardList,
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  StudentAdvisor: {
    label: "Student Advisor",
    description: "Register students, manage academic advising & course enrollment",
    icon: Users,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
};

export default function StudentAffairsSettingsPage() {
  const router = useRouter();
  const { user, switchModule, logout } = useAuth();

  // Derive switchable modules from all roles the user has (deduplicated)
  // e.g. AcademicAdvising → ["AcademicAdvising", "Staff"] (2 cards)
  //      Staff            → ["Staff"]                     (1 card)
  const accessibleModules = [
    ...new Set(user?.roles.flatMap((r) => roleModuleAccess[r] ?? []) ?? []),
  ].filter((m) => MODULE_CARDS[m]);

  const handleSwitch = (role: string) => {
    switchModule(role);
    const route = roleRoutes[role] ?? "/student-affairs/college-data/courses";
    router.push(route);
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/Auth/revoke-refresh-token");
    } catch { /* ignore */ }
    logout();
    router.replace("/auth/login");
  };

  const initials = user?.name ? getInitials(user.name) : "?";

  return (
    <div className="min-h-full p-6 md:p-10 space-y-8">

      {/* ── Profile Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-5">
        {/* Avatar */}
        <div className="relative shrink-0">
          {user?.profilePictureUrl ? (
            <Image
              src={user.profilePictureUrl}
              alt="Profile"
              width={64}
              height={64}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-100"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-violet-500 flex items-center justify-center text-white text-[20px] font-bold ring-2 ring-blue-100">
              {initials}
            </div>
          )}
          <span className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full bg-green-400 border-2 border-white" />
        </div>

        {/* Info */}
        <div>
          <h1 className="text-[22px] font-bold text-gray-900 leading-tight">
            {user?.name || "—"}
          </h1>
          {user?.email && (
            <p className="text-[13px] text-gray-500 mt-0.5">{user.email}</p>
          )}
          {/* Role badges */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {user?.roles.map((r) => (
              <span
                key={r}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  r === user.activeModule
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {roleLabels[r] ?? r}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Switch Module ───────────────────────────────────────────────────── */}
      {accessibleModules.length > 0 && (
        <section>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
            Switch Module
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {accessibleModules.map((moduleKey) => {
              const card = MODULE_CARDS[moduleKey];
              const Icon = card.icon;
              const isActive = user?.activeModule === moduleKey;

              return (
                <button
                  key={moduleKey}
                  onClick={() => handleSwitch(moduleKey)}
                  className={`relative w-full text-left p-5 rounded-2xl border-2 transition-all group cursor-pointer ${
                    isActive
                      ? "border-blue-500 bg-blue-50/60 shadow-sm"
                      : "border-gray-100 bg-white hover:border-blue-200 hover:shadow-sm"
                  }`}
                >
                  {/* Active checkmark */}
                  {isActive && (
                    <CheckCircle2 className="absolute top-4 right-4 w-5 h-5 text-blue-500" />
                  )}

                  {/* Icon */}
                  <div className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 ${card.color}`} strokeWidth={1.8} />
                  </div>

                  {/* Labels */}
                  <p className="text-[15px] font-bold text-gray-900 mb-1">{card.label}</p>
                  <p className="text-[12px] text-gray-500 leading-relaxed">{card.description}</p>

                  {/* Arrow on hover */}
                  {!isActive && (
                    <div className="mt-3 flex items-center gap-1 text-[12px] font-semibold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      Switch <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  )}

                  {isActive && (
                    <div className="mt-3 text-[12px] font-semibold text-blue-500">
                      Currently active
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Account Info ─────────────────────────────────────────────────────── */}
      <section>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
          Account
        </p>
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-[13px] text-gray-500 font-medium">Full Name</span>
            <span className="text-[13px] font-semibold text-gray-900">{user?.name || "—"}</span>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-[13px] text-gray-500 font-medium">Email</span>
            <span className="text-[13px] font-semibold text-gray-900">{user?.email || "—"}</span>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-[13px] text-gray-500 font-medium">Roles</span>
            <span className="text-[13px] font-semibold text-gray-900">
              {user?.roles.map((r) => roleLabels[r] ?? r).join(", ") || "—"}
            </span>
          </div>
        </div>
      </section>

      {/* ── Danger Zone ──────────────────────────────────────────────────────── */}
      <section>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
          Danger Zone
        </p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-5 py-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 transition-colors font-semibold text-[14px] cursor-pointer"
        >
          <LogOut className="w-5 h-5" strokeWidth={1.8} />
          Sign Out
        </button>
      </section>

    </div>
  );
}
