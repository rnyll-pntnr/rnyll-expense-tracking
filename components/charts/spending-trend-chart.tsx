'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/formatting'

interface SpendingTrendChartProps {
    data: Array<{
        month: string
        income: number
        expenses: number
        balance: number
    }>
    currencySymbol?: string
    currencyCode?: string
    title?: string
}

export function SpendingTrendChart({ 
    data, 
    currencySymbol = '$', 
    currencyCode = 'USD',
    title = 'Spending Trend'
}: SpendingTrendChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                    <p className="text-lg font-medium text-gray-600">No trend data available</p>
                    <p className="text-sm text-gray-500 mt-1">Add transactions to view your spending trends</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={350}>
                <LineChart
                    data={data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                        dataKey="month" 
                        stroke="#6b7280"
                        style={{ fontSize: '12px' }}
                        label={{ value: 'Month', position: 'insideBottom', offset: -10 }}
                    />
                    <YAxis 
                        stroke="#6b7280"
                        style={{ fontSize: '12px' }}
                        tickFormatter={(value) => `${currencySymbol}${value}`}
                        label={{ value: 'Amount', angle: -90, position: 'insideLeft' }}
                    />
                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: number | undefined) => 
                        value !== undefined ? formatCurrency(value, currencyCode, { showSymbol: true }) : '-'
                    }
                    labelStyle={{ fontWeight: '600', marginBottom: '4px' }}
                />
                    <Legend 
                        wrapperStyle={{ paddingTop: '10px' }}
                        iconType="circle"
                    />
                    <Line 
                        type="monotone" 
                        dataKey="income" 
                        name="Income" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                        fill="rgba(16, 185, 129, 0.1)"
                    />
                    <Line 
                        type="monotone" 
                        dataKey="expenses" 
                        name="Expenses" 
                        stroke="#ef4444" 
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                        fill="rgba(239, 68, 68, 0.1)"
                    />
                    <Line 
                        type="monotone" 
                        dataKey="balance" 
                        name="Balance" 
                        stroke="#6366f1" 
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                        fill="rgba(99, 102, 241, 0.1)"
                    />
                </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 text-sm text-gray-600">
                <p>Shows monthly income, expenses, and balance trends over time</p>
            </div>
        </div>
    )
}
