import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import HotelForm from "@/components/events/HotelForm"
import { Event } from "@/types/itinerary"

interface EditHotelModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    event: any
    onSave: (events: any[]) => void
    missionGroups?: any[]
    missionTravelers?: any[]
    existingEvents?: Event[]
}

export function EditHotelModal({
    open,
    onOpenChange,
    event,
    onSave,
    missionGroups,
    missionTravelers,
    existingEvents
}: EditHotelModalProps) {
    if (!event) return null

    const handleSave = (events: any[]) => {
        // The HotelForm returns an array of events (hotel + optional transfer)
        // We pass them directly as HotelForm now handles ID preservation for paired events
        if (events.length > 0) {
            onSave(events)
        }
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[85vw] h-[85vh] p-0 overflow-hidden flex flex-col bg-white gap-0 [&>button]:hidden duration-0 data-[state=open]:animate-none data-[state=closed]:animate-none">
                {/* Header */}
                <div className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0 z-10">
                    <div>
                        <DialogTitle className="text-lg font-semibold text-gray-900">Editar Hospedagem</DialogTitle>
                        <p className="text-xs text-gray-500">
                            {event.title} • {event.date}
                        </p>
                    </div>
                </div>

                {/* Content - HotelForm without sidebar */}
                <div className="flex-1 overflow-hidden">
                    <HotelForm
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
