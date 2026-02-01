'use client'

import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { TransactionForm } from '@/components/transaction-form'
import { TransactionList } from '@/components/transaction-list'
import { TransactionFilters } from '@/components/transaction-filters'
import { SummaryCards } from '@/components/summary-cards'
import { useTransactions, useTransactionStats } from '@/hooks/useTransactions'
import { useCategories } from '@/hooks/useCategories'
import { useCurrency } from '@/hooks/useCurrency'
import { seedDefaultCategories } from '@/app/actions/categories'
import { PlusIcon } from '@heroicons/react/24/outline'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns'
import toast from 'react-hot-toast'
import type { TransactionWithCategory, TransactionFilters as TFilters } from '@/types'

const ITEMS_PER_PAGE = 10

export default function ExpensesPageClient({ userEmail }: { userEmail?: string }) {
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingTransaction, setEditingTransaction] = useState<TransactionWithCategory | null>(null)
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    // Initialize hooks
    const {
        transactions,
        loading,
        deleting,
        totalCount,
        filters,
        totalPages,
        loadTransactions,
        handleBulkDelete,
        handleFilterChange,
        handlePageChange,
        clearFilters,
    } = useTransactions({ limit: ITEMS_PER_PAGE })

    const { stats, loading: statsLoading, loadStats } = useTransactionStats()
    const { categories, loading: categoriesLoading, initializeCategories } = useCategories()
    const { currencySymbol, formatCurrency, loading: currencyLoading } = useCurrency()

    // Initialize data on mount
    useEffect(() => {
        const loadData = async () => {
            await Promise.all([
                initializeCategories(),
                loadStatsForCurrentMonth(),
            ])
        }
        loadData()
    }, [initializeCategories])

    const loadStatsForCurrentMonth = useCallback(async () => {
        const now = new Date()
        const startDate = format(startOfMonth(now), 'yyyy-MM-dd')
        const endDate = format(endOfMonth(now), 'yyyy-MM-dd')
        await loadStats({ startDate, endDate })
    }, [loadStats])

    // Handlers
    const handleEdit = (transaction: TransactionWithCategory) => {
        setEditingTransaction(transaction)
        setIsFormOpen(true)
    }

    const handleCloseForm = () => {
        setIsFormOpen(false)
        setEditingTransaction(null)
    }

    const handleSuccess = async () => {
        await Promise.all([
            loadTransactions(),
            loadStatsForCurrentMonth(),
        ])
    }

    const handleDateFilter = useCallback((range: 'today' | 'week' | 'month') => {
        const today = new Date()
        let startDate: Date
        let endDate: Date

        switch (range) {
            case 'today':
                startDate = today
                endDate = today
                break
            case 'week':
                startDate = startOfWeek(today)
                endDate = endOfWeek(today)
                break
            case 'month':
                startDate = startOfMonth(today)
                endDate = endOfMonth(today)
                break
        }

        handleFilterChange('startDate', format(startDate, 'yyyy-MM-dd'))
        handleFilterChange('endDate', format(endDate, 'yyyy-MM-dd'))
    }, [handleFilterChange])

    const handleClearDateFilters = useCallback(() => {
        handleFilterChange('startDate', undefined)
        handleFilterChange('endDate', undefined)
    }, [handleFilterChange])

    const handleSelectAll = () => {
        if (selectedIds.length === transactions.length) {
            setSelectedIds([])
        } else {
            setSelectedIds(transactions.map(t => t.id))
        }
    }

    const handleSelectOne = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(prev => prev.filter(i => i !== id))
        } else {
            setSelectedIds(prev => [...prev, id])
        }
    }

    const handleBulkDeleteWrapper = async () => {
        if (selectedIds.length === 0) return

        import('sweetalert2').then(async (Swal) => {
            const result = await Swal.default.fire({
                title: 'Are you sure?',
                text: `You are about to delete ${selectedIds.length} transactions. This action cannot be undone.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, delete them!',
                cancelButtonText: 'Cancel'
            })

            if (result.isConfirmed) {
                await handleBulkDelete(selectedIds)
                setSelectedIds([])
            }
        })
    }

    // Render
    return (
        <DashboardLayout userEmail={userEmail}>
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-8xl">
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Transactions</h1>
                            <p className="mt-2 text-sm text-gray-600">
                                Track and manage all your income and expenses.
                            </p>
                        </div>
                        <button
                            onClick={() => setIsFormOpen(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Add Transaction
                        </button>
                    </div>

                    {/* Summary Cards */}
                    <SummaryCards
                        stats={stats}
                        loading={statsLoading}
                        currencySymbol={currencySymbol}
                        formatCurrency={formatCurrency}
                    />

                    {/* Filter Section */}
                    <TransactionFilters
                        filters={filters}
                        categories={categories}
                        onFilterChange={handleFilterChange}
                        onDateFilter={handleDateFilter}
                        onClearDateFilters={handleClearDateFilters}
                        onClearFilters={clearFilters}
                    />

                    {/* Results count and bulk actions */}
                    <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="text-xs sm:text-sm text-gray-600">
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
                        <div className="flex items-center gap-2">
                            {selectedIds.length > 0 && (
                                <button
                                    onClick={handleSelectAll}
                                    className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                                >
                                    {selectedIds.length === transactions.length ? 'Deselect All' : 'Select All'}
                                </button>
                            )}
                            {selectedIds.length > 0 && (
                                <button
                                    onClick={handleBulkDeleteWrapper}
                                    disabled={deleting === 'bulk'}
                                    className="inline-flex items-center px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors"
                                >
                                    {deleting === 'bulk' ? 'Deleting...' : `Delete (${selectedIds.length})`}
                                </button>
                            )}
                        </div>
                    </div>

                    {loading ? (
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden">
                            <div className="px-4 py-4 sm:px-6">
                                <div className="animate-pulse">
                                    {[...Array(5)].map((_, index) => (
                                        <div key={index} className="flex items-center gap-3 py-3">
                                            <div className="h-12 w-12 rounded-xl bg-slate-200"></div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                                                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                                            </div>
                                            <div className="h-8 bg-slate-200 rounded w-16"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <TransactionList
                            transactions={transactions}
                            onEdit={handleEdit}
                            onUpdate={loadTransactions}
                            selectedIds={selectedIds}
                            onSelectOne={handleSelectOne}
                        />
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-4 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                            <div className="flex flex-1 justify-between sm:hidden">
                                <button
                                    onClick={() => handlePageChange(filters.page! - 1)}
                                    disabled={filters.page! <= 1}
                                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => handlePageChange(filters.page! + 1)}
                                    disabled={filters.page! >= totalPages}
                                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{(filters.page! - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-medium">{Math.min(filters.page! * ITEMS_PER_PAGE, totalCount)}</span> of <span className="font-medium">{totalCount}</span> results
                                    </p>
                                </div>
                                <div>
                                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                        <button
                                            onClick={() => handlePageChange(filters.page! - 1)}
                                            disabled={filters.page! <= 1}
                                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                        >
                                            <span className="sr-only">Previous</span>
                                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        {[...Array(totalPages)].map((_, index) => {
                                            const page = index + 1
                                            const isActive = page === filters.page
                                            const isVisible = 
                                                page === 1 || 
                                                page === totalPages || 
                                                (page >= filters.page! - 1 && page <= filters.page! + 1)

                                            if (!isVisible) {
                                                if (page === filters.page! - 2 || page === filters.page! + 2) {
                                                    return (
                                                        <span key={page} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                                                            ...
                                                        </span>
                                                    )
                                                }
                                                return null
                                            }

                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => handlePageChange(page)}
                                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus:outline-offset-0 ${
                                                        isActive 
                                                            ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                                            : 'text-gray-900 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            )
                                        })}
                                        <button
                                            onClick={() => handlePageChange(filters.page! + 1)}
                                            disabled={filters.page! >= totalPages}
                                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                        >
                                            <span className="sr-only">Next</span>
                                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <TransactionForm
                    isOpen={isFormOpen}
                    onClose={handleCloseForm}
                    transaction={editingTransaction}
                    onSuccess={handleSuccess}
                />
            </div>
        </DashboardLayout>
    )
}
