"use client"

import * as React from "react"
import { Eye, Trash2, Search, UserPlus, RefreshCw, Copy, AlertTriangle, Tag } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/ui/data-table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { AddTravelersModal } from "@/components/group/modals/AddTravelersModal"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

type GroupTraveler = {
    id: string
    voucher: string
    name: string
    photo?: string | null
    pendingDocs: number
    phone: string
    email: string
    status: string
}

export function GroupTravelersTab({ groupId, vacancies = 0, isEmpty: initialIsEmpty = false, onAlertChange }: { groupId?: string, vacancies?: number, isEmpty?: boolean, onAlertChange?: (hasAlert: boolean) => void }) {
    const [isAddTravelerOpen, setIsAddTravelerOpen] = React.useState(false)
    const [currentPage, setCurrentPage] = React.useState(1)
    const [travelers, setTravelers] = React.useState<GroupTraveler[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [searchTerm, setSearchTerm] = React.useState("")
    const itemsPerPage = 7

    const fetchTravelers = React.useCallback(async () => {
        if (!groupId) return;
        try {
            const { travelersService } = await import("@/services/travelersService")
            setIsLoading(true);
            const data = await travelersService.getAllTravelers({ groupId });
            setTravelers(data);

            const hasPending = data.some((t: GroupTraveler) => t.pendingDocs > 0);
            onAlertChange?.(hasPending);

        } catch (error) {
            console.error("Failed to fetch group travelers:", error);
        } finally {
            setIsLoading(false);
        }
    }, [groupId, onAlertChange]);

    React.useEffect(() => {
        fetchTravelers();
    }, [fetchTravelers]);

    const [travelerToDelete, setTravelerToDelete] = React.useState<GroupTraveler | null>(null)

    const handleDeleteTraveler = async () => {
        if (!travelerToDelete || !groupId) return;
        try {
            const { travelersService } = await import("@/services/travelersService")
            // Pass groupId to remove only from this group, not the entire user
            await travelersService.deleteTraveler(travelerToDelete.id, groupId);
            toast.success(travelerToDelete.status === "Convidado" ? "Convite cancelado com sucesso" : "Viajante removido com sucesso");
            fetchTravelers();
        } catch (error) {
            console.error("Failed to delete traveler:", error);
            toast.error("Erro ao remover viajante");
        } finally {
            setTravelerToDelete(null);
        }
    }

    const filteredTravelers = travelers.filter(t =>
        (t.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||

        (t.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    const isEmpty = !isLoading && travelers.length === 0;
    const isNoResults = !isLoading && travelers.length > 0 && filteredTravelers.length === 0;

    const totalPages = Math.ceil(filteredTravelers.length / itemsPerPage)
    const currentTravelers = filteredTravelers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const columns: ColumnDef<GroupTraveler>[] = [

        {
            accessorKey: "name",
            header: "Nome",
            cell: ({ row }) => {
                const name = row.getValue("name") as string
                const photo = row.original.photo
                return (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={photo || ""} alt={name} />
                            <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-gray-900">{name}</span>
                    </div>
                )
            },
        },
        {
            accessorKey: "pendingDocs",
            header: "Docs. pendentes",
            cell: ({ row }) => {
                const count = row.getValue("pendingDocs") as number
                if (count === 0) return <span className="text-gray-900 pl-4">0</span>
                return (
                    <div className="flex items-center gap-2 text-red-500 font-medium">
                        <AlertTriangle className="h-4 w-4" />
                        {count}
                    </div>
                )
            },
        },
        {
            accessorKey: "phone",
            header: "Telefone de contato",
            cell: ({ row }) => {
                return <span className="text-gray-900 font-medium">{row.getValue("phone")}</span>
            },
        },
        {
            accessorKey: "email",
            header: "E-mail",
            cell: ({ row }) => {
                return <span className="text-gray-900 font-medium">{row.getValue("email")}</span>
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string
                return (
                    <Badge
                        variant="secondary"
                        className={cn(
                            "font-medium rounded-full px-3 py-1 text-xs border-none shadow-none",
                            status === "Vinculado" && "bg-green-100 text-green-700",
                            status === "Documentação pendente" && "bg-orange-100 text-orange-700",
                            status === "Cadastro pendente" && "bg-red-100 text-red-700",
                            status === "Voucher Livre" && "bg-blue-100 text-blue-700",
                            status === "Convidado" && "bg-blue-100 text-blue-700"
                        )}
                    >
                        {status}
                    </Badge>
                )
            },
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
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                            onClick={() => setTravelerToDelete(row.original)}
                        >
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
            <div className="flex flex-col gap-4">
                <div className="flex flex-col xl:flex-row gap-4 items-center justify-between shrink-0">
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

                    <div className="flex gap-3">
                        <Button
                            className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-normal text-base"
                            onClick={() => setIsAddTravelerOpen(true)}
                        >
                            Adicionar viajante <UserPlus className="ml-2 h-5 w-5" />
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

                <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm">
                    <Tag className="h-4 w-4 text-blue-600" />
                    Vouchers disponíveis: {Math.max(0, vacancies - travelers.length)}
                </div>
            </div>

            {/* Table or Empty State */}
            <div className="flex-1 overflow-hidden">
                {isLoading && travelers.length === 0 ? (
                    <div className="flex items-center justify-center h-full py-10 text-blue-600">
                        <RefreshCw className="h-8 w-8 animate-spin" />
                    </div>
                ) : isEmpty ? (
                    <div className="flex flex-col items-center justify-center h-full py-10 space-y-4">
                        <div className="flex flex-col items-center space-y-2">
                            <AlertTriangle className="w-12 h-12 text-red-500" />
                            <h3 className="text-lg font-semibold text-gray-900">Sem viajantes vinculados</h3>
                            <p className="text-gray-500 text-sm">Vincule viajantes para preencher o grupo.</p>
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
            <AddTravelersModal
                groupId={groupId}
                open={isAddTravelerOpen}
                onOpenChange={setIsAddTravelerOpen}
                onSave={fetchTravelers}
            />

            <AlertDialog open={!!travelerToDelete} onOpenChange={(open) => !open && setTravelerToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {travelerToDelete?.status === "Convidado" ? "Cancelar convite" : "Remover viajante"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {travelerToDelete?.status === "Convidado"
                                ? `Tem certeza que deseja cancelar o convite para ${travelerToDelete?.name}?`
                                : `Tem certeza que deseja remover ${travelerToDelete?.name} deste grupo? Essa ação não pode ser desfeita.`
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteTraveler} className="bg-red-600 hover:bg-red-700">
                            {travelerToDelete?.status === "Convidado" ? "Cancelar convite" : "Remover"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
