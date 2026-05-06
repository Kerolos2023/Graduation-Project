import axiosInstance from '@/lib/axios';
import { COLLEGE_ID } from '@/lib/constants';

export interface AcademicYear {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
}

export interface Semester {
  id: string;
  name: string;
}

export const academicService = {
  getAllAcademicYears: async (): Promise<AcademicYear[]> => {
    const res = await axiosInstance.get(`/colleges/${COLLEGE_ID}/academic-years`);
    const items = res.data?.items || [];
    return Array.isArray(items) ? items : [];
  },

  getCurrentAcademicYear: async (): Promise<AcademicYear | null> => {
    const res = await axiosInstance.get(`/colleges/${COLLEGE_ID}/academic-years/current`);
    return res.data || null;
  },

  getCurrentSemester: async (yearId: string): Promise<Semester | null> => {
    const res = await axiosInstance.get(
      `/colleges/${COLLEGE_ID}/academic-years/${yearId}/current-semester`
    );
    return res.data || null;
  },

  getAllPrograms: async () => {
    const res = await axiosInstance.get(`/colleges/${COLLEGE_ID}/academic-programs`);
    const items = res.data?.items || [];
    return Array.isArray(items) ? items : [];
  },
};