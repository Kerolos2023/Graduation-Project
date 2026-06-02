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
  const [actionError, setActionError] = useState("");

  const [expandedLevels, setExpandedLevels] = useState<string[]>([]);

  const [isResultAnnounced, setIsResultAnnounced] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);

  const { selectedProgramId, selectedSemesterId } = useAcademicContext();

  const isReady = !!selectedProgramId && !!selectedSemesterId;

  // =========================
  // API ONLY ERROR PARSER (NO AXIOS MESSAGE)
  // =========================
  const getApiError = (err: any) => {
    const data = err?.response?.data;

    if (!data) return "";

    if (Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors[0];
    }

    if (typeof data.errors === "string") {
      return data.errors;
    }

    if (data.message) return data.message;

    if (data.title && Array.isArray(data.errors)) {
      return data.errors[0];
    }

    if (typeof data === "string") return data;

    return "";
  };

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

  // =========================
  // FETCH LEVELS
  // =========================
  useEffect(() => {
    if (!isReady) return;

    let ignore = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

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
      } catch (err) {
        if (!ignore) {
          setLevels([]);
          setError(getApiError(err));
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

  // =========================
  // STATUS CHECK
  // =========================
  useEffect(() => {
    if (!selectedSemesterId) return;

    const fetchStatus = async () => {
      try {
        setStatusLoading(true);

        const res = await axiosInstance.get(
          "/control/result-announce-status",
          {
            params: { semesterId: selectedSemesterId },
          }
        );

        setIsResultAnnounced(res.data.isResultAnnounced);
      } catch (err) {
        setActionError(getApiError(err));
      } finally {
        setStatusLoading(false);
      }
    };

    fetchStatus();
  }, [selectedSemesterId]);

  const toggleLevel = (levelId: string) => {
    setExpandedLevels((prev) =>
      prev.includes(levelId)
        ? prev.filter((id) => id !== levelId)
        : [...prev, levelId]
    );
  };

  // =========================
  // TOGGLE CONTROL
  // =========================
  const handleToggle = async (courseOfferingId: string) => {
    try {
      setActionError("");

      await axiosInstance.patch(
        `/control/${courseOfferingId}/toggle-control`
      );

      setLevels((prev) =>
        prev.map((level) => ({
          ...level,
          offerings: level.offerings.map((off) =>
            off.courseOfferingId === courseOfferingId
              ? {
                  ...off,
                  isOpenForControl: !off.isOpenForControl,
                }
              : off
          ),
        }))
      );
    } catch (err) {
      const msg = getApiError(err);
      if (msg) setActionError(msg);
    }
  };

  // =========================
  // TOGGLE ANNOUNCE RESULT
  // =========================
  const handleToggleAnnounce = async () => {
    if (!selectedProgramId || !selectedSemesterId) return;

    try {
      setToggleLoading(true);
      setActionError("");

      await axiosInstance.patch(
        "/control/toggle-announce-result",
        null,
        {
          params: {
            semesterId: selectedSemesterId,
            programId: selectedProgramId,
          },
        }
      );

      setIsResultAnnounced((prev) => !prev);
    } catch (err) {
      const msg = getApiError(err);
      if (msg) setActionError(msg);
    } finally {
      setToggleLoading(false);
    }
  };

  // =========================
  // UI STATES
  // =========================
  if (!isReady) return null;
  if (loading) return null;
  if (error) return <p className="p-4 text-red-600">{error}</p>;
  if (!levels.length) return null;

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen rounded-xl">

      {/* ONLY API ERROR */}
      {actionError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-xl font-bold">Levels</h1>

        <button
          onClick={handleToggleAnnounce}
          disabled={statusLoading || toggleLoading}
          className={`px-5 py-2.5 rounded-xl text-white ${
            isResultAnnounced ? "bg-green-600" : "bg-blue-600"
          }`}
        >
          {isResultAnnounced ? "Result Announced" : "Announce Result"}
        </button>
      </div>

      {/* LEVELS */}
      <div className="space-y-4">
        {levels.map((level) => (
          <div
            key={level.levelId}
            className="bg-white border rounded-2xl p-4"
          >
            <div
              onClick={() => toggleLevel(level.levelId)}
              className="flex justify-between cursor-pointer"
            >
              <h2>{level.levelName}</h2>
              <ChevronDown />
            </div>

            {expandedLevels.includes(level.levelId) && (
              <div className="mt-4 space-y-2">

                {level.offerings.map((course) => (
                  <div
                    key={course.courseOfferingId}
                    className="grid grid-cols-5 p-3 border rounded-xl"
                  >
                    <p>{course.courseName}</p>
                    <p>{course.courseCode}</p>
                    <p>{course.numberOfRegisteredStudents}</p>
                    <p>{course.numberOfStudentsWithMissDegrees}</p>

                    <div className="flex justify-end gap-2">

                      <button
                        onClick={() =>
                          handleToggle(course.courseOfferingId)
                        }
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg"
                      >
                        Open
                      </button>

                      <button
                        onClick={() =>
                          handleToggle(course.courseOfferingId)
                        }
                        className="px-3 py-1 text-xs bg-red-600 text-white rounded-lg"
                      >
                        Close
                      </button>

                    </div>
                  </div>
                ))}

              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  );
}