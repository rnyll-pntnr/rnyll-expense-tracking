'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { formatCurrency } from '@/lib/formatting'

interface ExpenseByCategoryProps {
    data: Array<{
        name: string
        value: number
        color: string
    }>
    currencySymbol?: string
    currencyCode?: string
    title?: string
}

export function ExpenseByCategory({ 
    data, 
    currencySymbol = '$', 
    currencyCode = 'USD',
    title = 'Expenses by Category'
}: ExpenseByCategoryProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                    <p className="text-lg font-medium text-gray-600">No expense data available</p>
                    <p className="text-sm text-gray-500 mt-1">Add expenses to view category breakdown</p>
                </div>
            </div>
        )
    }

    const total = data.reduce((sum, item) => sum + item.value, 0)

    return (
        <div className="w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={250} minHeight={200}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent! * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number | undefined) => formatCurrency(value!, currencyCode, { showSymbol: true })} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 text-sm text-gray-600">
                <p>Total expenses: <span className="font-medium">{formatCurrency(total, currencyCode, { showSymbol: true })}</span></p>
                <p className="mt-1">Breakdown of expenses by category to identify spending patterns</p>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {data.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: category.color }}
                            />
                            <span className="text-gray-700">{category.name}</span>
                        </div>
                        <span className="font-medium text-gray-900">
                            {formatCurrency(category.value, currencyCode, { showSymbol: true })}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
