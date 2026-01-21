import * as React from "react"
import {
    Plus,
    DollarSign,
    ChevronDown,
    PlaneTakeoff,
    BedDouble,
    MapPin,
    Coffee,
    Bus,
    Sun,
    Calendar,
    AlertCircle,
    Clock,
    AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { DayItinerary } from "@/types/itinerary"
import { getCategoryTotals, hasTripConflicts } from "@/lib/itineraryUtils"
import { ItineraryEventItem } from "@/components/itinerary/ItineraryEventItem"
import { cn } from "@/lib/utils"

interface ItineraryDayColumnProps {
    day: DayItinerary
    dayIndex: number
    onAddEvent: (event: React.MouseEvent<HTMLButtonElement>, index: number) => void
    onDeleteEvent: (dayIndex: number, eventId: string) => void
    onEditEvent: (dayIndex: number, eventId: string) => void
    onFavoriteToggle: (dayIndex: number, eventId: string) => void
}

export function ItineraryDayColumn({
    day,
    dayIndex,
    onAddEvent,
    onDeleteEvent,
    onEditEvent,
    onFavoriteToggle
}: ItineraryDayColumnProps) {
    const hasConflict = hasTripConflicts(day.events) || day.events.some(event => event.isDelayed);
    const hasQuoting = day.events.some(event => event.status === 'quoting');

    return (
        <div className="flex flex-col gap-0 min-w-[350px] w-[300px] h-full">
            {/* Header */}
            <div className={cn(
                "flex items-center justify-between px-4 py-3 mb-2 flex-shrink-0 rounded-t-xl transition-all duration-300",
                hasConflict ? "bg-gradient-to-t from-red-100 via-red-50/30 to-white border-b border-red-200" : "bg-white"
            )}>
                <span className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                    {day.dayOfWeek}
                    {hasConflict && (
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                    )}
                    {hasQuoting && <Clock className="w-4 h-4 text-orange-500" />}
                </span>
                <span className="text-sm font-medium text-blue-600">{day.date}</span>
            </div>

            {/* Add Event Button */}
            <Button
                onClick={(e) => onAddEvent(e, dayIndex)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 font-medium text-base mb-4 transition-all active:scale-95 flex-shrink-0"
            >
                <Plus className="w-5 h-5 mr-2" /> Adicionar evento
            </Button>

            {/* Total Expenses */}
            <Popover>
                <PopoverTrigger asChild>
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-100 rounded-lg mb-4 cursor-pointer hover:bg-gray-200 transition-colors flex-shrink-0">
                        <div className="flex items-center gap-2 text-blue-600">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <span className="text-sm text-gray-600 font-medium">
                            Despesas totais: {
                                Object.values(getCategoryTotals(day.events))
                                    .reduce((a, b) => a + b, 0)
                                    .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                            }
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-3">
                    <div className="space-y-2">
                        <h4 className="font-medium text-sm text-gray-900 mb-2">Detalhamento</h4>
                        {Object.entries(getCategoryTotals(day.events)).length > 0 ? (
                            Object.entries(getCategoryTotals(day.events)).map(([category, total]) => {
                                let Icon = DollarSign;
                                if (category === 'Voo') Icon = PlaneTakeoff;
                                else if (category === 'Hospedagem') Icon = BedDouble;
                                else if (category === 'Visita') Icon = MapPin;
                                else if (category === 'Alimentação') Icon = Coffee;
                                else if (category === 'Transporte') Icon = Bus;
                                else if (category === 'Lazer') Icon = Sun;

                                return (
                                    <div key={category} className="flex justify-between text-sm items-center">
                                        <div className="flex items-center gap-2">
                                            <Icon className="w-4 h-4 text-blue-600" />
                                            <span className="text-gray-500">{category}</span>
                                        </div>
                                        <span className="font-medium text-gray-900">
                                            {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </span>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="text-sm text-gray-400 text-center py-2">Sem despesas registradas</div>
                        )}
                    </div>
                </PopoverContent>
            </Popover>

            {/* Events List with independent scroll */}
            <div className="flex flex-col flex-1 overflow-y-auto">
                {day.events.map((event, eventIndex) => {
                    const isFirst = eventIndex === 0;
                    const isLast = eventIndex === day.events.length - 1;
                    const prevEvent = eventIndex > 0 ? day.events[eventIndex - 1] : null;
                    const nextEvent = !isLast ? day.events[eventIndex + 1] : null;

                    return (
                        <ItineraryEventItem
                            key={event.id}
                            event={event}
                            prevEvent={prevEvent}
                            nextEvent={nextEvent}
                            isFirst={isFirst}
                            onDelete={() => onDeleteEvent(dayIndex, event.id)}
                            onEdit={() => onEditEvent(dayIndex, event.id)}
                            onFavoriteToggle={() => onFavoriteToggle(dayIndex, event.id)}
                        />
                    );
                })}

                {day.events.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
                        <Calendar className="w-8 h-8 opacity-20" />
                        <span className="text-sm font-medium">Sem eventos</span>
                    </div>
                )}
            </div>
        </div>
    )
}
