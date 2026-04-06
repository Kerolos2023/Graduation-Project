import axiosInstance from "@/lib/axios";

export interface AcademicLevel {
  id: string;
  name: string;
  minHours: number;
  maxHours: number;
}

export interface ApiResponse {
  items: AcademicLevel[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export const levelService = {

  getAllLevels: async (
    academicProgramId: string,
    params: {
      PageNumber: number;
      PageSize: number;
      SearchValue?: string;
    }
  ): Promise<ApiResponse> => {
    const response = await axiosInstance.get(`/programs/${academicProgramId}/levels`, {
      params: {
        PageNumber: params.PageNumber,
        PageSize: params.PageSize,
        SearchValue: params.SearchValue,
      }
    });
    return response.data;
  },


  addLevel: async (academicProgramId: string, data: Omit<AcademicLevel, "id">) => {
    const response = await axiosInstance.post(`/programs/${academicProgramId}/levels`, data);
    return response.data;
  },


  updateLevel: async (academicProgramId: string, levelId: string, data: Omit<AcademicLevel, "id">) => {
    const response = await axiosInstance.put(`/programs/${academicProgramId}/levels/${levelId}`, data);
    return response.data;
  },


  deleteLevel: async (academicProgramId: string, levelId: string) => {
    const response = await axiosInstance.delete(`/programs/${academicProgramId}/levels/${levelId}`);
    return response.data;
  }
};