'use client'

import { useState, useEffect, useRef } from 'react'
import { PlusIcon, TrashIcon, PencilIcon, UserIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import { CategoryForm } from '@/components/category-form'
import { IconRenderer } from '@/components/icon-helper'
import { getCategories, deleteCategory, type Category } from '@/app/actions/categories'
import { updateUserSettings, updateUserName, updateUserPassword } from '@/app/actions/settings'
import { CURRENCIES } from '@/lib/currencies'
import toast from 'react-hot-toast'

interface SettingsClientProps {
    userId: string
    userEmail: string
    userName: string
    currency: string
}

export function SettingsClient({ userId, userEmail, userName, currency: initialCurrency }: SettingsClientProps) {
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'profile' | 'categories' | 'preferences'>('categories')
    const [currency, setCurrency] = useState(initialCurrency)
    const [savingCurrency, setSavingCurrency] = useState(false)

    // Form refs
    const passwordFormRef = useRef<HTMLFormElement>(null)

    // Profile form states
    const [name, setName] = useState(userName)
    const [savingName, setSavingName] = useState(false)
    const [changingPassword, setChangingPassword] = useState(false)
    const [passwordLoading, setPasswordLoading] = useState(false)

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
        import('sweetalert2').then(async (Swal) => {
            const result = await Swal.default.fire({
                title: 'Are you sure?',
                text: `You are about to delete "${name}". This action cannot be undone.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'Cancel'
            })

            if (result.isConfirmed) {
                const deleteResult = await deleteCategory(id)
                if (deleteResult.error) {
                    toast.error(deleteResult.error)
                } else {
                    toast.success('Category deleted')
                    loadCategories()
                }
            }
        })
    }

    async function handleCurrencyChange(newCurrency: string) {
        setSavingCurrency(true)
        try {
            const formData = new FormData()
            formData.set('currency', newCurrency)

            const result = await updateUserSettings(formData)
            if (result.error) {
                toast.error(result.error)
            } else {
                setCurrency(newCurrency)
                toast.success('Currency updated!')
            }
        } catch (error) {
            console.error('Currency update error:', error)
            toast.error('An unexpected error occurred. Please try again.')
        } finally {
            setSavingCurrency(false)
        }
    }

    async function handleNameUpdate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setSavingName(true)

        try {
            const formData = new FormData(e.currentTarget)
            const result = await updateUserName(formData)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('Name updated successfully!')
            }
        } catch (error) {
            console.error('Name update error:', error)
            toast.error('An unexpected error occurred. Please try again.')
        } finally {
            setSavingName(false)
        }
    }

    async function handlePasswordChange(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setPasswordLoading(true)

        try {
            const formData = new FormData(e.currentTarget)
            const result = await updateUserPassword(formData)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('Password updated successfully!')
                // Use ref to reset form for reliability
                if (passwordFormRef.current) {
                    passwordFormRef.current.reset()
                }
                setChangingPassword(false)
            }
        } catch (error) {
            console.error('Password update error:', error)
            toast.error('An unexpected error occurred. Please try again.')
        } finally {
            setPasswordLoading(false)
        }
    }

    const expenseCategories = categories.filter(c => c.type === 'expense')
    const incomeCategories = categories.filter(c => c.type === 'income')

    const selectedCurrency = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0]

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-8xl">
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Manage your account settings and preferences.
                    </p>
                </div>

                {/* Tabs */}
                <div className="mb-6 border-b border-gray-200 overflow-x-auto">
                    <nav className="-mb-px flex space-x-2 sm:space-x-8 min-w-max">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-sm ${activeTab === 'profile'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Profile
                        </button>
                        <button
                            onClick={() => setActiveTab('preferences')}
                            className={`py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-sm ${activeTab === 'preferences'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Preferences
                        </button>
                        <button
                            onClick={() => setActiveTab('categories')}
                            className={`py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-sm ${activeTab === 'categories'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Categories
                        </button>
                    </nav>
                </div>

                {activeTab === 'profile' && (
                    <div className="space-y-4 sm:space-y-6">
                        {/* Profile Information Card */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 p-4 sm:p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
                                    <UserIcon className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                                    <p className="text-sm text-gray-500">Update your account details</p>
                                </div>
                            </div>

                            <form onSubmit={handleNameUpdate} className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        defaultValue={name}
                                        placeholder="Enter your name"
                                        className="block w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-all duration-200"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        value={userEmail}
                                        disabled
                                        className="block w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-slate-50 shadow-sm sm:text-sm cursor-not-allowed"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={savingName}
                                    className="px-4 py-2.5 border border-transparent rounded-xl shadow-lg shadow-indigo-200 text-sm font-semibold text-white bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                    {savingName ? 'Saving...' : 'Save Changes'}
                                </button>
                            </form>
                        </div>

                        {/* Password Change Card */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 p-4 sm:p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-red-100 to-orange-100 flex items-center justify-center">
                                    <LockClosedIcon className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                                    <p className="text-sm text-gray-500">Update your password</p>
                                </div>
                            </div>

                            {!changingPassword ? (
                                <button
                                    onClick={() => setChangingPassword(true)}
                                    className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
                                >
                                    Change Password
                                </button>
                            ) : (
                                <form
                                    ref={passwordFormRef}
                                    onSubmit={handlePasswordChange}
                                    className="space-y-4"
                                >
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            id="password"
                                            required
                                            minLength={6}
                                            className="block w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-all duration-200"
                                            placeholder="Enter new password"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            id="confirmPassword"
                                            required
                                            minLength={6}
                                            className="block w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-all duration-200"
                                            placeholder="Confirm new password"
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setChangingPassword(false)}
                                            className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={passwordLoading}
                                            className="px-4 py-2.5 border border-transparent rounded-xl shadow-lg shadow-red-200 text-sm font-semibold text-white bg-linear-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                        >
                                            {passwordLoading ? 'Updating...' : 'Update Password'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'preferences' && (
                    <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
                        <div className="p-4 sm:p-6">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">Currency</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Set your preferred currency for displaying amounts.
                            </p>
                            <div className="mt-4 sm:mt-6">
                                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Currency
                                </label>
                                <select
                                    id="currency"
                                    name="currency"
                                    value={currency}
                                    onChange={(e) => handleCurrencyChange(e.target.value)}
                                    disabled={savingCurrency}
                                    className="block w-full sm:max-w-xs rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2"
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
                    <div className="space-y-4 sm:space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-medium leading-6 text-gray-900">Categories</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Manage your income and expense categories.
                                </p>
                            </div>
                            <button
                                onClick={handleAddCategory}
                                className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
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
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                                {/* Expense Categories */}
                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden">
                                    <div className="p-3 sm:p-4 border-b border-slate-100 bg-linear-to-r from-red-50 to-red-100/50">
                                        <h4 className="text-sm font-semibold text-red-800">Expense Categories</h4>
                                    </div>
                                    <div className="divide-y divide-slate-100 max-h-80 sm:max-h-96 overflow-y-auto">
                                        {expenseCategories.length === 0 ? (
                                            <p className="p-4 text-sm text-gray-500 text-center">No expense categories yet.</p>
                                        ) : (
                                            expenseCategories.map((category) => (
                                                <div key={category.id} className="p-3 sm:p-4 flex items-center justify-between hover:bg-slate-50/80 transition-all duration-200">
                                                    <div className="flex items-center gap-2 sm:gap-3">
                                                        <div
                                                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white shadow-md shrink-0"
                                                            style={{ backgroundColor: category.color }}
                                                        >
                                                            <IconRenderer icon={category.icon} className="h-4 w-4 sm:h-5 sm:w-5" />
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-900 truncate">{category.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => handleEditCategory(category)}
                                                            className="p-1.5 sm:p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                                                            title="Edit category"
                                                        >
                                                            <PencilIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteCategory(category.id, category.name)}
                                                            className="p-1.5 sm:p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                                            title="Delete category"
                                                        >
                                                            <TrashIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Income Categories */}
                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden">
                                    <div className="p-3 sm:p-4 border-b border-slate-100 bg-linear-to-r from-green-50 to-green-100/50">
                                        <h4 className="text-sm font-semibold text-green-800">Income Categories</h4>
                                    </div>
                                    <div className="divide-y divide-slate-100 max-h-80 sm:max-h-96 overflow-y-auto">
                                        {incomeCategories.length === 0 ? (
                                            <p className="p-4 text-sm text-gray-500 text-center">No income categories yet.</p>
                                        ) : (
                                            incomeCategories.map((category) => (
                                                <div key={category.id} className="p-3 sm:p-4 flex items-center justify-between hover:bg-slate-50/80 transition-all duration-200">
                                                    <div className="flex items-center gap-2 sm:gap-3">
                                                        <div
                                                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white shadow-md shrink-0"
                                                            style={{ backgroundColor: category.color }}
                                                        >
                                                            <IconRenderer icon={category.icon} className="h-4 w-4 sm:h-5 sm:w-5" />
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-900 truncate">{category.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => handleEditCategory(category)}
                                                            className="p-1.5 sm:p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                                                            title="Edit category"
                                                        >
                                                            <PencilIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteCategory(category.id, category.name)}
                                                            className="p-1.5 sm:p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                                            title="Delete category"
                                                        >
                                                            <TrashIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
