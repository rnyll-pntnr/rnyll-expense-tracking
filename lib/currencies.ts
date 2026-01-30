// Currency options - can be used in both client and server components
export const CURRENCIES = [
    { code: 'AED', symbol: 'Dh', name: 'UAE Dirham' },
    { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
    { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
]

export function getCurrencyInfo(code: string) {
    return CURRENCIES.find(c => c.code === code) || CURRENCIES[0]
}

export function formatCurrency(amount: number, code: string = 'USD'): string {
    // Get currency info to determine locale
    const currency = getCurrencyInfo(code)

    // Map currency codes to locales for formatting
    const localeMap: Record<string, string> = {
        'AED': 'en-AE',
        'PHP': 'en-PH',
        'IDR': 'id-ID',
        'USD': 'en-US',
        'EUR': 'de-DE',
        'GBP': 'en-GB',
        'JPY': 'ja-JP',
        'SAR': 'ar-SA',
        'INR': 'en-IN',
        'CNY': 'zh-CN',
        'AUD': 'en-AU',
        'CAD': 'en-CA'
    }

    const locale = localeMap[currency.code] || 'en-US'

    try {
        return new Intl.NumberFormat(locale, {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount)
    } catch (error) {
        // Fallback to basic formatting if Intl is not available
        return amount.toFixed(2)
    }
}
