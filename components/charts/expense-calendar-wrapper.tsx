'use client'

import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { ExpenseCalendar } from './expense-calendar'
import { getDailyExpenses } from '@/app/actions/transactions'

interface ExpenseCalendarWrapperProps {
    initialMonth: Date
    currencySymbol?: string
}

export function ExpenseCalendarWrapper({ initialMonth, currencySymbol = '$' }: ExpenseCalendarWrapperProps) {
    const [currentMonth, setCurrentMonth] = useState(initialMonth)
    const [dailyExpenses, setDailyExpenses] = useState<Record<string, number>>({})
    const [isLoading, setIsLoading] = useState(false)

    const fetchDailyExpenses = async (date: Date) => {
        setIsLoading(true)
        try {
            const monthStart = format(startOfMonth(date), 'yyyy-MM-dd')
            const monthEnd = format(endOfMonth(date), 'yyyy-MM-dd')
            const result = await getDailyExpenses({ startDate: monthStart, endDate: monthEnd })
            setDailyExpenses(result.data || {})
        } catch (error) {
            console.error('Error fetching daily expenses:', error)
            setDailyExpenses({})
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchDailyExpenses(currentMonth)
    }, [currentMonth])

    const goToPreviousMonth = () => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))
    }

    const goToNextMonth = () => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))
    }

    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 p-4 sm:p-6">
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <ExpenseCalendar 
                    dailyExpenses={dailyExpenses} 
                    currentMonth={currentMonth} 
                    currencySymbol={currencySymbol}
                    onPreviousMonth={goToPreviousMonth}
                    onNextMonth={goToNextMonth}
                />
            )}
        </div>
    )
}
