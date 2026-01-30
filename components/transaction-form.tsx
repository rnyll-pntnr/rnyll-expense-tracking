'use client'

import { Fragment, useState, useEffect, useRef, useCallback } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { addTransaction, updateTransaction, type TransactionWithCategory } from '@/app/actions/transactions'
import { getCategories, type Category } from '@/app/actions/categories'
import { getUserSettings } from '@/app/actions/settings'
import { getCurrencyInfo } from '@/lib/currencies'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { CategoryType } from '@/app/actions/categories'

interface TransactionFormProps {
    isOpen: boolean
    onClose: () => void
    transaction?: TransactionWithCategory | null
    onSuccess?: () => void
}

export function TransactionForm({ isOpen, onClose, transaction, onSuccess }: TransactionFormProps) {
    const [type, setType] = useState<'income' | 'expense'>('expense')
    const [amount, setAmount] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(false)
    const [currencySymbol, setCurrencySymbol] = useState('Dh')
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [dataLoaded, setDataLoaded] = useState(false)
    const amountInputRef = useRef<HTMLInputElement>(null)
    const formRef = useRef<HTMLFormElement>(null)

    // Load initial data when form opens
    useEffect(() => {
        if (isOpen) {
            setDataLoaded(false)
            Promise.all([loadCurrency(), loadCategories(type)]).then(() => {
                setDataLoaded(true)
                // Focus amount input after animation
                setTimeout(() => {
                    amountInputRef.current?.focus()
                    amountInputRef.current?.select()
                }, 100)
            })
        }
    }, [isOpen])

    // Set type, amount and category when transaction changes
    useEffect(() => {
        if (isOpen) {
            if (transaction) {
                setType(transaction.type)
                setAmount(transaction.amount.toString())
                setSelectedCategory(transaction.category_id || '')
            } else {
                setType('expense')
                setAmount('')
                setSelectedCategory('')
            }
        }
    }, [isOpen, transaction])

    // Load categories when type changes
    useEffect(() => {
        if (isOpen) {
            loadCategories(type)
        }
    }, [isOpen, type])

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!isOpen) return
        if (e.key === 'Escape') {
            e.preventDefault()
            onClose()
        }
    }, [isOpen, onClose])

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [handleKeyDown])

    async function loadCategories(categoryType: string) {
        const { data } = await getCategories(categoryType as CategoryType)
        if (data) {
            setCategories(data)
        }
    }

    async function loadCurrency() {
        const { data } = await getUserSettings()
        if (data) {
            const currency = getCurrencyInfo(data.currency || 'USD')
            setCurrencySymbol(currency.symbol)
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setErrors({})

        const formData = new FormData(e.currentTarget)
        formData.set('type', type)

        // Validate
        const newErrors: Record<string, string> = {}
        const amountValue = formData.get('amount')
        if (!amountValue || isNaN(Number(amountValue)) || Number(amountValue) <= 0) {
            newErrors.amount = 'Please enter a valid amount'
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            setLoading(false)
            return
        }

        try {
            let result
            if (transaction) {
                result = await updateTransaction(transaction.id, formData)
            } else {
                result = await addTransaction(formData)
            }

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(transaction ? 'Transaction updated!' : 'Transaction added!')
                onClose()
                onSuccess?.()
            }
        } catch (error) {
            toast.error('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-2 sm:p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white/95 backdrop-blur-sm p-4 sm:p-6 text-left align-middle shadow-xl shadow-slate-200/50 border border-slate-100 transition-all">
                                {!dataLoaded ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between mb-4">
                                            <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                                {transaction ? 'Edit Transaction' : 'Add Transaction'}
                                            </Dialog.Title>
                                            <button
                                                onClick={onClose}
                                                className="rounded-md p-1 hover:bg-gray-100 transition-colors"
                                            >
                                                <XMarkIcon className="h-5 w-5 text-gray-500" />
                                            </button>
                                        </div>

                                        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                                            {/* Type Toggle */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Type
                                                </label>
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setType('expense')}
                                                        className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all duration-200 ${type === 'expense'
                                                            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-200'
                                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                            }`}
                                                    >
                                                        Expense
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setType('income')}
                                                        className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all duration-200 ${type === 'income'
                                                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-200'
                                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                            }`}
                                                    >
                                                        Income
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Amount */}
                                            <div>
                                                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Amount
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">{currencySymbol}</span>
                                                    <input
                                                        ref={amountInputRef}
                                                        type="number"
                                                        name="amount"
                                                        id="amount"
                                                        value={amount}
                                                        onChange={(e) => setAmount(e.target.value)}
                                                        step="0.01"
                                                        min="0.01"
                                                        required
                                                        className={`block w-full pl-8 pr-3 py-2.5 border rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-indigo-500/20 sm:text-sm transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed ${errors.amount ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'}`}
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                                {errors.amount && <p className="mt-1 text-sm text-red-500">{errors.amount}</p>}
                                            </div>

                                            <div>
                                                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Category
                                                </label>
                                                <select
                                                    name="category_id"
                                                    id="category_id"
                                                    value={selectedCategory}
                                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                >
                                                    <option value="">No category</option>
                                                    {categories.map((category) => (
                                                        <option key={category.id} value={category.id}>
                                                            {category.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Date */}
                                            <div>
                                                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Date
                                                </label>
                                                <input
                                                    type="date"
                                                    name="date"
                                                    id="date"
                                                    required
                                                    defaultValue={transaction?.date || format(new Date(), 'yyyy-MM-dd')}
                                                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                />
                                            </div>

                                            {/* Description */}
                                            <div>
                                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Description (Optional)
                                                </label>
                                                <textarea
                                                    name="description"
                                                    id="description"
                                                    rows={3}
                                                    defaultValue={transaction?.description || ''}
                                                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                                                    placeholder="Add notes..."
                                                />
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-3 pt-4">
                                                <button
                                                    type="button"
                                                    onClick={onClose}
                                                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="flex-1 px-4 py-2.5 border border-transparent rounded-xl shadow-lg shadow-indigo-200 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                                >
                                                    {loading ? 'Saving...' : transaction ? 'Update' : 'Add'}
                                                </button>
                                            </div>
                                        </form>
                                    </>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}


