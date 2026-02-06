'use client'

import React, { useState, useTransition, Suspense } from 'react'
import type { TransactionStats, CategoryExpense, DailyExpense, TransactionWithCategory } from '@/types'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { getTransactionStats, getExpensesByCategory, getDailyExpenses } from '@/app/actions/transactions'
import { EnhancedStatsCard } from '@/components/dashboard/enhanced-stats-card'
import { StatsGridSkeleton, CategoryChartSkeleton, CalendarSkeleton } from '@/components/skeletons'

// Lazy load chart components
const CategoryChart = React.lazy(() => import('@/components/dashboard/category-chart').then(module => ({
    default: module.CategoryChart
})))
const ExpenseCalendarWrapper = React.lazy(() => import('@/components/charts/expense-calendar-wrapper').then(module => ({
    default: module.ExpenseCalendarWrapper
})))

interface DashboardViewsProps {
    initialStats: TransactionStats
    initialCategoryData: CategoryExpense[]
    initialDailyExpenses: DailyExpense
    initialMonth: Date
    userEmail?: string
    userName?: string
    currencySymbol: string
    currencyCode: string
    recentTransactions: TransactionWithCategory[]
}

export function DashboardViews({
    initialStats,
    initialCategoryData,
    initialDailyExpenses,
    initialMonth,
    currencySymbol,
    currencyCode,
    recentTransactions
}: DashboardViewsProps) {
    const [viewDate, setViewDate] = useState<Date>(initialMonth)
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)

    // Data States
    const [stats, setStats] = useState(initialStats)
    const [categoryData, setCategoryData] = useState(initialCategoryData)
    const [dailyExpenses, setDailyExpenses] = useState(initialDailyExpenses)

    // Loading States
    const [isPending, startTransition] = useTransition()

    const today = new Date()

    const handleDateSelect = (date: Date) => {
        // If same date, deselect
        const newSelectedDate = selectedDate && date.getTime() === selectedDate.getTime() ? null : date
        setSelectedDate(newSelectedDate)

        // Fetch new stats based on selection
        fetchData(viewDate, newSelectedDate)
    }

    const handleMonthChange = (month: Date) => {
        setViewDate(month)
        setSelectedDate(null) // Reset selection on month change
        fetchData(month, null)
    }

    const fetchData = (month: Date, date: Date | null) => {
        startTransition(async () => {
            let statsStart, statsEnd
            const calendarStart = format(startOfMonth(month), 'yyyy-MM-dd')
            const calendarEnd = format(endOfMonth(month), 'yyyy-MM-dd')

            if (date) {
                statsStart = format(date, 'yyyy-MM-dd')
                statsEnd = format(date, 'yyyy-MM-dd')
            } else {
                statsStart = calendarStart
                statsEnd = calendarEnd
            }

            const [newStats, newCategories, newDaily] = await Promise.all([
                getTransactionStats({ startDate: statsStart, endDate: statsEnd }, { includeOverallBalance: true }),
                getExpensesByCategory({ startDate: statsStart, endDate: statsEnd }),
                getDailyExpenses({ startDate: calendarStart, endDate: calendarEnd })
            ])

            setStats(newStats.data || {
                totalIncome: 0,
                totalExpense: 0,
                balance: 0,
                transactionCount: 0
            })
            setCategoryData(newCategories.data || [])
            setDailyExpenses(newDaily.data || {})
        })
    }

    // Calculate avg divisor for the view
    let avgDivisor = 1
    if (!selectedDate) {
        const lastDayOfMonth = endOfMonth(viewDate)
        avgDivisor = parseInt(format(lastDayOfMonth, 'd'))
    }

    return (
        <div className="mx-auto max-w-8xl">
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Welcome back! Here&apos;s an overview of your finances{selectedDate ? ` for ${format(selectedDate, 'MMM dd, yyyy')}` : ` for ${format(viewDate, 'MMMM yyyy')}`}.
                </p>
            </div>

            {/* Enhanced Stats Cards */}
            {isPending ? (
                <StatsGridSkeleton />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">
                    <EnhancedStatsCard
                        title="Total Income"
                        value={stats.totalIncome}
                        currencySymbol={currencySymbol}
                        currencyCode={currencyCode}
                        icon={
                            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                        bgColor="bg-gradient-to-br from-green-100 to-green-200"
                        textColor="text-green-600"
                        explanation="Total earnings received during this period"
                        period={selectedDate ? 'Daily' : 'Monthly'}
                    />
                    <EnhancedStatsCard
                        title="Total Expenses"
                        value={stats.totalExpense}
                        currencySymbol={currencySymbol}
                        currencyCode={currencyCode}
                        icon={
                            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        }
                        bgColor="bg-gradient-to-br from-red-100 to-red-200"
                        textColor="text-red-600"
                        explanation="Total money spent during this period"
                        period={selectedDate ? 'Daily' : 'Monthly'}
                    />
                    <EnhancedStatsCard
                        title="Actual Balance"
                        value={stats.overallBalance !== undefined ? stats.overallBalance : stats.balance}
                        currencySymbol={currencySymbol}
                        currencyCode={currencyCode}
                        icon={
                            <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        }
                        bgColor="bg-gradient-to-br from-indigo-100 to-indigo-200"
                        textColor={(stats.overallBalance !== undefined ? stats.overallBalance : stats.balance) >= 0 ? 'text-green-600' : 'text-red-600'}
                        explanation="Actual total balance of all your income minus all your expenses (not affected by date filters)"
                        period="All Time"
                        showSign={true}
                    />
                    <EnhancedStatsCard
                        title="Avg. Daily"
                        value={avgDivisor > 0 ? stats.totalExpense / avgDivisor : 0}
                        currencySymbol={currencySymbol}
                        currencyCode={currencyCode}
                        icon={
                            <svg className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        }
                        bgColor="bg-gradient-to-br from-slate-100 to-slate-200"
                        textColor="text-gray-900"
                        explanation="Average daily expenses based on total spending for the period"
                        period={selectedDate ? 'Daily' : 'Monthly'}
                    />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                {/* Expenses by Category Chart */}
                {isPending ? (
                    <CategoryChartSkeleton />
                ) : (
                    <Suspense fallback={<CategoryChartSkeleton />}>
                        <CategoryChart
                            data={categoryData}
                            currencySymbol={currencySymbol}
                            currencyCode={currencyCode}
                        />
                    </Suspense>
                )}

                {/* Daily Expense Calendar */}
                <div className={isPending ? "opacity-50 pointer-events-none" : ""}>
                    <Suspense fallback={<CalendarSkeleton />}>
                        <ExpenseCalendarWrapper
                            currentMonth={viewDate}
                            selectedDate={selectedDate || undefined}
                            currencySymbol={currencySymbol}
                            dailyExpenses={dailyExpenses}
                            onDateSelect={handleDateSelect}
                            onMonthChange={handleMonthChange}
                        />
                    </Suspense>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 p-3 sm:p-4 mb-6 sm:mb-8">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">Recent Transactions</h3>
                    <a
                        href="/dashboard/expenses"
                        className="text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
                    >
                        View all →
                    </a>
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
                    <a
                        href="/dashboard/expenses"
                        className="px-4 py-2 bg-white text-indigo-600 rounded-xl text-sm font-semibold hover:bg-indigo-50 transition-all duration-200 shadow-lg text-center"
                    >
                        Add Transaction
                    </a>
                </div>
            </div>
        </div>
    )
}

function formatCurrency(amount: number, currencyCode: string) {
    return new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount)
}
