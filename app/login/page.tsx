'use client'

import { login, signup } from './actions'
import { useEffect, Suspense, useActionState, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'

export const dynamic = 'force-dynamic'

// Loading spinner component
function LoadingSpinner({ className = "" }: { className?: string }) {
    return (
        <svg
            className={`animate-spin h-5 w-5 ${className}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
        </svg>
    )
}

// Initial state for form action
const initialState = {
    error: null as string | null,
    message: null as string | null,
    isLoading: false,
}

function LoginForm() {
    const searchParams = useSearchParams() ?? null
    const error = searchParams.get('error') || null
    const message = searchParams.get('message') || null

    // Local state for loading
    const [isLoading, setIsLoading] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    // Handle URL-based messages
    useEffect(() => {
        if (error) {
            toast.error(error, {
                id: 'auth-error',
            })
        }
        if (message) {
            toast.success(message, {
                id: 'auth-message',
            })
        }
    }, [error, message])

    // Handle form submission with loading state
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData()
        formData.append('email', email)
        formData.append('password', password)

        try {
            if (isSignUp) {
                await signup(formData)
            } else {
                await login(formData)
            }
        } catch (err) {
            // Error handling is done via redirect in actions
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 py-6 px-3 sm:px-6 lg:px-8">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-100 rounded-full opacity-50 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-100 rounded-full opacity-50 blur-3xl" />
            </div>

            <div className="w-full max-w-md space-y-6 relative z-10">
                {/* Logo/Brand section */}
                <div className="text-center">
                    <div className="mx-auto h-14 w-14 sm:h-16 sm:w-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                        <svg className="h-8 w-8 sm:h-10 sm:w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="mt-4 sm:mt-6 text-xl sm:text-3xl font-bold tracking-tight text-gray-900">
                        Welcome back
                    </h2>
                    <p className="mt-2 text-xs sm:text-sm text-gray-600">
                        Sign in to your account or create a new one
                    </p>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-4 sm:p-6">
                    {/* Toggle between Sign In and Sign Up */}
                    <div className="flex bg-slate-100 rounded-xl p-1 mb-4 sm:mb-6">
                        <button
                            type="button"
                            onClick={() => setIsSignUp(false)}
                            className={`flex-1 py-2 px-4 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${!isSignUp
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsSignUp(true)}
                            className={`flex-1 py-2 px-4 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${isSignUp
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            Create Account
                        </button>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-3">
                            <div>
                                <label htmlFor="email-address" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                    Email address
                                </label>
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    placeholder="you@example.com"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete={isSignUp ? "new-password" : "current-password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {isSignUp && (
                            <p className="text-xs text-gray-500 bg-slate-50 rounded-lg p-2 sm:p-3">
                                By creating an account, you agree to receive a verification email. Please check your inbox and spam folder.
                            </p>
                        )}

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative flex w-full justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-2 sm:py-3 px-4 text-xs sm:text-sm font-semibold text-white hover:from-indigo-500 hover:to-violet-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-lg shadow-indigo-200 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:from-indigo-600 disabled:hover:to-violet-600"
                            >
                                {isLoading ? (
                                    <>
                                        <LoadingSpinner className="text-white" />
                                        <span>{isSignUp ? 'Creating account...' : 'Signing in...'}</span>
                                    </>
                                ) : (
                                    <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-gray-500">
                    Secure expense tracking for your personal finances
                </p>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
                <div className="text-center">
                    <LoadingSpinner className="h-8 w-8 text-indigo-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        }>
            <LoginForm />
        </Suspense>
    )
}
