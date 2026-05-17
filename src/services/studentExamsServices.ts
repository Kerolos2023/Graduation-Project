import axiosInstance from "@/lib/axios";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface StudentExamCourse {
  courseCode: string;
  courseName: string;
  creditHours: number;
  letterGrade: string;
  finalGrade: number;
}

export interface StudentExamSemester {
  semesterName: string;
  academicYear: string;
  semesterGPA: number;
  cumulativeGPA: number;
  attemptedHours: number;
  earnedHours: number;
  semesterGrade: string;
  cumulativeGrade: string;
  courses: StudentExamCourse[];
}

// ─── Mock ────────────────────────────────────────────────────────────────────

export const MOCK_STUDENT_EXAMS: StudentExamSemester[] = [
  {
    semesterName: "Fall",
    academicYear: "2030-2031",
    semesterGPA: 0,
    cumulativeGPA: 0,
    attemptedHours: 6.0,
    earnedHours: 3.0,
    semesterGrade: "-",
    cumulativeGrade: "-",
    courses: [
      {
        courseCode: "fzy",
        courseName: "Fuzzyy",
        creditHours: 3.0,
        letterGrade: "-",
        finalGrade: 40.0,
      },
      {
        courseCode: "fzy",
        courseName: "Fuzzyy",
        creditHours: 3.0,
        letterGrade: "-",
        finalGrade: 40.0,
      },
    ],
  },
  {
    semesterName: "Spring",
    academicYear: "2029-2030",
    semesterGPA: 3.4,
    cumulativeGPA: 3.2,
    attemptedHours: 18.0,
    earnedHours: 18.0,
    semesterGrade: "B+",
    cumulativeGrade: "B",
    courses: [
      {
        courseCode: "CS401",
        courseName: "Software Engineering",
        creditHours: 3.0,
        letterGrade: "A",
        finalGrade: 88.0,
      },
      {
        courseCode: "CS402",
        courseName: "Database Systems",
        creditHours: 3.0,
        letterGrade: "B+",
        finalGrade: 82.0,
      },
      {
        courseCode: "CS403",
        courseName: "Computer Networks",
        creditHours: 3.0,
        letterGrade: "B",
        finalGrade: 76.0,
      },
    ],
  },
];

// ─── Service ─────────────────────────────────────────────────────────────────

export const studentExamsService = {
  getStudentExams: async (): Promise<StudentExamSemester[]> => {
    const res = await axiosInstance.get(`/students/student-exams`);
    return res.data?.exams ?? [];
  },
};
