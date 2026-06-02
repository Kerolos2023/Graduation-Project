import axiosInstance from "@/lib/axios";

export const committeeDistributionService = {
   getAvailableCommittees: async (termId: string) => {
    const response = await axiosInstance.get(`/exam-terms/${termId}/committees`);
    return response.data?.items || [];
  },
  
   getExamDetails: async (termId: string, examId: string) => {
    const response = await axiosInstance.get(`/exam-terms/${termId}/course-offering-exam/${examId}`);
    return response.data;
  },
  
   addDistribution: async (termId: string, courseOfferingId: string, body: any) => {
    return await axiosInstance.post(
      `/exam-terms/${termId}/course-offering-exam?courseOfferingId=${courseOfferingId}`,
      body
    );
  },
  
   updateDistributionByPath: async (termId: string, examId: string, body: any) => {
    return await axiosInstance.put(
      `/exam-terms/${termId}/course-offering-exam/${examId}`,
      body
    );
  },

   getAssignedExamCommittees: async (termId: string, examId: string) => {
    const response = await axiosInstance.get(`/exam-terms/${termId}/course-offering-exam/${examId}/committees`);
    return response.data?.items || [];
  }
};