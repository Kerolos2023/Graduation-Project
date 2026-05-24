"use client";

import { useEffect, useState, useMemo } from "react";
import { studentScheduleService } from "@/services/studentScheduleServices";
import { cn } from "@/lib/utils";

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

const DAYS = ["Saturday","Sunday","Monday","Tuesday","Wednesday","Thursday","Friday"];

const slots = [
  "08:00","09:00","10:00","11:00","12:00",
  "13:00","14:00","15:00","16:00","17:00","18:00"
];

const intervals = slots.slice(0, -1);

const toMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const typeStyles: Record<string, string> = {
  Lecture: "bg-blue-50 border-blue-200 text-blue-700",
  Section: "bg-yellow-50 border-yellow-200 text-yellow-700",
  Lab: "bg-purple-50 border-purple-200 text-purple-700",
};

export default function SchedulePage() {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    studentScheduleService.getSchedule().then(setSessions);
  }, []);

  const grouped = useMemo(() => {
    const map: Record<string, Session[]> = {};
    DAYS.forEach((d) => (map[d] = []));
    sessions.forEach((s) => map[s.dayOfWeek]?.push(s));
    return map;
  }, [sessions]);

  const stats = useMemo(() => {
    const activeDays = new Set(sessions.map(s => s.dayOfWeek)).size;

    const hours = sessions.reduce((acc, s) => {
      return acc + (toMinutes(s.endTime.slice(0,5)) - toMinutes(s.startTime.slice(0,5)));
    }, 0) / 60;

    return {
      sessions: sessions.length,
      hours: hours.toFixed(0),
      activeDays
    };
  }, [sessions]);

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">

      {/* HEADER (RESPONSIVE FIX) */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">

        {/* TITLE */}
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
            My Schedule
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Your weekly teaching timetable for the selected program.
          </p>
        </div>

        {/* LEGEND */}
        <div className="flex flex-wrap gap-2">
          {Object.keys(typeStyles).map((t) => (
            <div
              key={t}
              className={cn(
                "px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs border",
                typeStyles[t]
              )}
            >
              <span className="w-2 h-2 rounded-full inline-block mr-2 bg-current"></span>
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* STATS (RESPONSIVE GRID) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">

        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <div className="text-lg sm:text-xl font-semibold">{sessions.length}</div>
          <div className="text-xs text-gray-500">Sessions</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <div className="text-lg sm:text-xl font-semibold">{stats.hours}h</div>
          <div className="text-xs text-gray-500">Teaching Hours</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <div className="text-lg sm:text-xl font-semibold">{stats.activeDays}</div>
          <div className="text-xs text-gray-500">Active Days</div>
        </div>
      </div>

      {/* TABLE (UNCHANGED - ONLY SCROLL X) */}
      <div className="bg-white rounded-2xl shadow-sm overflow-x-auto border">
        <div className="min-w-[900px]">

          {/* HEADER */}
          <div className="grid grid-flow-col auto-cols-fr text-xs bg-gray-50 border-b">
            <div className="p-3 font-medium text-gray-600">Day</div>

            {slots.slice(0, -1).map((h, i) => (
              <div key={i} className="p-3 text-center text-gray-500">
                {h.slice(0,2)}:00 - {slots[i + 1].slice(0,2)}:00
              </div>
            ))}
          </div>

          {/* DAYS */}
          {DAYS.map((day) => {
            const daySessions = grouped[day] || [];

            return (
              <div key={day} className="grid grid-flow-col auto-cols-fr border-b last:border-none">

                <div className="p-3 text-sm font-medium text-gray-700 bg-gray-50 flex items-center">
                  {day}
                </div>

                {(() => {
                  const cells: any[] = [];
                  let i = 0;

                  while (i < intervals.length) {
                    const slotMin = toMinutes(slots[i]);

                    const session = daySessions.find(
                      (s) => toMinutes(s.startTime.slice(0,5)) === slotMin
                    );

                    if (!session) {
                      cells.push(
                        <div key={i} className="border-l h-full flex items-center justify-center text-gray-300 text-xs">
                          •
                        </div>
                      );
                      i++;
                      continue;
                    }

                    const start = toMinutes(session.startTime.slice(0,5));
                    const end = toMinutes(session.endTime.slice(0,5));

                    const span = slots.filter((s) => {
                      const m = toMinutes(s);
                      return m >= start && m < end;
                    }).length;

                    cells.push(
                      <div
                        key={session.sessionId}
                        className={cn(
                          "m-1 p-2 rounded-xl border text-[11px] shadow-sm",
                          typeStyles[session.type]
                        )}
                        style={{ gridColumn: `span ${span}` }}
                      >
                        <div>{session.courseName}</div>
                        <div>{session.type}</div>
                        <div>{session.startTime.slice(0,5)} - {session.endTime.slice(0,5)}</div>
                        <div>{session.buildingName}</div>
                        <div>Group {session.groupNumber}</div>
                      </div>
                    );

                    i += span;
                  }

                  return cells;
                })()}

              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}