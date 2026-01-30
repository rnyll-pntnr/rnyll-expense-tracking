'use client'

import { useState, useEffect } from 'react'
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline'
import { CategoryForm } from '@/components/category-form'
import { IconRenderer } from '@/components/icon-helper'
import { getCategories, deleteCategory, type Category } from '@/app/actions/categories'
import { updateUserSettings } from '@/app/actions/settings'
import { CURRENCIES } from '@/lib/currencies'
import toast from 'react-hot-toast'

interface SettingsClientProps {
    userId: string
    userEmail: string
    currency: string
}

export function SettingsClient({ userId, userEmail, currency: initialCurrency }: SettingsClientProps) {
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'profile' | 'categories' | 'preferences'>('categories')
    const [currency, setCurrency] = useState(initialCurrency)
    const [savingCurrency, setSavingCurrency] = useState(false)

    useEffect(() => {
        loadCategories()
    }, [])

    async function loadCategories() {
        setLoading(true)
        const { data } = await getCategories()
        if (data) {
            setCategories(data)
        }
        setLoading(false)
    }

    function handleEditCategory(category: Category) {
        setEditingCategory(category)
        setIsFormOpen(true)
    }

    function handleAddCategory() {
        setEditingCategory(null)
        setIsFormOpen(true)
    }

    async function handleDeleteCategory(id: string, name: string) {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) {
            return
        }

        const result = await deleteCategory(id)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success('Category deleted')
            loadCategories()
        }
    }

    async function handleCurrencyChange(newCurrency: string) {
        setSavingCurrency(true)
        const formData = new FormData()
        formData.set('currency', newCurrency)

        const result = await updateUserSettings(formData)
        if (result.error) {
            toast.error(result.error)
        } else {
            setCurrency(newCurrency)
            toast.success('Currency updated!')
        }
        setSavingCurrency(false)
    }

    const expenseCategories = categories.filter(c => c.type === 'expense')
    const incomeCategories = categories.filter(c => c.type === 'income')

    const selectedCurrency = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0]

    return (
        <div className="p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Manage your account settings and preferences.
                    </p>
                </div>

                {/* Tabs */}
                <div className="mb-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Profile
                        </button>
                        <button
                            onClick={() => setActiveTab('preferences')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'preferences'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Preferences
                        </button>
                        <button
                            onClick={() => setActiveTab('categories')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'categories'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Categories
                        </button>
                    </nav>
                </div>

                {activeTab === 'profile' && (
                    <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
                        <div className="p-6">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">Profile Information</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Update your account profile information and email address.
                            </p>
                            <div className="mt-6">
                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                            Email address
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            id="email"
                                            value={userEmail}
                                            disabled
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 sm:text-sm px-3 py-2"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'preferences' && (
                    <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
                        <div className="p-6">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">Currency</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Set your preferred currency for displaying amounts.
                            </p>
                            <div className="mt-6">
                                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Currency
                                </label>
                                <select
                                    id="currency"
                                    name="currency"
                                    value={currency}
                                    onChange={(e) => handleCurrencyChange(e.target.value)}
                                    disabled={savingCurrency}
                                    className="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2"
                                >
                                    {CURRENCIES.map((c) => (
                                        <option key={c.code} value={c.code}>
                                            {c.symbol} {c.code} - {c.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-2 text-sm text-gray-500">
                                    Current: <span className="font-medium">{selectedCurrency.symbol} {selectedCurrency.name}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'categories' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-medium leading-6 text-gray-900">Categories</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Manage your income and expense categories.
                                </p>
                            </div>
                            <button
                                onClick={handleAddCategory}
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                            >
                                <PlusIcon className="h-5 w-5 mr-2" />
                                Add Category
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Expense Categories */}
                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden">
                                    <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-red-50 to-red-100/50">
                                        <h4 className="text-sm font-semibold text-red-800">Expense Categories</h4>
                                    </div>
                                    <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                                        {expenseCategories.length === 0 ? (
                                            <p className="p-4 text-sm text-gray-500 text-center">No expense categories yet.</p>
                                        ) : (
                                            expenseCategories.map((category) => (
                                                <div key={category.id} className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-all duration-200">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md"
                                                            style={{ backgroundColor: category.color }}
                                                        >
                                                            <IconRenderer icon={category.icon} className="h-5 w-5" />
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-900">{category.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => handleEditCategory(category)}
                                                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                                                            title="Edit category"
                                                        >
                                                            <PencilIcon className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteCategory(category.id, category.name)}
                                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                                            title="Delete category"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Income Categories */}
                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden">
                                    <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-green-50 to-green-100/50">
                                        <h4 className="text-sm font-semibold text-green-800">Income Categories</h4>
                                    </div>
                                    <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                                        {incomeCategories.length === 0 ? (
                                            <p className="p-4 text-sm text-gray-500 text-center">No income categories yet.</p>
                                        ) : (
                                            incomeCategories.map((category) => (
                                                <div key={category.id} className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-all duration-200">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md"
                                                            style={{ backgroundColor: category.color }}
                                                        >
                                                            <IconRenderer icon={category.icon} className="h-5 w-5" />
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-900">{category.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => handleEditCategory(category)}
                                                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                                                            title="Edit category"
                                                        >
                                                            <PencilIcon className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteCategory(category.id, category.name)}
                                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                                            title="Delete category"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <CategoryForm
                isOpen={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false)
                    setEditingCategory(null)
                }}
                category={editingCategory}
                onSuccess={loadCategories}
            />
        </div>
    )
}
