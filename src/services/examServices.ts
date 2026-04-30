
 

import axiosInstance from '@/lib/axios';

const BASE_URL = 'https://universeplatform.runasp.net';

export const examTermsService = {
  getProgramExams: async (academicProgramId: string, semesterId: string) => {
    const response = await axiosInstance.get(`${BASE_URL}/programs/${academicProgramId}/exam-terms`, {
      params: { SemesterId: semesterId }
    });
    return response.data;
  },

  addExamTerm: async (academicProgramId: string, semesterId: string, data: any) => {
    return (await axiosInstance.post(`${BASE_URL}/programs/${academicProgramId}/exam-terms`, data, {
      params: { SemesterId: semesterId }
    })).data;
  },

  updateExamTerm: async (academicProgramId: string, id: string, data: any) => {
    return (await axiosInstance.put(`${BASE_URL}/programs/${academicProgramId}/exam-terms/${id}`, data)).data;
  },

  deleteExamTerm: async (academicProgramId: string, id: string) => {
    return (await axiosInstance.delete(`${BASE_URL}/programs/${academicProgramId}/exam-terms/${id}`));
  },

  togglePublisher: async (academicProgramId: string, id: string) => {
    return (await axiosInstance.patch(`${BASE_URL}/programs/${academicProgramId}/exam-terms/${id}/toggle-publisher`));
  }
};