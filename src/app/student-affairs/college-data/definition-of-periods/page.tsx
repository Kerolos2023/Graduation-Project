"use client";

import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "@/lib/axios";
import { useAcademicContext } from "@/hooks/useAcademicContext";
import { toast } from "sonner";

type ScheduleDefinition = {
  dayStartTime: string;
  dayEndTime: string;
  slotDurationMinutes: number;
};

const DEFAULT_DEFINITION = {
  dayStartTime: "08:00",
  dayEndTime: "16:00",
  slotDurationMinutes: "60",
};

const normalizeTime = (value?: string) => {
  if (!value) return "";
  if (value.includes("T")) {
    const timePart = value.split("T")[1];
    return timePart?.slice(0, 5) || "";
  }
  return value.length >= 5 ? value.slice(0, 5) : value;
};

const normalizeScheduleDefinition = (data: any): ScheduleDefinition | null => {
  if (!data) return null;
  const dayStartTime = data.dayStartTime ?? data.DayStartTime ?? "";
  const dayEndTime = data.dayEndTime ?? data.DayEndTime ?? "";
  const slotDurationMinutes =
    data.slotDurationMinutes ?? data.SlotDurationMinutes ?? data.slotDuration ?? data.SlotDuration;

  if (!dayStartTime && !dayEndTime && !slotDurationMinutes) return null;

  return {
    dayStartTime,
    dayEndTime,
    slotDurationMinutes: Number(slotDurationMinutes || 0),
  };
};

export default function DefinitionOfPeriodsPage() {
  const { selectedProgramId, selectedSemesterId } = useAcademicContext();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    dayStartTime: "",
    dayEndTime: "",
    slotDurationMinutes: "",
  });

  const buildFormData = (data?: ScheduleDefinition | null) => ({
    dayStartTime: normalizeTime(data?.dayStartTime) || DEFAULT_DEFINITION.dayStartTime,
    dayEndTime: normalizeTime(data?.dayEndTime) || DEFAULT_DEFINITION.dayEndTime,
    slotDurationMinutes: data?.slotDurationMinutes
      ? String(data.slotDurationMinutes)
      : DEFAULT_DEFINITION.slotDurationMinutes,
  });

  const isMissingContext = useMemo(
    () => !selectedProgramId || !selectedSemesterId,
    [selectedProgramId, selectedSemesterId]
  );

  const fetchDefinition = async () => {
    if (isMissingContext) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `/programs/${selectedProgramId}/semesters/${selectedSemesterId}/schedule`
      );
      const raw = res.data?.data ?? res.data?.item ?? res.data;
      const data = normalizeScheduleDefinition(raw);
      setFormData(buildFormData(data));
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setFormData(buildFormData(null));
      } else {
        toast.error("Failed to load schedule definition.");
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDefinition();
  }, [selectedProgramId, selectedSemesterId]);

  const handleSave = async () => {
    if (isMissingContext) {
      toast.warning("Select program and semester first.");
      return;
    }
    if (!formData.dayStartTime || !formData.dayEndTime || !formData.slotDurationMinutes) {
      toast.warning("Please fill all fields.");
      return;
    }
    setSaving(true);
    try {
      await axiosInstance.put(
        `/programs/${selectedProgramId}/semesters/${selectedSemesterId}/schedule`,
        {
          dayStartTime: formData.dayStartTime,
          dayEndTime: formData.dayEndTime,
          slotDurationMinutes: Number(formData.slotDurationMinutes),
        }
      );
      toast.success("Schedule definition saved.");
    } catch (error) {
      toast.error("Failed to save schedule definition.");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 font-inter pb-8">
      <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Definition of Periods</h1>
            <p className="text-sm text-gray-500 mt-1">
              Define the daily schedule structure for the selected program and semester.
            </p>
          </div>
          {loading && <span className="text-xs text-gray-400">Loading…</span>}
        </div>

        {isMissingContext && (
          <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-sm px-4 py-3">
            Please select Program, Year, and Term from the sidebar first.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-gray-900 ml-1">Period From</label>
            <input
              type="time"
              value={formData.dayStartTime}
              onChange={(e) => setFormData({ ...formData, dayStartTime: e.target.value })}
              className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              disabled={isMissingContext}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-gray-900 ml-1">To</label>
            <input
              type="time"
              value={formData.dayEndTime}
              onChange={(e) => setFormData({ ...formData, dayEndTime: e.target.value })}
              className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              disabled={isMissingContext}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-gray-900 ml-1">Unit (in minutes)</label>
            <input
              type="number"
              min={1}
              value={formData.slotDurationMinutes}
              onChange={(e) => setFormData({ ...formData, slotDurationMinutes: e.target.value })}
              className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              placeholder="e.g. 60"
              disabled={isMissingContext}
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || isMissingContext}
          className="w-full h-12 text-sm font-semibold rounded-[12px] bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
