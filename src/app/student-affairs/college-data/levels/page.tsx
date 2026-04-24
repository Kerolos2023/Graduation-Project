"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { ChevronDown } from "lucide-react";
import { useAcademicContext } from "@/hooks/useAcademicContext";

type Offering = {
  courseOfferingId: string;
  courseName: string;
  courseCode: string;
  numberOfRegisteredStudents: number;
  numberOfStudentsWithMissDegrees: number;
  isOpenForControl: boolean;
};

type Level = {
  levelId: string;
  levelName: string;
  offerings: Offering[];
};

export default function ControlStatus() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedLevels, setExpandedLevels] = useState<string[]>([]);

  const { selectedProgramId, selectedSemesterId } = useAcademicContext();
  // const selectedProgramId = "019D5C67-392B-74A6-8E1F-2221FC6BBF0A";
  // const selectedSemesterId = "019d7980-c25c-7793-b137-248b067f98d5";

  const isReady = !!selectedProgramId && !!selectedSemesterId;

  // sorting helper
  const wordToNumber = (name: string) => {
    const map: Record<string, number> = {
      one: 1,
      two: 2,
      three: 3,
      four: 4,
      five: 5,
      six: 6,
      seven: 7,
      eight: 8,
      nine: 9,
      ten: 10,
    };

    const lower = name.toLowerCase();

    for (const key in map) {
      if (lower.includes(key)) return map[key];
    }

    return Number.MAX_SAFE_INTEGER;
  };

  useEffect(() => {
    if (!isReady) return;

    let ignore = false;

    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await axiosInstance.get("/control/control-status", {
          params: {
            programId: selectedProgramId,
            semesterId: selectedSemesterId,
          },
        });

        if (ignore) return;

        const sorted = [...res.data].sort(
          (a: Level, b: Level) =>
            wordToNumber(a.levelName) - wordToNumber(b.levelName)
        );

        setLevels(sorted);
        setExpandedLevels(sorted.map((l) => l.levelId));
      } catch {
        if (!ignore) {
          setLevels([]);
          setError("Failed to load data");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchData();

    return () => {
      ignore = true;
    };
  }, [selectedProgramId, selectedSemesterId, isReady]);

  const toggleLevel = (levelId: string) => {
    setExpandedLevels((prev) =>
      prev.includes(levelId)
        ? prev.filter((id) => id !== levelId)
        : [...prev, levelId]
    );
  };

  const handleToggle = async (
    courseOfferingId: string,
    currentState: boolean,
    targetState: boolean
  ) => {
    if (currentState === targetState) return;

    try {
      await axiosInstance.patch(
        `/control/${courseOfferingId}/toggle-control`
      );

      setLevels((prev) =>
        prev.map((level) => ({
          ...level,
          offerings: level.offerings.map((off) =>
            off.courseOfferingId === courseOfferingId
              ? { ...off, isOpenForControl: targetState }
              : off
          ),
        }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 SAFE GUARD
  if (!isReady) {
    return <p className="p-4">Select program and semester...</p>;
  }

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4">{error}</p>;
  if (!levels.length) return <p className="p-4">No data found</p>;

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen rounded-xl">

      {/* HEADER */}
      <div className="flex items-center gap-2 mb-4">
        <h1 className="text-lg md:text-xl font-semibold">Levels</h1>
        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
          {levels.length} Levels
        </span>
      </div>

      {/* LEVELS */}
      <div className="space-y-4">
        {levels.map((level) => (
          <div
            key={level.levelId}
            className="bg-white border rounded-2xl p-4 shadow-sm"
          >
            {/* HEADER */}
            <div
              onClick={() => toggleLevel(level.levelId)}
              className="flex justify-between items-center cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <h2 className="font-medium">{level.levelName}</h2>
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                  {level.offerings.length} Course
                </span>
              </div>

              <ChevronDown
                className={`transition ${
                  expandedLevels.includes(level.levelId)
                    ? "rotate-180"
                    : ""
                }`}
              />
            </div>

            {/* TABLE */}
            {expandedLevels.includes(level.levelId) && (
              <div className="mt-4">

                <div className="grid grid-cols-5 text-sm text-gray-500 bg-gray-100 border p-3 rounded-lg mb-2">
                  <p>Name</p>
                  <p>Code</p>
                  <p>Total Students</p>
                  <p>Missing Grades</p>
                  <p></p>
                </div>

                <div className="space-y-2">
                  {level.offerings.map((course) => (
                    <div
                      key={course.courseOfferingId}
                      className="grid grid-cols-5 items-center bg-white border p-3 rounded-xl"
                    >
                      <p>{course.courseName}</p>
                      <p>{course.courseCode}</p>
                      <p>{course.numberOfRegisteredStudents}</p>
                      <p>{course.numberOfStudentsWithMissDegrees}</p>

                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            handleToggle(
                              course.courseOfferingId,
                              course.isOpenForControl,
                              true
                            )
                          }
                          className={`px-4 py-2 text-xs rounded-lg text-white transition hover:scale-105 ${
                            course.isOpenForControl
                              ? "bg-blue-600"
                              : "bg-gray-300 text-gray-700"
                          }`}
                        >
                          Open
                        </button>

                        <button
                          onClick={() =>
                            handleToggle(
                              course.courseOfferingId,
                              course.isOpenForControl,
                              false
                            )
                          }
                          className={`px-3 py-1 text-xs rounded-lg text-white transition hover:scale-105 ${
                            !course.isOpenForControl
                              ? "bg-red-600"
                              : "bg-gray-300 text-gray-700"
                          }`}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div className="mt-6 border rounded-xl text-center py-3 text-blue-600 bg-white hover:bg-blue-50 cursor-pointer">
        Advertise
      </div>
    </div>
  );
}