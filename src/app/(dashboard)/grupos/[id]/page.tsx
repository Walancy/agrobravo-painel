"use client"

import * as React from "react"
import { MapPin, Users, User, Map, MapPinned, ChevronUp, ChevronDown, Pencil, Download, ExternalLink, RefreshCw, Clock, AlertTriangle, Maximize2, Minimize2, Calendar, LayoutList } from "lucide-react"
import { format } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLayout } from "@/context/LayoutContext"
import dynamic from "next/dynamic"

// Lazy load tab components
const GroupGuidesTab = dynamic(() => import("@/components/group/GroupGuidesTab").then(mod => mod.GroupGuidesTab), { ssr: false })
const GroupTravelersTab = dynamic(() => import("@/components/group/GroupTravelersTab").then(mod => mod.GroupTravelersTab), { ssr: false })
const GroupNotificationsTab = dynamic(() => import("@/components/group/GroupNotificationsTab").then(mod => mod.GroupNotificationsTab), { ssr: false })
const GroupFinancialTab = dynamic(() => import("@/components/group/GroupFinancialTab").then(mod => mod.GroupFinancialTab), { ssr: false })
const GroupMaterialsTab = dynamic(() => import("@/components/group/GroupMaterialsTab").then(mod => mod.GroupMaterialsTab), { ssr: false })
const GroupItineraryTab = dynamic(() => import("@/components/itinerary/GroupItineraryTab").then(mod => mod.GroupItineraryTab), { ssr: false })
const SwitchGroupModal = dynamic(() => import("@/components/group/SwitchGroupModal").then(mod => mod.SwitchGroupModal), { ssr: false })

