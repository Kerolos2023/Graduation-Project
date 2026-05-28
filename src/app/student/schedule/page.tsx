"use client";

import { useEffect, useState, useMemo } from "react";
import { studentScheduleService } from "@/services/studentScheduleServices";
import { cn } from "@/lib/utils";

type StudentSession = {
  sessionId: string;
  courseOfferingId: string;
  courseName?: string;
  instructorName?: string;
  buildingName?: string;
  roomNumber?: number;
  groupNumber?: number;
  type?: string;
  startTime: string;
  endTime: string;
  dayOfWeek: string;
};

type Session = {
  sessionId: string;
  courseOfferingId: string;
  courseName: string;
  instructorName: string;
  buildingName: string;
  roomNumber: number;
  groupNumber: number;
  type: string;
  startTime: string;
  endTime: string;
  dayOfWeek: string;
};

const DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const slots = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
];

const typeStyles: Record<string, string> = {
  Lecture: "bg-blue-50 border-blue-200 text-blue-700",
  Section: "bg-yellow-50 border-yellow-200 text-yellow-700",
  Lab: "bg-purple-50 border-purple-200 text-purple-700",
};

const toMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const getSlotIndex = (time: string) =>
  slots.findIndex((s) => s === time.slice(0, 5));

export default function SchedulePage() {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    studentScheduleService.getSchedule().then((data: StudentSession[]) => {
      const mapped: Session[] = data.map((s) => ({
        sessionId: s.sessionId,
        courseOfferingId: s.courseOfferingId,
        courseName: s.courseName ?? "N/A",
        instructorName: s.instructorName ?? "N/A",
        buildingName: s.buildingName ?? "N/A",
        roomNumber: s.roomNumber ?? 0,
        groupNumber: s.groupNumber ?? 0,
        type: s.type ?? "Lecture",
        startTime: s.startTime,
        endTime: s.endTime,
        dayOfWeek: s.dayOfWeek,
      }));

      setSessions(mapped);
    });
  }, []);

  const grouped = useMemo(() => {
    const map: Record<string, Session[]> = {};
    DAYS.forEach((d) => (map[d] = []));
    sessions.forEach((s) => map[s.dayOfWeek]?.push(s));
    return map;
  }, [sessions]);

  /** STATS */
  const stats = useMemo(() => {
    const activeDays = new Set(sessions.map((s) => s.dayOfWeek)).size;

    const hours =
      sessions.reduce((acc, s) => {
        return (
          acc +
          (toMinutes(s.endTime.slice(0, 5)) -
            toMinutes(s.startTime.slice(0, 5)))
        );
      }, 0) / 60;

    return {
      sessions: sessions.length,
      hours: hours.toFixed(0),
      activeDays,
    };
  }, [sessions]);

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
            My Schedule
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Your weekly timetable
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {Object.keys(typeStyles).map((t) => (
            <div
              key={t}
              className={cn(
                "px-3 py-1 rounded-full text-xs border",
                typeStyles[t]
              )}
            >
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl p-4 text-center">
          <div className="text-xl font-semibold">{stats.sessions}</div>
          <div className="text-xs text-gray-500">Sessions</div>
        </div>

        <div className="bg-white rounded-xl p-4 text-center">
          <div className="text-xl font-semibold">{stats.hours}h</div>
          <div className="text-xs text-gray-500">Hours</div>
        </div>

        <div className="bg-white rounded-xl p-4 text-center">
          <div className="text-xl font-semibold">{stats.activeDays}</div>
          <div className="text-xs text-gray-500">Active Days</div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm overflow-x-auto border">
        <div className="min-w-[900px]">

          {/* HEADER */}
          <div className="grid grid-cols-[120px_repeat(10,1fr)] bg-gray-50 border-b">
            <div className="p-3 text-sm font-medium">Day</div>

            {slots.slice(0, -1).map((h, i) => (
              <div key={i} className="p-3 text-center text-xs text-gray-500">
                {h} - {slots[i + 1]}
              </div>
            ))}
          </div>

          {/* DAYS */}
          {DAYS.map((day) => {
            const daySessions = grouped[day] || [];

            return (
              <div
                key={day}
                className="grid grid-cols-[120px_repeat(10,1fr)] border-b"
              >
                <div className="p-3 text-sm font-medium bg-gray-50">
                  {day}
                </div>

                {slots.slice(0, -1).map((slot, i) => {
                  const slotMin = toMinutes(slot);

                  const session = daySessions.find(
                    (s) =>
                      toMinutes(s.startTime.slice(0, 5)) === slotMin
                  );

                  if (!session) {
                    return (
                      <div
                        key={i}
                        className="border-l flex items-center justify-center text-gray-300 text-xs"
                      >
                        •
                      </div>
                    );
                  }

                  const startIndex = getSlotIndex(session.startTime.slice(0, 5));
                  const endIndex = getSlotIndex(session.endTime.slice(0, 5));

                  const span =
                    endIndex > startIndex ? endIndex - startIndex : 1;

                  return (
                    <div
                      key={session.sessionId}
                      className={cn(
                        "m-1 p-2 rounded-xl border text-[11px] shadow-sm col-span-1",
                        typeStyles[session.type]
                      )}
                      style={{ gridColumn: `span ${span}` }}
                    >
                      <div className="font-medium">{session.courseName}</div>
                      <div>{session.type}</div>
                      <div>
                        {session.startTime.slice(0, 5)} -{" "}
                        {session.endTime.slice(0, 5)}
                      </div>
                      <div>{session.buildingName}</div>
                      <div>Group {session.groupNumber}</div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}