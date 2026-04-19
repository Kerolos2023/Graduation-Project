import axiosInstance from "@/lib/axios";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CourseOffering {
  id: string;
  name: string;
  code: string;
  numberOfGroups: number;
}

export interface AssessmentHeader {
  assessmentId: string;
  name: string;
  maxDegree: number;
}

export interface StudentDegree {
  courseAssessmentId: string;
  studentAssessmentId: string;
  degreeValue: number;
}

export interface StudentControlInfo {
  studentId: string;
  name: string;
  code: string;
  levelName: string;
  numberOfFailed: number;
  totalDegree: number;
  letterDegree: string;
  studentDegrees: StudentDegree[];
}

export interface StudentsControlResponse {
  assessmentHeaders: AssessmentHeader[];
  courseTotalGrade: number;
  studentsInformation: {
    items: StudentControlInfo[];
    pageNumber: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export interface GetStudentsControlParams {
  CourseOfferingId?: string;
  GroupNumber?: number;
  StudentCodeOrName?: string;
  "Filter.PageNumber"?: number;
  "Filter.PageSize"?: number;
  "Filter.SortColumn"?: string;
}

export interface UpdateDegreeBody {
  studentId: string;
  courseAssessmentId: string;
  value: string;
}

export interface UpdateDegreeResponse {
  totalDegree: number;
  letterDegree: string;
}

// ─── Service ────────────────────────────────────────────────────────────────

export const staffControlService = {
  /**
   * GET /control/{AcademicProgramId}
   * Get students with their degrees for a specific program/course/group
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
   * Update a single student's degree for a specific assessment
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
