'use client'

import { ExpenseCalendar } from './expense-calendar'
import { addMonths, subMonths } from 'date-fns'

interface ExpenseCalendarWrapperProps {
    currentMonth: Date
    currencySymbol?: string
    dailyExpenses: Record<string, number>
    selectedDate?: Date
    onDateSelect?: (date: Date) => void
    onMonthChange?: (date: Date) => void
}

export function ExpenseCalendarWrapper({
    currentMonth,
    currencySymbol = '$',
    dailyExpenses,
    selectedDate,
    onDateSelect,
    onMonthChange
}: ExpenseCalendarWrapperProps) {

    const goToPreviousMonth = () => {
        const prevMonth = subMonths(currentMonth, 1)
        onMonthChange?.(prevMonth)
    }

    const goToNextMonth = () => {
        const nextMonth = addMonths(currentMonth, 1)
        onMonthChange?.(nextMonth)
    }

    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 p-4 sm:p-6">
            <ExpenseCalendar
                dailyExpenses={dailyExpenses}
                currentMonth={currentMonth}
                currencySymbol={currencySymbol}
                selectedDate={selectedDate}
                onPreviousMonth={goToPreviousMonth}
                onNextMonth={goToNextMonth}
                onDateSelect={onDateSelect}
            />
        </div>
    )
}
