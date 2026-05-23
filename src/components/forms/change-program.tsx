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

  const {
    selectedProgramId,
    setSelectedProgramId,
  } = useAcademicContext();

  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);

        const res = await academicService.getAllPrograms();

        setPrograms(res);
      } catch (err) {
        setErrorMessage("Failed to load programs");
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  const handleChangeProgram = async () => {
    try {
      if (!studentId || !selectedProgramId) return;

      setErrorMessage("");
      setSuccessMessage("");

      await academicService.changeStudentProgram(
        studentId,
        selectedProgramId
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
    }
  };

  return (
    <div className="bg-white w-full p-4 sm:p-6 lg:p-9 shadow-sm rounded-[20px] mx-auto">
      <h2 className="text-lg sm:text-xl font-semibold mb-6">
        Change Academic Program
      </h2>

      {loading && (
        <p className="text-gray-500 text-sm sm:text-base">
          Loading programs...
        </p>
      )}

      {errorMessage && (
        <div className="bg-red-100 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm break-words">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 w-full max-w-full ">
        <label className="text-sm text-gray-500">
          Select Program
        </label>

        <Select
          value={selectedProgramId || ""}
          onValueChange={(value) => setSelectedProgramId(value === "" ? null : value)}
        >
          <SelectTrigger className="w-full max-w-full min-w-0 rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500">
            <SelectValue placeholder="Select program" />
          </SelectTrigger>
          <SelectContent className="w-full max-w-full min-w-0">
            {programs.map((p) => {
              const labelText = `${p.name} (${p.code})`;
              const truncatedLabel = labelText.length > 22 ? `${labelText.slice(0, 22)}...` : labelText;
              return (
                <SelectItem key={p.id} value={p.id} title={labelText}>
                  {truncatedLabel}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        <button
          onClick={handleChangeProgram}
          disabled={!selectedProgramId}
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
          Update
        </button>

        {successMessage && (
          <p className="text-green-600 text-sm text-center break-words">
            {successMessage}
          </p>
        )}
      </div>
    </div>
  );
}