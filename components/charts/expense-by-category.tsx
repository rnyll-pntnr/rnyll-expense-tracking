'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { formatCurrency } from '@/lib/currencies'

interface ExpenseByCategoryProps {
    data: Array<{
        name: string
        value: number
        color: string
    }>
    currencySymbol?: string
    currencyCode?: string
}

export function ExpenseByCategory({ data, currencySymbol = '$', currencyCode = 'USD' }: ExpenseByCategoryProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500">
                <p>No expense data available</p>
            </div>
        )
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent! * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip formatter={(value: number | undefined) => `${currencySymbol}${formatCurrency(value!, currencyCode)}`} />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    )
}
