"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, KeyRound, Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  userSettingsService,
  type ChangePasswordPayload,
} from "@/services/userSettingsServices";

// ─── Types ────────────────────────────────────────────────────────────────────

type FormStatus = "idle" | "loading" | "success" | "error";

// ─── Sub-components ───────────────────────────────────────────────────────────

function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold text-gray-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "••••••••"}
          disabled={disabled}
          className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 bg-gray-50 text-[14px] text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function StatusBanner({
  status,
  successMsg,
  errorMsg,
}: {
  status: FormStatus;
  successMsg: string;
  errorMsg: string;
}) {
  if (status === "success")
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[13px] font-medium animate-fade-in">
        <CheckCircle2 className="w-4 h-4 shrink-0" />
        {successMsg}
      </div>
    );
  if (status === "error")
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[13px] font-medium animate-fade-in">
        <AlertCircle className="w-4 h-4 shrink-0" />
        {errorMsg}
      </div>
    );
  return null;
}

// ─── Change Password Card ─────────────────────────────────────────────────────

function ChangePasswordCard() {
  const [form, setForm] = useState<ChangePasswordPayload>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("Something went wrong. Please try again.");

  const set = (field: keyof ChangePasswordPayload) => (v: string) =>
    setForm((f) => ({ ...f, [field]: v }));

  const isLoading = status === "loading";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setErrorMsg("New password and confirmation do not match.");
      setStatus("error");
      return;
    }
    if (form.newPassword.length < 6) {
      setErrorMsg("New password must be at least 6 characters.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      await userSettingsService.changePassword(form);
      setStatus("success");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setErrorMsg(
        axiosErr?.response?.data?.message ?? "Something went wrong. Please try again."
      );
      setStatus("error");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex flex-col h-fit">
      {/* Card Header */}
      <div className="px-7 pt-7 pb-2">
        <h2 className="text-[20px] font-bold text-gray-900 mb-2">Change Password</h2>
        <p className="text-[13px] text-gray-500 leading-relaxed">
          You will be required to login after changing your password.
        </p>
      </div>

      {/* Card Body */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-7 py-6">
        <PasswordInput
          id="current-password"
          label="Current Password"
          value={form.currentPassword}
          onChange={set("currentPassword")}
          placeholder="Enter current password"
          disabled={isLoading}
        />
        <PasswordInput
          id="new-password"
          label="New Password"
          value={form.newPassword}
          onChange={set("newPassword")}
          placeholder="Enter new password"
          disabled={isLoading}
        />
        <PasswordInput
          id="confirm-password"
          label="Confirm New Password"
          value={form.confirmPassword}
          onChange={set("confirmPassword")}
          placeholder="Re-enter new password"
          disabled={isLoading}
        />

        <StatusBanner
          status={status}
          successMsg="Password updated successfully!"
          errorMsg={errorMsg}
        />

        <button
          type="submit"
          disabled={
            isLoading ||
            !form.currentPassword ||
            !form.newPassword ||
            !form.confirmPassword
          }
          className="mt-4 w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-[14px] font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 shadow-sm shadow-blue-200"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Updating…
            </>
          ) : (
            "Update Password"
          )}
        </button>
      </form>
    </div>
  );
}

// ─── Update Email Card ────────────────────────────────────────────────────────

function UpdateEmailCard() {
  const { user, updateUser } = useAuth();

  // Pre-populate with the email from auth context if it exists
  const contextEmail = user?.email ?? "";
  const [email, setEmail] = useState(contextEmail);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("Something went wrong. Please try again.");

  const isLoading = status === "loading";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      await userSettingsService.updateEmail({ email: email.trim() });
      // Sync email back into auth context
      updateUser({ email: email.trim() });
      setStatus("success");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setErrorMsg(
        axiosErr?.response?.data?.message ?? "Something went wrong. Please try again."
      );
      setStatus("error");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex flex-col h-fit">
      {/* Card Header */}
      <div className="px-7 pt-7 pb-2">
        <h2 className="text-[20px] font-bold text-gray-900 mb-2">Email</h2>
        <p className="text-[13px] text-gray-500 leading-relaxed">
          Select or add a new email address to receive notifications. Only verified emails can be designated as the primary email address, which is used to log in.
        </p>
      </div>

      {/* Card Body */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-7 py-6">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="email-address"
            className="text-[13px] font-bold text-gray-900"
          >
            Change Email address
          </label>
          <input
            id="email-address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={contextEmail ? contextEmail : "e.g. yourname@example.com"}
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-[14px] text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {contextEmail && (
            <p className="text-[12px] text-gray-400 pl-1">
              Current:{" "}
              <span className="font-medium text-gray-600">{contextEmail}</span>
            </p>
          )}
        </div>

        <StatusBanner
          status={status}
          successMsg="Email updated successfully!"
          errorMsg={errorMsg}
        />

        <button
          type="submit"
          disabled={isLoading || !email.trim() || email.trim() === contextEmail}
          className="mt-4 w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-[14px] font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 shadow-sm shadow-blue-200"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Update Email"
          )}
        </button>
      </form>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StudentSettingsPage() {
  return (
    <div className="w-full h-full flex flex-col gap-6">
      {/* Page Header */}
      <div className="shrink-0">
        <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-[14px] text-gray-500 mt-0.5">
          Manage your account security and contact information.
        </p>
      </div>

      {/* Two-column grid — Change Password LEFT, Email RIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        <ChangePasswordCard />
        <UpdateEmailCard />
      </div>
    </div>
  );
}
