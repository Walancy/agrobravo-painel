"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AddEventModal } from "@/components/events/AddEventModal"
import { EditFlightModal } from "@/components/events/EditFlightModal"
import { EditHotelModal } from "@/components/events/EditHotelModal"
import { EditVisitModal } from "@/components/events/EditVisitModal"
import { EditFoodModal } from "@/components/events/EditFoodModal"
import { EditLeisureModal } from "@/components/events/EditLeisureModal"
import { EditReturnModal } from "@/components/events/EditReturnModal"
import { Event } from "@/types/itinerary"
import { ItineraryDayColumn } from "@/components/itinerary/ItineraryDayColumn"
import { ItineraryCalendarView } from "@/components/itinerary/ItineraryCalendarView"
import { useItineraryData } from "./hooks/useItineraryData"
import { useMissionData } from "./hooks/useMissionData"
import { useConflictDetection } from "./hooks/useConflictDetection"
import { useItineraryActions } from "./hooks/useItineraryActions"
import { useEditModals } from "./hooks/useEditModals"

interface GroupItineraryTabProps {
    isEmpty?: boolean
    onConflictChange?: (hasConflict: boolean) => void
    onQuotingChange?: (hasQuoting: boolean) => void
    groupId?: string
    startDate?: string
    endDate?: string
    viewMode?: 'list' | 'calendar'
}

