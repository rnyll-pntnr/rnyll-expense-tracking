'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { UserSettings, Theme } from '@/types'

export async function getUserSettings(): Promise<{ data: UserSettings | { currency: string; theme: Theme } | null; error: string | null }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { data: null, error: 'Unauthorized' }
    }

    const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

    if (error) {
        // If no settings exist, return default
        if (error.code === 'PGRST116') {
            return { data: { currency: 'USD', theme: 'system' }, error: null }
        }
        return { data: null, error: error.message }
    }

    return { data, error: null }
}

export async function updateUserSettings(formData: FormData): Promise<{ data: UserSettings | null; error: string | null }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { data: null, error: 'Unauthorized' }
    }

    const currency = formData.get('currency') as string
    const theme = formData.get('theme') as Theme

    // First, get the existing settings to get the id
    const { data: existingSettings, error: fetchError } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', user.id)
        .single()

    let data, error

    if (existingSettings) {
        // Update existing record
        const updateData: Partial<UserSettings> = {}
        if (currency) updateData.currency = currency
        if (theme) updateData.theme = theme

        const result = await supabase
            .from('user_settings')
            .update(updateData)
            .eq('id', existingSettings.id)
            .select()
            .single()
        data = result.data
        error = result.error
    } else {
        // Insert new record
        const result = await supabase
            .from('user_settings')
            .insert({ 
                user_id: user.id, 
                currency: currency || 'USD', 
                theme: theme || 'system' 
            })
            .select()
            .single()
        data = result.data
        error = result.error
    }

    if (error) {
        return { data: null, error: error.message }
    }

    revalidatePath('/dashboard/settings')
    return { data, error: null }
}

export async function updateUserName(formData: FormData): Promise<{ error: string | null }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const name = formData.get('name') as string

    const { error } = await supabase.auth.updateUser({
        data: { name },
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/settings')
    return { error: null }
}

export async function updateUserPassword(formData: FormData): Promise<{ error: string | null }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const newPassword = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (newPassword !== confirmPassword) {
        return { error: 'Passwords do not match' }
    }

    if (newPassword.length < 6) {
        return { error: 'Password must be at least 6 characters long' }
    }

    const { error } = await supabase.auth.updateUser({
        password: newPassword,
    })

    if (error) {
        return { error: error.message }
    }

    return { error: null }
}
