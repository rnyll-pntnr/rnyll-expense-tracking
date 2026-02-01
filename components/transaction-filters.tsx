'use client'

import { useState } from 'react'
import { FunnelIcon } from '@heroicons/react/24/outline'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns'
import type { TransactionFilters, Category, TransactionType } from '@/types'

interface TransactionFiltersProps {
    filters: TransactionFilters
    categories: Category[]
    onFilterChange: (key: keyof TransactionFilters, value: string | number | undefined) => void
    onDateFilter: (range: 'today' | 'week' | 'month') => void
    onClearDateFilters: () => void
    onClearFilters: () => void
}

export function TransactionFilters({ 
    filters, 
    categories, 
    onFilterChange, 
    onDateFilter, 
    onClearDateFilters, 
    onClearFilters 
}: TransactionFiltersProps) {
    const [showFilters, setShowFilters] = useState(false)

    const hasActiveFilters = filters.type || filters.category_id || filters.startDate || filters.endDate || filters.description

    return (
        <div className="bg-white shadow rounded-lg mb-4">
            <div className="px-4 py-3 sm:px-6">
                {/* Search bar and quick filters */}
                <div className="mb-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder="Search description..."
                                    value={filters.description || ''}
                                    onChange={(e) => onFilterChange('description', e.target.value)}
                                    className="block flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <button
                                onClick={() => onDateFilter('today')}
                                className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${!filters.startDate && !filters.endDate ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                Today
                            </button>
                            <button
                                onClick={() => onDateFilter('week')}
                                className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                                    filters.startDate && filters.endDate && 
                                    filters.startDate === format(startOfWeek(new Date()), 'yyyy-MM-dd') && 
                                    filters.endDate === format(endOfWeek(new Date()), 'yyyy-MM-dd')
                                        ? 'bg-indigo-100 text-indigo-700' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                This Week
                            </button>
                            <button
                                onClick={() => onDateFilter('month')}
                                className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                                    filters.startDate && filters.endDate && 
                                    filters.startDate === format(startOfMonth(new Date()), 'yyyy-MM-dd') && 
                                    filters.endDate === format(endOfMonth(new Date()), 'yyyy-MM-dd')
                                        ? 'bg-indigo-100 text-indigo-700' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                This Month
                            </button>
                            {(filters.startDate || filters.endDate) && (
                                <button
                                    onClick={onClearDateFilters}
                                    className="px-3 py-2 text-xs sm:text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Filters button */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`inline-flex items-center px-3 py-2 border rounded-md text-xs sm:text-sm font-medium ${
                            showFilters
                                ? 'border-indigo-500 text-indigo-700 bg-indigo-50'
                                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                        }`}
                    >
                        <FunnelIcon className="h-4 w-4 mr-2" />
                        Filters
                        {hasActiveFilters && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                Active
                            </span>
                        )}
                    </button>
                </div>

                {showFilters && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Type Filter */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select
                                value={filters.type || ''}
                                onChange={(e) => onFilterChange('type', e.target.value || undefined)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
                            >
                                <option value="">All Types</option>
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                            </select>
                        </div>

                        {/* Category Filter */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                value={filters.category_id || ''}
                                onChange={(e) => onFilterChange('category_id', e.target.value || undefined)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
                            >
                                <option value="">All Categories</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Start Date Filter */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input
                                type="date"
                                value={filters.startDate || ''}
                                onChange={(e) => onFilterChange('startDate', e.target.value || undefined)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
                            />
                        </div>

                        {/* End Date Filter */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <input
                                type="date"
                                value={filters.endDate || ''}
                                onChange={(e) => onFilterChange('endDate', e.target.value || undefined)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
                            />
                        </div>
                    </div>
                )}

                {showFilters && hasActiveFilters && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                        <button
                            onClick={onClearFilters}
                            className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}