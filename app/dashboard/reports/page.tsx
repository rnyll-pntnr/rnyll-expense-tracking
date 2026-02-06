import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/dashboard-layout'
import {
    getExpensesByCategory,
    getTransactionStats,
    getMonthlyTrends,
    getSpendingComparison
} from '@/app/actions/transactions'
import { getUserSettings } from '@/app/actions/settings'
import { getCurrencyInfo, formatCurrency } from '@/lib/currencies'
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subMonths } from 'date-fns'
import { ReportsClient } from './reports-client'

export default async function ReportsPage() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        redirect('/login')
    }

    const now = new Date()
    const currentMonthStart = startOfMonth(now)
    const currentMonthEnd = endOfMonth(now)
    const previousMonthStart = startOfMonth(subMonths(now, 1))
    const previousMonthEnd = endOfMonth(subMonths(now, 1))

    const [
        statsResult,
        categoryResult,
        trendsResult,
        comparisonResult,
        settingsResult
    ] = await Promise.all([
        getTransactionStats({
            startDate: format(previousMonthStart, 'yyyy-MM-dd'),
            endDate: format(currentMonthEnd, 'yyyy-MM-dd')
        }, { includeOverallBalance: true }),
        getExpensesByCategory({
            startDate: format(previousMonthStart, 'yyyy-MM-dd'),
            endDate: format(currentMonthEnd, 'yyyy-MM-dd')
        }),
        getMonthlyTrends(),
        getSpendingComparison(
            {
                startDate: format(currentMonthStart, 'yyyy-MM-dd'),
                endDate: format(currentMonthEnd, 'yyyy-MM-dd')
            },
            {
                startDate: format(previousMonthStart, 'yyyy-MM-dd'),
                endDate: format(previousMonthEnd, 'yyyy-MM-dd')
            }
        ),
        getUserSettings()
    ])

    const currency = await getCurrencyInfo(settingsResult.data?.currency || 'USD')
    const currencySymbol = currency.symbol
    const currencyCode = settingsResult.data?.currency || 'USD'

    const initialData = {
        stats: statsResult.data || {
            totalIncome: 0,
            totalExpense: 0,
            balance: 0,
            transactionCount: 0
        },
        categoryData: categoryResult.data || [],
        trendData: trendsResult.data || [],
        comparisonData: comparisonResult.data || null,
        currencySymbol,
        currencyCode
    }

    return (
        <DashboardLayout userEmail={user.email} userName={user.user_metadata.name}>
            <ReportsClient
                initialData={initialData}
                user={user}
            />
        </DashboardLayout>
    )
}
