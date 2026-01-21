
"use client"

import * as React from "react"
import { X, Upload } from "lucide-react"
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
import { Switch } from "@/components/ui/switch"

interface AddMaterialModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: (data: any) => void
}

export function AddMaterialModal({ open, onOpenChange, onSave }: AddMaterialModalProps) {
    const [name, setName] = React.useState("")
    const [isVisible, setIsVisible] = React.useState(true)
    const [file, setFile] = React.useState<File | null>(null)
    const [isDragging, setIsDragging] = React.useState(false)

    // Reset
    React.useEffect(() => {
        if (open) {
            setName("")
            setIsVisible(true)
            setFile(null)
        }
    }, [open])

    const handleSave = () => {
        onSave({ name, isVisible, file })
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
            setFile(e.dataTransfer.files[0])
        }
    }

    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const handleFileClick = () => {
        fileInputRef.current?.click()
    }
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const removeFile = (e: React.MouseEvent) => {
        e.stopPropagation()
        setFile(null)
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
                        <DialogTitle className="text-lg font-semibold text-gray-900">Adicionar material</DialogTitle>
                        <DialogDescription className="text-xs text-gray-500">Faça upload de novos materiais para o grupo</DialogDescription>
                    </div>
                    <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </DialogClose>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-1.5">
                        <Label className="text-xs text-gray-500">Nome do material<span className="text-red-500">*</span></Label>
                        <Input
                            placeholder="Ex: Guia do palestrante"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-12 bg-white border-gray-200 rounded-xl shadow-none focus-visible:ring-blue-600"
                        />
                    </div>

                    <div className="space-y-1.5">
                        {/* Hidden Input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileChange}
                        />

                        {!file ? (
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
                                        Arraste o arquivo aqui ou <span className="text-blue-600">clique para selecionar</span>
                                    </div>
                                    <div className="text-xs text-gray-400">PDF, XLS, DOC (máx. 10MB)</div>
                                </div>
                            </div>
                        ) : (
                            <div className="relative flex items-center justify-center w-full h-40 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="p-3 bg-white rounded-full shadow-sm">
                                        <Upload className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">{file.name}</span>
                                    <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)} KB</span>
                                </div>
                                <button
                                    onClick={removeFile}
                                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-gray-100 text-gray-500"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch id="visible" checked={isVisible} onCheckedChange={setIsVisible} className="data-[state=checked]:bg-blue-600" />
                        <Label htmlFor="visible" className="text-sm font-medium text-gray-900">Visível para o grupo</Label>
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
