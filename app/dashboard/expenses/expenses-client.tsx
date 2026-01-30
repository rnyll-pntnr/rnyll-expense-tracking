'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { TransactionForm } from '@/components/transaction-form'
import { TransactionList } from '@/components/transaction-list'
import { getTransactions, type TransactionWithCategory, type TransactionFilters, deleteTransaction } from '@/app/actions/transactions'
import { getCategories, type Category } from '@/app/actions/categories'
import { seedDefaultCategories } from '@/app/actions/categories'
import { getUserSettings } from '@/app/actions/settings'
import { getCurrencyInfo, formatCurrency } from '@/lib/currencies'
import { PlusIcon, FunnelIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, BanknotesIcon } from '@heroicons/react/24/outline'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subDays, isWithinInterval } from 'date-fns'
import toast from 'react-hot-toast'

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
    const [currencySymbol, setCurrencySymbol] = useState('Dh')
    const [currencyCode, setCurrencyCode] = useState('AED')
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        loadCategories()
        loadTransactions()
        initializeCategories()
        loadCurrencySettings()
    }, [])

    // Reload transactions when filters change
    useEffect(() => {
        loadTransactions()
    }, [filters])

    async function initializeCategories() {
        await seedDefaultCategories()
    }

    async function loadCurrencySettings() {
        const { data } = await getUserSettings()
        if (data) {
            const currency = await getCurrencyInfo(data.currency || 'USD')
            setCurrencySymbol(currency.symbol)
            setCurrencyCode(data.currency || 'USD')
        }
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

    function handleDateFilter(range: 'today' | 'week' | 'month') {
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

        setFilters(prev => ({
            ...prev,
            startDate: format(startDate, 'yyyy-MM-dd'),
            endDate: format(endDate, 'yyyy-MM-dd'),
            page: 1
        }))
    }

    function clearDateFilters() {
        setFilters(prev => ({
            ...prev,
            startDate: undefined,
            endDate: undefined,
            page: 1
        }))
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
        setSelectedIds([])
    }

    function handlePageChange(newPage: number) {
        setFilters(prev => ({ ...prev, page: newPage }))
    }

    function handleSelectAll() {
        if (selectedIds.length === transactions.length) {
            setSelectedIds([])
        } else {
            setSelectedIds(transactions.map(t => t.id))
        }
    }

    function handleSelectOne(id: string) {
        if (selectedIds.includes(id)) {
            setSelectedIds(prev => prev.filter(i => i !== id))
        } else {
            setSelectedIds(prev => [...prev, id])
        }
    }

    async function handleBulkDelete() {
        if (selectedIds.length === 0) return
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} transactions?`)) {
            return
        }

        setDeleting(true)
        let deleted = 0
        let errors = 0

        for (const id of selectedIds) {
            const result = await deleteTransaction(id)
            if (result.error) {
                errors++
            } else {
                deleted++
            }
        }

        if (errors > 0) {
            toast.error(`Failed to delete ${errors} transactions`)
        } else {
            toast.success(`Deleted ${deleted} transactions`)
        }

        setSelectedIds([])
        setDeleting(false)
        loadTransactions()
    }

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

    // Calculate summary
    const summary = useMemo(() => {
        const income = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0)
        const expense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0)
        return { income, expense, balance: income - expense }
    }, [transactions])

    return (
        <DashboardLayout userEmail={userEmail}>
            <div className="p-6 lg:p-8">
                <div className="mx-auto max-w-8xl">
                    <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500 rounded-lg">
                                    <ArrowTrendingUpIcon className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-green-700 font-medium">Income</p>
                                    <p className="text-xl font-bold text-green-800">
                                        {currencySymbol}{formatCurrency(summary.income, currencyCode)}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-500 rounded-lg">
                                    <ArrowTrendingDownIcon className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-red-700 font-medium">Expenses</p>
                                    <p className="text-xl font-bold text-red-800">
                                        {currencySymbol}{formatCurrency(summary.expense, currencyCode)}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className={`bg-gradient-to-br rounded-xl p-4 border ${summary.balance >= 0 ? 'from-indigo-50 to-indigo-100 border-indigo-200' : 'from-orange-50 to-orange-100 border-orange-200'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${summary.balance >= 0 ? 'bg-indigo-500' : 'bg-orange-500'}`}>
                                    <BanknotesIcon className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className={`text-sm font-medium ${summary.balance >= 0 ? 'text-indigo-700' : 'text-orange-700'}`}>Balance</p>
                                    <p className={`text-xl font-bold ${summary.balance >= 0 ? 'text-indigo-800' : 'text-orange-800'}`}>
                                        {summary.balance >= 0 ? '+' : '-'}{currencySymbol}{formatCurrency(Math.abs(summary.balance), currencyCode)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filter Section */}
                    <div className="bg-white shadow rounded-lg mb-6">
                        <div className="px-4 py-4 sm:px-6">
                            {/* Search bar and quick filters */}
                            <div className="mb-4">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                placeholder="Search description..."
                                                value={filters.description || ''}
                                                onChange={(e) => handleFilterChange('description', e.target.value)}
                                                className="block flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleDateFilter('today')}
                                            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${!filters.startDate && !filters.endDate ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                        >
                                            Today
                                        </button>
                                        <button
                                            onClick={() => handleDateFilter('week')}
                                            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${filters.startDate && isWithinInterval(new Date(), { start: new Date(filters.startDate), end: new Date(filters.endDate!) }) && filters.startDate === format(startOfWeek(new Date()), 'yyyy-MM-dd') ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                        >
                                            This Week
                                        </button>
                                        <button
                                            onClick={() => handleDateFilter('month')}
                                            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${filters.startDate && filters.startDate === format(startOfMonth(new Date()), 'yyyy-MM-dd') ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                        >
                                            This Month
                                        </button>
                                        {(filters.startDate || filters.endDate) && (
                                            <button
                                                onClick={clearDateFilters}
                                                className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
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

                    {/* Results count and bulk actions */}
                    <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="text-sm text-gray-600">
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
                                    className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                                >
                                    {selectedIds.length === transactions.length ? 'Deselect All' : 'Select All'}
                                </button>
                            )}
                            {selectedIds.length > 0 && (
                                <button
                                    onClick={handleBulkDelete}
                                    disabled={deleting}
                                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors"
                                >
                                    {deleting ? 'Deleting...' : `Delete (${selectedIds.length})`}
                                </button>
                            )}
                        </div>
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
                                selectedIds={selectedIds}
                                onSelectOne={handleSelectOne}
                            />

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-6 flex items-center justify-center gap-1 sm:gap-2">
                                    <button
                                        onClick={() => handlePageChange(filters.page! - 1)}
                                        disabled={filters.page === 1}
                                        className="px-3 sm:px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Prev
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
                                                className={`px-3 sm:px-4 py-2 border rounded-md text-sm font-medium ${filters.page === pageNum
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
                                        className="px-3 sm:px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
