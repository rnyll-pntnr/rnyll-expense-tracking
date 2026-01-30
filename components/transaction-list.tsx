'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { IconRenderer } from '@/components/icon-helper'
import { deleteTransaction, type TransactionWithCategory } from '@/app/actions/transactions'
import { getUserSettings } from '@/app/actions/settings'
import { getCurrencyInfo } from '@/lib/currencies'
import toast from 'react-hot-toast'

interface TransactionListProps {
    transactions: TransactionWithCategory[]
    onEdit: (transaction: TransactionWithCategory) => void
    onUpdate: () => void
}

export function TransactionList({ transactions, onEdit, onUpdate }: TransactionListProps) {
    const [deleting, setDeleting] = useState<string | null>(null)
    const [currencySymbol, setCurrencySymbol] = useState('AED')

    useEffect(() => {
        loadCurrency()
    }, [])

    async function loadCurrency() {
        const { data } = await getUserSettings()
        if (data) {
            const currency = await getCurrencyInfo(data.currency || 'USD')
            setCurrencySymbol(currency.symbol)
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this transaction?')) {
            return
        }

        setDeleting(id)
        const result = await deleteTransaction(id)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success('Transaction deleted!')
            onUpdate()
        }
        setDeleting(null)
    }

    if (transactions.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by adding your first transaction.</p>
            </div>
        )
    }

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
                {transactions.map((transaction) => (
                    <li key={transaction.id}>
                        <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                                            style={{ backgroundColor: (transaction.category?.color || '#6b7280') + '20' }}
                                        >
                                            {transaction.category ? (
                                                <IconRenderer
                                                    icon={transaction.category.icon}
                                                    className="h-5 w-5"
                                                    style={{ color: transaction.category.color }}
                                                />
                                            ) : (
                                                <span
                                                    className="text-lg"
                                                    style={{ color: '#6b7280' }}
                                                >
                                                    {transaction.type === 'income' ? '↑' : '↓'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {transaction.description || 'No description'}
                                                </p>
                                                {transaction.category && (
                                                    <span
                                                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                                                        style={{
                                                            backgroundColor: transaction.category.color + '20',
                                                            color: transaction.category.color,
                                                        }}
                                                    >
                                                        {transaction.category.name}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                {format(new Date(transaction.date), 'MMM dd, yyyy')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p
                                            className={`text-sm font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                                                }`}
                                        >
                                            {transaction.type === 'income' ? '+' : '-'}{currencySymbol}
                                            {Number(transaction.amount).toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => onEdit(transaction)}
                                            className="p-1 rounded hover:bg-gray-200 transition-colors"
                                            title="Edit"
                                        >
                                            <PencilIcon className="h-4 w-4 text-gray-600" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(transaction.id)}
                                            disabled={deleting === transaction.id}
                                            className="p-1 rounded hover:bg-red-100 transition-colors disabled:opacity-50"
                                            title="Delete"
                                        >
                                            <TrashIcon className="h-4 w-4 text-red-600" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}
