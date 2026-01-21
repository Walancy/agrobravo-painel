import { Event } from "@/types/itinerary"

export async function deleteEventWithRelated(
    eventId: string,
    dayIndex: number,
    itinerary: any[],
    itineraryService: any
) {
    const dayEvents = itinerary[dayIndex].events
    const eventToDelete = dayEvents.find((e: Event) => e.id === eventId)

    if (!eventToDelete) return

    await itineraryService.deleteEvent(eventId)

    // Handle related events based on type
    if (eventToDelete.type === 'flight') {
        await handleFlightDeletion(eventToDelete, dayEvents, itineraryService)
    } else if (eventToDelete.type === 'hotel') {
        await handleHotelDeletion(eventToDelete, itinerary, itineraryService, eventId)
    } else if (eventToDelete.type === 'food' || eventToDelete.type === 'meal' || eventToDelete.type === 'leisure' || eventToDelete.type === 'visit' || eventToDelete.type === 'return') {
        await handleEventWithTransferDeletion(eventToDelete, dayEvents, itineraryService)
    } else if (eventToDelete.type === 'transfer') {
        await handleTransferDeletion(eventToDelete, dayEvents, itineraryService)
    }
}

async function handleFlightDeletion(
    flight: Event,
    dayEvents: Event[],
    itineraryService: any
) {
    if (!flight.hasTransfer) return

    const associatedTransfer = dayEvents.find(e =>
        e.type === 'transfer' &&
        (e.time === flight.toTime || e.time === flight.endTime)
    )

    if (associatedTransfer) {
        await itineraryService.deleteEvent(associatedTransfer.id)
    }
}

async function handleHotelDeletion(
    hotel: Event,
    itinerary: any[],
    itineraryService: any,
    deletedEventId: string
) {
    const hotelTitle = hotel.title
    const isCheckIn = hotel.subtitle === 'Check-in'
    const isCheckOut = hotel.subtitle === 'Check-out'

    const allRelatedEvents: { dayIndex: number; eventId: string }[] = []

    itinerary.forEach((day, dayIdx) => {
        day.events.forEach((event: Event) => {
            // Find paired check-in/check-out event
            if (event.type === 'hotel' && event.title === hotelTitle && event.id !== deletedEventId) {
                if ((isCheckIn && event.subtitle === 'Check-out') || (isCheckOut && event.subtitle === 'Check-in')) {
                    allRelatedEvents.push({ dayIndex: dayIdx, eventId: event.id })

                    // Also delete the transfer of the paired event if it exists
                    if (event.hasTransfer) {
                        const pairedTransfer = day.events.find((e: Event) =>
                            e.type === 'transfer' && e.time === event.time
                        )
                        if (pairedTransfer) {
                            allRelatedEvents.push({ dayIndex: dayIdx, eventId: pairedTransfer.id })
                        }
                    }
                }
            }

            // Find associated transfers (legacy check, might be redundant with above but keeps safety)
            if (event.type === 'transfer' && event.title === 'Transferência') {
                const hotelEvent = day.events.find((e: Event) =>
                    e.type === 'hotel' &&
                    e.title === hotelTitle &&
                    e.hasTransfer &&
                    e.time === event.time &&
                    e.id !== deletedEventId // Ensure we don't double count if we already found it via the paired logic
                )
                // Only add if not already added (simple check)
                if (hotelEvent && !allRelatedEvents.some(r => r.eventId === event.id)) {
                    allRelatedEvents.push({ dayIndex: dayIdx, eventId: event.id })
                }
            }
        })
    })

    // Delete all related events
    for (const relatedEvent of allRelatedEvents) {
        await itineraryService.deleteEvent(relatedEvent.eventId)
    }

    // Delete transfer of the currently deleted event if exists
    if (hotel.hasTransfer) {
        const dayEvents = itinerary.find((_, idx) =>
            itinerary[idx].events.some((e: Event) => e.id === deletedEventId)
        )?.events || []

        const associatedTransfer = dayEvents.find((e: Event) =>
            e.type === 'transfer' && e.time === hotel.time
        )

        if (associatedTransfer) {
            await itineraryService.deleteEvent(associatedTransfer.id)
        }
    }
}

async function handleEventWithTransferDeletion(
    event: Event,
    dayEvents: Event[],
    itineraryService: any
) {
    if (!event.hasTransfer) return

    let associatedTransfer: Event | undefined

    if (event.transferTime) {
        associatedTransfer = dayEvents.find(e =>
            e.type === 'transfer' &&
            e.time === event.transferTime
        )
    }

    if (!associatedTransfer) {
        // Fallback for legacy events or if transferTime is missing
        associatedTransfer = dayEvents.find(e =>
            e.type === 'transfer' &&
            e.time === event.time
        )
    }

    if (associatedTransfer) {
        await itineraryService.deleteEvent(associatedTransfer.id)
    }
}

async function handleTransferDeletion(
    transfer: Event,
    dayEvents: Event[],
    itineraryService: any
) {
    // Find associated flight
    const associatedFlight = dayEvents.find(e =>
        e.type === 'flight' &&
        e.hasTransfer === true &&
        (e.toTime === transfer.time || e.endTime === transfer.time)
    )

    if (associatedFlight) {
        await itineraryService.updateEvent(associatedFlight.id, {
            possui_transfer: false
        })
        return
    }

    // Find associated hotel
    const associatedHotel = dayEvents.find(e =>
        e.type === 'hotel' &&
        e.hasTransfer === true &&
        e.time === transfer.time
    )

    if (associatedHotel) {
        await itineraryService.updateEvent(associatedHotel.id, {
            possui_transfer: false
        })
        return
    }

    // Find associated food
    const associatedFood = dayEvents.find(e =>
        e.type === 'food' &&
        e.hasTransfer === true &&
        e.time === transfer.time
    )

    if (associatedFood) {
        await itineraryService.updateEvent(associatedFood.id, {
            possui_transfer: false
        })
        return
    }

    // Find associated leisure
    const associatedLeisure = dayEvents.find(e =>
        e.type === 'leisure' &&
        e.hasTransfer === true &&
        e.time === transfer.time
    )

    if (associatedLeisure) {
        await itineraryService.updateEvent(associatedLeisure.id, {
            possui_transfer: false
        })
        return
    }

    // Find associated visit
    const associatedVisit = dayEvents.find(e =>
        e.type === 'visit' &&
        e.hasTransfer === true &&
        e.time === transfer.time
    )

    if (associatedVisit) {
        await itineraryService.updateEvent(associatedVisit.id, {
            possui_transfer: false
        })
    }
}
