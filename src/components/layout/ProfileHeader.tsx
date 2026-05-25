"use client";

import React, { useRef, useState } from "react";
import {
  Camera,
  Trash2,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

type ToastType = "success" | "error";

interface Toast {
  type: ToastType;
  message: string;
}

function ProfileHeader() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [loading, setLoading] = useState<"upload" | "delete" | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const ACCEPTED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  const MAX_SIZE_MB = 2;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  const showToast = (type: ToastType, message: string) => {
    setToast({ type, message });

    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setValidationError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setValidationError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setValidationError(
        "Only JPG, PNG, GIF, or WebP images are allowed."
      );
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setValidationError(
        `File size must not exceed ${MAX_SIZE_MB}MB.`
      );
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading("upload");

    try {
      await new Promise((resolve) =>
        setTimeout(resolve, 1500)
      );

      setImageUrl(previewUrl);
      showToast("success", "Profile picture updated successfully!");
      clearSelection();
    } catch {
      showToast(
        "error",
        "Failed to upload image. Please try again."
      );
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async () => {
    setLoading("delete");

    try {
      await new Promise((resolve) =>
        setTimeout(resolve, 1000)
      );

      setImageUrl(null);
      setPreviewUrl(null);
      setSelectedFile(null);
      setShowDeleteConfirm(false);

      showToast(
        "success",
        "Profile picture removed successfully."
      );
    } catch {
      showToast(
        "error",
        "Failed to delete image. Please try again."
      );
    } finally {
      setLoading(null);
    }
  };

  const displayImage = previewUrl ?? imageUrl;

  const isUploading = loading === "upload";
  const isDeleting = loading === "delete";
  const isBusy = loading !== null;

  return (
    <div>
      <div className="bg-white p-4 rounded-2xl shadow mb-4">
        <h2 className="text-lg font-semibold mb-4">
          Profile Picture
        </h2>

        {/* Toast */}
        {toast && (
          <div
            className={`mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
              toast.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}

            <span>{toast.message}</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Left Side */}
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              {displayImage ? (
                <img
                  src={displayImage}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-tr from-slate-800 to-slate-600 rounded-full flex items-center justify-center text-white shadow-md">
                  <Upload className="w-7 h-7 opacity-90" />
                </div>
              )}

              <button
                type="button"
                disabled={isBusy}
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-black text-white flex items-center justify-center border-2 border-white hover:bg-gray-800 transition disabled:opacity-50"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Text */}
            <div>
              <button
                type="button"
                disabled={isBusy}
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 font-medium cursor-pointer hover:underline disabled:opacity-50"
              >
                {selectedFile
                  ? selectedFile.name
                  : "Change Photo"}
              </button>

              <p className="text-sm text-gray-500">
                {selectedFile
                  ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                  : "JPG, PNG or GIF, Max size 2MB"}
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-2">
            {selectedFile ? (
              <>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={handleUpload}
                  className="bg-black text-white px-4 py-2 rounded-full cursor-pointer flex items-center gap-2 hover:bg-gray-800 transition disabled:opacity-50"
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}

                  {isUploading ? "Saving..." : "Save"}
                </button>

                <button
                  type="button"
                  disabled={isBusy}
                  onClick={clearSelection}
                  className="bg-gray-200 px-4 py-2 rounded-full cursor-pointer flex items-center gap-2 hover:bg-gray-300 transition disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-black text-white px-4 py-2 rounded-full cursor-pointer hover:bg-gray-800 transition disabled:opacity-50"
                >
                  Edit
                </button>

                {imageUrl && (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() =>
                      setShowDeleteConfirm(true)
                    }
                    className="bg-red-600 text-white px-4 py-2 rounded-full cursor-pointer flex items-center gap-2 hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}

                    {isDeleting
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Error */}
        {validationError && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4" />
            {validationError}
          </div>
        )}

        {/* Hidden Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Delete Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>

              <h2 className="text-lg font-bold">
                Remove Profile Picture?
              </h2>

              <p className="text-sm text-gray-500">
                This will permanently remove your
                profile picture.
              </p>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() =>
                  setShowDeleteConfirm(false)
                }
                className="flex-1 border border-gray-200 py-2 rounded-full text-sm font-semibold hover:bg-gray-100 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white py-2 rounded-full text-sm font-semibold hover:bg-red-700 transition"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileHeader;