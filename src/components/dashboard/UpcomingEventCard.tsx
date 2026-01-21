'use client'

import { Clock, MapPin, Plane, ArrowRight, Coffee } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'

export interface UpcomingEvent {
    id: string
    group_id: string
    group_name: string
    group_logo: string | null
    group_location?: string
    group_end_date?: string
    group_days_remaining?: number
    mission_name: string
    event_type: 'flight' | 'hotel' | 'food' | 'leisure' | 'visit'
    title: string
    origin?: string
    origin_full?: string
    destination?: string
    destination_full?: string
    date: string
    time_start: string
    time_end?: string
    flight_number?: string
    days_until?: number
}

interface UpcomingEventCardProps {
    event: UpcomingEvent
}

export function UpcomingEventCard({ event }: UpcomingEventCardProps) {
    const formatTime = (time: string) => {
        return time.substring(0, 5) // HH:MM
    }


    return (
        <div className="bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-lg transition-all group relative">
            <div className="flex flex-col xl:flex-row items-start xl:items-center gap-4 xl:gap-6">
                {/* Left Section: Group Info */}
                <div className="flex items-center gap-4 w-full xl:w-auto xl:min-w-[240px]">
                    <div className="flex-shrink-0">
                        {event.group_logo ? (
                            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-50 border border-gray-100">
                                <Image
                                    src={event.group_logo}
                                    alt={event.group_name}
                                    width={64}
                                    height={64}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center border-4 border-white shadow-sm">
                                <span className="text-white font-bold text-xl">
                                    {event.group_name.substring(0, 2).toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <h4 className="font-bold text-gray-900 text-lg truncate mb-0.5">
                            {event.group_name}
                        </h4>
                        <div className="flex items-center gap-1 text-gray-400 mb-1">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">{event.group_location || 'Localização não informada'}</span>
                        </div>
                        <p className="text-xs text-gray-400 font-medium mb-0.5">
                            Termina em: <span className="text-blue-500">{event.group_end_date || '--/--/----'}</span>
                            {event.group_days_remaining !== undefined && (
                                <span className="text-blue-500"> ({event.group_days_remaining} dias)</span>
                            )}
                        </p>
                        <p className="text-xs text-gray-900 font-bold">
                            Missão: {event.mission_name}
                        </p>
                    </div>
                </div>

                {/* Vertical Divider - Hidden on mobile/tablet */}
                <div className="hidden xl:block w-px h-16 bg-gray-100" />

                {/* Middle Section: Event Details */}
                <div className="flex-1 flex flex-col justify-center gap-4">
                    {event.event_type === 'flight' ? (
                        <div className="flex items-center justify-between gap-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Plane className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase leading-none mb-1">Voo</p>
                                    <p className="text-sm font-bold text-gray-900 leading-none">{event.flight_number || 'AD 0000'}</p>
                                </div>
                            </div>

                            <div className="flex-1 flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-xl font-bold text-gray-900 leading-none mb-1">{event.origin || '---'}</p>
                                    <p className="text-[10px] text-gray-400 font-medium truncate max-w-[120px]">{event.origin_full || 'Origem'}</p>
                                </div>
                                <div className="flex-1 flex flex-col items-center gap-1">
                                    <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full">
                                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                                        <span className="text-xs font-bold text-gray-900">
                                            {formatTime(event.time_start)} - {event.time_end ? formatTime(event.time_end) : '--:--'}
                                        </span>
                                    </div>
                                    <div className="w-full h-px bg-gray-100 relative">
                                        <Plane className="w-3 h-3 text-blue-500 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-gray-900 leading-none mb-1">{event.destination || '---'}</p>
                                    <p className="text-[10px] text-gray-400 font-medium truncate max-w-[120px]">{event.destination_full || 'Destino'}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between gap-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    {event.event_type === 'food' ? (
                                        <Coffee className="w-5 h-5 text-blue-600" />
                                    ) : (
                                        <MapPin className="w-5 h-5 text-blue-600" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase leading-none mb-1">
                                        {event.event_type === 'food' ? 'Café' : 'Evento'}
                                    </p>
                                    <p className="text-sm font-bold text-gray-900 leading-none">{event.title}</p>
                                </div>
                            </div>

                            <div className="flex-1 flex items-center justify-end gap-6">
                                <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full">
                                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                                    <span className="text-xs font-bold text-gray-900">
                                        {formatTime(event.time_start)} - {event.time_end ? formatTime(event.time_end) : '--:--'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-400">
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span className="text-xs font-medium">{event.destination || event.group_location || 'Localização'}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Section: Action Button */}
                <div className="flex-shrink-0 ml-auto">
                    <Link href={`/grupos/${event.group_id}/itinerario`}>
                        <Button className="w-10 h-10 xl:w-12 xl:h-12 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 p-0 flex items-center justify-center transition-transform group-hover:scale-110">
                            <ArrowRight className="w-5 h-5 xl:w-6 xl:h-6 text-white -rotate-45" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
