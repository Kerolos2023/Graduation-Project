"use client";

import { useRef, useState } from "react";
import { Camera, Trash2, Upload, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { profilePictureService } from "@/services/profilePictureService";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE_MB = 2;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

type ToastType = "success" | "error";

interface Toast {
  type: ToastType;
  message: string;
}

export default function ProfilePicturePage() {
  // ── State ─────────────────────────────────────────────────────────────────
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [loading, setLoading] = useState<"upload" | "delete" | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const showToast = (type: ToastType, message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setValidationError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getInitials = () => "TA";

  // ── File Selection ─────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setValidationError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setValidationError("Only JPG, PNG, GIF, or WebP images are allowed.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setValidationError(`File size must not exceed ${MAX_SIZE_MB}MB.`);
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // ── Upload (POST if no image, PATCH if replacing) ──────────────────────────
  const handleUpload = async () => {
    if (!selectedFile) return;
    setLoading("upload");

    try {
      let newUrl: string;

      if (imageUrl) {
        // Already has an image → update
        newUrl = await profilePictureService.updateImage(selectedFile, imageUrl);
        showToast("success", "Profile picture updated successfully!");
      } else {
        // No existing image → upload fresh
        newUrl = await profilePictureService.uploadImage(selectedFile);
        showToast("success", "Profile picture uploaded successfully!");
      }

      setImageUrl(newUrl);
      clearSelection();
    } catch {
      showToast("error", "Failed to upload image. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!imageUrl) return;
    setShowDeleteConfirm(false);
    setLoading("delete");

    try {
      await profilePictureService.removeImage(imageUrl);
      setImageUrl(null);
      clearSelection();
      showToast("success", "Profile picture removed successfully.");
    } catch {
      showToast("error", "Failed to delete image. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const displayImage = previewUrl ?? imageUrl;
  const isUploading = loading === "upload";
  const isDeleting = loading === "delete";
  const isBusy = loading !== null;

  return (
    <main className="h-full w-full">
      <section className="h-full w-full rounded-[18px] border border-[#e9ebf1] bg-white p-4 sm:p-6">
        <h1 className="text-[20px] font-bold text-[#0f172a]">Profile Picture</h1>

        {/* ── Toast Notification ────────────────────────────────────────────── */}
        {toast && (
          <div
            className={`mt-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
              toast.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        )}

        {/* ── Main Card ─────────────────────────────────────────────────────── */}
        <div className="mt-5 rounded-[14px] border border-[#e9ebf1] bg-[#fcfcfd] px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Avatar + Info */}
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative shrink-0">
                {displayImage ? (
                  <img
                    src={displayImage}
                    alt="Profile"
                    className="h-14 w-14 rounded-full object-cover ring-2 ring-[#e9ebf1]"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-blue-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold ring-2 ring-[#e9ebf1]">
                    {getInitials()}
                  </div>
                )}

                {/* Camera badge */}
                <button
                  type="button"
                  id="trigger-file-picker"
                  disabled={isBusy}
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#0f172a] text-white transition-colors hover:bg-[#334155] disabled:cursor-not-allowed disabled:opacity-50"
                  title="Change photo"
                >
                  <Camera className="h-3 w-3" />
                </button>
              </div>

              {/* Label */}
              <div className="space-y-0.5">
                <button
                  type="button"
                  id="change-photo-btn"
                  disabled={isBusy}
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer text-left text-[13px] font-semibold text-[#0f172a] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {selectedFile ? selectedFile.name : "Change Photo"}
                </button>
                <p className="text-[11px] text-[#94a3b8]">
                  {selectedFile
                    ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                    : "JPG, PNG, GIF or WebP · Max 2MB"}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              {/* Upload / Save button — only shown when a file is selected */}
              {selectedFile && (
                <>
                  <button
                    type="button"
                    id="save-photo-btn"
                    disabled={isBusy}
                    onClick={handleUpload}
                    className="flex items-center gap-1.5 cursor-pointer rounded-full bg-[#111827] px-4 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-[#1f2937] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isUploading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5" />
                    )}
                    {isUploading ? "Saving…" : "Save"}
                  </button>

                  <button
                    type="button"
                    id="cancel-selection-btn"
                    disabled={isBusy}
                    onClick={clearSelection}
                    className="flex items-center gap-1.5 cursor-pointer rounded-full border border-[#e9ebf1] bg-white px-4 py-1.5 text-[12px] font-semibold text-[#64748b] transition-colors hover:bg-[#f1f5f9] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <X className="h-3.5 w-3.5" />
                    Cancel
                  </button>
                </>
              )}

              {/* Edit (browse) button — shown when no file is pending */}
              {!selectedFile && (
                <button
                  type="button"
                  id="edit-photo-btn"
                  disabled={isBusy}
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer rounded-full bg-[#111827] px-4 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-[#1f2937] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Edit
                </button>
              )}

              {/* Delete button — only shown when a saved image exists */}
              {imageUrl && !selectedFile && (
                <button
                  type="button"
                  id="delete-photo-btn"
                  disabled={isBusy}
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1.5 cursor-pointer rounded-full bg-[#ef4444] px-4 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-[#dc2626] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDeleting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  {isDeleting ? "Deleting…" : "Delete"}
                </button>
              )}
            </div>
          </div>

          {/* Validation Error */}
          {validationError && (
            <div className="mt-3 flex items-center gap-1.5 text-[12px] text-red-600">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {validationError}
            </div>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          id="profile-image-input"
          accept={ACCEPTED_TYPES.join(",")}
          className="hidden"
          onChange={handleFileChange}
        />

        {/* ── Delete Confirmation Dialog ─────────────────────────────────────── */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                  <Trash2 className="h-6 w-6 text-red-500" />
                </div>
                <h2 className="text-[16px] font-bold text-[#0f172a]">Remove Profile Picture?</h2>
                <p className="text-[13px] text-[#64748b]">
                  This will permanently remove your profile picture. Are you sure?
                </p>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  id="cancel-delete-btn"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 rounded-full border border-[#e9ebf1] py-2 text-[13px] font-semibold text-[#64748b] transition-colors hover:bg-[#f1f5f9]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="confirm-delete-btn"
                  onClick={handleDelete}
                  className="flex-1 rounded-full bg-[#ef4444] py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#dc2626]"
                >
                  Yes, Remove
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
