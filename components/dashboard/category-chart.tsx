import { ExpenseByCategory } from '@/components/charts/expense-by-category'
import type { CategoryExpense } from '@/types'

interface CategoryChartProps {
    data: CategoryExpense[]
    currencySymbol: string
    currencyCode: string
}

export function CategoryChart({ data, currencySymbol, currencyCode }: CategoryChartProps) {
    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 p-3 sm:p-4">
            <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Expenses by Category</h3>
            <ExpenseByCategory
                data={data}
                currencySymbol={currencySymbol}
                currencyCode={currencyCode}
            />
        </div>
    )
}
