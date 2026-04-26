
import axiosInstance from '@/lib/axios';

export const examTermsService = {
   getProgramExams: async (academicProgramId: string, semesterId: string) => {
    const response = await axiosInstance.get(`/programs/${academicProgramId}/exam-terms`, {
      params: { SemesterId: semesterId }
    });
    return response.data;
  },

   addExamTerm: async (academicProgramId: string, semesterId: string, data: any) => {
    return (await axiosInstance.post(`/programs/${academicProgramId}/exam-terms`, data, {
      params: { SemesterId: semesterId }
    })).data;
  },

   updateExamTerm: async (academicProgramId: string, id: string, data: any) => {
    return (await axiosInstance.put(`/programs/${academicProgramId}/exam-terms/${id}`, data)).data;
  },

   deleteExamTerm: async (academicProgramId: string, id: string) => {
    return (await axiosInstance.delete(`/programs/${academicProgramId}/exam-terms/${id}`)).data;
  },

   togglePublisher: async (academicProgramId: string, id: string) => {
    return (await axiosInstance.patch(`/programs/${academicProgramId}/exam-terms/${id}/toggle-publisher`)).data;
  },

   getExamTypes: async (academicProgramId: string) => {
    return (await axiosInstance.get(`/programs/${academicProgramId}/exam-terms/types`)).data;
  }
};