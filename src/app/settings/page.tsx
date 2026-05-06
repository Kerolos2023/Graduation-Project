"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { SETTINGS_ROUTE, isMultiRole } from "@/lib/roles";

/**
 * Old /settings route — now just a redirect shim.
 * Multi-role users  → /student-affairs/settings (full sidebar experience)
 * Student-only      → back to their home (no settings for students)
 */
export default function LegacySettingsRedirect() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.replace("/auth/login");
      return;
    }

    if (isMultiRole(user.roles)) {
      router.replace(SETTINGS_ROUTE);
    } else {
      // Student-only: no settings page, go home
      router.replace("/student/basic-data-profile");
    }
  }, [user, router]);

  return null;
}
