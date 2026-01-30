'use client'

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

interface IconRendererProps {
    icon: string
    className?: string
    style?: React.CSSProperties
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    'utensils': CurrencyDollarIcon,
    'car': TruckIcon,
    'shopping-bag': ShoppingBagIcon,
    'file-text': DocumentTextIcon,
    'film': FilmIcon,
    'heart': HeartIcon,
    'book': BookOpenIcon,
    'tag': TagIcon,
    'gift': GiftIcon,
    'briefcase': BriefcaseIcon,
    'code': CodeBracketIcon,
    'trending-up': ArrowUpIcon,
}

export function IconRenderer({ icon, className, style }: IconRendererProps) {
    const IconComponent = iconMap[icon]
    if (!IconComponent) {
        return (
            <div className={className} style={style}>
                <TagIcon className={className} />
            </div>
        )
    }
    return (
        <div className={className} style={style}>
            <IconComponent className={className} />
        </div>
    )
}
