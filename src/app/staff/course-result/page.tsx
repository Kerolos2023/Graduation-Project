"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Search, ChevronDown, AlertCircle, Loader2 } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { Pagination } from "@/components/ui/pagination";
import { useStaffContext } from "@/hooks/useStaffContext";
import {
  staffControlService,
  CourseOffering,
  AssessmentHeader,
  StudentControlInfo,
} from "@/services/staffControlService";
import { levelService } from "@/services/levelsServices";

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;
const COLLEGE_ID = "019c1ea6-1738-71cb-8cfd-a90e126d177e";

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar: React.FC<{ name: string }> = ({ name }) => {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  const colours = [
    "from-blue-400 to-blue-600",
    "from-violet-400 to-violet-600",
    "from-emerald-400 to-emerald-600",
    "from-amber-400 to-amber-600",
    "from-pink-400 to-pink-600",
    "from-cyan-400 to-cyan-600",
  ];
  const colourClass = colours[name.charCodeAt(0) % colours.length];
  return (
    <div
      className={`w-8 h-8 rounded-full bg-gradient-to-tr ${colourClass} flex items-center justify-center text-white text-[11px] font-bold shrink-0`}
    >
      {initials}
    </div>
  );
};

// ─── Custom Select ─────────────────────────────────────────────────────────────
interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  disabled = false,
  className = "",
}) => (
  <div className={`relative ${className}`}>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="appearance-none w-full h-[42px] px-4 pr-9 rounded-xl border border-gray-200 bg-white text-[13px] font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
  </div>
);

// ─── Editable Degree Cell ──────────────────────────────────────────────────────
interface DegreeCellProps {
  studentId: string;
  courseAssessmentId: string;
  degreeValue: number;
  maxDegree: number;
  academicProgramId: string;
  onUpdated: (
    studentId: string,
    courseAssessmentId: string,
    newDegree: number,
    totalDegree: number,
    letterDegree: string
  ) => void;
}

