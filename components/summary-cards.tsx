'use client'

import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, BanknotesIcon } from '@heroicons/react/24/outline'
import type { TransactionStats } from '@/types'

interface SummaryCardsProps {
    stats: TransactionStats
    loading: boolean
    currencySymbol: string
    formatCurrency: (amount: number) => string
}

export function SummaryCards({ 
    stats, 
    loading, 
    currencySymbol, 
    formatCurrency 
}: SummaryCardsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="bg-linear-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                        <ArrowTrendingUpIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <p className="text-sm text-green-700 font-medium">Income</p>
                        {loading ? (
                            <div className="h-7 w-24 bg-green-200/50 animate-pulse rounded mt-1"></div>
                        ) : (
                            <p className="text-lg font-bold text-green-800">
                                {currencySymbol}{formatCurrency(stats.totalIncome)}
                            </p>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="bg-linear-to-br from-red-50 to-red-100 rounded-xl p-3 border border-red-200">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500 rounded-lg">
                        <ArrowTrendingDownIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <p className="text-sm text-red-700 font-medium">Expenses</p>
                        {loading ? (
                            <div className="h-7 w-24 bg-red-200/50 animate-pulse rounded mt-1"></div>
                        ) : (
                            <p className="text-lg font-bold text-red-800">
                                {currencySymbol}{formatCurrency(stats.totalExpense)}
                            </p>
                        )}
                    </div>
                </div>
            </div>
            
            <div className={`bg-linear-to-br rounded-xl p-3 border ${stats.balance >= 0 ? 'from-indigo-50 to-indigo-100 border-indigo-200' : 'from-orange-50 to-orange-100 border-orange-200'}`}>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${stats.balance >= 0 ? 'bg-indigo-500' : 'bg-orange-500'}`}>
                        <BanknotesIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <p className={`text-sm font-medium ${stats.balance >= 0 ? 'text-indigo-700' : 'text-orange-700'}`}>Balance</p>
                        {loading ? (
                            <div className={`h-7 w-24 animate-pulse rounded mt-1 ${stats.balance >= 0 ? 'bg-indigo-200/50' : 'bg-orange-200/50'}`}></div>
                        ) : (
                            <p className={`text-lg font-bold ${stats.balance >= 0 ? 'text-indigo-800' : 'text-orange-800'}`}>
                                {stats.balance >= 0 ? '+' : '-'}{currencySymbol}{formatCurrency(Math.abs(stats.balance))}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}