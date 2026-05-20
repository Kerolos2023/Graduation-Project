import axiosInstance from "@/lib/axios";

export interface GradeRequest {
  name: string;
  code: string;
  minScore: number;
  maxScore: number;
  minGradePoint: number;
  maxGradePoint: number;
}

export interface Grade {
  id: string;
  name: string;
  code: string;
  minScore: number;
  maxScore: number;
  minGradePoint: number;
  maxGradePoint: number;
}

export const gradeService = {
  getAllGrades: async (programId: string, page = 1, size = 100) => {
    const response = await axiosInstance.get(
      `/programs/${programId}/grades`,
      {
        params: { PageNumber: page, PageSize: size },
      }
    );
    return response.data;
  },

  createGrade: async (programId: string, data: GradeRequest): Promise<Grade> => {
    const response = await axiosInstance.post(
      `/programs/${programId}/grades`,
      data
    );
    return response.data;
  },

  updateGrade: async (
    programId: string,
    gradeId: string,
    data: GradeRequest
  ): Promise<Grade> => {
    const response = await axiosInstance.put(
      `/programs/${programId}/grades/${gradeId}`,
      data
    );
    return response.data;
  },

  deleteGrade: async (programId: string, gradeId: string) => {
    const response = await axiosInstance.delete(
      `/programs/${programId}/grades/${gradeId}`
    );
    return response.data;
  },
};

export default gradeService;