export default function GroupDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params)
    const { isExpanded, toggleExpanded } = useLayout()
    const [isMicroView, setIsMicroView] = React.useState(false)
    const [imageSrc, setImageSrc] = React.useState("https://github.com/shadcn.png")
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const [group, setGroup] = React.useState<any>(null)
    const [isLoading, setIsLoading] = React.useState(true)
    const [isSwitchGroupOpen, setIsSwitchGroupOpen] = React.useState(false)
    const [activeTab, setActiveTab] = React.useState("itinerario")
    const financialTabRef = React.useRef<any>(null)
    const isNew = id === "new"
    const [alerts, setAlerts] = React.useState({ travelers: false, financial: false, itinerary: false, guides: false, quoting: false })
    const [viewMode, setViewMode] = React.useState<'list' | 'calendar'>('list')

    const updateAlert = React.useCallback((key: keyof typeof alerts, value: boolean) => {
        setAlerts(prev => {
            if (prev[key] === value) return prev;
            return { ...prev, [key]: value };
        })
    }, [])

    const handleItineraryAlert = React.useCallback((val: boolean) => updateAlert('itinerary', val), [updateAlert])
    const handleQuotingAlert = React.useCallback((val: boolean) => updateAlert('quoting', val), [updateAlert])
    const handleTravelersAlert = React.useCallback((val: boolean) => updateAlert('travelers', val), [updateAlert])
    const handleFinancialAlert = React.useCallback((val: boolean) => updateAlert('financial', val), [updateAlert])
    const handleGuidesAlert = React.useCallback((val: boolean) => updateAlert('guides', val), [updateAlert])

    // Date Editing State
    const [isDateEditOpen, setIsDateEditOpen] = React.useState(false)
    const [editStartDate, setEditStartDate] = React.useState("")
    const [editEndDate, setEditEndDate] = React.useState("")

    const handleDateSave = async () => {
        if (!group) return
        try {
            const { groupsService } = await import("@/services/groupsService")
            const updatedGroup = await groupsService.updateGroup(id, {
                data_inicio: editStartDate,
                data_fim: editEndDate
            })
            setGroup(updatedGroup)
            setIsDateEditOpen(false)
        } catch (error) {
            console.error("Error updating dates:", error)
        }
    }

    React.useEffect(() => {
        const fetchGroup = async () => {
            if (isNew) return
            try {
                setIsLoading(true)
                const { groupsService } = await import("@/services/groupsService")
                const data = await groupsService.getGroupById(id)
                setGroup(data)
                if (data.logo) setImageSrc(data.logo)
            } catch (error) {
                console.error("Error fetching group:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchGroup()
    }, [id, isNew])

    const groupData = React.useMemo(() => {
        if (!group) return {
            name: "Carregando...",
            region: "-",
            dates: "- / - / -",
            days: 0,
            stats: { travelers: 0, guides: 0, cities: 0, visits: 0 }
        }

        // Append T12:00:00 to ensure date is interpreted in the middle of the day, avoiding timezone shifts
        const start = group.data_inicio ? new Date(group.data_inicio.split('T')[0] + 'T12:00:00') : null
        const end = group.data_fim ? new Date(group.data_fim.split('T')[0] + 'T12:00:00') : null

        const daysDiff = start && end ? Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) : 0

        return {
            name: group.nome,
            region: group.missoes?.continente || "-", // Assuming backend join missoes(continente)
            dates: `${start ? format(start, "dd/MM/yyyy") : "-"} - ${end ? format(end, "dd/MM/yyyy") : "-"}`,
            days: daysDiff,
            stats: {
                travelers: group.participants_count || 0, // Using virtual field from service
                guides: group.guides_count || 0,
                events: group.events_count || 0
            }
        }
    }, [group])

    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file && group) {
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

                // Upload to same bucket 'mission-logos' or maybe 'group-logos'?
                // Reusing mission-logos for simplicity as per previous context
                const { error: uploadError } = await supabase.storage
                    .from('mission-logos')
                    .upload(filePath, file)

                if (!uploadError) {
                    const { data: { publicUrl } } = supabase.storage
                        .from('mission-logos')
                        .getPublicUrl(filePath)

                    const { groupsService } = await import("@/services/groupsService")
                    await groupsService.updateGroup(id, { logo: publicUrl })
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
            {group && (
                <SwitchGroupModal
                    open={isSwitchGroupOpen}
                    onOpenChange={setIsSwitchGroupOpen}
                    missionId={group.missao_id}
                    currentGroupId={id}
                />
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full gap-4">
                {/* Header Card containing Info AND TabsList */}
                <div className="bg-white flex flex-col shrink-0 relative transition-all duration-300 rounded-xl">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-12 h-8 w-8 text-gray-400 hover:text-gray-600 z-10"
                        onClick={toggleExpanded}
                        title={isExpanded ? "Restaurar visualização" : "Expandir tela"}
                    >
                        {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 text-gray-400 hover:text-gray-600 z-10"
                        onClick={() => setIsMicroView(!isMicroView)}
                    >
                        {isMicroView ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                    </Button>

                    {isMicroView ? (
                        /* Micro View: Avatar + Tabs in one line */
                        <div className="p-3 flex items-center gap-4">
                            <Avatar className="h-12 w-12 rounded-full shadow-sm shrink-0 border-2 border-white">
                                <AvatarImage src={imageSrc} alt="Group Logo" className="object-cover" />
                                <AvatarFallback>{groupData.name?.charAt(0).toUpperCase() || "G"}</AvatarFallback>
                            </Avatar>

                            <TabsList className="h-auto flex-1 justify-start gap-0 !bg-transparent !p-0 !border-none !rounded-none !shadow-none !drop-shadow-none overflow-x-auto">
                                <TabsTrigger
                                    value="itinerario"
                                    className="h-auto !flex-none !rounded-none !border-0 !border-b-0 !px-4 !py-2 text-gray-500 text-sm font-medium data-[state=active]:!border-b-[3px] data-[state=active]:!border-blue-600 data-[state=active]:!text-gray-900 data-[state=active]:!bg-transparent data-[state=active]:!shadow-none hover:text-gray-700 transition-colors gap-2 focus-visible:!ring-0"
                                >
                                    {alerts.itinerary && <AlertTriangle className="w-3 h-3 text-red-500" />}
                                    {alerts.quoting && !alerts.itinerary && <Clock className="w-3 h-3 text-orange-500" />}
                                    Itinerário
                                </TabsTrigger>
                                <TabsTrigger
                                    value="guias"
                                    className="h-auto !flex-none !rounded-none !border-0 !border-b-0 !px-4 !py-2 text-gray-500 text-sm font-medium data-[state=active]:!border-b-[3px] data-[state=active]:!border-blue-600 data-[state=active]:!text-gray-900 data-[state=active]:!bg-transparent data-[state=active]:!shadow-none hover:text-gray-700 transition-colors gap-2 focus-visible:!ring-0"
                                >
                                    {(isNew || alerts.guides) && <AlertTriangle className="w-3 h-3 text-red-500" />}
                                    Guias
                                </TabsTrigger>
                                <TabsTrigger
                                    value="viajantes"
                                    className="h-auto !flex-none !rounded-none !border-0 !border-b-0 !px-4 !py-2 text-gray-500 text-sm font-medium data-[state=active]:!border-b-[3px] data-[state=active]:!border-blue-600 data-[state=active]:!text-gray-900 data-[state=active]:!bg-transparent data-[state=active]:!shadow-none hover:text-gray-700 transition-colors gap-2 focus-visible:!ring-0"
                                >
                                    {(isNew || alerts.travelers) && <AlertTriangle className="w-3 h-3 text-red-500" />}
                                    Viajantes
                                </TabsTrigger>
                                <TabsTrigger
                                    value="notificacoes"
                                    className="h-auto !flex-none !rounded-none !border-0 !border-b-0 !px-4 !py-2 text-gray-500 text-sm font-medium data-[state=active]:!border-b-[3px] data-[state=active]:!border-blue-600 data-[state=active]:!text-gray-900 data-[state=active]:!bg-transparent data-[state=active]:!shadow-none hover:text-gray-700 transition-colors focus-visible:!ring-0"
                                >
                                    Notificações
                                </TabsTrigger>
                                <TabsTrigger
                                    value="financeiro"
                                    className="h-auto !flex-none !rounded-none !border-0 !border-b-0 !px-4 !py-2 text-gray-500 text-sm font-medium data-[state=active]:!border-b-[3px] data-[state=active]:!border-blue-600 data-[state=active]:!text-gray-900 data-[state=active]:!bg-transparent data-[state=active]:!shadow-none hover:text-gray-700 transition-colors gap-2 focus-visible:!ring-0"
                                >
                                    {(isNew || alerts.financial) && <AlertTriangle className="w-3 h-3 text-red-500" />}
                                    Financeiro
                                </TabsTrigger>
                                <TabsTrigger
                                    value="materiais"
                                    className="h-auto !flex-none !rounded-none !border-0 !border-b-0 !px-4 !py-2 text-gray-500 text-sm font-medium data-[state=active]:!border-b-[3px] data-[state=active]:!border-blue-600 data-[state=active]:!text-gray-900 data-[state=active]:!bg-transparent data-[state=active]:!shadow-none hover:text-gray-700 transition-colors focus-visible:!ring-0"
                                >
                                    Materiais
                                </TabsTrigger>
                            </TabsList>
                        </div>
                    ) : (
                        /* Full View: Original Layout */
                        <>
                            {/* Top part: Info */}
                            <div className="p-4 pb-0 flex flex-col md:flex-row justify-between gap-4">
                                <div className="flex gap-4 items-center">
                                    <div className="relative">
                                        <Avatar className="h-24 w-24 rounded-full shadow-sm border-4 border-white">
                                            <AvatarImage src={imageSrc} alt="Group Logo" className="object-cover" />
                                            <AvatarFallback>{groupData.name?.charAt(0).toUpperCase() || "G"}</AvatarFallback>
                                        </Avatar>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                        <Button
                                            size="icon"
                                            className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md bg-white hover:bg-gray-50 border border-gray-200 text-gray-600"
                                            onClick={handleButtonClick}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <div className="group flex items-center gap-2 cursor-pointer rounded-md hover:bg-gray-50 px-2 -ml-2 transition-colors">
                                                        <h1 className="text-2xl font-semibold text-gray-900">{groupData.name}</h1>
                                                        <Pencil className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-80 p-0" align="start">
                                                    <form
                                                        className="p-4 flex flex-col gap-3"
                                                        onSubmit={async (e) => {
                                                            e.preventDefault()
                                                            const formData = new FormData(e.currentTarget)
                                                            const newName = formData.get('name') as string
                                                            if (!newName || !group) return
                                                            try {
                                                                const { groupsService } = await import("@/services/groupsService")
                                                                await groupsService.updateGroup(id, { nome: newName })
                                                                setGroup({ ...group, nome: newName })
                                                            } catch (error) {
                                                                console.error("Failed to update name", error)
                                                            }
                                                        }}
                                                    >
                                                        <div className="space-y-1">
                                                            <h4 className="font-medium leading-none">Editar Nome do Grupo</h4>
                                                            <p className="text-xs text-muted-foreground">O nome será atualizado para exibir na lista.</p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Input
                                                                name="name"
                                                                defaultValue={groupData.name}
                                                                autoFocus
                                                                className="h-9"
                                                            />
                                                            <Button type="submit" size="sm" className="h-9">Salvar</Button>
                                                        </div>
                                                    </form>
                                                </PopoverContent>
                                            </Popover>

                                            {!isNew && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full"
                                                    onClick={() => setIsSwitchGroupOpen(true)}
                                                    title="Trocar de grupo"
                                                >
                                                    <RefreshCw className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>

                                        <div className="flex flex-col items-start gap-2 text-gray-500 text-sm font-medium">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <div className="group flex items-center gap-2 cursor-pointer hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-md transition-colors -ml-2">
                                                        <MapPin className="w-4 h-4 text-blue-500" />
                                                        <span>{groupData.region}</span>
                                                        <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[300px] p-0" align="start">
                                                    <form
                                                        className="p-4 flex flex-col gap-3"
                                                        onSubmit={async (e) => {
                                                            e.preventDefault()
                                                            const formData = new FormData(e.currentTarget)
                                                            const newRegion = formData.get('region') as string
                                                            if (!newRegion || !group?.missao_id) return
                                                            try {
                                                                const { missionsService } = await import("@/services/missionsService")
                                                                const { groupsService } = await import("@/services/groupsService")
                                                                await missionsService.updateMission(group.missao_id, { continente: newRegion })
                                                                // Refresh group/mission data
                                                                const updatedGroup = await groupsService.getGroupById(id)
                                                                setGroup(updatedGroup)
                                                            } catch (error) {
                                                                console.error("Failed to update region", error)
                                                            }
                                                        }}
                                                    >
                                                        <div className="space-y-1">
                                                            <h4 className="font-medium leading-none">Editar Região/Continente</h4>
                                                            <p className="text-xs text-muted-foreground">Isso atualiza a Missão associada.</p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <select
                                                                name="region"
                                                                defaultValue={groupData.region}
                                                                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                <option value="América do Norte">América do Norte</option>
                                                                <option value="América do Sul">América do Sul</option>
                                                                <option value="Europa">Europa</option>
                                                                <option value="Ásia">Ásia</option>
                                                                <option value="África">África</option>
                                                                <option value="Oceania">Oceania</option>
                                                                <option value="Antártida">Antártida</option>
                                                            </select>
                                                            <Button type="submit" size="sm" className="h-9">Salvar</Button>
                                                        </div>
                                                    </form>
                                                </PopoverContent>
                                            </Popover>

                                            {/* Date Editor */}
                                            <Popover open={isDateEditOpen} onOpenChange={setIsDateEditOpen}>
                                                <PopoverTrigger asChild>
                                                    <div
                                                        className="text-gray-500 text-sm cursor-pointer hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-md transition-colors -ml-2 w-fit"
                                                        onClick={() => {
                                                            setEditStartDate(group.data_inicio ? group.data_inicio.split('T')[0] : '')
                                                            setEditEndDate(group.data_fim ? group.data_fim.split('T')[0] : '')
                                                        }}
                                                    >
                                                        {groupData.dates}
                                                    </div>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-80 p-4">
                                                    <div className="space-y-4">
                                                        <h4 className="font-medium leading-none">Editar Datas</h4>
                                                        <div className="grid gap-2">
                                                            <div className="grid grid-cols-3 items-center gap-4">
                                                                <Label htmlFor="start">Início</Label>
                                                                <Input
                                                                    id="start"
                                                                    type="date"
                                                                    className="col-span-2 h-8"
                                                                    value={editStartDate}
                                                                    onChange={(e) => setEditStartDate(e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="grid grid-cols-3 items-center gap-4">
                                                                <Label htmlFor="end">Fim</Label>
                                                                <Input
                                                                    id="end"
                                                                    type="date"
                                                                    className="col-span-2 h-8"
                                                                    value={editEndDate}
                                                                    onChange={(e) => setEditEndDate(e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                        <Button size="sm" className="w-full" onClick={handleDateSave}>
                                                            Salvar Alterações
                                                        </Button>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                            <div className="text-gray-900 font-medium text-sm">
                                                Dias de viagem: <span className="text-blue-600 font-bold">{groupData.days} dias</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-8 items-center pr-6">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="flex items-center gap-2 text-gray-900 text-sm font-bold">
                                            <Users className="w-4 h-4 text-blue-600" />
                                            Viajantes
                                        </div>
                                        <span className="text-2xl font-normal text-gray-500">{groupData.stats.travelers}</span>
                                    </div>
                                    <div className="w-px h-10 bg-gray-200" />
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="flex items-center gap-2 text-gray-900 text-sm font-bold">
                                            <User className="w-4 h-4 text-blue-600" />
                                            Guias
                                        </div>
                                        <span className="text-2xl font-normal text-gray-500">{groupData.stats.guides}</span>
                                    </div>
                                    <div className="w-px h-10 bg-gray-200" />
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="flex items-center gap-2 text-gray-900 text-sm font-bold">
                                            <Map className="w-4 h-4 text-blue-600" />
                                            Eventos
                                        </div>
                                        <span className="text-2xl font-normal text-gray-500">{groupData.stats.events}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom part: TabsList and Actions */}
                            <div className="px-4 mt-4 pb-4 flex flex-col md:flex-row justify-between items-end gap-4">
                                <TabsList className="h-auto w-full md:w-auto justify-start gap-0 !bg-transparent !p-0 !border-none !rounded-none !shadow-none !drop-shadow-none overflow-x-auto">
                                    <TabsTrigger
                                        value="itinerario"
                                        className="h-auto !flex-none !rounded-none !border-0 !border-b-0 !px-6 !py-3 text-gray-500 font-medium data-[state=active]:!border-b-[3px] data-[state=active]:!border-blue-600 data-[state=active]:!text-gray-900 data-[state=active]:!bg-transparent data-[state=active]:!shadow-none hover:text-gray-700 transition-colors gap-2 focus-visible:!ring-0"
                                    >
                                        {alerts.itinerary && <AlertTriangle className="w-4 h-4 text-red-500" />}
                                        {alerts.quoting && !alerts.itinerary && <Clock className="w-4 h-4 text-orange-500" />}
                                        Itinerário
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="guias"
                                        className="h-auto !flex-none !rounded-none !border-0 !border-b-0 !px-6 !py-3 text-gray-500 font-medium data-[state=active]:!border-b-[3px] data-[state=active]:!border-blue-600 data-[state=active]:!text-gray-900 data-[state=active]:!bg-transparent data-[state=active]:!shadow-none hover:text-gray-700 transition-colors gap-2 focus-visible:!ring-0"
                                    >
                                        {(isNew || alerts.guides) && <AlertTriangle className="w-4 h-4 text-red-500" />}
                                        Guias
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="viajantes"
                                        className="h-auto !flex-none !rounded-none !border-0 !border-b-0 !px-6 !py-3 text-gray-500 font-medium data-[state=active]:!border-b-[3px] data-[state=active]:!border-blue-600 data-[state=active]:!text-gray-900 data-[state=active]:!bg-transparent data-[state=active]:!shadow-none hover:text-gray-700 transition-colors gap-2 focus-visible:!ring-0"
                                    >
                                        {(isNew || alerts.travelers) && <AlertTriangle className="w-4 h-4 text-red-500" />}
                                        Viajantes
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="notificacoes"
                                        className="h-auto !flex-none !rounded-none !border-0 !border-b-0 !px-6 !py-3 text-gray-500 font-medium data-[state=active]:!border-b-[3px] data-[state=active]:!border-blue-600 data-[state=active]:!text-gray-900 data-[state=active]:!bg-transparent data-[state=active]:!shadow-none hover:text-gray-700 transition-colors focus-visible:!ring-0"
                                    >
                                        Notificações
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="financeiro"
                                        className="h-auto !flex-none !rounded-none !border-0 !border-b-0 !px-6 !py-3 text-gray-500 font-medium data-[state=active]:!border-b-[3px] data-[state=active]:!border-blue-600 data-[state=active]:!text-gray-900 data-[state=active]:!bg-transparent data-[state=active]:!shadow-none hover:text-gray-700 transition-colors gap-2 focus-visible:!ring-0"
                                    >
                                        {(isNew || alerts.financial) && <AlertTriangle className="w-4 h-4 text-red-500" />}
                                        Financeiro
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="materiais"
                                        className="h-auto !flex-none !rounded-none !border-0 !border-b-0 !px-6 !py-3 text-gray-500 font-medium data-[state=active]:!border-b-[3px] data-[state=active]:!border-blue-600 data-[state=active]:!text-gray-900 data-[state=active]:!bg-transparent data-[state=active]:!shadow-none hover:text-gray-700 transition-colors focus-visible:!ring-0"
                                    >
                                        Materiais
                                    </TabsTrigger>
                                </TabsList>

                                <div className="flex gap-3 pb-2 shrink-0">
                                    {activeTab === "financeiro" && (
                                        <Button
                                            variant="outline"
                                            className="rounded-lg border-blue-600 text-gray-700 hover:bg-blue-50 h-10 px-6"
                                            onClick={() => financialTabRef.current?.downloadPDF()}
                                        >
                                            Baixar balanço
                                            <Download className="ml-2 w-4 h-4" />
                                        </Button>
                                    )}
                                    {activeTab === "itinerario" && (
                                        <>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="rounded-lg border-blue-600 text-gray-700 hover:bg-blue-50 h-10 w-10"
                                                onClick={() => setViewMode(prev => prev === 'list' ? 'calendar' : 'list')}
                                                title={viewMode === 'list' ? "Visualizar Calendário" : "Visualizar Lista"}
                                            >
                                                {viewMode === 'list' ? <Calendar className="w-4 h-4" /> : <LayoutList className="w-4 h-4" />}
                                            </Button>
                                            <Button variant="outline" className="rounded-lg border-blue-600 text-gray-700 hover:bg-blue-50 h-10 px-6">
                                                Baixar planejamento
                                                <Download className="ml-2 w-4 h-4" />
                                            </Button>
                                        </>
                                    )}
                                    <Button variant="outline" className="rounded-lg border-blue-600 text-gray-700 hover:bg-blue-50 h-10 px-6">
                                        Página de vendas
                                        <ExternalLink className="ml-2 w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Content Area */}
                <div className="flex-1 min-h-0">
                    <TabsContent value="itinerario" className="h-full mt-0 border-none p-0 data-[state=inactive]:hidden">
                        <GroupItineraryTab
                            isEmpty={isNew}
                            onConflictChange={handleItineraryAlert}
                            onQuotingChange={handleQuotingAlert}
                            groupId={id}
                            startDate={group?.data_inicio}
                            endDate={group?.data_fim}
                            viewMode={viewMode}
                        />
                    </TabsContent>
                    <TabsContent value="guias" className="h-full mt-0 border-none p-0 data-[state=inactive]:hidden">
                        <GroupGuidesTab groupId={id} onAlertChange={handleGuidesAlert} />
                    </TabsContent>
                    <TabsContent value="viajantes" className="h-full mt-0 border-none p-0 data-[state=inactive]:hidden">
                        <GroupTravelersTab groupId={id} vacancies={group?.vagas || 0} isEmpty={isNew} onAlertChange={handleTravelersAlert} />
                    </TabsContent>
                    <TabsContent value="notificacoes" className="h-full mt-0 border-none p-0 data-[state=inactive]:hidden">
                        <GroupNotificationsTab isEmpty={isNew} missionId={group?.missao_id} groupId={id} />
                    </TabsContent>
                    <TabsContent value="financeiro" className="h-full mt-0 border-none p-0 data-[state=inactive]:hidden">
                        <GroupFinancialTab
                            isEmpty={isNew}
                            groupId={id}
                            ref={financialTabRef}
                            onAlertChange={handleFinancialAlert}
                            startDate={group?.data_inicio}
                            endDate={group?.data_fim}
                            activeTab={activeTab}
                        />
                    </TabsContent>
                    <TabsContent value="materiais" className="h-full mt-0 border-none p-0 data-[state=inactive]:hidden">
                        <GroupMaterialsTab isEmpty={isNew} groupId={id} />
                    </TabsContent>
                </div>
            </Tabs >
        </div >
    )
}
