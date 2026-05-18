import axiosInstance from "@/lib/axios";

// ─── Payloads ────────────────────────────────────────────────────────────────

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordAdminPayload {
  userName: string;
  newPassword: string;
}

export interface UpdateEmailPayload {
  email: string;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const userSettingsService = {
  /**
   * PATCH /users/change-password
   * Changes the authenticated user's password.
   * The user will be required to re-login after a successful change.
   */
  changePassword: async (payload: ChangePasswordPayload): Promise<void> => {
    await axiosInstance.patch("/users/change-password", payload);
  },

  /**
   * PATCH /users/update-email
   * Updates the authenticated user's email address.
   */
  updateEmail: async (payload: UpdateEmailPayload): Promise<void> => {
    await axiosInstance.patch("/users/update-email", payload);
  },

  /**
   * PATCH /users/reset-password
   * Admin-level reset: sets a new password for any user by their userName.
   */
  resetPasswordAdmin: async (payload: ResetPasswordAdminPayload): Promise<void> => {
    await axiosInstance.patch("/users/reset-password", payload);
  },
};
