import axiosInstance from "@/lib/axios";
import { COLLEGE_ID } from "@/lib/constants";

export interface StudentSession {
  sessionId: string;
  courseOfferingId: string;
  type: string;
  startTime: string;
  endTime: string;
  dayOfWeek: string;
}

export const studentScheduleService = {
  getSchedule: async (): Promise<StudentSession[]> => {
    const res = await axiosInstance.get(`/students/student-schedule`);
    return res.data || [];
  },
};