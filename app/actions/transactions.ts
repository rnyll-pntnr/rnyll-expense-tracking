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
}): Promise<{ data: TransactionStats | null; error: string | null }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { data: null, error: 'Unauthorized' }
    }

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

    const { data, error } = await query

    if (error) {
        return { data: null, error: error.message }
    }

    const stats: TransactionStats = {
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

    stats.balance = stats.totalIncome - stats.totalExpense

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
