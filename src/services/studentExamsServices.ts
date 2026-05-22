import axiosInstance from "@/lib/axios";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface StudentExamTimeCourse {
  date: string;
  courseName: string;
  courseCode: string;
  startTime: string;
  endTime: string;
  place: string;
  seatNumber: number;
  committeeNumber: number;
}

export interface StudentExamTimeData {
  examName: string;
  courses: StudentExamTimeCourse[];
}

export interface StudentExamTimeResponse {
  studentName: string;
  studentCode: string;
  exams: StudentExamTimeData[];
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const studentExamsService = {
  getStudentExams: async (): Promise<StudentExamTimeResponse> => {
    const res = await axiosInstance.get(`/students/student-exams`);
    return res.data;
  },
};
