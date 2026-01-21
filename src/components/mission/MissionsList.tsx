"use client"

import * as React from "react"
import { CalendarIcon, Eye, Trash2, Search, Plus } from "lucide-react"
import { format } from "date-fns"
import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { NewMissionModal } from "@/components/create/NewMissionModal"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { missionsService, Mission } from "@/services/missionsService"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

export function MissionsList() {
    const [startDate, setStartDate] = React.useState<Date>()
    const [endDate, setEndDate] = React.useState<Date>()
    const [currentPage, setCurrentPage] = React.useState(1)
    const [isNewMissionModalOpen, setIsNewMissionModalOpen] = React.useState(false)
    const [missions, setMissions] = React.useState<Mission[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const router = useRouter()
    const itemsPerPage = 5

    const fetchMissions = React.useCallback(async () => {
        try {
            setIsLoading(true)
            const data = await missionsService.getAllMissions()
            setMissions(data)
        } catch (error) {
            console.error("Error fetching missions:", error)
            toast.error("Erro ao carregar missões")
        } finally {
            setIsLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchMissions()
    }, [fetchMissions])

    const handleNewMissionSave = async (data: any) => {
        try {
            let logoUrl = null

            // Upload logo if present
            if (data.logo) {
                const supabase = createClient()
                const fileExt = data.logo.name.split('.').pop()
                const fileName = `${Math.random()}.${fileExt}`
                const filePath = `${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('mission-logos')
                    .upload(filePath, data.logo)

                if (uploadError) {
                    console.error('Error uploading logo:', uploadError)
                    toast.error("Erro ao fazer upload da logo")
                    // Proceed without logo or return? Let's proceed.
                } else {
                    const { data: { publicUrl } } = supabase.storage
                        .from('mission-logos')
                        .getPublicUrl(filePath)
                    logoUrl = publicUrl
                }
            }

            // Map frontend form data to backend schema
            const docs = Array.isArray(data.documents) ? data.documents.filter((d: string) => d.trim() !== "") : []

            const missionPayload = {
                nome: data.name,
                continente: data.region,
                paises: data.countries,
                data_inicio: data.startDate,
                data_fim: data.endDate,
                documentos_exigidos: docs,
                observacoes: data.observations,
                status: 'Planejado',
                logo: logoUrl
            }
            await missionsService.createMission(missionPayload)
            toast.success("Missão criada com sucesso")
            setIsNewMissionModalOpen(false)
            fetchMissions()
        } catch (error) {
            console.error("Error creating mission:", error)
            toast.error("Erro ao criar missão")
        }
    }

    const handleDeleteMission = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir esta missão?")) return

        try {
            await missionsService.deleteMission(id)
            toast.success("Missão excluída com sucesso")
            fetchMissions()
        } catch (error) {
            console.error("Error deleting mission:", error)
            toast.error("Erro ao excluir missão")
        }
    }

    const totalPages = Math.ceil(missions.length / itemsPerPage)
    const currentMissions = missions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const columns: ColumnDef<Mission>[] = [
        {
            accessorKey: "nome",
            header: "Nome da Missão",
            cell: ({ row }) => (
                <Link href={`/missoes/${row.original.id}`} className="flex items-center gap-3 pl-2 hover:opacity-80 transition-opacity">
                    {row.original.logo ? (
                        <img
                            src={row.original.logo}
                            alt={row.getValue("nome")}
                            className="h-8 w-8 rounded-full object-cover border border-gray-200"
                        />
                    ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                            <span className="text-xs text-gray-500 font-medium">
                                {String(row.getValue("nome")).charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                    <span className="text-gray-900 font-semibold">{row.getValue("nome")}</span>
                </Link>
            ),
        },
        {
            accessorKey: "created_at",
            header: "Data de criação",
            cell: ({ row }) => <span className="text-gray-600 font-medium">{row.getValue("created_at") ? format(new Date(row.getValue("created_at")), "dd/MM/yyyy") : "-"}</span>,
        },
        {
            accessorKey: "continente",
            header: "Destino",
            cell: ({ row }) => <span className="text-gray-900 font-medium">{row.getValue("continente") || "-"}</span>,
        },
        {
            accessorKey: "custo_cotado",
            header: "Custo cotado",
            cell: ({ row }) => <span className="text-gray-900 font-medium">{row.getValue("custo_cotado") ? `R$ ${row.getValue("custo_cotado")}` : "-"}</span>,
        },
        {
            accessorKey: "custo_atingido",
            header: "Custo atingido",
            cell: ({ row }) => <span className="text-gray-900 font-medium">{row.getValue("custo_atingido") ? `R$ ${row.getValue("custo_atingido")}` : "-"}</span>,
        },
        {
            id: "groups", // Placeholder for groups count if we had it
            header: ({ column }) => <div className="text-center">Grupos</div>,
            cell: ({ row }) => <div className="text-center text-gray-900 font-medium">-</div>,
        },
        {
            accessorKey: "status",
            header: ({ column }) => <div className="text-center">Status</div>,
            cell: ({ row }) => {
                const status = row.getValue("status") as string
                return (
                    <div className="text-center">
                        <Badge
                            variant="secondary"
                            className={cn(
                                "font-medium rounded-full px-4 py-1 text-xs border-none shadow-none",
                                status === "Pendente" && "bg-red-100 text-red-600",
                                status === "Iniciado" && "bg-blue-100 text-blue-600",
                                status === "Planejado" && "bg-orange-100 text-orange-600",
                                status === "Finalizado" && "bg-green-100 text-green-600"
                            )}
                        >
                            {status}
                        </Badge>
                    </div>
                )
            },
        },
        {
            accessorKey: "data_inicio",
            header: "Data de início",
            cell: ({ row }) => <span className="text-gray-600 font-medium">{row.getValue("data_inicio") ? format(new Date(row.getValue("data_inicio")), "dd/MM/yyyy") : "-"}</span>,
        },
        {
            accessorKey: "data_fim",
            header: "Data de fim",
            cell: ({ row }) => <span className="text-gray-600 font-medium">{row.getValue("data_fim") ? format(new Date(row.getValue("data_fim")), "dd/MM/yyyy") : "-"}</span>,
        },
        {
            accessorKey: "criado_por",
            header: "Criado por",
            cell: ({ row }) => {
                const criador = row.original.criador
                return <span className="text-gray-900 font-medium truncate max-w-[100px]">{criador?.nome || "-"}</span>
            },
        },
        {
            id: "actions",
            header: ({ column }) => <div className="text-right pr-4">Ações</div>,
            cell: ({ row }) => {
                return (
                    <div className="flex justify-end gap-1 pr-2">
                        <Link href={`/missoes/${row.original.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full">
                                <Eye className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                            onClick={() => handleDeleteMission(row.original.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                )
            },
        },
    ]

    return (
        <div className="flex flex-col h-full space-y-6 bg-white p-6 rounded-xl">
            {/* Filters Bar */}
            <div className="flex flex-col xl:flex-row gap-6 items-end justify-between shrink-0">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Pesquisar"
                        className="pl-10 h-12 bg-transparent rounded-2xl border-gray-200 w-full text-base shadow-none"
                    />
                </div>

                <div className="flex flex-wrap gap-4 items-end w-full xl:w-auto">
                    <div className="relative">
                        <span className="absolute -top-2 left-4 bg-white px-1 text-xs text-gray-500 z-10">
                            Data de inicio*
                        </span>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-[170px] h-12 justify-between text-left font-normal rounded-2xl border-gray-200 bg-transparent hover:bg-transparent hover:text-foreground",
                                        !startDate && "text-muted-foreground"
                                    )}
                                >
                                    {startDate ? format(startDate, "dd/MM/yyyy") : <span className="text-gray-500">--/--/----</span>}
                                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={startDate}
                                    onSelect={setStartDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="relative">
                        <span className="absolute -top-2 left-4 bg-white px-1 text-xs text-gray-500 z-10">
                            Data de fim*
                        </span>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-[170px] h-12 justify-between text-left font-normal rounded-2xl border-gray-200 bg-transparent hover:bg-transparent hover:text-foreground",
                                        !endDate && "text-muted-foreground"
                                    )}
                                >
                                    {endDate ? format(endDate, "dd/MM/yyyy") : <span className="text-gray-500">--/--/----</span>}
                                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={endDate}
                                    onSelect={setEndDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <Button onClick={() => setIsNewMissionModalOpen(true)}>
                        Nova missão <Plus className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-hidden">
                <DataTable columns={columns} data={currentMissions} />
            </div>

            {/* Pagination */}
            <div className="flex justify-end items-center gap-2 pt-4 shrink-0">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                        key={page}
                        variant="outline"
                        size="icon"
                        className={cn(
                            "h-7 w-7 rounded-lg text-xs font-medium transition-colors shadow-none",
                            currentPage === page
                                ? "border border-blue-600 text-blue-600 bg-white hover:bg-blue-50"
                                : "border-none bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                        )}
                        onClick={() => setCurrentPage(page)}
                    >
                        {page}
                    </Button>
                ))}
            </div>
            <NewMissionModal
                open={isNewMissionModalOpen}
                onOpenChange={setIsNewMissionModalOpen}
                onSave={handleNewMissionSave}
            />
        </div>
    )
}
