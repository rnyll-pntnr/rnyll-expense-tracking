'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { 
    Transaction, 
    TransactionWithCategory, 
    TransactionFilters, 
    TransactionStats, 
    CategoryExpense, 
    DailyExpense,
    TransactionType
} from '@/types'

export async function addTransaction(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const type = formData.get('type') as TransactionType
    const amount = parseFloat(formData.get('amount') as string)
    const category_id = formData.get('category_id') as string | null
    const description = formData.get('description') as string
    const date = formData.get('date') as string

    const { data, error } = await supabase
        .from('transactions')
        .insert({
            user_id: user.id,
            type,
            amount,
            category_id: category_id || null,
            description: description || null,
            date,
        })
        .select()
        .single()

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/expenses')
    return { data, error: null }
}

export async function updateTransaction(id: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const type = formData.get('type') as TransactionType
    const amount = parseFloat(formData.get('amount') as string)
    const category_id = formData.get('category_id') as string | null
    const description = formData.get('description') as string
    const date = formData.get('date') as string

    const { data, error } = await supabase
        .from('transactions')
        .update({
            type,
            amount,
            category_id: category_id || null,
            description: description || null,
            date,
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/expenses')
    return { data, error: null }
}

export async function deleteTransaction(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/expenses')
    return { error: null }
}

export async function getTransactions(filters?: TransactionFilters): Promise<{ 
    data: TransactionWithCategory[] | null; 
    error: string | null; 
    total?: number 
}> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { data: null, error: 'Unauthorized' }
    }

    // Build count query
    let countQuery = supabase
        .from('transactions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)

    // Build data query
    let dataQuery = supabase
        .from('transactions')
        .select(`
      *,
      category:categories(id, name, color, icon)
    `)
        .eq('user_id', user.id)
        .order('date', { ascending: false })

    // Apply filters to both queries
    if (filters?.type) {
        countQuery = countQuery.eq('type', filters.type)
        dataQuery = dataQuery.eq('type', filters.type)
    }

    if (filters?.category_id) {
        countQuery = countQuery.eq('category_id', filters.category_id)
        dataQuery = dataQuery.eq('category_id', filters.category_id)
    }

    if (filters?.startDate) {
        countQuery = countQuery.gte('date', filters.startDate)
        dataQuery = dataQuery.gte('date', filters.startDate)
    }

    if (filters?.endDate) {
        countQuery = countQuery.lte('date', filters.endDate)
        dataQuery = dataQuery.lte('date', filters.endDate)
    }

    if (filters?.description) {
        countQuery = countQuery.ilike('description', `%${filters.description}%`)
        dataQuery = dataQuery.ilike('description', `%${filters.description}%`)
    }

    // Apply pagination to data query only
    const page = filters?.page || 1
    const limit = filters?.limit || 10
    const from = (page - 1) * limit
    const to = from + limit - 1
    dataQuery = dataQuery.range(from, to)

    // Fetch count and data in parallel
    const [countResult, dataResult] = await Promise.all([
        countQuery,
        dataQuery
    ])

    if (dataResult.error) {
        return { data: null, error: dataResult.error.message, total: 0 }
    }

    return { 
        data: dataResult.data as TransactionWithCategory[], 
        error: null, 
        total: countResult.count || 0 
    }
}

export async function getTransactionStats(dateRange?: {
    startDate?: string
    endDate?: string
}, options?: {
    includeOverallBalance?: boolean
}): Promise<{ data: TransactionStats & { overallBalance?: number } | null; error: string | null }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { data: null, error: 'Unauthorized' }
    }

    // Fetch filtered stats
    let query = supabase
        .from('transactions')
        .select('type, amount, date')
        .eq('user_id', user.id)

    if (dateRange?.startDate) {
        query = query.gte('date', dateRange.startDate)
    }

    if (dateRange?.endDate) {
        query = query.lte('date', dateRange.endDate)
    }

    // If we need overall balance, fetch all transactions without date filters
    let overallBalance: number | undefined
    if (options?.includeOverallBalance) {
        const allTransactionsQuery = supabase
            .from('transactions')
            .select('type, amount')
            .eq('user_id', user.id)
        
        const { data: allTransactions, error: allTransactionsError } = await allTransactionsQuery
        if (!allTransactionsError && allTransactions) {
            overallBalance = allTransactions.reduce((sum, transaction) => {
                if (transaction.type === 'income') {
                    return sum + Number(transaction.amount)
                } else {
                    return sum - Number(transaction.amount)
                }
            }, 0)
        }
    }

    const { data, error } = await query

    if (error) {
        return { data: null, error: error.message }
    }

    const stats: TransactionStats & { overallBalance?: number } = {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        transactionCount: data.length,
    }

    data.forEach((transaction) => {
        if (transaction.type === 'income') {
            stats.totalIncome += Number(transaction.amount)
        } else {
            stats.totalExpense += Number(transaction.amount)
        }
    })

    // If including overall balance, use that instead of filtered balance
    stats.balance = options?.includeOverallBalance && overallBalance !== undefined 
        ? overallBalance 
        : stats.totalIncome - stats.totalExpense

    if (options?.includeOverallBalance) {
        stats.overallBalance = overallBalance
    }

    return { data: stats, error: null }
}

