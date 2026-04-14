"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { useAcademicContext } from '@/hooks/useAcademicContext';
import axiosInstance from '@/lib/axios';
import { cn } from '@/lib/utils';
import {
  AcademicLevel,
  levelService,
} from '@/services/levelsServices';

type ScheduleDefinition = {
  dayStartTime: string;
  dayEndTime: string;
  slotDurationMinutes: number;
};

type CourseOffering = {
  id: string;
  name: string;
  code?: string;
  numberOfGroups?: number;
};

type TeachingSession = {
  id: string;
  startTime: string;
  endTime: string;
  type: string;
  day: string;
  instructorId: string;
  instructorName?: string;
  roomId: string;
  roomName?: string;
  groupNumber: number;
};

type StaffMember = {
  id: string;
  name: string;
  role?: string;
  userName?: string;
};

type Room = {
  id: string;
  name: string;
  roomNumber?: string;
  type?: string;
  capacity?: number;
  buildingId?: string;
};

type Building = {
  id: string;
  name: string;
};

const COLLEGE_ID = "019c1ea6-1738-71cb-8cfd-a90e126d177e";
const DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const normalizeTime = (value?: string) => {
  if (!value) return "";
  if (value.includes("T")) {
    const timePart = value.split("T")[1];
    return timePart?.slice(0, 5) || "";
  }
  return value.length >= 5 ? value.slice(0, 5) : value;
};

const toMinutes = (value: string) => {
  const parts = value.split(":");
  const h = Number(parts[0] || 0);
  const m = Number(parts[1] || 0);
  return h * 60 + m;
};

const fromMinutes = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const buildSlots = (start?: string, end?: string, duration?: number) => {
  if (!start || !end || !duration) return [];
  const startMin = toMinutes(start);
  const endMin = toMinutes(end);
  const slots = [];
  for (let t = startMin; t < endMin; t += duration) {
    const slotStart = fromMinutes(t);
    const slotEnd = fromMinutes(Math.min(t + duration, endMin));
    slots.push({ start: slotStart, end: slotEnd, label: `${slotStart}-${slotEnd}` });
  }
  return slots;
};

const DOTNET_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_NAME_MAP: Record<string, string> = {
  sunday: "Sunday",
  sun: "Sunday",
  monday: "Monday",
  mon: "Monday",
  tuesday: "Tuesday",
  tue: "Tuesday",
  tues: "Tuesday",
  wednesday: "Wednesday",
  wed: "Wednesday",
  thursday: "Thursday",
  thu: "Thursday",
  thurs: "Thursday",
  friday: "Friday",
  fri: "Friday",
  saturday: "Saturday",
  sat: "Saturday",
};

const normalizeDayName = (value: unknown) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return DOTNET_DAYS[value] || String(value);
  const text = String(value).trim();
  if (!text) return "";
  const cleaned = text.includes(".") ? text.split(".").pop() || text : text;
  const lower = cleaned.toLowerCase();
  if (DAY_NAME_MAP[lower]) return DAY_NAME_MAP[lower];
  const asNumber = Number(cleaned);
  if (!Number.isNaN(asNumber) && text !== "") {
    return DOTNET_DAYS[asNumber] || text;
  }
  return cleaned;
};

const SESSION_TYPE_MAP: Record<string, string> = {
  "1": "Lecture",
  "2": "Section",
  "3": "Lab",
  lecture: "Lecture",
  section: "Section",
  lab: "Lab",
};

const normalizeSessionType = (value: unknown) => {
  if (value === null || value === undefined) return "";
  const text = String(value).trim();
  if (!text) return "";
  const mapped = SESSION_TYPE_MAP[text] ?? SESSION_TYPE_MAP[text.toLowerCase()];
  return mapped ?? text;
};

const normalizeScheduleDefinition = (data: any): ScheduleDefinition | null => {
  if (!data) return null;
  const dayStartTime = data.dayStartTime ?? data.DayStartTime ?? "";
  const dayEndTime = data.dayEndTime ?? data.DayEndTime ?? "";
  const slotDurationMinutes =
    data.slotDurationMinutes ?? data.SlotDurationMinutes ?? data.slotDuration ?? data.SlotDuration;

  if (!dayStartTime && !dayEndTime && !slotDurationMinutes) return null;

  return {
    dayStartTime,
    dayEndTime,
    slotDurationMinutes: Number(slotDurationMinutes || 0),
  };
};

