import axiosInstance from "@/lib/axios";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CourseOffering {
  id: string;
  name: string;
  code: string;
  numberOfGroups: number;
}

/** Single assessment definition returned by the assessments endpoint */
export interface CourseAssessment {
  id: string;
  type: string;   // e.g. "FinalExam" | "Quiz" | "Midterm"
  maxScore: number;
}

/** Response shape of GET /programs/{programId}/course-offerings/{id}/assessments */
export interface CourseAssessmentsResponse {
  assessments: CourseAssessment[];
  courseTotalGrade: number;
}

/** Legacy header shape used by the table (mapped from CourseAssessment) */
export interface AssessmentHeader {
  assessmentId: string;
  name: string;       // mapped from CourseAssessment.type
  maxDegree: number;  // mapped from CourseAssessment.maxScore
}

export interface StudentDegree {
  courseAssessmentId: string;
  degreeValue: number | null;
}

export interface StudentControlInfo {
  studentId: string;
  name: string;
  code: string;
  studentLevelName: string;  // field name from new API
  numberOfFailed: number;
  totalDegree: number;
  letterDegree: string;
  studentDegrees: StudentDegree[];
}

/** Paginated response from GET /control/{AcademicProgramId} */
export interface StudentsControlResponse {
  items: StudentControlInfo[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface GetStudentsControlParams {
  CourseOfferingId: string;
  GroupNumber?: number;
  PageNumber?: number;
  PageSize?: number;
  SearchValue?: string;
  SortColumn?: string;
}

export interface UpdateDegreeBody {
  studentId: string;
  courseAssessmentId: string;
  degree: string;
}

export interface UpdateDegreeResponse {
  totalDegree: number;
  letterDegree: string;
}

// ─── Service ────────────────────────────────────────────────────────────────

export const staffControlService = {
  /**
   * GET /programs/{programId}/course-offerings/{id}/assessments
   * Fetch assessment definitions for a course offering (once per course selection).
   */
  getCourseAssessments: (
    programId: string,
    courseOfferingId: string
  ) =>
    axiosInstance.get<CourseAssessmentsResponse[]>(
      `/programs/${programId}/course-offerings/${courseOfferingId}/assessments`
    ),

  /**
   * GET /control/{AcademicProgramId}
   * Paginated student grades for a specific course/group.
   */
  getStudents: (
    academicProgramId: string,
    params: GetStudentsControlParams
  ) =>
    axiosInstance.get<StudentsControlResponse>(
      `/control/${academicProgramId}`,
      { params }
    ),

  /**
   * PATCH /control/{AcademicProgramId}
   * Update a single student's degree for a specific assessment.
   */
  updateDegree: (
    academicProgramId: string,
    body: UpdateDegreeBody
  ) =>
    axiosInstance.patch<UpdateDegreeResponse>(
      `/control/${academicProgramId}`,
      body
    ),
};
