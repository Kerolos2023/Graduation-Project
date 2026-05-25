"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, ShoppingBag, Loader2, ClipboardList } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import {
  studentServicesService,
  type ServiceHistoryItem,
} from "@/services/studentServicesServics";

function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { dot: string; bg: string; text: string; border: string }> = {
  Pending: {
    dot: "bg-amber-400",
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
  },
  Approved: {
    dot: "bg-emerald-500",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
  },
  Rejected: {
    dot: "bg-red-500",
    bg: "bg-red-50",
    text: "text-red-500",
    border: "border-red-200",
  },
};

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_MAP[status] ?? STATUS_MAP["Pending"];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      {status}
    </span>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

// ─── Page ─────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

export default function ServicesHistoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<ServiceHistoryItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState<number | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useDebounce(searchInput);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await studentServicesService.getHistory(currentPage, PAGE_SIZE, debouncedSearch);
      setItems(res.items ?? []);
      setTotalPages(res.totalPages ?? 1);
      setTotalItems(res.totalCount ?? 0);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="flex flex-col gap-5 h-full">

      {/* ── Header ── */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Title + badge */}
        <div className="flex items-center gap-2.5 shrink-0">
          <h1 className="text-xl font-bold text-gray-900">Services</h1>
          {totalItems !== null && (
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold border border-blue-100">
              {totalItems} Request{totalItems !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Search — center */}
        <div className="flex-1 min-w-[160px] max-w-xs mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search"
            className="w-full pl-10 pr-5 py-2.5 rounded-full border border-gray-200 bg-white text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition shadow-sm"
          />
        </div>

        {/* CTA button */}
        <button
          onClick={() => router.push("/student/services")}
          className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[.98] text-white text-sm font-semibold transition-all shadow-sm shadow-blue-200 cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
          Request a New Service
        </button>
      </div>

      {/* ── Table card ── */}
      <div className="flex-1 min-h-0 flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden">

        {loading ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-3 text-gray-400 text-sm py-20">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-3 py-20">
            <ClipboardList className="w-10 h-10 text-gray-300" />
            <p className="text-gray-400 text-sm font-medium">No service requests found</p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full min-w-[800px] border-collapse">

              {/* Head */}
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-100 border-b border-gray-200">
                  {["Order ID", "Service Name", "Status", "Amount", "Created At", "Updated At"].map((col) => (
                    <th
                      key={col}
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Body */}
              <tbody className="divide-y divide-gray-100">
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/60 transition-colors">

                    {/* Order ID */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono font-semibold text-gray-700">
                        #{item.studentCode}
                      </span>
                    </td>

                    {/* Service Name */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-800">
                        {item.serviceName}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={item.status} />
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-800">
                        ${item.price.toFixed(2)}{" "}
                        <span className="text-xs font-normal text-gray-400">EGP</span>
                      </span>
                    </td>

                    {/* Created At */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm text-gray-700 font-medium">
                          {formatDate(item.createdAt)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatTime(item.createdAt)}
                        </span>
                      </div>
                    </td>

                    {/* Updated At */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.updatedAt ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm text-gray-700 font-medium">
                            {formatDate(item.updatedAt)}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatTime(item.updatedAt)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex justify-center shrink-0 pb-1">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </div>
      )}
    </div>
  );
}
