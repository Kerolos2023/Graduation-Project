"use client";

import React, { useState } from "react";
import axiosInstance from "@/lib/axios";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import Link from "next/link";
import Image from "next/image";

const formSchema = z.object({
  userName: z.string().min(1, "Username is required"),
  email: z.string().email("Please enter a valid email address"),
});

export default function ForgetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setEmail, setUserName } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userName: "",
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {

      const response = await axiosInstance.post("/Auth/send-reset-password", values);

      if (response.status === 200 || response.status === 201) {
        setEmail(values.email);
        setUserName(values.userName);
        alert("Reset link sent successfully!");
        router.replace("/auth/verification-password");
      }
    } catch (error: any) {

      const errorMessage = error.response?.data?.message || "Something went wrong";
      alert(`Error: ${errorMessage}`);
      console.error("API Error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F9F9FA] p-4">
      <div className="mb-8 w-24 h-24 flex items-center justify-center">
        <Image
          src="/auth/Header.png"
          alt="Universe Logo"
          width={40}
          height={40}
          priority
          className="w-15 h-15"
        />
      </div>

      <Card className="w-full max-w-[450px] border-none shadow-xl rounded-[24px] pt-8">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <KeyRound className="w-6 h-6 text-gray-700" />
            </div>
            <CardTitle className="text-[26px] font-semibold leading-[125%] text-neutral-950">Forget Password</CardTitle>
          </div>
          <CardDescription className="text-gray-400 text-[15px] pt-1 font-normal">
            Please enter the Email.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="userName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-[14px] leading-none tracking-normal text-neutral-950">Username (Student ID)</FormLabel>
                    <FormControl>
                      <Input placeholder="Admin" {...field} disabled={isLoading} className="h-12 rounded-xl border-gray-200" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-[14px] leading-none tracking-normal text-neutral-950">Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Admin@Universe.com" {...field} disabled={isLoading} className="h-12 rounded-xl border-gray-200" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-[#2463F0] hover:bg-blue-700 text-lg font-semibold rounded-xl"
              >
                {isLoading ? (
                  <>
                    <Loader className="mr-2 h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-5 pb-10">
          <div className="flex gap-6 text-[13px] font-semibold text-neutral-400">
            <Link
              href="/auth/login"
              className="hover:text-blue-600 transition-colors"
            >
              Sign In
            </Link>
            <button className="font-normal hover:text-blue-600 transition-colors">Contact Us</button>
            <button className="font-normal hover:text-blue-600 transition-colors">Terms of Use</button>
          </div>
        </CardFooter>
      </Card>

      <footer className="mt-16 text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">
        © 2026 Universe
      </footer>
    </div>
  );
}