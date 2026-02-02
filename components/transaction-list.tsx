'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { IconRenderer } from '@/components/icon-helper'
import { deleteTransaction } from '@/app/actions/transactions'
import type { TransactionWithCategory } from '@/types'
import { useCurrency } from '@/hooks/useCurrency'
import { formatCurrency, getRelativeTime } from '@/lib/formatting'
import toast from 'react-hot-toast'

interface TransactionListProps {
    transactions: TransactionWithCategory[]
    onEdit: (transaction: TransactionWithCategory) => void
    onUpdate: () => void
    selectedIds?: string[]
    onSelectOne?: (id: string) => void
}

export function TransactionList({ transactions, onEdit, onUpdate, selectedIds = [], onSelectOne }: TransactionListProps) {
    const [deleting, setDeleting] = useState<string | null>(null)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const { currencySymbol, formatCurrency } = useCurrency()

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

    function handleToggleExpand(id: string) {
        setExpandedId(prev => prev === id ? null : id)
    }

    if (transactions.length === 0) {
        return (
            <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50">
                <div className="mx-auto h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                    <svg
                        className="h-8 w-8 text-slate-400"
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
                </div>
                <h3 className="text-lg font-medium text-gray-900">No transactions yet</h3>
                <p className="mt-2 text-sm text-gray-500">Get started by adding your first transaction.</p>
            </div>
        )
    }

    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden">
            <ul className="divide-y divide-slate-100">
                {transactions.map((transaction) => (
                    <li key={transaction.id}>
                        <div
                            className={`px-4 py-4 sm:px-6 hover:bg-slate-50/80 transition-all duration-200 ${expandedId === transaction.id ? 'bg-slate-50' : ''}`}
                        >
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    {/* Selection checkbox */}
                                    {onSelectOne && (
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(transaction.id)}
                                            onChange={() => onSelectOne(transaction.id)}
                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                    )}
                                    <div
                                        className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
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
                                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleToggleExpand(transaction.id)}>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {transaction.description || 'No description'}
                                            </p>
                                            {transaction.category && (
                                                <span
                                                    className="sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                                                    style={{
                                                        backgroundColor: transaction.category.color + '20',
                                                        color: transaction.category.color,
                                                    }}
                                                >
                                                    {transaction.category.name}
                                                </span>
                                            )}
                                        </div>
                                        <p
                                            className={`text-sm font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                                                }`}
                                        >
                                            {transaction.type === 'income' ? '+' : '-'}{currencySymbol}
                                            {formatCurrency(Number(transaction.amount))}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {getRelativeTime(transaction.date)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onEdit(transaction)}
                                            className="p-2 rounded-lg hover:bg-slate-100 transition-all duration-200"
                                            title="Edit"
                                        >
                                            <PencilIcon className="h-4 w-4 text-slate-600" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(transaction.id)}
                                            disabled={deleting === transaction.id}
                                            className="p-2 rounded-lg hover:bg-red-50 transition-all duration-200 disabled:opacity-50"
                                            title="Delete"
                                        >
                                            <TrashIcon className="h-4 w-4 text-red-500" />
                                        </button>
                                    </div>
                                </div>
                                {/* Expanded details */}
                                {expandedId === transaction.id && (
                                    <div className="mt-3 pt-3 border-t border-slate-100 text-sm">
                                        <div className="grid grid-cols-2 gap-3 text-gray-600">
                                            <div>
                                                <span className="font-medium text-gray-900">Type:</span> {transaction.type === 'income' ? 'Income' : 'Expense'}
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-900">Category:</span> {transaction.category?.name || 'Uncategorized'}
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-900">Date:</span> {format(new Date(transaction.date), 'MMMM dd, yyyy')}
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-900">Time:</span> {format(new Date(transaction.date), 'hh:mm a')}
                                            </div>
                                        </div>
                                        {transaction.description && (
                                            <div className="mt-2">
                                                <span className="font-medium text-gray-900">Notes:</span> {transaction.description}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}
