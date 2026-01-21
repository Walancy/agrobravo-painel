import * as React from "react"
import {
    PlaneTakeoff,
    Coffee,
    BedDouble,
    MapPin,
    Sun,
    Clock,
    X,
    Star,
    Pencil,
    Bus,
    AlertCircle,
    ArrowLeftRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Event } from "@/types/itinerary"
import { formatTime, formatTotalPrice } from "@/lib/itineraryUtils"
import { airports } from "@/data/airports"
import { GroupAvatars } from "./GroupAvatars"

interface ItineraryEventItemProps {
    event: Event
    prevEvent: Event | null
    nextEvent: Event | null
    onDelete: () => void
    onEdit: () => void
    onFavoriteToggle: () => void
    isFirst?: boolean
}

export function ItineraryEventItem({
    event,
    prevEvent,
    nextEvent,
    onDelete,
    onEdit,
    onFavoriteToggle,
    isFirst = false
}: ItineraryEventItemProps) {
    const isTransfer = event.type === 'transfer'
    const isFlight = event.type === 'flight'
    const nextIsTransfer = nextEvent?.type === 'transfer'
    const isLast = !nextEvent

    // Connector Logic
    const getConnectorInfo = () => {
        if (!nextEvent) return { showConnector: false, displayDuration: null, isConflict: false };

        const parseTime = (t: string) => {
            if (!t) return 0;
            const [h, m] = t.split(':').map(Number);
            return h * 60 + m;
        };

        let currentEndTimeMin = 0;
        const endTimeStr = event.toTime || event.endTime;
        if (endTimeStr) {
            currentEndTimeMin = parseTime(endTimeStr);
        } else {
            const startTimeMin = parseTime(event.time);
            let durationMin = 0;
            if (event.duration) {
                const match = event.duration.match(/(\d+)\s*h\s*(\d+)?|(\d+)\s*h|(\d+)\s*min/);
                if (match) {
                    if (match[4]) durationMin = parseInt(match[4]);
                    else if (match[3]) durationMin = parseInt(match[3]) * 60;
                    else {
                        const h = parseInt(match[1] || '0');
                        const m = parseInt(match[2] || '0');
                        durationMin = h * 60 + m;
                    }
                }
            }
            currentEndTimeMin = startTimeMin + durationMin;
        }

        const nextStartMin = parseTime(nextEvent.fromTime || nextEvent.time);
        let diff = nextStartMin - currentEndTimeMin;
        let isConflict = false;

        if (diff < 0) {
            isConflict = true;
            diff = Math.abs(diff);
        }

        let travelTimeStr = null;
        const h = Math.floor(diff / 60);
        const m = diff % 60;

        if (diff > 0) {
            if (h > 0 && m > 0) travelTimeStr = `${h}h ${m}m`;
            else if (h > 0) travelTimeStr = `${h}h`;
            else travelTimeStr = `${m}m`;
        } else if (isConflict) {
            travelTimeStr = "0m";
        }

        const isReturnToTransfer = event.type === 'return' && nextEvent.type === 'transfer';
        const showConnector = isConflict || event.isDelayed || (!!travelTimeStr && !isReturnToTransfer);
        return { showConnector, displayDuration: travelTimeStr, isConflict };
    };

    const { showConnector, displayDuration, isConflict } = getConnectorInfo();

    // TRANSFER RENDERING
    if (isTransfer) {
        return (
            <div className="relative">
                {!isLast && (
                    <div className={cn(
                        "absolute left-[31px] bottom-0 w-0.5 border-l-2 border-dashed z-0 h-[calc(100%+32px)]",
                        (isConflict || event.isDelayed) ? "border-red-500" : "border-blue-600",
                        isFirst ? "top-8" : "-top-4"
                    )} />
                )}

                <div className={cn("flex items-center justify-between bg-gray-100 rounded-2xl p-4 relative z-10", !showConnector && "mb-2")}>
                    <div className="flex items-center gap-4">
                        <Bus className="w-5 h-5 text-blue-600 shrink-0" />
                        <div className="flex flex-col">
                            <span className="font-medium text-gray-500 text-xs mb-0.5">{formatTime(event.time)}</span>
                            <span className="font-semibold text-gray-900 text-sm leading-none">{event.title}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-red-400 hover:text-red-600"
                            onClick={onDelete}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
                {showConnector && (
                    <>
                        {(isConflict || event.isDelayed) ? (
                            <div className="pl-14">
                                <div className="bg-gradient-to-r from-[#FFD1D1] to-white/0 px-4 rounded-r-full -ml-4 flex items-center gap-4 w-full py-4">
                                    <span className="text-sm font-semibold text-black">
                                        {isConflict ? "Conflito de horário: " : "Tempo de viagem: "}
                                        <span className="text-red-500">{displayDuration}</span>
                                    </span>
                                    <Badge className="bg-red-500 hover:bg-red-600 text-white border-none py-0.5 px-3">
                                        Atraso!
                                    </Badge>
                                </div>
                            </div>
                        ) : (
                            <div className="pl-14 py-4">
                                <span className="text-xs font-semibold text-gray-900">Tempo de viagem: {displayDuration}</span>
                            </div>
                        )}
                    </>
                )}
            </div>
        )
    }

    // FLIGHT RENDERING
    if (isFlight) {
        return (
            <div className="relative">
                {!isLast && (
                    <div className={cn(
                        "absolute left-[31px] bottom-0 w-0.5 border-l-2 border-dashed z-0 h-[calc(100%+32px)]",
                        (isConflict || event.isDelayed) ? "border-red-500" : "border-blue-600",
                        isFirst ? "top-8" : "-top-4"
                    )} />
                )}

                <div className={cn("relative z-10", !showConnector && "mb-2")}>
                    <div className="bg-gray-100 rounded-2xl p-4 relative z-10">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-gray-900">{formatTime(event.fromTime || event.time)}</span>
                                </div>
                                <GroupAvatars event={event} maxDisplay={3} />
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                        "h-6 w-6 hover:text-yellow-400 transition-colors",
                                        event.isFavorite ? "text-yellow-400" : "text-gray-400"
                                    )}
                                    onClick={onFavoriteToggle}
                                >
                                    <Star className={cn("w-4 h-4", event.isFavorite && "fill-current")} />
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-gray-400 hover:text-blue-600 transition-colors"
                                    onClick={onEdit}
                                >
                                    <Pencil className="w-4 h-4" />
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-red-400 hover:text-red-600"
                                    onClick={onDelete}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="h-px bg-gray-200 w-full mb-3" />

                        <div className="space-y-3">
                            <div className="flex justify-between items-start">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-transparent text-blue-600">
                                        <PlaneTakeoff className="w-5 h-5" />
                                    </div>

                                    <div>
                                        <span className="text-[10px] text-gray-500 block mb-0.5">{event.subtitle}</span>
                                        <h3 className="font-semibold text-gray-900 text-sm leading-tight">{event.title}</h3>
                                        {event.description && (
                                            <div className="mt-2 text-xs text-gray-500 leading-relaxed max-w-[90%]">
                                                {event.description.split(/(\bhttps?:\/\/[^\s]+)/g).map((part, i) => (
                                                    part.match(/^https?:\/\//) ? (
                                                        <a
                                                            key={i}
                                                            href={part}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:underline font-medium"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            Saiba mais
                                                        </a>
                                                    ) : (
                                                        <span key={i}>{part}</span>
                                                    )
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {event.status === 'confirmed' && event.price && (
                                    <Badge className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-3 py-1 text-xs font-semibold border-none">
                                        {formatTotalPrice(event.price, event.passengers)}
                                    </Badge>
                                )}
                                {event.status === 'quoting' && (
                                    <Badge className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-3 py-1 text-xs font-semibold border-none">
                                        Cotando
                                    </Badge>
                                )}
                            </div>

                            <div className="flex items-center justify-between px-2 mt-2">
                                <div className="flex flex-col">
                                    <span className="text-2xl font-medium text-gray-900 leading-none">{event.fromCode}</span>
                                    <span className="text-[11px] text-gray-500 mt-1">{formatTime(event.fromTime)}</span>
                                </div>
                                <div className="flex-1 px-3 flex items-center justify-center gap-2 -mt-4">
                                    <PlaneTakeoff className="w-5 h-5 text-blue-600 shrink-0" />
                                    <div className="w-full h-px bg-gray-300" />
                                </div>
                                <div className="flex flex-col text-right">
                                    <span className="text-2xl font-medium text-gray-900 leading-none">{event.toCode}</span>
                                    <span className="text-[11px] text-gray-500 mt-1">{formatTime(event.toTime)}</span>
                                </div>
                            </div>
                            <div className="flex justify-between text-[10px] text-gray-500 px-2 font-medium mt-1">
                                <span>de {airports.find(a => a.code === event.fromCode)?.city || event.from}</span>
                                <span>para {airports.find(a => a.code === event.toCode)?.city || event.to}</span>
                            </div>
                        </div>
                    </div>
                    {showConnector && (
                        <>
                            {(isConflict || event.isDelayed) ? (
                                <div className="pl-14">
                                    <div className="bg-gradient-to-r from-[#FFD1D1] to-white/0 px-4 rounded-r-full -ml-4 flex items-center gap-4 w-full py-4">
                                        <span className="text-xs font-semibold text-black">
                                            {isConflict ? "Conflito de horário: " : "Tempo de viagem: "}
                                            <span className="text-red-500">{displayDuration}</span>
                                        </span>
                                        <Badge className="bg-red-500 hover:bg-red-600 text-white border-none py-0.5 px-3">
                                            Atraso!
                                        </Badge>
                                    </div>
                                </div>
                            ) : (
                                <div className="pl-14 py-4">
                                    <span className="text-xs font-semibold text-gray-900">Tempo de viagem: {displayDuration}</span>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        )
    }

    // HOTEL RENDERING
    if (event.type === 'hotel') {
        return (
            <div className="relative">
                {!isLast && (
                    <div className={cn(
                        "absolute left-[31px] bottom-0 w-0.5 border-l-2 border-dashed z-0 h-[calc(100%+32px)]",
                        (isConflict || event.isDelayed) ? "border-red-500" : "border-blue-600",
                        isFirst ? "top-8" : "-top-4"
                    )} />
                )}

                <div className={cn("relative z-10", !showConnector && "mb-2")}>
                    <div className="bg-gray-100 rounded-2xl p-4 relative z-10">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-gray-900">{formatTime(event.time)}</span>
                                </div>
                                <GroupAvatars event={event} maxDisplay={3} />
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                        "h-6 w-6 hover:text-yellow-400 transition-colors",
                                        event.isFavorite ? "text-yellow-400" : "text-gray-400"
                                    )}
                                    onClick={onFavoriteToggle}
                                >
                                    <Star className={cn("w-4 h-4", event.isFavorite && "fill-current")} />
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-gray-400 hover:text-blue-600 transition-colors"
                                    onClick={onEdit}
                                >
                                    <Pencil className="w-4 h-4" />
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-red-400 hover:text-red-600"
                                    onClick={onDelete}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="h-px bg-gray-200 w-full mb-3" />

                        <div className="space-y-3">
                            <div className="flex justify-between items-start">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-transparent text-blue-600">
                                        <BedDouble className="w-5 h-5" />
                                    </div>

                                    <div>
                                        <span className="text-[10px] text-gray-500 block mb-0.5">{event.subtitle}</span>
                                        <h3 className="font-semibold text-gray-900 text-sm leading-tight">{event.title}</h3>
                                        {event.location && (
                                            <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500">
                                                <MapPin className="w-3 h-3" />
                                                <a
                                                    href={event.location.startsWith('http') ? event.location : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:underline text-blue-600"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    Saiba mais
                                                </a>
                                            </div>
                                        )}
                                        {event.description && (
                                            <div className="mt-2 text-xs text-gray-500 leading-relaxed max-w-[90%]">
                                                {event.description.split(/(\bhttps?:\/\/[^\s]+)/g).map((part, i) => (
                                                    part.match(/^https?:\/\//) ? (
                                                        <a
                                                            key={i}
                                                            href={part}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:underline font-medium"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            Saiba mais
                                                        </a>
                                                    ) : (
                                                        <span key={i}>{part}</span>
                                                    )
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {event.subtitle === 'Check-in' && event.status === 'free' && (
                                    <Badge className="bg-green-500 hover:bg-green-600 text-white rounded-full px-3 py-1 text-xs font-semibold border-none">
                                        Free
                                    </Badge>
                                )}
                                {event.subtitle === 'Check-in' && (event.status === 'confirmed' || event.status === 'quoted') && event.price && (
                                    <Badge className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-3 py-1 text-xs font-semibold border-none">
                                        {formatTotalPrice(event.price, undefined)}
                                    </Badge>
                                )}
                                {event.subtitle === 'Check-in' && event.status === 'quoting' && (
                                    <Badge className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-3 py-1 text-xs font-semibold border-none">
                                        Pendente
                                    </Badge>
                                )}
                            </div>


                        </div>
                    </div>
                    {showConnector && (
                        <>
                            {(isConflict || event.isDelayed) ? (
                                <div className="pl-14">
                                    <div className="bg-gradient-to-r from-[#FFD1D1] to-white/0 px-4 rounded-r-full -ml-4 flex items-center gap-4 w-full py-4">
                                        <span className="text-xs font-semibold text-black">
                                            {isConflict ? "Conflito de horário: " : "Tempo de viagem: "}
                                            <span className="text-red-500">{displayDuration}</span>
                                        </span>
                                        <Badge className="bg-red-500 hover:bg-red-600 text-white border-none py-0.5 px-3">
                                            Atraso!
                                        </Badge>
                                    </div>
                                </div>
                            ) : (
                                <div className="pl-14 py-4">
                                    <span className="text-xs font-semibold text-gray-900">Tempo de viagem: {displayDuration}</span>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        )
    }

    // VISIT RENDERING
    if (event.type === 'visit') {
        return (
            <div className="relative">
                {!isLast && (
                    <div className={cn(
                        "absolute left-[31px] bottom-0 w-0.5 border-l-2 border-dashed z-0 h-[calc(100%+32px)]",
                        (isConflict || event.isDelayed) ? "border-red-500" : "border-blue-600",
                        isFirst ? "top-8" : "-top-4"
                    )} />
                )}

                <div className={cn("relative z-10", !showConnector && "mb-2")}>
                    <div className="bg-gray-100 rounded-2xl p-4 relative z-10">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-gray-900">{formatTime(event.time)}</span>
                                </div>
                                <GroupAvatars event={event} maxDisplay={3} />
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                        "h-6 w-6 hover:text-yellow-400 transition-colors",
                                        event.isFavorite ? "text-yellow-400" : "text-gray-400"
                                    )}
                                    onClick={onFavoriteToggle}
                                >
                                    <Star className={cn("w-4 h-4", event.isFavorite && "fill-current")} />
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-gray-400 hover:text-blue-600 transition-colors"
                                    onClick={onEdit}
                                >
                                    <Pencil className="w-4 h-4" />
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-red-400 hover:text-red-600"
                                    onClick={onDelete}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="h-px bg-gray-200 w-full mb-3" />

                        <div className="space-y-3">
                            <div className="flex justify-between items-start">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-transparent text-blue-600">
                                        <MapPin className="w-5 h-5" />
                                    </div>

                                    <div>
                                        <span className="text-[10px] text-gray-500 block mb-0.5">{event.subtitle || 'Visita Técnica'}</span>
                                        <h3 className="font-semibold text-gray-900 text-sm leading-tight">{event.title}</h3>
                                        {event.location && (
                                            <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500">
                                                <MapPin className="w-3 h-3" />
                                                <a
                                                    href={event.location.startsWith('http') ? event.location : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:underline text-blue-600"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    Saiba mais
                                                </a>
                                            </div>
                                        )}
                                        {event.description && (
                                            <div className="mt-2 text-xs text-gray-500 leading-relaxed max-w-[90%]">
                                                {event.description.split(/(\bhttps?:\/\/[^\s]+)/g).map((part, i) => (
                                                    part.match(/^https?:\/\//) ? (
                                                        <a
                                                            key={i}
                                                            href={part}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:underline font-medium"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            Saiba mais
                                                        </a>
                                                    ) : (
                                                        <span key={i}>{part}</span>
                                                    )
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {event.status === 'free' && (
                                    <Badge className="bg-green-500 hover:bg-green-600 text-white rounded-full px-3 py-1 text-xs font-semibold border-none">
                                        Free
                                    </Badge>
                                )}
                                {(event.status === 'confirmed' || event.status === 'quoted') && event.price && (
                                    <Badge className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-3 py-1 text-xs font-semibold border-none">
                                        {formatTotalPrice(event.price, undefined)}
                                    </Badge>
                                )}
                                {event.status === 'quoting' && (
                                    <Badge className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-3 py-1 text-xs font-semibold border-none">
                                        Pendente
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                    {showConnector && (
                        <>
                            {(isConflict || event.isDelayed) ? (
                                <div className="pl-14">
                                    <div className="bg-gradient-to-r from-[#FFD1D1] to-white/0 px-4 rounded-r-full -ml-4 flex items-center gap-4 w-full py-4">
                                        <span className="text-xs font-semibold text-black">
                                            {isConflict ? "Conflito de horário: " : "Tempo de viagem: "}
                                            <span className="text-red-500">{displayDuration}</span>
                                        </span>
                                        <Badge className="bg-red-500 hover:bg-red-600 text-white border-none py-0.5 px-3">
                                            Atraso!
                                        </Badge>
                                    </div>
                                </div>
                            ) : (
                                <div className="pl-14 py-4">
                                    <span className="text-xs font-semibold text-gray-900">Tempo de viagem: {displayDuration}</span>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        )
    }

    // OTHER EVENTS RENDERING (visit, meal, etc.)
    return (
        <div className="relative">
            {!isLast && (
                <div className={cn(
                    "absolute left-[31px] bottom-0 w-0.5 border-l-2 border-dashed z-0 h-[calc(100%+32px)]",
                    (isConflict || event.isDelayed) ? "border-red-500" : "border-blue-600",
                    isFirst ? "top-8" : "-top-4"
                )} />
            )}

            <div className={cn("relative z-10", !showConnector && "mb-2")}>
                <div className={cn(
                    "rounded-2xl p-4 relative z-10",
                    event.type === 'return'
                        ? "bg-gradient-to-br from-blue-50 to-sky-50"
                        : "bg-gray-100"
                )}>
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm">
                                <Clock className="w-4 h-4" />
                                <span className="text-gray-900">{formatTime(event.time)}</span>
                            </div>
                            <GroupAvatars event={event} maxDisplay={3} />
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "h-6 w-6 hover:text-yellow-400 transition-colors",
                                    event.isFavorite ? "text-yellow-400" : "text-gray-400"
                                )}
                                onClick={onFavoriteToggle}
                            >
                                <Star className={cn("w-4 h-4", event.isFavorite && "fill-current")} />
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-gray-400 hover:text-blue-600 transition-colors"
                                onClick={onEdit}
                            >
                                <Pencil className="w-4 h-4" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-red-400 hover:text-red-600"
                                onClick={onDelete}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="h-px bg-gray-200 w-full mb-3" />

                    <div className="space-y-3">
                        <div className="flex justify-between items-start">
                            <div className="flex items-start gap-3">
                                <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                    event.type === 'return' ? "bg-blue-100 text-blue-600" : "bg-transparent text-blue-600"
                                )}>
                                    {(event.type === 'meal' || event.type === 'food') && <Coffee className="w-5 h-5" />}
                                    {!['meal', 'food', 'leisure', 'ai_recommendation', 'return'].includes(event.type) && <MapPin className="w-5 h-5" />}
                                    {event.type === 'leisure' && <Sun className="w-5 h-5" />}
                                    {event.type === 'ai_recommendation' && <Clock className="w-5 h-5" />}
                                    {event.type === 'return' && (
                                        <div className="flex flex-col items-center justify-center -space-y-0.5">
                                            {event.subtitle?.includes('Hotel') ? <BedDouble className="w-4 h-4" /> :
                                                event.subtitle?.includes('Visita') ? <MapPin className="w-4 h-4" /> :
                                                    event.subtitle?.includes('Alimentação') ? <Coffee className="w-4 h-4" /> :
                                                        event.subtitle?.includes('Livre') ? <Sun className="w-4 h-4" /> :
                                                            <MapPin className="w-4 h-4" />}
                                            <ArrowLeftRight className="w-3 h-3 text-blue-500" />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <span className={cn(
                                        "text-[10px] block mb-0.5 font-medium",
                                        event.type === 'return' ? "text-blue-600" : "text-gray-500"
                                    )}>
                                        {event.subtitle || event.type}
                                    </span>
                                    <h3 className="font-semibold text-gray-900 text-sm leading-tight">{event.title}</h3>
                                    {event.location && (
                                        <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500">
                                            <MapPin className="w-3 h-3" />
                                            <a
                                                href={event.location.startsWith('http') ? event.location : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="hover:underline text-blue-600"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                Saiba mais
                                            </a>
                                        </div>
                                    )}
                                    {event.description && (
                                        <div className="mt-2 text-xs text-gray-500 leading-relaxed max-w-[90%]">
                                            {event.description.split(/(\bhttps?:\/\/[^\s]+)/g).map((part, i) => (
                                                part.match(/^https?:\/\//) ? (
                                                    <a
                                                        key={i}
                                                        href={part}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline font-medium"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        Saiba mais
                                                    </a>
                                                ) : (
                                                    <span key={i}>{part}</span>
                                                )
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {event.status === 'free' && (
                                <Badge className="bg-green-500 hover:bg-green-600 text-white rounded-full px-3 py-1 text-xs font-semibold border-none">
                                    Free
                                </Badge>
                            )}
                            {(event.status === 'confirmed' || event.status === 'quoted') && event.price && (
                                <Badge className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-3 py-1 text-xs font-semibold border-none">
                                    {formatTotalPrice(event.price, event.type === 'flight' ? event.passengers : undefined)}
                                </Badge>
                            )}
                            {event.status === 'quoting' && (
                                <Badge className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-3 py-1 text-xs font-semibold border-none">
                                    Pendente
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
                {showConnector && (
                    <>
                        {(isConflict || event.isDelayed) ? (
                            <div className="pl-14">
                                <div className="bg-gradient-to-r from-[#FFD1D1] to-white/0 px-4 rounded-r-full -ml-4 flex items-center gap-4 w-full py-4">
                                    <span className="text-xs font-semibold text-black">
                                        {isConflict ? "Conflito de horário: " : "Tempo de viagem: "}
                                        <span className="text-red-500">{displayDuration}</span>
                                    </span>
                                    <Badge className="bg-red-500 hover:bg-red-600 text-white border-none py-0.5 px-3">
                                        Atraso!
                                    </Badge>
                                </div>
                            </div>
                        ) : (
                            <div className="pl-14 py-4">
                                <span className="text-xs font-semibold text-gray-900">Tempo de viagem: {displayDuration}</span>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
