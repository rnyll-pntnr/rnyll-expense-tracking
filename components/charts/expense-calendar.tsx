'use client'

import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns'
import { useState } from 'react'

interface ExpenseCalendarProps {
    dailyExpenses: Record<string, number>
    currentMonth: Date
    currencySymbol?: string
}

const formatCurrency = (amount: number, currencySymbol: string = '$'): string => {
    if (amount >= 1000) {
        return `${currencySymbol}${(amount / 1000).toFixed(1)}k`
    }
    return `${currencySymbol}${amount.toFixed(0)}`
}

const getIntensityClass = (amount: number, maxAmount: number): string => {
    if (amount === 0) return 'bg-gray-50'
    const ratio = amount / maxAmount
    if (ratio <= 0.1) return 'bg-red-100'
    if (ratio <= 0.25) return 'bg-red-200'
    if (ratio <= 0.5) return 'bg-red-300'
    if (ratio <= 0.75) return 'bg-red-400'
    return 'bg-red-500'
}

export function ExpenseCalendar({ dailyExpenses, currentMonth: initialMonth, currencySymbol = '$' }: ExpenseCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(initialMonth)

    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

    const maxExpense = Math.max(...Object.values(dailyExpenses), 1)

    const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
    const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

    const today = new Date()

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Daily Expenses</h3>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={goToPreviousMonth}
                        className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                    >
                        <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <span className="text-sm font-medium text-gray-700 min-w-[100px] text-center">
                        {format(currentMonth, 'MMMM yyyy')}
                    </span>
                    <button
                        onClick={goToNextMonth}
                        className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                    >
                        <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
                {days.map((day) => {
                    const dateStr = format(day, 'yyyy-MM-dd')
                    const amount = dailyExpenses[dateStr] || 0
                    const isCurrentMonth = isSameMonth(day, currentMonth)
                    const isToday = isSameDay(day, today)
                    const intensityClass = getIntensityClass(amount, maxExpense)

                    return (
                        <div
                            key={dateStr}
                            className={`
                                relative aspect-square rounded-md flex items-center justify-center
                                text-xs transition-all hover:scale-105 cursor-pointer
                                ${!isCurrentMonth ? 'opacity-30' : ''}
                                ${isToday ? 'ring-2 ring-indigo-500' : ''}
                                ${intensityClass}
                            `}
                            title={`${format(day, 'MMM dd, yyyy')}: ${currencySymbol}${amount.toFixed(2)}`}
                        >
                            <span className={`font-medium ${amount > 0 ? 'text-gray-800' : 'text-gray-400'}`}>
                                {format(day, 'd')}
                            </span>
                            {amount > 0 && (
                                <span className="absolute bottom-0.5 text-[8px] font-semibold text-gray-700">
                                    {formatCurrency(amount, currencySymbol)}
                                </span>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center justify-center space-x-4">
                <span className="text-xs text-gray-500">Less</span>
                <div className="flex space-x-1">
                    <div className="w-4 h-4 rounded bg-red-100"></div>
                    <div className="w-4 h-4 rounded bg-red-200"></div>
                    <div className="w-4 h-4 rounded bg-red-300"></div>
                    <div className="w-4 h-4 rounded bg-red-400"></div>
                    <div className="w-4 h-4 rounded bg-red-500"></div>
                </div>
                <span className="text-xs text-gray-500">More</span>
            </div>
        </div>
    )
}
