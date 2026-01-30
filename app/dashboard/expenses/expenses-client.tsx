'use client'

import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { TransactionForm } from '@/components/transaction-form'
import { TransactionList } from '@/components/transaction-list'
import { getTransactions, type TransactionWithCategory, type TransactionFilters } from '@/app/actions/transactions'
import { getCategories, type Category } from '@/app/actions/categories'
import { seedDefaultCategories } from '@/app/actions/categories'
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'

const ITEMS_PER_PAGE = 10

export default function ExpensesPageClient({ userEmail }: { userEmail?: string }) {
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingTransaction, setEditingTransaction] = useState<TransactionWithCategory | null>(null)
    const [transactions, setTransactions] = useState<TransactionWithCategory[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)

    // Filter states
    const [filters, setFilters] = useState<TransactionFilters>({
        type: undefined,
        category_id: undefined,
        startDate: undefined,
        endDate: undefined,
        description: '',
        page: 1,
        limit: ITEMS_PER_PAGE,
    })
    const [totalCount, setTotalCount] = useState(0)
    const [showFilters, setShowFilters] = useState(false)

    useEffect(() => {
        loadCategories()
        loadTransactions()
        initializeCategories()
    }, [])

    // Reload transactions when filters change
    useEffect(() => {
        loadTransactions()
    }, [filters])

    async function initializeCategories() {
        await seedDefaultCategories()
    }

    async function loadCategories() {
        const { data } = await getCategories()
        if (data) {
            setCategories(data)
        }
    }

    const loadTransactions = useCallback(async () => {
        setLoading(true)
        const result = await getTransactions(filters)
        if (result.data) {
            setTransactions(result.data)
            setTotalCount(result.total || 0)
        }
        setLoading(false)
    }, [filters])

    function handleEdit(transaction: TransactionWithCategory) {
        setEditingTransaction(transaction)
        setIsFormOpen(true)
    }

    function handleCloseForm() {
        setIsFormOpen(false)
        setEditingTransaction(null)
    }

    function handleSuccess() {
        loadTransactions()
        loadCategories()
    }

    function handleFilterChange(key: keyof TransactionFilters, value: any) {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
    }

    function clearFilters() {
        setFilters({
            type: undefined,
            category_id: undefined,
            startDate: undefined,
            endDate: undefined,
            description: '',
            page: 1,
            limit: ITEMS_PER_PAGE,
        })
    }

    function handlePageChange(newPage: number) {
        setFilters(prev => ({ ...prev, page: newPage }))
    }

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

    return (
        <DashboardLayout userEmail={userEmail}>
            <div className="p-6 lg:p-8">
                <div className="mx-auto max-w-8xl">
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
                            <p className="mt-2 text-sm text-gray-600">
                                Track and manage all your income and expenses.
                            </p>
                        </div>
                        <button
                            onClick={() => setIsFormOpen(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Add Transaction
                        </button>
                    </div>

                    {/* Filter Section */}
                    <div className="bg-white shadow rounded-lg mb-6">
                        <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search description..."
                                        value={filters.description || ''}
                                        onChange={(e) => handleFilterChange('description', e.target.value)}
                                        className="block w-64 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
                                    />
                                </div>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium ${showFilters
                                        ? 'border-indigo-500 text-indigo-700 bg-indigo-50'
                                        : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                                        }`}
                                >
                                    <FunnelIcon className="h-4 w-4 mr-2" />
                                    Filters
                                    {(filters.type || filters.category_id || filters.startDate || filters.endDate) && (
                                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                            Active
                                        </span>
                                    )}
                                </button>
                            </div>

                            {showFilters && (
                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {/* Type Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                        <select
                                            value={filters.type || ''}
                                            onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
                                        >
                                            <option value="">All Types</option>
                                            <option value="income">Income</option>
                                            <option value="expense">Expense</option>
                                        </select>
                                    </div>

                                    {/* Category Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                        <select
                                            value={filters.category_id || ''}
                                            onChange={(e) => handleFilterChange('category_id', e.target.value || undefined)}
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            value={filters.startDate || ''}
                                            onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
                                        />
                                    </div>

                                    {/* End Date Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                        <input
                                            type="date"
                                            value={filters.endDate || ''}
                                            onChange={(e) => handleFilterChange('endDate', e.target.value || undefined)}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
                                        />
                                    </div>
                                </div>
                            )}

                            {showFilters && (filters.type || filters.category_id || filters.startDate || filters.endDate || filters.description) && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={clearFilters}
                                        className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                                    >
                                        Clear all filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Results count */}
                    <div className="mb-4 text-sm text-gray-600">
                        {transactions.length > 0 ? (
                            <>
                                Showing {(filters.page! - 1) * ITEMS_PER_PAGE + 1} - {Math.min(filters.page! * ITEMS_PER_PAGE, totalCount || transactions.length)} of {totalCount || transactions.length} transactions
                                {(totalCount > ITEMS_PER_PAGE || (totalCount === 0 && transactions.length > ITEMS_PER_PAGE)) && (
                                    <span className="ml-2">
                                        (Page {filters.page} of {Math.ceil((totalCount || transactions.length) / ITEMS_PER_PAGE)})
                                    </span>
                                )}
                            </>
                        ) : (
                            <span>No transactions found</span>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : (
                        <>
                            <TransactionList
                                transactions={transactions}
                                onEdit={handleEdit}
                                onUpdate={loadTransactions}
                            />

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-6 flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => handlePageChange(filters.page! - 1)}
                                        disabled={filters.page === 1}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>

                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum: number
                                        if (totalPages <= 5) {
                                            pageNum = i + 1
                                        } else if (filters.page! <= 3) {
                                            pageNum = i + 1
                                        } else if (filters.page! >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i
                                        } else {
                                            pageNum = filters.page! - 2 + i
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`px-4 py-2 border rounded-md text-sm font-medium ${filters.page === pageNum
                                                    ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                                                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        )
                                    })}

                                    <button
                                        onClick={() => handlePageChange(filters.page! + 1)}
                                        disabled={filters.page === totalPages}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <TransactionForm
                isOpen={isFormOpen}
                onClose={handleCloseForm}
                transaction={editingTransaction}
                onSuccess={handleSuccess}
            />
        </DashboardLayout>
    )
}
