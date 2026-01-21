"use client"

import * as React from "react"
import { Eye, Trash2, Search, RefreshCw, AlertTriangle, Plus, Loader2 } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/ui/data-table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

type MissionTraveler = {
    id: string
    name: string
    photo?: string | null
    groupName: string
    groupLogo?: string | null
    pendingDocs: number
    phone: string
    email: string
}

export function MissionTravelersTab({ missionId, isEmpty: initialIsEmpty = false }: { missionId?: string, isEmpty?: boolean }) {
    const [currentPage, setCurrentPage] = React.useState(1)
    const [travelers, setTravelers] = React.useState<MissionTraveler[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [searchTerm, setSearchTerm] = React.useState("")
    const itemsPerPage = 8

    const fetchTravelers = React.useCallback(async () => {
        if (!missionId) {
            setIsLoading(false)
            return
        }

        try {
            setIsLoading(true)
            const response = await fetch(`/api/travelers?missionId=${missionId}`)
            if (!response.ok) throw new Error('Failed to fetch travelers')
            const data = await response.json()

            console.log('Travelers API response:', data)

            // Map API response to component type
            const formattedTravelers = data.map((t: any) => ({
                id: t.id,
                name: t.name,
                photo: t.photo,
                groupName: t.groupName || '-',
                groupLogo: t.groupLogo || null,
                pendingDocs: t.pendingDocs || 0,
                phone: t.phone,
                email: t.email
            }))

            console.log('Formatted travelers:', formattedTravelers)

            setTravelers(formattedTravelers)
        } catch (error) {
            console.error("Failed to fetch travelers:", error)
        } finally {
            setIsLoading(false)
        }
    }, [missionId])

    React.useEffect(() => {
        fetchTravelers()
    }, [fetchTravelers])

    const filteredTravelers = travelers.filter(t =>
        (t.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (t.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (t.phone?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    )

    const isEmpty = !isLoading && travelers.length === 0
    const isNoResults = !isLoading && travelers.length > 0 && filteredTravelers.length === 0

    const totalPages = Math.ceil(filteredTravelers.length / itemsPerPage)
    const currentTravelers = filteredTravelers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const columns: ColumnDef<MissionTraveler>[] = [
        {
            accessorKey: "name",
            header: "Nome",
            cell: ({ row }) => (
                <div className="flex items-center gap-3 pl-2">
                    <Avatar className="h-8 w-8 border border-gray-100 shadow-sm">
                        <AvatarImage src={row.original.photo || ""} alt={row.getValue("name")} className="object-cover" />
                        <AvatarFallback className="bg-blue-50 text-blue-600 font-bold text-xs">
                            {row.original.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-gray-900">{row.getValue("name")}</span>
                </div>
            ),
        },
        {
            accessorKey: "groupName",
            header: "Grupo",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border border-gray-100 shadow-sm">
                        <AvatarImage src={row.original.groupLogo || ""} alt={row.getValue("groupName")} className="object-cover" />
                        <AvatarFallback className="bg-blue-50 text-blue-600 font-bold text-xs">
                            {row.original.groupName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <span className="text-gray-900 font-semibold uppercase text-xs tracking-wider">{row.getValue("groupName")}</span>
                </div>
            ),
        },
        {
            accessorKey: "pendingDocs",
            header: "Docs. pendentes",
            cell: ({ row }) => <span className="text-gray-900 font-medium pl-4">{row.getValue("pendingDocs")}</span>,
        },
        {
            accessorKey: "phone",
            header: "Telefone de contato",
            cell: ({ row }) => <span className="text-gray-900 font-medium">{row.getValue("phone")}</span>,
        },
        {
            accessorKey: "email",
            header: "E-mail",
            cell: ({ row }) => <span className="text-gray-900 font-medium">{row.getValue("email")}</span>,
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
                            onClick={() => window.location.href = `/viajantes/${row.original.id}`}
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                )
            },
        },
    ]

    return (
        <div className="flex flex-col h-full space-y-4 bg-white p-4 border border-gray-100 rounded-2xl">
            {/* Filters Bar */}
            <div className="flex flex-col xl:flex-row gap-4 items-center justify-between shrink-0">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Pesquisar viajantes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-12 bg-transparent rounded-2xl border-gray-200 w-full text-base shadow-none"
                    />
                </div>

                <div className="flex gap-3">
                    <Button
                        className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-normal text-base"
                    >
                        Novo viajante <Plus className="ml-2 h-5 w-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={fetchTravelers}
                        className="h-12 w-12 rounded-2xl border border-gray-200"
                        title="Atualizar"
                        disabled={isLoading}
                    >
                        <RefreshCw className={cn("h-5 w-5", isLoading && "animate-spin")} />
                    </Button>
                </div>
            </div>

            {/* Table or States */}
            <div className="flex-1 overflow-hidden">
                {isLoading && travelers.length === 0 ? (
                    <div className="flex items-center justify-center h-full py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : isEmpty ? (
                    <div className="flex flex-col items-center justify-center h-full py-10 space-y-4">
                        <AlertTriangle className="h-12 w-12 text-yellow-500" />
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900">Nenhum viajante encontrado</h3>
                            <p className="text-gray-500">Comece adicionando novos viajantes à missão.</p>
                        </div>
                    </div>
                ) : isNoResults ? (
                    <div className="flex flex-col items-center justify-center h-full py-10 text-gray-500">
                        Nenhum resultado encontrado para "{searchTerm}"
                    </div>
                ) : (
                    <DataTable columns={columns} data={currentTravelers} />
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-end items-center gap-2 pt-4 border-t border-gray-100 shrink-0">
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
            )}
        </div>
    )
}
