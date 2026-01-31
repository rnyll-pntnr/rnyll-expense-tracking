import { getTransactionStats } from '@/app/actions/transactions'
import { formatCurrency } from '@/lib/currencies'

interface DashboardStatsProps {
    startDate: string
    endDate: string
    currencyCode: string
    currencySymbol: string
    avgDivisor: number
}

export async function DashboardStats({
    startDate,
    endDate,
    currencyCode,
    currencySymbol,
    avgDivisor
}: DashboardStatsProps) {
    const { data: stats } = await getTransactionStats({ startDate, endDate })

    // Default values if no data
    const safeStats = stats || { totalIncome: 0, totalExpense: 0, balance: 0 }

    const avgDaily = avgDivisor > 0 ? safeStats.totalExpense / avgDivisor : 0

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 p-3 sm:p-4 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/60">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl bg-linear-to-br from-green-100 to-green-200 flex items-center justify-center">
                        <svg className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <dt className="text-xs sm:text-sm font-medium text-gray-500">Total Income</dt>
                        <dd className="text-base sm:text-lg lg:text-xl font-bold text-green-600">{currencySymbol}{formatCurrency(safeStats.totalIncome, currencyCode)}</dd>
                    </div>
                </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 p-3 sm:p-4 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/60">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl bg-linear-to-br from-red-100 to-red-200 flex items-center justify-center">
                        <svg className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <dt className="text-xs sm:text-sm font-medium text-gray-500">Total Expenses</dt>
                        <dd className="text-base sm:text-lg lg:text-xl font-bold text-red-600">{currencySymbol}{formatCurrency(safeStats.totalExpense, currencyCode)}</dd>
                    </div>
                </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 p-3 sm:p-4 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/60">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl bg-linear-to-br from-indigo-100 to-indigo-200 flex items-center justify-center">
                        <svg className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <dt className="text-xs sm:text-sm font-medium text-gray-500">Balance</dt>
                        <dd className={`text-base sm:text-lg lg:text-xl font-bold ${safeStats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {currencySymbol}{formatCurrency(safeStats.balance, currencyCode)}
                        </dd>
                    </div>
                </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 p-3 sm:p-4 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/60">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                        <svg className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <dt className="text-xs sm:text-sm font-medium text-gray-500">Avg. Daily</dt>
                        <dd className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">{currencySymbol}{formatCurrency(avgDaily, currencyCode)}</dd>
                    </div>
                </div>
            </div>
        </div>
    )
}
