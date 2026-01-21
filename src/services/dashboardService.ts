import { UpcomingEvent } from '@/components/dashboard/UpcomingEventCard'
import { Notification } from '@/components/dashboard/NotificationItem'
import { Pendency } from '@/components/dashboard/PendencyItem'
import { CalendarEvent } from '@/components/dashboard/GroupsCalendar'

export interface DashboardStats {
    groups_in_progress: {
        count: number
        missions_count: number
    }
    pending_documents: {
        count: number
        travelers_count: number
    }
    pending_expenses: {
        count: number
        guides_count: number
    }
}

export interface DashboardData {
    stats: DashboardStats
    upcoming_events: UpcomingEvent[]
    recent_notifications: Notification[]
    pendencies: Pendency[]
    calendar_events: CalendarEvent[]
}

const API_URL = '/api/dashboard'

export const dashboardService = {
    getDashboardData: async (): Promise<DashboardData> => {
        const response = await fetch(API_URL)
        if (!response.ok) throw new Error('Failed to fetch dashboard data')
        return await response.json()
    }
}
