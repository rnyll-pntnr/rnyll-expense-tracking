import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ExpensesPageClient from './expenses-client'

export default async function ExpensesPage() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        redirect('/login')
    }

    return <ExpensesPageClient userEmail={user.email} />
}
