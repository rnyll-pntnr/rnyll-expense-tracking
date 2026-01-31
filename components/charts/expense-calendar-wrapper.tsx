'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { format, addMonths, subMonths, isSameDay } from 'date-fns'
import { ExpenseCalendar } from './expense-calendar'

interface ExpenseCalendarWrapperProps {
    currentMonth: Date
    currencySymbol?: string
    dailyExpenses: Record<string, number>
    selectedDate?: Date
}

export function ExpenseCalendarWrapper({
    currentMonth,
    currencySymbol = '$',
    dailyExpenses,
    selectedDate
}: ExpenseCalendarWrapperProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const createQueryString = (params: Record<string, string | null>) => {
        const newParams = new URLSearchParams(searchParams.toString())

        Object.entries(params).forEach(([key, value]) => {
            if (value === null) {
                newParams.delete(key)
            } else {
                newParams.set(key, value)
            }
        })

        return newParams.toString()
    }

    const handleDateSelect = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd')

        // If clicking the already selected date, deselect it
        if (selectedDate && isSameDay(date, selectedDate)) {
            router.push(`/dashboard?${createQueryString({ date: null })}`)
        } else {
            router.push(`/dashboard?${createQueryString({ date: dateStr })}`)
        }
    }

    const goToPreviousMonth = () => {
        const prevMonth = subMonths(currentMonth, 1)
        router.push(`/dashboard?${createQueryString({ month: format(prevMonth, 'yyyy-MM') })}`)
    }

    const goToNextMonth = () => {
        const nextMonth = addMonths(currentMonth, 1)
        router.push(`/dashboard?${createQueryString({ month: format(nextMonth, 'yyyy-MM') })}`)
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
                onDateSelect={handleDateSelect}
            />
        </div>
    )
}
