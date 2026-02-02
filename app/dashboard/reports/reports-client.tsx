'use client'

import { useState, useTransition } from 'react'
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subMonths } from 'date-fns'
import { 
    getExpensesByCategory, 
    getTransactionStats, 
    getMonthlyTrends, 
    getSpendingComparison 
} from '@/app/actions/transactions'
import { ExpenseByCategory } from '@/components/charts/expense-by-category'
import { SpendingTrendChart } from '@/components/charts/spending-trend-chart'
import { IncomeExpenseChart } from '@/components/charts/income-expense-chart'
import { EnhancedStatsCard } from '@/components/dashboard/enhanced-stats-card'
import { DateRangeSelector } from '@/components/dashboard/date-range-selector'
import { 
    StatsGridSkeleton, 
    CategoryChartSkeleton,
    ChartSkeleton
} from '@/components/skeletons'

type DateRange = '7d' | '30d' | '90d' | 'ytd' | 'custom'

interface ReportsClientProps {
    initialData: {
        stats: any
        categoryData: any[]
        trendData: any[]
        comparisonData: any
        currencySymbol: string
        currencyCode: string
    }
    user: any
}

export function ReportsClient({ initialData, user }: ReportsClientProps) {
    const [selectedRange, setSelectedRange] = useState<DateRange>('30d')
    const [stats, setStats] = useState(initialData.stats)
    const [categoryData, setCategoryData] = useState(initialData.categoryData)
    const [trendData, setTrendData] = useState(initialData.trendData)
    const [comparisonData, setComparisonData] = useState(initialData.comparisonData)
    const [isPending, startTransition] = useTransition()

    const fetchData = async (range: DateRange, customStart?: string, customEnd?: string) => {
        startTransition(async () => {
            let startDate, endDate
            const now = new Date()

            switch (range) {
                case '7d':
                    startDate = format(subDays(now, 6), 'yyyy-MM-dd')
                    endDate = format(now, 'yyyy-MM-dd')
                    break
                case '30d':
                    startDate = format(subDays(now, 29), 'yyyy-MM-dd')
                    endDate = format(now, 'yyyy-MM-dd')
                    break
                case '90d':
                    startDate = format(subDays(now, 89), 'yyyy-MM-dd')
                    endDate = format(now, 'yyyy-MM-dd')
                    break
                case 'ytd':
                    startDate = format(startOfYear(now), 'yyyy-MM-dd')
                    endDate = format(now, 'yyyy-MM-dd')
                    break
                case 'custom':
                    if (customStart && customEnd) {
                        startDate = customStart
                        endDate = customEnd
                    }
                    break
            }

            if (!startDate || !endDate) return

            // Calculate previous period for comparison
            const periodLength = new Date(endDate).getTime() - new Date(startDate).getTime()
            const previousStart = format(new Date(new Date(startDate).getTime() - periodLength - 86400000), 'yyyy-MM-dd')
            const previousEnd = format(new Date(new Date(startDate).getTime() - 86400000), 'yyyy-MM-dd')

            const [
                statsResult,
                categoryResult,
                trendsResult,
                comparisonResult
            ] = await Promise.all([
                getTransactionStats({ startDate, endDate }, { includeOverallBalance: true }),
                getExpensesByCategory({ startDate, endDate }),
                getMonthlyTrends(),
                getSpendingComparison(
                    { startDate, endDate },
                    { startDate: previousStart, endDate: previousEnd }
                )
            ])

            setStats(statsResult.data || { 
                totalIncome: 0, 
                totalExpense: 0, 
                balance: 0, 
                transactionCount: 0 
            })
            setCategoryData(categoryResult.data || [])
            setTrendData(trendsResult.data || [])
            setComparisonData(comparisonResult.data || null)
        })
    }

    const handleRangeChange = (range: DateRange) => {
        setSelectedRange(range)
        fetchData(range)
    }

    const handleCustomRange = (startDate: string, endDate: string) => {
        setSelectedRange('custom')
        fetchData('custom', startDate, endDate)
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-8xl">
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reports & Analytics</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Analyze your spending patterns and financial trends.
                    </p>
                </div>

                {/* Date Range Selector */}
                <DateRangeSelector
                    selectedRange={selectedRange}
                    onRangeChange={handleRangeChange}
                    onCustomRange={handleCustomRange}
                />

                {/* Enhanced Stats Cards */}
                {isPending ? (
                    <StatsGridSkeleton />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 sm:mb-8">
                        <EnhancedStatsCard
                            title="Total Income"
                            value={stats.totalIncome}
                            currencySymbol={initialData.currencySymbol}
                            currencyCode={initialData.currencyCode}
                            icon={
                                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            }
                            trend={comparisonData?.change.income}
                            bgColor="bg-gradient-to-br from-green-100 to-green-200"
                            textColor="text-green-600"
                            subText={comparisonData ? 'Increased from previous period' : 'No comparison data available'}
                            period={selectedRange.toUpperCase()}
                        />
                        <EnhancedStatsCard
                            title="Total Expenses"
                            value={stats.totalExpense}
                            currencySymbol={initialData.currencySymbol}
                            currencyCode={initialData.currencyCode}
                            icon={
                                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            }
                            trend={comparisonData?.change.expenses}
                            bgColor="bg-gradient-to-br from-red-100 to-red-200"
                            textColor="text-red-600"
                            subText={comparisonData ? 'Changed from previous period' : 'No comparison data available'}
                            period={selectedRange.toUpperCase()}
                        />
                        <EnhancedStatsCard
                            title="Actual Balance"
                            value={stats.overallBalance !== undefined ? stats.overallBalance : stats.balance}
                            currencySymbol={initialData.currencySymbol}
                            currencyCode={initialData.currencyCode}
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
                    </div>
                )}

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6 sm:mb-8">
                    {/* Expenses by Category */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 p-4 sm:p-6">
                        {isPending ? (
                            <CategoryChartSkeleton />
                        ) : (
                            <ExpenseByCategory
                                data={categoryData}
                                currencySymbol={initialData.currencySymbol}
                                currencyCode={initialData.currencyCode}
                            />
                        )}
                    </div>

                    {/* Spending Trend */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 p-4 sm:p-6">
                        {isPending ? (
                            <ChartSkeleton />
                        ) : (
                            <SpendingTrendChart
                                data={trendData}
                                currencySymbol={initialData.currencySymbol}
                                currencyCode={initialData.currencyCode}
                                title="Spending Trend (12 Months)"
                            />
                        )}
                    </div>

                    {/* Income vs Expenses */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 p-4 sm:p-6 lg:col-span-2">
                        {isPending ? (
                            <ChartSkeleton />
                        ) : (
                            <IncomeExpenseChart
                                data={trendData}
                                currencySymbol={initialData.currencySymbol}
                                currencyCode={initialData.currencyCode}
                                title="Income vs Expenses (12 Months)"
                            />
                        )}
                    </div>
                </div>

                {/* Comparison Insights */}
                {comparisonData && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 p-4 sm:p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Period Comparison</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-600 mb-1">Income Change</p>
                                <p className={`text-2xl font-bold ${
                                    comparisonData.change.income >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {comparisonData.change.income >= 0 ? '+' : ''}{comparisonData.change.income.toFixed(1)}%
                                </p>
                                <p className="text-xs text-gray-500">vs previous period</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-600 mb-1">Expenses Change</p>
                                <p className={`text-2xl font-bold ${
                                    comparisonData.change.expenses >= 0 ? 'text-red-600' : 'text-green-600'
                                }`}>
                                    {comparisonData.change.expenses >= 0 ? '+' : ''}{comparisonData.change.expenses.toFixed(1)}%
                                </p>
                                <p className="text-xs text-gray-500">vs previous period</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-600 mb-1">Balance Change</p>
                                <p className={`text-2xl font-bold ${
                                    comparisonData.change.balance >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {comparisonData.change.balance >= 0 ? '+' : ''}{comparisonData.change.balance.toFixed(1)}%
                                </p>
                                <p className="text-xs text-gray-500">vs previous period</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
