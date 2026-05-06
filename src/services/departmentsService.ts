import axiosInstance from '@/lib/axios';
import { COLLEGE_ID } from '@/lib/constants';

const BASE_URL = `/colleges/${COLLEGE_ID}/academic-programs`;

// ── Types ──────────────────────────────────────────────────────────────────

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface DepartmentPayload {
  Name: string;
  Code: string;
}

export interface DepartmentListResponse {
  data?: Department[];
  items?: Department[];
  totalPages?: number;
  meta?: { totalPages?: number };
}

// ── Service ────────────────────────────────────────────────────────────────

export const departmentsService = {

  getAll: async (pageNumber: number, pageSize: number, searchValue?: string): Promise<DepartmentListResponse> => {
    const params: Record<string, unknown> = { PageNumber: pageNumber, PageSize: pageSize };
    if (searchValue) params.SearchValue = searchValue;
    const response = await axiosInstance.get<DepartmentListResponse>(BASE_URL, { params });
    return response.data;
  },

  getById: async (id: string): Promise<Department> => {
    const response = await axiosInstance.get<{ data?: Department } & Department>(`${BASE_URL}/${id}`);
    return (response.data?.data ?? response.data) as Department;
  },

  create: async (payload: DepartmentPayload) => {
    const response = await axiosInstance.post(BASE_URL, payload);
    return response.data;
  },

  update: async (id: string, payload: DepartmentPayload) => {
    const response = await axiosInstance.put(`${BASE_URL}/${id}`, payload);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axiosInstance.delete(`${BASE_URL}/${id}`);
    return response.data;
  },
};
