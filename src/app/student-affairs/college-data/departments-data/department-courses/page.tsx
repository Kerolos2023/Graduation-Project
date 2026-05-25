"use client";

import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import CollegeDataTabs from "@/components/departmentsTabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAcademicContext } from "@/hooks/useAcademicContext";
import axiosInstance from "@/lib/axios";
import { levelService, AcademicLevel as LevelOption } from "@/services/levelsServices";
import { COLLEGE_ID } from "@/lib/constants";

type SemesterType = "Fall" | "Spring" | "Summer";
type RequirementType = "University" | "College" | "Program";
type AssessmentType =
  | "FinalExam"
  | "MidtermExam"
  | "OralExam"
  | "PracticalExam"
  | "MCQExam"
  | "Project"
  | "Assignment"
  | "Quiz"
  | "Attendance"
  | "YearWork";

type CourseOption = {
  id: string;
  name: string;
  code: string;
};

type AssessmentItem = {
  type: AssessmentType;
  maxScore: number;
};

type FormState = {
  courseId: string;
  semesterType: SemesterType;
  creditHours: string;
  levelId: string;
  type: RequirementType;
  successPercentage: string;
  totalGrade: string;
  numberOfGroups: string;
  isOptional: boolean;
  optionalGroupCode: string;
  isIncludedInGpa: boolean;
};

type CourseOfferingRow = {
  id: string;
  name: string;
  code: string;
  numberOfGroups: number;
  semesterId: string;
};

type OfferingsBucket = {
  items: CourseOfferingRow[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
};

const SEMESTER_OPTIONS: Array<{ value: SemesterType; label: string }> = [
  { value: "Fall", label: "Fall" },
  { value: "Spring", label: "Spring" },
  { value: "Summer", label: "Summer" },
];

const REQUIREMENT_OPTIONS: Array<{ value: RequirementType; label: string }> = [
  { value: "University", label: "University Requirement" },
  { value: "College", label: "College Requirement" },
  { value: "Program", label: "Program Requirement" },
];

const ASSESSMENT_OPTIONS: Array<{ value: AssessmentType; label: string }> = [
  { value: "FinalExam", label: "Final Exam" },
  { value: "MidtermExam", label: "Midterm Exam" },
  { value: "OralExam", label: "Oral Exam" },
  { value: "PracticalExam", label: "Practical Exam" },
  { value: "MCQExam", label: "MCQ Exam" },
  { value: "Project", label: "Project" },
  { value: "Assignment", label: "Assignment" },
  { value: "Quiz", label: "Quiz" },
  { value: "Attendance", label: "Attendance" },
  { value: "YearWork", label: "Year Work" },
];

const SEMESTER_TYPE_TO_NUMBER: Record<SemesterType, number> = {
  Fall: 1,
  Spring: 2,
  Summer: 3,
};

const termIdToSemesterType = (value: string | null): SemesterType | null => {
  if (value === "1") return "Fall";
  if (value === "2") return "Spring";
  if (value === "3") return "Summer";
  return null;
};

const normalizeSemesterType = (value: unknown): SemesterType | null => {
  const raw = String(value ?? "").trim().toLowerCase();
  if (!raw) return null;

  if (raw === "fall" || raw === "1" || raw === "term01" || raw === "term 01") {
    return "Fall";
  }
  if (raw === "spring" || raw === "2" || raw === "term02" || raw === "term 02") {
    return "Spring";
  }
  if (raw === "summer" || raw === "3" || raw === "term03" || raw === "term 03") {
    return "Summer";
  }

  return null;
};

const normalizeRequirementType = (value: unknown): RequirementType => {
  const raw = String(value ?? "").trim().toLowerCase();
  if (raw === "university" || raw === "1") return "University";
  if (raw === "program" || raw === "3") return "Program";
  return "College";
};

const normalizeAssessmentType = (value: unknown): AssessmentType | null => {
  const raw = String(value ?? "").trim().toLowerCase();
  const match = ASSESSMENT_OPTIONS.find((option) => option.value.toLowerCase() === raw);
  return match ? match.value : null;
};

const readString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return "";
};

const readNumber = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return 0;
};

const readArray = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const withItems = (payload as { items?: unknown }).items;
  if (Array.isArray(withItems)) return withItems;

  const withData = (payload as { data?: unknown }).data;
  if (Array.isArray(withData)) return withData;

  const withInnerData = (withData as { items?: unknown } | undefined)?.items;
  if (Array.isArray(withInnerData)) return withInnerData;

  return [];
};

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const extractApiValidationMessage = (data: unknown) => {
  const record = toRecord(data);
  const title = readString(record.title, record.message, "Validation error.");
  const errorsRecord = toRecord(record.errors);
  const details: string[] = [];

  Object.entries(errorsRecord).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => {
        const entryText = readString(entry);
        if (!entryText) return;
        details.push(key ? `${key}: ${entryText}` : entryText);
      });
    }
  });

  if (details.length === 0) return title;
  return [title, ...details].join("\n");
};

