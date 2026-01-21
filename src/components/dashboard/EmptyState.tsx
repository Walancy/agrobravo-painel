'use client'

import { AlertTriangle, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
    title: string
    description: string
    actionLabel?: string
    onAction?: () => void
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-500 text-center mb-6 max-w-sm">{description}</p>
            {actionLabel && onAction && (
                <Button onClick={onAction} className="gap-2">
                    <Plus className="w-4 h-4" />
                    {actionLabel}
                </Button>
            )}
        </div>
    )
}
