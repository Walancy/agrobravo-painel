
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AddBudgetModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: (value: string) => void
}

export function AddBudgetModal({ open, onOpenChange, onSave }: AddBudgetModalProps) {
    const [value, setValue] = React.useState("")
    const [type, setType] = React.useState<"add" | "remove">("add")

    const handleSave = () => {
        const numericValue = value.replace(/[^0-9,.]/g, '')
        const finalValue = type === "remove" ? `-${numericValue}` : numericValue
        onSave(finalValue)
        onOpenChange(false)
        setValue("")
        setType("add")
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                aria-describedby={undefined}
                overlayClassName="!animate-none !duration-0 !transition-none"
                className="!max-w-[550px] p-0 overflow-hidden gap-0 bg-white [&>button]:hidden !animate-none !duration-0 !transition-none"
                style={{ maxWidth: '550px', width: '90vw' }}
            >
                {/* Header */}
                <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white">
                    <div>
                        <DialogTitle className="text-lg font-semibold text-gray-900">Ajustar Verba</DialogTitle>
                        <DialogDescription className="text-xs text-gray-500">Adicione ou remova verba do grupo.</DialogDescription>
                    </div>
                    <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </DialogClose>
                </div>

                <div className="p-6 space-y-6">
                    {/* Toggle Type */}
                    <div className="flex p-1 bg-gray-100 rounded-lg">
                        <button
                            className={cn(
                                "flex-1 py-1.5 text-sm font-medium rounded-md transition-all",
                                type === "add" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                            )}
                            onClick={() => setType("add")}
                        >
                            Adicionar
                        </button>
                        <button
                            className={cn(
                                "flex-1 py-1.5 text-sm font-medium rounded-md transition-all",
                                type === "remove" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                            )}
                            onClick={() => setType("remove")}
                        >
                            Remover
                        </button>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs text-gray-500">Valor ({type === "add" ? "Adicionar" : "Remover"})<span className="text-red-500">*</span></Label>
                        <Input
                            placeholder="$"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className="h-12 bg-white border-gray-200 rounded-xl shadow-none focus-visible:ring-blue-600 pl-4"
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
                        Confirmar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
