'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export interface Notification {
    id: string
    type: 'info' | 'warning' | 'success'
    title: string
    description: string
    user_name?: string
    user_avatar?: string | null
    time_ago: string
    link?: string
    badge?: string
}

interface NotificationItemProps {
    notification: Notification
}

export function NotificationItem({ notification }: NotificationItemProps) {
    const getBadgeColor = () => {
        switch (notification.badge?.toLowerCase()) {
            case 'guia':
                return 'bg-yellow-100 text-yellow-700'
            default:
                return 'bg-gray-100 text-gray-700'
        }
    }

    return (
        <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
            {notification.user_avatar !== undefined && (
                <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={notification.user_avatar || undefined} />
                    <AvatarFallback className="text-xs">
                        {notification.user_name?.substring(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                </Avatar>
            )}

            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                        {notification.user_name && (
                            <p className="text-xs font-semibold text-gray-900 mb-0.5">
                                {notification.user_name}
                            </p>
                        )}
                        <p className="text-xs text-gray-900">
                            {notification.title}
                        </p>
                    </div>
                    {notification.link && (
                        <Link href={notification.link}>
                            <Button size="sm" className="rounded-full w-7 h-7 p-0 flex-shrink-0">
                                <ArrowRight className="w-3 h-3" />
                            </Button>
                        </Link>
                    )}
                </div>

                <p className="text-xs text-gray-500 mb-1">
                    {notification.description}
                </p>

                <div className="flex items-center gap-2">
                    {notification.badge && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getBadgeColor()}`}>
                            {notification.badge}
                        </span>
                    )}
                    <span className="text-xs text-gray-400">
                        {notification.time_ago}
                    </span>
                </div>
            </div>
        </div>
    )
}
