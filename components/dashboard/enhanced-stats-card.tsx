import { formatCurrency, formatLargeNumber, formatPercentageChange } from '@/lib/formatting'
import { InformationCircleIcon } from '@heroicons/react/24/outline'

interface EnhancedStatsCardProps {
    title: string
    value: number
    currencySymbol: string
    currencyCode: string
    icon: React.ReactNode
    trend?: number
    trendType?: 'up' | 'down' | 'neutral'
    bgColor: string
    textColor: string
    subText?: string
    period?: string
    explanation?: string // Added for detailed metric explanation
    showSign?: boolean // Added to show positive/negative sign for balance
    metricType?: 'income' | 'expense' | 'balance' // Added to determine trend color logic
}

export function EnhancedStatsCard({
    title,
    value,
    currencySymbol,
    currencyCode,
    icon,
    trend,
    trendType = 'neutral',
    bgColor,
    textColor,
    subText,
    period,
    explanation,
    showSign = false,
    metricType = 'balance'
}: EnhancedStatsCardProps) {
    const { value: trendValue, isPositive, isNegative } = trend !== undefined
        ? formatPercentageChange(trend)
        : { value: '', isPositive: false, isNegative: false }

    // Determine trend colors based on metric type
    const getTrendColors = () => {
        if (metricType === 'income') {
            // For income: green for positive (up), red for negative (down)
            return {
                bgColor: isPositive ? 'bg-green-100' : isNegative ? 'bg-red-100' : 'bg-gray-100',
                textColor: isPositive ? 'text-green-700' : isNegative ? 'text-red-700' : 'text-gray-700',
                iconColor: isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'
            }
        } else if (metricType === 'expense') {
            // For expenses: red for positive (up), green for negative (down)
            return {
                bgColor: isPositive ? 'bg-red-100' : isNegative ? 'bg-green-100' : 'bg-gray-100',
                textColor: isPositive ? 'text-red-700' : isNegative ? 'text-green-700' : 'text-gray-700',
                iconColor: isPositive ? 'text-red-600' : isNegative ? 'text-green-600' : 'text-gray-600'
            }
        } else {
            // For balance: green for positive, red for negative
            return {
                bgColor: isPositive ? 'bg-green-100' : isNegative ? 'bg-red-100' : 'bg-gray-100',
                textColor: isPositive ? 'text-green-700' : isNegative ? 'text-red-700' : 'text-gray-700',
                iconColor: isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'
            }
        }
    }

    const trendColors = getTrendColors()

    let formattedValue = value >= 1000
        ? formatLargeNumber(value, currencyCode, { showSymbol: true })
        : formatCurrency(value, currencyCode, { showSymbol: true })

    if (showSign) {
        const sign = value >= 0 ? '+' : '-'
        formattedValue = `${sign}${formattedValue.replace(currencySymbol, '')}`
        formattedValue = currencySymbol + formattedValue
    }

    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 p-4 sm:p-6 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/60">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-500">{title}</p>
                        {period && (
                            <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                                {period}
                            </span>
                        )}
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className={`text-2xl sm:text-3xl font-bold ${textColor}`}>
                            {formattedValue}
                        </span>
                        {trend !== undefined && (
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${trendColors.bgColor} ${trendColors.textColor}`}>
                                {trendValue}
                                <span className="ml-1">
                                    {isPositive ? (
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                        </svg>
                                    ) : isNegative ? (
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                        </svg>
                                    ) : (
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    )}
                                </span>
                            </span>
                        )}
                    </div>
                    {explanation ? (
                        <p className="text-xs text-gray-500 leading-relaxed flex items-start gap-1">
                            <InformationCircleIcon className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            {explanation}
                        </p>
                    ) : subText ? (
                        <p className="text-xs text-gray-500 leading-relaxed">{subText}</p>
                    ) : null}
                </div>
                <div className={`shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${bgColor} flex items-center justify-center`}>
                    {icon}
                </div>
            </div>
        </div>
    )
}
