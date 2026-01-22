import { useState, useCallback } from "react"
import { DayItinerary, Event, EventType } from "@/types/itinerary"
import { addDays, format, differenceInDays } from "date-fns"
import { ptBR } from "date-fns/locale"

interface UseItineraryDataProps {
    groupId?: string
    isEmpty?: boolean
    startDate?: string
    endDate?: string
}

export function useItineraryData({ groupId, isEmpty, startDate, endDate }: UseItineraryDataProps) {
    const [itinerary, setItinerary] = useState<DayItinerary[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const fetchItineraryData = useCallback(async () => {
        const eventsByDate = new Map<string, Event[]>()

        // Fetch events from database
        if (groupId && groupId !== 'new' && !isEmpty) {
            try {
                setIsLoading(true)
                const { itineraryService } = await import("@/services/itineraryService")
                const events = await itineraryService.getEventsByGroupId(groupId)

                events.forEach((dbEvent: any) => {
                    const mappedEvent: Event = {
                        id: dbEvent.id,
                        time: dbEvent.hora_inicio,
                        endTime: dbEvent.hora_fim,
                        type: dbEvent.tipo as EventType,
                        title: dbEvent.titulo,
                        subtitle: dbEvent.subtitulo,
                        price: dbEvent.preco,
                        status: dbEvent.status,
                        location: dbEvent.localizacao,
                        from: dbEvent.de,
                        to: dbEvent.para,
                        fromCode: dbEvent.codigo_de,
                        toCode: dbEvent.codigo_para,
                        fromTime: dbEvent.hora_de,
                        toTime: dbEvent.hora_para,
                        driver: dbEvent.motorista,
                        duration: dbEvent.duracao,
                        logos: dbEvent.logos,
                        groupLogos: dbEvent.groupLogos,  // ← ADICIONADO!
                        isDelayed: dbEvent.atrasado,
                        delay: dbEvent.atraso,
                        isFavorite: dbEvent.favorito,
                        description: dbEvent.descricao,
                        passengers: dbEvent.passageiros,
                        date: dbEvent.data,
                        hasTransfer: dbEvent.possui_transfer,
                        site_url: dbEvent.site_url,
                        referenceEventId: dbEvent.evento_referencia_id,
                        transferDate: dbEvent.transfer_data,
                        transferTime: dbEvent.transfer_hora,
                        connections: dbEvent.conexoes
                    }

                    const dateKey = dbEvent.data
                    if (!eventsByDate.has(dateKey)) {
                        eventsByDate.set(dateKey, [])
                    }
                    eventsByDate.get(dateKey)!.push(mappedEvent)
                })
            } catch (error) {
                console.error("Failed to fetch itinerary:", error)
            } finally {
                setIsLoading(false)
            }
        }

        // Generate itinerary structure
        const newItinerary: DayItinerary[] = []

        if (startDate && endDate) {
            try {
                let startStr = String(startDate).split('T')[0]
                let endStr = String(endDate).split('T')[0]

                // Handle DD/MM/YYYY format if present
                if (startStr.includes('/')) startStr = startStr.split('/').reverse().join('-')
                if (endStr.includes('/')) endStr = endStr.split('/').reverse().join('-')

                const start = new Date(startStr + 'T12:00:00')
                const end = new Date(endStr + 'T12:00:00')

                if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                    throw new Error(`Invalid dates: ${startStr}, ${endStr}`)
                }

                const daysCount = differenceInDays(end, start) + 1

                if (daysCount > 0) {
                    for (let i = 0; i < daysCount; i++) {
                        const currentDate = addDays(start, i)
                        const formattedDate = format(currentDate, 'dd / MM / yyyy')
                        const dateKey = format(currentDate, 'yyyy-MM-dd')
                        const dayOfWeek = format(currentDate, 'EEEE', { locale: ptBR })
                        const capitalizedDayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)

                        const dayEvents = eventsByDate.get(dateKey) || []
                        const sortedEvents = sortEventsByTime(dayEvents)

                        newItinerary.push({
                            date: formattedDate,
                            dayOfWeek: capitalizedDayOfWeek,
                            totalExpenses: "R$ 0,00",
                            isToday: false,
                            events: sortedEvents
                        })
                    }
                }
            } catch (err) {
                console.error("Error generating itinerary:", err)
            }
        }

        setItinerary(newItinerary)
    }, [groupId, isEmpty, startDate, endDate])

    return {
        itinerary,
        setItinerary,
        isLoading,
        fetchItineraryData
    }
}

function sortEventsByTime(events: Event[]): Event[] {
    return [...events].sort((a, b) => {
        const timeA = a.time || "00:00"
        const timeB = b.time || "00:00"
        const timeCompare = timeA.localeCompare(timeB)

        if (timeCompare !== 0) return timeCompare

        // Tie-breaker: Hotel before Transfer
        if (a.type === 'hotel' && b.type === 'transfer') return -1
        if (a.type === 'transfer' && b.type === 'hotel') return 1

        // Tie-breaker: Transfer before Return
        if (a.type === 'transfer' && b.type === 'return') return -1
        if (a.type === 'return' && b.type === 'transfer') return 1

        return 0
    })
}
