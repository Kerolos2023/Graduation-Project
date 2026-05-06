'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axiosInstance from '@/lib/axios';
import type { ResetPasswordRequest } from '@/types/auth';

export default function ResetPasswordPage() {
    const router = useRouter();
    const email = typeof window !== 'undefined' ? sessionStorage.getItem('resetEmail') ?? '' : '';
    const [formData, setFormData] = useState({
        newPassword: '',
        repeatPassword: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.newPassword || !formData.repeatPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (formData.newPassword !== formData.repeatPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!email) {
            setError('Email not found. Please try again.');
            return;
        }

        setIsLoading(true);

        try {
            const payload: ResetPasswordRequest = {
                email,
                newPassword: formData.newPassword,
            };

            const response = await axiosInstance.patch('/Auth/reset-password', payload);

            if (response.status === 200) {
                alert('Password reset successful!');
                router.push('/auth/login');
            }
        } catch (err: any) {
            const errorData = err.response?.data;
            if (errorData?.errors) {
                const validationErrors = Object.values(errorData.errors).flat();
                if (validationErrors.length > 0) {
                    setError(validationErrors.join(', '));
                    return;
                }
            }

            setError(
                errorData?.title ||
                errorData?.message ||
                'Failed to reset password. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="min-h-screen bg-[#F9F9FA] flex items-center justify-center p-4">
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
                                src="/auth/password-check.svg"
                                alt="Password Reset"
                                width={24}
                                height={24}
                            />
                            <h1 className="text-2xl font-bold text-[#090909]">Reset password</h1>
                        </div>
                        <p className="text-sm text-[#A4A7AE] leading-relaxed">
                            Use 8 or more characters with a mix of letters, numbers & symbols.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-[#090909] mb-1.5">
                                Password
                            </label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2463F0]/20 focus:border-[#2463F0] transition-all placeholder:text-[#A4A7AE]"
                                placeholder="••••••••"
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label htmlFor="repeatPassword" className="block text-sm font-medium text-[#090909] mb-1.5">
                                Repeat Password
                            </label>
                            <input
                                type="password"
                                id="repeatPassword"
                                name="repeatPassword"
                                value={formData.repeatPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2463F0]/20 focus:border-[#2463F0] transition-all placeholder:text-[#A4A7AE]"
                                placeholder="••••••••"
                                disabled={isLoading}
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#2463F0] hover:bg-[#2463F0]/90 text-white font-medium py-3.5 px-4 rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md mt-2"
                        >
                            {isLoading ? 'Submitting...' : 'Submit'}
                        </button>
                    </form>
                </div>

                <div className="text-center mt-8">
                    <p className="text-xs text-[#A4A7AE] font-medium">© 2026 Universe</p>
                </div>
            </div>
        </div>
    );
}
