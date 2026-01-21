"use client"

import * as React from "react"
import { Eye, Trash2, Search, Pencil, RefreshCw, AlertTriangle, Plus, Loader2 } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/ui/data-table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { guidesService, MissionGuide } from "@/services/guidesService"
import { GuideDetailsModal } from "@/components/guides/GuideDetailsModal"
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

export function MissionGuidesTab({ isEmpty: initialIsEmpty = false, missionId = "ca08dfac-4770-4ccb-88a3-9cb392e2195f" }: { isEmpty?: boolean, missionId?: string }) {
    // Default missionId only for dev/testing if not passed. In prod, it should be passed.

    const [currentPage, setCurrentPage] = React.useState(1)
    const [guides, setGuides] = React.useState<MissionGuide[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)
    const [selectedUserId, setSelectedUserId] = React.useState<string | null>(null)
    const [guideToUnassign, setGuideToUnassign] = React.useState<MissionGuide | null>(null)
    const itemsPerPage = 5

    // Fetch guides
    const fetchGuides = React.useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await guidesService.getGuidesByMissionId(missionId);
            setGuides(data);
        } catch (err) {
            console.error("Failed to fetch guides:", err);
            setError("Erro ao carregar guias.");
        } finally {
            setIsLoading(false);
        }
    }, [missionId]);

    React.useEffect(() => {
        fetchGuides();
    }, [fetchGuides]);

    const handleUnassignGuide = async () => {
        if (!guideToUnassign) return
        try {
            await guidesService.unassignGuideFromGroup(guideToUnassign.user_id, guideToUnassign.grupo_id)
            setGuideToUnassign(null)
            fetchGuides()
        } catch (error) {
            console.error("Error unassigning guide:", error)
        }
    }

    const isEmpty = !isLoading && guides.length === 0;

    const totalPages = isLoading || isEmpty ? 0 : Math.ceil(guides.length / itemsPerPage)
    const currentGuides = isLoading || isEmpty ? [] : guides.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const columns: ColumnDef<MissionGuide>[] = [
        {
            accessorKey: "nome",
            header: "Nome do guia",
            cell: ({ row }) => (
                <div className="flex items-center gap-3 pl-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={row.original.foto || ""} alt={row.getValue("nome")} />
                        <AvatarFallback>{row.original.nome.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-gray-900">{row.getValue("nome")}</span>
                </div>
            ),
        },
        {
            accessorKey: "grupo_nome",
            header: "Grupo",
            cell: ({ row }) => <span className="text-gray-900 font-medium">{row.original.grupo_nome}</span>,
        },
        {
            accessorKey: "telefone",
            header: "Telefone",
            cell: ({ row }) => <span className="text-gray-900 font-medium">{row.original.telefone}</span>,
        },
        {
            accessorKey: "nivel_ingles",
            header: "Nível de ingles",
            cell: ({ row }) => <span className="text-gray-900 font-medium">{row.original.nivel_ingles}</span>,
        },
        {
            accessorKey: "email",
            header: "E-mail",
            cell: ({ row }) => <span className="text-gray-900 font-medium">{row.original.email}</span>,
        },
        {
            accessorKey: "tipoUser",
            header: "Tipo de guia",
            cell: ({ row }) => <span className="text-gray-900 font-medium">{row.original.tipoUser}</span>,
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
                            onClick={() => setSelectedUserId(row.original.user_id)}
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                            onClick={() => window.location.href = `/guias/${row.original.user_id}`}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                            onClick={() => setGuideToUnassign(row.original)}
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
            <div className="flex flex-col xl:flex-row gap-4 items-center justify-between shrink-0">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Pesquisar"
                        className="pl-10 h-12 bg-transparent rounded-2xl border-gray-200 w-full text-base shadow-none"
                    />
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={fetchGuides}
                    className="h-12 w-12 rounded-2xl border border-gray-200"
                    title="Atualizar"
                    disabled={isLoading}
                >
                    <RefreshCw className={cn("h-5 w-5", isLoading && "animate-spin")} />
                </Button>
            </div>

            {/* Table or Empty State */}
            <div className="flex-1 overflow-hidden">
                {isLoading && guides.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : isEmpty ? (
                    <div className="flex flex-col items-center justify-center h-full py-10 space-y-4">
                        <div className="flex flex-col items-center space-y-2">
                            <AlertTriangle className="w-12 h-12 text-red-500" />
                            <h3 className="text-lg font-semibold text-gray-900">Sem guias cadastrados</h3>
                            <p className="text-gray-500 text-sm">Você precisa de guias associados aos grupos desta missão!</p>
                        </div>
                        <Button
                            className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-medium text-base"
                            onClick={() => window.location.href = '/guias'}
                        >
                            Cadastrar novo guia <Plus className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                ) : (
                    <DataTable columns={columns} data={currentGuides} />
                )}
            </div>

            {/* Pagination */}
            {!isLoading && !isEmpty && totalPages > 1 && (
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

            <GuideDetailsModal
                guideId={selectedUserId}
                open={!!selectedUserId}
                onOpenChange={(open) => !open && setSelectedUserId(null)}
            />

            <AlertDialog open={!!guideToUnassign} onOpenChange={(open) => !open && setGuideToUnassign(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remover guia do grupo</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja remover este guia deste grupo? Ele continuará cadastrado no sistema.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleUnassignGuide} className="bg-red-600 hover:bg-red-700">
                            Remover
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ')
}
