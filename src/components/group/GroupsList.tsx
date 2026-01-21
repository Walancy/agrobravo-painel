"use client"

import * as React from "react"
import { CalendarIcon, Eye, Trash2, Search, RefreshCw, Pencil } from "lucide-react"
import { format } from "date-fns"
import { ColumnDef } from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { groupsService, MissionGroup } from "@/services/groupsService"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function GroupsList() {
    const router = useRouter()
    const [startDate, setStartDate] = React.useState<Date>()
    const [endDate, setEndDate] = React.useState<Date>()
    const [currentPage, setCurrentPage] = React.useState(1)
    const [groups, setGroups] = React.useState<MissionGroup[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const itemsPerPage = 8

    const fetchGroups = React.useCallback(async () => {
        try {
            setIsLoading(true)
            const data = await groupsService.getAllGroups()
            setGroups(data)
        } catch (error) {
            console.error("Error fetching groups:", error)
            toast.error("Erro ao carregar grupos")
        } finally {
            setIsLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchGroups()
    }, [fetchGroups])

    const handleDeleteGroup = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este grupo?")) return

        try {
            await groupsService.deleteGroup(id)
            toast.success("Grupo excluído com sucesso")
            fetchGroups()
        } catch (error) {
            console.error("Error deleting group:", error)
            toast.error("Erro ao excluir grupo")
        }
    }

    const totalPages = Math.ceil(groups.length / itemsPerPage)
    const currentGroups = groups.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const formatBRL = (value: number | null | undefined) => {
        if (value === null || value === undefined) return "-"
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value)
    }

    const columns: ColumnDef<MissionGroup>[] = [
        {
            accessorKey: "nome",
            header: "Nome do grupo",
            cell: ({ row }) => (
                <div className="flex items-center gap-3 pl-2 group cursor-pointer">
                    <Avatar className="h-8 w-8 border border-gray-100 shadow-sm group-hover:ring-2 group-hover:ring-blue-100 transition-all">
                        <AvatarImage src={row.original.logo || ""} alt={row.getValue("nome")} className="object-cover" />
                        <AvatarFallback className="bg-blue-50 text-blue-600 font-bold text-xs">
                            {(row.getValue("nome") as string).substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors uppercase text-xs tracking-wider">{row.getValue("nome")}</span>
                </div>
            ),
        },
        {
            accessorKey: "missionName",
            header: "Missão",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border border-gray-100 shadow-sm">
                        <AvatarImage src={row.original.missionLogo || ""} alt={row.getValue("missionName")} className="object-cover" />
                        <AvatarFallback className="bg-gray-50 text-gray-400 font-bold text-[10px]">
                            {(row.getValue("missionName") as string).substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <span className="text-gray-900 font-bold uppercase text-[11px] tracking-wider truncate max-w-[150px]">
                        {row.getValue("missionName")}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: "participants_count",
            header: ({ column }) => <div className="text-center">Participantes</div>,
            cell: ({ row }) => <div className="text-center font-medium text-gray-900">{row.original.participants_count || 0}</div>,
        },
        {
            accessorKey: "guides_count",
            header: ({ column }) => <div className="text-center">Nº de Guias</div>,
            cell: ({ row }) => <div className="text-center font-medium text-gray-900">{row.original.guides_count || 0}</div>,
        },
        {
            accessorKey: "custo_cotado",
            header: "Custo cotado",
            cell: ({ row }) => <span className="text-gray-900 font-medium">{formatBRL(row.original.custo_cotado)}</span>,
        },
        {
            accessorKey: "custo_atingido",
            header: "Custo atingido",
            cell: ({ row }) => (
                <span className={cn(
                    "font-medium",
                    (row.original.custo_atingido || 0) > (row.original.custo_cotado || 0) && (row.original.custo_cotado || 0) > 0
                        ? "text-red-600"
                        : "text-gray-900"
                )}>
                    {formatBRL(row.original.custo_atingido)}
                </span>
            ),
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
                                status === "Cancelada" && "bg-red-100 text-red-600",
                                status === "Planejada" && "bg-blue-100 text-blue-600",
                                status === "Em andamento" && "bg-green-100 text-green-600"
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
            id: "actions",
            header: ({ column }) => <div className="text-right pr-4">Ações</div>,
            cell: ({ row }) => {
                return (
                    <div className="flex justify-end gap-1 pr-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                            onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/grupos/${row.original.id}`)
                            }}
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full">
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                            onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteGroup(row.original.id)
                            }}
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

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={fetchGroups}
                        className="h-12 w-12 rounded-2xl border border-gray-200 bg-transparent hover:bg-gray-50"
                        title="Atualizar"
                    >
                        <RefreshCw className={cn("h-5 w-5", isLoading && "animate-spin")} />
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-hidden">
                <DataTable
                    columns={columns}
                    data={currentGroups}
                    onRowClick={(row) => router.push(`/grupos/${row.original.id}`)}
                />
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
        </div>
    )
}
