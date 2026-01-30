import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/dashboard-layout'
import { getTransactionStats, getTransactions, getExpensesByCategory, getDailyExpenses } from '@/app/actions/transactions'
import { getUserSettings } from '@/app/actions/settings'
import { getCurrencyInfo } from '@/lib/currencies'
import { ExpenseByCategory } from '@/components/charts/expense-by-category'
import { ExpenseCalendar } from '@/components/charts/expense-calendar'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import Link from 'next/link'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        redirect('/login')
    }

    // Get current month stats
    const now = new Date()
    const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
    const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd')

    const [statsResult, recentResult, categoryResult, dailyResult, settingsResult] = await Promise.all([
        getTransactionStats(),
        getTransactions({ limit: 5 }),
        getExpensesByCategory({ startDate: monthStart, endDate: monthEnd }),
        getDailyExpenses({ startDate: monthStart, endDate: monthEnd }),
        getUserSettings(),
    ])

    const stats = statsResult.data || { totalIncome: 0, totalExpense: 0, balance: 0, transactionCount: 0 }
    const recentTransactions = recentResult.data || []
    const categoryData = categoryResult.data || []
    const dailyExpenses = dailyResult.data || {}
    const currencySymbol = (await getCurrencyInfo(settingsResult.data?.currency || 'USD')).symbol

    // Calculate average daily expense for current month
    const daysInMonth = now.getDate()
    const avgDaily = daysInMonth > 0 ? stats.totalExpense / daysInMonth : 0

    return (
        <DashboardLayout userEmail={user.email}>
            <div className="p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Welcome back! Here's an overview of your finances.
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/60">
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <dt className="text-sm font-medium text-gray-500">Total Income</dt>
                                    <dd className="text-xl font-bold text-green-600">{currencySymbol}{stats.totalIncome.toFixed(2)}</dd>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/60">
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <dt className="text-sm font-medium text-gray-500">Total Expenses</dt>
                                    <dd className="text-xl font-bold text-red-600">{currencySymbol}{stats.totalExpense.toFixed(2)}</dd>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/60">
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center">
                                    <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <dt className="text-sm font-medium text-gray-500">Balance</dt>
                                    <dd className={`text-xl font-bold ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {currencySymbol}{stats.balance.toFixed(2)}
                                    </dd>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/60">
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                    <svg className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <dt className="text-sm font-medium text-gray-500">Avg. Daily</dt>
                                    <dd className="text-xl font-bold text-gray-900">{currencySymbol}{avgDaily.toFixed(2)}</dd>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Expenses by Category Chart */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses by Category</h3>
                            <ExpenseByCategory data={categoryData} currencySymbol={currencySymbol} />
                        </div>

                        {/* Daily Expense Calendar */}
                        <ExpenseCalendar dailyExpenses={dailyExpenses} currentMonth={now} currencySymbol={currencySymbol} />
                    </div>

                    {/* Recent Transactions */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 p-6 mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                            <Link
                                href="/dashboard/expenses"
                                className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
                            >
                                View all →
                            </Link>
                        </div>
                        {recentTransactions.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-8">No transactions yet</p>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {recentTransactions.map((transaction) => (
                                    <li key={transaction.id} className="py-3.5">
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
                                                className={`text-sm font-semibold ml-4 ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                                                    }`}
                                            >
                                                {transaction.type === 'income' ? '+' : '-'}{currencySymbol}
                                                {Number(transaction.amount).toFixed(2)}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 shadow-xl shadow-indigo-200 rounded-2xl p-6 text-white">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">Ready to track your expenses?</h3>
                                <p className="mt-2 text-sm text-indigo-100">
                                    Start by adding your first transaction or set up your categories.
                                </p>
                            </div>
                            <Link
                                href="/dashboard/expenses"
                                className="ml-4 px-5 py-2.5 bg-white text-indigo-600 rounded-xl text-sm font-semibold hover:bg-indigo-50 transition-all duration-200 shadow-lg"
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
