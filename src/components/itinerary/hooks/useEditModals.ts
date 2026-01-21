import { useState } from "react"
import { Event } from "@/types/itinerary"

export function useEditModals() {
    const [editingEvent, setEditingEvent] = useState<Event | null>(null)
    const [isEditFlightOpen, setIsEditFlightOpen] = useState(false)
    const [isEditHotelOpen, setIsEditHotelOpen] = useState(false)
    const [isEditVisitOpen, setIsEditVisitOpen] = useState(false)
    const [isEditFoodOpen, setIsEditFoodOpen] = useState(false)
    const [isEditLeisureOpen, setIsEditLeisureOpen] = useState(false)
    const [isEditReturnOpen, setIsEditReturnOpen] = useState(false)

    const openEditModal = (event: Event) => {
        setEditingEvent(event)

        switch (event.type) {
            case 'flight':
                setIsEditFlightOpen(true)
                break
            case 'hotel':
            case 'checkout':
                setIsEditHotelOpen(true)
                break
            case 'visit':
                setIsEditVisitOpen(true)
                break
            case 'food':
            case 'meal':
                setIsEditFoodOpen(true)
                break
            case 'leisure':
                setIsEditLeisureOpen(true)
                break
            case 'return':
                setIsEditReturnOpen(true)
                break
        }
    }

    const closeAllEditModals = () => {
        setIsEditFlightOpen(false)
        setIsEditHotelOpen(false)
        setIsEditVisitOpen(false)
        setIsEditFoodOpen(false)
        setIsEditLeisureOpen(false)
        setIsEditReturnOpen(false)
        setEditingEvent(null)
    }

    return {
        editingEvent,
        isEditFlightOpen,
        isEditHotelOpen,
        isEditVisitOpen,
        isEditFoodOpen,
        isEditLeisureOpen,
        isEditReturnOpen,
        openEditModal,
        closeAllEditModals,
        setIsEditFlightOpen,
        setIsEditHotelOpen,
        setIsEditVisitOpen,
        setIsEditFoodOpen,
        setIsEditLeisureOpen,
        setIsEditReturnOpen
    }
}