const getOfferingsKey = (levelId: string, semesterType: SemesterType) =>
  `${levelId}__${semesterType}`;

const createEmptyForm = (semesterType: SemesterType): FormState => ({
  courseId: "",
  semesterType,
  creditHours: "",
  levelId: "",
  type: "College",
  successPercentage: "",
  totalGrade: "",
  numberOfGroups: "1",
  isOptional: false,
  optionalGroupCode: "",
  isIncludedInGpa: true,
});

const getDefaultBucket = (): OfferingsBucket => ({
  items: [],
  loading: false,
  loaded: false,
  error: null,
});

const extractSemesterMapping = (rawYear: unknown): Partial<Record<SemesterType, string>> => {
  if (!rawYear || typeof rawYear !== "object") return {};

  const year = rawYear as {
    semesters?: unknown;
    Semesters?: unknown;
    terms?: unknown;
    Terms?: unknown;
  };

  const semesterRows = [
    ...readArray(year.semesters),
    ...readArray(year.Semesters),
    ...readArray(year.terms),
    ...readArray(year.Terms),
  ];

  const result: Partial<Record<SemesterType, string>> = {};

  semesterRows.forEach((semester) => {
    const semesterRecord =
      semester && typeof semester === "object" ? (semester as Record<string, unknown>) : {};

    const type = normalizeSemesterType(
      semesterRecord.termType ??
      semesterRecord.TermType ??
      semesterRecord.name ??
      semesterRecord.Name ??
      semesterRecord.semesterType ??
      semesterRecord.SemesterType
    );
    const id = readString(
      semesterRecord.id,
      semesterRecord.Id,
      semesterRecord.semesterId,
      semesterRecord.SemesterId
    );

    if (type && id) {
      result[type] = id;
    }
  });

  return result;
};

// ── Shared UI Styles matching DepartmentDataPage ──────────────────────────────
const labelCls = 'text-[13px] font-semibold text-gray-700';
const inputCls = 'w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed';

