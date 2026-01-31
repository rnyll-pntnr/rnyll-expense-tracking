import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/dashboard-layout'
import { getTransactionStats, getTransactions, getExpensesByCategory, getDailyExpenses } from '@/app/actions/transactions'
import { getUserSettings } from '@/app/actions/settings'
import { getCurrencyInfo } from '@/lib/currencies'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { DashboardViews } from '@/components/dashboard/dashboard-views'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        redirect('/login')
    }

    const now = new Date()
    const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
    const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd')

    // Initial server fetch for current month
    const [statsResult, recentResult, categoryResult, settingsResult, dailyExpensesResult] = await Promise.all([
        getTransactionStats({ startDate: monthStart, endDate: monthEnd }),
        getTransactions({ limit: 5 }),
        getExpensesByCategory({ startDate: monthStart, endDate: monthEnd }),
        getUserSettings(),
        getDailyExpenses({ startDate: monthStart, endDate: monthEnd }),
    ])

    const stats = statsResult.data || { totalIncome: 0, totalExpense: 0, balance: 0, transactionCount: 0 }
    const recentTransactions = recentResult.data || []
    const categoryData = categoryResult.data || []
    const dailyExpenses = dailyExpensesResult.data || {}
    const currency = await getCurrencyInfo(settingsResult.data?.currency || 'USD')
    const currencySymbol = currency.symbol
    const currencyCode = settingsResult.data?.currency || 'USD'

    return (
        <DashboardLayout userEmail={user.email} userName={user.user_metadata.name}>
            <div className="p-4 sm:p-6 lg:p-8">
                <DashboardViews
                    initialStats={stats}
                    initialCategoryData={categoryData}
                    initialDailyExpenses={dailyExpenses}
                    initialMonth={now}
                    userEmail={user.email}
                    userName={user.user_metadata.name}
                    currencySymbol={currencySymbol}
                    currencyCode={currencyCode}
                    recentTransactions={recentTransactions}
                />
            </div>
        </DashboardLayout>
    )
}
