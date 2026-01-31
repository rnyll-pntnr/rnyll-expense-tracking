'use client'

import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns'

interface ExpenseCalendarProps {
    dailyExpenses: Record<string, number>
    currentMonth: Date
    currencySymbol?: string
    selectedDate?: Date
    onPreviousMonth?: () => void
    onNextMonth?: () => void
    onDateSelect?: (date: Date) => void
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
    if (ratio <= 0.1) return 'bg-purple-100'
    if (ratio <= 0.25) return 'bg-purple-200'
    if (ratio <= 0.5) return 'bg-purple-300'
    if (ratio <= 0.75) return 'bg-purple-400'
    return 'bg-purple-500'
}

export function ExpenseCalendar({
    dailyExpenses,
    currentMonth,
    currencySymbol = '$',
    selectedDate,
    onPreviousMonth = () => { },
    onNextMonth = () => { },
    onDateSelect = () => { }
}: ExpenseCalendarProps) {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

    const maxExpense = Math.max(...Object.values(dailyExpenses), 1)

    const today = new Date()

    return (
        <div className="bg-white shadow rounded-lg p-3 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-medium text-gray-900">Daily Expenses</h3>
                <div className="flex items-center space-x-1 sm:space-x-2">
                    <button
                        onClick={onPreviousMonth}
                        className="p-1 sm:p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                    >
                        <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <span className="text-xs sm:text-sm font-medium text-gray-700 min-w-16 sm:min-w-25 text-center">
                        {format(currentMonth, 'MMMM yyyy')}
                    </span>
                    <button
                        onClick={onNextMonth}
                        className="p-1 sm:p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                    >
                        <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                    <div key={index} className="text-center text-xs font-medium text-gray-500 py-1 sm:py-2">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                {days.map((day) => {
                    const dateStr = format(day, 'yyyy-MM-dd')
                    const amount = dailyExpenses[dateStr] || 0
                    const isCurrentMonth = isSameMonth(day, currentMonth)
                    const isToday = isSameDay(day, today)
                    const isSelected = selectedDate && isSameDay(day, selectedDate)
                    const intensityClass = getIntensityClass(amount, maxExpense)

                    return (
                        <div
                            key={dateStr}
                            onClick={() => onDateSelect(day)}
                            className={`
                                relative aspect-square rounded-md flex items-center justify-center
                                text-[10px] sm:text-xs transition-all hover:scale-105 cursor-pointer
                                ${!isCurrentMonth ? 'opacity-30' : ''}
                                ${isToday ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}
                                ${isSelected ? 'ring-2 ring-indigo-600 ring-offset-1 scale-110 z-10 shadow-lg' : ''}
                                ${intensityClass}
                            `}
                            title={`${format(day, 'MMM dd, yyyy')}: ${currencySymbol}${amount.toFixed(2)}`}
                        >
                            <span className={`font-medium ${amount > 0 ? 'text-gray-800' : 'text-gray-400'}`}>
                                {format(day, 'd')}
                            </span>
                            {amount > 0 && (
                                <span className="absolute bottom-0.5 text-[7px] sm:text-[8px] font-semibold text-gray-700">
                                    {formatCurrency(amount, currencySymbol)}
                                </span>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Legend */}
            <div className="mt-3 sm:mt-4 flex items-center justify-center space-x-2 sm:space-x-4">
                <span className="text-[10px] sm:text-xs text-gray-500">Less</span>
                <div className="flex space-x-0.5 sm:space-x-1">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-purple-100"></div>
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-purple-200"></div>
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-purple-300"></div>
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-purple-400"></div>
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-purple-500"></div>
                </div>
                <span className="text-[10px] sm:text-xs text-gray-500">More</span>
            </div>
        </div>
    )
}
