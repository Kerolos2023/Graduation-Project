'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { roleRoutes, getFirstRole } from '@/lib/roles';
import axiosInstance from '@/lib/axios';

export default function LoginPage() {
    const [userName, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const router = useRouter();
    const { user, setUser, isLoading } = useAuth();

    // Redirect if already logged in
    useEffect(() => {
        if (isLoading) return;
        if (!user?.activeModule) return;
        const route = roleRoutes[user.activeModule];
        if (route) router.replace(route);
    }, [user, isLoading, router]);

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
                const data = response.data;

                const roles: string[] = Array.isArray(data.roles) ? data.roles : [];
                const firstRole = getFirstRole(roles);

                if (!firstRole || !roleRoutes[firstRole]) {
                    setErrorMessage("No valid role found.");
                    return;
                }

                // Store everything in AuthContext (persisted to localStorage)
                // Token is managed by the backend via httpOnly cookie (withCredentials: true)
                setUser({
                    id:                 data.id ?? '',
                    name:               data.name ?? '',
                    email:              data.email ?? null,
                    roles,
                    activeModule:       firstRole,
                    profilePictureUrl:  data.imageUrl ?? null,
                });

                router.replace(roleRoutes[firstRole]);
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