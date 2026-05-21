import axiosInstance from '@/lib/axios';
import { COLLEGE_ID } from '@/lib/constants';

const BASE_URL = `/colleges/${COLLEGE_ID}/courses`;

// ── Types ──────────────────────────────────────────────────────────────────

export interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  preRequisites?: { id: string; name: string }[];
}

export interface CoursePayload {
  name: string;
  code: string;
  description: string;
  preRequisiteIds: string[];
}

export interface CourseListResponse {
  data?: Course[];
  items?: Course[];
  totalPages?: number;
  totalCount?: number;
  totalNumber?: number;
  meta?: { totalPages?: number };
}

// ── Service ────────────────────────────────────────────────────────────────

export const collegeCoursesService = {

  getAll: async (pageNumber: number, pageSize: number, searchValue = ""): Promise<CourseListResponse> => {
    const params = {
      PageNumber: pageNumber,
      PageSize: pageSize,
      SearchValue: searchValue.trim(),
    };
    const response = await axiosInstance.get<CourseListResponse>(BASE_URL, { params });
    return response.data;
  },

  getById: async (id: string): Promise<Course> => {
    const response = await axiosInstance.get<{ data?: Course } & Course>(`${BASE_URL}/${id}`);
    return (response.data?.data ?? response.data) as Course;
  },

  create: async (payload: CoursePayload) => {
    const response = await axiosInstance.post(BASE_URL, payload);
    return response.data;
  },

  update: async (id: string, payload: CoursePayload) => {
    const response = await axiosInstance.put(`${BASE_URL}/${id}`, payload);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axiosInstance.delete(`${BASE_URL}/${id}`);
    return response.data;
  },
};
