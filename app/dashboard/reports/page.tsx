import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/dashboard-layout'
import { getExpensesByCategory, getTransactionStats } from '@/app/actions/transactions'
import { getUserSettings } from '@/app/actions/settings'
import { getCurrencyInfo, formatCurrency } from '@/lib/currencies'
import { ExpenseByCategory } from '@/components/charts/expense-by-category'
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from 'date-fns'

export default async function ReportsPage() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        redirect('/login')
    }

    const now = new Date()

    // Current month
    const currentMonthStart = format(startOfMonth(now), 'yyyy-MM-dd')
    const currentMonthEnd = format(endOfMonth(now), 'yyyy-MM-dd')

    // Last month
    const lastMonth = subMonths(now, 1)
    const lastMonthStart = format(startOfMonth(lastMonth), 'yyyy-MM-dd')
    const lastMonthEnd = format(endOfMonth(lastMonth), 'yyyy-MM-dd')

    // Current year
    const yearStart = format(startOfYear(now), 'yyyy-MM-dd')
    const yearEnd = format(endOfYear(now), 'yyyy-MM-dd')

    const [currentMonthData, lastMonthData, yearData, currentMonthStats, lastMonthStats, yearStats, settingsResult] = await Promise.all([
        getExpensesByCategory({ startDate: currentMonthStart, endDate: currentMonthEnd }),
        getExpensesByCategory({ startDate: lastMonthStart, endDate: lastMonthEnd }),
        getExpensesByCategory({ startDate: yearStart, endDate: yearEnd }),
        getTransactionStats({ startDate: currentMonthStart, endDate: currentMonthEnd }),
        getTransactionStats({ startDate: lastMonthStart, endDate: lastMonthEnd }),
        getTransactionStats({ startDate: yearStart, endDate: yearEnd }),
        getUserSettings(),
    ])

    const currency = await getCurrencyInfo(settingsResult.data?.currency || 'USD')
    const currencySymbol = currency.symbol
    const currencyCode = settingsResult.data?.currency || 'USD'

    return (
        <DashboardLayout userEmail={user.email} userName={user.user_metadata.name}>
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-8xl">
                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reports & Analytics</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Analyze your spending patterns and financial trends.
                        </p>
                    </div>

                    {/* Period Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                        {/* Current Month */}
                        <div className="bg-white shadow rounded-lg p-3 sm:p-4 lg:p-6">
                            <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2 sm:mb-3">This Month</h3>
                            <div className="space-y-1 sm:space-y-2">
                                <div>
                                    <p className="text-xs text-gray-500">Income</p>
                                    <p className="text-base sm:text-lg font-semibold text-green-600">
                                        {currencySymbol}{formatCurrency(currentMonthStats.data?.totalIncome || 0, currencyCode)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Expenses</p>
                                    <p className="text-base sm:text-lg font-semibold text-red-600">
                                        {currencySymbol}{formatCurrency(currentMonthStats.data?.totalExpense || 0, currencyCode)}
                                    </p>
                                </div>
                                <div className="pt-1 sm:pt-2 border-t">
                                    <p className="text-xs text-gray-500">Balance</p>
                                    <p className={`text-base sm:text-lg font-semibold ${(currentMonthStats.data?.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {currencySymbol}{formatCurrency(currentMonthStats.data?.balance || 0, currencyCode)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Last Month */}
                        <div className="bg-white shadow rounded-lg p-3 sm:p-4 lg:p-6">
                            <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2 sm:mb-3">Last Month</h3>
                            <div className="space-y-1 sm:space-y-2">
                                <div>
                                    <p className="text-xs text-gray-500">Income</p>
                                    <p className="text-base sm:text-lg font-semibold text-green-600">
                                        {currencySymbol}{formatCurrency(lastMonthStats.data?.totalIncome || 0, currencyCode)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Expenses</p>
                                    <p className="text-base sm:text-lg font-semibold text-red-600">
                                        {currencySymbol}{formatCurrency(lastMonthStats.data?.totalExpense || 0, currencyCode)}
                                    </p>
                                </div>
                                <div className="pt-1 sm:pt-2 border-t">
                                    <p className="text-xs text-gray-500">Balance</p>
                                    <p className={`text-base sm:text-lg font-semibold ${(lastMonthStats.data?.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {currencySymbol}{formatCurrency(lastMonthStats.data?.balance || 0, currencyCode)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Year to Date */}
                        <div className="bg-white shadow rounded-lg p-3 sm:p-4 lg:p-6">
                            <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2 sm:mb-3">Year to Date</h3>
                            <div className="space-y-1 sm:space-y-2">
                                <div>
                                    <p className="text-xs text-gray-500">Income</p>
                                    <p className="text-base sm:text-lg font-semibold text-green-600">
                                        {currencySymbol}{formatCurrency(yearStats.data?.totalIncome || 0, currencyCode)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Expenses</p>
                                    <p className="text-base sm:text-lg font-semibold text-red-600">
                                        {currencySymbol}{formatCurrency(yearStats.data?.totalExpense || 0, currencyCode)}
                                    </p>
                                </div>
                                <div className="pt-1 sm:pt-2 border-t">
                                    <p className="text-xs text-gray-500">Balance</p>
                                    <p className={`text-base sm:text-lg font-semibold ${(yearStats.data?.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {currencySymbol}{formatCurrency(yearStats.data?.balance || 0, currencyCode)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                        <div className="bg-white shadow rounded-lg p-3 sm:p-4 lg:p-6">
                            <h3 className="text-sm sm:text-base lg:text-lg font-medium text-gray-900 mb-2 sm:mb-3">This Month - Expenses by Category</h3>
                            <ExpenseByCategory
                                data={currentMonthData.data || []}
                                currencySymbol={currencySymbol}
                                currencyCode={currencyCode}
                            />
                        </div>

                        <div className="bg-white shadow rounded-lg p-3 sm:p-4 lg:p-6">
                            <h3 className="text-sm sm:text-base lg:text-lg font-medium text-gray-900 mb-2 sm:mb-3">Year to Date - Expenses by Category</h3>
                            <ExpenseByCategory
                                data={yearData.data || []}
                                currencySymbol={currencySymbol}
                                currencyCode={currencyCode}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
