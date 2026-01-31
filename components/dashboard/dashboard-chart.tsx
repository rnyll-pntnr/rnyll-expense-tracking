import { getExpensesByCategory } from '@/app/actions/transactions'
import { ExpenseByCategory } from '@/components/charts/expense-by-category'

interface DashboardCategoryChartProps {
    startDate: string
    endDate: string
    currencyCode: string
    currencySymbol: string
}

export async function DashboardCategoryChart({
    startDate,
    endDate,
    currencyCode,
    currencySymbol
}: DashboardCategoryChartProps) {
    const { data: categoryData } = await getExpensesByCategory({ startDate, endDate })

    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 p-3 sm:p-4">
            <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Expenses by Category</h3>
            <ExpenseByCategory
                data={categoryData || []}
                currencySymbol={currencySymbol}
                currencyCode={currencyCode}
            />
        </div>
    )
}
