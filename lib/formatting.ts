import { format } from 'date-fns'
import { getCurrencyInfo, formatCurrency as formatCurrencyBase } from './currencies'

/**
 * Format currency with proper localization and formatting
 */
export function formatCurrency(
  amount: number,
  currencyCode: string = 'USD',
  options: {
    minimumFractionDigits?: number
    maximumFractionDigits?: number
    showSymbol?: boolean
  } = {}
): string {
  const { 
    minimumFractionDigits = 2, 
    maximumFractionDigits = 2,
    showSymbol = false
  } = options

  const currency = getCurrencyInfo(currencyCode)
  
  const formattedAmount = formatCurrencyBase(amount, currencyCode, {
    minimumFractionDigits,
    maximumFractionDigits
  })

  return showSymbol ? `${currency.symbol}${formattedAmount}` : formattedAmount
}

/**
 * Format large numbers with abbreviations (K, M, B, etc.)
 */
export function formatLargeNumber(
  number: number,
  currencyCode: string = 'USD',
  options: {
    minimumFractionDigits?: number
    maximumFractionDigits?: number
    showSymbol?: boolean
  } = {}
): string {
  const { 
    minimumFractionDigits = 1, 
    maximumFractionDigits = 1,
    showSymbol = true
  } = options

  const currency = getCurrencyInfo(currencyCode)
  
  if (number >= 1000000000) {
    return `${showSymbol ? currency.symbol : ''}${(number / 1000000000).toFixed(maximumFractionDigits)}B`
  } else if (number >= 1000000) {
    return `${showSymbol ? currency.symbol : ''}${(number / 1000000).toFixed(maximumFractionDigits)}M`
  } else if (number >= 1000) {
    return `${showSymbol ? currency.symbol : ''}${(number / 1000).toFixed(maximumFractionDigits)}K`
  }
  
  return formatCurrency(number, currencyCode, options)
}

/**
 * Format percentage change with sign and color coding
 */
export function formatPercentageChange(change: number): {
  value: string
  isPositive: boolean
  isNegative: boolean
} {
  const isPositive = change > 0
  const isNegative = change < 0
  const value = `${isPositive ? '+' : ''}${change.toFixed(1)}%`
  
  return { value, isPositive, isNegative }
}

/**
 * Format date in readable format
 */
export function formatDate(date: Date | string, formatStr: string = 'MMM d, yyyy'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, formatStr)
}

/**
 * Get relative time string (e.g., "2 days ago")
 */
export function getRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'Just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800)
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000)
    return `${months} month${months > 1 ? 's' : ''} ago`
  } else {
    const years = Math.floor(diffInSeconds / 31536000)
    return `${years} year${years > 1 ? 's' : ''} ago`
  }
}

/**
 * Format date range for display
 */
export function formatDateRange(startDate: Date | string, endDate: Date | string): string {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate

  const startStr = format(start, 'MMM d')
  const endStr = format(end, 'MMM d, yyyy')

  if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
    return `${startStr} - ${format(end, 'd, yyyy')}`
  } else if (start.getFullYear() === end.getFullYear()) {
    return `${startStr} - ${endStr}`
  } else {
    return `${format(start, 'MMM d, yyyy')} - ${endStr}`
  }
}

/**
 * Format transaction amount with sign and color coding
 */
export function formatTransactionAmount(
  amount: number,
  currencyCode: string = 'USD',
  options: {
    showSymbol?: boolean
  } = {}
): {
  value: string
  isIncome: boolean
  isExpense: boolean
  color: string
} {
  const isIncome = amount > 0
  const isExpense = amount < 0
  const color = isIncome ? 'text-green-600' : 'text-red-600'
  const value = formatCurrency(Math.abs(amount), currencyCode, options)
  
  return {
    value: `${isIncome ? '+' : '-'}${value}`,
    isIncome,
    isExpense,
    color
  }
}

/**
 * Get category color based on expense amount
 */
export function getCategoryColor(value: number, maxValue: number): string {
  const normalized = value / maxValue
  
  if (normalized < 0.25) return '#10b981' // green
  if (normalized < 0.5) return '#f59e0b' // orange
  if (normalized < 0.75) return '#ef4444' // red
  return '#dc2626' // dark red
}
