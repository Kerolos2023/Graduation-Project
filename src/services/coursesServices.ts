import axiosInstance from '@/lib/axios';

export const getAllCourses = async (programId: string, semesterId: string) => {
  const response = await axiosInstance.get(`/programs/${programId}/course-offerings/for-exams`, {
    params: { PageNumber: 1, PageSize: 500, semesterId }
  });
  return response.data.items || [];
};