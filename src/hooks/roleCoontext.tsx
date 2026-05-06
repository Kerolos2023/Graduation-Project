"use client";

import { createContext, useContext, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { roleRoutes } from "@/lib/roles";

// ─── Guard logic ───────────────────────────────────────────────────────────────
//
// ACCESS MATRIX (based on activeModule):
//
//  activeModule      │ Accessible paths
//  ──────────────────┼──────────────────────────────────────────────
//  Student           │ /student/*
//  Staff             │ /staff/*, /student-advisor/*
//  StudentAdvisor    │ /student-advisor/*
//  AcademicAdvising  │ /student-affairs/*, /staff/*
//                    │   (/student-advisor requires switching to Staff module)
//
// MULTI-ROLE ["AcademicAdvising", "Staff"]:
//  → 3 module cards in settings: Student Affairs / Staff Portal / Student Advisor
//  → activeModule="AcademicAdvising" → student-affairs + staff paths
//  → activeModule="Staff"            → staff + student-advisor paths
//  → activeModule="StudentAdvisor"   → student-advisor paths
//
// UNAUTHENTICATED: any non-neutral path → /auth/login
// NEUTRAL PATHS  : /auth/*, /settings, /student-affairs/settings

function isPathAllowedForRole(pathname: string, role: string): boolean {
  const isStudent = pathname.startsWith("/student/") || pathname === "/student";
  const isStaff   = pathname.startsWith("/staff");
  const isAffairs = pathname.startsWith("/student-affairs");
  const isAdvisor = pathname.startsWith("/student-advisor");

  switch (role) {
    case "Student":
      // Student-only module
      return isStudent;

    case "Staff":
      // Staff module: staff pages + student-advisor pages
      return isStaff || isAdvisor;

    case "StudentAdvisor":
      // Student Advisor sub-module: student-advisor pages only
      return isAdvisor;

    case "AcademicAdvising":
      // Student Affairs module: student-affairs + staff pages
      // NOTE: /student-advisor requires switching to Staff or StudentAdvisor module
      return isAffairs || isStaff;

    default:
      return false;
  }
}

// ─── Context (kept for backward-compat; wraps AuthContext) ────────────────────

type RoleContextType = {
  roles: string[];
  activeRole: string | null;
  setActiveRole: (role: string) => void;
  setSessionRoles: (roles: string[]) => void;
};

const RoleContext = createContext<RoleContextType>({
  roles: [],
  activeRole: null,
  setActiveRole: () => {},
  setSessionRoles: () => {},
});

export const RoleProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, updateUser, switchModule } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const roles      = user?.roles ?? [];
  const activeRole = user?.activeModule ?? null;

  useEffect(() => {
    if (isLoading || !pathname) return;

    // Neutral paths — always accessible regardless of auth state
    const isNeutral =
      pathname.startsWith("/auth") ||
      pathname === "/settings" ||
      pathname === "/student-affairs/settings";

    if (isNeutral) return;

    // ── Not logged in → send to login ─────────────────────────────────────────
    if (!user || !activeRole) {
      router.replace("/auth/login");
      return;
    }

    // ── Wrong module → redirect to active module's home ───────────────────────
    if (!isPathAllowedForRole(pathname, activeRole)) {
      const fallback = roleRoutes[activeRole] ?? "/auth/login";
      router.replace(fallback);
    }
  }, [isLoading, user, activeRole, pathname, router]);

  const setSessionRoles = (newRoles: string[]) => updateUser({ roles: newRoles });
  const setActiveRole   = (role: string)       => switchModule(role);

  return (
    <RoleContext.Provider value={{ roles, activeRole, setActiveRole, setSessionRoles }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => useContext(RoleContext);