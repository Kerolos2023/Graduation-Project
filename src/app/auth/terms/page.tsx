"use client"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft, ShieldCheck, FileText, Scale, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TermsPage() {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-between p-6 md:p-12">

            <div className="w-full max-w-4xl mx-auto flex items-center justify-between mb-8">
                <div className="flex flex-col items-start">
                    <Image
                        src="/auth/Header.png"
                        alt="Universe Logo"
                        width={40}
                        height={40}
                        priority
                        className="w-15 h-15"
                    />
                </div>

                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="text-slate-600 hover:text-[#1a62ff] flex items-center gap-2 rounded-xl"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>
            </div>

            <div className="w-full max-w-4xl mx-auto bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-slate-100/50 border border-slate-100 flex-1">

                <div className="border-b border-slate-100 pb-6 mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <span className="text-[#1a62ff]">Terms & Conditions</span>
                    </h1>
                    <p className="text-slate-400 text-sm mt-2">Last updated: June 2026</p>
                </div>


                <div className="space-y-8 text-left">

                    <div className="flex gap-4">
                        <div className="p-2.5 bg-blue-50 rounded-xl h-fit text-[#1a62ff]">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-bold text-slate-800">1. Acceptance of Terms</h3>
                            <p className="text-slate-500 leading-relaxed text-sm md:text-base">
                                By accessing and using the Universe College Management System, you agree to be bound by these Terms and Conditions. If you do not agree, please refrain from using the platform.
                            </p>
                        </div>
                    </div>


                    <div className="flex gap-4">
                        <div className="p-2.5 bg-blue-50 rounded-xl h-fit text-[#1a62ff]">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-bold text-slate-800">2. User Accounts & Security</h3>
                            <p className="text-slate-500 leading-relaxed text-sm md:text-base">
                                Students and academic staff are responsible for maintaining the confidentiality of their account credentials. Any unauthorized academic activities or grade manipulation attempts will lead to immediate suspension.
                            </p>
                        </div>
                    </div>


                    <div className="flex gap-4">
                        <div className="p-2.5 bg-blue-50 rounded-xl h-fit text-[#1a62ff]">
                            <Scale className="w-5 h-5" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-bold text-slate-800">3. Acceptable Use Policy</h3>
                            <p className="text-slate-500 leading-relaxed text-sm md:text-base">
                                The platform is designed exclusively for course registration, academic management, and student affairs. Users may not upload malicious software or attempt to breach system security protocols.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="p-2.5 bg-blue-50 rounded-xl h-fit text-[#1a62ff]">
                            <HelpCircle className="w-5 h-5" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-bold text-slate-800">4. Support & Modifications</h3>
                            <p className="text-slate-500 leading-relaxed text-sm md:text-base">
                                Universe reserves the right to update features, database levels, and grading settings at any time to preserve clean architecture and meet academic requirements. For queries, please use our Contact page.
                            </p>
                        </div>
                    </div>

                </div>

            </div>

            <div className="text-center mt-8 pt-4 w-full">
                <p className="text-xs text-[#A4A7AE]">© 2026 Universe</p>
            </div>

        </div>
    )
}