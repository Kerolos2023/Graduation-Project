"use client";

import { useEffect, useState, useMemo } from "react";
import axiosInstance from "@/lib/axios";
import { cn } from "@/lib/utils";

type Session = {
  sessionId: string;
  courseOfferingId: string;
  type: string;
  startTime: string;
  endTime: string;
  dayOfWeek: string;
};

const DAYS = [
  "Saturday","Sunday","Monday","Tuesday","Wednesday","Thursday","Friday",
];

const slots = [
  "08:00","09:00","10:00","11:00","12:00",
  "13:00","14:00","15:00","16:00","17:00","18:00","19:00"
];

const toMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const colors = [
  "bg-blue-100",
  "bg-green-100",
  "bg-yellow-100",
  "bg-purple-100",
  "bg-pink-100",
];

const colorMap = new Map<string, string>();
const getColor = (id: string) => {
  if (colorMap.has(id)) return colorMap.get(id)!;
  const c = colors[colorMap.size % colors.length];
  colorMap.set(id, c);
  return c;
};

export default function SchedulePage() {
  const [sessions, setSessions] = useState<Session[]>([]);

  const collegeId = "019c1ea6-1738-71cb-8cfd-a90e126d177e";

  useEffect(() => {
    axiosInstance
      .get(`/colleges/${collegeId}/students/student-schedule`)
      .then((res) => setSessions(res.data || []));
  }, []);

  const grouped = useMemo(() => {
    const map: Record<string, Session[]> = {};
    DAYS.forEach((d) => (map[d] = []));
    sessions.forEach((s) => map[s.dayOfWeek]?.push(s));
    return map;
  }, [sessions]);

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h1 className="text-lg font-semibold mb-4">Schedule</h1>

      {/* ✅ التعديل الوحيد */}
      <div className="overflow-x-auto">
        <div className="min-w-[900px]">

          <div className="space-y-3">

            {/* HEADER */}
            <div className="grid grid-cols-13 bg-gray-100 rounded-xl text-xs">
              <div className="p-3 font-medium text-gray-600">Day</div>
              {slots.map((h, i) => (
                <div key={i} className="p-3 text-center text-gray-500">
                  {h}-{String(Number(h.split(":")[0]) + 1).padStart(2,"0")}:00
                </div>
              ))}
            </div>

            {/* ROWS */}
            {DAYS.map((day) => {
              const daySessions = grouped[day];

              return (
                <div
                  key={day}
                  className="grid grid-cols-13 items-stretch border-[1px] border-gray-200 rounded-xl text-xs overflow-hidden"
                >
                  <div className="ps-3  font-medium text-gray-800 flex items-center justify-center">
                    {day}
                  </div>

                  {(() => {
                    const cells = [];
                    let i = 0;

                    while (i < slots.length) {
                      const slot = slots[i];
                      const slotMin = toMinutes(slot);

                      const session = daySessions.find((s) => {
                        return toMinutes(s.startTime.slice(0,5)) === slotMin;
                      });

                      if (!session) {
                        cells.push(
                          <div key={i} className="p-2 flex items-center justify-center text-gray-600">
                            -
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
                            "relative p-2 m-1 rounded-lg text-[11px] flex flex-col justify-center",
                            getColor(session.courseOfferingId)
                          )}
                          style={{
                            gridColumn: `span ${span}`,
                            minHeight: "60px",
                          }}
                        >
                          <div className="font-semibold">
                            {session.type}
                          </div>
                          <div className="opacity-70 text-[10px]">
                            {session.startTime.slice(0,5)} - {session.endTime.slice(0,5)}
                          </div>
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
    </div>
  );
}