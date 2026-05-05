"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

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
  const [roles, setRoles] = useState<string[]>([]);
  const [activeRole, setActiveRoleState] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const storedRoles = localStorage.getItem("roles");
    const storedActive = localStorage.getItem("activeRole");

    if (storedRoles) setRoles(JSON.parse(storedRoles));
    if (storedActive) setActiveRoleState(storedActive);
  }, []);

  const setSessionRoles = (newRoles: string[]) => {
    setRoles(newRoles);
    localStorage.setItem("roles", JSON.stringify(newRoles));
  };

  const setActiveRole = (role: string) => {
    setActiveRoleState(role);
    localStorage.setItem("activeRole", role);
  };

  let isUnauthorized = false;
  if (activeRole && pathname) {
    const isStaffPath = pathname.startsWith("/staff");
    const isStudentPath = pathname.startsWith("/student/") || pathname === "/student";
    const isStudentAffairsPath = pathname.startsWith("/student-affairs");

    if (activeRole === "Student" && (isStaffPath || isStudentAffairsPath)) {
      isUnauthorized = true;
    } else if (activeRole === "Staff" && (isStudentPath || isStudentAffairsPath)) {
      isUnauthorized = true;
    } else if (activeRole === "AcademicAdvising" && (isStaffPath || isStudentPath)) {
      isUnauthorized = true;
    }
  }

  useEffect(() => {
    if (!isUnauthorized || !activeRole) return;

    if (activeRole === "Student") {
      router.replace("/student/basic-data-profile");
    } else if (activeRole === "Staff") {
      router.replace("/staff/course-result");
    } else if (activeRole === "AcademicAdvising") {
      router.replace("/student-affairs/college-data/courses");
    }
  }, [isUnauthorized, activeRole, router]);

  return (
    <RoleContext.Provider value={{ roles, activeRole, setActiveRole, setSessionRoles }}>
      {isUnauthorized ? <div className="min-h-screen bg-gray-50 flex items-center justify-center"></div> : children}
    </RoleContext.Provider>
  );
};

export const useRole = () => useContext(RoleContext);