export function GroupItineraryTab({
    isEmpty = false,
    onConflictChange,
    onQuotingChange,
    groupId,
    startDate,
    endDate,
    viewMode = 'list'
}: GroupItineraryTabProps) {
    // State
    const [isAddEventOpen, setIsAddEventOpen] = useState(false)
    const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | undefined>(undefined)
    const [activeDayIndex, setActiveDayIndex] = useState<number>(0)
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        isOpen: boolean
        eventId: string | null
        dayIndex: number | null
    }>({ isOpen: false, eventId: null, dayIndex: null })

    // Custom hooks
    const { itinerary, setItinerary, isLoading, fetchItineraryData } = useItineraryData({
        groupId,
        isEmpty,
        startDate,
        endDate
    })

    const { missionGroups, missionTravelers } = useMissionData({ groupId })

    useConflictDetection({ itinerary, onConflictChange })

    // Check for quoting status
    useEffect(() => {
        if (onQuotingChange) {
            const hasQuoting = itinerary.some(day =>
                day.events.some(event => event.status === 'quoting')
            )
            onQuotingChange(hasQuoting)
        }
    }, [itinerary, onQuotingChange])

    const {
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
    } = useEditModals()

    const {
        handleSaveEvent,
        handleEditEventSave,
        handleDeleteEvent,
        handleFavoriteToggle
    } = useItineraryActions({
        groupId,
        itinerary,
        setItinerary,
        isLoading,
        fetchItineraryData,
        activeDayIndex,
        editingEvent,
        closeAllEditModals
    })

    // Effects
    useEffect(() => {
        fetchItineraryData()
    }, [fetchItineraryData])

    // Handlers
    const handleAddEventClick = (event: React.MouseEvent<HTMLButtonElement>, index: number) => {
        const rect = event.currentTarget.getBoundingClientRect()
        const x = rect.left + rect.width / 2
        const y = rect.top + rect.height / 2
        setClickPosition({ x, y })
        setActiveDayIndex(index)
        setIsAddEventOpen(true)
    }

    const handleEditEvent = (dayIndex: number, eventId: string) => {
        const event = itinerary[dayIndex].events.find(e => e.id === eventId)
        if (event) {
            setActiveDayIndex(dayIndex)
            openEditModal(event)
        }
    }

    const handleDeleteClick = (dayIndex: number, eventId: string) => {
        setDeleteConfirmation({ isOpen: true, dayIndex, eventId })
    }

    const confirmDelete = async () => {
        if (deleteConfirmation.eventId && deleteConfirmation.dayIndex !== null && groupId) {
            await handleDeleteEvent(deleteConfirmation.eventId, deleteConfirmation.dayIndex)
            setDeleteConfirmation({ isOpen: false, eventId: null, dayIndex: null })
        }
    }

    const handleSaveEventWrapper = async (newEvents: Event[]) => {
        await handleSaveEvent(newEvents)
        setIsAddEventOpen(false)
    }

    return (
        <>
            {viewMode === 'calendar' ? (
                <div className="h-full">
                    <ItineraryCalendarView
                        itinerary={itinerary}
                        startDate={startDate}
                        endDate={endDate}
                        onAddEvent={handleAddEventClick}
                        onEditEvent={handleEditEvent}
                    />
                </div>
            ) : (
                <div className="flex h-full overflow-x-auto gap-4 p-4 bg-white rounded-xl">
                    {itinerary.map((day, index) => (
                        <ItineraryDayColumn
                            key={index}
                            day={day}
                            dayIndex={index}
                            onAddEvent={handleAddEventClick}
                            onDeleteEvent={handleDeleteClick}
                            onEditEvent={handleEditEvent}
                            onFavoriteToggle={handleFavoriteToggle}
                        />
                    ))}
                </div>
            )}

            <AddEventModal
                key="new"
                open={isAddEventOpen}
                onOpenChange={setIsAddEventOpen}
                clickPosition={clickPosition}
                onSave={handleSaveEventWrapper}
                missionGroups={missionGroups}
                missionTravelers={missionTravelers}
                defaultDate={
                    itinerary[activeDayIndex]?.date
                        ? itinerary[activeDayIndex].date.includes('/')
                            ? itinerary[activeDayIndex].date.split('/').reverse().join('-')
                            : itinerary[activeDayIndex].date
                        : undefined
                }
                minDate={startDate}
                maxDate={endDate}
                existingEvents={itinerary.flatMap(day => day.events)}
            />

            <EditFlightModal
                open={isEditFlightOpen}
                onOpenChange={setIsEditFlightOpen}
                event={editingEvent}
                onSave={handleEditEventSave}
                missionGroups={missionGroups}
                missionTravelers={missionTravelers}
                existingEvents={itinerary[activeDayIndex]?.events || []}
            />

            <EditHotelModal
                open={isEditHotelOpen}
                onOpenChange={setIsEditHotelOpen}
                event={editingEvent}
                onSave={handleEditEventSave}
                missionGroups={missionGroups}
                missionTravelers={missionTravelers}
                existingEvents={itinerary.flatMap(day => day.events)}
            />

            <EditVisitModal
                open={isEditVisitOpen}
                onOpenChange={setIsEditVisitOpen}
                event={editingEvent}
                onSave={handleEditEventSave}
                missionGroups={missionGroups}
                missionTravelers={missionTravelers}
                existingEvents={itinerary[activeDayIndex]?.events || []}
            />

            <EditFoodModal
                open={isEditFoodOpen}
                onOpenChange={setIsEditFoodOpen}
                event={editingEvent}
                onSave={handleEditEventSave}
                missionGroups={missionGroups}
                missionTravelers={missionTravelers}
                minDate={startDate}
                maxDate={endDate}
                existingEvents={itinerary[activeDayIndex]?.events || []}
            />

            <EditLeisureModal
                open={isEditLeisureOpen}
                onOpenChange={setIsEditLeisureOpen}
                event={editingEvent}
                onSave={handleEditEventSave}
                missionGroups={missionGroups}
                missionTravelers={missionTravelers}
                minDate={startDate}
                maxDate={endDate}
                existingEvents={itinerary[activeDayIndex]?.events || []}
            />

            {editingEvent && (
                <EditReturnModal
                    open={isEditReturnOpen}
                    onOpenChange={setIsEditReturnOpen}
                    event={editingEvent}
                    onSave={handleEditEventSave}
                    minDate={startDate}
                    maxDate={endDate}
                    existingEvents={itinerary[activeDayIndex]?.events || []}
                    allItineraryEvents={itinerary.flatMap(day => day.events)}
                />
            )}

            <Dialog
                open={deleteConfirmation?.isOpen ?? false}
                onOpenChange={(open) => !open && setDeleteConfirmation({ isOpen: false, eventId: null, dayIndex: null })}
            >
                <DialogContent className="sm:max-w-[400px] duration-0 data-[state=open]:animate-none data-[state=closed]:animate-none">
                    <DialogHeader>
                        <DialogTitle>Excluir evento</DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteConfirmation({ isOpen: false, eventId: null, dayIndex: null })}
                        >
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Excluir
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
