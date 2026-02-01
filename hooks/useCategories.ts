'use client'

import { useState, useCallback, useEffect } from 'react'
import { getCategories, seedDefaultCategories } from '@/app/actions/categories'
import type { Category, TransactionType } from '@/types'
import toast from 'react-hot-toast'

export function useCategories(type?: TransactionType) {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
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

    return {
        categories,
        loading,
        error,
        loadCategories,
        initializeCategories,
    }
}