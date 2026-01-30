'use client'

import { Sidebar } from './sidebar'
import { SidebarProvider, useSidebar } from './sidebar-context'
import { ReactNode, useEffect, useState } from 'react'

function DashboardLayoutContent({
    children,
    userEmail,
}: {
    children: ReactNode
    userEmail?: string
}) {
    const { collapsed } = useSidebar()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const displayCollapsed = mounted ? collapsed : false

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
            <Sidebar userEmail={userEmail} />

            {/* Main content - with proper responsive padding */}
            <div className={`
                transition-all duration-300
                pt-16 lg:pt-0
                ${displayCollapsed ? 'lg:pl-20' : 'lg:pl-72'}
            `}>
                <main className="min-h-screen">
                    {children}
                </main>
            </div>
        </div>
    )
}

export function DashboardLayout({
    children,
    userEmail,
}: {
    children: ReactNode
    userEmail?: string
}) {
    return (
        <SidebarProvider>
            <DashboardLayoutContent userEmail={userEmail}>
                {children}
            </DashboardLayoutContent>
        </SidebarProvider>
    )
}
