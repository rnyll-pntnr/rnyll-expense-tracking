'use client'

import { Sidebar } from './sidebar'
import { SidebarProvider, useSidebar } from './sidebar-context'
import { ReactNode } from 'react'

function DashboardLayoutContent({
    children,
    userEmail,
    userName,
}: {
    children: ReactNode
    userEmail?: string
    userName?: string
}) {
    const { collapsed } = useSidebar()

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-slate-100 to-slate-200 flex flex-col">
            <Sidebar userEmail={userEmail} userName={userName} />

            {/* Main content - with proper responsive padding */}
            <div className={`
                transition-all duration-300
                pt-6 lg:pt-0
                ${collapsed ? 'lg:pl-20' : 'lg:pl-72'}
                flex-1
            `}>
                <main className="min-h-screen">
                    {children}
                </main>
            </div>

            {/* Footer */}
            <footer className={`
                transition-all duration-300
                pt-4 pb-6 px-4 sm:px-6
                ${collapsed ? 'lg:pl-20' : 'lg:pl-72'}
                bg-linear-to-r from-slate-50 to-slate-100 border-t border-slate-200
            `}>
                <div className="max-w-8xl mx-auto text-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Expense Tracking made by Ranyll Puntanar. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}

export function DashboardLayout({
    children,
    userEmail,
    userName,
}: {
    children: ReactNode
    userEmail?: string
    userName?: string
}) {
    return (
        <SidebarProvider>
            <DashboardLayoutContent userEmail={userEmail} userName={userName}>
                {children}
            </DashboardLayoutContent>
        </SidebarProvider>
    )
}
