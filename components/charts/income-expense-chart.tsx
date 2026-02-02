'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { formatCurrency } from '@/lib/formatting'

interface IncomeExpenseChartProps {
    data: Array<{
        month: string
        income: number
        expenses: number
    }>
    currencySymbol?: string
    currencyCode?: string
    title?: string
}

export function IncomeExpenseChart({ 
    data, 
    currencySymbol = '$', 
    currencyCode = 'USD',
    title = 'Income vs Expenses'
}: IncomeExpenseChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                    <p className="text-lg font-medium text-gray-600">No data available</p>
                    <p className="text-sm text-gray-500 mt-1">Add transactions to view income and expense comparisons</p>
                </div>
            </div>
        )
    }

    const colors = {
        income: '#10b981',
        expenses: '#ef4444'
    }

    return (
        <div className="w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={250} minHeight={200}>
                <BarChart
                    data={data}
                    margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                        dataKey="month" 
                        stroke="#6b7280"
                        style={{ fontSize: '11px' }}
                        label={{ value: 'Month', position: 'insideBottom', offset: -10 }}
                    />
                    <YAxis 
                        stroke="#6b7280"
                        style={{ fontSize: '11px' }}
                        tickFormatter={(value) => `${currencySymbol}${value}`}
                        label={{ value: 'Amount', angle: -90, position: 'insideLeft' }}
                    />
                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontSize: '12px'
                    }}
                    formatter={(value: number | undefined) => 
                        value !== undefined ? formatCurrency(value, currencyCode, { showSymbol: true }) : '-'
                    }
                    labelStyle={{ fontWeight: '600', marginBottom: '4px' }}
                />
                    <Legend 
                        wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                    />
                    <Bar 
                        dataKey="income" 
                        name="Income" 
                        radius={[4, 4, 0, 0]}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-income-${index}`} fill={colors.income} />
                        ))}
                    </Bar>
                    <Bar 
                        dataKey="expenses" 
                        name="Expenses" 
                        radius={[4, 4, 0, 0]}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-expenses-${index}`} fill={colors.expenses} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 text-sm text-gray-600">
                <p>Compares monthly income and expenses to track your spending habits</p>
            </div>
        </div>
    )
}
