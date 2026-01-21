import * as React from "react"
import { DayItinerary, Event } from "@/types/itinerary"
import { cn } from "@/lib/utils"
import { parse, format, getDay, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Plus, Clock, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ItineraryCalendarViewProps {
    itinerary: DayItinerary[]
    startDate?: string
    endDate?: string
    onAddEvent: (event: React.MouseEvent<HTMLButtonElement>, index: number) => void
    onEditEvent: (dayIndex: number, eventId: string) => void
}

export function ItineraryCalendarView({
    itinerary,
    startDate,
    endDate,
    onAddEvent,
    onEditEvent
}: ItineraryCalendarViewProps) {

    // Normalize dates to ensure we have a valid range
    const sortedItinerary = [...itinerary].sort((a, b) => { // defensive copy
        const dateA = parse(a.date, 'dd/MM/yyyy', new Date())
        const dateB = parse(b.date, 'dd/MM/yyyy', new Date())
        return dateA.getTime() - dateB.getTime()
    })

    const days = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']

    return (
        <div className="flex flex-col h-full bg-white rounded-xl overflow-hidden">
            {/* Calendar Header Days - now inside the white card */}
            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                {days.map((day) => (
                    <div key={day} className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid - cells with flexible height */}
            <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-gray-200 gap-px overflow-y-auto">
                {renderCalendarCells(sortedItinerary, onAddEvent, onEditEvent)}
            </div>
        </div>
    )
}

function renderCalendarCells(
    itinerary: DayItinerary[],
    onAddEvent: (event: React.MouseEvent<HTMLButtonElement>, index: number) => void,
    onEditEvent: (dayIndex: number, eventId: string) => void
) {
    if (itinerary.length === 0) return null;

    // We assume itinerary is contiguous for now, or we find the full range.
    // However, the itinerary array might only contain days with activity or based on trip duration.
    // Let's assume the itinerary array covers the trip duration.

    // Find the starting weekday of the first day
    const firstDay = itinerary[0]
    // Assuming date format is dd/MM/yyyy based on typical PT-BR usage in the codebase
    const firstDate = parse(firstDay.date, 'dd/MM/yyyy', new Date())
    const startDayIndex = getDay(firstDate) // 0 for Sunday

    const cells = []

    // Padding for empty days before start
    for (let i = 0; i < startDayIndex; i++) {
        cells.push(
            <div key={`empty-start-${i}`} className="bg-gray-50 min-h-[120px]" />
        )
    }

    // Render actual days
    itinerary.forEach((day, index) => {
        const hasConflict = day.events.some(e => e.isDelayed)

        cells.push(
            <div key={day.date} className="bg-white min-h-[120px] p-2 flex flex-col group hover:bg-gray-50 transition-colors relative border-r border-b border-gray-100 overflow-hidden">
                <div className="flex justify-between items-start mb-2 flex-shrink-0">
                    <span className={cn(
                        "text-sm font-semibold",
                        day.isToday ? "bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center" : "text-gray-900"
                    )}>
                        {day.date.split('/')[0]}
                    </span>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity -mt-1 -mr-1"
                        onClick={(e) => onAddEvent(e, index)}
                    >
                        <Plus className="h-3 w-3 text-gray-500" />
                    </Button>
                </div>

                <div className="flex flex-col gap-0.5 overflow-y-auto flex-1 min-h-0 pr-0.5 custom-scrollbar">
                    {day.events.map(event => (
                        <div
                            key={event.id}
                            onClick={() => onEditEvent(index, event.id)}
                            className={cn(
                                "group/event flex items-start gap-1.5 px-1 py-0.5 rounded cursor-pointer transition-colors flex-shrink-0 animate-in fade-in slide-in-from-left-1 duration-200",
                                event.type === 'return'
                                    ? "hover:bg-blue-100 bg-blue-50/50"
                                    : "hover:bg-gray-100"
                            )}
                            title={`${event.time} - ${event.title}${event.subtitle ? ` (${event.subtitle})` : ''}`}
                        >
                            <div className={cn(
                                "w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0",
                                getEventDotColor(event)
                            )} />
                            <div className="flex-1 min-w-0">
                                <div className="text-xs text-gray-900 truncate">
                                    <span className="font-medium">{event.time}</span>
                                    <span className="ml-1">{event.title}</span>
                                </div>
                            </div>
                            {event.status === 'quoting' && <Clock className="w-3 h-3 text-orange-500 flex-shrink-0 mt-0.5" />}
                        </div>
                    ))}
                </div>
            </div>
        )
    })

    // Padding for end? Not strictly necessary for simple grid unless we want full rows.
    // Let's leave it open ended.

    return cells
}

function getEventDotColor(event: Event): string {
    switch (event.type) {
        case 'flight': return "bg-blue-600"
        case 'hotel': return "bg-sky-600"
        case 'visit': return "bg-indigo-600"
        case 'food': return "bg-blue-500"
        case 'transfer': return "bg-sky-500"
        case 'leisure': return "bg-indigo-500"
        case 'return': return "bg-blue-600"
        default: return "bg-slate-500"
    }
}
