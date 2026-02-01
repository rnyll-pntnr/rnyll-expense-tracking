'use client'

import { useState, useEffect } from 'react'
import { getCurrencyInfo, formatCurrency as formatCurrencyUtil } from '@/lib/currencies'
import { getUserSettings } from '@/app/actions/settings'
import type { UserSettings } from '@/types'

export function useCurrency() {
    const [currencySymbol, setCurrencySymbol] = useState('Dh')
    const [currencyCode, setCurrencyCode] = useState('AED')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const loadCurrencySettings = async () => {
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
        }

        loadCurrencySettings()
    }, [])

    const formatCurrency = (amount: number) => {
        return formatCurrencyUtil(amount, currencyCode)
    }

    return {
        currencySymbol,
        currencyCode,
        loading,
        error,
        formatCurrency,
    }
}