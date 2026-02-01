export type Theme = 'light' | 'dark' | 'system'

export interface UserSettings {
    id?: string
    user_id?: string
    currency: string
    theme: Theme
    created_at?: string
    updated_at?: string
}

export type TransactionType = 'income' | 'expense'

export interface Transaction {
    id: string
    user_id: string
    category_id: string | null
    type: TransactionType
    amount: number
    description: string | null
    date: string
    created_at: string
    updated_at: string
}

export interface TransactionWithCategory extends Transaction {
    category: {
        id: string
        name: string
        color: string
        icon: string
    } | null
}

export interface Category {
    id: string
    user_id: string
    name: string
    type: TransactionType
    color: string
    icon: string
    created_at: string
    updated_at: string
}

export interface TransactionFilters {
    type?: TransactionType
    category_id?: string
    startDate?: string
    endDate?: string
    description?: string
    page?: number
    limit?: number
}

export interface PaginatedTransactions {
    data: TransactionWithCategory[]
    total: number
    page: number
    limit: number
    totalPages: number
}

export interface TransactionStats {
    totalIncome: number
    totalExpense: number
    balance: number
    transactionCount: number
}

export interface UserSettings {
    id?: string
    user_id?: string
    currency: string
    theme: Theme
    created_at?: string
    updated_at?: string
}

export interface CategoryExpense {
    name: string
    value: number
    color: string
}

export interface DailyExpense {
    [date: string]: number
}