import { Event } from "@/types/itinerary"

interface EventData {
    grupo_id: string
    tipo: string
    titulo: string
    subtitulo?: string
    data: string
    hora_inicio?: string
    hora_fim?: string
    duracao?: string
    preco?: string
    status?: 'confirmed' | 'quoting' | 'quoted' | 'free'
    localizacao?: string
    de?: string
    para?: string
    codigo_de?: string
    codigo_para?: string
    hora_de?: string
    hora_para?: string
    motorista?: string
    logos?: string[]
    atrasado?: boolean
    atraso?: string
    favorito?: boolean
    descricao?: string
    passageiros?: string[]
    possui_transfer?: boolean
    site_url?: string
    evento_referencia_id?: string
    transfer_data?: string
    transfer_hora?: string
}

export function mapEventToDatabase(event: Event, groupId: string, dayDate: string): EventData {
    return {
        grupo_id: groupId,
        tipo: event.type,
        titulo: event.title,
        subtitulo: event.subtitle,
        data: event.date
            ? (event.date.replace(/\s/g, '').includes('/') ? event.date.replace(/\s/g, '').split('/').reverse().join('-') : event.date.replace(/\s/g, ''))
            : dayDate.replace(/\s/g, '').split('/').reverse().join('-'),
        hora_inicio: event.time,
        hora_fim: event.endTime,
        duracao: event.duration,
        preco: event.price,
        status: event.status,
        localizacao: event.location,
        de: event.from,
        para: event.to,
        codigo_de: event.fromCode,
        codigo_para: event.toCode,
        hora_de: event.fromTime,
        hora_para: event.toTime,
        motorista: event.driver,
        logos: event.logos,
        atrasado: event.isDelayed,
        atraso: event.delay,
        favorito: event.isFavorite,
        descricao: event.description,
        passageiros: (event.passengers || []).map(p => String(p)),
        possui_transfer: event.hasTransfer,
        site_url: event.site_url || event.location,
        evento_referencia_id: event.referenceEventId,
        transfer_data: event.transferDate
            ? (event.transferDate.replace(/\s/g, '').includes('/') ? event.transferDate.replace(/\s/g, '').split('/').reverse().join('-') : event.transferDate.replace(/\s/g, ''))
            : undefined,
        transfer_hora: event.transferTime
    }
}

export async function handleTransferDeletion(
    editingEvent: Event,
    updatedEvent: Event,
    dayEvents: Event[],
    itineraryService: any
) {
    if (!editingEvent.hasTransfer || updatedEvent.hasTransfer) return

    const associatedTransfer = dayEvents.find(e =>
        e.type === 'transfer' &&
        e.time === editingEvent.time &&
        (e.location === editingEvent.location || e.location === editingEvent.title)
    )

    if (associatedTransfer) {
        await itineraryService.deleteEvent(associatedTransfer.id)
    }
}

export async function handleFlightTransferDeletion(
    editingEvent: Event,
    updatedEvent: Event,
    dayEvents: Event[],
    itineraryService: any
) {
    if (!editingEvent.hasTransfer || updatedEvent.hasTransfer) return

    const associatedTransfer = dayEvents.find(e =>
        e.type === 'transfer' &&
        (e.time === editingEvent.toTime || e.time === editingEvent.endTime)
    )

    if (associatedTransfer) {
        await itineraryService.deleteEvent(associatedTransfer.id)
    }
}
