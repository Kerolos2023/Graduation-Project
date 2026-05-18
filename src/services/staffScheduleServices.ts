import axiosInstance from "@/lib/axios";

export interface InstructorSession {
  id: string;
  startTime: string;
  endTime: string;
  type: string;
  day: string;
  instructorId: string;
  instructorName: string;
  roomId: string;
  roomName: string;
  groupNumber: number;
}

export const staffScheduleService = {
  getInstructorSessions: async (programId: string): Promise<InstructorSession[]> => {
    const res = await axiosInstance.get("/teaching-sessions/instructor-sessions", {
      params: { programId },
    });
    // Handle wrapped or unwrapped response shapes
    const data = res.data?.items ?? res.data?.data ?? res.data ?? [];
    return Array.isArray(data) ? data : [];
  },
};
