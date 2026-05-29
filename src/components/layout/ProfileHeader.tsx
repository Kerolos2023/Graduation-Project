"use client";

import React, { useEffect, useRef, useState } from "react";
import axiosInstance from "@/lib/axios";
import { useStudentContext } from "@/hooks/useStudentContext";
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

  const { studentId } = useStudentContext();
  const userId = studentId;

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [loading, setLoading] = useState<"upload" | "delete" | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const MAX_SIZE_MB = 2;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  const showToast = (type: ToastType, message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setValidationError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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

const handleUpload = async () => {
  if (!selectedFile || !userId) return;

  setLoading("upload");

  try {
    const formData = new FormData();

    formData.append("file", selectedFile);


    const res = await axiosInstance.post(
      `/users/upload-image?userId=${userId}`
      ,formData
    );

    const url = res.data?.imageUrl || res.data;

    setImageUrl(url);

    showToast("success", "Image uploaded successfully.");

    clearSelection();
  } catch (err: any) {

    showToast(
      "error",
      err?.response?.data?.title || "Upload failed"
    );
  } finally {
    setLoading(null);
  }
};

  const handleDelete = async () => {
    if (!imageUrl || !userId) return;

    setLoading("delete");

    try {
      await axiosInstance.delete("/users/remove-image", {
        params: { userId, imageUrl },
      });

      setImageUrl(null);
      setPreviewUrl(null);
      setSelectedFile(null);
      setShowDeleteConfirm(false);

      showToast("success", "Profile picture removed successfully.");
    } catch (err: any) {
      console.log(err);

      showToast(
        "error",
        err?.response?.data?.title || "Delete failed"
      );
    } finally {
      setLoading(null);
    }
  };

  useEffect(() => {
    const fetchImage = async () => {
      if (!userId) return;

      try {
        const res = await axiosInstance.get("/users/get-image-url", {
          params: { userId },
        });

        const data = res.data;
        const url = typeof data === "string" ? data : data?.imageUrl;

        setImageUrl(url || null);
      } catch (err) {
        console.log("FETCH IMAGE ERROR:", err);
      }
    };

    fetchImage();
  }, [userId]);

  const displayImage = previewUrl ?? imageUrl;
  const isBusy = loading !== null;

  return (
    <div>
      <div className="bg-white p-4 rounded-2xl shadow mb-4">
        <h2 className="text-lg font-semibold mb-4">Profile Picture</h2>

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
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {displayImage ? (
                <img
                  src={displayImage}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-tr from-slate-800 to-slate-600 rounded-full flex items-center justify-center text-white">
                  <Upload className="w-7 h-7" />
                </div>
              )}

              <button
                type="button"
                disabled={isBusy}
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-black text-white flex items-center justify-center border-2 border-white"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <button
                type="button"
                disabled={isBusy}
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 font-medium"
              >
                {selectedFile ? selectedFile.name : "Change Photo"}
              </button>

              <p className="text-sm text-gray-500">
                JPG, PNG or GIF, Max size 2MB
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            {selectedFile ? (
              <>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={handleUpload}
                  className="bg-black text-white px-4 py-2 rounded-full flex items-center gap-2"
                >
                  {loading === "upload" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {loading === "upload" ? "Saving..." : "Save"}
                </button>

                <button
                  type="button"
                  onClick={clearSelection}
                  className="bg-gray-200 px-4 py-2 rounded-full flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-black text-white px-4 py-2 rounded-full"
                >
                  Edit
                </button>

                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="bg-red-600 text-white px-4 py-2 rounded-full flex items-center gap-2"
                  >
                    {loading === "delete" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Delete
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {validationError && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4" />
            {validationError}
          </div>
        )}

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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold text-center">
              Remove Profile Picture?
            </h2>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 border py-2 rounded-full"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white py-2 rounded-full"
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