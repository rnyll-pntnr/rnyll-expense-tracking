import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ExpensesPageClient from './expenses-client'
import { getTransactions, getTransactionStats } from '@/app/actions/transactions'
import { getCategories } from '@/app/actions/categories'
import { getUserSettings } from '@/app/actions/settings'
import { getCurrencyInfo } from '@/lib/currencies'
import { format, startOfMonth, endOfMonth } from 'date-fns'

export default async function ExpensesPage() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        redirect('/login')
    }

    // Hydrate initial data on the server to prevent client-side waterfalls
    const now = new Date()
    const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
    const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd')

    const [
        transactionsResult,
        statsResult,
        categoriesResult,
        settingsResult
    ] = await Promise.all([
        getTransactions({ limit: 10 }),
        getTransactionStats({ startDate: monthStart, endDate: monthEnd }, { includeOverallBalance: true }),
        getCategories(),
        getUserSettings()
    ])

    const currency = await getCurrencyInfo(settingsResult.data?.currency || 'AED')

    return (
        <ExpensesPageClient
            userEmail={user.email}
            initialData={{
                transactions: transactionsResult.data || [],
                totalCount: transactionsResult.total || 0,
                stats: statsResult.data || {
                    totalIncome: 0,
                    totalExpense: 0,
                    balance: 0,
                    transactionCount: 0
                },
                categories: categoriesResult.data || [],
                currencySymbol: currency.symbol,
                currencyCode: settingsResult.data?.currency || 'AED'
            }}
        />
    )
}
