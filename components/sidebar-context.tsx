'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface SidebarContextType {
    collapsed: boolean
    toggle: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
    const [collapsed, setCollapsed] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const saved = localStorage.getItem('sidebarCollapsed')
        if (saved) {
            setCollapsed(JSON.parse(saved))
        }
    }, [])

    const toggle = () => {
        setCollapsed((prev) => {
            const newValue = !prev
            localStorage.setItem('sidebarCollapsed', JSON.stringify(newValue))
            return newValue
        })
    }

    // Prevent hydration mismatch
    if (!mounted) {
        return (
            <SidebarContext.Provider value={{ collapsed: false, toggle }}>
                {children}
            </SidebarContext.Provider>
        )
    }

    return (
        <SidebarContext.Provider value={{ collapsed, toggle }}>
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
