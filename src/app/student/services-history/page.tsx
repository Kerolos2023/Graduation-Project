"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, ClipboardList } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  studentServicesService,
  type ServiceHistoryItem,
} from "@/services/studentServicesService";

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_MAP: Record<number, { label: string; className: string; dot: string }> = {
  0: {
    label: "Pending",
    className:
      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200",
    dot: "bg-amber-500",
  },
  1: {
    label: "Approved",
    className:
      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200",
    dot: "bg-emerald-500",
  },
  2: {
    label: "Rejected",
    className:
      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-500 border border-red-200",
    dot: "bg-red-500",
  },
};

const StatusBadge = ({ status }: { status: number }) => {
  const cfg = STATUS_MAP[status] ?? STATUS_MAP[0];
  return (
    <span className={cfg.className}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

// ─── Page ─────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

export default function ServicesHistoryPage() {
  const [items, setItems] = useState<ServiceHistoryItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await studentServicesService.getHistory(currentPage, PAGE_SIZE, search);
      setItems(res.items ?? []);
      setTotalPages(res.totalPages ?? 1);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearch(searchInput);
  };

  return (
    <div className="flex flex-col gap-6 h-full">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-200">
            <ClipboardList className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Services</h1>
            <p className="text-sm text-gray-500">Track your service requests</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="relative w-full sm:w-auto">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search services…"
            className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition shadow-sm"
          />
        </form>
      </div>

      {/* ── Table card ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col flex-1 min-h-0 overflow-hidden">

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm flex-1">
            Loading…
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 flex-1">
            <ClipboardList className="w-10 h-10 text-gray-300" />
            <p className="text-gray-400 text-sm font-medium">No service requests found</p>
          </div>
        ) : (
          /* Table wraps its own overflow-x-auto internally */
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Student Code
                  </TableHead>
                  <TableHead className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Service Name
                  </TableHead>
                  <TableHead className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Amount
                  </TableHead>
                  <TableHead className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Created
                  </TableHead>
                  <TableHead className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Updated
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.map((item, idx) => (
                  <TableRow key={idx} className="hover:bg-gray-50/60 transition-colors border-gray-100">

                    {/* Student Code */}
                    <TableCell className="px-6 py-4">
                      <span className="text-sm font-mono font-semibold text-gray-700">
                        #{item.studentCode}
                      </span>
                    </TableCell>

                    {/* Service Name */}
                    <TableCell className="px-6 py-4 max-w-[200px]">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold text-gray-800 truncate">
                          {item.serviceName}
                        </span>
                        <span className="text-xs text-gray-400">{item.studentName}</span>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="px-6 py-4">
                      <StatusBadge status={item.status} />
                    </TableCell>

                    {/* Amount */}
                    <TableCell className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-800">
                        ${item.price.toFixed(2)}{" "}
                        <span className="text-xs font-normal text-gray-400">EGP</span>
                      </span>
                    </TableCell>

                    {/* Created */}
                    <TableCell className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm text-gray-700">{formatDate(item.createdAt)}</span>
                        <span className="text-xs text-gray-400">{formatTime(item.createdAt)}</span>
                      </div>
                    </TableCell>

                    {/* Updated */}
                    <TableCell className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm text-gray-700">{formatDate(item.updatedAt)}</span>
                        <span className="text-xs text-gray-400">{formatTime(item.updatedAt)}</span>
                      </div>
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex justify-center shrink-0">
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
