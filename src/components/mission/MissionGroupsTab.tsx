"use client"

import * as React from "react"
import { CalendarIcon, Eye, Trash2, Search, Plus, Pencil, AlertTriangle, Loader2 } from "lucide-react"
import { NewGroupModal } from "@/components/create/NewGroupModal"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ColumnDef } from "@tanstack/react-table"

import { cn } from "@/lib/utils"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { groupsService, MissionGroup } from "@/services/groupsService"

// Helper function to format date string from database (YYYY-MM-DD) to Display (DD/MM/YYYY)
const formatDateDisplay = (dateString: string | null) => {
    if (!dateString) return "--/--/----";
    try {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    } catch (e) {
        return dateString;
    }
}

export function MissionGroupsTab({ missionId, isEmpty: initialIsEmpty = false, missionStart, missionEnd }: { missionId?: string, isEmpty?: boolean, missionStart?: Date, missionEnd?: Date }) {
    const router = useRouter()
    // ... state remains ...
    const [startDate, setStartDate] = React.useState<Date>()
    const [endDate, setEndDate] = React.useState<Date>()
    const [currentPage, setCurrentPage] = React.useState(1)
    const [isNewGroupModalOpen, setIsNewGroupModalOpen] = React.useState(false)
    const [groups, setGroups] = React.useState<MissionGroup[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)

    // Fetch groups on mount
    React.useEffect(() => {
        const fetchGroups = async () => {
            if (!missionId || missionId === 'new') {
                setIsLoading(false)
                return
            }
            try {
                setIsLoading(true);
                const data = await groupsService.getGroupsByMissionId(missionId);
                setGroups(data);
            } catch (err) {
                console.error("Failed to fetch groups:", err);
                setError("Erro ao carregar grupos. Por favor, tente novamente.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchGroups();
    }, [missionId]);

    const itemsPerPage = 5

    const handleNewGroupSave = async (data: any) => {
        try {
            if (!missionId || missionId === 'new') {
                alert("Salve a missão antes de criar grupos.")
                return
            }

            let logoUrl = null
            if (data.logo) {
                const { createClient } = await import("@/lib/supabase/client")
                const supabase = createClient()
                const fileExt = data.logo.name.split('.').pop()
                const fileName = `${Math.random()}.${fileExt}`
                const filePath = `${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('mission-logos') // Reusing same bucket or separate? Assuming mission-logos fine or create 'group-logos'
                    .upload(filePath, data.logo)

                if (!uploadError) {
                    const { data: { publicUrl } } = supabase.storage
                        .from('mission-logos')
                        .getPublicUrl(filePath)
                    logoUrl = publicUrl
                }
            }

            const newGroup = await groupsService.createGroup({
                nome: data.name,
                vagas: data.vacancies,
                data_inicio: data.startDate,
                data_fim: data.endDate,
                // observacoes: data.observations, // If schema supports it
                missao_id: missionId,
                logo: logoUrl,
                status: 'Planejado' // Default status
            })

            // Redirect to group page
            router.push(`/grupos/${newGroup.id}`)

        } catch (err) {
            console.error("Error creating group:", err);
            // toast.error?
        }
    }

    const handleDeleteGroup = async (id: string) => {
        if (confirm("Tem certeza que deseja excluir este grupo?")) {
            try {
                await groupsService.deleteGroup(id);
                setGroups(groups.filter(g => g.id !== id));
            } catch (err) {
                alert("Erro ao excluir grupo");
                console.error(err);
            }
        }
    }

    const isEmpty = !isLoading && groups.length === 0;

    const totalPages = isLoading || isEmpty ? 0 : Math.ceil(groups.length / itemsPerPage)
    const currentGroups = isLoading || isEmpty ? [] : groups.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const columns: ColumnDef<MissionGroup>[] = [
        {
            accessorKey: "nome",
            header: "Nome do grupo",
            cell: ({ row }) => (
                <Link href={`/grupos/${row.original.id}`} className="flex items-center gap-3 pl-2 hover:opacity-80 transition-opacity cursor-pointer w-full h-full relative z-10 group">
                    <Avatar className="h-8 w-8 border border-gray-100 shadow-sm group-hover:ring-2 group-hover:ring-blue-100 transition-all">
                        <AvatarImage src={row.original.logo || ""} alt={row.getValue("nome")} className="object-cover" />
                        <AvatarFallback className="bg-blue-50 text-blue-600 font-bold text-xs">
                            {row.original.nome.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors uppercase text-xs tracking-wider">{row.getValue("nome")}</span>
                </Link>
            ),
        },
        {
            accessorKey: "vagas",
            header: "Vagas / Participantes",
            cell: ({ row }) => <span className="text-gray-900 font-medium pl-4">{row.original.vagas || row.original.participants_count}</span>,
        },
        {
            accessorKey: "guides_count",
            header: "Nº de Guias",
            cell: ({ row }) => <span className="text-gray-900 font-medium pl-4">{row.original.guides_count || 0}</span>,
        },
        {
            accessorKey: "next_event",
            header: "Próximo evento",
            cell: ({ row }) => {
                const nextEvent = row.original.next_event;
                if (!nextEvent) return <span className="text-gray-400">-</span>;

                return (
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                        <span className="text-gray-900 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] text-[11px]">
                            {nextEvent.hora} {nextEvent.titulo}
                        </span>
                    </div>
                );
            },
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
                                status === "Finalizado" && "bg-red-100 text-red-600",
                                status === "Inicio em breve" && "bg-blue-100 text-blue-600",
                                status === "Em andamento" && "bg-green-100 text-green-600"
                            )}
                        >
                            {status || 'Em andamento'}
                        </Badge>
                    </div>
                )
            },
        },
        {
            accessorKey: "data_inicio",
            header: "Data de início",
            cell: ({ row }) => <span className="text-gray-600 font-medium">{formatDateDisplay(row.original.data_inicio)}</span>,
        },
        {
            accessorKey: "data_fim",
            header: "Data de fim",
            cell: ({ row }) => <span className="text-gray-600 font-medium">{formatDateDisplay(row.original.data_fim)}</span>,
        },
        {
            id: "actions",
            header: ({ column }) => <div className="text-right pr-4">Ações</div>,
            cell: ({ row }) => {
                return (
                    <div className="flex justify-end gap-1 pr-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full">
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
                                e.stopPropagation();
                                e.preventDefault();
                                handleDeleteGroup(row.original.id);
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
        <div className="flex flex-col h-full space-y-4 bg-white p-4 rounded-xl border border-gray-100">
            {/* Filters Bar */}
            <div className="flex flex-col xl:flex-row gap-4 items-end justify-between shrink-0">
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
                        className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-normal text-base"
                        onClick={() => setIsNewGroupModalOpen(true)}
                    >
                        Novo grupo <Plus className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Table or Empty State */}
            <div className="flex-1 overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : isEmpty ? (
                    <div className="flex flex-col items-center justify-center h-full py-10 space-y-4">
                        <div className="flex flex-col items-center space-y-2">
                            <AlertTriangle className="w-12 h-12 text-red-500" />
                            <h3 className="text-lg font-semibold text-gray-900">Sem grupos cadastrados</h3>
                            <p className="text-gray-500 text-sm">Você precisa de grupos para uma missão!</p>
                        </div>
                        <Button
                            className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-medium text-base"
                            onClick={() => setIsNewGroupModalOpen(true)}
                        >
                            Cadastrar novo grupo <Plus className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                ) : (
                    <DataTable columns={columns} data={currentGroups} />
                )}
            </div>

            {/* Pagination */}
            {!isLoading && !isEmpty && (
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
            )}
            <NewGroupModal
                open={isNewGroupModalOpen}
                onOpenChange={setIsNewGroupModalOpen}
                onSave={handleNewGroupSave}
                missionStart={missionStart}
                missionEnd={missionEnd}
            />
        </div>
    )
}
