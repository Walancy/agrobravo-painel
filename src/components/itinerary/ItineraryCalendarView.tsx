import * as React from "react"
import { DayItinerary, Event } from "@/types/itinerary"
import { cn } from "@/lib/utils"
import { parse, getDay } from "date-fns"
import { Plus, Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatTime, hasTripConflicts } from "@/lib/itineraryUtils"

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
        <div className="flex flex-col h-full bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            {/* Calendar Header Days */}
            <div className="grid grid-cols-7 border-b border-gray-200 bg-white">
                {days.map((day) => (
                    <div key={day} className="py-2 text-center text-[11px] font-medium text-gray-500 uppercase">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 flex-1 auto-rows-fr divide-x divide-gray-200 bg-gray-50">
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

    // Find the starting weekday of the first day
    const firstDay = itinerary[0]
    // Assuming date format is dd/MM/yyyy based on typical PT-BR usage in the codebase
    const firstDate = parse(firstDay.date, 'dd/MM/yyyy', new Date())
    const startDayIndex = getDay(firstDate) // 0 for Sunday

    const cells = []

    // Padding for empty days before start
    for (let i = 0; i < startDayIndex; i++) {
        cells.push(
            <div key={`empty-start-${i}`} className="bg-white/50 min-h-[100px] border-b border-gray-200" />
        )
    }

    // Render actual days
    itinerary.forEach((day, index) => {
        // Simple heuristic for conflict: if any event is delayed or explicitly marked
        const hasDelay = day.events.some(e => e.isDelayed)

        cells.push(
            <div key={day.date} className="bg-white min-h-[100px] flex flex-col group relative border-b border-gray-200 hover:bg-gray-50 transition-colors">
                {/* Date Header */}
                <div className="flex justify-between items-center p-1.5 flex-shrink-0">
                    <div className="flex items-center gap-1">
                        <span className={cn(
                            "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full transition-colors",
                            day.isToday ? "bg-blue-600 text-white" : "text-gray-700"
                        )}>
                            {day.date.split('/')[0]}
                        </span>
                        {hasDelay && (
                            <AlertCircle className="w-3 h-3 text-red-500" />
                        )}
                    </div>

                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-gray-200"
                        onClick={(e) => onAddEvent(e, index)}
                    >
                        <Plus className="h-4 w-4 text-gray-500" />
                    </Button>
                </div>

                {/* Events List */}
                <div className="flex flex-col gap-1 px-1 pb-1 overflow-y-auto flex-1 min-h-0 custom-scrollbar">
                    {day.events.map(event => {
                        const style = getEventStyle(event);
                        const displayEndTime = event.toTime || event.endTime;
                        const hasDayConflict = hasTripConflicts(day.events);

                        return (
                            <div
                                key={event.id}
                                onClick={() => onEditEvent(index, event.id)}
                                className={cn(
                                    "group/event flex items-center gap-1.5 px-2 py-0.5 rounded-[3px] cursor-pointer transition-all border border-transparent hover:brightness-95 flex-shrink-0 text-white shadow-sm",
                                    style.bg,
                                    (event.isDelayed || hasDayConflict) && "ring-2 ring-red-500 ring-offset-1"
                                )}
                            >
                                <div className="flex-1 min-w-0 flex items-baseline gap-1.5">
                                    <span className="text-[10px] font-semibold opacity-90 whitespace-nowrap">
                                        {formatTime(event.fromTime || event.time)}
                                        {displayEndTime && ` - ${formatTime(displayEndTime)}`}
                                    </span>
                                    <span className="text-[11px] font-medium truncate leading-tight">
                                        {event.title}
                                    </span>
                                </div>
                                {(event.isDelayed || hasDayConflict) && (
                                    <AlertCircle className="w-3.5 h-3.5 text-white/90 flex-shrink-0 animate-pulse" />
                                )}
                                {(event.status === 'quoting' || event.status === 'quoted') && !event.isDelayed && !hasDayConflict && (
                                    <Clock className="w-3 h-3 text-white/80 flex-shrink-0" />
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    })

    // Pad remaining cells to complete the row
    const totalCells = startDayIndex + itinerary.length;
    const remainingCells = 7 - (totalCells % 7);
    if (remainingCells < 7 && remainingCells > 0) {
        for (let i = 0; i < remainingCells; i++) {
            cells.push(
                <div key={`empty-end-${i}`} className="bg-white/50 min-h-[100px] border-b border-gray-200" />
            )
        }
    }

    return cells
}

function getEventStyle(event: Event): { bg: string } {
    switch (event.type) {
        case 'flight': return { bg: "bg-blue-600" }     // Google Calendar Blue-ish
        case 'hotel': return { bg: "bg-emerald-600" }   // Sage/Basil
        case 'visit': return { bg: "bg-indigo-600" }    // Blueberry
        case 'food':
        case 'meal': return { bg: "bg-rose-500" }       // Tomato? Or Rose
        case 'transfer': return { bg: "bg-amber-500" }  // Banana/Citron
        case 'leisure': return { bg: "bg-violet-600" }  // Grape
        case 'return': return { bg: "bg-slate-600" }    // Graphite
        case 'checkout': return { bg: "bg-red-500" }    // Radical Red?
        default: return { bg: "bg-blue-500" }
    }
}
