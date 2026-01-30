import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/dashboard-layout'
import { getExpensesByCategory, getTransactionStats } from '@/app/actions/transactions'
import { getUserSettings } from '@/app/actions/settings'
import { getCurrencyInfo } from '@/lib/currencies'
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

    const currencySymbol = (await getCurrencyInfo(settingsResult.data?.currency || 'USD')).symbol

    return (
        <DashboardLayout userEmail={user.email}>
            <div className="p-6 lg:p-8">
                <div className="mx-auto max-w-8xl">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Analyze your spending patterns and financial trends.
                        </p>
                    </div>

                    {/* Period Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Current Month */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-sm font-medium text-gray-500 mb-4">This Month</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-gray-500">Income</p>
                                    <p className="text-lg font-semibold text-green-600">
                                        {currencySymbol}{currentMonthStats.data?.totalIncome.toFixed(2) || '0.00'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Expenses</p>
                                    <p className="text-lg font-semibold text-red-600">
                                        {currencySymbol}{currentMonthStats.data?.totalExpense.toFixed(2) || '0.00'}
                                    </p>
                                </div>
                                <div className="pt-3 border-t">
                                    <p className="text-xs text-gray-500">Balance</p>
                                    <p className={`text-lg font-semibold ${(currentMonthStats.data?.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {currencySymbol}{currentMonthStats.data?.balance.toFixed(2) || '0.00'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Last Month */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-sm font-medium text-gray-500 mb-4">Last Month</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-gray-500">Income</p>
                                    <p className="text-lg font-semibold text-green-600">
                                        {currencySymbol}{lastMonthStats.data?.totalIncome.toFixed(2) || '0.00'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Expenses</p>
                                    <p className="text-lg font-semibold text-red-600">
                                        {currencySymbol}{lastMonthStats.data?.totalExpense.toFixed(2) || '0.00'}
                                    </p>
                                </div>
                                <div className="pt-3 border-t">
                                    <p className="text-xs text-gray-500">Balance</p>
                                    <p className={`text-lg font-semibold ${(lastMonthStats.data?.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {currencySymbol}{lastMonthStats.data?.balance.toFixed(2) || '0.00'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Year to Date */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-sm font-medium text-gray-500 mb-4">Year to Date</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-gray-500">Income</p>
                                    <p className="text-lg font-semibold text-green-600">
                                        {currencySymbol}{yearStats.data?.totalIncome.toFixed(2) || '0.00'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Expenses</p>
                                    <p className="text-lg font-semibold text-red-600">
                                        {currencySymbol}{yearStats.data?.totalExpense.toFixed(2) || '0.00'}
                                    </p>
                                </div>
                                <div className="pt-3 border-t">
                                    <p className="text-xs text-gray-500">Balance</p>
                                    <p className={`text-lg font-semibold ${(yearStats.data?.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {currencySymbol}{yearStats.data?.balance.toFixed(2) || '0.00'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">This Month - Expenses by Category</h3>
                            <ExpenseByCategory data={currentMonthData.data || []} currencySymbol={currencySymbol} />
                        </div>

                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Year to Date - Expenses by Category</h3>
                            <ExpenseByCategory data={yearData.data || []} currencySymbol={currencySymbol} />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
