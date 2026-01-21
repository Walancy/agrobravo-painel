'use client'

import { AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export interface Pendency {
    id: string
    type: 'error' | 'warning' | 'info'
    title: string
    description: string
    link?: string
    user_name?: string
    user_avatar?: string | null
}

interface PendencyItemProps {
    pendency: Pendency
}

export function PendencyItem({ pendency }: PendencyItemProps) {
    const getIcon = () => {
        switch (pendency.type) {
            case 'error':
                return <AlertCircle className="w-4 h-4 text-red-600" />
            case 'warning':
                return <AlertTriangle className="w-4 h-4 text-yellow-600" />
            case 'info':
                return <Info className="w-4 h-4 text-blue-600" />
        }
    }

    const getIconBgColor = () => {
        switch (pendency.type) {
            case 'error':
                return 'bg-red-50'
            case 'warning':
                return 'bg-yellow-50'
            case 'info':
                return 'bg-blue-50'
        }
    }

    return (
        <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getIconBgColor()}`}>
                {getIcon()}
            </div>

            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                    {pendency.title}
                </h4>
                <p className="text-xs text-gray-600 mb-2">
                    {pendency.description}
                </p>
                {pendency.user_name && (
                    <p className="text-xs text-gray-500">
                        {pendency.user_name}
                    </p>
                )}
            </div>

            {pendency.link && (
                <Link href={pendency.link}>
                    <Button size="sm" className="rounded-full w-7 h-7 p-0 flex-shrink-0">
                        <AlertCircle className="w-3 h-3" />
                    </Button>
                </Link>
            )}
        </div>
    )
}
