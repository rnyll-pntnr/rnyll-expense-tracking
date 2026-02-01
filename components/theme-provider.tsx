'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { useTheme } from '@/hooks/useTheme'
import type { Theme } from '@/types'

interface ThemeProviderProps {
    children: React.ReactNode
}

interface ThemeContextType {
    theme: Theme
    setTheme: (theme: Theme) => void
    isDark: boolean
    isLight: boolean
    isSystem: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: ThemeProviderProps) {
    const { theme: savedTheme, loading } = useTheme()
    const [theme, setThemeState] = useState<Theme>('system')
    const [mounted, setMounted] = useState(false)

    // Once component mounts, we can safely use the hook value
    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (loading) return
        
        setThemeState(savedTheme)
        // Apply the loaded theme to the document
        if (typeof window !== 'undefined') {
            const root = window.document.documentElement
            root.classList.remove('light', 'dark')
            
            if (savedTheme === 'system') {
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
                root.classList.add(systemTheme)
            } else {
                root.classList.add(savedTheme)
            }
        }
    }, [loading, savedTheme])

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme)
        if (typeof window !== 'undefined') {
            // Apply theme to document
            const root = window.document.documentElement
            root.classList.remove('light', 'dark')
            
            if (newTheme === 'system') {
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
                root.classList.add(systemTheme)
            } else {
                root.classList.add(newTheme)
            }
        }
    }

    // Check if we're on the server
    if (typeof window === 'undefined') {
        return <>{children}</>
    }

    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    const isLight = theme === 'light' || (theme === 'system' && !window.matchMedia('(prefers-color-scheme: dark)').matches)
    const isSystem = theme === 'system'

    // Early return for SSR or before mounting to prevent hydration mismatch
    if (!mounted) {
        return <>{children}</>
    }

    return (
        <ThemeContext.Provider value={{ theme, setTheme, isDark, isLight, isSystem }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useThemeContext() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error('useThemeContext must be used within a ThemeProvider')
    }
    return context
}
