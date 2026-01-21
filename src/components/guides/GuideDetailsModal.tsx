"use client"

import * as React from "react"
import { X, Mail, Phone, MapPin } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogClose,
    DialogDescription,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface GuideDetailsModalProps {
    guideId: string | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function GuideDetailsModal({ guideId, open, onOpenChange }: GuideDetailsModalProps) {
    const [guide, setGuide] = React.useState<any>(null)
    const [isLoading, setIsLoading] = React.useState(false)

    React.useEffect(() => {
        const fetchGuide = async () => {
            if (!guideId || !open) return
            try {
                setIsLoading(true)
                const { guidesService } = await import("@/services/guidesService")
                const data = await guidesService.getGuideById(guideId)
                setGuide(data)
            } catch (error) {
                console.error("Error fetching guide details:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchGuide()
    }, [guideId, open])

    if (!guide && !isLoading) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                aria-describedby={undefined}
                className="max-w-[700px] p-0 flex flex-col bg-white overflow-hidden gap-0"
            >
                {/* Header */}
                <div className="flex items-start justify-between p-6 pb-2 border-b-0">
                    <div>
                        <DialogTitle className="text-2xl font-semibold text-gray-900">Detalhes do guia</DialogTitle>
                        <DialogDescription className="text-sm text-gray-500 mt-1">
                            Visualize os detalhes do guia
                        </DialogDescription>
                    </div>
                    {/* Default DialogClose handles the X, we remove the manual one to avoid duplication */}
                </div>

                {isLoading ? (
                    <div className="p-8 space-y-8">
                        <div className="flex gap-6">
                            <div className="h-24 w-24 rounded-full bg-gray-100 animate-pulse" />
                            <div className="space-y-3 flex-1">
                                <div className="h-6 w-1/3 bg-gray-100 animate-pulse rounded" />
                                <div className="h-4 w-1/4 bg-gray-100 animate-pulse rounded" />
                                <div className="h-4 w-1/2 bg-gray-100 animate-pulse rounded" />
                            </div>
                        </div>
                        <div className="h-32 w-full bg-gray-100 animate-pulse rounded-xl" />
                        <div className="h-32 w-full bg-gray-100 animate-pulse rounded-xl" />
                    </div>
                ) : (
                    <div className="p-6 pt-2 space-y-6 overflow-y-auto max-h-[80vh]">
                        {/* Profile Info */}
                        <div className="flex flex-col md:flex-row gap-5 items-start">
                            <Avatar className="w-24 h-24 border border-gray-100">
                                <AvatarImage src={guide?.photo || undefined} className="object-cover" />
                                <AvatarFallback className="text-2xl bg-gray-100 text-gray-400">
                                    {guide?.name?.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 space-y-1.5 pt-1">
                                <h2 className="text-2xl font-semibold text-gray-900">{guide?.name}</h2>
                                <div className="flex flex-col gap-1 text-sm text-gray-500">
                                    <p>Entrou em: 16/12/2024</p>
                                    <p>CPF: {guide?.document || "N/A"}</p>
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 mt-1">
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Mail className="w-4 h-4 text-blue-600" />
                                            <span>{guide?.email || "-"}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Phone className="w-4 h-4 text-blue-600" />
                                            <span>{guide?.phone || "-"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Last Mission Card - Mocked for UI pattern as data isn't in getGuideById yet */}
                        <div className="border border-gray-100 rounded-xl p-0 overflow-hidden">
                            <div className="bg-white p-4 border-b border-gray-50 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-blue-600 fill-blue-100" />
                                <span className="font-semibold text-gray-900">Ultima missão </span>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                                <div className="absolute left-1/2 top-6 bottom-6 w-px bg-gray-100 hidden md:block" />
                                {/* Mission Info */}
                                <div className="flex gap-4">
                                    {/* This is a placeholder as per design pattern */}
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                        <span className="text-xs font-semibold text-blue-600">US</span>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <p className="text-gray-500 text-xs">Missão:</p>
                                        <p className="font-semibold text-gray-900">USA Experience 2025</p>
                                        <div className="flex items-center gap-1 text-gray-500 text-xs">
                                            <MapPin className="w-3 h-3 text-blue-500" />
                                            Ameríca do norte
                                        </div>
                                        <p className="text-gray-400 text-xs mt-1">02/07/2025 - 30/07/2025</p>
                                    </div>
                                </div>
                                {/* Group Info */}
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                                        <span className="text-xs font-semibold text-green-600">AP</span>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <p className="text-gray-500 text-xs">Grupo:</p>
                                        <p className="font-semibold text-gray-900">Aprosoja</p>
                                        <div className="flex items-center gap-1 text-gray-500 text-xs">
                                            <MapPin className="w-3 h-3 text-blue-500" />
                                            Illinois
                                        </div>
                                        <p className="text-gray-400 text-xs mt-1">02/07/2025 - 30/07/2025</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Address Card */}
                        <div className="border border-gray-100 rounded-xl p-0 overflow-hidden">
                            <div className="bg-white p-4 border-b border-gray-50 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-blue-600 fill-blue-100" />
                                <span className="font-semibold text-gray-900">Endereço pessoal</span>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-4">
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500">CEP:</p>
                                    <p className="text-sm font-medium text-gray-900">{guide?.cep || "-"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500">Cidade:</p>
                                    <p className="text-sm font-medium text-gray-900">{guide?.city || "-"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500">Bairro:</p>
                                    <p className="text-sm font-medium text-gray-900">{guide?.neighborhood || "-"}</p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500">Estado:</p>
                                    <p className="text-sm font-medium text-gray-900">{guide?.state || "-"}</p>
                                </div>
                                <div className="space-y-1 md:col-span-1">
                                    <p className="text-xs text-gray-500">Rua/Avenida:</p>
                                    <p className="text-sm font-medium text-gray-900 truncate" title={guide?.street}>{guide?.street || "-"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500">Complemento:</p>
                                    <p className="text-sm font-medium text-gray-900">{guide?.complement || "Apto 101"}</p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500">Numero:</p>
                                    <p className="text-sm font-medium text-gray-900">{guide?.number || "1000"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer buttons */}
                <div className="p-6 pt-2 flex gap-4 mt-auto border-t border-gray-50 bg-white">
                    <Button
                        variant="outline"
                        className="flex-1 h-12 rounded-xl text-base font-medium border-gray-200 text-gray-700 hover:bg-gray-50"
                        onClick={() => onOpenChange(false)}
                    >
                        Fechar
                    </Button>
                    <Button
                        className="flex-1 h-12 rounded-xl text-base font-medium bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => {
                            // Edit action placeholder
                            console.log("Edit guide", guideId)
                        }}
                    >
                        Editar guia
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
