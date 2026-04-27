import axiosInstance from "@/lib/axios";

const COLLEGE_ID = "019c1ea6-1738-71cb-8cfd-a90e126d177e";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ServiceHistoryItem {
  price: number;
  serviceName: string;
  studentName: string;
  studentCode: string;
  createdAt: string;
  updatedAt: string;
  /** 0 = Pending, 1 = Approved, 2 = Rejected */
  status: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
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
    const response = await axiosInstance.get("/service-requests/student-history", {
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
    const response = await axiosInstance.get("/services", {
      params: {
        collegeId: COLLEGE_ID,
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
