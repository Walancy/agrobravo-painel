import { Event } from "@/types/itinerary"

// Helper to normalize date to YYYY-MM-DD
function normalizeDate(dateStr: string): string {
    if (!dateStr) return '';
    const cleanDate = dateStr.replace(/\s/g, '');
    if (cleanDate.includes('/')) {
        // Assume DD/MM/YYYY
        const parts = cleanDate.split('/');
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
    }
    return cleanDate;
}

export interface TimeConflict {
    hasConflict: boolean
    conflictingEvents: Event[]
    message: string
}

/**
 * Checks if a new event conflicts with existing events on the same day
 * @param newEvent - The event to check
 * @param existingEvents - Array of existing events on the same day
 * @returns TimeConflict object with conflict information
 */
export function checkTimeConflict(
    newEvent: { time: string; endTime?: string; toTime?: string; type: string; date?: string; id?: string },
    existingEvents: Event[]
): TimeConflict {
    const parseTime = (timeStr: string): number => {
        if (!timeStr) return 0
        const [h, m] = timeStr.split(':').map(Number)
        return h * 60 + m
    }

    const newStartMin = parseTime(newEvent.time)
    const newEndTimeStr = newEvent.endTime || newEvent.toTime
    let newEndMin = newEndTimeStr ? parseTime(newEndTimeStr) : newStartMin + 60 // Default 1 hour if no end time

    // Handle overnight events
    if (newEndMin < newStartMin) {
        newEndMin += 24 * 60
    }

    const conflictingEvents: Event[] = []
    const newEventDate = normalizeDate(newEvent.date || '');

    // If no date is provided for the new event, we cannot determine conflicts reliably
    if (!newEventDate) {
        return {
            hasConflict: false,
            conflictingEvents: [],
            message: ''
        }
    }

    for (const existingEvent of existingEvents) {
        // Skip same event if editing
        if (newEvent.id && existingEvent.id === newEvent.id) continue;

        // Skip transfer events in conflict check as they're usually short
        if (existingEvent.type === 'transfer') continue

        // Skip events on different dates
        if (newEventDate && existingEvent.date) {
            const existingDate = normalizeDate(existingEvent.date);
            if (newEventDate !== existingDate) continue;
        }

        const existingStartMin = parseTime(existingEvent.time)
        const existingEndTimeStr = existingEvent.endTime || existingEvent.toTime
        let existingEndMin = existingEndTimeStr ? parseTime(existingEndTimeStr) : existingStartMin + 60

        // Handle overnight events
        if (existingEndMin < existingStartMin) {
            existingEndMin += 24 * 60
        }

        // Check for overlap
        // Events overlap if: (newStart < existingEnd) AND (newEnd > existingStart)
        const hasOverlap = (newStartMin < existingEndMin) && (newEndMin > existingStartMin)

        if (hasOverlap) {
            conflictingEvents.push(existingEvent)
        }
    }

    if (conflictingEvents.length > 0) {
        const eventTitles = conflictingEvents.map(e => e.title).join(', ')
        return {
            hasConflict: true,
            conflictingEvents,
            message: `Este evento conflita com: ${eventTitles}`
        }
    }

    return {
        hasConflict: false,
        conflictingEvents: [],
        message: ''
    }
}

/**
 * Validates if a date is selected
 * @param date - The date string to validate
 * @returns boolean indicating if date is valid
 */
export function validateDateSelected(date: string | undefined): boolean {
    if (!date) return false
    if (date.trim() === '') return false
    return true
}
