
import axiosInstance from "@/lib/axios";

const PROGRAM_ID = '019D5C67-392B-74A6-8E1F-2221FC6BBF0A';

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
  
  getAllGrades: async (page = 1, size = 100) => {
    const response = await axiosInstance.get(
      `/programs/${PROGRAM_ID}/grades/all`,
      {
        params: { PageNumber: page, PageSize: size },
      }
    );
    return response.data;
  },

  
  createGrade: async (data: GradeRequest): Promise<Grade> => {
    const response = await axiosInstance.post(
      `/programs/${PROGRAM_ID}/grades`,
      data
    );
    return response.data;
  },

   
  updateGrade: async (
    gradeId: string,
    data: GradeRequest
  ): Promise<Grade> => {
    const response = await axiosInstance.put(
      `/programs/${PROGRAM_ID}/grades/${gradeId}`,
      data
    );
    return response.data;
  },

   
  deleteGrade: async (gradeId: string) => {
    const response = await axiosInstance.delete(
      `/programs/${PROGRAM_ID}/grades/${gradeId}`
    );
    return response.data;
  },
};