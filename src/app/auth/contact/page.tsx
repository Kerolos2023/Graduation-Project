 "use client"

import React, { useState } from "react"
import Image from "next/image" 
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { User, Mail, MessageSquare, GraduationCap, Loader2 } from "lucide-react"
import { sendContactMessage } from "@/services/contactServices" 

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)

    const formData = new FormData(e.currentTarget)
    const payload = {
      fullName: formData.get("fullName") as string,
      email: formData.get("email") as string,
      message: formData.get("message") as string,
    }

    try {
      await sendContactMessage(payload)
      setStatus({ type: "success", msg: "Awesome! Your message has been sent successfully." })
      ;(e.target as HTMLFormElement).reset() 
    } catch (err: any) {
      setStatus({ type: "error", msg: err.message || "Something went wrong. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-between p-6 md:p-12">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-12 items-center mx-auto flex-1 flex items-center justify-center">
        
        {/* Left Side */}
        <div className="space-y-6 text-left w-full">
          
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

          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
            Lets Get in <span className="text-[#1a62ff]">Touch!</span>
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed max-w-md">
            Have a question or need assistance with the SVNU System? Reach out to us via email, or the contact form. We're eager to assist you.
          </p>
          <p className="text-[#1a62ff] font-medium text-lg">Thank you for reaching out</p>

          <div className="relative pt-8 hidden md:block">
            <div className="w-72 h-72 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100/50 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#1a62ff]/10 to-transparent opacity-60" />
              <GraduationCap className="w-32 h-32 text-[#1a62ff] relative z-10 stroke-[1.2]" />
            </div>
          </div>
        </div>

         <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-slate-100/50 border border-slate-100 space-y-6 w-full">
          <form onSubmit={handleSubmit} className="space-y-5">
            {status && (
              <div className={`p-4 rounded-xl text-sm font-medium ${status.type === "success" ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"}`}>
                {status.msg}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Full Name:</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input name="fullName" type="text" required placeholder="Mahmoud Rashedy" className="pl-12 h-12 bg-[#f8f9fa] border-slate-200 rounded-xl focus-visible:ring-[#1a62ff]" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email:</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input name="email" type="email" required placeholder="example@email.com" className="pl-12 h-12 bg-[#f8f9fa] border-slate-200 rounded-xl focus-visible:ring-[#1a62ff]" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Message:</label>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
                <Textarea name="message" required placeholder="How can we help you today?" className="pl-12 pt-3 min-h-[140px] bg-[#f8f9fa] border-slate-200 rounded-xl focus-visible:ring-[#1a62ff] resize-none" />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full md:w-auto px-8 h-12 bg-[#1a62ff] hover:bg-[#1552d4] text-white rounded-xl font-medium shadow-md flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </form>
        </div>

      </div>

       <div className="text-center mt-8 pt-4 w-full">
        <p className="text-xs text-[#A4A7AE]">© 2026 Universe</p>
      </div>
    </div>
  )
}