export default function DepartmentCoursesPage() {
  const { selectedProgramId, selectedSemesterId, selectedTermId, selectedYearId } = useAcademicContext();
  const formRef = useRef<HTMLDivElement>(null);

  const defaultSemesterType = useMemo(
    () => termIdToSemesterType(selectedTermId) ?? "Fall",
    [selectedTermId]
  );

  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [levels, setLevels] = useState<LevelOption[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingLevels, setLoadingLevels] = useState(false);
  const [loadingAcademicYear, setLoadingAcademicYear] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [loadingEditId, setLoadingEditId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormState>(() => createEmptyForm("Fall"));
  const [assessmentDraft, setAssessmentDraft] = useState<{ type: AssessmentType; maxScore: string }>(
    { type: "FinalExam", maxScore: "" }
  );
  const [assessments, setAssessments] = useState<AssessmentItem[]>([]);
  const [currentAcademicYearId, setCurrentAcademicYearId] = useState<string | null>(null);
  const [semesterIdByType, setSemesterIdByType] = useState<Partial<Record<SemesterType, string>>>(
    {}
  );
  const [openLevelId, setOpenLevelId] = useState<string | null>(null);
  const [openSemesterByLevel, setOpenSemesterByLevel] = useState<Record<string, SemesterType | null>>(
    {}
  );
  const [offeringsByKey, setOfferingsByKey] = useState<Record<string, OfferingsBucket>>({});

  const effectiveAcademicYearId = selectedYearId || currentAcademicYearId;

  const sortedCourses = useMemo(
    () => [...courses].sort((a, b) => a.name.localeCompare(b.name)),
    [courses]
  );

  const totalAssessmentScore = useMemo(
    () => assessments.reduce((sum, item) => sum + item.maxScore, 0),
    [assessments]
  );
  const numericTotalGrade = Number(formData.totalGrade || 0);
  const isAssessmentTotalMatching =
    numericTotalGrade > 0 && Math.abs(totalAssessmentScore - numericTotalGrade) < 0.0001;

  const resetForm = useCallback(() => {
    setEditingId(null);
    setSubmitError("");
    setFormData(createEmptyForm(defaultSemesterType));
    setAssessments([]);
    setAssessmentDraft({
      type: "FinalExam",
      maxScore: "",
    });
  }, [defaultSemesterType]);

  const fetchCourses = useCallback(async () => {
    setLoadingCourses(true);
    try {
      const response = await axiosInstance.get(`/colleges/${COLLEGE_ID}/courses`, {
        params: {
          pageNumber: 1,
          pageSize: 2000,
        },
      });
      const rows = readArray(response.data);
      const normalized = rows
        .map((course) => {
          const courseRecord = toRecord(course);
          return {
            id: readString(courseRecord.id, courseRecord.Id),
            name: readString(courseRecord.name, courseRecord.Name, "Unnamed Course"),
            code: readString(courseRecord.code, courseRecord.Code),
          };
        })
        .filter((course) => Boolean(course.id));

      setCourses(normalized);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load courses.");
    } finally {
      setLoadingCourses(false);
    }
  }, []);

  const fetchLevels = useCallback(async () => {
    if (!selectedProgramId) {
      setLevels([]);
      setOpenLevelId(null);
      setOpenSemesterByLevel({});
      return;
    }

    setLoadingLevels(true);
    try {
      const response = await levelService.getAllLevels(selectedProgramId, { PageNumber: 1, PageSize: 1000 });
      const normalizedLevels = response.items;

      setLevels(normalizedLevels);

      setOpenLevelId((prev) => {
        if (prev && normalizedLevels.some((level) => level.id === prev)) return prev;
        return normalizedLevels[0]?.id || null;
      });

      setOpenSemesterByLevel((prev) => {
        const next: Record<string, SemesterType | null> = {};
        normalizedLevels.forEach((level) => {
          next[level.id] = prev[level.id] ?? "Fall";
        });
        return next;
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to load levels.");
    } finally {
      setLoadingLevels(false);
    }
  }, [selectedProgramId]);

  const fetchCurrentAcademicYear = useCallback(async () => {
    setLoadingAcademicYear(true);
    try {
      const response = await axiosInstance.get(`/colleges/${COLLEGE_ID}/academic-years/current`);
      const rawYear = response.data?.data ?? response.data;
      const yearId = readString(rawYear?.id, rawYear?.Id);

      setCurrentAcademicYearId(yearId || null);

      let semesterMapping = extractSemesterMapping(rawYear);

      if (yearId && Object.keys(semesterMapping).length === 0) {
        try {
          const details = await axiosInstance.get(`/colleges/${COLLEGE_ID}/academic-years/${yearId}`);
          const rawDetails = details.data?.data ?? details.data;
          semesterMapping = extractSemesterMapping(rawDetails);
        } catch (detailsError) {
          console.error(detailsError);
        }
      }

      if (Object.keys(semesterMapping).length > 0) {
        setSemesterIdByType((prev) => ({ ...prev, ...semesterMapping }));
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load current academic year.");
      setCurrentAcademicYearId(null);
    } finally {
      setLoadingAcademicYear(false);
    }
  }, []);

  const fetchAcademicYearSemestersById = useCallback(async (yearId: string) => {
    if (!yearId) return;
    setLoadingAcademicYear(true);
    try {
      const details = await axiosInstance.get(`/colleges/${COLLEGE_ID}/academic-years/${yearId}`);
      const rawDetails = details.data?.data ?? details.data;
      const mapping = extractSemesterMapping(rawDetails);
      if (Object.keys(mapping).length > 0) {
        setSemesterIdByType((prev) => ({ ...prev, ...mapping }));
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load selected academic year semesters.");
    } finally {
      setLoadingAcademicYear(false);
    }
  }, []);

  const fetchOfferings = useCallback(
    async (levelId: string, semesterType: SemesterType) => {
      if (!selectedProgramId || !effectiveAcademicYearId) return;

      const key = getOfferingsKey(levelId, semesterType);

      setOfferingsByKey((prev) => ({
        ...prev,
        [key]: {
          ...(prev[key] ?? getDefaultBucket()),
          loading: true,
          error: null,
        },
      }));

      try {
        const response = await axiosInstance.get(`/programs/${selectedProgramId}/course-offerings`, {
          params: {
            levelId,
            semesterType,
            academicYearId: effectiveAcademicYearId,
          },
        });

        const rows = readArray(response.data);

        const normalizedRows = rows
          .map((item) => {
            const itemRecord = toRecord(item);
            return {
              id: readString(itemRecord.id, itemRecord.Id),
              name: readString(
                itemRecord.name,
                itemRecord.Name,
                itemRecord.courseName,
                itemRecord.CourseName
              ),
              code: readString(
                itemRecord.code,
                itemRecord.Code,
                itemRecord.courseCode,
                itemRecord.CourseCode
              ),
              numberOfGroups: readNumber(itemRecord.numberOfGroups, itemRecord.NumberOfGroups, 1),
              semesterId: readString(itemRecord.semesterId, itemRecord.SemesterId),
            };
          })
          .filter((item) => Boolean(item.id));

        setOfferingsByKey((prev) => ({
          ...prev,
          [key]: {
            items: normalizedRows,
            loading: false,
            loaded: true,
            error: null,
          },
        }));

        const semesterId = normalizedRows.find((row) => row.semesterId)?.semesterId;
        if (semesterId) {
          setSemesterIdByType((prev) => ({ ...prev, [semesterType]: semesterId }));
        }
      } catch (error) {
        console.error(error);
        setOfferingsByKey((prev) => ({
          ...prev,
          [key]: {
            ...(prev[key] ?? getDefaultBucket()),
            loading: false,
            loaded: true,
            error: "Failed to load semester courses.",
          },
        }));
      }
    },
    [effectiveAcademicYearId, selectedProgramId]
  );

  const resolveSemesterId = useCallback(
    (semesterType: SemesterType) => {
      const fromMap = semesterIdByType[semesterType];
      if (fromMap) return fromMap;

      const termFromSidebar = termIdToSemesterType(selectedTermId);
      if (termFromSidebar === semesterType && selectedSemesterId) {
        return selectedSemesterId;
      }

      return "";
    },
    [selectedSemesterId, selectedTermId, semesterIdByType]
  );

  useEffect(() => {
    void fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    if (selectedYearId) {
      setCurrentAcademicYearId(selectedYearId);
      void fetchAcademicYearSemestersById(selectedYearId);
      return;
    }
    void fetchCurrentAcademicYear();
  }, [fetchAcademicYearSemestersById, fetchCurrentAcademicYear, selectedYearId]);

  useEffect(() => {
    void fetchLevels();
  }, [fetchLevels]);

  useEffect(() => {
    setOfferingsByKey({});
  }, [selectedProgramId, effectiveAcademicYearId]);

  useEffect(() => {
    const termType = termIdToSemesterType(selectedTermId);
    if (termType && selectedSemesterId) {
      setSemesterIdByType((prev) => ({
        ...prev,
        [termType]: selectedSemesterId,
      }));
    }

    if (termType && !editingId) {
      setFormData((prev) => ({
        ...prev,
        semesterType: termType,
      }));
    }
  }, [selectedSemesterId, selectedTermId, editingId]);

  useEffect(() => {
    if (!openLevelId || !effectiveAcademicYearId) return;
    const semesterType = openSemesterByLevel[openLevelId];
    if (!semesterType) return;

    const key = getOfferingsKey(openLevelId, semesterType);
    const bucket = offeringsByKey[key];

    if (bucket?.loading || bucket?.loaded) return;
    void fetchOfferings(openLevelId, semesterType);
  }, [effectiveAcademicYearId, fetchOfferings, offeringsByKey, openLevelId, openSemesterByLevel]);

  const handleAddAssessment = () => {
    if (!assessmentDraft.maxScore.trim()) {
      toast.warning("Please enter max score.");
      return;
    }

    const maxScore = Number(assessmentDraft.maxScore);
    if (!Number.isFinite(maxScore) || maxScore <= 0) {
      toast.warning("Max score should be greater than 0.");
      return;
    }

    if (assessments.some((item) => item.type === assessmentDraft.type)) {
      toast.warning("Assessment type already added.");
      return;
    }

    setAssessments((prev) => [
      ...prev,
      {
        type: assessmentDraft.type,
        maxScore,
      },
    ]);

    setAssessmentDraft((prev) => ({
      ...prev,
      maxScore: "",
    }));
  };

  const handleAssessmentScoreChange = (type: AssessmentType, value: string) => {
    setAssessments((prev) =>
      prev.map((item) =>
        item.type === type
          ? {
            ...item,
            maxScore: Number(value) || 0,
          }
          : item
      )
    );
  };

  const handleRemoveAssessment = (type: AssessmentType) => {
    setAssessments((prev) => prev.filter((item) => item.type !== type));
  };

  const handleSubmit = async () => {
    const showValidation = (message: string) => {
      setSubmitError(message);
      toast.warning(message);
    };

    setSubmitError("");

    if (!selectedProgramId) {
      showValidation("Select program first from sidebar.");
      return;
    }

    if (
      !formData.courseId ||
      !formData.levelId ||
      !formData.creditHours ||
      !formData.totalGrade ||
      !formData.successPercentage
    ) {
      showValidation("Please fill all required fields.");
      return;
    }

    if (formData.isOptional && !formData.optionalGroupCode.trim()) {
      showValidation("Please enter optional group code.");
      return;
    }

    if (assessments.length === 0) {
      showValidation("Please add at least one assessment.");
      return;
    }

    const semesterId = resolveSemesterId(formData.semesterType);
    if (!semesterId) {
      showValidation("Semester id is unavailable. Select year/term from sidebar first.");
      return;
    }

    if (!effectiveAcademicYearId) {
      showValidation("Academic year is unavailable. Select year from sidebar first.");
      return;
    }

    const creditHours = Number(formData.creditHours);
    const totalGrade = Number(formData.totalGrade);
    const successPercentage = Number(formData.successPercentage);
    const numberOfGroups = Number(formData.numberOfGroups || "1");

    if (!Number.isFinite(creditHours) || creditHours <= 0) {
      showValidation("Credit hours should be greater than 0.");
      return;
    }

    if (!Number.isFinite(totalGrade) || totalGrade <= 0) {
      showValidation("Total grade should be greater than 0.");
      return;
    }

    if (!Number.isFinite(successPercentage) || successPercentage <= 0 || successPercentage > 100) {
      showValidation("Pass percentage should be between 1 and 100.");
      return;
    }

    if (!Number.isFinite(numberOfGroups) || numberOfGroups <= 0) {
      showValidation("Number of groups should be greater than 0.");
      return;
    }

    if (Math.abs(totalAssessmentScore - totalGrade) > 0.0001) {
      showValidation("Sum of assessment scores must equal total grade.");
      return;
    }

    const payload = {
      creditHours,
      totalGrade,
      successPercentage,
      isOptional: formData.isOptional,
      optionalGroupCode: formData.isOptional ? formData.optionalGroupCode.trim() : null,
      isIncludedInGpa: formData.isIncludedInGpa,
      type: formData.type,
      courseId: formData.courseId,
      academicYearId: effectiveAcademicYearId,
      semesterId,
      semesterType: SEMESTER_TYPE_TO_NUMBER[formData.semesterType],
      levelId: formData.levelId,
      numberOfGroups,
      assessments: assessments.map((item) => ({
        type: item.type,
        maxScore: Number(item.maxScore),
      })),
    };

    setSubmitting(true);
    try {
      if (editingId) {
        await axiosInstance.put(`/programs/${selectedProgramId}/course-offerings/${editingId}`, payload);
      } else {
        await axiosInstance.post(`/programs/${selectedProgramId}/course-offerings`, payload);
      }

      toast.success(editingId ? "Course offering updated successfully." : "Course offering added successfully.");

      const levelId = payload.levelId;
      const semesterType = formData.semesterType;

      resetForm();
      await fetchLevels();

      setOpenLevelId(levelId);
      setOpenSemesterByLevel((prev) => ({
        ...prev,
        [levelId]: semesterType,
      }));

      await fetchOfferings(levelId, semesterType);
    } catch (error: unknown) {
      console.error(error);
      const typedError = error as {
        response?: { data?: unknown };
        message?: unknown;
      };
      const messageFromApi = extractApiValidationMessage(typedError?.response?.data);
      const fallbackMessage = readString(typedError?.message, "Failed to save course offering.");
      const finalMessage = readString(messageFromApi, fallbackMessage);

      setSubmitError(finalMessage);
      toast.error(finalMessage.split("\n")[0] || "Failed to save course offering.");
      if (typeof window !== "undefined") {
        window.alert(finalMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (id: string, levelId: string, semesterType: SemesterType) => {
    if (!selectedProgramId) {
      toast.warning("Select program first from sidebar.");
      return;
    }

    setSubmitError("");
    setLoadingEditId(id);
    try {
      const response = await axiosInstance.get(`/programs/${selectedProgramId}/course-offerings/${id}`);
      const raw = response.data?.data ?? response.data;

      const responseSemesterType =
        normalizeSemesterType(raw?.semesterType ?? raw?.SemesterType) ?? semesterType;
      const responseSemesterId = readString(raw?.semesterId, raw?.SemesterId);

      if (responseSemesterId) {
        setSemesterIdByType((prev) => ({
          ...prev,
          [responseSemesterType]: responseSemesterId,
        }));
      }

      const rawAssessments = readArray(raw?.assessments ?? raw?.Assessments);
      const mappedAssessments: AssessmentItem[] = rawAssessments
        .map((assessment) => {
          const assessmentRecord = toRecord(assessment);
          const type = normalizeAssessmentType(assessmentRecord.type ?? assessmentRecord.Type);
          const maxScore = readNumber(assessmentRecord.maxScore, assessmentRecord.MaxScore);
          if (!type) return null;
          return { type, maxScore };
        })
        .filter((item): item is AssessmentItem => Boolean(item));

      setAssessments(mappedAssessments);

      setFormData({
        courseId: readString(raw?.courseId, raw?.CourseId),
        semesterType: responseSemesterType,
        creditHours: String(readNumber(raw?.creditHours, raw?.CreditHours)),
        levelId: readString(raw?.levelId, raw?.LevelId, levelId),
        type: normalizeRequirementType(raw?.type ?? raw?.Type),
        successPercentage: String(readNumber(raw?.successPercentage, raw?.SuccessPercentage)),
        totalGrade: String(readNumber(raw?.totalGrade, raw?.TotalGrade)),
        numberOfGroups: String(readNumber(raw?.numberOfGroups, raw?.NumberOfGroups, 1)),
        isOptional: Boolean(raw?.isOptional ?? raw?.IsOptional),
        optionalGroupCode: readString(raw?.optionalGroupCode, raw?.OptionalGroupCode),
        isIncludedInGpa: Boolean(raw?.isIncludedInGpa ?? raw?.IsIncludedInGpa ?? true),
      });

      setEditingId(id);
      setOpenLevelId(levelId);
      setOpenSemesterByLevel((prev) => ({
        ...prev,
        [levelId]: responseSemesterType,
      }));

      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
      console.error(error);
      toast.error("Failed to load course offering details.");
    } finally {
      setLoadingEditId(null);
    }
  };

  const handleDelete = async (id: string, levelId: string, semesterType: SemesterType) => {
    if (!selectedProgramId) {
      toast.warning("Select program first from sidebar.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this course offering?")) return;

    try {
      await axiosInstance.delete(`/programs/${selectedProgramId}/course-offerings/${id}`);
      toast.success("Course offering deleted successfully.");

      if (editingId === id) {
        resetForm();
      }

      await fetchOfferings(levelId, semesterType);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete course offering.");
    }
  };

  const toggleLevel = (levelId: string) => {
    setOpenLevelId((prev) => (prev === levelId ? null : levelId));
    setOpenSemesterByLevel((prev) => ({
      ...prev,
      [levelId]: prev[levelId] ?? "Fall",
    }));
  };

  const toggleSemester = (levelId: string, semesterType: SemesterType) => {
    const current = openSemesterByLevel[levelId];
    const next = current === semesterType ? null : semesterType;

    setOpenSemesterByLevel((prev) => ({
      ...prev,
      [levelId]: next,
    }));

    if (next) {
      const key = getOfferingsKey(levelId, next);
      const bucket = offeringsByKey[key];
      if (!bucket?.loaded && !bucket?.loading) {
        void fetchOfferings(levelId, next);
      }
    }
  };

  const isMissingContext = !selectedProgramId;
  const isLoadingHeaderData = loadingCourses || loadingAcademicYear;

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen space-y-6">
      {/* Tabs */}
      <CollegeDataTabs />

      {/* No program selected */}
      {isMissingContext && (
        <div className="bg-white rounded-[20px] border border-[#eaebf0] p-12 flex flex-col items-center justify-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
            <AlertCircle className="w-7 h-7 text-blue-400" strokeWidth={1.5} />
          </div>
          <p className="text-[15px] font-semibold text-gray-700">No Program Selected</p>
          <p className="text-[13px] text-gray-400">Select an academic program from the sidebar first.</p>
        </div>
      )}

      {/* Academic year missing */}
      {!isMissingContext && !effectiveAcademicYearId && (
        <div className="bg-red-50 border border-red-200 rounded-[16px] p-4 flex items-center gap-3 text-red-600">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">Current academic year is missing. Please check year setup.</span>
        </div>
      )}

      {/* Form Section */}
      {!isMissingContext && effectiveAcademicYearId && (
        <div ref={formRef} className="space-y-6">
          <div className="bg-white rounded-[20px] border border-[#eaebf0] shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? "Update Department Course" : "Department Courses"}
              </h2>
              {editingId && (
                <Button
                  variant="ghost"
                  onClick={resetForm}
                  className="text-red-500 hover:bg-red-50 rounded-xl text-xs font-semibold h-9 px-3"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel Edit
                </Button>
              )}
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Course selection - full width */}
              <div className="flex flex-col gap-1.5 md:col-span-3">
                <label className={labelCls}>Course</label>
                <Select
                  value={formData.courseId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, courseId: value }))}
                >
                  <SelectTrigger className={`${inputCls} !h-11 bg-white text-left`}>
                    <SelectValue placeholder={loadingCourses ? "Loading courses..." : "Select course"} />
                  </SelectTrigger>
                  <SelectContent>
                    {sortedCourses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                        {course.code ? ` (${course.code})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Semester */}
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Semester</label>
                <Select
                  value={formData.semesterType}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, semesterType: value as SemesterType }))
                  }
                >
                  <SelectTrigger className={`${inputCls} !h-11 bg-white text-left`}>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEMESTER_OPTIONS.map((semester) => (
                      <SelectItem key={semester.value} value={semester.value}>
                        {semester.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Credit Hours */}
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Credit Hours</label>
                <Input
                  type="number"
                  min={1}
                  placeholder="e.g. 3"
                  className={`${inputCls} !h-11`}
                  value={formData.creditHours}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, creditHours: event.target.value }))
                  }
                />
              </div>

              {/* Level */}
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Level</label>
                <Select
                  value={formData.levelId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, levelId: value }))}
                >
                  <SelectTrigger className={`${inputCls} !h-11 bg-white text-left`}>
                    <SelectValue placeholder={loadingLevels ? "Loading levels..." : "Select level"} />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((level) => (
                      <SelectItem key={level.id} value={level.id}>
                        {level.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Requirement Type */}
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Requirement Type</label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, type: value as RequirementType }))
                  }
                >
                  <SelectTrigger className={`${inputCls} !h-11 bg-white text-left`}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {REQUIREMENT_OPTIONS.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Pass Percentage */}
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Pass Percentage</label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  placeholder="e.g. 25"
                  className={`${inputCls} !h-11`}
                  value={formData.successPercentage}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, successPercentage: event.target.value }))
                  }
                />
              </div>

              {/* Total Grade */}
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Total Grade</label>
                <Input
                  type="number"
                  min={1}
                  placeholder="e.g. 50"
                  className={`${inputCls} !h-11`}
                  value={formData.totalGrade}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, totalGrade: event.target.value }))
                  }
                />
              </div>

              {/* Number of Groups */}
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Number of Groups</label>
                <Input
                  type="number"
                  min={1}
                  placeholder="e.g. 1"
                  className={`${inputCls} !h-11`}
                  value={formData.numberOfGroups}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, numberOfGroups: event.target.value }))
                  }
                />
              </div>

              {/* Checkboxes Wrapper */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div className="flex flex-col gap-1.5">
                  <div className={`${inputCls} !h-11 px-3 flex items-center gap-3 bg-white`}>
                    <Checkbox
                      checked={formData.isOptional}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          isOptional: checked === true,
                          optionalGroupCode: checked === true ? prev.optionalGroupCode : "",
                        }))
                      }
                    />
                    <span className="text-sm font-semibold text-gray-700">Optional Course</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className={`${inputCls} !h-11 px-3 flex items-center gap-3 bg-white`}>
                    <Checkbox
                      checked={formData.isIncludedInGpa}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          isIncludedInGpa: checked === true,
                        }))
                      }
                    />
                    <span className="text-sm font-semibold text-gray-700">Included in GPA</span>
                  </div>
                </div>
              </div>

              {/* Optional Group Code */}
              {formData.isOptional && (
                <div className="flex flex-col gap-1.5 md:col-span-3">
                  <label className={labelCls}>Optional Group Code</label>
                  <Input
                    placeholder="e.g. OPT-G1"
                    className={`${inputCls} !h-11`}
                    value={formData.optionalGroupCode}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, optionalGroupCode: event.target.value }))
                    }
                  />
                </div>
              )}
            </div>

            {/* Assessments Area */}
            <div className="mx-6 mb-6 p-4 rounded-[16px] border border-gray-100 bg-gray-50/50 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-end">
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Max Degree</label>
                  <Input
                    type="number"
                    min={1}
                    placeholder="e.g. 40"
                    className={`${inputCls} bg-white !h-11`}
                    value={assessmentDraft.maxScore}
                    onChange={(event) =>
                      setAssessmentDraft((prev) => ({ ...prev, maxScore: event.target.value }))
                    }
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Assessment Type</label>
                  <Select
                    value={assessmentDraft.type}
                    onValueChange={(value) =>
                      setAssessmentDraft((prev) => ({ ...prev, type: value as AssessmentType }))
                    }
                  >
                    <SelectTrigger className={`${inputCls} !h-11 bg-white text-left`}>
                      <SelectValue placeholder="Select assessment type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ASSESSMENT_OPTIONS.map((assessment) => (
                        <SelectItem key={assessment.value} value={assessment.value}>
                          {assessment.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="button"
                  onClick={handleAddAssessment}
                  className="h-11 w-11 p-0 rounded-[12px] bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>

              {/* Assessment Score Info & Validations */}
              <div className="space-y-1 px-1">
                <div className="text-xs text-gray-500 font-medium">
                  Assessments total: <span className="font-bold text-gray-700">{totalAssessmentScore}</span>
                  {numericTotalGrade > 0 && (
                    <>
                      {" "} / Total grade: <span className="font-bold text-gray-700">{numericTotalGrade}</span>
                    </>
                  )}
                </div>
                {numericTotalGrade > 0 && !isAssessmentTotalMatching && (
                  <div className="text-xs text-red-500 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    Sum of assessment scores must equal total grade.
                  </div>
                )}
              </div>

              {/* Assessments Render List */}
              {assessments.length === 0 ? (
                <div className="text-sm text-gray-400 border border-dashed border-gray-200 bg-white rounded-[12px] px-4 py-4 text-center font-medium">
                  No assessments added yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {assessments.map((item) => (
                    <div
                      key={item.type}
                      className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-center rounded-[12px] border border-gray-100 bg-white p-3 shadow-sm"
                    >
                      <div className="text-sm font-semibold text-gray-700 px-1">
                        {ASSESSMENT_OPTIONS.find((option) => option.value === item.type)?.label || item.type}
                      </div>
                      <Input
                        type="number"
                        min={0}
                        value={item.maxScore}
                        onChange={(event) => handleAssessmentScoreChange(item.type, event.target.value)}
                        className={`${inputCls} !h-10`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveAssessment(item.type)}
                        className="text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-[16px] p-4 flex items-center gap-3 text-red-600">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium whitespace-pre-line">{submitError}</span>
            </div>
          )}

          {/* Form Action Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || isMissingContext || isLoadingHeaderData}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-[16px] transition-all shadow-sm cursor-pointer"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : editingId ? (
              "Save Changes"
            ) : (
              "Add or Save"
            )}
          </button>
        </div>
      )}

      {/* Levels & Course Offerings List View */}
      {!isMissingContext && effectiveAcademicYearId && (
        <div className="bg-white rounded-[20px] border border-[#eaebf0] shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-gray-800">Levels</h2>
            {loadingLevels && <Loader2 className="w-5 h-5 animate-spin text-blue-600" />}
          </div>

          {!loadingLevels && levels.length === 0 && (
            <div className="rounded-[16px] border border-dashed border-gray-200 text-gray-400 text-sm p-8 text-center font-medium bg-white">
              No levels found.
            </div>
          )}

          <div className="space-y-4">
            {levels.map((level) => {
              const isLevelOpen = openLevelId === level.id;

              return (
                <div key={level.id} className="rounded-[16px] border border-gray-200 bg-gray-50/30 overflow-hidden">
                  <button
                    onClick={() => toggleLevel(level.id)}
                    className="w-full p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/60 transition-all"
                  >
                    <h3 className="text-lg font-bold text-gray-800">{level.name}</h3>
                    <div className="w-9 h-9 rounded-xl border border-gray-200 bg-white grid place-items-center shadow-sm">
                      {isLevelOpen ? (
                        <ChevronUp className="w-4 h-4 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                  </button>

                  {isLevelOpen && (
                    <div className="px-4 pb-4 space-y-4">
                      {SEMESTER_OPTIONS.map((semester) => {
                        const isSemesterOpen = openSemesterByLevel[level.id] === semester.value;
                        const key = getOfferingsKey(level.id, semester.value);
                        const bucket = offeringsByKey[key] ?? getDefaultBucket();

                        return (
                          <div
                            key={`${level.id}-${semester.value}`}
                            className={`rounded-[12px] border transition-all overflow-hidden bg-white ${
                              isSemesterOpen ? "border-blue-500 shadow-sm" : "border-gray-200"
                            }`}
                          >
                            <button
                              onClick={() => toggleSemester(level.id, semester.value)}
                              className="w-full p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/30 transition-all"
                            >
                              <h4 className="text-[15px] font-bold text-gray-700">{semester.label}</h4>
                              <div className="w-8 h-8 rounded-lg border border-gray-100 bg-white grid place-items-center shadow-sm">
                                {isSemesterOpen ? (
                                  <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                                )}
                              </div>
                            </button>

                            {isSemesterOpen && (
                              <div className="px-4 pb-4">
                                {bucket.loading ? (
                                  <div className="py-8 flex justify-center">
                                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                                  </div>
                                ) : bucket.error ? (
                                  <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm p-3.5 flex items-center justify-between gap-3">
                                    <span className="font-medium">{bucket.error}</span>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      onClick={() => fetchOfferings(level.id, semester.value)}
                                      className="cursor-pointer h-8 rounded-lg"
                                    >
                                      Retry
                                    </Button>
                                  </div>
                                ) : bucket.items.length === 0 ? (
                                  <div className="rounded-xl border border-dashed border-gray-100 text-gray-400 text-xs py-6 text-center font-medium bg-gray-50/20">
                                    No courses in this semester.
                                  </div>
                                ) : (
                                  <div className="overflow-x-auto">
                                    <table className="w-full border-separate border-spacing-y-1.5">
                                      <thead>
                                        <tr className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                          <th className="px-4 py-2">Name</th>
                                          <th className="px-4 py-2">Code</th>
                                          <th className="px-4 py-2">Groups</th>
                                          <th className="px-4 py-2 w-24"></th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {bucket.items.map((offering) => (
                                          <tr key={offering.id} className="group">
                                            <td className="bg-gray-50/40 group-hover:bg-gray-50 px-4 py-3 rounded-l-xl border-y border-l border-gray-100 text-sm font-semibold text-gray-700 transition-all">
                                              {offering.name || "Unnamed Course"}
                                            </td>
                                            <td className="bg-gray-50/40 group-hover:bg-gray-50 px-4 py-3 border-y border-gray-100 text-sm font-medium text-gray-500 transition-all">
                                              {offering.code || "-"}
                                            </td>
                                            <td className="bg-gray-50/40 group-hover:bg-gray-50 px-4 py-3 border-y border-gray-100 text-sm font-medium text-gray-600 transition-all">
                                              {offering.numberOfGroups}
                                            </td>
                                            <td className="bg-gray-50/40 group-hover:bg-gray-50 px-4 py-3 rounded-r-xl border-y border-r border-gray-100 transition-all">
                                              <div className="flex items-center justify-end gap-1">
                                                <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="icon"
                                                  onClick={() =>
                                                    handleEdit(offering.id, level.id, semester.value)
                                                  }
                                                  className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                                >
                                                  {loadingEditId === offering.id ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                  ) : (
                                                    <Pencil className="w-3.5 h-3.5" />
                                                  )}
                                                </Button>
                                                <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="icon"
                                                  onClick={() =>
                                                    handleDelete(offering.id, level.id, semester.value)
                                                  }
                                                  className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                >
                                                  <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                              </div>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}