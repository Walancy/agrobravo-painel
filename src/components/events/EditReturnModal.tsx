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
import ReturnForm from "@/components/events/ReturnForm"
import { Event } from "@/types/itinerary"

interface EditReturnModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    event: Event
    onSave: (updatedEvent: Event | Event[]) => void
    defaultDate?: string
    minDate?: string
    maxDate?: string
    existingEvents?: Event[]
    allItineraryEvents?: Event[]
}

export function EditReturnModal({
    open,
    onOpenChange,
    event,
    onSave,
    defaultDate,
    minDate,
    maxDate,
    existingEvents,
    allItineraryEvents
}: EditReturnModalProps) {
    const handleSave = (events: Event[]) => {
        if (events.length > 0) {
            const updatedMainEvent = {
                ...events[0],
                id: event.id  // Preserve the original ID
            }

            // Pass all events (main event + potential transfer)
            const allEvents = [updatedMainEvent, ...events.slice(1)]

            onSave(allEvents)
            onOpenChange(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[85vw] h-[85vh] p-0 overflow-hidden gap-0 flex flex-col [&>button]:hidden">
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 z-10">
                    <div>
                        <DialogTitle className="text-lg font-semibold text-gray-900">Editar Retorno</DialogTitle>
                    </div>
                    <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </DialogClose>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white mt-16">
                    <ReturnForm
                        onSave={handleSave}
                        onCancel={() => onOpenChange(false)}
                        defaultDate={defaultDate}
                        minDate={minDate}
                        maxDate={maxDate}
                        existingEvents={existingEvents}
                        allItineraryEvents={allItineraryEvents}
                        initialData={event}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}
