'use client'

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import {
    TruckIcon,
    ShoppingBagIcon,
    DocumentTextIcon,
    FilmIcon,
    HeartIcon,
    BookOpenIcon,
    TagIcon,
    GiftIcon,
    BriefcaseIcon,
    CodeBracketIcon,
    ArrowUpIcon,
    CurrencyDollarIcon
} from '@heroicons/react/24/solid'
import { IconRenderer } from '@/components/icon-helper'
import { addCategory, type Category, CategoryType } from '@/app/actions/categories'
import toast from 'react-hot-toast'

interface CategoryFormProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
}

const COLORS = [
    '#ef4444', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4',
    '#10b981', '#3b82f6', '#6366f1', '#6b7280', '#000000'
]

const ICONS = [
    { name: 'utensils', Icon: CurrencyDollarIcon },
    { name: 'car', Icon: TruckIcon },
    { name: 'shopping-bag', Icon: ShoppingBagIcon },
    { name: 'file-text', Icon: DocumentTextIcon },
    { name: 'film', Icon: FilmIcon },
    { name: 'heart', Icon: HeartIcon },
    { name: 'book', Icon: BookOpenIcon },
    { name: 'tag', Icon: TagIcon },
    { name: 'gift', Icon: GiftIcon },
    { name: 'briefcase', Icon: BriefcaseIcon },
    { name: 'code', Icon: CodeBracketIcon },
    { name: 'trending-up', Icon: ArrowUpIcon },
]

export function CategoryForm({ isOpen, onClose, onSuccess }: CategoryFormProps) {
    const [type, setType] = useState<CategoryType>('expense')
    const [name, setName] = useState('')
    const [color, setColor] = useState(COLORS[0])
    const [icon, setIcon] = useState(ICONS[0].name)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData()
        formData.set('name', name)
        formData.set('type', type)
        formData.set('color', color)
        formData.set('icon', icon)

        try {
            const result = await addCategory(formData)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('Category added!')
                onClose()
                resetForm()
                onSuccess?.()
            }
        } catch (error) {
            toast.error('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    function resetForm() {
        setName('')
        setType('expense')
        setColor(COLORS[0])
        setIcon(ICONS[0].name)
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
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white/95 backdrop-blur-sm p-6 text-left align-middle shadow-xl shadow-slate-200/50 border border-slate-100 transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                        Add Category
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="rounded-md p-1 hover:bg-gray-100 transition-colors"
                                    >
                                        <XMarkIcon className="h-5 w-5 text-gray-500" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
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

                                    {/* Name */}
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                            Category Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="block w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            placeholder="e.g., Groceries"
                                        />
                                    </div>

                                    {/* Color */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Color
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {COLORS.map((c) => (
                                                <button
                                                    key={c}
                                                    type="button"
                                                    onClick={() => setColor(c)}
                                                    className={`w-8 h-8 rounded-full border-2 transition-colors ${color === c ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                                                    style={{ backgroundColor: c }}
                                                />
                                            ))}
                                        </div>
                                        <input type="hidden" name="color" value={color} />
                                    </div>

                                    {/* Icon */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Icon
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {ICONS.map(({ name, Icon }) => (
                                                <button
                                                    key={name}
                                                    type="button"
                                                    onClick={() => setIcon(name)}
                                                    className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-white transition-colors ${icon === name ? 'border-gray-900' : 'border-transparent'}`}
                                                    style={{ backgroundColor: color }}
                                                >
                                                    <Icon className="h-5 w-5" />
                                                </button>
                                            ))}
                                        </div>
                                        <input type="hidden" name="icon" value={icon} />
                                    </div>

                                    {/* Preview */}
                                    <div className="pt-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Preview
                                        </label>
                                        <div className="flex items-center gap-3 p-4 bg-slate-50/80 backdrop-blur-sm rounded-xl border border-slate-100">
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
                                                style={{ backgroundColor: color }}
                                            >
                                                <IconRenderer icon={icon} className="h-5 w-5" />
                                            </div>
                                            <span className="text-gray-900 font-semibold text-base">{name || 'Category name'}</span>
                                            <span className={`text-xs px-2.5 py-1 rounded-full ml-auto font-medium ${type === 'expense' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                {type}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                resetForm()
                                                onClose()
                                            }}
                                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading || !name.trim()}
                                            className="flex-1 px-4 py-2.5 border border-transparent rounded-xl shadow-lg shadow-indigo-200 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                        >
                                            {loading ? 'Adding...' : 'Add Category'}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
