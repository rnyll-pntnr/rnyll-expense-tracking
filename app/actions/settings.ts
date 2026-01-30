'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export interface UserSettings {
    id: string
    user_id: string
    currency: string
    created_at: string
    updated_at: string
}

export async function getUserSettings() {
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
            return { data: { currency: 'USD' }, error: null }
        }
        return { data: null, error: error.message }
    }

    return { data, error: null }
}

export async function updateUserSettings(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const currency = formData.get('currency') as string

    // Upsert settings
    const { data, error } = await supabase
        .from('user_settings')
        .upsert({
            user_id: user.id,
            currency: currency || 'USD',
        })
        .select()
        .single()

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/settings')
    return { data, error: null }
}
