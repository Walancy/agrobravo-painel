import { AlertCircle, Clock, Plane, Bed, Utensils, Sun, MapPin, Bus } from "lucide-react"
import { Event } from "@/types/itinerary"

interface ConflictAlertProps {
    conflictingEvents: Event[]
    message: string
}

const getEventIcon = (type: string) => {
    const t = type?.toLowerCase();
    if (t?.includes('flight')) return Plane;
    if (t?.includes('hotel') || t?.includes('checkout')) return Bed;
    if (t?.includes('food') || t?.includes('meal')) return Utensils;
    if (t?.includes('leisure') || t?.includes('livre')) return Sun;
    if (t?.includes('visit')) return MapPin;
    if (t?.includes('transfer')) return Bus;
    return AlertCircle;
}

export function ConflictAlert({ conflictingEvents }: ConflictAlertProps) {
    if (!conflictingEvents || conflictingEvents.length === 0) return null

    return (
        <div className="mb-4 animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-2 mb-2 text-red-600">
                <AlertCircle className="h-3.5 w-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Conflito Detectado</span>
            </div>

            <div className="space-y-1">
                {conflictingEvents.map((event) => {
                    const Icon = getEventIcon(event.type);
                    const displayType = event.type === 'food' ? 'Alimentação' :
                        event.type === 'leisure' ? 'Livre' :
                            event.type === 'visit' ? 'Visita' :
                                event.type === 'hotel' ? 'Hospedagem' :
                                    event.type === 'flight' ? 'Voo' : event.type;

                    return (
                        <div
                            key={event.id}
                            className="flex items-center gap-2 py-1.5 px-2 bg-white/80 border border-red-50 rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                        >
                            <div className="flex-shrink-0 w-6 h-6 rounded-md bg-red-50 flex items-center justify-center">
                                <Icon className="w-3.5 h-3.5 text-red-500" />
                            </div>

                            <div className="flex-1 min-w-0 pr-2">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] font-bold text-red-400 uppercase tracking-tighter shrink-0">
                                        {displayType}
                                    </span>
                                    <span className="text-[11px] font-semibold text-gray-900 truncate">
                                        {event.title}
                                    </span>
                                </div>
                            </div>

                            <div className="flex-shrink-0 flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                <Clock className="w-2.5 h-2.5 text-gray-400" />
                                <span className="text-[10px] font-mono font-bold text-gray-600">
                                    {event.time}
                                </span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

