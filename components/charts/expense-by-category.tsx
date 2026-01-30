'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface ExpenseByCategoryProps {
    data: Array<{
        name: string
        value: number
        color: string
    }>
    currencySymbol?: string
}

export function ExpenseByCategory({ data, currencySymbol = '$' }: ExpenseByCategoryProps) {
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
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip formatter={(value: number | undefined) => `${currencySymbol}${value!.toFixed(2)}`} />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    )
}
