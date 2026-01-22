"use client"

import * as React from "react"
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
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { formatCurrency, getCategoryTotals, formatTime } from "@/lib/itineraryUtils"

export interface GroupItineraryTabRef {
    downloadPDF: () => void;
}

interface GroupItineraryTabProps {
    isEmpty?: boolean
    onConflictChange?: (hasConflict: boolean) => void
    onQuotingChange?: (hasQuoting: boolean) => void
    groupId?: string
    startDate?: string
    endDate?: string
    viewMode?: 'list' | 'calendar'
    groupName?: string
    groupLogo?: string
    missionLogo?: string
    travelersCount?: number
}

export const GroupItineraryTab = React.forwardRef<GroupItineraryTabRef, GroupItineraryTabProps>((props, ref) => {
    const {
        isEmpty = false,
        onConflictChange,
        onQuotingChange,
        groupId,
        startDate,
        endDate,
        viewMode = 'list',
        groupName,
        groupLogo,
        missionLogo,
        travelersCount
    } = props;
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

    const handleDownloadPDF = async () => {
        const doc = new jsPDF()
        const pageWidth = doc.internal.pageSize.getWidth()

        // 1. Header with Logos and Title

        // Helper to convert Image to PNG DataURL (handles SVG compatibility)
        const getPngDataUrl = (img: HTMLImageElement): string => {
            const canvas = document.createElement("canvas")
            canvas.width = img.naturalWidth || img.width
            canvas.height = img.naturalHeight || img.height
            const ctx = canvas.getContext("2d")
            if (!ctx) return ""
            ctx.drawImage(img, 0, 0)
            return canvas.toDataURL("image/png")
        }

        const logoHeight = 12

        // 1. Header (Corporate)

        // AgroBravo Logo - SMALLER AND CENTERED
        try {
            await new Promise((resolve, reject) => {
                const img = new Image()
                img.crossOrigin = "anonymous"
                img.onload = () => {
                    const dataUrl = getPngDataUrl(img)
                    if (dataUrl) {
                        const h = 7 // Smaller height
                        const ratio = img.naturalWidth / img.naturalHeight
                        const w = h * ratio
                        doc.addImage(dataUrl, 'PNG', (pageWidth - w) / 2, 8, w, h)
                    }
                    resolve(true)
                }
                img.onerror = reject
                img.src = window.location.origin + "/logo_agrobravo.svg"
            })
        } catch (e) {
            console.warn("AgroBravo logo could not be added", e)
        }

        // Mission Logo - TOP RIGHT
        if (missionLogo) {
            try {
                await new Promise((resolve, reject) => {
                    const img = new Image()
                    img.crossOrigin = "anonymous"
                    img.onload = () => {
                        const dataUrl = getPngDataUrl(img)
                        if (dataUrl) {
                            const h = 10
                            const ratio = img.naturalWidth / img.naturalHeight
                            const w = h * ratio
                            doc.addImage(dataUrl, 'PNG', pageWidth - w - 14, 8, w, h)
                        }
                        resolve(true)
                    }
                    img.onerror = reject
                    img.src = missionLogo
                })
            } catch (e) {
                console.warn("Mission logo could not be added", e)
            }
        }

        // 2. Group Identity Section (Logo + Name + Dates)
        let blockY = 28
        let textX = 14

        if (groupLogo) {
            try {
                await new Promise((resolve, reject) => {
                    const img = new Image()
                    img.crossOrigin = "anonymous"
                    img.onload = () => {
                        const dataUrl = getPngDataUrl(img)
                        if (dataUrl) {
                            const h = 18 // Prominent height
                            const ratio = img.naturalWidth / img.naturalHeight
                            const w = h * ratio
                            doc.addImage(dataUrl, 'PNG', 14, blockY, w, h)
                            textX = 14 + w + 8 // Space after logo
                        }
                        resolve(true)
                    }
                    img.onerror = reject
                    img.src = groupLogo
                })
            } catch (e) {
                console.warn("Group logo could not be added", e)
            }
        }

        // Title and Group Info Beside Logo
        doc.setFontSize(22)
        doc.setTextColor(37, 99, 235) // Blue-600
        doc.setFont("helvetica", "bold")
        doc.text("Relatório de Itinerário", textX, blockY + 5)

        doc.setFontSize(14)
        doc.setTextColor(50, 50, 50)
        doc.text(groupName || "Agro Bravo", textX, blockY + 12)

        doc.setFontSize(10)
        doc.setTextColor(120, 120, 120)
        doc.setFont("helvetica", "normal")
        const startStr = startDate ? new Date(startDate).toLocaleDateString('pt-BR') : ""
        const endStr = endDate ? new Date(endDate).toLocaleDateString('pt-BR') : ""
        doc.text(`${startStr} - ${endStr}`, textX, blockY + 18)

        // Summary Top position based on identity block height
        const summaryYStart = blockY + 28

        // 3. Summary Card (Elegant Flat Look)
        const allEvents = itinerary.flatMap(day => day.events)
        const categories = getCategoryTotals(allEvents)
        const totalCost = Object.values(categories).reduce((a, b) => a + b, 0)

        // Card background
        doc.setFillColor(248, 250, 252) // Gray-50
        doc.roundedRect(14, 68, pageWidth - 28, 45, 3, 3, 'F')

        // Stats
        doc.setFontSize(9)
        doc.setTextColor(100, 100, 100)
        doc.setFont("helvetica", "bold")
        doc.text("DETALHES DA MISSÃO", 20, 78)

        doc.setFont("helvetica", "normal")
        doc.setTextColor(50, 50, 50)
        doc.text(`Total de Dias: ${itinerary.length} dias`, 20, 86)
        doc.text(`Total de Viajantes: ${travelersCount || 0}`, 20, 93)
        doc.text(`Total de Atividades: ${allEvents.length}`, 20, 100)

        // Financials
        const columnX = pageWidth / 2 - 10
        doc.setFont("helvetica", "bold")
        doc.setTextColor(100, 100, 100)
        doc.text("INVESTIMENTO ESTIMADO", columnX, 78)

        doc.setFont("helvetica", "normal")
        doc.setTextColor(50, 50, 50)
        let yBudget = 86
        Object.entries(categories).slice(0, 3).forEach(([cat, val]) => {
            if (val > 0) {
                doc.text(`${cat}: ${formatCurrency(val)}`, columnX, yBudget)
                yBudget += 7
            }
        })

        // Investment Total Highlight
        const rightX = pageWidth - 25
        doc.setFontSize(11)
        doc.setFont("helvetica", "bold")
        doc.setTextColor(37, 99, 235)
        doc.text("TOTAL ESTIMADO", rightX, 78, { align: "right" })
        doc.setFontSize(16)
        doc.text(formatCurrency(totalCost), rightX, 89, { align: "right" })

        // 3. Main Itinerary Table
        const tableBody: any[] = []
        itinerary.forEach(day => {
            day.events.forEach((event, idx) => {
                let activityText = event.title

                // Enhanced Flight & Connection Design
                if (event.type === 'flight') {
                    const origin = (event.fromCode || event.from || "").toUpperCase();
                    const dest = (event.toCode || event.to || "").toUpperCase();
                    if (origin && dest) {
                        activityText = `${event.title}: ${origin}  >>  ${dest}`
                    }
                    if (event.subtitle) activityText += `\n(${event.subtitle})`
                } else if (event.subtitle) {
                    activityText += `\n${event.subtitle}`
                }

                // Connections Detail
                if (event.connections && event.connections.length > 0) {
                    event.connections.forEach(conn => {
                        activityText += `\n  • Conexão: ${conn.origin.code} >> ${conn.destination.code} (${conn.airline} ${conn.flightNumber})`
                    })
                }

                // Sanitize Location (no URLs)
                let locationValue = event.location || event.city || "-"
                if (locationValue.toLowerCase().startsWith('http')) {
                    locationValue = event.city || "-"
                }

                tableBody.push([
                    idx === 0 ? day.date : "",
                    formatTime(event.time),
                    activityText,
                    locationValue,
                    event.price ? formatCurrency(event.price) : "-"
                ])
            })
        })

        autoTable(doc, {
            startY: 122,
            head: [['DATA', 'HORA', 'ATIVIDADE', 'LOCAL', 'VALOR']],
            body: tableBody,
            theme: 'striped',
            styles: {
                fontSize: 8,
                cellPadding: 4,
                overflow: 'linebreak',
                valign: 'top',
                font: 'helvetica'
            },
            headStyles: {
                fillColor: [37, 99, 235],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                halign: 'left',
                cellPadding: 5,
                overflow: 'visible'
            },
            columnStyles: {
                0: { cellWidth: 28, halign: 'left', overflow: 'visible' },
                1: { cellWidth: 15, halign: 'left' },
                2: { cellWidth: 'auto' },
                3: { cellWidth: 38 },
                4: { cellWidth: 22, halign: 'right' }
            },
            alternateRowStyles: {
                fillColor: [249, 250, 251]
            },
            margin: { top: 20, right: 14, bottom: 25, left: 14 },
            didParseCell: (data) => {
                if (data.column.index === 0 && data.cell.text[0] !== "") {
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.textColor = [37, 99, 235];
                }
                if (data.column.index === 4) {
                    data.cell.styles.halign = 'right';
                }
            }
        })

        // Footer & Pagination
        const pages = (doc as any).internal.getNumberOfPages()
        for (let k = 1; k <= pages; k++) {
            doc.setPage(k)
            doc.setFontSize(8)
            doc.setTextColor(150, 150, 150)
            doc.line(14, 282, pageWidth - 14, 282)
            doc.text(`Agro Bravo Enterprise - Relatório de Planejamento`, 14, 288)
            doc.text(`Página ${k} de ${pages}`, pageWidth - 14, 288, { align: "right" })
        }

        doc.save(`itinerario-${groupName?.toLowerCase().replace(/\s+/g, '-') || 'planejamento'}.pdf`)
    }

    React.useImperativeHandle(ref, () => ({
        downloadPDF: handleDownloadPDF
    }))

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
})

GroupItineraryTab.displayName = "GroupItineraryTab"
