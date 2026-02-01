'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface SidebarContextType {
    collapsed: boolean
    toggle: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
    // Initialize from localStorage to prevent hydration mismatch
    const [collapsed, setCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('sidebarCollapsed')
            return saved !== null ? JSON.parse(saved) : false
        }
        return false
    })

    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed))
    }, [collapsed])

    const toggle = () => {
        setCollapsed((prev: boolean) => !prev)
    }

    const contextValue = {
        collapsed,
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
