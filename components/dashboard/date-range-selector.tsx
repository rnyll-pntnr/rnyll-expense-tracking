'use client'

import { useState } from 'react'
import { format } from 'date-fns'

type DateRange = '7d' | '30d' | '90d' | 'ytd' | 'custom'

interface DateRangeSelectorProps {
    selectedRange: DateRange
    onRangeChange: (range: DateRange) => void
    onCustomRange: (startDate: string, endDate: string) => void
}

export function DateRangeSelector({ 
    selectedRange, 
    onRangeChange, 
    onCustomRange 
}: DateRangeSelectorProps) {
    const [showCustomDatePicker, setShowCustomDatePicker] = useState(false)
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    const handleCustomSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (startDate && endDate) {
            onCustomRange(startDate, endDate)
            setShowCustomDatePicker(false)
        }
    }

    return (
        <div className="mb-6">
            <div className="flex flex-wrap gap-2">
                {(['7d', '30d', '90d', 'ytd'] as DateRange[]).map((range) => (
                    <button
                        key={range}
                        onClick={() => onRangeChange(range)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedRange === range
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        {range === '7d' && 'Last 7 Days'}
                        {range === '30d' && 'Last 30 Days'}
                        {range === '90d' && 'Last 90 Days'}
                        {range === 'ytd' && 'Year to Date'}
                    </button>
                ))}
                <button
                    onClick={() => setShowCustomDatePicker(!showCustomDatePicker)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedRange === 'custom'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    Custom Range
                </button>
            </div>

            {showCustomDatePicker && (
                <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4 shadow-lg">
                    <form onSubmit={handleCustomSubmit} className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date
                            </label>
                            <input
                                type="date"
                                id="startDate"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                max={endDate || format(new Date(), 'yyyy-MM-dd')}
                            />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                                End Date
                            </label>
                            <input
                                type="date"
                                id="endDate"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                min={startDate}
                                max={format(new Date(), 'yyyy-MM-dd')}
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                            >
                                Apply
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}
