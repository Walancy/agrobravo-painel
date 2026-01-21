"use client"

import * as React from "react"
import { format } from "date-fns"
import { MapPin, Users, User, Map, MapPinned, ChevronUp, ChevronDown, Pencil, AlertTriangle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MissionGroupsTab } from "@/components/mission/MissionGroupsTab"
import { MissionGuidesTab } from "@/components/mission/MissionGuidesTab"
import { MissionTravelersTab } from "@/components/mission/MissionTravelersTab"
import { MissionExpensesTab } from "@/components/mission/MissionExpensesTab"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function MissionDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params)
    const [mission, setMission] = React.useState<any>(null)
    const [isLoading, setIsLoading] = React.useState(true)
    const [isMicroView, setIsMicroView] = React.useState(false)
    const [imageSrc, setImageSrc] = React.useState("https://github.com/shadcn.png")
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const isNew = id === "new"

    React.useEffect(() => {
        const fetchMission = async () => {
            if (isNew) return
            try {
                setIsLoading(true)
                const { missionsService } = await import("@/services/missionsService")
                const data = await missionsService.getMissionById(id)
                setMission(data)
                if (data.logo) setImageSrc(data.logo)
            } catch (error) {
                console.error("Error fetching mission:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchMission()
    }, [id, isNew])

    const missionData = React.useMemo(() => {
        if (!mission) return {
            name: "Carregando...",
            region: "-",
            dates: "- / - / -",
            days: 0,
            stats: { groups: 0, travelers: 0, guides: 0, cities: 0, visits: 0 }
        }

        const start = mission.data_inicio ? new Date(mission.data_inicio) : null
        const end = mission.data_fim ? new Date(mission.data_fim) : null
        const daysDiff = start && end ? Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) : 0

        return {
            name: mission.nome,
            region: mission.continente || "-",
            dates: `${start ? format(start, "dd/MM/yyyy") : "-"} - ${end ? format(end, "dd/MM/yyyy") : "-"}`,
            days: daysDiff,
            // Stats are likely fetched separately or computed? For now mock/zero if not in payload.
            stats: {
                groups: mission.groups_count || 0, // Assuming backend might return this or we fetch it? 
                travelers: mission.travelers_count || 0,
                guides: mission.guides_count || 0,
                cities: mission.cities_count || 0,
                visits: mission.visits_count || 0
            }
        }
    }, [mission])

    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file && mission) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setImageSrc(reader.result as string)
            }
            reader.readAsDataURL(file)

            try {
                const { createClient } = await import("@/lib/supabase/client")
                const supabase = createClient()
                const fileExt = file.name.split('.').pop()
                const fileName = `${Math.random()}.${fileExt}`
                const filePath = `${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('mission-logos')
                    .upload(filePath, file)

                if (!uploadError) {
                    const { data: { publicUrl } } = supabase.storage
                        .from('mission-logos')
                        .getPublicUrl(filePath)

                    const { missionsService } = await import("@/services/missionsService")
                    await missionsService.updateMission(id, { logo: publicUrl })
                }
            } catch (error) {
                console.error("Error updating logo:", error)
            }
        }
    }

    const handleButtonClick = () => {
        fileInputRef.current?.click()
    }

    return (
        <div className="flex flex-col h-full space-y-4 p-4">
            <Tabs defaultValue="grupos" className="flex flex-col h-full gap-4">
                {/* Header Card containing Info AND TabsList */}
                <div className="bg-white rounded-xl border border-gray-100 flex flex-col shrink-0 relative transition-all duration-300">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 text-gray-400 hover:text-gray-600"
                        onClick={() => setIsMicroView(!isMicroView)}
                    >
                        {isMicroView ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                    </Button>

                    {/* Top part: Info */}
                    <div className={cn("p-4 pb-0 flex flex-col md:flex-row justify-between gap-4 transition-all", isMicroView ? "items-center" : "")}>
                        <div className="flex gap-4 items-center">
                            <div className="relative">
                                <Avatar className={cn("rounded-full border-4 border-white shadow-sm transition-all duration-300", isMicroView ? "h-12 w-12 border-2" : "h-24 w-24")}>
                                    <AvatarImage src={imageSrc} alt="USA Experience" className="object-cover" />
                                    <AvatarFallback>US</AvatarFallback>
                                </Avatar>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                                {!isMicroView && (
                                    <Button
                                        size="icon"
                                        className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md bg-white hover:bg-gray-50 border border-gray-200 text-gray-600"
                                        onClick={handleButtonClick}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            <div className="space-y-2">
                                <h1 className={cn("font-semibold text-gray-900 transition-all duration-300", isMicroView ? "text-lg" : "text-2xl")}>{missionData.name}</h1>
                                {!isMicroView && (
                                    <>
                                        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                                            <MapPin className="w-4 h-4 text-blue-500" />
                                            <span>{missionData.region}</span>
                                        </div>
                                        <div className="text-gray-500 text-sm">
                                            {missionData.dates}
                                        </div>
                                        <div className="text-gray-900 font-medium text-sm">
                                            Dias de viagem: <span className="text-blue-600 font-bold">{missionData.days} dias</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {!isMicroView && (
                            <div className="flex gap-8 items-center pr-6">
                                <div className="flex flex-col items-center gap-1">
                                    <div className="flex items-center gap-2 text-gray-900 text-sm font-bold">
                                        <Users className="w-4 h-4 text-blue-600" />
                                        Grupos
                                    </div>
                                    <span className="text-2xl font-normal text-gray-500">{missionData.stats.groups}</span>
                                </div>
                                <div className="w-px h-10 bg-gray-200" />
                                <div className="flex flex-col items-center gap-1">
                                    <div className="flex items-center gap-2 text-gray-900 text-sm font-bold">
                                        <Users className="w-4 h-4 text-blue-600" />
                                        Viajantes
                                    </div>
                                    <span className="text-2xl font-normal text-gray-500">{missionData.stats.travelers}</span>
                                </div>
                                <div className="w-px h-10 bg-gray-200" />
                                <div className="flex flex-col items-center gap-1">
                                    <div className="flex items-center gap-2 text-gray-900 text-sm font-bold">
                                        <User className="w-4 h-4 text-blue-600" />
                                        Guias
                                    </div>
                                    <span className="text-2xl font-normal text-gray-500">{missionData.stats.guides}</span>
                                </div>
                                <div className="w-px h-10 bg-gray-200" />
                                <div className="flex flex-col items-center gap-1">
                                    <div className="flex items-center gap-2 text-gray-900 text-sm font-bold">
                                        <Map className="w-4 h-4 text-blue-600" />
                                        Cidades
                                    </div>
                                    <span className="text-2xl font-normal text-gray-500">{missionData.stats.cities}</span>
                                </div>
                                <div className="w-px h-10 bg-gray-200" />
                                <div className="flex flex-col items-center gap-1">
                                    <div className="flex items-center gap-2 text-gray-900 text-sm font-bold">
                                        <MapPinned className="w-4 h-4 text-blue-600" />
                                        Visitas
                                    </div>
                                    <span className="text-2xl font-normal text-gray-500">{missionData.stats.visits}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bottom part: TabsList */}
                    <div className="px-4 mt-4 pb-4">
                        <TabsList className="h-auto w-full justify-start gap-0 !bg-transparent !p-0 !border-none !rounded-none !shadow-none !drop-shadow-none">
                            <TabsTrigger
                                value="grupos"
                                className="h-auto !flex-none !rounded-none !border-0 !border-b-0 !px-6 !py-3 text-gray-500 font-medium data-[state=active]:!border-b-[3px] data-[state=active]:!border-blue-600 data-[state=active]:!text-gray-900 data-[state=active]:!bg-transparent data-[state=active]:!shadow-none hover:text-gray-700 transition-colors gap-2 focus-visible:!ring-0"
                            >
                                {isNew && <AlertTriangle className="w-4 h-4 text-red-500" />}
                                Grupos
                            </TabsTrigger>
                            <TabsTrigger
                                value="guias"
                                className="h-auto !flex-none !rounded-none !border-0 !border-b-0 !px-6 !py-3 text-gray-500 font-medium data-[state=active]:!border-b-[3px] data-[state=active]:!border-blue-600 data-[state=active]:!text-gray-900 data-[state=active]:!bg-transparent data-[state=active]:!shadow-none hover:text-gray-700 transition-colors gap-2 focus-visible:!ring-0"
                            >
                                {isNew && <AlertTriangle className="w-4 h-4 text-red-500" />}
                                Guias
                            </TabsTrigger>
                            <TabsTrigger
                                value="viajantes"
                                className="h-auto !flex-none !rounded-none !border-0 !border-b-0 !px-6 !py-3 text-gray-500 font-medium data-[state=active]:!border-b-[3px] data-[state=active]:!border-blue-600 data-[state=active]:!text-gray-900 data-[state=active]:!bg-transparent data-[state=active]:!shadow-none hover:text-gray-700 transition-colors gap-2 focus-visible:!ring-0"
                            >
                                {isNew && <AlertTriangle className="w-4 h-4 text-red-500" />}
                                Viajantes
                            </TabsTrigger>
                            <TabsTrigger
                                value="despesas"
                                className="h-auto !flex-none !rounded-none !border-0 !border-b-0 !px-6 !py-3 text-gray-500 font-medium data-[state=active]:!border-b-[3px] data-[state=active]:!border-blue-600 data-[state=active]:!text-gray-900 data-[state=active]:!bg-transparent data-[state=active]:!shadow-none hover:text-gray-700 transition-colors focus-visible:!ring-0"
                            >
                                Despesas gerais
                            </TabsTrigger>
                        </TabsList>
                    </div>
                </div>

                {/* Tabs Content Area */}
                <div className="flex-1 min-h-0">
                    <TabsContent value="grupos" className="h-full mt-0 border-none p-0 data-[state=inactive]:hidden">
                        <MissionGroupsTab
                            missionId={id}
                            isEmpty={isNew}
                            missionStart={isNew ? undefined : new Date(2025, 6, 2)}
                            missionEnd={isNew ? undefined : new Date(2025, 6, 30)}
                        />
                    </TabsContent>
                    <TabsContent value="guias" className="h-full mt-0 border-none p-0 data-[state=inactive]:hidden">
                        <MissionGuidesTab missionId={id} isEmpty={isNew} />
                    </TabsContent>
                    <TabsContent value="viajantes" className="h-full mt-0 border-none p-0 data-[state=inactive]:hidden">
                        <MissionTravelersTab missionId={id} isEmpty={isNew} />
                    </TabsContent>
                    <TabsContent value="despesas" className="h-full mt-0 border-none p-0 data-[state=inactive]:hidden">
                        <MissionExpensesTab isEmpty={isNew} missionId={id} />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}
