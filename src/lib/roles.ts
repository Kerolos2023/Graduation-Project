// ─── Role → default landing page ──────────────────────────────────────────────
export const roleRoutes: Record<string, string> = {
  Student:        "/student/basic-data-profile",
  Staff:          "/staff/course-result",
  AcademicAdvising: "/student-affairs/college-data/courses",
  StudentAdvisor: "/student-advisor/register",
};

// ─── Settings page for multi-role users ───────────────────────────────────────
export const SETTINGS_ROUTE = "/student-affairs/settings";

// ─── Role display labels ───────────────────────────────────────────────────────
export const roleLabels: Record<string, string> = {
  Student:          "Student",
  Staff:            "Staff Portal",
  AcademicAdvising: "Student Affairs",
  StudentAdvisor:   "Student Advisor",
};

// Role → which module cards appear in the settings switcher
// AcademicAdvising can switch to any non-student module (student-affairs + staff)
// Staff can only switch to the staff module
export const roleModuleAccess: Record<string, string[]> = {
  Student:          [],                                  // no switching
  Staff:            ["Staff", "StudentAdvisor"],          // Staff Portal + Student Advisor
  AcademicAdvising: ["AcademicAdvising", "Staff"],        // Student Affairs + Staff Portal
};

// ─── Is this a multi-role user? ───────────────────────────────────────────────
export const isMultiRole = (roles: string[]): boolean =>
  roles.some((r) => r !== "Student");

// ─── First role from the backend array ────────────────────────────────────────
export const getFirstRole = (roles: string[]): string => roles[0] ?? "";

// ─── Legacy helper (kept for guard compatibility) ─────────────────────────────
export const getMainRole = (roles: string[]) => getFirstRole(roles);