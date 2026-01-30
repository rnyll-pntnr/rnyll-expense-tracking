'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type CategoryType = 'income' | 'expense'

export interface Category {
    id: string
    user_id: string
    name: string
    type: CategoryType
    color: string
    icon: string
    created_at: string
    updated_at: string
}

export async function addCategory(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const name = formData.get('name') as string
    const type = formData.get('type') as CategoryType
    const color = formData.get('color') as string
    const icon = formData.get('icon') as string

    const { data, error } = await supabase
        .from('categories')
        .insert({
            user_id: user.id,
            name,
            type,
            color: color || '#6366f1',
            icon: icon || 'tag',
        })
        .select()
        .single()

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/expenses')
    return { data, error: null }
}

export async function updateCategory(id: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const name = formData.get('name') as string
    const color = formData.get('color') as string
    const icon = formData.get('icon') as string

    const { data, error } = await supabase
        .from('categories')
        .update({
            name,
            color,
            icon,
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/expenses')
    return { data, error: null }
}

export async function deleteCategory(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    // Note: Transactions with this category will have category_id set to NULL (ON DELETE SET NULL)
    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/expenses')
    return { error: null }
}

export async function getCategories(type?: CategoryType) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { data: null, error: 'Unauthorized' }
    }

    let query = supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name')

    if (type) {
        query = query.eq('type', type)
    }

    const { data, error } = await query

    if (error) {
        return { data: null, error: error.message }
    }

    return { data: data as Category[], error: null }
}

// Seed default categories for a new user
export async function seedDefaultCategories() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    // Check if user already has categories
    const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)

    if (existing && existing.length > 0) {
        return { error: 'Categories already exist' }
    }

    const defaultCategories = [
        // Expense categories
        { name: 'Food & Dining', type: 'expense', color: '#ef4444', icon: 'utensils' },
        { name: 'Transportation', type: 'expense', color: '#f59e0b', icon: 'car' },
        { name: 'Shopping', type: 'expense', color: '#ec4899', icon: 'shopping-bag' },
        { name: 'Bills & Utilities', type: 'expense', color: '#8b5cf6', icon: 'file-text' },
        { name: 'Entertainment', type: 'expense', color: '#06b6d4', icon: 'film' },
        { name: 'Healthcare', type: 'expense', color: '#10b981', icon: 'heart' },
        { name: 'Education', type: 'expense', color: '#3b82f6', icon: 'book' },
        { name: 'Other Expense', type: 'expense', color: '#6b7280', icon: 'tag' },
        // Income categories
        { name: 'Salary', type: 'income', color: '#10b981', icon: 'briefcase' },
        { name: 'Freelance', type: 'income', color: '#3b82f6', icon: 'code' },
        { name: 'Investment', type: 'income', color: '#8b5cf6', icon: 'trending-up' },
        { name: 'Gift', type: 'income', color: '#ec4899', icon: 'gift' },
        { name: 'Other Income', type: 'income', color: '#6b7280', icon: 'tag' },
    ]

    const categoriesToInsert = defaultCategories.map((cat) => ({
        ...cat,
        user_id: user.id,
    }))

    const { data, error } = await supabase
        .from('categories')
        .insert(categoriesToInsert)
        .select()

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/expenses')
    return { data, error: null }
}
