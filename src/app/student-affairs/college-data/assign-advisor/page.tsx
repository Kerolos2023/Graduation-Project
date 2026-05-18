"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Image from "next/image";
import {
  ChevronDown,
  UserCheck,
  Users,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { useAcademicContext } from "@/hooks/useAcademicContext";
import {
  advisorService,
  type AdvisorStaffItem,
  type StudentItem,
} from "@/services/advisorServices";
import { cn } from "@/lib/utils";
import { StudentPanel } from "@/components/assign-advisor/StudentPanel";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 100000;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function AssignAdvisorPage() {
  const { selectedProgramId } = useAcademicContext();

  // ── Advisors ──
  const [advisors, setAdvisors] = useState<AdvisorStaffItem[]>([]);
  const [selectedAdvisorId, setSelectedAdvisorId] = useState<string>("");
  const [isLoadingAdvisors, setIsLoadingAdvisors] = useState(false);

  // ── Left panel (unassigned) ──
  const [unassigned, setUnassigned] = useState<StudentItem[]>([]);
  const [unassignedTotal, setUnassignedTotal] = useState(0);
  const [unassignedPages, setUnassignedPages] = useState(1);
  const [unassignedPage, setUnassignedPage] = useState(1);
  const [unassignedSearch, setUnassignedSearch] = useState("");
  const [unassignedSort, setUnassignedSort] = useState("Name");
  const [isLoadingUnassigned, setIsLoadingUnassigned] = useState(false);
  const [selectedUnassigned, setSelectedUnassigned] = useState<Set<string>>(new Set());

  // ── Right panel (assigned) ──
  const [assigned, setAssigned] = useState<StudentItem[]>([]);
  const [assignedTotal, setAssignedTotal] = useState(0);
  const [assignedPages, setAssignedPages] = useState(1);
  const [assignedPage, setAssignedPage] = useState(1);
  const [assignedSearch, setAssignedSearch] = useState("");
  const [assignedSort, setAssignedSort] = useState("Name");
  const [isLoadingAssigned, setIsLoadingAssigned] = useState(false);
  const [selectedAssigned, setSelectedAssigned] = useState<Set<string>>(new Set());

  // ── Actions ──
  const [isAssigning, setIsAssigning] = useState(false);
  const [isUnassigning, setIsUnassigning] = useState(false);

  const debouncedUnassignedSearch = useDebounce(unassignedSearch);
  const debouncedAssignedSearch = useDebounce(assignedSearch);

  // ── Fetch advisors ──────────────────────────────────────────────────────────
  const fetchAdvisors = useCallback(async () => {
    setIsLoadingAdvisors(true);
    try {
      const res = await advisorService.getAllAdvisors(1, 1000);
      const items = res.items ?? [];
      setAdvisors(items);
      if (items.length > 0) setSelectedAdvisorId((prev) => prev || items[0].id);
    } catch {
      toast.error("Failed to load advisors.");
    } finally {
      setIsLoadingAdvisors(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchAdvisors(); }, [fetchAdvisors]);

  // ── Fetch unassigned ────────────────────────────────────────────────────────
  const fetchUnassigned = useCallback(async () => {
    setIsLoadingUnassigned(true);
    try {
      const res = await advisorService.getStudentsWithoutAdvisor({
        programId: selectedProgramId,
        pageNumber: unassignedPage,
        pageSize: PAGE_SIZE,
        searchValue: debouncedUnassignedSearch || undefined,
        sortColumn: unassignedSort,
      });
      setUnassigned(res.items ?? []);
      setUnassignedTotal(res.totalCount ?? 0);
      setUnassignedPages(res.totalPages ?? 1);
    } catch {
      toast.error("Failed to load unassigned students.");
    } finally {
      setIsLoadingUnassigned(false);
    }
  }, [selectedProgramId, unassignedPage, debouncedUnassignedSearch, unassignedSort]);

  useEffect(() => { fetchUnassigned(); }, [fetchUnassigned]);

  // ── Fetch assigned ──────────────────────────────────────────────────────────
  const fetchAssigned = useCallback(async () => {
    if (!selectedAdvisorId) {
      setAssigned([]); setAssignedTotal(0); setAssignedPages(1); return;
    }
    setIsLoadingAssigned(true);
    try {
      const res = await advisorService.getAdvisorStudents({
        advisorId: selectedAdvisorId,
        academicProgramId: selectedProgramId,
        pageNumber: assignedPage,
        pageSize: PAGE_SIZE,
        searchValue: debouncedAssignedSearch || undefined,
        sortColumn: assignedSort,
      });
      setAssigned(res.items ?? []);
      setAssignedTotal(res.totalCount ?? 0);
      setAssignedPages(res.totalPages ?? 1);
    } catch {
      toast.error("Failed to load advisor's students.");
    } finally {
      setIsLoadingAssigned(false);
    }
  }, [selectedAdvisorId, selectedProgramId, assignedPage, debouncedAssignedSearch, assignedSort]);

  useEffect(() => { fetchAssigned(); }, [fetchAssigned]);

  // Reset pages on search / sort change
  useEffect(() => { setUnassignedPage(1); }, [debouncedUnassignedSearch, unassignedSort]);
  useEffect(() => { setAssignedPage(1); }, [debouncedAssignedSearch, assignedSort]);

  // Reset right panel on advisor change
  useEffect(() => {
    setSelectedUnassigned(new Set());
    setSelectedAssigned(new Set());
    setAssignedPage(1);
    setAssignedSearch("");
    setAssignedSort("Name");
  }, [selectedAdvisorId]);

  // ── Toggle helpers ──────────────────────────────────────────────────────────
  const toggleUnassigned = (id: string) =>
    setSelectedUnassigned((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const toggleAssigned = (id: string) =>
    setSelectedAssigned((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const selectAllUnassigned = () => {
    const ids = unassigned.map((s) => s.id);
    const allSel = ids.every((id) => selectedUnassigned.has(id));
    setSelectedUnassigned(allSel ? new Set() : new Set([...selectedUnassigned, ...ids]));
  };

  const selectAllAssigned = () => {
    const ids = assigned.map((s) => s.id);
    const allSel = ids.every((id) => selectedAssigned.has(id));
    setSelectedAssigned(allSel ? new Set() : new Set([...selectedAssigned, ...ids]));
  };

  // ── ASSIGN ─────────────────────────────────────────────────────────────────
  const handleAssign = async () => {
    if (!selectedAdvisorId) { toast.warning("Please select an advisor first."); return; }
    if (selectedUnassigned.size === 0) { toast.warning("Select at least one student to assign."); return; }
    setIsAssigning(true);
    try {
      await advisorService.assignAdvisor(selectedAdvisorId, [...selectedUnassigned]);
      toast.success(`${selectedUnassigned.size} student(s) assigned successfully.`);
      setSelectedUnassigned(new Set());
      await Promise.all([fetchUnassigned(), fetchAssigned()]);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? err?.response?.data?.title ?? "Failed to assign students.");
    } finally { setIsAssigning(false); }
  };

  // ── UNASSIGN ───────────────────────────────────────────────────────────────
  const handleUnassign = async () => {
    if (selectedAssigned.size === 0) { toast.warning("Select at least one student to unassign."); return; }
    setIsUnassigning(true);
    try {
      await advisorService.unassignAdvisor([...selectedAssigned]);
      toast.success(`${selectedAssigned.size} student(s) unassigned successfully.`);
      setSelectedAssigned(new Set());
      await Promise.all([fetchUnassigned(), fetchAssigned()]);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? err?.response?.data?.title ?? "Failed to unassign students.");
    } finally { setIsUnassigning(false); }
  };

  const selectedAdvisorName = useMemo(
    () => advisors.find((a) => a.id === selectedAdvisorId)?.name ?? "",
    [advisors, selectedAdvisorId]
  );

  const canAssign = selectedUnassigned.size > 0 && !!selectedAdvisorId && !isAssigning;
  const canUnassign = selectedAssigned.size > 0 && !isUnassigning;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full flex flex-col gap-6 pb-8 font-inter">

      {/* ── Page Header ── */}
      <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0]">
        <div className="flex items-start gap-4 flex-wrap mb-5">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5 text-blue-600" strokeWidth={1.8} />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Assign Academic Advisor</h1>
            </div>
            <p className="text-sm text-gray-500 ml-11">
              Select an academic advisor, then assign or unassign students.
            </p>
          </div>
        </div>

        {/* ── Advisor Selector ── */}
        <div className="flex items-end gap-3 flex-wrap">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
              Academic Advisor
            </label>
            <div className="relative">
              {isLoadingAdvisors ? (
                <div className="h-11 w-64 rounded-[12px] border border-gray-200 bg-[#f8f9fc] flex items-center px-4 gap-2 text-gray-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                </div>
              ) : (
                <>
                  <select
                    value={selectedAdvisorId}
                    onChange={(e) => setSelectedAdvisorId(e.target.value)}
                    className="appearance-none h-11 w-64 pl-4 pr-10 rounded-[12px] border border-gray-200 bg-[#f8f9fc] text-[13px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    {advisors.length === 0 && <option value="">No advisors found</option>}
                    {advisors.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Transfer Layout ── */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch min-h-[560px]">

        {/* LEFT — Unassigned */}
        <StudentPanel
          title="Unassigned Students"
          subtitle="Students without an academic advisor"
          icon={<Users className="w-4 h-4 text-gray-500" strokeWidth={1.8} />}
          accentClass="bg-gray-50/60"
          students={unassigned}
          totalCount={unassignedTotal}
          totalPages={unassignedPages}
          currentPage={unassignedPage}
          isLoading={isLoadingUnassigned}
          search={unassignedSearch}
          sortColumn={unassignedSort}
          selectedIds={selectedUnassigned}
          onSearchChange={setUnassignedSearch}
          onSortChange={setUnassignedSort}
          onPageChange={setUnassignedPage}
          onToggle={toggleUnassigned}
          onSelectAll={selectAllUnassigned}
          emptyMessage="No unassigned students found."
        />

        {/* CENTER — Action buttons */}
        <div className="flex lg:flex-col items-center justify-center gap-4 shrink-0 px-1 py-4">

          {/* → ASSIGN */}
          <button
            id="btn-assign-advisor"
            onClick={handleAssign}
            disabled={!canAssign}
            title="Assign selected students to this advisor"
            className={cn(
              "relative transition-all duration-200 active:scale-95 rounded-[15.3px] outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
              canAssign ? "opacity-100 cursor-pointer hover:brightness-95 shadow-[0_4px_16px_rgba(36,99,240,0.25)]" : "opacity-40 cursor-not-allowed"
            )}
          >
            {isAssigning ? (
              <div className="w-[73px] h-[48px] rounded-[15.3px] border border-[#3B81F6] bg-[#F5FAFF] flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-[#2463F0]" />
              </div>
            ) : (
              <Image
                src="/student-affairs/btnAssign.svg"
                alt="Assign"
                width={73}
                height={48}
                priority
              />
            )}
            {selectedUnassigned.size > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center bg-blue-600 text-white shadow-sm">
                {selectedUnassigned.size}
              </span>
            )}
          </button>

          {/* ← UNASSIGN */}
          <button
            id="btn-unassign-advisor"
            onClick={handleUnassign}
            disabled={!canUnassign}
            title="Unassign selected students from this advisor"
            className={cn(
              "relative transition-all duration-200 active:scale-95 rounded-[15.3px] outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
              canUnassign ? "opacity-100 cursor-pointer hover:brightness-95 shadow-[0_4px_16px_rgba(36,99,240,0.15)]" : "opacity-40 cursor-not-allowed"
            )}
          >
            {isUnassigning ? (
              <div className="w-[73px] h-[48px] rounded-[15.3px] border border-[#3B81F6] bg-[#F5FAFF] flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-[#2463F0]" />
              </div>
            ) : (
              <Image
                src="/student-affairs/btnUnAssign.svg"
                alt="Unassign"
                width={73}
                height={48}
                priority
              />
            )}
            {selectedAssigned.size > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center bg-blue-600 text-white shadow-sm">
                {selectedAssigned.size}
              </span>
            )}
          </button>
        </div>

        {/* RIGHT — Assigned */}
        <StudentPanel
          title={selectedAdvisorName ? `${selectedAdvisorName}'s Students` : "Advisor's Students"}
          subtitle="Students currently assigned to this advisor"
          icon={<UserCheck className="w-4 h-4 text-blue-600" strokeWidth={1.8} />}
          accentClass="bg-blue-50/30"
          students={assigned}
          totalCount={assignedTotal}
          totalPages={assignedPages}
          currentPage={assignedPage}
          isLoading={isLoadingAssigned}
          search={assignedSearch}
          sortColumn={assignedSort}
          selectedIds={selectedAssigned}
          onSearchChange={setAssignedSearch}
          onSortChange={setAssignedSort}
          onPageChange={setAssignedPage}
          onToggle={toggleAssigned}
          onSelectAll={selectAllAssigned}
          emptyMessage={
            selectedAdvisorId
              ? "This advisor has no assigned students yet."
              : "Select an advisor to see their students."
          }
        />
      </div>
    </div>
  );
}
