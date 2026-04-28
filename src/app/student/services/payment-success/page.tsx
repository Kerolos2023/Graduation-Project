"use client";

import { useRouter } from "next/navigation";
import {
  CheckCircle,
  ArrowLeft,
  ShoppingBag,
  Sparkles,
  ReceiptText,
} from "lucide-react";

export default function PaymentSuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-full flex items-center justify-center p-6 md:p-12">
      <div className="w-full max-w-2xl flex flex-col gap-0 rounded-3xl overflow-hidden shadow-2xl shadow-emerald-100 border border-emerald-100">

        {/* ── Hero banner ── */}
        <div className="relative flex flex-col items-center gap-6 py-14 px-10 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 overflow-hidden">

          {/* Background decorative circles */}
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -bottom-14 -left-10 w-56 h-56 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute top-6 left-8 w-6 h-6 rounded-full bg-white/20 pointer-events-none" />

          {/* Icon ring */}
          <div className="relative z-10 flex items-center justify-center w-24 h-24 rounded-full bg-white/20 ring-4 ring-white/30 shadow-xl">
            <CheckCircle className="w-12 h-12 text-white drop-shadow-md" strokeWidth={1.75} />
          </div>

          {/* Headline */}
          <div className="relative z-10 flex flex-col items-center gap-2 text-center">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span className="text-emerald-200 text-sm font-semibold uppercase tracking-widest">
                Transaction Complete
              </span>
              <Sparkles className="w-4 h-4 text-emerald-200" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow">
              Payment Successful!
            </h1>
            <p className="text-emerald-100 text-base max-w-sm leading-relaxed">
              Your service request has been submitted and is now being processed.
              You&apos;ll receive a confirmation shortly.
            </p>
          </div>
        </div>

        {/* ── Info cards row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-gray-100">
          {/* Status */}
          <div className="bg-white flex items-start gap-4 p-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5 text-emerald-500" strokeWidth={2} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Status
              </span>
              <span className="text-sm font-bold text-gray-800">Confirmed &amp; Processing</span>
              <span className="text-xs text-gray-500 leading-relaxed">
                Payment verified and request submitted.
              </span>
            </div>
          </div>

          {/* Next Step */}
          <div className="bg-white flex items-start gap-4 p-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <ReceiptText className="w-5 h-5 text-blue-500" strokeWidth={2} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Next Step
              </span>
              <span className="text-sm font-bold text-gray-800">Track Your Request</span>
              <span className="text-xs text-gray-500 leading-relaxed">
                View your request history in Services.
              </span>
            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="bg-white px-8 py-8 flex flex-col sm:flex-row items-center justify-center gap-4 border-t border-gray-100">
          <button
            onClick={() => router.push("/student/services")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[.98] text-white text-sm font-bold transition-all shadow-md shadow-blue-200 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            Browse More Services
          </button>

          <button
            onClick={() => router.push("/student/services")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 active:scale-[.98] text-gray-700 text-sm font-semibold transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Services
          </button>
        </div>
      </div>
    </div>
  );
}
