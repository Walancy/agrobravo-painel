"use client"

import * as React from "react"
import { Eye, Trash2, Search, Plus, Pencil, AlertCircle, Loader2, RefreshCw } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type Traveler = {
    id: string
    name: string
    email: string
    phone: string
    missions: number
    documents: number
    lastMission: string
    pendingDocs: number
    photo?: string
    actions: string
}



import { travelersService } from "@/services/travelersService"

import { useRouter } from "next/navigation"

export function TravelersList() {
    const router = useRouter()
    const [travelers, setTravelers] = React.useState<any[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [searchTerm, setSearchTerm] = React.useState("")
    const [currentPage, setCurrentPage] = React.useState(1)
    const [missionFilter, setMissionFilter] = React.useState("all")
    const [groupFilter, setGroupFilter] = React.useState("all")
    const [statusFilter, setStatusFilter] = React.useState("all")
    const [sorting, setSorting] = React.useState<any[]>([])
    const itemsPerPage = 8

    const fetchTravelers = async () => {
        try {
            setIsLoading(true)
            const data = await travelersService.getAllTravelers()
            setTravelers(data)
        } catch (error) {
            console.error("Error fetching travelers:", error)
        } finally {
            setIsLoading(false)
        }
    }

    React.useEffect(() => {
        fetchTravelers()
    }, [])

    const filteredTravelers = React.useMemo(() => {
        let result = travelers.filter(traveler => {
            const matchesSearch = traveler.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                traveler.email.toLowerCase().includes(searchTerm.toLowerCase())
            return matchesSearch
        })

        if (sorting.length > 0) {
            const { id, desc } = sorting[0]
            result.sort((a, b) => {
                const valA = a[id]
                const valB = b[id]

                if (typeof valA === 'string' && typeof valB === 'string') {
                    return desc ? valB.localeCompare(valA) : valA.localeCompare(valB)
                }
                if (valA < valB) return desc ? 1 : -1
                if (valA > valB) return desc ? -1 : 1
                return 0
            })
        }

        return result
    }, [travelers, searchTerm, sorting])

    const totalPages = Math.ceil(filteredTravelers.length / itemsPerPage)
    const currentTravelers = filteredTravelers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este viajante?")) return
        try {
            await travelersService.deleteTraveler(id)
            setTravelers(prev => prev.filter(t => t.id !== id))
        } catch (error) {
            console.error("Error deleting traveler:", error)
            alert("Erro ao excluir viajante")
        }
    }

    const columns: ColumnDef<Traveler>[] = [
        {
            accessorKey: "name",
            header: "Nome completo",
            cell: ({ row }) => (
                <div className="flex items-center gap-3 pl-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={row.original.photo} alt={row.getValue("name")} />
                        <AvatarFallback className="bg-blue-50 text-blue-600 text-[10px] font-bold">
                            {row.original.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-gray-900">{row.getValue("name")}</span>
                </div>
            ),
        },
        {
            accessorKey: "email",
            header: "E-mail",
            cell: ({ row }) => <span className="text-gray-900 font-medium">{row.getValue("email")}</span>,
        },
        {
            accessorKey: "phone",
            header: "Telefone",
            cell: ({ row }) => <span className="text-gray-900 font-medium">{row.getValue("phone")}</span>,
        },
        {
            accessorKey: "missions",
            header: ({ column }) => <div className="text-center">Missões</div>,
            cell: ({ row }) => <div className="text-center text-gray-900 font-medium">{row.getValue("missions")}</div>,
        },
        {
            accessorKey: "documents",
            header: ({ column }) => <div className="text-center">Documentos</div>,
            cell: ({ row }) => <div className="text-center text-gray-900 font-medium">{row.getValue("documents")}</div>,
        },
        {
            accessorKey: "lastMission",
            header: "Última missão",
            cell: ({ row }) => <span className="text-gray-900 font-medium">{row.getValue("lastMission")}</span>,
        },
        {
            accessorKey: "pendingDocs",
            header: ({ column }) => <div className="text-center">Docs. pendentes</div>,
            cell: ({ row }) => {
                const count = row.getValue("pendingDocs") as number
                return (
                    <div className="flex items-center justify-center gap-2">
                        {count > 0 && <AlertCircle className="h-4 w-4 text-orange-500" />}
                        <span className={cn("font-medium", count > 0 ? "text-orange-600" : "text-gray-900")}>{count}</span>
                    </div>
                )
            },
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
                            onClick={() => router.push(`/viajantes/${row.original.id}`)}
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full">
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(row.original.id)}
                            className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full"
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
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-12 bg-transparent rounded-2xl border-gray-200 w-full text-base shadow-none"
                    />
                </div>

                <div className="flex flex-wrap gap-4 items-end w-full xl:w-auto">
                    <div className="relative">
                        <span className="absolute -top-2 left-4 bg-white px-1 text-xs text-gray-500 z-10">
                            Missão
                        </span>
                        <Select value={missionFilter} onValueChange={setMissionFilter}>
                            <SelectTrigger className="w-[200px] h-12 rounded-2xl border-gray-200 bg-transparent text-gray-900">
                                <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="relative">
                        <span className="absolute -top-2 left-4 bg-white px-1 text-xs text-gray-500 z-10">
                            Grupo
                        </span>
                        <Select value={groupFilter} onValueChange={setGroupFilter}>
                            <SelectTrigger className="w-[200px] h-12 rounded-2xl border-gray-200 bg-transparent text-gray-900">
                                <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="relative">
                        <span className="absolute -top-2 left-4 bg-white px-1 text-xs text-gray-500 z-10">
                            Status da missão
                        </span>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[200px] h-12 rounded-2xl border-gray-200 bg-transparent text-gray-900">
                                <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="pending">Pendente</SelectItem>
                                <SelectItem value="started">Iniciado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={fetchTravelers}
                        disabled={isLoading}
                        className="h-12 w-12 rounded-2xl border border-gray-200"
                        title="Atualizar"
                    >
                        <RefreshCw className={cn("h-5 w-5", isLoading && "animate-spin")} />
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={currentTravelers}
                        sorting={sorting}
                        onSortingChange={setSorting}
                    />
                )}
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
