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
            <ExpenseByCategory
                data={data}
                currencySymbol={currencySymbol}
                currencyCode={currencyCode}
            />
        </div>
    )
}
