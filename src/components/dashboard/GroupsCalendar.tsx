'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useMemo } from 'react'

export interface CalendarEvent {
    id: string
    group_id: string
    group_name: string
    date_start: string
    date_end: string
    color: string
}

interface GroupsCalendarProps {
    events: CalendarEvent[]
    onEventClick?: (groupId: string) => void
}

export function GroupsCalendar({ events, onEventClick }: GroupsCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date())

    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ]

    const weekDays = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM']

    const daysToShow = 10 // Show 10 days as in the image

    const timelineDays = useMemo(() => {
        const days = []
        const start = new Date(currentDate)
        // Adjust to start of some period or just use current
        for (let i = 0; i < daysToShow; i++) {
            const d = new Date(start)
            d.setDate(start.getDate() + i)
            days.push(d)
        }
        return days
    }, [currentDate])

    const goToPrevious = () => {
        const newDate = new Date(currentDate)
        newDate.setDate(currentDate.getDate() - 7)
        setCurrentDate(newDate)
    }

    const goToNext = () => {
        const newDate = new Date(currentDate)
        newDate.setDate(currentDate.getDate() + 7)
        setCurrentDate(newDate)
    }

    const goToToday = () => {
        setCurrentDate(new Date())
    }

    const isToday = (date: Date) => {
        const today = new Date()
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
    }

    const getDayName = (date: Date) => {
        const day = date.getDay()
        return weekDays[day === 0 ? 6 : day - 1]
    }

    // Calculate bar position and width
    const getBarStyles = (event: CalendarEvent) => {
        const start = new Date(event.date_start)
        const end = new Date(event.date_end)

        const timelineStart = timelineDays[0]
        const timelineEnd = timelineDays[timelineDays.length - 1]

        // If event is completely outside timeline
        if (end < timelineStart || start > timelineEnd) return null

        const startIndex = timelineDays.findIndex(d =>
            d.getDate() === start.getDate() &&
            d.getMonth() === start.getMonth() &&
            d.getFullYear() === start.getFullYear()
        )

        const endIndex = timelineDays.findIndex(d =>
            d.getDate() === end.getDate() &&
            d.getMonth() === end.getMonth() &&
            d.getFullYear() === end.getFullYear()
        )

        const left = startIndex === -1 ? 0 : (startIndex / daysToShow) * 100
        const right = endIndex === -1 ? 100 : ((endIndex + 1) / daysToShow) * 100
        const width = right - left

        return {
            left: `${left}%`,
            width: `${width}%`,
            backgroundColor: event.color
        }
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">Grupos em andamento</h3>
                <div className="flex items-center gap-6">
                    <span className="text-sm font-semibold text-gray-700">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </span>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={goToPrevious} className="w-8 h-8 p-0">
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={goToToday} className="text-blue-600 font-semibold text-xs hover:text-blue-700 hover:bg-transparent px-2">
                            Hoje
                        </Button>
                        <Button variant="ghost" size="sm" onClick={goToNext} className="w-8 h-8 p-0">
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="relative">
                {/* Days Header */}
                <div className="grid grid-cols-10 border-b border-gray-100 mb-4">
                    {timelineDays.map((date, i) => (
                        <div key={i} className="flex flex-col items-center pb-4">
                            <span className="text-xs font-medium text-gray-400 mb-2 uppercase">
                                {getDayName(date)}
                            </span>
                            <div className={`
                                w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold
                                ${isToday(date) ? 'bg-blue-600 text-white' : 'text-gray-900'}
                            `}>
                                {date.getDate()}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Timeline Grid Lines */}
                <div className="absolute top-0 left-0 w-full h-full grid grid-cols-10 pointer-events-none">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="border-r border-gray-50 h-full last:border-r-0" />
                    ))}
                </div>

                {/* Bars Container */}
                <div className="space-y-2 relative min-h-[150px] py-2">
                    {events.map((event) => {
                        const styles = getBarStyles(event)
                        if (!styles) return null

                        return (
                            <div
                                key={event.id}
                                className="relative h-8 group cursor-pointer"
                                onClick={() => onEventClick?.(event.group_id)}
                            >
                                <div
                                    className="absolute h-full rounded-full flex items-center px-4 transition-all hover:brightness-95"
                                    style={styles}
                                >
                                    <span className="text-white text-xs font-semibold truncate">
                                        {event.group_name}
                                    </span>
                                </div>
                            </div>
                        )
                    })}

                    {events.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-sm italic">
                            Nenhum grupo ativo neste período
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
