
"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogClose,
    DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

interface NewNotificationModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: (data: any) => void
}

export function NewNotificationModal({ open, onOpenChange, onSave }: NewNotificationModalProps) {
    const [toGuides, setToGuides] = React.useState(true)
    const [toTravelers, setToTravelers] = React.useState(true)
    const [description, setDescription] = React.useState("")

    const handleSave = () => {
        onSave({ toGuides, toTravelers, description })
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                aria-describedby={undefined}
                overlayClassName="!animate-none !duration-0 !transition-none"
                className="!max-w-[700px] p-0 overflow-hidden gap-0 bg-white [&>button]:hidden !animate-none !duration-0 !transition-none"
                style={{ maxWidth: '700px', width: '90vw' }}
            >
                {/* Header */}
                <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white">
                    <div>
                        <DialogTitle className="text-lg font-semibold text-gray-900">Enviar notificação</DialogTitle>
                        <DialogDescription className="text-xs text-gray-500">Gere uma nova notificação</DialogDescription>
                    </div>
                    <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </DialogClose>
                </div>

                <div className="p-6 space-y-6">
                    {/* Toggles */}
                    <div className="flex gap-6">
                        <div className="flex items-center space-x-2">
                            <Switch id="guides" checked={toGuides} onCheckedChange={setToGuides} className="data-[state=checked]:bg-blue-600" />
                            <Label htmlFor="guides" className="text-sm font-medium text-gray-900">Enviar para guias</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch id="travelers" checked={toTravelers} onCheckedChange={setToTravelers} className="data-[state=checked]:bg-blue-600" />
                            <Label htmlFor="travelers" className="text-sm font-medium text-gray-900">Enviar para viajantes</Label>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label className="text-xs text-gray-500">Descrição<span className="text-red-500">*</span></Label>
                        <Textarea
                            placeholder="Descreva a notificação"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="min-h-[150px] bg-white border-gray-200 rounded-xl shadow-none focus-visible:ring-blue-600 resize-none p-4"
                        />
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
                    >
                        Salvar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
