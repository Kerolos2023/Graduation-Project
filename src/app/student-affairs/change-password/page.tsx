"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, KeyRound } from "lucide-react";
import {
  userSettingsService,
  type ResetPasswordAdminPayload,
} from "@/services/userSettingsServices";

// ─── Types ────────────────────────────────────────────────────────────────────

type FormStatus = "idle" | "loading" | "success" | "error";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChangePasswordAdminPage() {
  const [form, setForm] = useState<ResetPasswordAdminPayload>({
    userName: "",
    newPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("Something went wrong. Please try again.");

  const isLoading = status === "loading";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.userName.trim() || !form.newPassword.trim()) return;

    setStatus("loading");
    try {
      await userSettingsService.resetPasswordAdmin({
        userName: form.userName.trim(),
        newPassword: form.newPassword,
      });
      setStatus("success");
      setForm({ userName: "", newPassword: "" });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; errors?: string[]; title?: string } } };
      const data = axiosErr?.response?.data;
      
      let errMsg = "Something went wrong. Please try again.";
      if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        errMsg = data.errors.join(", ");
      } else if (data?.message) {
        errMsg = data.message;
      } else if (data?.title) {
        errMsg = data.title;
      }

      setErrorMsg(errMsg);
      setStatus("error");
    }
  };

  const isDisabled = isLoading || !form.userName.trim() || !form.newPassword.trim();

  return (
    <div className="w-full h-full flex flex-col">
      {/* ── White Content Card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-8 w-full">

        {/* Header */}
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5 text-blue-600" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-gray-900 leading-tight">
              Change Password
            </h1>
            <p className="text-[13px] text-gray-500 mt-0.5">
              Reset any user's password by providing their username and a new password.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-5 mb-7" />

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Two fields side-by-side — matching screenshot */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="admin-username"
                className="text-[13px] font-semibold text-gray-700"
              >
                Username
              </label>
              <input
                id="admin-username"
                type="text"
                value={form.userName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, userName: e.target.value }))
                }
                placeholder="Enter username"
                disabled={isLoading}
                autoComplete="off"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-[14px] text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* New Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="admin-new-password"
                className="text-[13px] font-semibold text-gray-700"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="admin-new-password"
                  type={showPassword ? "text" : "password"}
                  value={form.newPassword}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, newPassword: e.target.value }))
                  }
                  placeholder="Enter new password"
                  disabled={isLoading}
                  autoComplete="new-password"
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 bg-gray-50 text-[14px] text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Status Banner */}
          {status === "success" && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[13px] font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Password has been reset successfully.
            </div>
          )}
          {status === "error" && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[13px] font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          {/* Save Button — full width, matching screenshot */}
          <button
            type="submit"
            disabled={isDisabled}
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-[15px] font-semibold transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm shadow-blue-200"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
