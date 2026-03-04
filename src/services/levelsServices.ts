 

 import axiosInstance from "@/lib/axios"; // تأكد من المسار الصحيح لملف الأكسيوس بتاعك

 



 
export interface AcademicLevel {
  id: string;
  name: string;
  minHours: string | number;
  maxHours: string | number;
}

 
export interface ApiResponse {
  items: AcademicLevel[];
  pageNumber: number;
  totalPages: number;
}

export const levelService = {
 
  getAllLevels: async (
    collegeId: string, 
    params: { PageNumber: number; PageSize: number }
  ): Promise<ApiResponse> => {
    const response = await axiosInstance.get(`/Level/college-${collegeId}-all`, {
      params: {
        PageNumber: params.PageNumber,
        PageSize: params.PageSize,
      }
    });
        

    return response.data; 
  },


  addLevel: async (collegeId: string, data: Omit<AcademicLevel, "id">) => {
    const response = await axiosInstance.post(`/Level/${collegeId}`, data);
    return response.data;
  },

   updateLevel: async (levelId: string, data: Omit<AcademicLevel, "id">) => {
    const response = await axiosInstance.put(`/Level/${levelId}`, data);
    return response.data;
  },

  
  deleteLevel: async (levelId: string) => {
    const response = await axiosInstance.delete(`/Level/${levelId}`);
    return response.data;
  }
};