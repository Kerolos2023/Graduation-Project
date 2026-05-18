import React from "react";
import {
  Search,
  ChevronDown,
  Loader2,
  ArrowUpDown,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { type StudentItem } from "@/services/advisorServices";
import { Pagination } from "@/components/ui/pagination";
import { StudentCard } from "./StudentCard";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

export const SORT_OPTIONS = [
  { value: "Name", label: "Name" },
  { value: "StudentCode", label: "Student Code" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface StudentPanelProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accentClass: string;
  students: StudentItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  search: string;
  sortColumn: string;
  selectedIds: Set<string>;
  onSearchChange: (v: string) => void;
  onSortChange: (v: string) => void;
  onPageChange: (p: number) => void;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  emptyMessage?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const StudentPanel: React.FC<StudentPanelProps> = ({
  title, subtitle, icon, accentClass,
  students, totalCount, totalPages, currentPage,
  isLoading, search, sortColumn, selectedIds,
  onSearchChange, onSortChange, onPageChange,
  onToggle, onSelectAll,
  emptyMessage = "No students found.",
}) => {
  const allCurrentSelected =
    students.length > 0 && students.every((s) => selectedIds.has(s.id));

  return (
    <div className="flex-1 min-w-0 flex flex-col bg-white rounded-[20px] border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] overflow-hidden">

      {/* ── Panel Header ── */}
      <div className={cn("px-5 pt-5 pb-4 border-b border-gray-100", accentClass)}>
        <div className="flex items-center gap-2.5 mb-0.5">
          {icon}
          <h2 className="text-[15px] font-bold text-gray-900 truncate">{title}</h2>
          {/* totalCount badge — uses the real API total, not current page count */}
          <span className="ml-auto shrink-0 text-[11px] font-bold bg-white border border-gray-200 px-2.5 py-0.5 rounded-full text-gray-700 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            {totalCount}
          </span>
        </div>
        <p className="text-[12px] text-gray-500 ml-7">{subtitle}</p>
      </div>

      {/* ── Toolbar: Search + Sort ── */}
      <div className="px-4 pt-3 pb-2 flex items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name or code…"
            className="w-full h-9 pl-8 pr-3 rounded-[10px] border border-gray-200 text-[13px] bg-[#f8f9fc] focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder-gray-400"
          />
        </div>

        {/* Sort selector */}
        <div className="relative shrink-0">
          <ArrowUpDown className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
          <select
            value={sortColumn}
            onChange={(e) => onSortChange(e.target.value)}
            className="appearance-none h-9 pl-7 pr-6 rounded-[10px] border border-gray-200 bg-[#f8f9fc] text-[12px] font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
        </div>
      </div>

      {/* ── Select all ── */}
      {students.length > 0 && (
        <div className="px-4 pb-1.5">
          <button
            onClick={onSelectAll}
            className="text-[12px] font-semibold text-blue-600 hover:underline cursor-pointer"
          >
            {allCurrentSelected ? "Deselect all on page" : "Select all on page"}
          </button>
        </div>
      )}

      {/* ── List ── */}
      <div className="flex-1 overflow-y-auto px-4 pb-3 space-y-2 min-h-[220px] custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center h-full py-12 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#2463F0]" />
            <span className="text-[13px] text-gray-400 ml-1">Loading…</span>
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 gap-2 text-gray-400">
            <Users className="w-8 h-8 opacity-30" strokeWidth={1.3} />
            <p className="text-[13px]">{emptyMessage}</p>
          </div>
        ) : (
          students.map((s) => (
            <StudentCard
              key={s.id}
              student={s}
              selected={selectedIds.has(s.id)}
              onToggle={onToggle}
            />
          ))
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-100">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};
