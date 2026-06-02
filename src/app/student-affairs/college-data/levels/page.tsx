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

  const getErrorMessage = (err: any, fallback: string) => {
    const responseData = err?.response?.data;

    if (!responseData) return err?.message || fallback;
    if (typeof responseData === "string") return responseData;
    if (responseData?.message) return responseData.message;
    if (responseData?.error) return responseData.error;

    return err?.message || fallback;
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
          setError(getErrorMessage(err, "Failed to load data"));
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
  // FETCH RESULT STATUS
  // =========================
  useEffect(() => {
    if (!selectedSemesterId) return;

    const fetchStatus = async () => {
      try {
        setStatusLoading(true);

        const res = await axiosInstance.get(
          "/control/result-announce-status",
          {
            params: {
              semesterId: selectedSemesterId,
            },
          }
        );

        setIsResultAnnounced(res.data.isResultAnnounced);
      } catch (err) {
        console.error(err);
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
      setActionError(
        getErrorMessage(err, "Failed to update control status")
      );
    }
  };

  // =========================
  // TOGGLE ANNOUNCE RESULT
  // =========================
  const handleToggleAnnounce = async () => {
    if (!selectedProgramId || !selectedSemesterId) return;

    try {
      setToggleLoading(true);

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
      setActionError(
        getErrorMessage(err, "Failed to toggle announce result")
      );
    } finally {
      setToggleLoading(false);
    }
  };

  // =========================
  // UI STATES
  // =========================
  if (!isReady) return <p className="p-4">Select program and semester...</p>;
  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4">{error}</p>;
  if (!levels.length) return <p className="p-4">No data found</p>;

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen rounded-xl">

      {/* HEADER (UNCHANGED STYLE) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 inline me-2">
            Levels
          </h1>
          <span className="inline-flex items-center mt-1 text-xs font-medium bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
            {levels.length} Levels
          </span>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">

          {/* ANNOUNCE BUTTON */}
          <button
            onClick={handleToggleAnnounce}
            disabled={statusLoading || toggleLoading}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-white font-medium shadow-sm hover:${
              isResultAnnounced
                ? "bg-green-700"
                : "bg-blue-700"
            } transition-all ${
              isResultAnnounced
                ? "bg-green-600"
                : "bg-blue-600"
            }`}
          >
            {statusLoading
              ? "Loading..."
              : toggleLoading
              ? "Updating..."
              : isResultAnnounced
              ? "Result Announced"
              : "Announce Result"}
          </button>


        </div>
      </div>

      {/* ERROR */}
      {actionError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {/* LEVELS */}
      <div className="space-y-4">
        {levels.map((level) => (
          <div
            key={level.levelId}
            className="bg-white border rounded-2xl p-4 shadow-sm"
          >
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
                          onClick={() => handleToggle(course.courseOfferingId)}
                          className={`px-4 py-2 text-xs rounded-lg text-white transition hover:scale-105 ${
                            course.isOpenForControl
                              ? "bg-blue-600"
                              : "bg-gray-300 text-gray-700"
                          }`}
                        >
                          Open
                        </button>

                        <button
                          onClick={() => handleToggle(course.courseOfferingId)}
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
    </div>
  );
}