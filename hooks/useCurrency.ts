'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { getCurrencyInfo } from '@/lib/currencies'
import { formatCurrency } from '@/lib/formatting'
import { getUserSettings } from '@/app/actions/settings'
import type { UserSettings } from '@/types'

export function useCurrency(initialCurrencyCode?: string, initialCurrencySymbol?: string) {
    const [currencySymbol, setCurrencySymbol] = useState(initialCurrencySymbol || 'Dh')
    const [currencyCode, setCurrencyCode] = useState(initialCurrencyCode || 'AED')
    const [loading, setLoading] = useState(!initialCurrencyCode) // Don't show loading if we have initial data
    const [error, setError] = useState<string | null>(null)

    const loadCurrencySettings = useCallback(async () => {
        try {
            setLoading(true)
            const { data, error } = await getUserSettings()

            if (error) {
                setError(error)
                // Fallback to default currency
                const defaultCurrency = getCurrencyInfo('AED')
                setCurrencySymbol(defaultCurrency.symbol)
                setCurrencyCode('AED')
                return
            }

            const currency = getCurrencyInfo(data?.currency || 'AED')
            setCurrencySymbol(currency.symbol)
            setCurrencyCode(data?.currency || 'AED')
        } catch (err) {
            setError('Failed to load currency settings')
            const defaultCurrency = getCurrencyInfo('AED')
            setCurrencySymbol(defaultCurrency.symbol)
            setCurrencyCode('AED')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadCurrencySettings()
    }, [loadCurrencySettings])

    const formatCurrencyWithCode = useCallback((amount: number) => {
        return formatCurrency(amount, currencyCode)
    }, [currencyCode])

    // Memoize return values for stability
    const memoizedValues = useMemo(() => ({
        currencySymbol,
        currencyCode,
        loading,
        error,
        formatCurrency: formatCurrencyWithCode,
    }), [currencySymbol, currencyCode, loading, error, formatCurrencyWithCode])

    return memoizedValues
}