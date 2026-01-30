// Currency options - can be used in both client and server components
export const CURRENCIES = [
    { code: 'AED', symbol: 'AED', name: 'UAE Dirham' },
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
