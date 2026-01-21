"use client"
import * as React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter, FileText, Download, Eye, MoreVertical, Plus, Image as ImageIcon, CheckCircle, AlertCircle, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ViewDocumentModal } from "./ViewDocumentModal"
import { NewDocumentModal } from "./NewDocumentModal"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export type Document = {
    id: string
    nome: string
    tipo: string
    url: string
    status: string
    created_at: string
    data_validade?: string
}

interface TravelerDocumentsTabProps {
    travelerId: string
    documents?: Document[]
    requiredDocuments?: string[]
}

const REQUIRED_DOCUMENTS_LIST = [
    "Passaporte",
    "Visto",
    "Vacinas",
    "Seguro Viagem",
    "CNH",
    "Autorização de Menor"
]

export function TravelerDocumentsTab({ travelerId, documents = [], requiredDocuments = [] }: TravelerDocumentsTabProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
    const [viewModalOpen, setViewModalOpen] = useState(false)
    const [isNewDocModalOpen, setIsNewDocModalOpen] = useState(false)
    const [pendingFile, setPendingFile] = useState<File | null>(null)
    const [pendingType, setPendingType] = useState<string>("")
    const router = useRouter()

    // Hidden file input logic
    const hiddenFileInputRef = useState<HTMLInputElement | null>(null)

    // Actually, stick to useRef properly imported or React.useRef if needed, likely just useRef
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const handleFileSelect = (targetType: string = "") => {
        setPendingType(targetType)
        fileInputRef.current?.click()
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPendingFile(e.target.files[0])
            setIsNewDocModalOpen(true)
        }
        // Reset so same file can be selected again if needed
        e.target.value = ""
    }

    // Determine which documents to show
    // We want to show ALL required types. If a doc exists, show it. If not, show empty state for that type.

    // Group existing docs by type (heuristic matching)
    const docsByType = new Map<string, Document[]>()

    documents.forEach(doc => {
        const type = doc.tipo // || heuristic based on name?
        if (!docsByType.has(type)) docsByType.set(type, [])
        docsByType.get(type)?.push(doc)
    })

    // Create cards list
    // 1. Add cards for each Required Type (taking the most recent existing doc, or a placeholder)
    // 2. Add cards for any other existing docs that didn't fit the required types

    const cards: { type: string, doc?: Document, isRequired: boolean }[] = []
    const usedDocIds = new Set<string>()

    const allRequired = Array.from(new Set([...REQUIRED_DOCUMENTS_LIST, ...requiredDocuments]))

    allRequired.forEach(reqType => {
        // Find a matching doc
        const match = documents.find(d =>
            !usedDocIds.has(d.id) &&
            (d.tipo.toLowerCase() === reqType.toLowerCase() || d.nome.toLowerCase().includes(reqType.toLowerCase()))
        )

        if (match) {
            usedDocIds.add(match.id)
            cards.push({ type: reqType, doc: match, isRequired: true })
        } else {
            cards.push({ type: reqType, isRequired: true })
        }
    })

    // Add remaining docs
    documents.forEach(doc => {
        if (!usedDocIds.has(doc.id)) {
            cards.push({ type: doc.tipo, doc: doc, isRequired: false })
        }
    })

    const filteredCards = cards.filter(c =>
        c.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.doc?.nome.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleSaveDocument = async (data: { type: string, file: File, expiryDate?: Date, name?: string }) => {
        try {
            const formData = new FormData()
            formData.append('file', data.file)
            formData.append('type', data.type)
            if (data.name) formData.append('name', data.name)
            if (data.expiryDate) formData.append('expiryDate', data.expiryDate.toISOString())

            const response = await fetch(`/api/travelers/${travelerId}/documents`, {
                method: 'POST',
                body: formData
            })

            if (!response.ok) throw new Error('Failed to upload')

            // Refresh
            router.refresh()
            setIsNewDocModalOpen(false)
            setPendingFile(null)
            setPendingType("")
        } catch (error) {
            console.error("Upload error:", error)
            alert("Erro ao salvar documento. Tente novamente.")
        }
    }

    return (
        <div className="flex flex-col h-full space-y-4 bg-white p-4 border border-gray-100 rounded-2xl">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept="image/*,application/pdf"
            />
            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
                <div className="relative flex-1 w-full sm:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Buscar documentos..."
                        className="pl-9 h-12 bg-transparent border-gray-200 rounded-2xl w-full text-base shadow-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex w-full sm:w-auto gap-2">
                    <Button variant="outline" className="flex-1 sm:flex-none rounded-xl border-gray-200 text-gray-700 gap-2 h-12 hover:bg-gray-50">
                        <Filter className="h-4 w-4" />
                        Filtros
                    </Button>
                    <Button className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 h-12 shadow-sm shadow-blue-200" onClick={() => handleFileSelect()}>
                        <Plus className="h-4 w-4" />
                        Novo Documento
                    </Button>
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto min-h-0">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredCards.map((card, idx) => {
                        const doc = card.doc
                        const isExpired = doc?.data_validade ? new Date(doc.data_validade) < new Date() : false
                        let status = doc ? (doc.status || 'pending') : 'missing'
                        if (isExpired && status !== 'missing') status = 'expired'

                        return (
                            <div key={doc?.id || `missing-${idx}`} className={cn(
                                "group bg-white rounded-xl border p-3 transition-all duration-300 flex flex-col gap-3 relative overflow-hidden",
                                status === 'missing' ? "border-dashed border-gray-300 hover:border-blue-400 bg-gray-50/50" : "border-gray-200 hover:border-blue-400 hover:shadow-md cursor-pointer"
                            )}>
                                {/* Status Tag/Indicator */}
                                <div className="absolute top-3 right-3 z-10">
                                    {status === 'approved' && <CheckCircle className="w-5 h-5 text-green-500 bg-white rounded-full" />}
                                    {status === 'pending' && doc && <Clock className="w-5 h-5 text-yellow-500 bg-white rounded-full" />}
                                    {/* {status === 'missing' && <div className="w-2 h-2 rounded-full bg-red-400" />} */}
                                </div>

                                {/* Preview / Action Area */}
                                <div className={cn(
                                    "aspect-[4/3] rounded-lg flex items-center justify-center relative overflow-hidden",
                                    doc ? "bg-gray-50 border border-gray-100" : "bg-transparent"
                                )}>
                                    {doc ? (
                                        <>
                                            <div className="flex flex-col items-center gap-2">
                                                {doc.tipo.toLowerCase().includes('passaporte') || doc.tipo.toLowerCase().includes('foto') ? (
                                                    <ImageIcon className="h-8 w-8 text-blue-200" />
                                                ) : (
                                                    <FileText className="h-8 w-8 text-gray-300" />
                                                )}
                                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Preview</span>
                                            </div>
                                            {/* Overlay */}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                                <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/95 hover:bg-white text-gray-700 shadow-sm" onClick={(e) => {
                                                    e.stopPropagation()
                                                    setSelectedDocument(doc)
                                                    setViewModalOpen(true)
                                                }}>
                                                    <Eye className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/95 hover:bg-white text-gray-700 shadow-sm">
                                                    <Download className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <Button variant="ghost" className="h-full w-full flex flex-col gap-2 hover:bg-blue-50 hover:text-blue-600 text-gray-400" onClick={() => handleFileSelect(card.type)}>
                                            <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                <Plus className="w-5 h-5" />
                                            </div>
                                            <span className="text-xs font-medium">Adicionar</span>
                                        </Button>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex flex-col gap-1">
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="min-w-0">
                                            <h3 className={cn("font-semibold text-sm truncate leading-tight", !doc && "text-gray-500")}>
                                                {card.type}
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                                                {doc ? doc.nome : "Pendente envio"}
                                            </p>
                                        </div>
                                        {doc && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 -mr-1 -mt-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-xl border-gray-100 shadow-lg shadow-gray-200/50">
                                                    <DropdownMenuItem className="focus:bg-gray-50 cursor-pointer rounded-lg">Editar</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer rounded-lg">Excluir</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>

                                    {/* Status Chips */}
                                    <div className="flex mt-1">
                                        {status === 'approved' && <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 text-[10px] px-2 py-0.5">Validado</Badge>}
                                        {status === 'pending' && <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-[10px] px-2 py-0.5">Em análise</Badge>}
                                        {status === 'missing' && <Badge variant="secondary" className="bg-gray-100 text-gray-500 border-gray-200 text-[10px] px-2 py-0.5">Pendente</Badge>}
                                    </div>
                                </div>
                            </div>
                        )
                    })}

                    {filteredCards.length === 0 && (
                        <div className="col-span-full py-16 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                <FileText className="h-6 w-6 text-gray-400" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900">Nenhum documento encontrado</h3>
                            <p className="text-sm text-gray-500 max-w-xs mt-1">Tente ajustar seus filtros ou adicione um novo documento.</p>
                            <Button variant="outline" className="mt-4 rounded-xl border-gray-200 bg-white" onClick={() => handleFileSelect()}>
                                <Plus className="h-4 w-4 mr-2" />
                                Novo documento
                            </Button>
                        </div>
                    )}
                </div>

                <ViewDocumentModal
                    open={viewModalOpen}
                    onOpenChange={setViewModalOpen}
                    document={selectedDocument}
                    onApprove={(id) => console.log("Approving", id)}
                    onReject={(id) => console.log("Rejecting", id)}
                />

                <NewDocumentModal
                    open={isNewDocModalOpen}
                    onOpenChange={setIsNewDocModalOpen}
                    onSave={handleSaveDocument}
                    initialFile={pendingFile}
                    initialType={pendingType}
                />
            </div>
        </div>
    )
}
