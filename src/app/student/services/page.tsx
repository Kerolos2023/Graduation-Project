"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, ShoppingCart, Loader2, AlertCircle, ShoppingBag } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import {
  studentServicesService,
  type ServiceItem,
} from "@/services/studentServicesServics";

const PAGE_SIZE = 10;

export default function ServicesPage() {
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);
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
      if (totalItems === null) setTotalItems((res.totalPages ?? 1) * PAGE_SIZE);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, totalItems]);

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
      window.location.href = res.approvalUrl;
    } catch {
      setPayError(`Payment initiation failed for "${service.name}". Please try again.`);
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-5 h-full">

      {/* ── Header ── */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Title + badge */}
        <div className="flex items-center gap-2.5 shrink-0">
          <h1 className="text-xl font-bold text-gray-900">Buyable</h1>
          {totalItems !== null && (
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold border border-blue-100">
              {totalItems} Service{totalItems !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Search — right side */}
        <form
          onSubmit={handleSearch}
          className="ml-auto relative"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search"
            className="w-56 pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition shadow-sm"
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

      {/* ── Content ── */}
      {loading ? (
        <div className="flex items-center justify-center flex-1 text-gray-400 text-sm gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading…
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

// ─── Service Card ─────────────────────────────────────────────────────────────

interface ServiceCardProps {
  service: ServiceItem;
  isPaying: boolean;
  onPay: () => void;
}

function ServiceCard({ service, isPaying, onPay }: ServiceCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-all">

      {/* ── Top row: Name | Amount | Pay ── */}
      <div className="flex items-center px-5 pt-5 pb-4 gap-3">

        {/* Service Name */}
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <span className="text-[11px] font-medium text-gray-400">Service Name</span>
          <span className="text-[15px] font-bold text-gray-900 truncate leading-snug">
            {service.name}
          </span>
        </div>

        {/* Amount */}
        <div className="flex flex-col gap-0.5 shrink-0">
          <span className="text-[11px] font-medium text-gray-400">Amount</span>
          <span className="text-[15px] font-bold text-gray-900 leading-snug">
            ${service.price.toFixed(2)}{" "}
            <span className="text-xs font-normal text-gray-400">USD</span>
          </span>
        </div>

        {/* Pay button */}
        <button
          onClick={onPay}
          disabled={isPaying}
          className="ml-auto shrink-0 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-semibold rounded-xl shadow-sm shadow-blue-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isPaying ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ShoppingCart className="w-4 h-4" />
          )}
          <span>{isPaying ? "Processing…" : "Pay"}</span>
        </button>
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-gray-100" />

      {/* ── Description ── */}
      <p className="px-5 py-4 text-[13px] text-gray-500 leading-relaxed line-clamp-3">
        {service.description}
      </p>
    </div>
  );
}

