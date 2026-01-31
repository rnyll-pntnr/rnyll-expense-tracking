import { getDailyExpenses } from '@/app/actions/transactions'
import { ExpenseCalendarWrapper } from '@/components/charts/expense-calendar-wrapper'

interface DashboardCalendarProps {
    startDate: string
    endDate: string
    currentMonth: Date
    selectedDate?: Date
    currencySymbol: string
}

export async function DashboardCalendar({
    startDate,
    endDate,
    currentMonth,
    selectedDate,
    currencySymbol
}: DashboardCalendarProps) {
    const { data: dailyExpenses } = await getDailyExpenses({ startDate, endDate })

    return (
        <ExpenseCalendarWrapper
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            currencySymbol={currencySymbol}
            dailyExpenses={dailyExpenses || {}}
        />
    )
}
