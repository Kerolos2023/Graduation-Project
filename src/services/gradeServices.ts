import axiosInstance from "@/lib/axios";

const LEVEL_ID = "019c1ea6-1738-71cb-8cfd-a90e126d177e";


export interface GradeSetting {
  id?: string;
  name: string;
  code: string;
  minScore: number;
  maxScore: number;
}

export const gradeService = {
  getAll: (params?: any) =>
    axiosInstance.get(`/Grade/${LEVEL_ID}-all`, { params }),

  getById: (id: string) =>
    axiosInstance.get(`/Grade/${id}`),

  create: (data: GradeSetting) =>
    axiosInstance.post(`/Grade/${LEVEL_ID}-create`, data),

  update: (id: string, data: GradeSetting) =>
    axiosInstance.put(`/Grade/${id}`, data),

  delete: (id: string) =>
    axiosInstance.delete(`/Grade/${id}`),
};