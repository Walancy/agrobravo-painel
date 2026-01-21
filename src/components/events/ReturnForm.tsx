"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeftRight, BedDouble, MapPin, Utensils, Sun } from "lucide-react"
import { checkTimeConflict, validateDateSelected } from "@/lib/eventValidation"
import { ConflictAlert } from "@/components/common/ConflictAlert"

import { Event } from "@/types/itinerary"
import { GroupAvatars } from "@/components/itinerary/GroupAvatars"

interface ReturnFormProps {
    onSave?: (events: Event[]) => void
    onCancel?: () => void
    persistedState?: any
    onPersistState?: (data: any) => void
    defaultDate?: string
    minDate?: string
    maxDate?: string
    existingEvents?: Event[]
    allItineraryEvents?: Event[]
    initialData?: Event
}

// Format time to HH:MM (remove seconds if present)
const formatTime = (time: string): string => {
    if (!time) return ''
    const parts = time.split(':')
    return `${parts[0]}:${parts[1]}`
}

export default function ReturnForm({
    onSave,
    onCancel,
    persistedState,
    onPersistState,
    defaultDate,
    minDate,
    maxDate,
    existingEvents = [],
    allItineraryEvents = [],
    initialData
}: ReturnFormProps) {
    const [selectedEventId, setSelectedEventId] = React.useState<string>(initialData?.referenceEventId || "")
    const [returnTime, setReturnTime] = React.useState<string>(initialData?.time ? formatTime(initialData.time) : "18:00")
    const [date, setDate] = React.useState<string>(initialData?.date || defaultDate || "")
    const [hasTransfer, setHasTransfer] = React.useState(initialData?.hasTransfer || false)
    const [transferTime, setTransferTime] = React.useState<string>("19:00")
    const [conflictInfo, setConflictInfo] = React.useState<{ hasConflict: boolean; message: string; conflictingEvents: Event[] }>({
        hasConflict: false,
        message: '',
        conflictingEvents: []
    })

    // Filter events that can have returns (hotel, visit, food, leisure)
    const returnableEvents = React.useMemo(() => {
        return existingEvents.filter(event =>
            ['hotel', 'visit', 'food', 'meal', 'leisure'].includes(event.type)
        )
    }, [existingEvents])

    // Get icon for event type
    const getEventIcon = (type: string) => {
        switch (type) {
            case 'hotel':
                return BedDouble
            case 'visit':
                return MapPin
            case 'food':
            case 'meal':
                return Utensils
            case 'leisure':
                return Sun
            default:
                return ArrowLeftRight
        }
    }

    // Get event type label
    const getEventTypeLabel = (type: string) => {
        switch (type) {
            case 'hotel':
                return 'Hotel'
            case 'visit':
                return 'Visita'
            case 'food':
            case 'meal':
                return 'Alimentação'
            case 'leisure':
                return 'Livre'
            default:
                return type
        }
    }

    // Sync state with initialData
    React.useEffect(() => {
        if (initialData) {
            setSelectedEventId(initialData.referenceEventId || "")
            setReturnTime(initialData.time ? formatTime(initialData.time) : "18:00")
            setDate(initialData.date || defaultDate || "")
            setHasTransfer(initialData.hasTransfer || false)

            // Find associated transfer event if it exists
            if (initialData.hasTransfer && existingEvents.length > 0) {
                // Look for a transfer event that matches the return event's date and is likely associated
                // Since we don't have a direct link ID, we look for a transfer at the same time or close to it?
                // Actually, the transfer logic in handleSave creates a transfer with `transferTime`.
                // But we don't store the transfer ID in the return event.
                // We can look for a transfer event that has the same location? Or just any transfer on that day?
                // Let's try to find a transfer event that matches the return event's time logic if possible.
                // But wait, the transfer time is separate.

                // In useItineraryActions, we find transfer by checking if it matches the event end time (for return, it's the return time).
                // But for return event, the transfer is usually TO the return location? 
                // The return event says "Return - Activity Title". Location is the activity location.
                // The transfer is "Transferência". Location is the activity location.

                // So we look for a transfer event with the same location and date.
                const transfer = existingEvents.find(e =>
                    e.type === 'transfer' &&
                    e.date === initialData.date &&
                    (e.location === initialData.location)
                )

                if (transfer) {
                    setTransferTime(formatTime(transfer.time))
                } else if (initialData.transferTime) {
                    setTransferTime(formatTime(initialData.transferTime))
                }
            }
        }
    }, [initialData, defaultDate, existingEvents])

    // Persist state changes
    React.useEffect(() => {
        if (onPersistState) {
            const timeoutId = setTimeout(() => {
                onPersistState({
                    selectedEventId,
                    returnTime,
                    date,
                    hasTransfer,
                    transferTime
                })
            }, 500)
            return () => clearTimeout(timeoutId)
        }
    }, [selectedEventId, returnTime, date, hasTransfer, transferTime, onPersistState])

    // Check for conflicts
    React.useEffect(() => {
        if (!existingEvents || !date || !returnTime) return

        const currentData = {
            date: date,
            time: returnTime,
            type: 'return' as const,
            id: initialData?.id
        }

        if (!validateDateSelected(currentData.date)) {
            setConflictInfo({ hasConflict: false, message: '', conflictingEvents: [] })
            return
        }

        let conflict = checkTimeConflict(currentData, existingEvents)

        // Check transfer conflict
        if (hasTransfer && transferTime) {
            const transferData = {
                date: date,
                time: transferTime,
                type: 'transfer' as const,
                // We don't have an ID for the new transfer yet, but checkTimeConflict skips existing transfers
            }
            const transferConflict = checkTimeConflict(transferData, existingEvents)

            if (transferConflict.hasConflict) {
                if (conflict.hasConflict) {
                    // Merge conflicts
                    // Deduplicate conflicting events
                    const allConflictingEvents = [...conflict.conflictingEvents]
                    transferConflict.conflictingEvents.forEach(e => {
                        if (!allConflictingEvents.find(existing => existing.id === e.id)) {
                            allConflictingEvents.push(e)
                        }
                    })

                    conflict = {
                        hasConflict: true,
                        conflictingEvents: allConflictingEvents,
                        message: `${conflict.message}. Transfer conflita com: ${transferConflict.conflictingEvents.map(e => e.title).join(', ')}`
                    }
                } else {
                    conflict = {
                        hasConflict: true,
                        conflictingEvents: transferConflict.conflictingEvents,
                        message: `Transfer conflita com: ${transferConflict.conflictingEvents.map(e => e.title).join(', ')}`
                    }
                }
            }
        }

        // Check if return time is before origin event time
        if (selectedEventId) {
            const originEvent = existingEvents.find(e => e.id === selectedEventId)
            if (originEvent) {
                const originTime = originEvent.time
                const originDate = originEvent.date

                // Normalize dates
                const normalize = (d: string) => d.includes('/') ? d.split('/').reverse().join('-') : d
                const currentD = normalize(date)
                const originD = normalize(originDate || date) // If origin has no date, assume same day

                if (currentD < originD) {
                    conflict = {
                        hasConflict: true,
                        conflictingEvents: [],
                        message: 'A data de retorno não pode ser anterior à data da atividade de origem.'
                    }
                } else if (currentD === originD && returnTime < originTime) {
                    conflict = {
                        hasConflict: true,
                        conflictingEvents: [],
                        message: 'O horário de retorno não pode ser anterior ao horário da atividade de origem.'
                    }
                }

                // Special check for Hotel: cannot return after check-out
                if (originEvent.type === 'hotel') {
                    // Find associated check-out event using all available events to cover cross-day scenarios
                    const eventsToSearch = allItineraryEvents.length > 0 ? allItineraryEvents : existingEvents
                    const checkOutEvent = eventsToSearch.find(e =>
                        e.type === 'hotel' &&
                        e.title === originEvent.title &&
                        e.subtitle === 'Check-out'
                    )

                    if (checkOutEvent && checkOutEvent.date) {
                        const checkOutD = normalize(checkOutEvent.date)
                        const checkOutTime = checkOutEvent.time

                        if (currentD > checkOutD) {
                            conflict = {
                                hasConflict: true,
                                conflictingEvents: [],
                                message: 'A data de retorno não pode ser posterior ao check-out do hotel.'
                            }
                        } else if (currentD === checkOutD && returnTime > checkOutTime) {
                            conflict = {
                                hasConflict: true,
                                conflictingEvents: [],
                                message: 'O horário de retorno não pode ser posterior ao horário de check-out do hotel.'
                            }
                        }
                    }
                }
            }
        }

        setConflictInfo(conflict)
    }, [returnTime, date, existingEvents, initialData?.id, hasTransfer, transferTime, selectedEventId])

    const handleSave = () => {
        if (!onSave || !selectedEventId || !date) return

        const selectedEvent = returnableEvents.find(e => e.id === selectedEventId)
        if (!selectedEvent) return

        const events: Event[] = []

        // Create return event
        const returnEvent: Event = {
            id: initialData?.id || Math.random().toString(36).substr(2, 9),
            time: returnTime,
            type: 'return',
            title: `Retorno - ${selectedEvent.title}`,
            subtitle: `Retorno ao ${getEventTypeLabel(selectedEvent.type)}`,
            location: selectedEvent.location,
            date: date ? (date.includes('/') ? date.split('/').map(p => p.trim()).reverse().join('-') : date.trim()) : '',
            referenceEventId: selectedEventId,
            status: 'confirmed',
            hasTransfer: hasTransfer,
            transferTime: hasTransfer ? transferTime : undefined,
            groupLogos: selectedEvent.groupLogos,
            passengers: selectedEvent.passengers
        }
        events.push(returnEvent)

        // Create transfer event if selected
        if (hasTransfer) {
            const transferEvent: any = {
                id: Math.random().toString(36).substr(2, 9),
                time: transferTime,
                type: 'transfer',
                title: 'Transferência',
                subtitle: 'Transporte',
                location: selectedEvent.location,
                driver: 'David Príncipe',
                duration: '1h 00 min',
                logos: [],
                status: 'confirmed',
                date: date ? (date.includes('/') ? date.split('/').map(p => p.trim()).reverse().join('-') : date.trim()) : '',
                passengers: selectedEvent.passengers,
                groupLogos: selectedEvent.groupLogos
            }
            events.push(transferEvent)
        }

        onSave(events)
    }

    const selectedEvent = returnableEvents.find(e => e.id === selectedEventId)

    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-1 overflow-hidden p-6">
                {/* Left Column - Form Fields */}
                <div className="w-1/2 flex flex-col gap-5 overflow-y-auto pr-8 pl-1 py-1">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs text-gray-500">Dia do evento*</Label>
                            <div className="relative">
                                <Input
                                    type="date"
                                    value={date ? (date.includes('/') ? date.split('/').map(p => p.trim()).reverse().join('-') : date.trim()) : ''}
                                    onChange={(e) => setDate(e.target.value.includes('-') ? e.target.value.split('-').map(p => p.trim()).reverse().join('/') : e.target.value.split('/').map(p => p.trim()).join('/'))}
                                    min={minDate}
                                    max={maxDate}
                                    className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-gray-500">Horário de Retorno*</Label>
                            <div className="relative">
                                <Input
                                    type="time"
                                    value={returnTime}
                                    onChange={(e) => setReturnTime(e.target.value)}
                                    className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                                />
                            </div>
                        </div>
                    </div>

                    <ConflictAlert conflictingEvents={conflictInfo.conflictingEvents} message={conflictInfo.message} />

                    <div className="space-y-1.5">
                        <Label className="text-xs text-gray-500">Atividade de Origem*</Label>
                        <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                            <SelectTrigger className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none">
                                <SelectValue placeholder="Selecione a atividade" />
                            </SelectTrigger>
                            <SelectContent>
                                {returnableEvents.length === 0 ? (
                                    <div className="p-4 text-sm text-gray-500 text-center">
                                        Nenhuma atividade disponível para retorno
                                    </div>
                                ) : (
                                    returnableEvents.map((event) => {
                                        const Icon = getEventIcon(event.type)
                                        return (
                                            <SelectItem key={event.id} value={event.id}>
                                                <div className="flex items-center gap-2">
                                                    <Icon className="w-4 h-4 text-gray-500" />
                                                    <span>{event.title}</span>
                                                    <span className="text-xs text-gray-400">
                                                        ({formatTime(event.time)})
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        )
                                    })
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">Possui transfer</span>
                            <Checkbox
                                checked={hasTransfer}
                                onCheckedChange={(checked) => {
                                    setHasTransfer(checked as boolean)
                                    if (checked && returnTime) {
                                        const [hours, minutes] = returnTime.split(':').map(Number)
                                        const date = new Date()
                                        date.setHours(hours)
                                        date.setMinutes(minutes)
                                        date.setHours(date.getHours() + 1)
                                        const newHours = String(date.getHours()).padStart(2, '0')
                                        const newMinutes = String(date.getMinutes()).padStart(2, '0')
                                        setTransferTime(`${newHours}:${newMinutes}`)
                                    }
                                }}
                                className="w-5 h-5 rounded border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 shadow-none"
                            />
                        </div>
                    </div>

                    {hasTransfer && (
                        <div className="space-y-1.5">
                            <Label className="text-xs text-gray-500">Horário do Transfer</Label>
                            <div className="relative">
                                <Input
                                    type="time"
                                    value={transferTime}
                                    onChange={(e) => setTransferTime(e.target.value)}
                                    className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Event Preview */}
                <div className="w-1/2 flex flex-col pl-8 border-l border-gray-100">
                    <div className="mb-6">
                        <h3 className="font-medium text-gray-900 mb-2">Evento selecionado:</h3>
                        <p className="text-xs text-gray-500">
                            {selectedEvent
                                ? "Você retornará para este local/atividade"
                                : "Selecione uma atividade para ver os detalhes"}
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2">
                        {selectedEvent ? (
                            <div className="bg-gray-50 rounded-2xl p-4 border border-blue-200 bg-blue-50/50">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="w-16 h-16 rounded-xl border border-gray-100 shrink-0 bg-white flex items-center justify-center">
                                            {React.createElement(getEventIcon(selectedEvent.type), {
                                                className: "w-8 h-8 text-blue-600"
                                            })}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <h3 className="font-semibold text-gray-900 text-base leading-tight line-clamp-2">
                                                    {selectedEvent.title}
                                                </h3>
                                            </div>

                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <div className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
                                                        {formatTime(selectedEvent.time)}
                                                    </div>
                                                    <span className="font-medium text-gray-700">
                                                        {getEventTypeLabel(selectedEvent.type)}
                                                    </span>
                                                </div>
                                                <GroupAvatars event={selectedEvent} maxDisplay={3} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-1 ml-4">
                                        {returnTime && (
                                            <div className="text-right">
                                                <span className="block font-bold text-blue-600 text-lg">
                                                    {formatTime(returnTime)}
                                                </span>
                                                <span className="text-xs text-gray-400">retorno</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {selectedEvent.location && (
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                        <div className="flex items-start gap-2 text-xs text-gray-600">
                                            <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                            <span className="break-words flex-1">{selectedEvent.location}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <div className="bg-blue-100 rounded-lg p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <ArrowLeftRight className="w-4 h-4 text-blue-600" />
                                            <span className="text-xs font-semibold text-gray-900">Informações do Retorno</span>
                                        </div>
                                        <div className="space-y-1.5 text-xs">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Horário original:</span>
                                                <span className="font-medium text-gray-900">{formatTime(selectedEvent.time)}</span>
                                            </div>
                                            {returnTime && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Horário de retorno:</span>
                                                    <span className="font-medium text-blue-600">{formatTime(returnTime)}</span>
                                                </div>
                                            )}
                                            {hasTransfer && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Transfer:</span>
                                                    <span className="font-medium text-gray-900">{formatTime(transferTime)}</span>
                                                </div>
                                            )}
                                            {selectedEvent.date && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Data:</span>
                                                    <span className="font-medium text-gray-900">{selectedEvent.date}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50 rounded-2xl p-8 border border-gray-100">
                                <ArrowLeftRight className="w-16 h-16 mb-4 opacity-20" />
                                <p className="text-sm text-center font-medium">
                                    Nenhum evento selecionado
                                </p>
                                <p className="text-xs text-center mt-1">
                                    Escolha uma atividade à esquerda
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 h-12 rounded-xl border-blue-600 text-blue-600 hover:bg-blue-50 font-medium"
                                onClick={onCancel}
                            >
                                Cancelar
                            </Button>
                            <Button
                                className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium"
                                disabled={!selectedEventId || !date || conflictInfo.hasConflict || !validateDateSelected(date)}
                                onClick={handleSave}
                            >
                                Salvar
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
