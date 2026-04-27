"use client";

import { useRouter } from "next/navigation";
import { CheckCircle, ArrowLeft } from "lucide-react";

export default function PaymentSuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-full flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* ── Success header ── */}
        <div className="flex flex-col items-center gap-4 py-12 px-8 bg-gradient-to-b from-emerald-50 to-white">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-emerald-500" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold text-emerald-600">Payment Successful!</h1>
          <p className="text-sm text-gray-500 text-center leading-relaxed">
            Your service request has been submitted successfully.
          </p>
        </div>

        {/* ── Action ── */}
        <div className="px-8 pb-10">
          <button
            onClick={() => router.push("/student/services")}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[.98] text-white text-sm font-semibold transition-all shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Services
          </button>
        </div>
      </div>
    </div>
  );
}
