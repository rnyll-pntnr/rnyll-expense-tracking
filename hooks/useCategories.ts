'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { getCategories, seedDefaultCategories } from '@/app/actions/categories'
import type { Category, TransactionType } from '@/types'
import toast from 'react-hot-toast'

export function useCategories(type?: TransactionType, initialCategories?: Category[]) {
    const [categories, setCategories] = useState<Category[]>(initialCategories || [])
    const [loading, setLoading] = useState(!initialCategories) // Don't show loading if we have initial data
    const [error, setError] = useState<string | null>(null)

    const loadCategories = useCallback(async (categoryType?: TransactionType) => {
        try {
            setLoading(true)
            const { data, error } = await getCategories(categoryType || type)
            if (error) {
                setError(error)
                toast.error(error)
            } else {
                setCategories(data || [])
            }
        } catch (err) {
            setError('Failed to load categories')
            toast.error('Failed to load categories')
        } finally {
            setLoading(false)
        }
    }, [type])

    useEffect(() => {
        loadCategories()
    }, [loadCategories])

    const initializeCategories = useCallback(async () => {
        try {
            await seedDefaultCategories()
            await loadCategories()
        } catch (err) {
            // Ignore if categories already exist
        }
    }, [loadCategories])

    // Memoize categories by type for performance
    const memoizedCategories = useMemo(() => {
        if (!type) return categories
        return categories.filter(category => category.type === type)
    }, [categories, type])

    return {
        categories: memoizedCategories,
        loading,
        error,
        loadCategories,
        initializeCategories,
    }
}