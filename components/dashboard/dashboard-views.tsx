'use client'

import { useState, useTransition } from 'react'
import type { TransactionStats, CategoryExpense, DailyExpense, TransactionWithCategory } from '@/types'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { getTransactionStats, getExpensesByCategory, getDailyExpenses } from '@/app/actions/transactions'
import { StatsGrid } from '@/components/dashboard/stats-grid'
import { CategoryChart } from '@/components/dashboard/category-chart'
import { ExpenseCalendarWrapper } from '@/components/charts/expense-calendar-wrapper'
import { StatsGridSkeleton, CategoryChartSkeleton, CalendarSkeleton } from '@/components/skeletons'

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
                getTransactionStats({ startDate: statsStart, endDate: statsEnd }),
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

            {/* Stats Grid */}
            {isPending ? (
                <StatsGridSkeleton />
            ) : (
                <StatsGrid
                    stats={stats}
                    currencySymbol={currencySymbol}
                    currencyCode={currencyCode}
                    avgDivisor={avgDivisor}
                />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                {/* Expenses by Category Chart */}
                {isPending ? (
                    <CategoryChartSkeleton />
                ) : (
                    <CategoryChart
                        data={categoryData}
                        currencySymbol={currencySymbol}
                        currencyCode={currencyCode}
                    />
                )}

                {/* Daily Expense Calendar */}
                <div className={isPending ? "opacity-50 pointer-events-none" : ""}>
                    <ExpenseCalendarWrapper
                        currentMonth={viewDate}
                        selectedDate={selectedDate || undefined}
                        currencySymbol={currencySymbol}
                        dailyExpenses={dailyExpenses}
                        onDateSelect={handleDateSelect}
                        onMonthChange={handleMonthChange}
                    />
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
