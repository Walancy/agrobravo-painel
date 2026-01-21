import { DayItinerary, Event } from "@/types/itinerary"
import { deleteEventWithRelated } from "../utils/deleteEventHelpers"
import { mapEventToDatabase, handleTransferDeletion, handleFlightTransferDeletion } from "../utils/eventMappers"

interface UseItineraryActionsProps {
    groupId?: string
    itinerary: DayItinerary[]
    setItinerary: React.Dispatch<React.SetStateAction<DayItinerary[]>>
    isLoading: boolean
    fetchItineraryData: () => Promise<void>
    activeDayIndex: number
    editingEvent: Event | null
    closeAllEditModals: () => void
}

export function useItineraryActions({
    groupId,
    itinerary,
    setItinerary,
    isLoading,
    fetchItineraryData,
    activeDayIndex,
    editingEvent,
    closeAllEditModals
}: UseItineraryActionsProps) {

    const handleSaveEvent = async (newEvents: Event[]) => {
        if (!groupId || isLoading) return

        try {
            const { itineraryService } = await import("@/services/itineraryService")
            const dayDate = itinerary[activeDayIndex].date

            for (const event of newEvents) {
                const eventData = mapEventToDatabase(event, groupId, dayDate)
                await itineraryService.createEvent(eventData)
            }

            await fetchItineraryData()
        } catch (error) {
            console.error("Failed to save events:", error)
        }
    }

    const handleEditEventSave = async (updatedEvents: Event | Event[]) => {
        if (!groupId || isLoading) return

        const eventsToProcess = Array.isArray(updatedEvents) ? updatedEvents : [updatedEvents]

        try {
            const { itineraryService } = await import("@/services/itineraryService")
            const dayDate = itinerary[activeDayIndex].date
            const allEvents = itinerary.flatMap(d => d.events)

            // Process all events
            for (const updatedEvent of eventsToProcess) {
                const eventData = mapEventToDatabase(updatedEvent, groupId, dayDate)

                // Find existing event across all days
                const existingEvent = allEvents.find(e => e.id === updatedEvent.id)

                if (existingEvent) {
                    // Handle transfer deletion if transfer was unchecked
                    if (existingEvent.hasTransfer && !updatedEvent.hasTransfer) {
                        if (updatedEvent.type === 'flight') {
                            await handleFlightTransferDeletion(existingEvent, updatedEvent, allEvents, itineraryService)
                        } else if (['visit', 'hotel', 'food', 'leisure', 'return'].includes(updatedEvent.type)) {
                            await handleTransferDeletion(existingEvent, updatedEvent, allEvents, itineraryService)
                        }
                    }

                    // Update the event
                    await itineraryService.updateEvent(updatedEvent.id, eventData)
                } else if (updatedEvent.type === 'transfer') {
                    // Check if a transfer already exists for this event
                    let existingTransfer: Event | undefined

                    // We need to know which event this transfer belongs to.
                    // Usually it's the 'editingEvent' or one of the events in 'eventsToProcess'.
                    // But 'eventsToProcess' might contain the transfer itself.

                    // Heuristic: Try to find a transfer at the same time/location in allEvents
                    // This is risky if we have multiple similar transfers.
                    // But if we are here, it means we didn't find the transfer by ID (so it's new or we lost the ID).

                    // If we are editing a flight, check arrival time
                    if (editingEvent?.type === 'flight') {
                        const mainFlight = eventsToProcess.find(e => e.type === 'flight') || editingEvent;
                        const arrivalTime = mainFlight.toTime || mainFlight.endTime;
                        existingTransfer = allEvents.find(e =>
                            e.type === 'transfer' &&
                            (e.time === arrivalTime)
                        )
                    } else {
                        // For other events
                        // Try to match with any other event in the batch that might be the parent
                        const parentEvent = eventsToProcess.find(e => e.type !== 'transfer') || editingEvent;
                        if (parentEvent) {
                            const eventEndTime = parentEvent.endTime || parentEvent.toTime || parentEvent.time;
                            existingTransfer = allEvents.find(e =>
                                e.type === 'transfer' &&
                                (e.time === eventEndTime || e.time === parentEvent.time) &&
                                (e.location === parentEvent.location || e.location === parentEvent.title)
                            )
                        }
                    }

                    if (existingTransfer) {
                        // Update existing transfer
                        await itineraryService.updateEvent(existingTransfer.id, eventData)
                    } else {
                        // Create new transfer
                        await itineraryService.createEvent(eventData)
                    }
                } else {
                    // Create other new events
                    await itineraryService.createEvent(eventData)
                }
            }

            await fetchItineraryData()
            closeAllEditModals()
        } catch (error) {
            console.error("Failed to update events:", error)
        }
    }

    const handleDeleteEvent = async (eventId: string, dayIndex: number) => {
        if (!groupId) return

        try {
            const { itineraryService } = await import("@/services/itineraryService")
            await deleteEventWithRelated(eventId, dayIndex, itinerary, itineraryService)
            await fetchItineraryData()
        } catch (error) {
            console.error("Failed to delete event:", error)
        }
    }

    const handleFavoriteToggle = async (dayIndex: number, eventId: string) => {
        if (!groupId) return

        const event = itinerary[dayIndex].events.find(e => e.id === eventId)
        if (!event) return

        try {
            const { itineraryService } = await import("@/services/itineraryService")
            await itineraryService.updateEvent(eventId, {
                favorito: !event.isFavorite
            })

            // Optimistic update
            setItinerary(prev => {
                const newItinerary = [...prev]
                const day = { ...newItinerary[dayIndex] }
                day.events = day.events.map(e => {
                    if (e.id === eventId) {
                        return { ...e, isFavorite: !e.isFavorite }
                    }
                    return e
                })
                newItinerary[dayIndex] = day
                return newItinerary
            })
        } catch (error) {
            console.error("Failed to toggle favorite:", error)
        }
    }

    return {
        handleSaveEvent,
        handleEditEventSave,
        handleDeleteEvent,
        handleFavoriteToggle
    }
}
