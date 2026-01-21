"use client"

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog"
import { X } from "lucide-react"
import { FlightForm } from "@/components/events/AddEventModal"
import { Event } from "@/types/itinerary"

interface EditFlightModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    event: Event | null
    onSave: (updatedEvent: Event | Event[]) => void
    missionGroups?: any[]
    missionTravelers?: any[]
    existingEvents?: Event[]
}

export function EditFlightModal({
    open,
    onOpenChange,
    event,
    onSave,
    missionGroups,
    missionTravelers,
    existingEvents
}: EditFlightModalProps) {
    if (!event) return null

    const handleSave = (events: any[]) => {
        // The FlightForm returns an array of events (flight + optional transfer)
        // For edit mode, we merge the first event with the original ID
        if (events.length > 0) {
            const updated = events.map((ev, index) => {
                if (index === 0) return { ...event, ...ev, id: event.id }
                return ev
            })
            onSave(updated)
        }
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[85vw] h-[85vh] p-0 overflow-hidden flex flex-col bg-white gap-0 [&>button]:hidden duration-0 data-[state=open]:animate-none data-[state=closed]:animate-none">
                {/* Header */}
                <div className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0 z-10">
                    <div>
                        <DialogTitle className="text-lg font-semibold text-gray-900">Editar Voo</DialogTitle>
                        <p className="text-xs text-gray-500">
                            {event.from} → {event.to}
                        </p>
                    </div>
                    <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </DialogClose>
                </div>

                {/* Content - FlightForm without sidebar */}
                <div className="flex-1 overflow-hidden">
                    <FlightForm
                        onSave={handleSave}
                        onCancel={() => onOpenChange(false)}
                        initialData={event}
                        missionGroups={missionGroups}
                        missionTravelers={missionTravelers}
                        existingEvents={existingEvents}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}
