"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStaffContext } from "@/hooks/useStaffContext";
import {
  staffScheduleService,
  type InstructorSession,
} from "@/services/staffScheduleServices";

/* ─────────────────────────────────────────────
   Constants
───────────────────────────────────────────── */
const DAYS = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

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

/* ─────────────────────────────────────────────
   Utilities  (same helpers used in the college schedule page)
───────────────────────────────────────────── */
const normalizeTime = (value?: string) => {
  if (!value) return "";
  if (value.includes("T")) {
    const timePart = value.split("T")[1];
    return timePart?.slice(0, 5) ?? "";
  }
  return value.length >= 5 ? value.slice(0, 5) : value;
};

const toMinutes = (value: string) => {
  const parts = value.split(":");
  return Number(parts[0] ?? 0) * 60 + Number(parts[1] ?? 0);
};

const fromMinutes = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

/** Build 1-hour slots covering 08:00 → 20:00 */
const buildDefaultSlots = () => {
  const slots: { start: string; end: string; label: string }[] = [];
  for (let t = 8 * 60; t < 20 * 60; t += 60) {
    const start = fromMinutes(t);
    const end = fromMinutes(t + 60);
    slots.push({ start, end, label: `${start}-${end}` });
  }
  return slots;
};

/** Derive slots dynamically from session times so every session fits */
const buildSlotsFromSessions = (
  sessions: InstructorSession[]
): { start: string; end: string; label: string }[] => {
  if (sessions.length === 0) return buildDefaultSlots();

  const allMins = new Set<number>();
  sessions.forEach((s) => {
    const start = toMinutes(normalizeTime(s.startTime));
    const end = toMinutes(normalizeTime(s.endTime));
    if (start) allMins.add(start);
    if (end) allMins.add(end);
  });

  const minStart = Math.min(...allMins);
  const maxEnd = Math.max(...allMins);

  // Determine slot duration (GCD of session lengths, capped to 60 min)
  const durations = sessions.map((s) =>
    Math.abs(
      toMinutes(normalizeTime(s.endTime)) -
        toMinutes(normalizeTime(s.startTime))
    )
  );
  const uniqueDurations = [...new Set(durations.filter((d) => d > 0))];
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const slotDuration =
    uniqueDurations.length > 0
      ? uniqueDurations.reduce(gcd)
      : 60;
  const duration = Math.min(Math.max(slotDuration, 30), 120);

  const slots: { start: string; end: string; label: string }[] = [];
  for (let t = minStart; t < maxEnd; t += duration) {
    const start = fromMinutes(t);
    const end = fromMinutes(Math.min(t + duration, maxEnd));
    slots.push({ start, end, label: `${start}-${end}` });
  }
  return slots;
};

const DOTNET_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const DAY_NAME_MAP: Record<string, string> = {
  sunday: "Sunday", sun: "Sunday",
  monday: "Monday", mon: "Monday",
  tuesday: "Tuesday", tue: "Tuesday", tues: "Tuesday",
  wednesday: "Wednesday", wed: "Wednesday",
  thursday: "Thursday", thu: "Thursday", thurs: "Thursday",
  friday: "Friday", fri: "Friday",
  saturday: "Saturday", sat: "Saturday",
};

const normalizeDayName = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return DOTNET_DAYS[value] || String(value);
  const text = String(value).trim();
  if (!text) return "";
  const cleaned = text.includes(".") ? text.split(".").pop() ?? text : text;
  const lower = cleaned.toLowerCase();
  if (DAY_NAME_MAP[lower]) return DAY_NAME_MAP[lower];
  const asNumber = Number(cleaned);
  if (!Number.isNaN(asNumber) && text !== "")
    return DOTNET_DAYS[asNumber] || text;
  return cleaned;
};

const SESSION_TYPE_MAP: Record<string, string> = {
  "1": "Lecture", "2": "Section", "3": "Lab",
  lecture: "Lecture", section: "Section", lab: "Lab",
};

