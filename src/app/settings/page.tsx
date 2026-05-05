"use client";

import { useRouter } from "next/navigation";
import { useRole } from "@/hooks/roleCoontext";
import { LogOut } from "lucide-react";
import axiosInstance from "@/lib/axios";

const roleRoutes: Record<string, string> = {
  Student: "/student/basic-data-profile",
  Staff: "/staff/course-result",
  AcademicAdvising: "/student-affairs/college-data/courses",
};

export default function GlobalSettingsPage() {
  const router = useRouter();
  const { roles, activeRole, setActiveRole } = useRole();

  const handleChange = (role: string) => {
    setActiveRole(role);
    // Use push so they can go back if needed, but since it's a global page, they will just navigate forward to the dashboard
    router.push(roleRoutes[role]);
  };

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
    <div className="p-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-sm text-gray-500">Manage your active role and preferences</p>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Active Role
          </label>
          <select
            value={activeRole || ""}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full border border-gray-200 p-3.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-900 font-medium cursor-pointer"
          >
            <option value="">Select Role</option>

            {roles.length === 0 ? (
              <option disabled>No roles found</option>
            ) : (
              roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))
            )}
          </select>
          {activeRole && (
            <p className="text-xs text-blue-600 mt-2 font-medium">
              Current dashboard: {activeRole}
            </p>
          )}
        </div>

        <div className="border-t border-gray-100 pt-6">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full p-3.5 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-colors font-semibold text-[14px]"
          >
            <LogOut className="w-5 h-5" strokeWidth={2} />
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
