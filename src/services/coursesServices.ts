import axiosInstance from '@/lib/axios';

export const getAllCourses = async (programId: string, semesterId: string) => {
   const examTermGuid = "019e2720-94e6-7743-9362-bbb1a87cd280";

  const response = await axiosInstance.get(`/programs/${programId}/course-offerings/for-exams`, {
    params: { 
      PageNumber: 1, 
      PageSize: 10, 
      semesterId,
      examTermId: examTermGuid  
    }
  });
  
  return response.data?.items || [];
};