const DegreeCell: React.FC<DegreeCellProps> = ({
  studentId,
  courseAssessmentId,
  degreeValue,
  maxDegree,
  academicProgramId,
  onUpdated,
}) => {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState(String(degreeValue));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    const numVal = parseFloat(inputVal);
    if (isNaN(numVal) || numVal < 0 || numVal > maxDegree) {
      setError(`Must be 0–${maxDegree}`);
      return;
    }
    if (numVal === degreeValue) {
      setEditing(false);
      setError(null);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await staffControlService.updateDegree(academicProgramId, {
        studentId,
        courseAssessmentId,
        degree: String(numVal),
      });
      onUpdated(
        studentId,
        courseAssessmentId,
        numVal,
        res.data.totalDegree,
        res.data.letterDegree
      );
      setEditing(false);
    } catch {
      setError("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setEditing(false);
      setInputVal(String(degreeValue));
      setError(null);
    }
  };

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  // keep in sync when parent data refreshes
  useEffect(() => {
    if (!editing) setInputVal(String(degreeValue));
  }, [degreeValue, editing]);

  if (editing) {
    return (
      <div className="flex flex-col items-center gap-0.5">
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            type="number"
            min={0}
            max={maxDegree}
            step={0.01}
            value={inputVal}
            onChange={(e) => {
              setInputVal(e.target.value);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            disabled={saving}
            className={`w-16 text-center text-[13px] font-semibold border rounded-lg px-1 py-1 focus:outline-none focus:ring-2 transition-all ${
              error
                ? "border-red-400 focus:ring-red-500/20"
                : "border-blue-400 focus:ring-blue-500/20"
            }`}
          />
          {saving && (
            <Loader2 className="absolute -right-5 w-4 h-4 text-blue-500 animate-spin" />
          )}
        </div>
        {error && (
          <span className="text-[10px] text-red-500 font-medium">{error}</span>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      title={`Click to edit (max: ${maxDegree})`}
      className="group relative w-10 h-10 rounded-full border-2 border-blue-200 bg-blue-50 hover:border-blue-400 hover:bg-blue-100 flex items-center justify-center transition-all cursor-pointer"
    >
      <span className="text-[13px] font-bold text-blue-700 group-hover:text-blue-800">
        {degreeValue % 1 === 0 ? degreeValue : degreeValue.toFixed(1)}
      </span>
    </button>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CourseResultPage() {
  const { selectedProgramId } = useStaffContext();

  // ── Local Academic Year (fetched directly like department-courses) ──────────
  const [academicYearId, setAcademicYearId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentYear = async () => {
      try {
        const res = await axiosInstance.get(
          `/colleges/${COLLEGE_ID}/academic-years/current`
        );
        // Handle both nested and flat response shapes
        const raw = res.data?.data ?? res.data;
        const id = raw?.id ?? raw?.Id ?? null;
        if (id) {
          setAcademicYearId(id);
        } else {
          // Fallback: try fetching all years and pick first
          const listRes = await axiosInstance.get(
            `/colleges/${COLLEGE_ID}/academic-years`
          );
          const items = listRes.data?.items ?? listRes.data ?? [];
          const first = Array.isArray(items) ? items[0] : null;
          if (first?.id) setAcademicYearId(first.id);
        }
      } catch (err) {
        console.error("Error fetching academic year:", err);
      }
    };
    fetchCurrentYear();
  }, []);

  // ── Filter State ──────────────────────────────────────────────────────────
  // Level
  const [levels, setLevels] = useState<{ id: string; name: string }[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState("");
  const [semesterType, setSemesterType] = useState("");  // "Fall" | "Spring" | "Summer"
  // Course offerings (after level+semester selected)
  const [courseOfferings, setCourseOfferings] = useState<CourseOffering[]>([]);
  const [selectedCourseOfferingId, setSelectedCourseOfferingId] = useState("");
  const [groupNumber, setGroupNumber] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [searchValue, setSearchValue] = useState("");

  // ── Table State ──────────────────────────────────────────────────────────
  const [assessmentHeaders, setAssessmentHeaders] = useState<AssessmentHeader[]>([]);
  const [courseTotalGrade, setCourseTotalGrade] = useState<number>(0);
  const [students, setStudents] = useState<StudentControlInfo[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  // ── Load Levels ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedProgramId) return;
    const load = async () => {
      try {
      const response = await levelService.getAllLevels(selectedProgramId, { PageNumber: 1, PageSize: 1000 });
        const items = response.items;
        setLevels(items);
        setSelectedLevelId("");
        setSemesterType("");
        setCourseOfferings([]);
        setSelectedCourseOfferingId("");
      } catch (err) {
        console.error("Error fetching levels:", err);
      }
    };
    load();
  }, [selectedProgramId]);

  // ── Load Course Offerings (needs levelId + semesterType + academicYearId) ────
  useEffect(() => {
    if (!selectedProgramId || !academicYearId || !selectedLevelId || !semesterType) {
      setCourseOfferings([]);
      setSelectedCourseOfferingId("");
      return;
    }
    const load = async () => {
      try {
        const res = await axiosInstance.get(
          `/programs/${selectedProgramId}/course-offerings`,
          { params: { levelId: selectedLevelId, semesterType, academicYearId } }
        );
        const raw = res.data?.items ?? res.data ?? [];
        const items: CourseOffering[] = Array.isArray(raw) ? raw : [];
        setCourseOfferings(items);
        setSelectedCourseOfferingId("");
        setGroupNumber("");
      } catch (err) {
        console.error("Error fetching course offerings:", err);
      }
    };
    load();
  }, [selectedProgramId, academicYearId, selectedLevelId, semesterType]);

  // ── Derived: group options from selected course ────────────────────────────
  const selectedCourse = courseOfferings.find(
    (c) => c.id === selectedCourseOfferingId
  );
  const groupOptions: SelectOption[] = selectedCourse
    ? Array.from({ length: selectedCourse.numberOfGroups }, (_, i) => ({
        value: String(i + 1),
        label: `Group ${i + 1}`,
      }))
    : [];

  // ── Fetch Students ────────────────────────────────────────────────────────
  const fetchStudents = useCallback(async () => {
    // CourseOfferingId is required by the control API to return meaningful data
    if (!selectedProgramId || !selectedCourseOfferingId) return;
    setIsLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = {
        "Filter.PageNumber": pageNumber,
        "Filter.PageSize": PAGE_SIZE,
        CourseOfferingId: selectedCourseOfferingId,
      };
      if (groupNumber) params.GroupNumber = Number(groupNumber);
      if (searchValue) params["Filter.SearchValue"] = searchValue;
      if (sortColumn) params["Filter.SortColumn"] = sortColumn;

      const res = await staffControlService.getStudents(
        selectedProgramId,
        params as Parameters<typeof staffControlService.getStudents>[1]
      );
      const data = res.data;
      setAssessmentHeaders(data.assessmentHeaders ?? []);
      setCourseTotalGrade(data.courseTotalGrade ?? 0);
      setStudents(data.studentsInformation?.items ?? []);
      setTotalPages(data.studentsInformation?.totalPages ?? 1);
      setHasFetched(true);
    } catch (err: unknown) {
      console.error("Error fetching students:", err);
      const axiosError = err as {
        response?: { data?: { message?: string; title?: string } };
        message?: string;
      };
      setError(
        axiosError?.response?.data?.message ||
          axiosError?.response?.data?.title ||
          axiosError?.message ||
          "Failed to load students"
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    selectedProgramId,
    selectedCourseOfferingId,
    groupNumber,
    searchValue,
    sortColumn,
    pageNumber,
  ]);

  useEffect(() => {
    if (selectedProgramId && selectedCourseOfferingId) {
      fetchStudents();
    } else {
      // Reset table when course is cleared
      setStudents([]);
      setAssessmentHeaders([]);
      setCourseTotalGrade(0);
      setTotalPages(1);
      setHasFetched(false);
    }
  }, [fetchStudents]);

  // ── Handle Degree Update ──────────────────────────────────────────────────
  const handleDegreeUpdated = (
    studentId: string,
    courseAssessmentId: string,
    newDegree: number,
    totalDegree: number,
    letterDegree: string
  ) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.studentId !== studentId) return s;
        return {
          ...s,
          totalDegree,
          letterDegree,
          studentDegrees: s.studentDegrees.map((d) =>
            d.courseAssessmentId === courseAssessmentId
              ? { ...d, degreeValue: newDegree }
              : d
          ),
        };
      })
    );
  };

  // ── Search with debounce ───────────────────────────────────────────────────
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);
    setPageNumber(1);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      /* fetchStudents is triggered by dependency change */
    }, 400);
  };

  // ─────────────────────────────────────────────────────────────────────────
  const sortOptions: SelectOption[] = [
    { value: "name", label: "Sort by Name" },
    { value: "code", label: "Sort by Code" },
  ];

  return (
    <div className="w-full flex flex-col gap-5 font-inter pb-8">
      {/* ── Page Title ── */}
      <div className="flex items-center gap-3 pt-1">
        <h1 className="text-2xl font-bold text-gray-900 leading-none">
          Course Result
        </h1>
      </div>

      {/* ── Filters Card ── */}
      <div className="bg-white rounded-[20px] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-[#eaebf0]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Level */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide">
              Level
            </label>
            <CustomSelect
              options={levels.map((l) => ({ value: l.id, label: l.name }))}
              value={selectedLevelId}
              onChange={(val) => {
                setSelectedLevelId(val);
                setSemesterType("");
                setCourseOfferings([]);
                setSelectedCourseOfferingId("");
                setGroupNumber("");
                setPageNumber(1);
              }}
              placeholder="Select level..."
              disabled={!selectedProgramId || levels.length === 0}
            />
          </div>

          {/* Semester Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide">
              Semester
            </label>
            <CustomSelect
              options={[
                { value: "Fall", label: "Fall" },
                { value: "Spring", label: "Spring" },
                { value: "Summer", label: "Summer" },
              ]}
              value={semesterType}
              onChange={(val) => {
                setSemesterType(val);
                setSelectedCourseOfferingId("");
                setGroupNumber("");
                setPageNumber(1);
              }}
              placeholder="Select semester..."
              disabled={!selectedLevelId}
            />
          </div>

          {/* Course */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide">
              Course
            </label>
            <CustomSelect
              options={courseOfferings.map((c) => ({
                value: c.id,
                label: `${c.name}${c.code ? ` (${c.code})` : ""}`,
              }))}
              value={selectedCourseOfferingId}
              onChange={(val) => {
                setSelectedCourseOfferingId(val);
                setGroupNumber("");
                setPageNumber(1);
              }}
              placeholder={semesterType ? "Select course..." : "Select level & semester first"}
              disabled={!semesterType || courseOfferings.length === 0}
            />
          </div>

          {/* Group Number */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide">
              Group Number
            </label>
            <CustomSelect
              options={groupOptions}
              value={groupNumber}
              onChange={(val) => {
                setGroupNumber(val);
                setPageNumber(1);
              }}
              placeholder="Select group..."
              disabled={!selectedCourseOfferingId || groupOptions.length === 0}
            />
          </div>

          {/* Student Sorting */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide">
              Student Sorting
            </label>
            <CustomSelect
              options={sortOptions}
              value={sortColumn}
              onChange={(val) => {
                setSortColumn(val);
                setPageNumber(1);
              }}
              placeholder="Default order"
            />
          </div>
        </div>
      </div>

      {/* ── Students Table Card ── */}
      <div className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-[#eaebf0] overflow-hidden">
        {/* ── Card Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <h2 className="text-[16px] font-bold text-gray-900">Students</h2>
            {!isLoading && hasFetched && (
              <span className="bg-blue-50 text-blue-600 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-blue-100">
                {students.length} shown
              </span>
            )}
            {courseTotalGrade > 0 && !isLoading && (
              <span className="bg-gray-50 text-gray-600 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-gray-100">
                Total: {courseTotalGrade}
              </span>
            )}
          </div>

          {/* Search */}
          <div className="relative w-56 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name or code..."
              value={searchValue}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 text-[13px] transition-all bg-gray-50 placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* ── Loading ── */}
        {isLoading && (
          <div className="flex items-center justify-center py-20 gap-3">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            <span className="text-gray-500 text-sm">Loading students...</span>
          </div>
        )}

        {/* ── Error ── */}
        {!isLoading && error && (
          <div className="flex items-center justify-center py-16 gap-3 text-red-500">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* ── No Program Selected ── */}
        {!isLoading && !error && !selectedProgramId && (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-2">
              <Search className="w-7 h-7 text-blue-400" />
            </div>
            <p className="text-gray-500 text-sm font-medium">
              Select a program from the sidebar to get started
            </p>
          </div>
        )}

        {/* ── No Course Selected ── */}
        {!isLoading && !error && selectedProgramId && !selectedCourseOfferingId && (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-2">
              <Search className="w-7 h-7 text-blue-400" />
            </div>
            <p className="text-gray-500 text-sm font-medium">
              Select a course above to view student grades
            </p>
          </div>
        )}

        {/* ── Empty ── */}
        {!isLoading && !error && selectedProgramId && selectedCourseOfferingId && hasFetched && students.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-2">
              <Search className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-gray-400 text-sm">No students found</p>
          </div>
        )}

        {/* ── Table ── */}
        {!isLoading && !error && students.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              {/* Table Head */}
              <thead>
                <tr className="bg-[#fafafa] border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 text-[12px] font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    #
                  </th>
                  <th className="text-left px-4 py-3.5 text-[12px] font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    Code
                  </th>
                  <th className="text-left px-4 py-3.5 text-[12px] font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    Name
                  </th>
                  <th className="text-left px-4 py-3.5 text-[12px] font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    Level
                  </th>
                  {/* Dynamic Assessment Columns */}
                  {assessmentHeaders.map((h) => (
                    <th
                      key={h.assessmentId}
                      className="text-center px-4 py-3.5 text-[12px] font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <span>{h.name}</span>
                        <span className="text-[10px] font-normal text-gray-400 normal-case">
                          /{h.maxDegree}
                        </span>
                      </div>
                    </th>
                  ))}
                  {/* Total & Grade */}
                  <th className="text-center px-4 py-3.5 text-[12px] font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    <div className="flex flex-col items-center gap-0.5">
                      <span>Total</span>
                      {courseTotalGrade > 0 && (
                        <span className="text-[10px] font-normal text-gray-400 normal-case">
                          /{courseTotalGrade}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="text-center px-4 py-3.5 text-[12px] font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    Grade
                  </th>
                  <th className="text-center px-4 py-3.5 text-[12px] font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    Failed
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {students.map((student, idx) => (
                  <tr
                    key={student.studentId}
                    className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors"
                  >
                    {/* Row number */}
                    <td className="px-5 py-3.5">
                      <span className="text-[13px] font-medium text-gray-400">
                        {String((pageNumber - 1) * PAGE_SIZE + idx + 1).padStart(2, "0")}
                      </span>
                    </td>

                    {/* Code */}
                    <td className="px-4 py-3.5">
                      <span className="text-[12px] font-mono text-gray-500">
                        {student.code}
                      </span>
                    </td>

                    {/* Name */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={student.name} />
                        <span className="text-[13px] font-semibold text-gray-900 whitespace-nowrap">
                          {student.name}
                        </span>
                      </div>
                    </td>

                    {/* Level */}
                    <td className="px-4 py-3.5">
                      <span className="text-[12px] text-gray-500 whitespace-nowrap">
                        {student.levelName}
                      </span>
                    </td>

                    {/* Dynamic Degree Cells */}
                    {assessmentHeaders.map((h) => {
                      const deg = student.studentDegrees.find(
                        (d) => d.courseAssessmentId === h.assessmentId
                      );
                      return (
                        <td
                          key={h.assessmentId}
                          className="px-4 py-3.5 text-center"
                        >
                          {deg ? (
                            <div className="flex justify-center">
                              <DegreeCell
                                studentId={student.studentId}
                                courseAssessmentId={h.assessmentId}
                                degreeValue={deg.degreeValue}
                                maxDegree={h.maxDegree}
                                academicProgramId={selectedProgramId!}
                                onUpdated={handleDegreeUpdated}
                              />
                            </div>
                          ) : (
                            <span className="text-gray-300 text-sm">—</span>
                          )}
                        </td>
                      );
                    })}

                    {/* Total */}
                    <td className="px-4 py-3.5 text-center">
                      <span className="text-[13px] font-bold text-gray-800">
                        {student.totalDegree % 1 === 0
                          ? student.totalDegree
                          : student.totalDegree.toFixed(2)}
                      </span>
                    </td>

                    {/* Letter Grade */}
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[12px] font-bold ${
                          student.letterDegree?.startsWith("A")
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : student.letterDegree?.startsWith("B")
                            ? "bg-blue-50 text-blue-700 border border-blue-100"
                            : student.letterDegree?.startsWith("C")
                            ? "bg-amber-50 text-amber-700 border border-amber-100"
                            : student.letterDegree?.startsWith("D")
                            ? "bg-orange-50 text-orange-700 border border-orange-100"
                            : "bg-red-50 text-red-700 border border-red-100"
                        }`}
                      >
                        {student.letterDegree ?? "—"}
                      </span>
                    </td>

                    {/* Failed */}
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`text-[13px] font-semibold ${
                          student.numberOfFailed > 0
                            ? "text-red-500"
                            : "text-gray-400"
                        }`}
                      >
                        {student.numberOfFailed}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ── */}
        {!isLoading && !error && totalPages > 1 && (
          <div className="flex justify-center py-5 px-5 border-t border-gray-100">
            <Pagination
              currentPage={pageNumber}
              totalPages={totalPages}
              onPageChange={(p) => setPageNumber(p)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
