"use client"

import * as React from "react"
import { X, Check, Search, Download, FileText, Image as ImageIcon, ExternalLink, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogClose,
    DialogHeader,
    DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Document } from "@/components/traveler/TravelerDocumentsTab"

interface ViewDocumentModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    document: Document | null
    onApprove?: (id: string) => void
    onReject?: (id: string) => void
}

export function ViewDocumentModal({
    open,
    onOpenChange,
    document,
    onApprove,
    onReject
}: ViewDocumentModalProps) {

    if (!document) return null

    const isPending = document.status === 'pending'
    const isApproved = document.status === 'approved'
    const isRejected = document.status === 'rejected'
    const isMissing = document.status === 'missing'

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                aria-describedby={undefined}
                overlayClassName="bg-black/80 backdrop-blur-sm"
                className="w-[90vw] max-w-[900px] h-[85vh] p-0 overflow-hidden gap-0 bg-white border-none shadow-2xl flex flex-col"
            >
                {/* Header */}
                <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <DialogTitle className="text-lg font-semibold text-gray-900 flex items-center gap-3">
                                {document.nome || 'Documento'}
                                {isApproved && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Aprovado</Badge>}
                                {isPending && <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none">Pendente análise</Badge>}
                                {isRejected && <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">Recusado</Badge>}
                                {isMissing && <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-none">Não enviado</Badge>}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-500 mt-0.5">
                                {document.tipo} • Enviado em {(document.created_at && document.created_at !== new Date().toISOString()) ? new Date(document.created_at).toLocaleDateString('pt-BR') : '-'}
                            </DialogDescription>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {document.url && (
                            <Button variant="outline" size="sm" className="h-9 gap-2 text-gray-600" asChild>
                                <a href={document.url} target="_blank" rel="noopener noreferrer">
                                    <Download className="h-4 w-4" />
                                    Download
                                </a>
                            </Button>
                        )}
                        <DialogClose asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100">
                                <X className="h-5 w-5" />
                            </Button>
                        </DialogClose>
                    </div>
                </div>

                {/* Content Area - Split View */}
                <div className="flex-1 flex overflow-hidden bg-gray-50/50">
                    {/* Main Preview Area */}
                    <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
                        {document.url ? (
                            document.url.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                                <img
                                    src={document.url}
                                    alt={document.nome}
                                    className="max-w-full max-h-full object-contain shadow-lg rounded-lg bg-white"
                                />
                            ) : (
                                <iframe
                                    src={document.url}
                                    className="w-full h-full bg-white shadow-lg rounded-lg"
                                    title="Document Preview"
                                />
                            )
                        ) : (
                            <div className="flex flex-col items-center justify-center text-gray-400 gap-4">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                                    <FileText className="h-10 w-10 text-gray-300" />
                                </div>
                                <p className="text-sm font-medium">Visualização não disponível</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar / Properties Panel (Optional, can be removed if strictly not needed, but adds "modal visual dos outros sistemas") */}
                    <div className="w-80 border-l border-gray-200 bg-white p-6 overflow-y-auto shrink-0 space-y-6">
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-gray-900 mb-4">Detalhes do arquivo</h4>

                            <dl className="space-y-4">
                                <div>
                                    <dt className="text-xs font-medium text-gray-500 mb-1">Status</dt>
                                    <dd className="text-sm text-gray-900 font-medium capitalize">
                                        {document.status === 'missing' ? 'Pendente de Envio' :
                                            document.status === 'approved' ? 'Aprovado' :
                                                document.status === 'rejected' ? 'Reprovado' : 'Em Análise'}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-xs font-medium text-gray-500 mb-1">Tipo de Documento</dt>
                                    <dd className="text-sm text-gray-900">{document.tipo}</dd>
                                </div>

                                <div>
                                    <dt className="text-xs font-medium text-gray-500 mb-1">Data de Envio</dt>
                                    <dd className="text-sm text-gray-900">
                                        {(document.created_at && document.created_at !== new Date().toISOString()) ? new Date(document.created_at).toLocaleString('pt-BR') : '-'}
                                    </dd>
                                </div>

                                {/* If we had validation or expiry date data, it would match other modals here */}
                            </dl>
                        </div>

                        {/* Actions */}
                        {!isMissing && (
                            <div className="pt-6 border-t border-gray-100 space-y-3">
                                <h4 className="text-sm font-semibold text-gray-900">Ações</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        variant="outline"
                                        className="w-full border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
                                        onClick={() => onReject?.(document.id)}
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Recusar
                                    </Button>
                                    <Button
                                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                                        onClick={() => onApprove?.(document.id)}
                                    >
                                        <Check className="h-4 w-4 mr-2" />
                                        Aprovar
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
