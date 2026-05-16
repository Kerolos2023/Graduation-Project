"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Plus, X, Printer, User, BookOpen, Calendar } from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";
import { levelService } from "@/services/levelsServices";
import { cn } from "@/lib/utils";
import { COLLEGE_ID } from "@/lib/constants";

type AcademicLevel = { id: string; name: string };

const DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

type StudentResult = {
  id: string;
  name: string;
  studentCode: string;
  nationalIdOrPassport: string;
  gender: string | null;
};

type EnrollmentSession = {
  enrollemntId?: string;
  sessionId: string;
  courseOfferingId: string;
  courseName?: string;
  instructorName?: string;
  buildingName?: string;
  roomNumber?: number;
  groupNumber?: number;
  type: string;
  startTime: string;
  endTime: string;
  dayOfWeek: string;
};

type CourseSession = {
  sessionId: string;
  instructorName: string;
  type: string;
  groupNumber: number;
  day: string;
  start: string;
  end: string;
  availableSeats: number;
  isRegistered: boolean;
};

type Course = {
  courseOfferingId: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  isOptional: boolean;
  creditHours: number;
  isEnrolled: boolean;
  sessions: CourseSession[];
};

type StudentInfo = {
  studentName: string;
  levelName: string;
  studentCode: string;
  registeredHours: number;
  maxAllowedHours: number;
  minAllowedHours: number;
  gpa: number;
};

type EnrollmentData = {
  student: StudentInfo;
  courses: Course[];
  enrollmentInfos: EnrollmentSession[];
};

type DraftSession = { sessionId: string; courseOfferingId: string };

type ScheduleDefinition = {
  dayStartTime: string;
  dayEndTime: string;
  slotDurationMinutes: number;
};

const normalizeTime = (t?: string) => {
  if (!t) return "";
  if (t.includes("T")) return t.split("T")[1]?.slice(0, 5) || "";
  return t.slice(0, 5);
};

const toMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

const fromMinutes = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

// Build fixed slots from schedule definition (dayStartTime → dayEndTime, slotDurationMinutes)
const buildSlots = (start?: string, end?: string, duration?: number) => {
  if (!start || !end || !duration) return [];
  const startMin = toMinutes(start);
  const endMin = toMinutes(end);
  const slots: { start: string; end: string; label: string }[] = [];
  for (let t = startMin; t < endMin; t += duration) {
    const s = fromMinutes(t);
    const e = fromMinutes(Math.min(t + duration, endMin));
    slots.push({ start: s, end: e, label: `${s}-${e}` });
  }
  return slots;
};

const SESSION_TYPE_MAP: Record<string, string> = {
  "1": "Lecture",
  "2": "Section",
  "3": "Lab",
  lecture: "Lecture",
  section: "Section",
  lab: "Lab",
};
const normalizeType = (t: unknown): string => {
  if (!t) return "";
  const s = String(t).trim();
  return SESSION_TYPE_MAP[s] ?? SESSION_TYPE_MAP[s.toLowerCase()] ?? s;
};

const SESSION_COLORS: Record<string, string> = {
  Lecture: "bg-blue-50 border-blue-200 text-blue-900",
  Section: "bg-amber-50 border-amber-200 text-amber-900",
  Lab: "bg-purple-50 border-purple-200 text-purple-900",
};
const SESSION_BADGES: Record<string, string> = {
  Lecture: "bg-blue-100 text-blue-700",
  Section: "bg-amber-100 text-amber-700",
  Lab: "bg-purple-100 text-purple-700",
};
const getSessionColor = (type: string) =>
  SESSION_COLORS[type] ?? "bg-gray-50 border-gray-200 text-gray-800";
const getSessionBadge = (type: string) =>
  SESSION_BADGES[type] ?? "bg-gray-100 text-gray-600";