const normalizeSessionType = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  const text = String(value).trim();
  if (!text) return "";
  return SESSION_TYPE_MAP[text] ?? SESSION_TYPE_MAP[text.toLowerCase()] ?? text;
};

/* ─────────────────────────────────────────────
   Page Component
───────────────────────────────────────────── */
export default function StaffSchedulePage() {
  const { selectedProgramId } = useStaffContext();

  const [sessions, setSessions] = useState<InstructorSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  /* ── Fetch sessions ── */
  useEffect(() => {
    if (!selectedProgramId) {
      setSessions([]);
      return;
    }
    let cancelled = false;
    const fetchSessions = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await staffScheduleService.getInstructorSessions(
          selectedProgramId
        );
        if (!cancelled) {
          // Normalize day + type for consistent rendering
          const normalized = data.map((s) => ({
            ...s,
            day: normalizeDayName(s.day),
            type: normalizeSessionType(s.type),
          }));
          setSessions(normalized);
        }
      } catch (err) {
        console.error("Failed to fetch instructor sessions:", err);
        if (!cancelled) setError("Failed to load schedule. Please try again.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchSessions();
    return () => { cancelled = true; };
  }, [selectedProgramId]);

  /* ── Build slots dynamically from session times ── */
  const slots = useMemo(() => buildSlotsFromSessions(sessions), [sessions]);

  /* ── Group sessions by day, sorted by start time ── */
  const sessionsByDay = useMemo(() => {
    const map: Record<string, InstructorSession[]> = {};
    DAYS.forEach((d) => (map[d] = []));
    sessions.forEach((s) => {
      const day = s.day;
      if (!map[day]) map[day] = [];
      map[day].push(s);
    });
    Object.keys(map).forEach((day) => {
      map[day].sort(
        (a, b) =>
          toMinutes(normalizeTime(a.startTime)) -
          toMinutes(normalizeTime(b.startTime))
      );
    });
    return map;
  }, [sessions]);

  /* ── Summary stats ── */
  const stats = useMemo(() => {
    const totalHours = sessions.reduce((acc, s) => {
      const start = toMinutes(normalizeTime(s.startTime));
      const end = toMinutes(normalizeTime(s.endTime));
      return acc + (end - start) / 60;
    }, 0);
    const activeDays = DAYS.filter(
      (d) => (sessionsByDay[d]?.length ?? 0) > 0
    ).length;
    const types = [...new Set(sessions.map((s) => s.type))];
    return { totalSessions: sessions.length, totalHours, activeDays, types };
  }, [sessions, sessionsByDay]);

  const isMissingContext = !selectedProgramId;

  return (
    <div className="w-full h-full flex flex-col gap-6 font-inter pb-8">

      {/* ── Header Card ── */}
      <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0]">

        {/* Title + badge row */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <CalendarDays className="w-5 h-5 text-blue-600" strokeWidth={1.8} />
              </div>
              <h1 className="text-xl font-bold text-gray-900">My Schedule</h1>
            </div>
            <p className="text-sm text-gray-500 ml-11">
              Your weekly teaching timetable for the selected program.
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {Object.entries(SESSION_BADGES).map(([type, cls]) => (
              <span
                key={type}
                className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${cls}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                {type}
              </span>
            ))}
          </div>
        </div>

        {/* Stats row */}
        {sessions.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: "Sessions", value: stats.totalSessions },
              { label: "Teaching Hours", value: `${stats.totalHours}h` },
              { label: "Active Days", value: stats.activeDays },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center justify-center bg-[#f8f9fc] rounded-[14px] py-3 px-4 border border-gray-100"
              >
                <span className="text-xl font-bold text-gray-900">{stat.value}</span>
                <span className="text-[11px] text-gray-500 font-medium mt-0.5">{stat.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Alerts ── */}
        {isMissingContext && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-sm px-4 py-3">
            Please select a <strong>Program</strong> from the sidebar to view your schedule.
          </div>
        )}

        {!isMissingContext && !isLoading && !error && sessions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
            <BookOpen className="w-10 h-10 opacity-40" strokeWidth={1.3} />
            <p className="text-sm font-medium">No sessions found for this program.</p>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-12 gap-3 text-gray-400">
            <svg
              className="animate-spin w-5 h-5 text-blue-500"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            <span className="text-sm">Loading schedule…</span>
          </div>
        )}

        {/* ── Timetable ── */}
        {!isLoading && !error && sessions.length > 0 && (
          <div className="overflow-x-auto overflow-y-hidden border border-gray-100 rounded-[18px] custom-scrollbar">
            <table className="min-w-[960px] w-max text-xs">
              <thead>
                <tr className="bg-[#f8f9fc]">
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 w-[120px] rounded-tl-[18px]">
                    Day
                  </th>
                  {slots.map((slot, idx) => (
                    <th
                      key={slot.label}
                      className="px-3 py-3 text-center whitespace-nowrap"
                    >
                      <div className="font-semibold text-gray-700">{slot.label}</div>
                      <div className="text-[10px] text-gray-400 font-normal mt-0.5">
                        P{idx + 1}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.map((day) => {
                  const daySessions = sessionsByDay[day] ?? [];
                  const skipSlots = new Set<number>();

                  return (
                    <tr key={day} className="border-t border-gray-100">
                      {/* Day label */}
                      <td
                        className={cn(
                          "px-4 py-3 font-semibold text-gray-700 bg-[#fbfbfe]",
                          daySessions.length > 0 && "text-blue-700"
                        )}
                      >
                        {day}
                        {daySessions.length > 0 && (
                          <span className="ml-1.5 text-[9px] font-bold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
                            {daySessions.length}
                          </span>
                        )}
                      </td>

                      {/* Slot cells */}
                      {slots.map((slot, slotIdx) => {
                        if (skipSlots.has(slotIdx)) return null;

                        const slotStart = toMinutes(slot.start);
                        const slotEnd = toMinutes(slot.end);

                        /* Sessions whose startTime falls in this slot */
                        const slotSessions = daySessions.filter((session) => {
                          const start = normalizeTime(session.startTime);
                          if (!start) return false;
                          const startMin = toMinutes(start);
                          return startMin >= slotStart && startMin < slotEnd;
                        });

                        /* Calculate colSpan based on the longest session ending */
                        let colSpan = 1;
                        if (slotSessions.length > 0) {
                          const maxEndMin = Math.max(
                            ...slotSessions.map((s) =>
                              toMinutes(normalizeTime(s.endTime))
                            )
                          );
                          let span = 1;
                          for (let i = slotIdx + 1; i < slots.length; i++) {
                            if (toMinutes(slots[i].end) <= maxEndMin) {
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
                            {slotSessions.length === 0 ? (
                              <div className="text-center text-gray-200">•</div>
                            ) : (
                              <div className="flex flex-col gap-1">
                                {slotSessions.map((session) => (
                                  <div
                                    key={session.id}
                                    className={cn(
                                      "rounded-[10px] border px-2 py-1.5 text-[11px] leading-tight flex flex-col gap-0.5",
                                      getSessionColor(session.type)
                                    )}
                                  >
                                    {/* Type + time badge */}
                                    <div className="font-bold">{session.type}</div>
                                    <span
                                      className={cn(
                                        "inline-block self-start px-1.5 py-0.5 rounded-full text-[10px] font-semibold",
                                        getSessionBadge(session.type)
                                      )}
                                    >
                                      {normalizeTime(session.startTime)} –{" "}
                                      {normalizeTime(session.endTime)}
                                    </span>

                                    {/* Room + Group */}
                                    <div className="flex flex-col text-[10px] text-gray-500 mt-0.5">
                                      <span>{session.roomName || "—"}</span>
                                      {session.groupNumber > 0 && (
                                        <span className="font-medium">
                                          Group {session.groupNumber}
                                        </span>
                                      )}
                                    </div>
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
        )}
      </div>
    </div>
  );
}
