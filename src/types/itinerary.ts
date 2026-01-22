export type EventType = 'flight' | 'transfer' | 'food' | 'meal' | 'hotel' | 'visit' | 'ai_recommendation' | 'leisure' | 'checkout' | 'return';

export interface Event {
    id: string
    time: string
    endTime?: string
    type: EventType
    title: string
    subtitle?: string
    price?: string
    status?: 'confirmed' | 'quoting' | 'quoted' | 'free'
    location?: string
    from?: string
    to?: string
    fromCode?: string
    toCode?: string
    fromTime?: string
    toTime?: string
    driver?: string
    duration?: string
    logos?: string[]
    groupLogos?: string[]  // Logos of groups that have participants in this event
    isDelayed?: boolean
    delay?: string
    isFavorite?: boolean
    description?: string
    passengers?: (string | number)[]
    date?: string
    hasTransfer?: boolean
    site_url?: string
    referenceEventId?: string  // For return activities - references the original event
    transferDate?: string
    transferTime?: string
    city?: string
    country?: string
    connections?: {
        airline: string
        flightNumber: string
        origin: { code: string, time: string }
        destination: { code: string, time: string }
        duration: string
        layoverDuration: string
        planeType?: string
    }[]
}

export interface DayItinerary {
    date: string
    dayOfWeek: string
    totalExpenses: string
    events: Event[]
    isToday?: boolean
}
