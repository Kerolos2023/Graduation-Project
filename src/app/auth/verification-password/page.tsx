"use client";

import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Loader } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { useRouter } from "next/navigation";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const formSchema = z.object({
    code: z.string().length(6, "Code must be exactly 6 characters"),
});

export default function VerificationPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const router = useRouter();
    // Read temp reset data stored by forget-password page
    const email    = typeof window !== 'undefined' ? sessionStorage.getItem('resetEmail')    ?? '' : '';
    const userName = typeof window !== 'undefined' ? sessionStorage.getItem('resetUserName') ?? '' : '';

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { code: "" },
        mode: "onChange",
    });


    const codeValue = form.watch("code");
    const isCodeValid = codeValue.length === 6;

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!email) {
            alert("Email not found. Please restart the reset process.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await axiosInstance.post("/Auth/Verification-Reset-Password-Code", {
                email: email,
                code: values.code,
            });

            if (response.status === 200) {
                alert("Verification successful!");
                router.replace("/auth/reset-password");
            }
        } catch (error: any) {
            const serverMsg = error.response?.data?.errors?.[0] || error.response?.data?.message || "Invalid code";
            alert(`Error: ${serverMsg}`);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleResend() {
        if (!email || !userName) {
            alert("Email or Username not found. Please restart the reset process.");
            return;
        }
        setIsResending(true);
        try {
            await axiosInstance.post("/Auth/send-reset-password", {
                userName: userName,
                email: email,
            });
            alert("A new code has been sent to your email.");
            setTimeLeft(60);
        } catch (error: any) {
            alert("Failed to resend code.");
        } finally {
            setIsResending(false);
        }
    }

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f4f4f4] p-4 font-sans">
            <div className="mb-10 w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center">
                <Image src="/auth/Header.png" alt="Universe Logo" width={40} height={40} priority className="w-10 h-10" />
            </div>

            <Card className="w-full max-w-[440px] border-none shadow-xl rounded-[24px] pt-8 bg-white overflow-hidden">
                <CardHeader className="space-y-3 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#1a1a1a] p-2 rounded-lg">
                            <Mail className="w-5 h-5 text-white" />
                        </div>
                        <CardTitle className="font-semibold text-[26px] leading-[1.25] tracking-normal text-neutral-950">Check the Index</CardTitle>
                    </div>
                    <CardDescription className="text-gray-400 text-[14.5px] leading-relaxed font-normal">
                        Please enter the verification code we sent to <span className="text-gray-900 font-bold">{email || "your email"}</span>
                    </CardDescription>
                </CardHeader>

                <CardContent className="pb-10">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold text-gray-800 ml-1 text-sm">Code</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter 6-digit code"
                                                {...field}
                                                maxLength={6}
                                                disabled={isLoading || isResending}
                                                className="h-13 rounded-xl border-gray-100 bg-white shadow-sm focus-visible:ring-blue-600 transition-all placeholder:text-gray-300"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex flex-col items-center gap-4">

                                <Button
                                    type="submit"
                                    disabled={isLoading || isResending || !isCodeValid}
                                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed rounded-xl font-bold text-lg text-white shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
                                >
                                    {isLoading ? <Loader className="animate-spin" /> : "Verify Code"}
                                </Button>

                                <button
                                    type="button"
                                    disabled={timeLeft > 0 || isResending}
                                    className={`text-[15px] font-semibold transition-all ${timeLeft > 0 ? "text-gray-300 cursor-not-allowed" : "text-neutral-400 hover:text-blue-800 cursor-pointer"
                                        }`}
                                    onClick={handleResend}
                                >
                                    {isResending ? "Sending..." : `Resend (${timeLeft}s)`}
                                </button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <footer className="mt-18 text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                © 2026 Universe
            </footer>
        </div>
    );
}