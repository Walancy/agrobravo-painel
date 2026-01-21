'use client'

import { LucideIcon } from 'lucide-react'
import Link from 'next/link'

interface StatCardProps {
    icon: LucideIcon
    title: string
    count: number
    subtitle: string
    href?: string
    iconColor?: string
}

export function StatCard({
    icon: Icon,
    title,
    count,
    subtitle,
    href,
    iconColor = 'text-blue-600'
}: StatCardProps) {
    const CardContent = (
        <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
                <div className={`p-2 rounded-lg bg-gray-50 ${iconColor}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-600">{title}</h3>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-semibold text-gray-900">{count}</span>
                    <span className="text-sm text-gray-500">{subtitle}</span>
                </div>
            </div>
        </div>
    )

    if (href) {
        return (
            <Link href={href}>
                {CardContent}
            </Link>
        )
    }

    return CardContent
}
