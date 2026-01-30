'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        // Provide more specific error messages
        let errorMessage = 'Could not authenticate user'

        if (error.message.includes('Invalid login credentials')) {
            errorMessage = 'Invalid email or password. Please try again.'
        } else if (error.message.includes('Email not confirmed')) {
            errorMessage = 'Please verify your email address before signing in.'
        } else if (error.message) {
            errorMessage = error.message
        }

        redirect(`/login?error=${encodeURIComponent(errorMessage)}`)
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()
    const origin = (await headers()).get('origin')

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${origin}/auth/confirm`,
        },
    })

    if (error) {
        // Provide more specific error messages
        let errorMessage = 'Could not create account'

        if (error.message.includes('already registered')) {
            errorMessage = 'This email is already registered. Please sign in instead.'
        } else if (error.message.includes('Password')) {
            errorMessage = 'Password must be at least 6 characters long.'
        } else if (error.message) {
            errorMessage = error.message
        }

        redirect(`/login?error=${encodeURIComponent(errorMessage)}`)
    }

    revalidatePath('/', 'layout')
    redirect('/login?message=' + encodeURIComponent('Account created! Check your email to verify your account.'))
}

export async function signout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login?message=' + encodeURIComponent('You have been signed out successfully.'))
}
