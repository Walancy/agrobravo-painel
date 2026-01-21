import { useEffect } from "react"
import { DayItinerary } from "@/types/itinerary"
import { hasTripConflicts } from "@/lib/itineraryUtils"

interface UseConflictDetectionProps {
    itinerary: DayItinerary[]
    onConflictChange?: (hasConflict: boolean) => void
}

export function useConflictDetection({ itinerary, onConflictChange }: UseConflictDetectionProps) {
    useEffect(() => {
        if (!onConflictChange) return

        const hasConflict = itinerary.some(day =>
            hasTripConflicts(day.events) || day.events.some(event => event.isDelayed)
        )

        onConflictChange(hasConflict)
    }, [itinerary, onConflictChange])
}
