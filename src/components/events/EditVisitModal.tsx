import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import VisitForm from "@/components/events/VisitForm"
import { Event } from "@/types/itinerary"

interface EditVisitModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    event: any
    onSave: (events: any[]) => void
    missionGroups?: any[]
    missionTravelers?: any[]
    existingEvents?: Event[]
}

export function EditVisitModal({
    open,
    onOpenChange,
    event,
    onSave,
    missionGroups,
    missionTravelers,
    existingEvents
}: EditVisitModalProps) {
    if (!event) return null

    const handleSave = (events: any[]) => {
        // The VisitForm returns an array of events (visit + optional transfer)
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
                        <DialogTitle className="text-lg font-semibold text-gray-900">Editar Visita</DialogTitle>
                        <p className="text-xs text-gray-500">
                            {event.title} • {event.date}
                        </p>
                    </div>
                </div>

                {/* Content - VisitForm without sidebar */}
                <div className="flex-1 overflow-hidden">
                    <VisitForm
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
