'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';

function Loginpag() {

    const [userName, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const router = useRouter();

    const handlesubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        setLoading(true);

        try {
            const payload = {
                userName: userName,
                password: password,
                rememberMe: rememberMe
            }

            const response = await axiosInstance.post('/Auth/login', payload);

            if (response.status === 200) {
                router.replace('/dashboard');
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

                <div className="bg-white rounded-2xl shadow-lg p-8">

                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Image
                                src="/auth/frame.svg"
                                alt="Login Icon"
                                width={24}
                                height={24}
                            />
                            <h1 className="text-2xl font-bold text-gray-900">Sign In</h1>
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Welcome to the South Valley National University (SVNU) Management System
                        </p>
                    </div>

                    <form className="space-y-4" onSubmit={handlesubmit}>

                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                                Username
                            </label>
                            <input
                                type="text"
                                value={userName}
                                onChange={(e) => {
                                    setUsername(e.target.value);
                                    setErrorMessage('');
                                }}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                placeholder="Enter your username"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setErrorMessage('');
                                }}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <label className="ml-2 text-sm text-gray-700">
                                Remember Me
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3.5 px-4 rounded-xl transition-all disabled:opacity-50"
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>

                        {errorMessage && (
                            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
                                {errorMessage}
                            </div>
                        )}

                    </form>

                    <div className="mt-6 flex justify-center gap-4 text-sm">
                        <Link href="/auth/forgot-password" className="text-gray-500 hover:text-black">
                            Forgot Password
                        </Link>
                        <Link href="/contact-us" className="text-gray-400 hover:text-black">
                            Contact Us
                        </Link>
                        <Link href="/auth/signup" className="text-gray-400 hover:text-black">
                            Terms of Use
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Loginpag
