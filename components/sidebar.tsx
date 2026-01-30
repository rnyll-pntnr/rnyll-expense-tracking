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
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex h-full flex-col">
                    {/* Mobile header */}
                    <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
                        <h1 className="text-xl font-bold text-indigo-600">ExpenseTracker</h1>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Mobile navigation */}
                    <nav className="flex-1 space-y-1 px-2 py-4">
                        {navigation.map((item) => {
                            const active = isActive(item.href)
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${active
                                        ? 'bg-indigo-50 text-indigo-600'
                                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <item.icon
                                        className={`mr-3 h-6 w-6 flex-shrink-0 ${active ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'
                                            }`}
                                    />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Mobile user section */}
                    <div className="border-t border-gray-200 p-4">
                        {userEmail && (
                            <div className="mb-3">
                                <p className="text-xs text-gray-500">Signed in as</p>
                                <p className="text-sm font-medium text-gray-900 truncate">{userEmail}</p>
                            </div>
                        )}
                        <form action={signout}>
                            <button
                                type="submit"
                                className="flex w-full items-center px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
                            >
                                <ArrowRightOnRectangleIcon className="mr-3 h-6 w-6" />
                                Sign Out
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Desktop sidebar */}
            <div className={`hidden lg:flex lg:flex-col bg-white border-r border-gray-200 transition-all duration-300 fixed inset-y-0 left-0 ${displayCollapsed ? 'w-20' : 'w-64'}`}>
                <div className="flex flex-col flex-grow overflow-y-auto">
                    {/* Desktop header */}
                    <div className={`flex h-16 items-center border-b border-gray-200 ${displayCollapsed ? 'justify-center px-2' : 'px-4'}`}>
                        {!displayCollapsed && <h1 className="text-xl font-bold text-indigo-600">ExpenseTracker</h1>}
                        {displayCollapsed && (
                            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center">
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
                                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${active
                                        ? 'bg-indigo-50 text-indigo-600'
                                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                        } ${displayCollapsed ? 'justify-center' : ''}`}
                                    title={displayCollapsed ? item.name : undefined}
                                >
                                    <item.icon
                                        className={`h-6 w-6 flex-shrink-0 ${active ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'
                                            } ${!displayCollapsed ? 'mr-3' : ''}`}
                                    />
                                    {!displayCollapsed && item.name}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Desktop user section */}
                    <div className="border-t border-gray-200 p-4">
                        <div className={`flex items-center ${displayCollapsed ? 'flex-col gap-2' : ''}`}>
                            {displayCollapsed ? (
                                <>
                                    {userEmail && (
                                        <div className="text-xs text-gray-500 truncate max-w-[60px] text-center" title={userEmail}>
                                            {userEmail.split('@')[0]}
                                        </div>
                                    )}
                                    <form action={signout}>
                                        <button
                                            type="submit"
                                            className="p-2 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                                            title="Sign Out"
                                        >
                                            <ArrowRightOnRectangleIcon className="h-6 w-6" />
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <>
                                <div>
                                    {userEmail && (
                                        <div className="mb-3">
                                            <p className="text-xs text-gray-500">Signed in as</p>
                                            <p className="text-sm font-medium text-gray-900 truncate">{userEmail}</p>
                                        </div>
                                    )}
                                    <form action={signout}>
                                        <button
                                            type="submit"
                                            className="flex w-full items-center px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
                                        >
                                            <ArrowRightOnRectangleIcon className="mr-3 h-6" />
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
                    className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full shadow-sm flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors hidden lg:flex"
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
            <div className="lg:hidden sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white border-b border-gray-200">
                <button
                    type="button"
                    className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                    onClick={() => setSidebarOpen(true)}
                >
                    <span className="sr-only">Open sidebar</span>
                    <Bars3Icon className="h-6 w-6" />
                </button>
                <div className="flex flex-1 items-center justify-between px-4">
                    <h1 className="text-lg font-semibold text-gray-900">ExpenseTracker</h1>
                </div>
            </div>
        </>
    )
}
