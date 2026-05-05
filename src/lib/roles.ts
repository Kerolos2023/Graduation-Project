export const roleRoutes: Record<string, string> = {
  Student: "/student",
  Staff: "/staff",
  AcademicAdvising: "/student-affairs",
};

export const getMainRole = (roles: string[]) => {
  const priority = ["AcademicAdvising", "Staff", "Student"];
  return roles.find((r) => priority.includes(r)) || roles[0];
};