"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Loader2, AlertCircle, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { committeeDistributionService } from "@/services/addingServices";

export default function AddingExaminationCommitteeDistributionPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const courseOfferingId = params.courseId as string;
  const termId = searchParams.get("termId") || "019e2720-94e6-7743-9362-bbb1a87cd280";
  const searchParamExamId = searchParams.get("examId") || "";
  const courseName = searchParams.get("courseName") || "Course Subject";
  const isUpdateState = (
    searchParamExamId &&
    searchParamExamId !== "null" &&
    searchParamExamId !== "undefined" &&
    searchParamExamId !== "00000000-0000-0000-0000-000000000000"
  );

  const [formData, setFormData] = useState({ day: "", periodFrom: "", periodTo: "" });
  const [availableCommittees, setAvailableCommittees] = useState<any[]>([]);
  const [selectedCommitteeId, setSelectedCommitteeId] = useState<string>("");
  const [addedCommittees, setAddedCommittees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'error' | 'success' | 'warning' | null }>({
    text: "",
    type: null
  });

  const scrollToTop = () => {
    setTimeout(() => {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  useEffect(() => {
    const initPageData = async () => {
      if (!termId) return;
      try {
        setIsLoading(true);
        const committeesData = await committeeDistributionService.getAvailableCommittees(termId);
        setAvailableCommittees(committeesData || []);
        if (isUpdateState) {
          console.log("Fetching existing exam details for id:", searchParamExamId);
          const examDetails = await committeeDistributionService.getExamDetails(termId, searchParamExamId);

          if (examDetails) {
            const startTimeClean = examDetails.startTime ? examDetails.startTime.substring(0, 5) : "";
            const endTimeClean = examDetails.endTime ? examDetails.endTime.substring(0, 5) : "";

            setFormData({
              day: examDetails.date ? examDetails.date.substring(0, 10) : "",
              periodFrom: startTimeClean,
              periodTo: endTimeClean
            });

            if (examDetails.examCommittees && Array.isArray(examDetails.examCommittees)) {
              const mappedCommittees = examDetails.examCommittees.map((c: any) => ({
                id: c.id,
                name: `Committee ${c.committeeNumber || c.id.substring(0, 4)}`,
                capacity: c.maxCapacity || c.capacity || 0,
                place: c.place || "N/A"
              }));
              setAddedCommittees(mappedCommittees);
            }
          }
        }
      } catch (error) {
        console.error("Error initializing page data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    initPageData();
  }, [termId, searchParamExamId, isUpdateState]);

  const handleAddCommittee = () => {
    if (!selectedCommitteeId) return;
    const committee = availableCommittees.find((c) => c.id === selectedCommitteeId);
    if (committee && !addedCommittees.some((c) => c.id === selectedCommitteeId)) {
      setAddedCommittees([...addedCommittees, {
        id: committee.id,
        name: `Committee ${committee.committeeNumber}`,
        capacity: committee.maxCapacity,
        place: committee.place,
      }]);
      setSelectedCommitteeId("");
    }
  };

  const handleRemoveCommittee = (id: string) => {
    setAddedCommittees(addedCommittees.filter((c) => c.id !== id));
  };

  const handleGlobalSave = async () => {
    setStatusMessage({ text: "", type: null });

    if (!termId || !courseOfferingId) {
      setStatusMessage({ text: "Missing required parameters.", type: 'error' });
      scrollToTop();
      return;
    }
    if (!formData.day || !formData.periodFrom || !formData.periodTo) {
      setStatusMessage({ text: "Please fill in all fields (Day and Time Period).", type: 'warning' });
      scrollToTop();
      return;
    }

    setIsSubmitting(true);
    const cleanStartTime = formData.periodFrom.includes(":") && formData.periodFrom.split(":").length === 2
      ? `${formData.periodFrom}:00`
      : formData.periodFrom;

    const cleanEndTime = formData.periodTo.includes(":") && formData.periodTo.split(":").length === 2
      ? `${formData.periodTo}:00`
      : formData.periodTo;

    try {
      if (isUpdateState) {
        const putPayload = {
          date: formData.day,
          startTime: cleanStartTime,
          endTime: cleanEndTime,
          ExamCommitteesIds: addedCommittees.map((c) => c.id)
        };

        console.log("Executing direct PUT route matching Apidog path layout...");
        await committeeDistributionService.updateDistributionByPath(termId, searchParamExamId, putPayload);
        setStatusMessage({ text: "Committee distribution updated successfully!", type: 'success' });
        setTimeout(() => router.back(), 1500);
      } else {
        const postPayload = {
          courseOfferingId: courseOfferingId,
          date: formData.day,
          startTime: cleanStartTime,
          endTime: cleanEndTime,
          ExamCommitteesIds: addedCommittees.map((c) => c.id)
        };

        console.log("Executing direct POST route matching Apidog query layout...");
        await committeeDistributionService.addDistribution(termId, courseOfferingId, postPayload);
        setStatusMessage({ text: "Committee distribution saved successfully!", type: 'success' });
        setTimeout(() => router.back(), 1500);
      }
    } catch (error: any) {
      console.error("Saving request error logs:", error);
      const errorMsg = error.response?.data?.errors?.request?.[0] || error.response?.data?.errors?.[0] || error.response?.data?.detail || error.response?.data?.message || "Failed to save data.";
      setStatusMessage({ text: `Server Error: ${errorMsg}`, type: 'error' });
      scrollToTop();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full min-h-screen bg-[#F5F5F5] p-4 md:p-8 flex items-center justify-center font-sans">
        <div className="bg-white rounded-[24px] border border-[#eaebf0] p-12 flex flex-col items-center justify-center gap-3 text-center shadow-[0_4px_24px_rgba(0,0,0,0.02)] max-w-md w-full">
          <Loader2 className="animate-spin text-blue-600 w-12 h-12" />
          <span className="text-gray-900 font-bold text-lg">Loading exam data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F5F5F5] p-4 md:p-8 flex flex-col gap-6 font-sans antialiased" ref={topRef} dir="ltr">

      {statusMessage.type && (
        <div className={`border px-5 py-4 rounded-xl text-sm transition-all shadow-sm max-w-6xl w-full mx-auto ${statusMessage.type === 'error' ? 'bg-red-50 border-red-200 text-red-700 font-bold' :
            statusMessage.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800 font-semibold' :
              'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold'
          }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {statusMessage.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
              <span>{statusMessage.text}</span>
            </div>
            <button onClick={() => setStatusMessage({ text: "", type: null })} className="cursor-pointer p-0.5 hover:bg-black/5 rounded-md">
              <X className="w-4 h-4 opacity-50" />
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.01)] border border-[#eaebf0] max-w-6xl w-full mx-auto shrink-0 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1B2A]">
            Adding Examination Committee Distribution
          </h1>
          <span className="block text-xs font-medium text-gray-400 mt-1.5">{courseName}</span>
        </div>

        <div className="space-y-5">
          <div className="flex flex-col gap-2">
            <Label className="text-[14px] font-semibold text-gray-700">Day</Label>
            <Input
              type="date"
              value={formData.day}
              onChange={(e) => setFormData({ ...formData, day: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium h-12 shadow-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <Label className="text-[14px] font-semibold text-gray-700">Period From</Label>
              <Input
                type="time"
                value={formData.periodFrom}
                onChange={(e) => setFormData({ ...formData, periodFrom: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium h-12 shadow-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-[14px] font-semibold text-gray-700">To</Label>
              <Input
                type="time"
                value={formData.periodTo}
                onChange={(e) => setFormData({ ...formData, periodTo: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium h-12 shadow-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-[14px] font-semibold text-gray-700">Committees</Label>
            <Select value={selectedCommitteeId} onValueChange={setSelectedCommitteeId}>
              <SelectTrigger className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium h-12 text-gray-700 shadow-none">
                <SelectValue placeholder="Select Committee" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {availableCommittees
                  .filter((c) => !addedCommittees.some((added) => added.id === c.id))
                  .map((committee) => (
                    <SelectItem key={committee.id} value={committee.id}>
                      Committee {committee.committeeNumber} — {committee.place} (Capacity: {committee.maxCapacity})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <button
            type="button"
            onClick={handleAddCommittee}
            className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.995] text-white font-semibold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2 h-12 cursor-pointer mt-2"
          >
            Add
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.01)] border border-[#eaebf0] max-w-6xl w-full mx-auto space-y-6">

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-[#0D1B2A]">Committees</h2>
            <Badge className="bg-[#EFF4FF] text-[#2563EB] hover:bg-[#EFF4FF] text-xs font-bold px-3 py-1.5 rounded-full border border-blue-50 shadow-none">
              {addedCommittees.length} Room
            </Badge>
          </div>

          <Button
            onClick={handleGlobalSave}
            disabled={isSubmitting || addedCommittees.length === 0}
            className="h-10 border border-[#2563EB] text-[#2563EB] bg-white hover:bg-blue-50 rounded-xl px-6 font-semibold transition-all shadow-none text-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            variant="outline"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>

        <div className="space-y-3">
          <div className="hidden md:grid grid-cols-[1fr_1fr_1.5fr_1.2fr_1fr_60px] px-6 py-4 border border-gray-100 bg-[#FAFAFA] rounded-xl font-bold text-gray-500 text-[13px]">
            <div>Name</div>
            <div>Capacity</div>
            <div>Number of Registered Students</div>
            <div>Start Distribution</div>
            <div>Place</div>
            <div></div>
          </div>

          {addedCommittees.length === 0 ? (
            <div className="text-center p-12 text-gray-400 border border-gray-100 rounded-xl border-dashed text-sm font-medium bg-gray-50/40">
              No committees added yet. Select a committee and click "Add" above.
            </div>
          ) : (
            addedCommittees.map((committee) => (
              <div
                key={committee.id}
                className="flex flex-col md:grid md:grid-cols-[1fr_1fr_1.5fr_1.2fr_1fr_60px] items-start md:items-center px-6 py-4 border border-gray-100 rounded-xl hover:shadow-sm transition-all bg-white gap-3 md:gap-0 relative text-[14px] text-gray-700"
              >
                <div>
                  <span className="md:hidden text-[11px] uppercase font-bold text-gray-400 block mb-1">Name</span>
                  <span className="font-bold text-gray-900">{committee.name}</span>
                </div>
                <div>
                  <span className="md:hidden text-[11px] uppercase font-bold text-gray-400 block mb-1">Capacity</span>
                  <span className="font-medium text-gray-600 md:text-gray-900">{committee.capacity}</span>
                </div>
                <div>
                  <span className="md:hidden text-[11px] uppercase font-bold text-gray-400 block mb-1">Number of Registered Students</span>
                  <span className="font-medium text-gray-600 md:text-gray-900">0</span>
                </div>
                <div>
                  <span className="md:hidden text-[11px] uppercase font-bold text-gray-400 block mb-1">Start Distribution</span>
                  <span className="font-medium text-gray-600 md:text-gray-900">01</span>
                </div>
                <div>
                  <span className="md:hidden text-[11px] uppercase font-bold text-gray-400 block mb-1">Place</span>
                  <span className="font-medium text-gray-600 md:text-gray-900 truncate">{committee.place}</span>
                </div>
                <div className="flex items-center justify-end absolute right-4 top-4 md:relative md:right-auto md:top-auto">
                  <button
                    onClick={() => handleRemoveCommittee(committee.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer bg-white"
                  >
                    <Trash2 className="w-[18px] h-[18px]" strokeWidth={2} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* PAGINATION */}
        {addedCommittees.length > 0 && (
          <div className="flex items-center justify-center pt-4">
            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
              <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-400 transition-colors cursor-pointer flex items-center gap-1">
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-200 font-bold text-gray-900 text-xs">01</button>
              <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-50 text-xs transition-colors">02</button>
              <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-50 text-xs transition-colors">03</button>
              <span className="px-1 text-gray-400 text-xs">...</span>
              <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-50 text-xs transition-colors">10</button>
              <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-[#2563EB] border-blue-100 bg-white transition-colors cursor-pointer flex items-center gap-1 ml-1 font-semibold">
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}



