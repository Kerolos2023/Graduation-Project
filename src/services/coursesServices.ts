import axiosInstance from '@/lib/axios';

const PROGRAM_ID = '019D5C67-392B-74A6-8E1F-2221FC6BBF0A';
const SEMESTER_ID = '019d7980-c25c-7793-b137-248b067f98d5';

export const getAllCourses = async () => {
  const response = await axiosInstance.get(`/programs/${PROGRAM_ID}/course-offerings/for-exams`, {
    params: { PageNumber: 1, PageSize: 500, semesterId: SEMESTER_ID }
  });
  return response.data.items || [];
};