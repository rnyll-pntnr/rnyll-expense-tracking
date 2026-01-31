import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/dashboard-layout'
import { getTransactions } from '@/app/actions/transactions'
import { getUserSettings } from '@/app/actions/settings'
import { getCurrencyInfo, formatCurrency } from '@/lib/currencies'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import Link from 'next/link'

import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { DashboardCategoryChart } from '@/components/dashboard/dashboard-chart'
import { DashboardCalendar } from '@/components/dashboard/dashboard-calendar'
import { StatsGridSkeleton, CategoryChartSkeleton, CalendarSkeleton } from '@/components/skeletons'

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedSearchParams = await searchParams
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        redirect('/login')
    }

    // Parse URL params
    const now = new Date()
    const monthParam = typeof resolvedSearchParams.month === 'string' ? resolvedSearchParams.month : null
    const viewDate = monthParam ? new Date(monthParam + '-01') : now

    // Handle date param (YYYY-MM-DD) for specific day selection
    const dateParam = typeof resolvedSearchParams.date === 'string' ? resolvedSearchParams.date : null
    const selectedDate = dateParam ? new Date(dateParam) : null

    // Determine date range for Stats Grid
    let statsStart, statsEnd
    let avgDivisor = 1

    if (selectedDate) {
        statsStart = format(selectedDate, 'yyyy-MM-dd')
        statsEnd = format(selectedDate, 'yyyy-MM-dd')
        avgDivisor = 1
    } else {
        statsStart = format(startOfMonth(viewDate), 'yyyy-MM-dd')
        statsEnd = format(endOfMonth(viewDate), 'yyyy-MM-dd')
        const lastDayOfMonth = endOfMonth(viewDate)
        avgDivisor = parseInt(format(lastDayOfMonth, 'd'))
    }

    const calendarMonthStart = format(startOfMonth(viewDate), 'yyyy-MM-dd')
    const calendarMonthEnd = format(endOfMonth(viewDate), 'yyyy-MM-dd')

    // Fetch essential data that shouldn't block the granular skeletons too much, 
    // or arguably these could be fast. Recent transactions and Settings.
    const [recentResult, settingsResult] = await Promise.all([
        getTransactions({ limit: 5 }),
        getUserSettings(),
    ])

    const recentTransactions = recentResult.data || []
    const currency = await getCurrencyInfo(settingsResult.data?.currency || 'USD')
    const currencySymbol = currency.symbol
    const currencyCode = settingsResult.data?.currency || 'USD'

    return (
        <DashboardLayout userEmail={user.email} userName={user.user_metadata.name}>
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-8xl">
                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Welcome back! Here's an overview of your finances{selectedDate ? ` for ${format(selectedDate, 'MMM dd, yyyy')}` : ` for ${format(viewDate, 'MMMM yyyy')}`}.
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <Suspense key={`stats-${statsStart}-${statsEnd}`} fallback={<StatsGridSkeleton />}>
                        <DashboardStats
                            startDate={statsStart}
                            endDate={statsEnd}
                            currencyCode={currencyCode}
                            currencySymbol={currencySymbol}
                            avgDivisor={avgDivisor}
                        />
                    </Suspense>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                        {/* Expenses by Category Chart */}
                        <Suspense key={`chart-${statsStart}-${statsEnd}`} fallback={<CategoryChartSkeleton />}>
                            <DashboardCategoryChart
                                startDate={statsStart}
                                endDate={statsEnd}
                                currencyCode={currencyCode}
                                currencySymbol={currencySymbol}
                            />
                        </Suspense>

                        {/* Daily Expense Calendar */}
                        <Suspense key={`calendar-${calendarMonthStart}-${calendarMonthEnd}`} fallback={<CalendarSkeleton />}>
                            <DashboardCalendar
                                currentMonth={viewDate}
                                selectedDate={selectedDate || undefined}
                                currencySymbol={currencySymbol}
                                startDate={calendarMonthStart}
                                endDate={calendarMonthEnd}
                            />
                        </Suspense>
                    </div>

                    {/* Recent Transactions */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 p-3 sm:p-4 mb-6 sm:mb-8">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">Recent Transactions</h3>
                            <Link
                                href="/dashboard/expenses"
                                className="text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
                            >
                                View all →
                            </Link>
                        </div>
                        {recentTransactions.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-6">No transactions yet</p>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {recentTransactions.map((transaction) => (
                                    <li key={transaction.id} className="py-2 sm:py-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {transaction.description || 'No description'}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {format(new Date(transaction.date), 'MMM dd, yyyy')}
                                                    {transaction.category && ` • ${transaction.category.name}`}
                                                </p>
                                            </div>
                                            <p
                                                className={`text-sm font-semibold ml-2 sm:ml-4 ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                                                    }`}
                                            >
                                                {transaction.type === 'income' ? '+' : '-'}{currencySymbol}
                                                {formatCurrency(Number(transaction.amount), currencyCode)}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-linear-to-r from-indigo-600 via-violet-600 to-purple-600 shadow-xl shadow-indigo-200 rounded-2xl p-3 sm:p-4 lg:p-6 text-white">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div>
                                <h3 className="text-sm sm:text-base lg:text-lg font-semibold">Ready to track your expenses?</h3>
                                <p className="mt-1 text-xs sm:text-sm text-indigo-100">
                                    Start by adding your first transaction or set up your categories.
                                </p>
                            </div>
                            <Link
                                href="/dashboard/expenses"
                                className="px-4 py-2 bg-white text-indigo-600 rounded-xl text-sm font-semibold hover:bg-indigo-50 transition-all duration-200 shadow-lg text-center"
                            >
                                Add Transaction
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
