'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { getTransactions, deleteTransaction, getTransactionStats } from '@/app/actions/transactions'
import type { TransactionWithCategory, TransactionFilters, TransactionStats } from '@/types'
import toast from 'react-hot-toast'

const DEFAULT_PAGE_SIZE = 10

export function useTransactions({
    initialData = [],
    initialTotalCount = 0,
    ...initialFilters
}: {
    initialData?: TransactionWithCategory[]
    initialTotalCount?: number
} & TransactionFilters = {}) {
    const [transactions, setTransactions] = useState<TransactionWithCategory[]>(initialData)
    const [loading, setLoading] = useState(initialData.length === 0) // Don't show loading if we have initial data
    const [deleting, setDeleting] = useState<string | null>(null)
    const [totalCount, setTotalCount] = useState(initialTotalCount)
    const [filters, setFilters] = useState<TransactionFilters>({
        ...initialFilters,
        page: initialFilters.page || 1,
        limit: initialFilters.limit || DEFAULT_PAGE_SIZE,
    })

    const loadTransactions = useCallback(async () => {
        setLoading(true)
        try {
            const result = await getTransactions(filters)
            if (result.data) {
                setTransactions(result.data)
                setTotalCount(result.total || 0)
            }
            if (result.error) {
                toast.error(result.error)
            }
        } catch (error) {
            toast.error('Failed to load transactions')
        } finally {
            setLoading(false)
        }
    }, [filters])

    useEffect(() => {
        loadTransactions()
    }, [loadTransactions])

    const handleDelete = useCallback(async (id: string) => {
        setDeleting(id)
        try {
            const result = await deleteTransaction(id)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('Transaction deleted!')
                await loadTransactions()
            }
        } catch (error) {
            toast.error('Failed to delete transaction')
        } finally {
            setDeleting(id)
        }
    }, [loadTransactions])

    const handleBulkDelete = useCallback(async (ids: string[]) => {
        if (ids.length === 0) return

        setDeleting('bulk')
        try {
            const deletePromises = ids.map(id => deleteTransaction(id))
            const results = await Promise.all(deletePromises)

            const errors = results.filter(r => r.error)
            if (errors.length > 0) {
                toast.error(`Failed to delete ${errors.length} transactions`)
            } else {
                toast.success(`Deleted ${ids.length} transactions`)
            }

            await loadTransactions()
        } catch (error) {
            toast.error('Failed to delete transactions')
        } finally {
            setDeleting(null)
        }
    }, [loadTransactions])

    const handleFilterChange = useCallback((key: keyof TransactionFilters, value: string | number | undefined) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
    }, [])

    const handlePageChange = useCallback((newPage: number) => {
        setFilters(prev => ({ ...prev, page: newPage }))
    }, [])

    const clearFilters = useCallback(() => {
        setFilters({
            type: undefined,
            category_id: undefined,
            startDate: undefined,
            endDate: undefined,
            description: '',
            page: 1,
            limit: DEFAULT_PAGE_SIZE,
        })
    }, [])

    const totalPages = Math.ceil(totalCount / (filters.limit || DEFAULT_PAGE_SIZE))

    return {
        transactions,
        loading,
        deleting,
        totalCount,
        filters,
        totalPages,
        loadTransactions,
        handleDelete,
        handleBulkDelete,
        handleFilterChange,
        handlePageChange,
        clearFilters,
    }
}

export function useTransactionStats(initialStats?: TransactionStats & { overallBalance?: number }) {
    const [stats, setStats] = useState<TransactionStats & { overallBalance?: number }>(initialStats || {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        transactionCount: 0,
    })
    const [loading, setLoading] = useState(!initialStats) // Don't show loading if we have initial data
    const [error, setError] = useState<string | null>(null)

    const loadStats = useCallback(async (dateRange?: { startDate?: string; endDate?: string }, options?: { includeOverallBalance?: boolean }) => {
        setLoading(true)
        try {
            const result = await getTransactionStats(dateRange, options)
            if (result.data) {
                setStats(result.data)
            }
            if (result.error) {
                setError(result.error)
                toast.error(result.error)
            }
        } catch (err) {
            setError('Failed to load statistics')
            toast.error('Failed to load statistics')
        } finally {
            setLoading(false)
        }
    }, [])

    return {
        stats,
        loading,
        error,
        loadStats,
    }
}