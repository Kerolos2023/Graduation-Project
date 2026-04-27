"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, ShoppingBag, Loader2, AlertCircle } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import {
  studentServicesService,
  type ServiceItem,
} from "@/services/studentServicesService";

const PAGE_SIZE = 10;

export default function ServicesPage() {
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);

  // per-card pay loading state
  const [payingId, setPayingId] = useState<string | null>(null);

  // inline error (e.g. checkout failed)
  const [payError, setPayError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await studentServicesService.getServices(
        currentPage,
        PAGE_SIZE,
        search
      );
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

  const handlePay = async (service: ServiceItem) => {
    setPayingId(service.id);
    setPayError(null);
    try {
      const res = await studentServicesService.checkout(service.id);
      // redirect to PayPal approval URL
      window.location.href = res.approvalUrl;
    } catch {
      setPayError(`Payment initiation failed for "${service.name}". Please try again.`);
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-200">
            <ShoppingBag className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Buy Services</h1>
            <p className="text-sm text-gray-500">Browse and pay for available services</p>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search services…"
            className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition shadow-sm"
          />
        </form>
      </div>

      {/* ── Error banner ── */}
      {payError && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium shrink-0">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{payError}</span>
          <button
            onClick={() => setPayError(null)}
            className="ml-auto text-red-400 hover:text-red-600 transition cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Cards grid ── */}
      {loading ? (
        <div className="flex items-center justify-center flex-1 text-gray-400 text-sm gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading…
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-3">
          <ShoppingBag className="w-10 h-10 text-gray-300" />
          <p className="text-gray-400 text-sm font-medium">No services available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0 overflow-y-auto custom-scrollbar pb-2">
          {items.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              isPaying={payingId === service.id}
              onPay={() => handlePay(service)}
            />
          ))}
        </div>
      )}

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

// ─── Service Card ─────────────────────────────────────────────────────────────

interface ServiceCardProps {
  service: ServiceItem;
  isPaying: boolean;
  onPay: () => void;
}

function ServiceCard({ service, isPaying, onPay }: ServiceCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md hover:border-blue-100 transition-all">

      {/* ── Top row: Name + Amount (left) + Pay (right) ── desktop only layout ── */}
      <div className="flex items-center justify-between gap-4">

        {/* Left group: Service Name + divider + Amount */}
        <div className="flex items-center gap-4 min-w-0">

          {/* Service Name */}
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Service Name
            </span>
            <span className="text-[15px] font-bold text-gray-900 truncate">
              {service.name}
            </span>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-8 bg-gray-200 shrink-0" />

          {/* Amount */}
          <div className="hidden sm:flex flex-col gap-0.5 shrink-0">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Amount
            </span>
            <span className="text-[15px] font-bold text-gray-900">
              ${service.price.toFixed(2)}{" "}
              <span className="text-xs font-normal text-gray-400">EGP</span>
            </span>
          </div>
        </div>

        {/* Pay button — desktop only (right side) */}
        <button
          onClick={onPay}
          disabled={isPaying}
          className="hidden sm:flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-semibold rounded-xl shadow-sm shadow-blue-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shrink-0 min-w-[80px]"
        >
          {isPaying && <Loader2 className="w-4 h-4 animate-spin" />}
          {isPaying ? "Processing…" : "Pay"}
        </button>
      </div>

      {/* Amount — mobile only */}
      <div className="flex flex-col gap-0.5 sm:hidden">
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          Amount
        </span>
        <span className="text-[15px] font-bold text-gray-900">
          ${service.price.toFixed(2)}{" "}
          <span className="text-xs font-normal text-gray-400">EGP</span>
        </span>
      </div>

      {/* ── Description ── */}
      <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 border-t border-gray-100 pt-3">
        {service.description}
      </p>

      {/* Pay button — mobile only (below description) */}
      <button
        onClick={onPay}
        disabled={isPaying}
        className="sm:hidden flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-semibold rounded-xl shadow-sm shadow-blue-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        {isPaying && <Loader2 className="w-4 h-4 animate-spin" />}
        {isPaying ? "Processing…" : "Pay"}
      </button>
    </div>
  );
}
