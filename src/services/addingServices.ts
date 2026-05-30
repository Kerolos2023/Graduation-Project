// services/committeeDistributionService.ts
import axiosInstance from "@/lib/axios";

export const committeeDistributionService = {
   getAvailableCommittees: async (termId: string) => {
    const response = await axiosInstance.get(`/exam-terms/${termId}/committees`);
    return response.data?.items || [];
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
  }
};