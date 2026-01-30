import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/dashboard-layout'
import { SettingsClient } from './settings-client'
import { getUserSettings } from '@/app/actions/settings'

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        redirect('/login')
    }

    // Get user settings
    const { data: settings } = await getUserSettings()
    const currency = settings?.currency || 'USD'

    return (
        <DashboardLayout userEmail={user.email}>
            <SettingsClient userId={user.id} userEmail={user.email || ''} currency={currency} />
        </DashboardLayout>
    )
}
