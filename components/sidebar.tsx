'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    HomeIcon,
    CreditCardIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    Bars3Icon,
    XMarkIcon,
    ArrowRightOnRectangleIcon,
    ChevronDoubleLeftIcon,
    ChevronDoubleRightIcon,
} from '@heroicons/react/24/outline'
import { signout } from '@/app/login/actions'
import { useSidebar } from './sidebar-context'

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Expenses', href: '/dashboard/expenses', icon: CreditCardIcon },
    { name: 'Reports', href: '/dashboard/reports', icon: ChartBarIcon },
    { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon },
]

export function Sidebar({ userEmail }: { userEmail?: string }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const { collapsed, toggle } = useSidebar()
    const pathname = usePathname()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const isActive = (href: string) => {
        if (href === '/dashboard') {
            return pathname === href
        }
        return pathname.startsWith(href)
    }

    // Prevent hydration mismatch
    const displayCollapsed = mounted ? collapsed : false

    return (
        <>
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Mobile sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-xl shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex h-full flex-col">
                    {/* Mobile header */}
                    <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                                <span className="text-white font-bold text-lg">E</span>
                            </div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">ExpenseTracker</h1>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Mobile navigation */}
                    <nav className="flex-1 space-y-1 px-3 py-4">
                        {navigation.map((item) => {
                            const active = isActive(item.href)
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${active
                                        ? 'bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-600 shadow-sm'
                                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    <item.icon
                                        className={`h-5 w-5 flex-shrink-0 ${active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                                            }`}
                                    />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Mobile user section */}
                    <div className="border-t border-slate-100 p-4">
                        {userEmail && (
                            <div className="mb-3 p-3 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500">Signed in as</p>
                                <p className="text-sm font-medium text-slate-900 truncate">{userEmail}</p>
                            </div>
                        )}
                        <form action={signout}>
                            <button
                                type="submit"
                                className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-all duration-200"
                            >
                                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                                Sign Out
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Desktop sidebar */}
            <div className={`hidden lg:flex lg:flex-col bg-white/95 backdrop-blur-sm border-r border-slate-200 shadow-xl shadow-slate-200/50 transition-all duration-300 fixed inset-y-0 left-0 ${displayCollapsed ? 'w-20' : 'w-72'}`}>
                <div className="flex flex-col flex-grow overflow-y-auto">
                    {/* Desktop header */}
                    <div className={`flex h-16 items-center border-b border-slate-100 ${displayCollapsed ? 'justify-center px-2' : 'px-4 gap-3'}`}>
                        {!displayCollapsed && (
                            <>
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                                    <span className="text-white font-bold text-lg">E</span>
                                </div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">ExpenseTracker</h1>
                            </>
                        )}
                        {displayCollapsed && (
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                                <span className="text-white font-bold text-lg">E</span>
                            </div>
                        )}
                    </div>

                    {/* Desktop navigation */}
                    <nav className="flex-1 space-y-1 px-2 py-4">
                        {navigation.map((item) => {
                            const active = isActive(item.href)
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${active
                                        ? 'bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-600 shadow-sm'
                                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                                        } ${displayCollapsed ? 'justify-center' : ''}`}
                                    title={displayCollapsed ? item.name : undefined}
                                >
                                    <item.icon
                                        className={`h-5 w-5 flex-shrink-0 ${active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                                            }`}
                                    />
                                    {!displayCollapsed && item.name}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Desktop user section */}
                    <div className="border-t border-slate-100 p-4">
                        <div>
                            {displayCollapsed ? (
                                <>
                                    {userEmail && (
                                        <div className="text-xs text-slate-500 truncate max-w-[60px] text-center" title={userEmail}>
                                            {userEmail.split('@')[0]}
                                        </div>
                                    )}
                                    <form action={signout}>
                                        <button
                                            type="submit"
                                            className="p-2.5 text-red-600 rounded-xl hover:bg-red-50 transition-all duration-200"
                                            title="Sign Out"
                                        >
                                            <ArrowRightOnRectangleIcon className="h-5 w-5" />
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <div className="p-3 bg-slate-50 rounded-xl mb-3">
                                            {userEmail && (
                                                <div>
                                                    <p className="text-xs text-slate-500">Signed in as</p>
                                                    <p className="text-sm font-medium text-slate-900 truncate">{userEmail}</p>
                                                </div>
                                            )}
                                        </div>
                                        <form action={signout}>
                                            <button
                                                type="submit"
                                                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-all duration-200"
                                            >
                                                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                                                Sign Out
                                            </button>
                                        </form>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Collapse toggle button */}
                <button
                    onClick={toggle}
                    className="absolute -right-3 top-20 w-8 h-8 bg-white border border-slate-200 rounded-full shadow-lg shadow-slate-200/50 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all duration-200 hidden lg:flex"
                    title={displayCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {displayCollapsed ? (
                        <ChevronDoubleRightIcon className="h-4 w-4" />
                    ) : (
                        <ChevronDoubleLeftIcon className="h-4 w-4" />
                    )}
                </button>
            </div>

            {/* Mobile header - always visible on mobile */}
            <div className="lg:hidden sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
                <button
                    type="button"
                    className="px-4 text-slate-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                    onClick={() => setSidebarOpen(true)}
                >
                    <span className="sr-only">Open sidebar</span>
                    <Bars3Icon className="h-6 w-6" />
                </button>
                <div className="flex flex-1 items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">E</span>
                        </div>
                        <h1 className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">ExpenseTracker</h1>
                    </div>
                </div>
            </div>
        </>
    )
}
