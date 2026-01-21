"use client"

import * as React from "react"
import { X, Upload, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
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
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"

interface NewGroupModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: (data: any) => void
    missionStart?: Date
    missionEnd?: Date
}

export function NewGroupModal({ open, onOpenChange, onSave, missionStart, missionEnd }: NewGroupModalProps) {
    // Form State
    const [name, setName] = React.useState("")
    const [vacancies, setVacancies] = React.useState("")
    const [startDate, setStartDate] = React.useState<Date>()
    const [endDate, setEndDate] = React.useState<Date>()
    const [observations, setObservations] = React.useState("")
    const [logo, setLogo] = React.useState<File | null>(null)
    const [isDragging, setIsDragging] = React.useState(false)

    // Reset state when modal opens
    React.useEffect(() => {
        if (open) {
            setName("")
            setVacancies("")
            setStartDate(undefined)
            setEndDate(undefined)
            setObservations("")
            setLogo(null)
        }
    }, [open])

    const isStartDateValid = !startDate || !missionStart || startDate >= missionStart
    const isEndDateValid = !endDate || !missionStart || endDate >= missionStart
    const isValid = name && vacancies && startDate && endDate && isStartDateValid && isEndDateValid

    const handleSave = () => {
        if (!isValid) return
        onSave({
            name,
            vacancies: parseInt(vacancies),
            startDate,
            endDate,
            observations,
            logo,
        })
        onOpenChange(false)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setLogo(e.dataTransfer.files[0])
        }
    }

    // File input handler for click
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const handleFileClick = () => {
        fileInputRef.current?.click()
    }
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setLogo(e.target.files[0])
        }
    }

    const removeLogo = (e: React.MouseEvent) => {
        e.stopPropagation()
        setLogo(null)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                aria-describedby={undefined}
                overlayClassName="!animate-none !duration-0 !transition-none"
                className="w-[98vw] max-w-[1000px] p-0 overflow-hidden gap-0 bg-white [&>button]:hidden !animate-none !duration-0 !transition-none"
            >
                {/* Header */}
                <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white">
                    <div>
                        <DialogTitle className="text-lg font-semibold text-gray-900">Novo grupo</DialogTitle>
                        <DialogDescription className="text-xs text-gray-500">Crie um novo grupo para missão</DialogDescription>
                    </div>
                    <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </DialogClose>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-1.5">
                        <Label className="text-xs text-gray-500">Nome do grupo<span className="text-red-500">*</span></Label>
                        <Input
                            placeholder="Informe o nome do grupo"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none focus-visible:ring-blue-600"
                        />
                    </div>

                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-4 space-y-1.5">
                            <Label className="text-xs text-gray-500">Quantidade de vagas<span className="text-red-500">*</span></Label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={vacancies}
                                onChange={(e) => setVacancies(e.target.value)}
                                className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none focus-visible:ring-blue-600"
                            />
                        </div>

                        <div className="col-span-4 space-y-1.5">
                            <Label className="text-xs text-gray-500">Data de inicio<span className="text-red-500">*</span></Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full h-12 justify-between text-left font-normal rounded-xl bg-gray-50 border-gray-200 shadow-none hover:bg-gray-100 px-3 text-sm",
                                            !startDate && "text-gray-500"
                                        )}
                                    >
                                        {startDate ? format(startDate, "dd/MM/yyyy") : <span>--/--/----</span>}
                                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={startDate}
                                        onSelect={setStartDate}
                                        initialFocus
                                        locale={ptBR}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="col-span-4 space-y-1.5">
                            <Label className="text-xs text-gray-500">Data de fim<span className="text-red-500">*</span></Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full h-12 justify-between text-left font-normal rounded-xl bg-gray-50 border-gray-200 shadow-none hover:bg-gray-100 px-3 text-sm",
                                            !endDate && "text-gray-500"
                                        )}
                                    >
                                        {endDate ? format(endDate, "dd/MM/yyyy") : <span>--/--/----</span>}
                                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={endDate}
                                        onSelect={setEndDate}
                                        initialFocus
                                        locale={ptBR}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs text-gray-500">Observações</Label>
                        <Textarea
                            placeholder="Informações adicionais do grupo (opcional)"
                            value={observations}
                            onChange={(e) => setObservations(e.target.value)}
                            className="min-h-[100px] bg-gray-50 border-gray-200 rounded-xl shadow-none focus-visible:ring-blue-600 resize-none p-3"
                        />
                    </div>

                    {/* Logo Upload - Drag & Drop */}
                    <div className="space-y-1.5">
                        {/* Hidden Input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />

                        {!logo ? (
                            <div
                                className={cn(
                                    "flex items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-colors",
                                    isDragging ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                                )}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={handleFileClick}
                            >
                                <div className="flex flex-col items-center gap-2 text-gray-500">
                                    <Upload className={cn("w-8 h-8", isDragging ? "text-blue-500" : "text-gray-400")} />
                                    <div className="text-sm font-medium">
                                        Arraste o logo aqui ou <span className="text-blue-600">clique para selecionar</span>
                                    </div>
                                    <div className="text-xs text-gray-400">PNG, JPG (máx. 5MB)</div>
                                </div>
                            </div>
                        ) : (
                            <div className="relative flex items-center justify-center w-full h-40 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="p-3 bg-white rounded-full shadow-sm">
                                        <Upload className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">{logo.name}</span>
                                    <span className="text-xs text-gray-500">{(logo.size / 1024).toFixed(0)} KB</span>
                                </div>
                                <button
                                    onClick={removeLogo}
                                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-gray-100 text-gray-500"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 pt-2 flex gap-3">
                    <Button
                        variant="outline"
                        className="flex-1 h-12 rounded-xl text-gray-700 font-medium border-gray-200 hover:bg-gray-50"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancelar
                    </Button>
                    <Button
                        className={cn(
                            "flex-1 h-12 rounded-xl text-white font-medium transition-colors",
                            isValid ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-200 text-gray-400 cursor-not-allowed hover:bg-gray-200"
                        )}
                        onClick={handleSave}
                        disabled={!isValid}
                    >
                        Salvar Grupo
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