export default function AdvisorRegisterPage() {
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<StudentResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentResult | null>(null);

  const [levels, setLevels] = useState<AcademicLevel[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState("");

  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData | null>(null);
  const [isLoadingEnrollment, setIsLoadingEnrollment] = useState(false);

  const [currentSemesterId, setCurrentSemesterId] = useState<string | null>(null);
  const [programId, setProgramId] = useState<string | null>(null);
  const [scheduleDefinition, setScheduleDefinition] = useState<ScheduleDefinition | null>(null);

  // ── Draft enrollment state ─────────────────────────────────────────────────
  const [draftSessions, setDraftSessions] = useState<DraftSession[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Cross-level tracking refs (don't trigger re-renders but prevent stale closure issues)
  // sessionDetailsCache: accumulates session details from every level visited
  const sessionDetailsCacheRef = useRef<Map<string, EnrollmentSession>>(new Map());
  // removedIds: sessionIds the user explicitly removed — NOT re-added on level switch
  const removedIdsRef = useRef<Set<string>>(new Set());
  const [removedIds, setRemovedIds] = useState<string[]>([]); // mirror for rendering

  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch program, current semester, and schedule definition on mount
  useEffect(() => {
    const init = async () => {
      try {
        const [yearRes, progRes] = await Promise.all([
          axiosInstance.get(`/colleges/${COLLEGE_ID}/academic-years/current`),
          axiosInstance.get(`/colleges/${COLLEGE_ID}/academic-programs`),
        ]);
        const yearId = yearRes.data?.id || yearRes.data?.data?.id;
        const progItems = progRes.data?.items || [];
        const firstProg = progItems[0];
        if (firstProg) {
          setProgramId(firstProg.id);
          if (yearId) {
            const semRes = await axiosInstance.get(
              `/colleges/${COLLEGE_ID}/academic-years/${yearId}/current-semester`
            );
            const semId = semRes.data?.id;
            if (semId) {
              setCurrentSemesterId(semId);
              // Fetch schedule definition for slot building
              try {
                const schedRes = await axiosInstance.get(
                  `/programs/${firstProg.id}/semesters/${semId}/schedule`
                );
                const raw = schedRes.data?.data ?? schedRes.data?.item ?? schedRes.data;
                if (raw) {
                  setScheduleDefinition({
                    dayStartTime: raw.dayStartTime ?? raw.DayStartTime ?? "",
                    dayEndTime: raw.dayEndTime ?? raw.DayEndTime ?? "",
                    slotDurationMinutes: Number(
                      raw.slotDurationMinutes ?? raw.SlotDurationMinutes ?? 60
                    ),
                  });
                }
              } catch (e) {
                console.error("Failed to fetch schedule definition:", e);
              }
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    init();
  }, []);

  // Fetch levels when program is ready
  useEffect(() => {
    if (!programId) return;
    levelService.getAllLevels(programId, { PageNumber: 1, PageSize: 1000 })
      .then((response) => {
        const items = response.items;
        setLevels(items);
        if (items.length > 0) setSelectedLevelId(items[0].id);
      })
      .catch(console.error);
  }, [programId]);

  // Core search — fires even with an empty name (backend returns first page)
  const performSearch = async (val: string) => {
    setIsSearching(true);
    try {
      const params: Record<string, string | number> = { PageNumber: 1, PageSize: 20 };
      if (val.trim()) params.SearchValue = val.trim();
      const res = await axiosInstance.get(`/colleges/${COLLEGE_ID}/stuff/advisor-students`, { params });
      const items = res.data?.items || [];
      setSearchResults(items);
      setShowDropdown(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  // Search students with debounce
  const handleSearchChange = (val: string) => {
    setSearchValue(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => performSearch(val), 300);
  };

  // On focus: immediately show results (first page if empty, filtered if has value)
  const handleSearchFocus = () => {
    if (searchResults.length > 0) {
      setShowDropdown(true);
      return;
    }
    performSearch(searchValue);
  };

  const selectStudent = (s: StudentResult) => {
    setSelectedStudent(s);
    setSearchValue(s.name);
    setShowDropdown(false);
    setEnrollmentData(null);
    setDraftSessions([]);
    setIsDirty(false);
    // Reset cross-level state for new student
    sessionDetailsCacheRef.current = new Map();
    removedIdsRef.current = new Set();
    setRemovedIds([]);
  };

  // Fetch enrollment data
  const fetchEnrollment = useCallback(async () => {
    if (!selectedStudent || !currentSemesterId || !selectedLevelId) return;
    setIsLoadingEnrollment(true);
    try {
      const res = await axiosInstance.get("/enrollments", {
        params: {
          SemesterId: currentSemesterId,
          StudentId: selectedStudent.id,
          LevelId: selectedLevelId,
        },
      });
      setEnrollmentData(res.data?.data ?? res.data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load enrollment data.");
    } finally {
      setIsLoadingEnrollment(false);
    }
  }, [selectedStudent, currentSemesterId, selectedLevelId]);

  useEffect(() => {
    fetchEnrollment();
  }, [fetchEnrollment]);

  // Sync draft whenever enrollment loads — MERGE (not replace) to preserve cross-level selections
  useEffect(() => {
    if (!enrollmentData) return;

    // 1. Update accumulated session details cache
    const cache = sessionDetailsCacheRef.current;
    (enrollmentData.courses || []).forEach((course) => {
      course.sessions.forEach((session) => {
        cache.set(session.sessionId, {
          sessionId: session.sessionId,
          courseOfferingId: course.courseOfferingId,
          courseName: course.courseName,
          instructorName: session.instructorName,
          type: session.type,
          startTime: session.start,
          endTime: session.end,
          dayOfWeek: session.day,
        });
      });
    });
    (enrollmentData.enrollmentInfos || []).forEach((ei) => {
      // enrollmentInfos has richer data (buildingName, roomNumber) — merge on top
      cache.set(ei.sessionId, { ...cache.get(ei.sessionId), ...ei });
    });

    // 2. Merge: add new enrollmentInfos sessions not already in draft and not explicitly removed
    setDraftSessions((prev) => {
      const existingIds = new Set(prev.map((d) => d.sessionId));
      const toAdd = (enrollmentData.enrollmentInfos || []).filter(
        (ei) => !existingIds.has(ei.sessionId) && !removedIdsRef.current.has(ei.sessionId)
      ).map((ei) => ({ sessionId: ei.sessionId, courseOfferingId: ei.courseOfferingId }));
      return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
    });
  }, [enrollmentData]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Draft operations (local, no API call) ────────────────────────────────
  const markRemoved = (ids: string[]) => {
    ids.forEach((id) => removedIdsRef.current.add(id));
    setRemovedIds(Array.from(removedIdsRef.current));
  };
  const markRestored = (ids: string[]) => {
    ids.forEach((id) => removedIdsRef.current.delete(id));
    setRemovedIds(Array.from(removedIdsRef.current));
  };

  const handleAddToDraft = (course: Course) => {
    markRestored(course.sessions.map((s) => s.sessionId));
    const sessions = course.sessions.map((s) => ({
      sessionId: s.sessionId,
      courseOfferingId: course.courseOfferingId,
    }));
    setDraftSessions((prev) => [...prev, ...sessions]);
    setIsDirty(true);
  };

  const handleRemoveFromDraft = (course: Course) => {
    markRemoved(course.sessions.map((s) => s.sessionId));
    setDraftSessions((prev) =>
      prev.filter((ds) => ds.courseOfferingId !== course.courseOfferingId)
    );
    setIsDirty(true);
  };

  // Remove all sessions of a courseOfferingId from draft (used by schedule cells)
  const handleRemoveCourseOfferingFromDraft = (courseOfferingId: string) => {
    const idsToRemove = draftSessions
      .filter((ds) => ds.courseOfferingId === courseOfferingId)
      .map((ds) => ds.sessionId);
    markRemoved(idsToRemove);
    setDraftSessions((prev) =>
      prev.filter((ds) => ds.courseOfferingId !== courseOfferingId)
    );
    setIsDirty(true);
  };

  // Restore a course offering (re-adds its sessions from cache)
  const handleRestoreCourseOffering = (courseOfferingId: string) => {
    const sessionsToRestore = Array.from(sessionDetailsCacheRef.current.values()).filter(
      (ei) => ei.courseOfferingId === courseOfferingId
    );
    markRestored(sessionsToRestore.map((ei) => ei.sessionId));
    setDraftSessions((prev) => [
      ...prev,
      ...sessionsToRestore.map((ei) => ({ sessionId: ei.sessionId, courseOfferingId: ei.courseOfferingId })),
    ]);
    setIsDirty(true);
  };

  const handleDiscardChanges = () => {
    sessionDetailsCacheRef.current = new Map();
    removedIdsRef.current = new Set();
    setRemovedIds([]);
    setDraftSessions([]);
    setIsDirty(false);
    fetchEnrollment();
  };

  // ── Save: sends the full draft to API in one PUT ──────────────────────────
  const handleSaveChanges = async () => {
    if (!selectedStudent || !currentSemesterId) return;
    setIsSaving(true);
    try {
      const res = await axiosInstance.put(
        "/enrollments",
        { newSessions: draftSessions },
        { params: { SemesterId: currentSemesterId, StudentId: selectedStudent.id } }
      );
      // PUT returns the updated enrollmentInfos[] — apply directly to avoid a round-trip
      const updatedInfos: EnrollmentSession[] = Array.isArray(res.data) ? res.data : [];
      const cache = sessionDetailsCacheRef.current;
      updatedInfos.forEach((ei) => {
        cache.set(ei.sessionId, { ...cache.get(ei.sessionId), ...ei });
      });
      removedIdsRef.current = new Set();
      setRemovedIds([]);
      setDraftSessions(updatedInfos.map((ei) => ({ sessionId: ei.sessionId, courseOfferingId: ei.courseOfferingId })));
      setIsDirty(false);
      toast.success("Enrollment saved successfully.");
      fetchEnrollment(); // still refresh to get latest student hours / course states
    } catch (e: any) {
      const errMsg =
        e?.response?.data?.errors?.join("\n") ||
        e?.response?.data?.message ||
        "Failed to save enrollment.";
      toast.error(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const courses = enrollmentData?.courses || [];
  const studentInfo = enrollmentData?.student;

  // Use the accumulated cache (covers all visited levels) for session details
  const cache = sessionDetailsCacheRef.current;

  // Build live schedule from draftSessions using the accumulated cache
  const draftEnrollmentInfos: EnrollmentSession[] = draftSessions
    .map((ds) => cache.get(ds.sessionId))
    .filter((ei): ei is EnrollmentSession => ei !== undefined);

  // Build slots from schedule definition
  const slotDuration = scheduleDefinition?.slotDurationMinutes || 60;
  const slots = buildSlots(
    normalizeTime(scheduleDefinition?.dayStartTime),
    normalizeTime(scheduleDefinition?.dayEndTime),
    slotDuration
  );

  const sessionsByDay = DAYS.reduce<Record<string, EnrollmentSession[]>>((acc, d) => {
    acc[d] = draftEnrollmentInfos.filter((ei) =>
      (ei.dayOfWeek || "").toLowerCase() === d.toLowerCase()
    );
    return acc;
  }, {});

  const hasSchedule = draftSessions.length > 0 || removedIds.length > 0;

  // Ghost sessions: from cache, explicitly removed by user (persists across level switches)
  const removedEnrollmentInfos = removedIds
    .map((id) => cache.get(id))
    .filter((ei): ei is EnrollmentSession => ei !== undefined);
  const removedByDay = DAYS.reduce<Record<string, EnrollmentSession[]>>((acc, d) => {
    acc[d] = removedEnrollmentInfos.filter(
      (ei) => (ei.dayOfWeek || "").toLowerCase() === d.toLowerCase()
    );
    return acc;
  }, {});

  // Helper: get course name from current courses[] or cache
  const getCourseNameById = (courseOfferingId: string) =>
    courses.find((c) => c.courseOfferingId === courseOfferingId)?.courseName ||
    (() => {
      const found = Array.from(cache.values()).find((ei) => ei.courseOfferingId === courseOfferingId);
      return found ? "Enrolled Course" : "";
    })();


  return (
    <div className="w-full flex flex-col gap-6 pb-8">

      {/* ── Student Search Card ── */}
      <div className="bg-white rounded-[24px] p-4 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Student Registration</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Search for a student to manage their course enrollment</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-[12px] border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer self-start sm:self-auto shrink-0">
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>

        {/* Search */}
        <div ref={searchRef} className="relative max-w-xl">
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or student code…"
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={handleSearchFocus}
              className="w-full h-11 pl-10 pr-10 rounded-[12px] border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
            />
            {searchValue && (
              <button
                onClick={() => { setSearchValue(""); setSearchResults([]); setShowDropdown(false); setSelectedStudent(null); setEnrollmentData(null); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute z-50 mt-1 w-full bg-white border border-gray-100 rounded-[14px] shadow-xl overflow-hidden">
              {isSearching ? (
                <div className="px-4 py-3 text-sm text-gray-400">Searching…</div>
              ) : searchResults.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-400">No students found</div>
              ) : (
                searchResults.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => selectStudent(s)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left border-b border-gray-50 last:border-0 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-400 to-violet-500 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                      {s.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{s.name}</div>
                      <div className="text-xs text-gray-500">{s.studentCode}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Student Info + Levels ── */}
      {selectedStudent && (
        <div className="bg-white rounded-[24px] p-4 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0]">
          {/* Student Data */}
          <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-blue-400 to-violet-500 flex items-center justify-center text-white text-base sm:text-lg font-bold shrink-0">
              {selectedStudent.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate">{studentInfo?.studentName || selectedStudent.name}</h2>
              <p className="text-xs sm:text-sm text-gray-500">{studentInfo?.levelName || ""} · {selectedStudent.studentCode}</p>
              {studentInfo && (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                  <span className="text-xs font-medium text-gray-500">
                    Registered: <span className="font-bold text-gray-800">{studentInfo.registeredHours}h</span>
                  </span>
                  <span className="text-xs text-gray-300 hidden sm:inline">|</span>
                  <span className="text-xs font-medium text-gray-500">
                    Allowed: <span className="font-bold text-gray-800">{studentInfo.minAllowedHours}–{studentInfo.maxAllowedHours}h</span>
                  </span>
                  <span className="text-xs text-gray-300 hidden sm:inline">|</span>
                  <span className="text-xs font-medium text-gray-500">
                    GPA: <span className="font-bold text-gray-800">{studentInfo.gpa.toFixed(2)}</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Level Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            {levels.map((level) => (
              <button
                key={level.id}
                onClick={() => setSelectedLevelId(level.id)}
                className={cn(
                  "px-4 py-2 rounded-[10px] text-sm font-semibold border transition-all duration-150 cursor-pointer",
                  "active:scale-95 active:translate-y-px",
                  selectedLevelId === level.id
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200"
                    : "bg-[#f8f9fc] text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                )}
              >
                {level.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Courses ── */}
      {selectedStudent && (
        <div className="bg-white rounded-[24px] p-4 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 min-w-0">
              <BookOpen className="w-5 h-5 text-blue-600 shrink-0" />
              <h2 className="text-base font-bold text-gray-900">Courses</h2>
              {enrollmentData?.student?.levelName && (
                <span className="text-xs text-gray-400 font-medium truncate">— {enrollmentData.student.levelName}</span>
              )}
            </div>
            {isDirty && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-amber-600 font-medium">Unsaved changes</span>
                <button
                  onClick={handleDiscardChanges}
                  disabled={isSaving}
                  className="px-3 py-1.5 text-xs font-semibold rounded-[8px] border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Discard
                </button>
                <button
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[8px] bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSaving && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Save Changes
                </button>
              </div>
            )}
          </div>

          {isLoadingEnrollment ? (
            <div className="flex items-center justify-center py-12 text-sm text-gray-400">Loading…</div>
          ) : courses.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-sm text-gray-400">
              {selectedLevelId ? "No courses found for this level." : "Select a level to view courses."}
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar -mx-4 sm:-mx-6 px-4 sm:px-6">
              <table className="min-w-max w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500">Name</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500">Code</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500">Course Type</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500">Hours</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500">Type</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500">Instructor</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500">Day</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500">From – To</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500">Group</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500">Seats</th>
                    <th className="py-3 px-3" />
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => {
                    // Check draft state (local) — reflects pending additions/removals before save
                    const isEnrolled = draftSessions.some(
                      (ds) => ds.courseOfferingId === course.courseOfferingId
                    );
                    return course.sessions.length === 0 ? (
                      <tr key={course.courseOfferingId} className="border-b border-gray-50">
                        <td className="py-3 px-3 font-semibold text-gray-800">{course.courseName}</td>
                        <td className="py-3 px-3 text-gray-500">{course.courseCode}</td>
                        <td className="py-3 px-3">
                          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", course.isOptional ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700")}>
                            {course.isOptional ? "Optional" : "Compulsory"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-gray-500">{course.creditHours}</td>
                        <td colSpan={6} className="py-3 px-3 text-gray-400 text-xs italic">No sessions available</td>
                      </tr>
                    ) : (
                      course.sessions.map((session, si) => (
                        <tr
                          key={`${course.courseOfferingId}-${session.sessionId}`}
                          className={cn(
                            "border-b border-gray-50 transition-colors",
                            isEnrolled ? "bg-green-50/40 hover:bg-green-50/70" : "hover:bg-gray-50/50"
                          )}
                        >
                          {si === 0 && (
                            <>
                              <td rowSpan={course.sessions.length} className="py-3 px-3 align-middle">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-gray-800">{course.courseName}</span>
                                  {isEnrolled && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">Enrolled</span>
                                  )}
                                </div>
                              </td>
                              <td rowSpan={course.sessions.length} className="py-3 px-3 text-gray-500 align-middle">{course.courseCode}</td>
                              <td rowSpan={course.sessions.length} className="py-3 px-3 align-middle">
                                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", course.isOptional ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700")}>
                                  {course.isOptional ? "Optional" : "Compulsory"}
                                </span>
                              </td>
                              <td rowSpan={course.sessions.length} className="py-3 px-3 text-gray-500 align-middle">{course.creditHours}</td>
                            </>
                          )}
                          <td className="py-3 px-3 text-gray-600">{session.type}</td>
                          <td className="py-3 px-3 text-gray-600">{session.instructorName}</td>
                          <td className="py-3 px-3 text-gray-600">{session.day}</td>
                          <td className="py-3 px-3 text-gray-600">{normalizeTime(session.start) || session.start} – {normalizeTime(session.end) || session.end}</td>
                          <td className="py-3 px-3 text-gray-600">Group {session.groupNumber}</td>
                          <td className="py-3 px-3 text-gray-600">{session.availableSeats}</td>
                          <td className="py-3 px-3 text-right align-middle">
                            {si === 0 && (
                              isEnrolled ? (
                                <button
                                  onClick={() => handleRemoveFromDraft(course)}
                                  disabled={isSaving}
                                  className="w-7 h-7 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
                                  title="Remove from enrollment"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleAddToDraft(course)}
                                  disabled={isSaving}
                                  className="w-7 h-7 rounded-full bg-green-100 hover:bg-green-200 text-green-600 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
                                  title="Add to enrollment"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              )
                            )}
                          </td>
                        </tr>
                      ))
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Schedule ── */}
      {selectedStudent && hasSchedule && (
        <div className="bg-white rounded-[24px] p-4 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0]">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-gray-900">Schedule</h2>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {Object.entries(SESSION_BADGES).map(([type, cls]) => (
              <span key={type} className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${cls}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                {type}
              </span>
            ))}
          </div>

          <div className="overflow-x-auto custom-scrollbar -mx-4 sm:-mx-6 px-4 sm:px-6">
            <table className="min-w-[600px] w-max text-xs">
              <thead>
                <tr className="bg-[#f8f9fc]">
                  <th className="sticky left-0 z-10 bg-[#f8f9fc] px-3 sm:px-4 py-3 text-left font-semibold text-gray-600 w-[80px] sm:w-[110px] whitespace-nowrap rounded-tl-[14px]">Day</th>
                  {slots.map((slot, idx) => (
                    <th key={slot.label} className="px-2 sm:px-3 py-3 text-center whitespace-nowrap">
                      <div className="font-semibold text-gray-700">{slot.label}</div>
                      <div className="text-[10px] text-gray-400 font-normal mt-0.5">P{idx + 1}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.map((day) => {
                  const daySessions = sessionsByDay[day] || [];
                  const dayRemovedSessions = removedByDay[day] || [];
                  // Track which slot indices are already covered by a spanning session
                  const skipSlots = new Set<number>();

                  return (
                    <tr key={day} className="border-t border-gray-100">
                      <td className="sticky left-0 z-10 px-3 sm:px-4 py-3 font-semibold text-gray-700 bg-[#fbfbfe] whitespace-nowrap">{day}</td>
                      {slots.map((slot, slotIdx) => {
                        // This slot is already covered by a previous session's colSpan
                        if (skipSlots.has(slotIdx)) return null;

                        const slotStart = toMinutes(slot.start);
                        const slotEnd = toMinutes(slot.end);

                        const slotSessions = daySessions.filter((s) => {
                          const start = normalizeTime(s.startTime);
                          if (!start) return false;
                          const sm = toMinutes(start);
                          return sm >= slotStart && sm < slotEnd;
                        });
                        const slotRemoved = dayRemovedSessions.filter((s) => {
                          const start = normalizeTime(s.startTime);
                          if (!start) return false;
                          const sm = toMinutes(start);
                          return sm >= slotStart && sm < slotEnd;
                        });
                        const hasContent = slotSessions.length > 0 || slotRemoved.length > 0;

                        // Calculate colSpan based on the longest session ending in this group
                        let colSpan = 1;
                        if (hasContent) {
                          const allSlotItems = [...slotSessions, ...slotRemoved];
                          const maxEndMin = Math.max(
                            ...allSlotItems.map((s) => toMinutes(normalizeTime(s.endTime)))
                          );
                          let span = 1;
                          for (let i = slotIdx + 1; i < slots.length; i++) {
                            const nextSlotEnd = toMinutes(slots[i].end);
                            if (nextSlotEnd <= maxEndMin) {
                              span++;
                              skipSlots.add(i);
                            } else {
                              break;
                            }
                          }
                          colSpan = span;
                        }

                        return (
                          <td
                            key={`${day}-${slot.label}`}
                            colSpan={colSpan}
                            className="px-2 py-2 align-top"
                          >
                            {!hasContent ? (
                              <div className="text-center text-gray-300">•</div>
                            ) : (
                              <div className="flex flex-col gap-1">
                                {/* Active draft sessions */}
                                {slotSessions.map((s) => {
                                  const sessionType = normalizeType(s.type);
                                  const colorClass = getSessionColor(sessionType);
                                  const badgeClass = getSessionBadge(sessionType);
                                  return (
                                    <div key={s.sessionId} className={cn("relative group rounded-[10px] border px-2 py-1.5 text-[11px] leading-tight flex flex-col gap-0.5", colorClass)}>
                                      <div className="font-bold truncate max-w-[120px]">{s.courseName || getCourseNameById(s.courseOfferingId)}</div>
                                      <span className={cn("inline-block self-start px-1.5 py-0.5 rounded-full text-[10px] font-semibold", badgeClass)}>{sessionType}</span>
                                      {s.buildingName && (
                                        <div className="text-[10px] opacity-70 truncate max-w-[120px]">{s.buildingName}{s.roomNumber != null ? ` · Room ${s.roomNumber}` : ""}</div>
                                      )}
                                      {s.instructorName && (
                                        <div className="text-[10px] opacity-60 truncate max-w-[120px]">{s.instructorName}</div>
                                      )}
                                      <div className="text-[10px] opacity-60 mt-0.5">{normalizeTime(s.startTime)} – {normalizeTime(s.endTime)}</div>
                                      {/* X button — removes the whole course offering from draft */}
                                      <button
                                        onClick={() => handleRemoveCourseOfferingFromDraft(s.courseOfferingId)}
                                        disabled={isSaving}
                                        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:opacity-50"
                                        title="Remove from enrollment"
                                      >
                                        <X className="w-2.5 h-2.5" />
                                      </button>
                                    </div>
                                  );
                                })}
                                {/* Ghost sessions — removed from draft, can be restored */}
                                {slotRemoved.map((s) => (
                                  <div key={`ghost-${s.sessionId}`} className="relative group rounded-[10px] border border-dashed border-gray-300 bg-gray-50 px-2 py-1.5 text-[11px] leading-tight flex flex-col gap-0.5 opacity-50">
                                    <div className="font-bold truncate max-w-[120px] text-gray-500 line-through">{getCourseNameById(s.courseOfferingId)}</div>
                                    <div className="text-gray-400">{s.type}</div>
                                    <div className="text-[10px] text-gray-400">{normalizeTime(s.startTime)} – {normalizeTime(s.endTime)}</div>
                                    <button
                                      onClick={() => handleRestoreCourseOffering(s.courseOfferingId)}
                                      disabled={isSaving}
                                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-green-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:opacity-50"
                                      title="Restore to enrollment"
                                    >
                                      <Plus className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
