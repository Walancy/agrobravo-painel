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

// Helper to normalize dates for comparison
function normalizeDate(dateStr?: string): string {
    if (!dateStr) return '';
    const cleanStr = dateStr.replace(/\s/g, '');
    if (cleanStr.includes('/')) return cleanStr.split('/').reverse().join('-');
    return cleanStr;
}

// Helper to find a transfer event
function findTransferEvent(itinerary: any[], targetDate: string | undefined, targetTime: string | undefined, fallbackDate: string): { event: Event, dayIndex: number } | null {
    if (!targetTime) return null;

    const searchDate = normalizeDate(targetDate || fallbackDate);

    for (let i = 0; i < itinerary.length; i++) {
        const day = itinerary[i];
        const dayDate = normalizeDate(day.date);

        if (dayDate !== searchDate) continue;

        // Try to find transfer by exact time first
        const found = day.events.find((e: Event) =>
            e.type === 'transfer' &&
            e.time === targetTime
        );

        if (found) return { event: found, dayIndex: i };
    }
    return null;
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
                        const transferTime = event.transferTime || event.time
                        const transferDate = event.transferDate || event.date

                        // Use day.date as fallback because event.date might be missing in some contexts
                        const result = findTransferEvent(itinerary, transferDate, transferTime, day.date);
                        if (result) {
                            allRelatedEvents.push({ dayIndex: result.dayIndex, eventId: result.event.id })
                        }
                    }
                }
            }

            // Find associated transfers (legacy check for same-title transfers not linked by structure)
            if (event.type === 'transfer' && event.title === 'Transferência') {
                const hotelEvent = day.events.find((e: Event) =>
                    e.type === 'hotel' &&
                    e.title === hotelTitle &&
                    e.hasTransfer &&
                    ((e.transferTime && e.transferTime === event.time) || (!e.transferTime && e.time === event.time)) &&
                    e.id !== deletedEventId
                )
                if (hotelEvent && !allRelatedEvents.some(r => r.eventId === event.id)) {
                    allRelatedEvents.push({ dayIndex: dayIdx, eventId: event.id })
                }
            }
        })
    })

    // Delete all related events
    for (const relatedEvent of allRelatedEvents) {
        // Prevent double deletion calls if ID matches multiple times
        await itineraryService.deleteEvent(relatedEvent.eventId)
    }

    // Delete transfer of the currently deleted event if exists
    if (hotel.hasTransfer) {
        const transferTime = hotel.transferTime || hotel.time
        const transferDate = hotel.transferDate || hotel.date

        // Find the day that contains the deleted event to get the correct date fallback
        const dayContainingHotel = itinerary.find(d => d.events.some((e: Event) => e.id === deletedEventId));
        const fallbackDate = dayContainingHotel?.date || hotel.date || '';

        const result = findTransferEvent(itinerary, transferDate, transferTime, fallbackDate);

        if (result && !allRelatedEvents.some(r => r.eventId === result.event.id)) {
            await itineraryService.deleteEvent(result.event.id)
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
        return
    }
}
