'use client'

import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, BanknotesIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import type { TransactionStats } from '@/types'

interface SummaryCardsProps {
    stats: TransactionStats & { overallBalance?: number }
    loading: boolean
    currencySymbol: string
    formatCurrency: (amount: number) => string
    period?: string // Added to show time period context
}

export function SummaryCards({ 
    stats, 
    loading, 
    currencySymbol, 
    formatCurrency,
    period = 'This Month'
}: SummaryCardsProps) {
    // Use overall balance if available (actual total income - total expenses), otherwise use filtered balance
    const displayBalance = stats.overallBalance !== undefined ? stats.overallBalance : stats.balance
    
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="bg-linear-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
                <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-green-700 font-medium">Total Income</p>
                    {period && (
                        <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-md">
                            {period}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                        <ArrowTrendingUpIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        {loading ? (
                            <div className="h-7 w-24 bg-green-200/50 animate-pulse rounded mt-1"></div>
                        ) : (
                            <p className="text-lg font-bold text-green-800">
                                {currencySymbol}{formatCurrency(stats.totalIncome)}
                            </p>
                        )}
                        <p className="text-xs text-green-600 mt-1">Total earnings received</p>
                    </div>
                </div>
            </div>
            
            <div className="bg-linear-to-br from-red-50 to-red-100 rounded-xl p-3 border border-red-200">
                <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-red-700 font-medium">Total Expenses</p>
                    {period && (
                        <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-md">
                            {period}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500 rounded-lg">
                        <ArrowTrendingDownIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        {loading ? (
                            <div className="h-7 w-24 bg-red-200/50 animate-pulse rounded mt-1"></div>
                        ) : (
                            <p className="text-lg font-bold text-red-800">
                                {currencySymbol}{formatCurrency(stats.totalExpense)}
                            </p>
                        )}
                        <p className="text-xs text-red-600 mt-1">Total money spent</p>
                    </div>
                </div>
            </div>
            
            <div className={`bg-linear-to-br rounded-xl p-3 border ${displayBalance >= 0 ? 'from-indigo-50 to-indigo-100 border-indigo-200' : 'from-orange-50 to-orange-100 border-orange-200'}`}>
                <div className="flex items-center justify-between mb-1">
                    <p className={`text-sm font-medium ${displayBalance >= 0 ? 'text-indigo-700' : 'text-orange-700'}`}>Actual Balance</p>
                    {period && (
                        <span className={`text-xs font-medium px-2 py-1 rounded-md ${displayBalance >= 0 ? 'text-indigo-600 bg-indigo-100' : 'text-orange-600 bg-orange-100'}`}>
                            All Time
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${displayBalance >= 0 ? 'bg-indigo-500' : 'bg-orange-500'}`}>
                        <BanknotesIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        {loading ? (
                            <div className={`h-7 w-24 animate-pulse rounded mt-1 ${displayBalance >= 0 ? 'bg-indigo-200/50' : 'bg-orange-200/50'}`}></div>
                        ) : (
                            <p className={`text-lg font-bold ${displayBalance >= 0 ? 'text-indigo-800' : 'text-orange-800'}`}>
                                {displayBalance >= 0 ? '+' : '-'}{currencySymbol}{formatCurrency(Math.abs(displayBalance))}
                            </p>
                        )}
                        <p className={`text-xs mt-1 flex items-center gap-1 ${displayBalance >= 0 ? 'text-indigo-600' : 'text-orange-600'}`}>
                            <InformationCircleIcon className="h-3 w-3" />
                            Actual total balance (all income - all expenses)
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}