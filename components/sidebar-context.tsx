'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface SidebarContextType {
    collapsed: boolean
    toggle: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
    // Initialize from localStorage on mount to prevent hydration mismatch
    const [collapsed, setCollapsed] = useState(true) // Default to collapsed
    const [isInitialized, setIsInitialized] = useState(false)

    useEffect(() => {
        const saved = localStorage.getItem('sidebarCollapsed')
        if (saved !== null) {
            setCollapsed(JSON.parse(saved))
        } else {
            // Default to expanded if no saved preference
            setCollapsed(false)
        }
        setIsInitialized(true)
    }, [])

    const toggle = () => {
        setCollapsed((prev) => {
            const newValue = !prev
            localStorage.setItem('sidebarCollapsed', JSON.stringify(newValue))
            return newValue
        })
    }

    // Use collapsed state if initialized, otherwise use current state
    const contextValue = {
        collapsed: isInitialized ? collapsed : false,
        toggle
    }

    return (
        <SidebarContext.Provider value={contextValue}>
            {children}
        </SidebarContext.Provider>
    )
}

export function useSidebar() {
    const context = useContext(SidebarContext)
    if (context === undefined) {
        throw new Error('useSidebar must be used within a SidebarProvider')
    }
    return context
}