const normalizeTeachingSession = (item: any): TeachingSession => ({
  id: item.id ?? item.Id ?? item.sessionId ?? item.SessionId ?? "",
  startTime: item.startTime ?? item.StartTime ?? item.from ?? item.From ?? "",
  endTime: item.endTime ?? item.EndTime ?? item.to ?? item.To ?? "",
  type: normalizeSessionType(item.type ?? item.Type ?? item.sessionType ?? item.SessionType),
  day: normalizeDayName(item.day ?? item.Day ?? item.dayOfWeek ?? item.DayOfWeek),
  instructorId:
    item.instructorId ??
    item.InstructorId ??
    item.instructor?.id ??
    item.Instructor?.id ??
    "",
  instructorName:
    item.instructorName ??
    item.InstructorName ??
    item.instructor?.name ??
    item.Instructor?.name ??
    "",
  roomId: item.roomId ?? item.RoomId ?? item.room?.id ?? item.Room?.id ?? "",
  roomName: item.roomName ?? item.RoomName ?? item.room?.name ?? item.Room?.name ?? "",
  groupNumber: Number(item.groupNumber ?? item.GroupNumber ?? item.group ?? item.Group ?? 0) || 0,
});

export default function SchedulePage() {
  const { selectedProgramId, selectedSemesterId } = useAcademicContext();

  const [levels, setLevels] = useState<AcademicLevel[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState<string>("");

  const [scheduleDefinition, setScheduleDefinition] = useState<ScheduleDefinition | null>(null);
  const [courseOfferings, setCourseOfferings] = useState<CourseOffering[]>([]);
  const [selectedCourseOfferingId, setSelectedCourseOfferingId] = useState<string>("");
  const [selectedGroupNumber, setSelectedGroupNumber] = useState<number>(1);

  const [sessions, setSessions] = useState<TeachingSession[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("");
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isLoadingOfferings, setIsLoadingOfferings] = useState(false);
  const [isSavingSession, setIsSavingSession] = useState(false);
  const [saveError, setSaveError] = useState<string>("");

  const [periodForm, setPeriodForm] = useState({
    day: "",
    startTime: "",
    endTime: "",
    type: "Lecture",
    instructorId: "",
    roomId: "",
    capacity: "",
  });

  const isMissingContext = useMemo(
    () => !selectedProgramId || !selectedSemesterId,
    [selectedProgramId, selectedSemesterId]
  );

  const slotDuration = Number(scheduleDefinition?.slotDurationMinutes) || 60;
  const slots = useMemo(
    () =>
      buildSlots(
        normalizeTime(scheduleDefinition?.dayStartTime),
        normalizeTime(scheduleDefinition?.dayEndTime),
        slotDuration
      ),
    [scheduleDefinition, slotDuration]
  );

  const groupNumbers = useMemo(() => {
    if (!selectedCourseOfferingId) return [];
    const selectedCourse = courseOfferings.find((c) => c.id === selectedCourseOfferingId);
    if (!selectedCourse) return [];
    const count = Number(selectedCourse.numberOfGroups || 1);
    return Array.from({ length: Math.max(count, 1) }, (_, i) => i + 1);
  }, [courseOfferings, selectedCourseOfferingId]);

  const fetchLevels = async () => {
    if (!selectedProgramId) return;
    try {
      const res = await levelService.getAllLevels(selectedProgramId, {
        PageNumber: 1,
        PageSize: 1000,
      });
      const items = Array.isArray(res.items) ? res.items : [];
      setLevels(items);
      if (!selectedLevelId && items.length > 0) {
        setSelectedLevelId(items[0].id);
      }
    } catch (error) {
      toast.error("Failed to load levels.");
      console.error(error);
    }
  };

  const fetchScheduleDefinition = async () => {
    if (isMissingContext) return;
    try {
      const res = await axiosInstance.get(
        `/programs/${selectedProgramId}/semesters/${selectedSemesterId}/schedule`
      );
      const raw = res.data?.data ?? res.data?.item ?? res.data;
      const data = normalizeScheduleDefinition(raw);
      setScheduleDefinition(data);
    } catch (error) {
      setScheduleDefinition(null);
      console.error(error);
    }
  };

  const fetchCourseOfferings = async () => {
    if (isMissingContext || !selectedLevelId) return;
    setIsLoadingOfferings(true);
    try {
      const res = await axiosInstance.get(`/programs/${selectedProgramId}/course-offerings`, {
        params: {
          levelId: selectedLevelId,
          semesterId: selectedSemesterId,
        },
        // Avoid sending a JSON Content-Type header on GET if the API rejects it.
        headers: {
          "Content-Type": undefined,
        },
      });
      const data = res.data?.items || res.data?.data || res.data || [];
      const items: CourseOffering[] = Array.isArray(data)
        ? data.map((c: any) => ({
          id:
            c.id ||
            c.Id ||
            c.courseOfferingId ||
            c.courseOfferingID ||
            c.courseOfferingGuid ||
            c.courseId ||
            c.CourseId ||
            c.courseOffering?.id,
          name: c.name || c.Name || c.courseName || c.CourseName || "Unnamed",
          code: c.code || c.Code,
          numberOfGroups: c.numberOfGroups || c.NumberOfGroups || 1,
        }))
        : [];
      setCourseOfferings(items);
      if (items.length > 0) {
        setSelectedCourseOfferingId((prev) =>
          prev && items.some((c) => c.id === prev) ? prev : items[0].id
        );
      } else {
        setSelectedCourseOfferingId("");
      }
    } catch (error) {
      toast.error("Failed to load courses.");
      console.error(error);
    } finally {
      setIsLoadingOfferings(false);
    }
  };

  const fetchSessions = async () => {
    if (!selectedCourseOfferingId) return;
    setIsLoadingSessions(true);
    try {
      const res = await axiosInstance.get("/teaching-sessions", {
        params: {
          courseOfferingId: selectedCourseOfferingId,
          groupNumber: selectedGroupNumber,
        },
      });
      const data = res.data?.items ?? res.data?.data ?? res.data ?? [];
      const items = Array.isArray(data) ? data : [];
      setSessions(items.map(normalizeTeachingSession));
    } catch (error) {
      toast.error("Failed to load sessions.");
      console.error(error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await axiosInstance.get(`/colleges/${COLLEGE_ID}/stuff`, {
        params: {
          PageNumber: 1,
          PageSize: 1000,
        },
      });
      const items = res.data?.items || res.data?.data || res.data || [];
      setStaff(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchRooms = async () => {
    if (!selectedBuildingId) {
      setRooms([]);
      return;
    }
    setIsLoadingRooms(true);
    setRooms([]);
    try {
      const url = `/buildings/${selectedBuildingId}/rooms/all?PageNumber=1&PageSize=1000`;
      const res = await axiosInstance.get(url);
      const items = res.data?.items || res.data?.data || res.data || [];
      setRooms(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error(error);
      setRooms([]);
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const fetchBuildings = async () => {
    try {
      const res = await axiosInstance.get(`/Building/all`);
      const items = res.data?.items || [];
      setBuildings(Array.isArray(items) ? items : []);
      if (!selectedBuildingId && Array.isArray(items) && items.length > 0) {
        setSelectedBuildingId(items[0].id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchStaff();
    fetchBuildings();
  }, []);

  useEffect(() => {
    fetchLevels();
  }, [selectedProgramId]);

  useEffect(() => {
    fetchRooms();
  }, [selectedBuildingId]);

  useEffect(() => {
    fetchScheduleDefinition();
  }, [selectedProgramId, selectedSemesterId]);

  useEffect(() => {
    fetchCourseOfferings();
  }, [selectedProgramId, selectedSemesterId, selectedLevelId]);

  useEffect(() => {
    setCourseOfferings([]);
    setSelectedCourseOfferingId("");
    setSelectedGroupNumber(1);
    setSessions([]);
  }, [selectedProgramId, selectedSemesterId, selectedLevelId]);

  useEffect(() => {
    if (groupNumbers.length > 0 && !groupNumbers.includes(selectedGroupNumber)) {
      setSelectedGroupNumber(groupNumbers[0]);
    }
  }, [groupNumbers, selectedGroupNumber]);

  useEffect(() => {
    if (!selectedCourseOfferingId) {
      setSessions([]);
      return;
    }
    setSelectedGroupNumber(1);
  }, [selectedCourseOfferingId]);

  useEffect(() => {
    fetchSessions();
  }, [selectedCourseOfferingId, selectedGroupNumber]);

  const openModal = () => {
    const firstSlot = slots[0];
    const secondSlot = slots[1];
    setPeriodForm({
      day: DAYS[0] || "",
      startTime: firstSlot?.start || "",
      endTime: secondSlot?.end || firstSlot?.end || "",
      type: "Lecture",
      instructorId: "",
      roomId: "",
      capacity: "",
    });
    setSaveError("");
    if (!selectedBuildingId && buildings.length > 0) {
      setSelectedBuildingId(buildings[0].id);
    }
    setIsModalOpen(true);
  };

  const handleSaveSession = async () => {
    setSaveError("");
    if (!selectedCourseOfferingId) {
      setSaveError("Please select a course first.");
      toast.warning("Select a course first.");
      return;
    }
    if (
      !periodForm.day ||
      !periodForm.startTime ||
      !periodForm.endTime ||
      !periodForm.type ||
      !periodForm.instructorId ||
      !periodForm.roomId
    ) {
      setSaveError("Please fill all required fields.");
      toast.warning("Please fill all required fields.");
      return;
    }
    setIsSavingSession(true);
    try {
      const sessionTypeMap: Record<string, number> = {
        Lecture: 1,
        Section: 2,
        Lab: 3,
      };
      const payload: any = {
        startTime: periodForm.startTime,
        endTime: periodForm.endTime,
        type: sessionTypeMap[periodForm.type] ?? periodForm.type,
        day: periodForm.day,
        instructorId: periodForm.instructorId,
        roomId: periodForm.roomId,
      };
      if (periodForm.capacity) {
        payload.capacity = Number(periodForm.capacity);
      }
      console.log("Saving session payload:", payload);
      await axiosInstance.post("/teaching-sessions", payload, {
        params: {
          courseOfferingId: selectedCourseOfferingId,
          groupNumber: selectedGroupNumber,
        },
      });
      toast.success("Session added.");
      setIsModalOpen(false);
      fetchSessions();
    } catch (error: any) {
      const message =
        error?.response?.data?.title ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to add session.";
      setSaveError(message);
      toast.error(message);
      console.error(error);
    } finally {
      setIsSavingSession(false);
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (!confirm("Delete this session?")) return;
    try {
      await axiosInstance.delete(`/teaching-sessions/${id}`, {
        params: selectedCourseOfferingId ? { courseOfferingId: selectedCourseOfferingId } : {},
      });
      toast.success("Session deleted.");
      fetchSessions();
    } catch (error) {
      toast.error("Failed to delete session.");
      console.error(error);
    }
  };

  const sessionsByDay = useMemo(() => {
    const map: Record<string, TeachingSession[]> = {};
    DAYS.forEach((d) => (map[d] = []));
    sessions.forEach((s) => {
      if (!map[s.day]) map[s.day] = [];
      map[s.day].push(s);
    });
    Object.keys(map).forEach((day) => {
      map[day].sort((a, b) => toMinutes(normalizeTime(a.startTime)) - toMinutes(normalizeTime(b.startTime)));
    });
    return map;
  }, [sessions]);

  const filteredRooms = useMemo(() => {
    if (!selectedBuildingId) return rooms;
    const hasBuildingId = rooms.some((r) => r.buildingId);
    return hasBuildingId ? rooms.filter((r) => r.buildingId === selectedBuildingId) : rooms;
  }, [rooms, selectedBuildingId]);

  return (
    <div className="w-full h-full flex flex-col gap-6 font-inter pb-8">
      <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0]">
        <div className="flex flex-col gap-2 mb-4">
          <h1 className="text-xl font-bold text-gray-900">Schedule</h1>
          <p className="text-sm text-gray-500">
            Select level and course, then manage sessions per group.
          </p>
        </div>

        <div className="flex flex-col md:flex-row md:items-end gap-3 mb-5">
          <div className="flex-1 flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-500">Level</span>
            <select
              value={selectedLevelId}
              onChange={(e) => setSelectedLevelId(e.target.value)}
              className="w-full h-11 px-3 rounded-[10px] border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="">Select level</option>
              {levels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={openModal}
            className="flex h-11 items-center justify-center gap-2 px-4 rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors cursor-pointer md:self-end"
          >
            <Plus className="w-4 h-4" />
            Add Period
          </button>
        </div>

        {isMissingContext && (
          <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-sm px-4 py-3">
            Please select Program, Year, and Term from the sidebar first.
          </div>
        )}

        {!scheduleDefinition && !isMissingContext && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">
            Schedule definition is missing. Please configure Definition of Periods first.
          </div>
        )}

        <div className="mb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-2">
            Courses
            {isLoadingOfferings && <span className="text-gray-400">Loading…</span>}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
            {courseOfferings.length === 0 && (
              <div className="text-sm text-gray-400">No course found.</div>
            )}
            {courseOfferings.map((course) => (
              <button
                key={course.id}
                onClick={() => setSelectedCourseOfferingId(course.id)}
                className={cn(
                  "px-4 py-2 rounded-[10px] text-xs font-semibold border transition-colors transition-transform duration-150 active:scale-95 active:translate-y-px whitespace-nowrap cursor-pointer",
                  selectedCourseOfferingId === course.id
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-[#f8f9fc] text-gray-600 border-gray-200 hover:bg-gray-50"
                )}
              >
                {course.name}
              </button>
            ))}
          </div>
        </div>

        {groupNumbers.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            {groupNumbers.map((group) => (
              <button
                key={group}
                onClick={() => setSelectedGroupNumber(group)}
                className={cn(
                  "px-3 py-1.5 rounded-[8px] text-xs font-semibold border transition-colors transition-transform duration-150 active:scale-95 active:translate-y-px cursor-pointer",
                  selectedGroupNumber === group
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                )}
              >
                Group {group}
              </button>
            ))}
          </div>
        )}

        <div className="overflow-x-auto overflow-y-hidden border border-gray-100 rounded-[18px] custom-scrollbar">
          <table className="min-w-[960px] w-max text-xs">
            <thead className="bg-[#f8f9fc]">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 w-[120px]">Day</th>
                {slots.map((slot) => (
                  <th key={slot.label} className="px-3 py-3 text-center font-semibold text-gray-500">
                    {slot.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day) => {
                return (
                  <tr key={day} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-semibold text-gray-700 bg-[#fbfbfe]">{day}</td>
                    {slots.map((slot) => {
                      const daySessions = sessionsByDay[day] || [];
                      const slotStart = toMinutes(slot.start);
                      const slotEnd = toMinutes(slot.end);
                      const slotSessions = daySessions.filter((session) => {
                        const start = normalizeTime(session.startTime);
                        if (!start) return false;
                        const startMin = toMinutes(start);
                        return startMin >= slotStart && startMin < slotEnd;
                      });

                      return (
                        <td key={`${day}-${slot.label}`} className="px-2 py-2 align-top">
                          {slotSessions.length === 0 ? (
                            <div className="text-center text-gray-300">•</div>
                          ) : (
                            <div className="flex flex-col gap-1">
                              {slotSessions.map((session) => (
                                <div
                                  key={session.id}
                                  className={cn(
                                    "relative rounded-[10px] border px-2 py-1.5 text-[11px] leading-tight flex flex-col gap-0.5",
                                    session.type === "Lecture"
                                      ? "bg-blue-50 border-blue-200 text-blue-900"
                                      : session.type === "Section"
                                      ? "bg-amber-50 border-amber-200 text-amber-900"
                                      : "bg-purple-50 border-purple-200 text-purple-900"
                                  )}
                                >
                                  <div className="font-bold">{session.type}</div>
                                  <div className="text-[10px]">
                                    {normalizeTime(session.startTime)} - {normalizeTime(session.endTime)}
                                  </div>
                                  <div className="text-[10px] text-gray-600">
                                    {session.instructorName || "—"} · {session.roomName || "—"}
                                  </div>
                                  <button
                                    onClick={() => handleDeleteSession(session.id)}
                                    className="absolute top-1 right-1 p-1 text-gray-500 hover:text-red-600 cursor-pointer"
                                    title="Delete session"
                                  >
                                    <Trash2 className="w-3 h-3" />
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

        {isLoadingSessions && (
          <div className="text-center text-sm text-gray-400 mt-4">Loading sessions…</div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-[520px] mt-10 bg-white rounded-[18px] p-5 shadow-xl border border-gray-100 relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Period</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-[12px] font-bold text-gray-700">Period From</label>
                <input
                  type="time"
                  value={periodForm.startTime}
                  onChange={(e) => setPeriodForm({ ...periodForm, startTime: e.target.value })}
                  className="w-full h-11 mt-1 border border-gray-200 rounded-[10px] px-3 text-sm"
                />
              </div>
              <div>
                <label className="text-[12px] font-bold text-gray-700">To</label>
                <input
                  type="time"
                  value={periodForm.endTime}
                  onChange={(e) => setPeriodForm({ ...periodForm, endTime: e.target.value })}
                  className="w-full h-11 mt-1 border border-gray-200 rounded-[10px] px-3 text-sm"
                />
              </div>
              <div>
                <label className="text-[12px] font-bold text-gray-700">Day</label>
                <select
                  value={periodForm.day}
                  onChange={(e) => setPeriodForm({ ...periodForm, day: e.target.value })}
                  className="w-full h-11 mt-1 border border-gray-200 rounded-[10px] px-3 text-sm bg-white cursor-pointer"
                >
                  <option value="">Select Day</option>
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[12px] font-bold text-gray-700">Type</label>
                <select
                  value={periodForm.type}
                  onChange={(e) => setPeriodForm({ ...periodForm, type: e.target.value })}
                  className="w-full h-11 mt-1 border border-gray-200 rounded-[10px] px-3 text-sm bg-white cursor-pointer"
                >
                  <option value="Lecture">Lecture</option>
                  <option value="Section">Section</option>
                  <option value="Lab">Lab</option>
                </select>
              </div>
              <div>
                <label className="text-[12px] font-bold text-gray-700">Building</label>
                <select
                  value={selectedBuildingId}
                  onChange={(e) => {
                    setSelectedBuildingId(e.target.value);
                    setPeriodForm((prev) => ({ ...prev, roomId: "" }));
                  }}
                  className="w-full h-11 mt-1 border border-gray-200 rounded-[10px] px-3 text-sm bg-white cursor-pointer"
                >
                  <option value="">Select Building</option>
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[12px] font-bold text-gray-700">Room</label>
                <select
                  value={periodForm.roomId}
                  onChange={(e) => setPeriodForm({ ...periodForm, roomId: e.target.value })}
                  disabled={!selectedBuildingId || isLoadingRooms}
                  className="w-full h-11 mt-1 border border-gray-200 rounded-[10px] px-3 text-sm bg-white cursor-pointer disabled:opacity-60"
                >
                  <option value="">
                    {isLoadingRooms ? "Loading rooms..." : "Select Room"}
                  </option>
                  {filteredRooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name || r.roomNumber}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[12px] font-bold text-gray-700">Instructor</label>
                <select
                  value={periodForm.instructorId}
                  onChange={(e) => setPeriodForm({ ...periodForm, instructorId: e.target.value })}
                  className="w-full h-11 mt-1 border border-gray-200 rounded-[10px] px-3 text-sm bg-white cursor-pointer"
                >
                  <option value="">Select Instructor</option>
                  {staff.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[12px] font-bold text-gray-700">Capacity</label>
                <input
                  type="number"
                  value={periodForm.capacity}
                  onChange={(e) => setPeriodForm({ ...periodForm, capacity: e.target.value })}
                  className="w-full h-11 mt-1 border border-gray-200 rounded-[10px] px-3 text-sm"
                  placeholder="Optional"
                />
              </div>
            </div>

            <button
              onClick={handleSaveSession}
              disabled={isSavingSession}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-[10px] text-sm font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSavingSession ? "Saving…" : "Save"}
            </button>
            {saveError && (
              <div className="mt-2 text-sm text-red-600 text-center">{saveError}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
