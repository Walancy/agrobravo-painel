
"use client"

import * as React from "react"
import { X, Calendar as CalendarIcon } from "lucide-react"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface AddTransactionModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: (data: {
        category: string
        spent: number
        missing: number
        location: string
        reimbursementDate?: Date
    }) => void
}

const CATEGORIES = [
    "Refeição",
    "Transporte",
    "Combustivel",
    "Hospedagem",
    "Extra",
    "Outros"
]

export function AddTransactionModal({ open, onOpenChange, onSave }: AddTransactionModalProps) {
    const [category, setCategory] = React.useState("")
    const [spent, setSpent] = React.useState("")
    const [missing, setMissing] = React.useState("")
    const [location, setLocation] = React.useState("")
    const [date, setDate] = React.useState<Date | undefined>(new Date())

    const handleSave = () => {
        if (!category || !spent || !location) return

        onSave({
            category,
            spent: parseFloat(spent.replace(/[^0-9,.-]/g, '').replace(',', '.')),
            missing: missing ? parseFloat(missing.replace(/[^0-9,.-]/g, '').replace(',', '.')) : 0,
            location,
            reimbursementDate: date
        })
        onOpenChange(false)
        resetForm()
    }

    const resetForm = () => {
        setCategory("")
        setSpent("")
        setMissing("")
        setLocation("")
        setDate(new Date())
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
                        <DialogTitle className="text-lg font-semibold text-gray-900">Adicionar Gasto</DialogTitle>
                        <DialogDescription className="text-xs text-gray-500">Registre uma nova despesa do grupo.</DialogDescription>
                    </div>
                    <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </DialogClose>
                </div>

                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs text-gray-500">Categoria<span className="text-red-500">*</span></Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger className="h-12 bg-white border-gray-200 rounded-xl shadow-none">
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-gray-500">Data de Reembolso</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full h-12 justify-start text-left font-normal border-gray-200 rounded-xl shadow-none text-sm",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs text-gray-500">Valor Gasto<span className="text-red-500">*</span></Label>
                            <Input
                                placeholder="$ 0,00"
                                value={spent}
                                onChange={(e) => setSpent(e.target.value)}
                                className="h-12 bg-white border-gray-200 rounded-xl shadow-none focus-visible:ring-blue-600"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-gray-500">Valor Faltante</Label>
                            <Input
                                placeholder="$ 0,00"
                                value={missing}
                                onChange={(e) => setMissing(e.target.value)}
                                className="h-12 bg-white border-gray-200 rounded-xl shadow-none focus-visible:ring-blue-600"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs text-gray-500">Local<span className="text-red-500">*</span></Label>
                        <Input
                            placeholder="Ex: Restaurante X"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="h-12 bg-white border-gray-200 rounded-xl shadow-none focus-visible:ring-blue-600"
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
                        disabled={!category || !spent || !location}
                    >
                        Adicionar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
