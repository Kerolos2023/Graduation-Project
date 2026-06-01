

"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
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
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

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

  const paginatedCommittees = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return addedCommittees.slice(startIndex, startIndex + pageSize);
  }, [addedCommittees, currentPage]);

  const totalPages = Math.ceil(addedCommittees.length / pageSize) || 1;

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
    const updatedList = addedCommittees.filter((c) => c.id !== id);
    setAddedCommittees(updatedList);
    const maxPage = Math.ceil(updatedList.length / pageSize) || 1;
    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
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

  const renderPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      const isCurrent = i === currentPage;
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors font-bold text-xs cursor-pointer ${
            isCurrent
              ? "bg-gray-50 border border-gray-200 text-gray-900"
              : "hover:bg-gray-50 text-gray-500"
          }`}
        >
          {String(i).padStart(2, '0')}
        </button>
      );
    }
    return pages;
  };

  if (isLoading) {
    return (
      <div className="w-full h-full min-h-screen bg-[#F5F5F5] p-4 md:p-8 flex items-center justify-center font-inter">
        <div className="bg-white rounded-[24px] border border-[#eaebf0] p-12 flex flex-col items-center justify-center gap-3 text-center shadow-[0_4px_24px_rgba(0,0,0,0.02)] max-w-md w-full">
          <Loader2 className="animate-spin text-blue-600 w-12 h-12" />
          <span className="text-gray-900 font-bold text-lg">Loading exam data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-6 font-inter pb-8" ref={topRef} dir="ltr">
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

      {/* ── Form Card ── */}
      <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0] shrink-0 scroll-mt-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">
            Adding Examination Committee Distribution
          </h1>
          <span className="block text-xs font-medium text-gray-400 mt-1.5">{courseName}</span>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[13px] font-bold text-gray-900 ml-1">Day</label>
            <input
              type="date"
              value={formData.day}
              onChange={(e) => setFormData({ ...formData, day: e.target.value })}
              className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm font-medium h-auto"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[13px] font-bold text-gray-900 ml-1">Period From</label>
              <input
                type="time"
                value={formData.periodFrom}
                onChange={(e) => setFormData({ ...formData, periodFrom: e.target.value })}
                className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm font-medium h-auto"
              />
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[13px] font-bold text-gray-900 ml-1">To</label>
              <input
                type="time"
                value={formData.periodTo}
                onChange={(e) => setFormData({ ...formData, periodTo: e.target.value })}
                className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm font-medium h-auto"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[13px] font-bold text-gray-900 ml-1">Committees</label>
            <Select value={selectedCommitteeId} onValueChange={setSelectedCommitteeId}>
              <SelectTrigger className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm font-medium h-auto text-gray-700">
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
            className="w-full text-white font-semibold py-3.5 rounded-[12px] transition-all shadow-sm cursor-pointer flex items-center justify-center text-sm active:scale-[0.99] bg-blue-600 hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      </div>

      {/* ── List Card ── */}
      <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0]">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-[22px] font-bold text-gray-900 leading-none">Committees</h2>
            <Badge className="bg-[#eff4ff] text-blue-600 text-[11px] font-bold px-3 py-1.5 rounded-full border border-blue-100 hover:bg-[#eff4ff] shadow-none">
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
          <div className="hidden md:grid grid-cols-[1fr_1fr_1.5fr_1.2fr_1fr_60px] px-5 py-4 mb-3 border border-gray-100 bg-[#fafafa] rounded-xl font-bold text-gray-800 text-[13px] gap-4">
            <div>Name</div>
            <div>Capacity</div>
            <div>Number of <br />  Registered <br /> Students</div>
            <div>Start <br /> Distribution</div>
            <div>Place</div>
            <div></div>
          </div>

          {addedCommittees.length === 0 ? (
            <div className="text-center p-8 text-gray-400 border border-gray-100 rounded-xl border-dashed">
              No committees added yet. Select a committee and click "Add" above.
            </div>
          ) : (
            paginatedCommittees.map((committee) => (
              <div
                key={committee.id}
                className="flex flex-col md:grid md:grid-cols-[1fr_1fr_1.5fr_1.2fr_1fr_60px] items-start md:items-center w-full px-5 py-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-white gap-3 md:gap-4 relative group text-[14px] text-gray-700"
              >
                <div>
                  <span className="md:hidden text-[10px] uppercase font-bold text-gray-400 block mb-1">Name</span>
                  <span className="font-bold text-gray-900">{committee.name}</span>
                </div>
                <div>
                  <span className="md:hidden text-[10px] uppercase font-bold text-gray-400 block mb-1">Capacity</span>
                  <span className="font-medium text-gray-600 md:text-gray-900">{committee.capacity}</span>
                </div>
                <div>
                  <span className="md:hidden text-[10px] uppercase font-bold text-gray-400 block mb-1">Number of Registered Students</span>
                  <span className="font-medium text-gray-600 md:text-gray-900">0</span>
                </div>
                <div>
                  <span className="md:hidden text-[10px] uppercase font-bold text-gray-400 block mb-1">Start Distribution</span>
                  <span className="font-medium text-gray-600 md:text-gray-900">01</span>
                </div>
                <div>
                  <span className="md:hidden text-[10px] uppercase font-bold text-gray-400 block mb-1">Place</span>
                  <span className="font-medium text-gray-600 md:text-gray-900 truncate">{committee.place}</span>
                </div>
                <div className="flex items-center justify-end absolute right-4 top-4 md:relative md:right-auto md:top-auto">
                  <button
                    type="button"
                    onClick={() => handleRemoveCommittee(committee.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors bg-white cursor-pointer"
                  >
                    <Trash2 className="w-[18px] h-[18px]" strokeWidth={2} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* PAGINATION Section */}
        {addedCommittees.length > 0 && totalPages > 1 && (
          <div className="flex justify-center mt-6 pt-4 border-t border-gray-50">
            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className={`p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-400 transition-colors flex items-center gap-1 ${
                  currentPage === 1 ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              {renderPageNumbers()}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className={`p-2 border rounded-xl hover:bg-gray-50 text-[#2563EB] border-blue-100 bg-white transition-colors flex items-center gap-1 ml-1 font-semibold ${
                  currentPage === totalPages ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
                }`}
              >
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


 