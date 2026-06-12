"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { ChevronDown } from "lucide-react";
import { useAcademicContext } from "@/hooks/useAcademicContext";
import { toast } from "sonner";

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
    if (Array.isArray(data.errors) && data.errors.length > 0) return data.errors[0];
    if (typeof data.errors === "string") return data.errors;
    if (data.message) return data.message;
    if (data.title && Array.isArray(data.errors)) return data.errors[0];
    if (typeof data === "string") return data;
    return "";
  };

  const wordToNumber = (name: string) => {
    const map: Record<string, number> = {
      one: 1, two: 2, three: 3, four: 4, five: 5,
      six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
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
          params: { programId: selectedProgramId, semesterId: selectedSemesterId },
        });

        if (ignore) return;

        const sorted = [...res.data].sort(
          (a: Level, b: Level) => wordToNumber(a.levelName) - wordToNumber(b.levelName)
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
    return () => { ignore = true; };
  }, [selectedProgramId, selectedSemesterId, isReady]);

  // =========================
  // STATUS CHECK
  // =========================
  useEffect(() => {
    if (!selectedSemesterId) return;

    const fetchStatus = async () => {
      try {
        setStatusLoading(true);
        const res = await axiosInstance.get("/control/result-announce-status", {
          params: { semesterId: selectedSemesterId },
        });
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
      prev.includes(levelId) ? prev.filter((id) => id !== levelId) : [...prev, levelId]
    );
  };

  // =========================
  // TOGGLE CONTROL 
  // =========================
  const handleToggle = async (courseOfferingId: string) => {
    let currentCourseName = "Course";
    let isCurrentlyOpen = false;

    levels.forEach(l => {
      const found = l.offerings.find(o => o.courseOfferingId === courseOfferingId);
      if (found) {
        currentCourseName = found.courseName;
        isCurrentlyOpen = found.isOpenForControl;
      }
    });

    try {
      setActionError("");

      await axiosInstance.patch(`/control/${courseOfferingId}/toggle-control`);

      setLevels((prev) =>
        prev.map((level) => ({
          ...level,
          offerings: level.offerings.map((off) =>
            off.courseOfferingId === courseOfferingId
              ? { ...off, isOpenForControl: !off.isOpenForControl }
              : off
          ),
        }))
      );

      if (isCurrentlyOpen) {
        toast.success(`Control closed successfully for ${currentCourseName}`);
      } else {
        toast.success(`Control opened successfully for ${currentCourseName}`);
      }

    } catch (err) {
      const msg = getApiError(err);
      if (msg) {
        setActionError(msg);
        toast.error(msg);
      }
    }
  };

  // =========================
  // TOGGLE ANNOUNCE RESULT  
  // =========================
  const handleToggleAnnounce = async () => {
    if (!selectedProgramId || !selectedSemesterId) return;

    const willAnnounce = !isResultAnnounced;

    try {
      setToggleLoading(true);
      setActionError("");

      await axiosInstance.patch("/control/toggle-announce-result", null, {
        params: { semesterId: selectedSemesterId, programId: selectedProgramId },
      });

      setIsResultAnnounced((prev) => !prev);

      if (willAnnounce) {
        toast.success("Results have been announced successfully! 🎉");
      } else {
        toast.success("Result announcement has been cancelled.");
      }

    } catch (err) {
      const msg = getApiError(err);
      if (msg) {
        setActionError(msg);
        toast.error(msg);
      }
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

       {actionError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl font-bold">Levels</h1>

        <button
          onClick={handleToggleAnnounce}
          disabled={statusLoading || toggleLoading}
          className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-white transition-all active:scale-[0.98] font-medium text-sm ${
            isResultAnnounced ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isResultAnnounced ? "Result Announced" : "Announce Result"}
        </button>
      </div>

       <div className="space-y-4">
        {levels.map((level) => (
          <div key={level.levelId} className="bg-white border rounded-2xl p-4 shadow-sm">
            <div
              onClick={() => toggleLevel(level.levelId)}
              className="flex justify-between cursor-pointer items-center select-none"
            >
              <h2 className="font-semibold text-gray-800">{level.levelName}</h2>
              <ChevronDown className={`transform transition-transform text-gray-500 ${expandedLevels.includes(level.levelId) ? "rotate-180" : ""}`} />
            </div>

            {expandedLevels.includes(level.levelId) && (
              <div className="mt-4 space-y-3">
                {level.offerings.map((course) => (
                  <div
                    key={course.courseOfferingId}
                    className="flex flex-col gap-2.5 p-4 border rounded-xl bg-gray-50/50 md:grid md:grid-cols-5 md:items-center md:p-3 md:gap-4"
                  >
                     <div className="flex justify-between items-center md:block">
                      <span className="text-xs font-bold text-gray-400 md:hidden">Course:</span>
                      <p className="font-semibold text-sm text-gray-900 md:truncate">{course.courseName}</p>
                    </div>

                     <div className="flex justify-between items-center md:block">
                      <span className="text-xs font-bold text-gray-400 md:hidden">Code:</span>
                      <p className="text-sm text-gray-500 font-mono">{course.courseCode}</p>
                    </div>

                     <div className="flex justify-between items-center md:block md:text-center">
                      <span className="text-xs font-bold text-gray-400 md:hidden">Registered Students:</span>
                      <p className="text-sm text-gray-600">{course.numberOfRegisteredStudents} Std</p>
                    </div>

                     <div className="flex justify-between items-center md:block md:text-center">
                      <span className="text-xs font-bold text-gray-400 md:hidden">Missing Degrees:</span>
                      <p className={`text-sm font-medium ${course.numberOfStudentsWithMissDegrees > 0 ? "text-red-500" : "text-emerald-600"}`}>
                        {course.numberOfStudentsWithMissDegrees} Missing
                      </p>
                    </div>

                     <div className="flex justify-end gap-2 border-t pt-3 mt-1 md:border-t-0 md:pt-0 md:mt-0">
                      <button
                        onClick={() => handleToggle(course.courseOfferingId)}
                        disabled={course.isOpenForControl}
                        className={`flex-1 md:flex-none px-4 py-1.5 md:px-3 md:py-1 text-xs font-semibold rounded-lg transition-all text-center ${
                          course.isOpenForControl 
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                            : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
                        }`}
                      >
                        Open
                      </button>

                      <button
                        onClick={() => handleToggle(course.courseOfferingId)}
                        disabled={!course.isOpenForControl}
                        className={`flex-1 md:flex-none px-4 py-1.5 md:px-3 md:py-1 text-xs font-semibold rounded-lg transition-all text-center ${
                          !course.isOpenForControl 
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                            : "bg-red-600 text-white hover:bg-red-700 active:scale-95"
                        }`}
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