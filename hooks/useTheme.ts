'use client'

import { useState, useEffect } from 'react'
import { getUserSettings } from '@/app/actions/settings'
import type { Theme } from '@/types'

export function useTheme() {
    const [theme, setTheme] = useState<Theme>('system')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const loadThemeSettings = async () => {
            try {
                setLoading(true)
                console.log('Loading theme settings...')
                const { data, error } = await getUserSettings()
                
                if (error) {
                    console.error('Error loading theme settings:', error)
                    setError(error)
                    // Fallback to system theme
                    setTheme('system')
                    return
                }

                console.log('Loaded theme from settings:', data?.theme)
                setTheme(data?.theme || 'system')
            } catch (err) {
                console.error('Error in loadThemeSettings:', err)
                setError('Failed to load theme settings')
                setTheme('system')
            } finally {
                setLoading(false)
            }
        }

        loadThemeSettings()
    }, [])

    useEffect(() => {
        // Apply theme to document (only client-side)
        if (loading || typeof window === 'undefined') return

        console.log('Applying theme:', theme)
        const root = window.document.documentElement
        root.classList.remove('light', 'dark')

        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
            console.log('System theme detected:', systemTheme)
            root.classList.add(systemTheme)
        } else {
            root.classList.add(theme)
        }
        
        console.log('Root class list after theme application:', root.classList)
    }, [theme, loading])

    // Listen for system theme changes when theme is set to 'system'
    useEffect(() => {
        if (theme !== 'system' || typeof window === 'undefined') return

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = (e: MediaQueryListEvent) => {
            console.log('System theme changed:', e.matches ? 'dark' : 'light')
            const root = window.document.documentElement
            root.classList.remove('light', 'dark')
            root.classList.add(e.matches ? 'dark' : 'light')
        }

        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [theme])

    return {
        theme,
        loading,
        error,
    }
}
