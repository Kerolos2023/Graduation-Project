import axiosInstance from "@/lib/axios";
import { COLLEGE_ID } from "@/lib/constants";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UploadImageResponse {
  imageUrl: string;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const profilePictureService = {
  /**
   * POST /users/upload-image
   * Body: FormData { file }
   * Returns: URL string of the uploaded image
   */
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post("/users/upload-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // API returns the URL directly as a string
    return typeof response.data === "string"
      ? response.data
      : (response.data?.imageUrl ?? response.data?.url ?? "");
  },

  /**
   * PATCH /users/update-image
   * Body: FormData { newImageFile, oldImageUrl }
   * Returns: URL string of the new image
   */
  updateImage: async (newFile: File, oldImageUrl: string): Promise<string> => {
    const formData = new FormData();
    formData.append("newImageFile", newFile);
    formData.append("oldImageUrl", oldImageUrl);

    const response = await axiosInstance.patch("/users/update-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return typeof response.data === "string"
      ? response.data
      : (response.data?.imageUrl ?? response.data?.url ?? "");
  },

  /**
   * DELETE /users/remove-image
   * Params: { imageUrl }
   */
  removeImage: async (imageUrl: string): Promise<void> => {
    await axiosInstance.delete("/users/remove-image", {
      params: { imageUrl },
    });
  },
};