export async function getExpensesByCategory(dateRange?: {
    startDate?: string
    endDate?: string
}): Promise<{ data: CategoryExpense[] | null; error: string | null }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { data: null, error: 'Unauthorized' }
    }

    let query = supabase
        .from('transactions')
        .select(`
      amount,
      category:categories(id, name, color)
    `)
        .eq('user_id', user.id)
        .eq('type', 'expense')

    if (dateRange?.startDate) {
        query = query.gte('date', dateRange.startDate)
    }

    if (dateRange?.endDate) {
        query = query.lte('date', dateRange.endDate)
    }

    const { data, error } = await query

    if (error) {
        return { data: null, error: error.message }
    }

    // Group by category
    const categoryMap = new Map<string, CategoryExpense>()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data.forEach((transaction: any) => {
        const categoryName = (transaction.category as { name?: string } | null)?.name || 'Uncategorized'
        const categoryColor = (transaction.category as { color?: string } | null)?.color || '#6b7280'
        const amount = Number(transaction.amount)

        if (categoryMap.has(categoryName)) {
            categoryMap.set(categoryName, {
                name: categoryName,
                value: categoryMap.get(categoryName)!.value + amount,
                color: categoryColor,
            })
        } else {
            categoryMap.set(categoryName, {
                name: categoryName,
                value: amount,
                color: categoryColor,
            })
        }
    })

    return { data: Array.from(categoryMap.values()), error: null }
}

export async function getDailyExpenses(dateRange?: {
    startDate?: string
    endDate?: string
}): Promise<{ data: DailyExpense | null; error: string | null }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { data: null, error: 'Unauthorized' }
    }

    let query = supabase
        .from('transactions')
        .select('amount, date, type')
        .eq('user_id', user.id)

    if (dateRange?.startDate) {
        query = query.gte('date', dateRange.startDate)
    }

    if (dateRange?.endDate) {
        query = query.lte('date', dateRange.endDate)
    }

    const { data, error } = await query

    if (error) {
        return { data: null, error: error.message }
    }

    // Group by date
    const dailyMap = new Map<string, number>()

    data.forEach((transaction) => {
        const date = transaction.date
        const amount = Number(transaction.amount)

        if (transaction.type === 'expense') {
            if (dailyMap.has(date)) {
                dailyMap.set(date, dailyMap.get(date)! + amount)
            } else {
                dailyMap.set(date, amount)
            }
        }
    })

    return { data: Object.fromEntries(dailyMap), error: null }
}

import { format } from 'date-fns'

export async function getMonthlyTrends(): Promise<{ 
    data: Array<{ month: string; income: number; expenses: number; balance: number }> | null; 
    error: string | null 
}> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { data: null, error: 'Unauthorized' }
    }

    // Get last 12 months of data
    const now = new Date()
    const months = []
    
    for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthStr = format(date, 'yyyy-MM')
        const monthName = format(date, 'MMM yyyy')
        
        const monthStart = format(date, 'yyyy-MM-01')
        const monthEnd = format(new Date(date.getFullYear(), date.getMonth() + 1, 0), 'yyyy-MM-dd')
        
        const { data: transactions, error } = await supabase
            .from('transactions')
            .select('type, amount')
            .eq('user_id', user.id)
            .gte('date', monthStart)
            .lte('date', monthEnd)
        
        if (error) {
            return { data: null, error: error.message }
        }
        
        const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0)
        const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0)
        
        months.push({
            month: monthName,
            income,
            expenses,
            balance: income - expenses
        })
    }
    
    return { data: months, error: null }
}

export async function getSpendingComparison(dateRange1?: { startDate?: string; endDate?: string }, dateRange2?: { startDate?: string; endDate?: string }): Promise<{ 
    data: { current: TransactionStats; previous: TransactionStats; change: { income: number; expenses: number; balance: number } } | null; 
    error: string | null 
}> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { data: null, error: 'Unauthorized' }
    }

    const [currentStatsResult, previousStatsResult] = await Promise.all([
        getTransactionStats(dateRange1),
        getTransactionStats(dateRange2)
    ])

    if (currentStatsResult.error || previousStatsResult.error) {
        return { 
            data: null, 
            error: currentStatsResult.error || previousStatsResult.error 
        }
    }

    const current = currentStatsResult.data || { totalIncome: 0, totalExpense: 0, balance: 0, transactionCount: 0 }
    const previous = previousStatsResult.data || { totalIncome: 0, totalExpense: 0, balance: 0, transactionCount: 0 }

    const change = {
        income: previous.totalIncome > 0 ? ((current.totalIncome - previous.totalIncome) / previous.totalIncome) * 100 : 0,
        expenses: previous.totalExpense > 0 ? ((current.totalExpense - previous.totalExpense) / previous.totalExpense) * 100 : 0,
        balance: previous.balance > 0 ? ((current.balance - previous.balance) / previous.balance) * 100 : 0
    }

    return { 
        data: { current, previous, change }, 
        error: null 
    }
}
