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
    ArrowLeftRight,
    ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Event } from "@/types/itinerary"
import { formatTime, formatTotalPrice } from "@/lib/itineraryUtils"
import { airports } from "@/data/airports"
import { GroupAvatars } from "./GroupAvatars"
import { googleMapsService, DistanceMatrixResult } from "@/services/googleMapsService"

interface ItineraryEventItemProps {
    event: Event
    prevEvent: Event | null
    nextEvent: Event | null
    onDelete: () => void
    onEdit: () => void
    onFavoriteToggle: () => void
    isFirst?: boolean
}

const displacementCache = new Map<string, DistanceMatrixResult>();

export function ItineraryEventItem({
    event,
    prevEvent,
    nextEvent,
    onDelete,
    onEdit,
    onFavoriteToggle,
    isFirst = false
}: ItineraryEventItemProps) {
    const [travelData, setTravelData] = React.useState<DistanceMatrixResult | null>(null);
    const [apiError, setApiError] = React.useState(false);
    const [showConnections, setShowConnections] = React.useState(false);
    const isTransfer = event.type === 'transfer'
    const isFlight = event.type === 'flight'
    const nextIsTransfer = nextEvent?.type === 'transfer'
    const isLast = !nextEvent

    // Fetch Google Maps displacement
    React.useEffect(() => {
        setTravelData(null);

        let originEvent = event;
        let destEvent = nextEvent;

        // Standard logic: Origin = This Event, Dest = Next Event
        // (Even for transfers, we want to know if there's travel/gap AFTER the transfer to the next event)

        if (!destEvent) return;

        const sanitizeLocation = (loc: string | undefined, fallbackTitle: string, city?: string) => {
            const isGeneric = (s: string) => /^(transfer|transferência|translado|deslocamento)$/i.test(s.trim());
            const clean = (s: string) => s.replace(/^(Retorno|Volta|Ida)\s*(-|:)?\s*/i, '').trim();

            let value = loc;
            if (value && (value.startsWith('http://') || value.startsWith('https://'))) {
                value = city || fallbackTitle;
            }

            if (!value) value = city || fallbackTitle;
            value = clean(value);

            return isGeneric(value) ? '' : value;
        };

        const getEventEndLocation = (ev: Event) => {
            if (ev.type === 'flight') {
                if (ev.toCode) {
                    const airport = airports.find(a => a.code === ev.toCode);
                    if (airport) return `${airport.name}, ${airport.city}, ${airport.country}`;
                    return `Airport ${ev.toCode}`;
                }
                return sanitizeLocation(ev.to, ev.title, ev.city);
            }
            if (ev.type === 'transfer') return sanitizeLocation(ev.to, ev.title, ev.city) || sanitizeLocation(ev.location, ev.title, ev.city);
            return sanitizeLocation(ev.location, ev.title, ev.city);
        };

        const getEventStartLocation = (ev: Event) => {
            if (ev.type === 'flight') {
                if (ev.fromCode) {
                    const airport = airports.find(a => a.code === ev.fromCode);
                    if (airport) return `${airport.name}, ${airport.city}, ${airport.country}`;
                    return `Airport ${ev.fromCode}`;
                }
                return sanitizeLocation(ev.from, ev.title, ev.city);
            }
            if (ev.type === 'transfer') return sanitizeLocation(ev.from, ev.title, ev.city) || sanitizeLocation(ev.location, ev.title, ev.city);
            return sanitizeLocation(ev.location, ev.title, ev.city);
        };

        const origin = getEventEndLocation(originEvent);
        const destination = getEventStartLocation(destEvent);

        if (origin && destination && origin.trim() !== destination.trim()) {
            const cacheKey = `${origin}-${destination}-${originEvent.date}`;
            if (displacementCache.has(cacheKey)) {
                setTravelData(displacementCache.get(cacheKey)!);
                return;
            }

            googleMapsService.getBusTravelTime(origin, destination).then(result => {
                if (result) {
                    displacementCache.set(cacheKey, result);
                    setTravelData(result);
                    setApiError(false);
                } else {
                    setApiError(true);
                }
            }).catch(() => setApiError(true));
        }
    }, [
        event.id,
        nextEvent?.id,
        prevEvent?.id,
        event.to,
        event.toCode,
        event.location,
        event.date,
        event.toTime,
        event.endTime,
        nextEvent?.location,
        nextEvent?.from,
        nextEvent?.fromCode,
        prevEvent?.location,
        prevEvent?.to
    ]);

    // Connector Logic
    const getConnectorInfo = () => {
        const parseTime = (t: string) => {
            if (!t) return 0;
            const [h, m] = t.split(':').map(Number);
            return h * 60 + m;
        };

        const isReturnToTransfer = event.type === 'return' && nextEvent?.type === 'transfer';

        // Suppress displacement text/warnings if the next event is a transfer (user wants cards to touch)
        const suppressDueToNextTransfer = nextIsTransfer;

        // Calculate current event end time
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

        const nextStartMin = parseTime(nextEvent ? (nextEvent.fromTime || nextEvent.time) : '');
        let diff = nextStartMin - currentEndTimeMin;

        // Standard logic: Diff is the gap from THIS event's end to NEXT event's start
        // (Removed backward-looking logic for transfers)

        let isTimeConflict = diff < 0;
        let isDisplacementConflict = false;
        if (travelData && !isTimeConflict) {
            const travelMinutes = Math.ceil(travelData.durationValue / 60);
            if (travelMinutes > diff) {
                isDisplacementConflict = true;
            }
        }

        let isConflict = isTimeConflict || isDisplacementConflict;

        let travelTimeStr = null;
        if (diff !== 0) {
            const absDiff = Math.abs(diff);
            const h = Math.floor(absDiff / 60);
            const m = absDiff % 60;
            if (h > 0 && m > 0) travelTimeStr = `${h}h ${m}m`;
            else if (h > 0) travelTimeStr = `${h}h`;
            else travelTimeStr = `${m}m`;
        }

        // If current event is a transfer, we want to show ITS duration on the connector BELOW it
        // If current event is a transfer, we want to show ITS duration on the connector BELOW it
        let finalDuration = (travelData && (isTransfer || diff !== 0)) ? travelData.durationText : travelTimeStr;
        if (isTransfer) {
            finalDuration = travelData?.durationText || event.duration || travelTimeStr;
        }

        // If next is transfer OR is last, we hide the connector, BUT ONLY for non-transfer events.
        // Transfer events MUST always show their duration/delay below them.
        if (!isTransfer && (nextIsTransfer || isLast)) {
            return { showConnector: false, displayDuration: finalDuration, isTimeConflict, isDisplacementConflict, isConflict, nextIsTransfer };
        }

        const showConnector = isConflict || event.isDelayed || !!finalDuration || apiError;
        return { showConnector, displayDuration: finalDuration, isTimeConflict, isDisplacementConflict, isConflict, nextIsTransfer, apiError };
    };

    const { showConnector, displayDuration, isTimeConflict, isDisplacementConflict, isConflict, nextIsTransfer: nextIsTransferResult, apiError: apiErrorResult } = getConnectorInfo();

    const connectorUI = showConnector && (
        <div className={cn(
            "pl-14 flex flex-col relative z-20",
            "my-0"
        )}>
            {(isConflict || event.isDelayed) ? (
                <div className="flex flex-col">
                    <div className="bg-gradient-to-r from-[#f84b3d] to-transparent px-4 py-2.5 rounded-none -ml-2 flex items-center gap-4 w-fit pr-12">
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                            <span className="text-sm font-normal text-black">Atraso:</span>
                            <span className="text-sm font-normal text-white">
                                {isDisplacementConflict ? travelData?.durationText : (event.delay || displayDuration)}
                            </span>
                        </div>
                        <Badge className="bg-[#f84b3d] hover:bg-[#f84b3d] text-white border-none py-1 px-4 h-7 text-[11px] rounded-full font-normal shadow-sm flex items-center justify-center">
                            Alerta!
                        </Badge>
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-1.5 py-2.5 -ml-2 px-4 min-h-[48px]">
                    <span className="text-sm font-normal text-gray-400">
                        {"Tempo de deslocamento: "}
                        <span className={cn(
                            "text-blue-500/80",
                            (apiErrorResult || apiError) && "text-red-500 font-medium"
                        )}>
                            {(apiErrorResult || apiError) ? "Erro de cálculo" : displayDuration}
                        </span>
                    </span>
                </div>
            )}
        </div>
    );

    const endOfDayUI = isLast && (
        <div className="pl-14 py-4">
            <span className="text-gray-400 text-xs font-medium">Fim do dia</span>
        </div>
    );

    // Helper to extract a readable name from a Google Maps URL
    const extractLocationFromUrl = (url: string) => {
        try {
            if (!url) return null;
            // Handle /search/Query format
            const searchMatch = url.match(/\/search\/([^/]+)/);
            if (searchMatch && searchMatch[1]) {
                return decodeURIComponent(searchMatch[1].replace(/\+/g, ' '));
            }
            // Handle /place/Name format
            const placeMatch = url.match(/\/place\/([^/]+)/);
            if (placeMatch && placeMatch[1]) {
                return decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
            }
            // Handle query param ?query=Name
            const urlObj = new URL(url);
            const query = urlObj.searchParams.get('query') || urlObj.searchParams.get('q');
            if (query) return query;

            return null;
        } catch (e) {
            return null;
        }
    };

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

                <div className={cn(
                    "flex items-center justify-between bg-gray-100 rounded-2xl p-4 relative z-10",
                    showConnector ? "mb-0" : "mb-2"
                )}>
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
                {connectorUI}
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

                <div className={cn("relative z-10", showConnector ? "mb-0" : "mb-2")}>
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

                            {/* Connections Display */}
                            {event.connections && event.connections.length > 0 && (
                                <div className="mt-4 pt-3 border-t border-gray-200/60">
                                    <button
                                        onClick={() => setShowConnections(!showConnections)}
                                        className="flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-blue-600 transition-colors w-full mb-3"
                                    >
                                        <span>Escalas ({event.connections.length})</span>
                                        <ChevronDown className={cn("w-3 h-3 transition-transform", showConnections && "rotate-180")} />
                                    </button>

                                    {showConnections && (
                                        <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                            {event.connections.map((conn, idx) => (
                                                <div key={idx} className="flex flex-col gap-2">
                                                    {/* Layover Info (if not first leg) */}
                                                    {conn.layoverDuration && (
                                                        <div className="flex items-center gap-2 pl-4">
                                                            <div className="h-8 w-px border-l border-dashed border-gray-300" />
                                                            <div className="px-2 py-1 bg-gray-50 rounded text-[10px] text-gray-500 font-medium border border-gray-100">
                                                                Conexão: {conn.layoverDuration}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                                                        <div className="flex flex-col items-center min-w-[40px]">
                                                            <span className="text-xs font-bold text-blue-600">{conn.airline.split(' ')[0]}</span>
                                                            <span className="text-[9px] text-blue-500/80">{conn.flightNumber}</span>
                                                        </div>

                                                        <div className="flex-1 flex items-center justify-between gap-2">
                                                            <div className="flex flex-col cursor-help" title={airports.find(a => a.code === conn.origin.code)?.name || conn.origin.code}>
                                                                <span className="text-xs font-semibold">{conn.origin.code}</span>
                                                                <span className="text-[10px] text-gray-500">{conn.origin.time}</span>
                                                            </div>

                                                            <div className="flex flex-col items-center flex-1 px-2">
                                                                <span className="text-[9px] text-gray-400">{conn.duration}</span>
                                                                <div className="w-full h-px bg-gray-200 mt-0.5 relative">
                                                                    <PlaneTakeoff className="h-3 w-3 text-blue-500 absolute -top-1.5 left-1/2 -translate-x-1/2" />
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-col text-right cursor-help" title={airports.find(a => a.code === conn.destination.code)?.name || conn.destination.code}>
                                                                <span className="text-xs font-semibold">{conn.destination.code}</span>
                                                                <span className="text-[10px] text-gray-500">{conn.destination.time}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    {connectorUI}
                    {endOfDayUI}
                </div>
            </div>
        )
    }

    // Helper to extract a readable name from a Google Maps URL or determine best display text
    const getDisplayLocation = (ev: Event): { text: string; isUrl: boolean } => {
        const loc = ev.location;
        const city = ev.city;

        // 1. If we have an explicit city, use it
        if (city) return { text: city, isUrl: false };

        // 2. If location is missing, fallback to "Ver no mapa"
        if (!loc) return { text: "Ver no mapa", isUrl: false };

        // 3. Check if location is a URL
        const isUrl = loc.startsWith('http') || loc.startsWith('www.');

        // 4. If it's NOT a URL, it's a text address -> Use it
        if (!isUrl) return { text: loc, isUrl: false };

        // 5. If it IS a URL, try to extract meaningful text
        try {
            const urlObj = new URL(loc);

            // Try /place/Name
            const placeMatch = loc.match(/\/place\/([^/]+)/);
            if (placeMatch && placeMatch[1]) {
                return { text: decodeURIComponent(placeMatch[1].replace(/\+/g, ' ')), isUrl: true };
            }

            // Try /search/Query
            const searchMatch = loc.match(/\/search\/([^/]+)/);
            if (searchMatch && searchMatch[1]) {
                return { text: decodeURIComponent(searchMatch[1].replace(/\+/g, ' ')), isUrl: true };
            }

            // Try query params (q=, query=, destination=)
            const query = urlObj.searchParams.get('q') ||
                urlObj.searchParams.get('query') ||
                urlObj.searchParams.get('destination');

            if (query && !query.includes(',')) { // Avoid coordinates
                return { text: query, isUrl: true };
            }
        } catch (e) {
            // Invalid URL parsing
        }

        // 6. If extraction failed, return "Ver no mapa"
        return { text: "Ver no mapa", isUrl: true };
    };

    // HOTEL RENDERING (Check-in / Check-out)
    if (event.type === 'hotel') {
        const { text: locationText, isUrl: locationIsUrl } = getDisplayLocation(event);

        // Construct the href: prefer strict URL if available, else search link
        const locationHref = locationIsUrl
            ? event.location!
            : (event.site_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location || event.city || event.title)}`);

        return (
            <div className="relative">
                {!isLast && (
                    <div className={cn(
                        "absolute left-[31px] bottom-0 w-0.5 border-l-2 border-dashed z-0 h-[calc(100%+32px)]",
                        (isConflict || event.isDelayed) ? "border-red-500" : "border-blue-600",
                        isFirst ? "top-8" : "-top-4"
                    )} />
                )}

                <div className={cn("relative z-10", showConnector ? "mb-0" : "mb-2")}>
                    <div className="bg-gray-100 rounded-2xl p-4 relative z-10">
                        {/* Header: Time, Avatars, Actions */}
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-gray-900">{formatTime(event.time)}</span>
                                </div>
                                <GroupAvatars event={event} maxDisplay={3} />
                            </div>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className={cn("h-6 w-6 hover:text-yellow-400 transition-colors", event.isFavorite ? "text-yellow-400" : "text-gray-400")} onClick={onFavoriteToggle}>
                                    <Star className={cn("w-4 h-4", event.isFavorite && "fill-current")} />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-blue-600 transition-colors" onClick={onEdit}>
                                    <Pencil className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-600" onClick={onDelete}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="h-px bg-gray-200 w-full mb-3" />

                        {/* Content */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-start">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-transparent text-blue-600">
                                        <BedDouble className="w-5 h-5" />
                                    </div>

                                    <div>
                                        <span className="text-[10px] text-gray-500 block mb-0.5">{event.subtitle}</span>
                                        <h3 className="font-semibold text-gray-900 text-sm leading-tight">{event.title}</h3>

                                        <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500">
                                            <MapPin className="w-3 h-3" />
                                            <a
                                                href={locationHref}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="hover:underline text-blue-600 font-medium"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {locationText}
                                            </a>
                                        </div>

                                        {event.description && (
                                            <div className="mt-2 text-xs text-gray-500 leading-relaxed max-w-[90%]">
                                                {event.description.split(/(\bhttps?:\/\/[^\s]+)/g).map((part, i) => (
                                                    part.match(/^https?:\/\//) ? (
                                                        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium" onClick={(e) => e.stopPropagation()}>
                                                            Saiba mais
                                                        </a>
                                                    ) : <span key={i}>{part}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Badges */}
                                <div>
                                    {event.status === 'free' && (
                                        <Badge className="bg-green-500 hover:bg-green-600 text-white rounded-full px-3 py-1 text-xs font-semibold border-none">Free</Badge>
                                    )}
                                    {(event.status === 'confirmed' || event.status === 'quoted') && event.price && (
                                        <Badge className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-3 py-1 text-xs font-semibold border-none">
                                            {formatTotalPrice(event.price, undefined)}
                                        </Badge>
                                    )}
                                    {event.status === 'quoting' && (
                                        <Badge className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-3 py-1 text-xs font-semibold border-none">Pendente</Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    {connectorUI}
                    {endOfDayUI}
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

                <div className={cn("relative z-10", showConnector ? "mb-0" : "mb-2")}>
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
                                                    href={event.location.startsWith('http') ? event.location : (event.site_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:underline text-blue-600"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {(event.location && !event.location.startsWith('http'))
                                                        ? event.location
                                                        : (event.city || extractLocationFromUrl(event.location || '') || "Ver no mapa")}
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
                    {connectorUI}
                    {endOfDayUI}
                </div>
            </div>
        )
    }

    // OTHER EVENTS RENDERING (meal, etc.)
    return (
        <div className="relative">
            {!isLast && (
                <div className={cn(
                    "absolute left-[31px] bottom-0 w-0.5 border-l-2 border-dashed z-0 h-[calc(100%+32px)]",
                    (isConflict || event.isDelayed) ? "border-red-500" : "border-blue-600",
                    isFirst ? "top-8" : "-top-4"
                )} />
            )}

            <div className={cn("relative z-10", showConnector ? "mb-0" : "mb-2")}>
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
                                                href={event.location.startsWith('http') ? event.location : (event.site_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="hover:underline text-blue-600"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {(event.location && !event.location.startsWith('http'))
                                                    ? event.location
                                                    : (event.city || extractLocationFromUrl(event.location || '') || "Ver no mapa")}
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
                {connectorUI}
                {endOfDayUI}
            </div>
        </div>
    )
}
