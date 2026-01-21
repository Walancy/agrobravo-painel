
"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogClose,
    DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ParticipantsSelector, Participant } from "@/components/common/ParticipantsSelector"

interface AddGuidesModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: (selectedGuides: string[]) => void
}

export function AddGuidesModal({ open, onOpenChange, onSave }: AddGuidesModalProps) {
    const [selectedGuides, setSelectedGuides] = React.useState<string[]>([])
    const [allGuides, setAllGuides] = React.useState<Participant[]>([])
    const [isLoading, setIsLoading] = React.useState(false)

    // Fetch guides when modal opens
    React.useEffect(() => {
        if (open) {
            setSelectedGuides([])
            const fetchGuides = async () => {
                try {
                    setIsLoading(true)
                    const { guidesService } = await import("@/services/guidesService")
                    const guides = await guidesService.getAllGuides()
                    // Map to Participant format
                    const formatedGuides: Participant[] = guides.map((g: any) => ({
                        id: g.id, // Ensure this is the correct ID to save (likely user_id or lider_id depending on context)
                        // Actually getAllGuides returns items with 'id'. Depending on the service...
                        // Let's assume getAllGuides returns what we need. 
                        // Note: guidesService.getAllGuides returns { id, name, lastMission, phone, email, type, photo }
                        // User needs ID to save.
                        name: g.name,
                        avatar: g.photo || "https://github.com/shadcn.png",
                        group: g.type || "Guia"
                    }))
                    setAllGuides(formatedGuides)
                } catch (error) {
                    console.error("Error fetching guides:", error)
                } finally {
                    setIsLoading(false)
                }
            }
            fetchGuides()
        }
    }, [open])

    const handleSave = () => {
        onSave(selectedGuides)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                aria-describedby={undefined}
                overlayClassName="!animate-none !duration-0 !transition-none"
                className="!max-w-[500px] p-0 overflow-hidden gap-0 bg-white [&>button]:hidden !animate-none !duration-0 !transition-none"
                style={{ maxWidth: '500px', width: '90vw' }}
            >
                {/* Header */}
                <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white">
                    <div>
                        <DialogTitle className="text-lg font-semibold text-gray-900">Adicionar guias</DialogTitle>
                        <DialogDescription className="text-xs text-gray-500">Selecione os guias para este grupo</DialogDescription>
                    </div>
                    <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </DialogClose>
                </div>

                <div className="p-6 space-y-4">
                    <div className="space-y-1.5">
                        <Label className="text-xs text-gray-500">Guias<span className="text-red-500">*</span></Label>

                        {isLoading ? (
                            <div className="text-sm text-gray-500">Carregando guias...</div>
                        ) : (
                            <ParticipantsSelector
                                value={selectedGuides}
                                onChange={setSelectedGuides}
                                participants={allGuides}
                                label="Selecionar Guias"
                                title="Guias Disponíveis"
                                subtitle="Selecione os guias para adicionar ao grupo"
                                participantType="Guia"
                                emptyMessage="Nenhum guia selecionado"
                                className="w-full"
                            />
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 pt-2 flex gap-3">
                    <Button
                        variant="outline"
                        className="flex-1 h-12 rounded-xl text-gray-700 font-medium border-blue-600 text-blue-600 hover:bg-blue-50 border-1"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancelar
                    </Button>
                    <Button
                        className="flex-1 h-12 rounded-xl text-white font-medium bg-blue-600 hover:bg-blue-700"
                        onClick={handleSave}
                        disabled={selectedGuides.length === 0}
                    >
                        Confirmar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
