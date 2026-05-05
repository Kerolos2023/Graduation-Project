'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { useRole } from '@/hooks/roleCoontext';
import axiosInstance from '@/lib/axios';

// role mapping
const roleRoutes: Record<string, string> = {
    Student: "/student/basic-data-profile",
    Staff: "/staff/course-result",
    AcademicAdvising: "/student-affairs/college-data/courses",
};

// choose main role
const getMainRole = (roles: string[]) => {
    if (roles.includes("AcademicAdvising")) return "AcademicAdvising";
    if (roles.includes("Staff")) return "Staff";
    if (roles.includes("Student")) return "Student";
    return roles[0] || "";
};

export default function Loginpag() {

    const [userName, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const router = useRouter();
    const { setActiveRole, setSessionRoles } = useRole();

    // Safe redirect
    useEffect(() => {
        const token = localStorage.getItem("token");
        const activeRole = localStorage.getItem("activeRole");

        // لو البيانات ناقصة → مفيش redirect
        if (!token || !activeRole) return;

        // لو role مش معروف → امسحه
        if (!roleRoutes[activeRole]) {
            localStorage.removeItem("activeRole");
            return;
        }

        // redirect آمن
        router.replace(roleRoutes[activeRole]);

    }, [router]);

    const handlesubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        setLoading(true);

        try {
            const response = await axiosInstance.post('/Auth/login', {
                userName,
                password,
                rememberMe
            });

            if (response.status === 200) {

                const roles: string[] = Array.isArray(response.data.roles)
                    ? response.data.roles
                    : [];

                const token = response.data.token;

                // store
                localStorage.setItem("token", token);
                setSessionRoles(roles);

                const selectedRole = getMainRole(roles);

                if (selectedRole && roleRoutes[selectedRole]) {
                    setActiveRole(selectedRole);

                    // redirect آمن
                    router.replace(roleRoutes[selectedRole]);
                } else {
                    setErrorMessage("No valid role found");
                }
            }

        } catch (error: any) {

            if (error.response?.status === 401) {
                setErrorMessage('Invalid username or password');
            } else {
                setErrorMessage('Something went wrong. Please try again.');
            }

        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">

                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <Image
                        src="/auth/Header.png"
                        alt="Universe Logo"
                        width={40}
                        height={40}
                        priority
                        className="w-15 h-15"
                    />
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8">

                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Sign In
                        </h1>

                        <p className="text-sm text-gray-500">
                            Welcome to SVNU System
                        </p>
                    </div>

                    <form className="space-y-4" onSubmit={handlesubmit}>

                        <input
                            type="text"
                            value={userName}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                setErrorMessage('');
                            }}
                            placeholder="Username"
                            className="w-full px-4 py-3 border rounded-xl"
                            required
                        />

                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setErrorMessage('');
                                }}
                                placeholder="Password"
                                className="w-full px-4 py-3 border rounded-xl pr-12"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            Remember Me
                        </label>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition disabled:opacity-50"
                        >
                            {loading ? "Signing In..." : "Sign In"}
                        </button>

                        {errorMessage && (
                            <p className="text-red-600 text-sm">
                                {errorMessage}
                            </p>
                        )}

                    </form>

                    <div className="mt-6 flex justify-center gap-4 text-sm">
                        <Link href="/auth/forget-password" className="text-gray-500 hover:text-black">
                            Forget Password
                        </Link>
                        <Link href="/contact-us" className="text-gray-400 hover:text-black">
                            Contact Us
                        </Link>
                        <Link href="/auth/signup" className="text-gray-400 hover:text-black">
                            Terms
                        </Link>
                    </div>

                </div>

                <div className="text-center mt-8">
                    <p className="text-xs text-[#A4A7AE]">© 2026 Universe</p>
                </div>

            </div>
        </div>
    )
}