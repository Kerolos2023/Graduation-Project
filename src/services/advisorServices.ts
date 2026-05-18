import axiosInstance from "@/lib/axios";
import { COLLEGE_ID } from "@/lib/constants";

export interface AdvisorStaffItem {
  id: string;
  name: string;
}

export interface StudentItem {
  id: string;
  name: string;
  studentCode: string;
  nationalIdOrPassport: string;
  gender: string | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// ── GET all staff (advisors) ──────────────────────────────────────────────────
export const advisorService = {
  getAllAdvisors: async (
    pageNumber = 1,
    pageSize = 1000
  ): Promise<PaginatedResponse<AdvisorStaffItem>> => {
    const res = await axiosInstance.get(`/colleges/${COLLEGE_ID}/stuff`, {
      params: { PageNumber: pageNumber, PageSize: pageSize, SortDirection: "asc" },
    });
    return res.data;
  },

  // ── GET students assigned to a specific advisor ─────────────────────────────
  getAdvisorStudents: async (params: {
    advisorId: string;
    academicProgramId?: string | null;
    pageNumber?: number;
    pageSize?: number;
    searchValue?: string;
    sortColumn?: string;
  }): Promise<PaginatedResponse<StudentItem>> => {
    const res = await axiosInstance.get(
      `/colleges/${COLLEGE_ID}/stuff/advisor-students`,
      {
        params: {
          advisorId: params.advisorId,
          collegeId: COLLEGE_ID,
          academicProgramId: params.academicProgramId ?? undefined,
          PageNumber: params.pageNumber ?? 1,
          PageSize: params.pageSize ?? 10,
          SearchValue: params.searchValue || undefined,
          SortColumn: params.sortColumn || undefined,
          SortDirection: "asc",
        },
      }
    );
    return res.data;
  },

  // ── GET students without advisor ────────────────────────────────────────────
  getStudentsWithoutAdvisor: async (params: {
    programId?: string | null;
    pageNumber?: number;
    pageSize?: number;
    searchValue?: string;
    sortColumn?: string;
  }): Promise<PaginatedResponse<StudentItem>> => {
    const res = await axiosInstance.get(`/students/without-advisor`, {
      params: {
        programId: params.programId ?? undefined,
        PageNumber: params.pageNumber ?? 1,
        PageSize: params.pageSize ?? 10,
        SearchValue: params.searchValue || undefined,
        SortColumn: params.sortColumn || undefined,
        SortDirection: "asc",
      },
    });
    return res.data;
  },

  // ── PATCH unassign advisor from students ────────────────────────────────────
  unassignAdvisor: async (studentIds: string[]): Promise<void> => {
    await axiosInstance.patch(`/students/unassign-advisor`, { studentIds });
  },

  // ── PUT assign advisor to students ─────────────────────────────────────────
  assignAdvisor: async (
    advisorId: string,
    studentIds: string[]
  ): Promise<void> => {
    await axiosInstance.put(
      `/colleges/${COLLEGE_ID}/stuff/${advisorId}/assign-advisor`,
      { studentIds }
    );
  },
};
