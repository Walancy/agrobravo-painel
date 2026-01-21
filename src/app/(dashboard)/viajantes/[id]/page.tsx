"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, MapPin, Calendar, Star, Users, Map, Globe, Pencil } from "lucide-react"
import { TravelerDataTab } from "@/components/traveler/TravelerDataTab"
import { TravelerDocumentsTab, Document } from "@/components/traveler/TravelerDocumentsTab"
import { cn } from "@/lib/utils"

import { TravelerMissionsTab, MissionHistoryItem } from "@/components/traveler/TravelerMissionsTab"
import { TravelerNotificationsTab } from "@/components/traveler/TravelerNotificationsTab"

// Local type definition removed to use imported one from TravelerMissionsTab

type TravelerDetails = {
    id: string
    name: string
    email: string
    phone: string
    photo: string | null
    groupName: string
    groupLogo: string | null
    groupId?: string
    missionId?: string
    missionName: string
    country: string
    joinedDate: string
    seals: number
    connections: number
    missions: number
    visits: number
    documents: Document[]
    missionHistory?: MissionHistoryItem[]
}

export default function TravelerPage() {
    const params = useParams()
    const id = params.id as string

    const [traveler, setTraveler] = useState<TravelerDetails | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchTraveler = async () => {
            try {
                setIsLoading(true)
                const response = await fetch(`/api/travelers/${id}`)
                if (!response.ok) throw new Error('Failed to fetch traveler')
                const data = await response.json()
                setTraveler(data)
            } catch (error) {
                console.error('Error fetching traveler:', error)
            } finally {
                setIsLoading(false)
            }
        }

        if (id) {
            fetchTraveler()
        }
    }, [id])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    if (!traveler) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Viajante não encontrado</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full space-y-4 p-4">
            <Tabs defaultValue="documentos" className="flex flex-col h-full gap-4">
                {/* Header Card */}
                <div className="bg-white rounded-xl border border-gray-100 flex flex-col shrink-0 relative transition-all duration-300">
                    <div className="p-4 pb-0 flex flex-col md:flex-row justify-between gap-4">
                        {/* Top part: Photo, Name, Info */}
                        <div className="flex items-start gap-6 mb-2">
                            {/* Avatar */}
                            <div className="relative">
                                <Avatar className="h-24 w-24 rounded-full border-4 border-white shadow-sm">
                                    <AvatarImage src={traveler.photo || ""} alt={traveler.name} className="object-cover" />
                                    <AvatarFallback className="bg-blue-600 text-white text-2xl font-bold">
                                        {traveler.name.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <button className="absolute bottom-0 right-0 p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full border border-white shadow-sm text-gray-600 transition-colors">
                                    <Pencil className="w-3 h-3" />
                                </button>
                            </div>

                            {/* Info */}
                            <div className="flex-1 space-y-1">
                                <h1 className="text-2xl font-bold text-gray-900 leading-tight">{traveler.name}</h1>

                                <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                    <div className="flex items-center gap-2">
                                        {/* Placeholder for Mission Icon/Flag */}
                                        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <Globe className="w-3 h-3" />
                                        </div>
                                        <span>{traveler.missionName}</span>
                                    </div>

                                    <span>-</span>

                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-5 w-5 border border-gray-100">
                                            <AvatarImage src={traveler.groupLogo || ""} className="object-cover" />
                                            <AvatarFallback className="bg-green-100 text-green-700 text-[8px]">
                                                {traveler.groupName.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span>{traveler.groupName}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                    <MapPin className="h-3.5 w-3.5 text-blue-500" />
                                    <span>{traveler.country}</span>
                                </div>

                                <div className="text-sm text-gray-400">
                                    Entrou em: {new Date(traveler.joinedDate).toLocaleDateString('pt-BR')}
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-8 items-center pr-6">
                            <div className="flex flex-col items-start gap-1 min-w-[80px]">
                                <div className="flex items-center gap-2 text-gray-900 text-sm font-bold">
                                    <Star className="w-4 h-4 text-blue-600 fill-blue-600" />
                                    Selos
                                </div>
                                <span className="text-2xl font-normal text-gray-500 pl-6">{traveler.seals}</span>
                            </div>
                            <div className="w-px h-10 bg-gray-100" />
                            <div className="flex flex-col items-start gap-1 min-w-[80px]">
                                <div className="flex items-center gap-2 text-gray-900 text-sm font-bold">
                                    <Users className="w-4 h-4 text-blue-600" />
                                    Conexões
                                </div>
                                <span className="text-2xl font-normal text-gray-500 pl-6">{traveler.connections}</span>
                            </div>
                            <div className="w-px h-10 bg-gray-100" />
                            <div className="flex flex-col items-start gap-1 min-w-[80px]">
                                <div className="flex items-center gap-2 text-gray-900 text-sm font-bold">
                                    <Map className="w-4 h-4 text-blue-600" />
                                    Missões
                                </div>
                                <span className="text-2xl font-normal text-gray-500 pl-6">{traveler.missions}</span>
                            </div>
                            <div className="w-px h-10 bg-gray-100" />
                            <div className="flex flex-col items-start gap-1 min-w-[80px]">
                                <div className="flex items-center gap-2 text-gray-900 text-sm font-bold">
                                    <MapPin className="w-4 h-4 text-blue-600" />
                                    Visitas
                                </div>
                                <span className="text-2xl font-normal text-gray-500 pl-6">{traveler.visits}</span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom part: TabsList */}
                    <div className="px-4 mt-4 pb-4">
                        <TabsList className="h-auto w-full justify-start gap-0 !bg-transparent !p-0 !border-none !rounded-none !shadow-none !drop-shadow-none">
                            <TabsTrigger
                                value="documentos"
                                className="h-auto !flex-none !rounded-none !border-0 !border-b-0 !px-6 !py-3 text-gray-500 font-medium data-[state=active]:!border-b-[3px] data-[state=active]:!border-blue-600 data-[state=active]:!text-gray-900 data-[state=active]:!bg-transparent data-[state=active]:!shadow-none hover:text-gray-700 transition-colors focus-visible:!ring-0"
                            >
                                Documentos
                            </TabsTrigger>
                            <TabsTrigger
                                value="dados"
                                className="h-auto !flex-none !rounded-none !border-0 !border-b-0 !px-6 !py-3 text-gray-500 font-medium data-[state=active]:!border-b-[3px] data-[state=active]:!border-blue-600 data-[state=active]:!text-gray-900 data-[state=active]:!bg-transparent data-[state=active]:!shadow-none hover:text-gray-700 transition-colors focus-visible:!ring-0"
                            >
                                Dados
                            </TabsTrigger>
                            <TabsTrigger
                                value="missoes"
                                className="h-auto !flex-none !rounded-none !border-0 !border-b-0 !px-6 !py-3 text-gray-500 font-medium data-[state=active]:!border-b-[3px] data-[state=active]:!border-blue-600 data-[state=active]:!text-gray-900 data-[state=active]:!bg-transparent data-[state=active]:!shadow-none hover:text-gray-700 transition-colors focus-visible:!ring-0"
                            >
                                Missões
                            </TabsTrigger>
                            <TabsTrigger
                                value="notificacoes"
                                className="h-auto !flex-none !rounded-none !border-0 !border-b-0 !px-6 !py-3 text-gray-500 font-medium data-[state=active]:!border-b-[3px] data-[state=active]:!border-blue-600 data-[state=active]:!text-gray-900 data-[state=active]:!bg-transparent data-[state=active]:!shadow-none hover:text-gray-700 transition-colors focus-visible:!ring-0"
                            >
                                Notificações
                            </TabsTrigger>
                        </TabsList>
                    </div>
                </div>

                {/* Tabs Content Area */}
                <div className="flex-1 min-h-0">
                    <TabsContent value="dados" className="h-full mt-0 border-none p-0 data-[state=inactive]:hidden overflow-auto">
                        <TravelerDataTab travelerId={id} />
                    </TabsContent>

                    <TabsContent value="documentos" className="h-full mt-0 border-none p-0 data-[state=inactive]:hidden overflow-auto">
                        <TravelerDocumentsTab travelerId={id} documents={traveler.documents} />
                    </TabsContent>

                    <TabsContent value="missoes" className="h-full mt-0 border-none p-0 data-[state=inactive]:hidden overflow-auto">
                        <TravelerMissionsTab missions={traveler.missionHistory} />
                    </TabsContent>

                    <TabsContent value="notificacoes" className="h-full mt-0 border-none p-0 data-[state=inactive]:hidden overflow-auto">
                        <TravelerNotificationsTab missionId={traveler.missionId || ""} groupId={traveler.groupId} />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}
