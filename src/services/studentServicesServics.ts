import axiosInstance from "@/lib/axios";
import { COLLEGE_ID } from "@/lib/constants";



// ─── Types ────────────────────────────────────────────────────────────────────

export interface ServiceHistoryItem {
  price: number;
  serviceName: string;
  studentName: string;
  studentCode: string;
  createdAt: string;
  updatedAt: string | null;
  /** "Pending" | "Approved" | "Rejected" */
  status: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface CheckoutResponse {
  id: string;
  approvalUrl: string;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const studentServicesService = {
  /** GET /service-requests/student-history */
  getHistory: async (
    pageNumber = 1,
    pageSize = 10,
    searchValue = ""
  ): Promise<PaginatedResponse<ServiceHistoryItem>> => {
    const response = await axiosInstance.get(`/colleges/${COLLEGE_ID}/service-requests/student-history`, {
      params: { PageNumber: pageNumber, PageSize: pageSize, SearchValue: searchValue || undefined },
    });
    return response.data;
  },

  /** GET /services */
  getServices: async (
    pageNumber = 1,
    pageSize = 10,
    searchValue = ""
  ): Promise<PaginatedResponse<ServiceItem>> => {
    const response = await axiosInstance.get(`/colleges/${COLLEGE_ID}/services`, {
      params: {
        PageNumber: pageNumber,
        PageSize: pageSize,
        SearchValue: searchValue || undefined,
      },
    });
    return response.data;
  },

  /** POST /services/{serviceId}/checkout */
  checkout: async (serviceId: string): Promise<CheckoutResponse> => {
    const response = await axiosInstance.post(`/services/${serviceId}/checkout`);
    return response.data;
  },
};
