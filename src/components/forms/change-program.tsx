"use client";

import { useEffect, useState } from "react";
import { academicService } from "@/services/academicServices";
import { useStudentContext } from "@/hooks/useStudentContext";
import { useAcademicContext } from "@/hooks/useAcademicContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Program = {
  id: string;
  name: string;
  code: string;
};

export default function ChangeProgramPage() {
  const { studentId } = useStudentContext();

  const { selectedProgramId } = useAcademicContext();

  const [programs, setPrograms] = useState<Program[]>([]);

  const [newProgramId, setNewProgramId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const res = await academicService.getAllPrograms();
        setPrograms(res);
      } catch {
        setErrorMessage("Failed to load programs");
      }
    };

    fetchPrograms();
  }, []);

  useEffect(() => {
    if (selectedProgramId) {
      setNewProgramId(selectedProgramId);
    }
  }, [selectedProgramId]);

  const handleChangeProgram = async () => {
    try {
      if (!studentId || !newProgramId) return;

      setErrorMessage(null);
      setSuccessMessage("");
      setLoading(true);

      await academicService.changeStudentProgram(
        studentId,
        newProgramId
      );

      setSuccessMessage("Program updated successfully");
    } catch (err: any) {
      const errors = err?.response?.data?.errors;

      if (errors) {
        const firstError = Object.values(errors).flat()[0] as string;
        setErrorMessage(firstError);
      } else {
        setErrorMessage("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white w-full p-4 sm:p-6 lg:p-9 shadow-sm rounded-[20px] mx-auto">
      <h2 className="text-lg sm:text-xl font-semibold mb-6">
        Change Academic Program
      </h2>

      {errorMessage && (
        <div className="bg-red-100 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 w-full max-w-full">
        <label className="text-sm text-gray-500">
          Select Program
        </label>

        <Select
          value={newProgramId || ""}
          onValueChange={(value) =>
            setNewProgramId(value)
          }
        >
          <SelectTrigger className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm sm:text-base">
            <SelectValue placeholder="Select program" />
          </SelectTrigger>

          <SelectContent>
            {programs.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name} ({p.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button
          onClick={handleChangeProgram}
          disabled={!newProgramId || loading}
          className="
            w-full
            bg-blue-600
            hover:bg-blue-700
            transition-colors
            text-white
            py-3
            rounded-xl
            mt-2
            text-sm
            sm:text-base
            disabled:bg-gray-300
            disabled:cursor-not-allowed
          "
        >
          {loading ? "Updating..." : "Update"}
        </button>

        {successMessage && (
          <p className="text-green-600 text-sm text-center">
            {successMessage}
          </p>
        )}
      </div>
    </div>
  );
}