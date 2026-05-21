import axiosInstance from '@/lib/axios';
import { COLLEGE_ID } from '@/lib/constants';

const BASE_URL = `/colleges/${COLLEGE_ID}/academic-programs`;

// ── Enums ──────────────────────────────────────────────────────────────────

export type AcademicDegree = 'Diploma' | 'Bachelor' | 'Master' | 'Doctorate';
export type AcademicLoad = 'StudyLevel' | 'GPA';

export const DEGREE_OPTIONS: { value: AcademicDegree; label: string }[] = [
  { value: 'Diploma',    label: 'Diploma' },
  { value: 'Bachelor',   label: 'Bachelor' },
  { value: 'Master',     label: 'Master' },
  { value: 'Doctorate',  label: 'Doctorate' },
];

export const LOAD_OPTIONS: { value: AcademicLoad; label: string }[] = [
  { value: 'StudyLevel', label: 'Study Level' },
  { value: 'GPA',        label: 'GPA' },
];

// ── Types ──────────────────────────────────────────────────────────────────

/** Minimal shape returned by GET all (list) */
export interface Department {
  id: string;
  name: string;
  code: string;
}

/** Full shape returned by GET by id and POST response */
export interface DepartmentDetail {
  id: string;
  name: string;
  code: string;
  description: string | null;
  requiredCreditHours: number | null;
  academicLoad: AcademicLoad | null;
  academicDegree: AcademicDegree | null;
  certificateTitle: string | null;
}

/** Payload for POST (create) and PUT (update) */
export interface DepartmentPayload {
  Name: string;
  Code: string;
  Description?: string;
  RequiredCreditHours?: number | null;
  AcademicLoad?: AcademicLoad | null;
  AcademicDegree?: AcademicDegree | null;
  CertificateTitle?: string;
}

export interface DepartmentListResponse {
  items?: Department[];
  data?: Department[];
  totalPages?: number;
  totalCount?: number;
  totalNumber?: number;
  meta?: { totalPages?: number };
}

// ── Service ────────────────────────────────────────────────────────────────

export const departmentsService = {

  getAll: async (pageNumber: number, pageSize: number, searchValue = ""): Promise<DepartmentListResponse> => {
    const params = {
      PageNumber: pageNumber,
      PageSize: pageSize,
      SearchValue: searchValue.trim(),
    };
    const response = await axiosInstance.get<DepartmentListResponse>(BASE_URL, { params });
    return response.data;
  },

  getById: async (id: string): Promise<DepartmentDetail> => {
    const response = await axiosInstance.get<DepartmentDetail>(`${BASE_URL}/${id}`);
    return response.data;
  },

  create: async (payload: DepartmentPayload): Promise<DepartmentDetail> => {
    const response = await axiosInstance.post<DepartmentDetail>(BASE_URL, payload);
    return response.data;
  },

  update: async (id: string, payload: DepartmentPayload): Promise<DepartmentDetail> => {
    const response = await axiosInstance.put<DepartmentDetail>(`${BASE_URL}/${id}`, payload);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axiosInstance.delete(`${BASE_URL}/${id}`);
    return response.data;
  },
};
