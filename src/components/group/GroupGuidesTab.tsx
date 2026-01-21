"use client"

import * as React from "react"
import { Eye, Trash2, Search, Pencil, Plus, UserPlus, AlertTriangle, RefreshCw, Loader2 } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/ui/data-table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { AddGuidesModal } from "@/components/group/modals/AddGuidesModal"
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

type GroupGuide = {
    id: string // composite ID for key
    user_id: string // Actual user ID
    grupo_id: string // Actual group ID
    name: string
    image: string
    phone: string
    englishLevel: string
    email: string
    type: string
}

export function GroupGuidesTab({ groupId, onAlertChange }: { groupId: string, onAlertChange?: (hasAlert: boolean) => void }) {
    const [isAddGuidesOpen, setIsAddGuidesOpen] = React.useState(false)
    const [currentPage, setCurrentPage] = React.useState(1)
    const [guides, setGuides] = React.useState<GroupGuide[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [selectedUserId, setSelectedUserId] = React.useState<string | null>(null)
    const [guideToUnassign, setGuideToUnassign] = React.useState<GroupGuide | null>(null)
    const itemsPerPage = 5

    const fetchGuides = React.useCallback(async () => {
        if (!groupId) return
        try {
            setIsLoading(true)
            const { guidesService } = await import("@/services/guidesService")
            const data = await guidesService.getGuidesByGroupId(groupId)

            // Map service data (MissionGuide) to GroupGuide type used in table
            const mappedGuides = data.map(g => ({
                id: g.id,
                user_id: g.user_id,
                grupo_id: g.grupo_id,
                name: g.nome,
                image: g.foto || "https://github.com/shadcn.png",
                phone: g.telefone || "-",
                englishLevel: g.nivel_ingles || "-",
                email: g.email || "-",
                type: g.tipoUser || "Guia"
            }))

            setGuides(mappedGuides)

            const isEmpty = mappedGuides.length === 0;
            onAlertChange?.(isEmpty);

        } catch (error) {
            console.error("Error fetching guides:", error)
        } finally {
            setIsLoading(false)
        }
    }, [groupId, onAlertChange])

    React.useEffect(() => {
        fetchGuides()
    }, [fetchGuides])

    const handleAddGuides = async (selectedIds: string[]) => {
        try {
            const { guidesService } = await import("@/services/guidesService")
            await guidesService.assignGuidesToGroup(groupId, selectedIds)
            fetchGuides()
        } catch (error) {
            console.error("Error assigning guides:", error)
        }
    }

    const handleUnassignGuide = async () => {
        if (!guideToUnassign) return
        try {
            const { guidesService } = await import("@/services/guidesService")
            await guidesService.unassignGuideFromGroup(guideToUnassign.user_id, guideToUnassign.grupo_id)
            setGuideToUnassign(null)
            fetchGuides()
        } catch (error) {
            console.error("Error unassigning guide:", error)
        }
    }

    const totalPages = Math.ceil(guides.length / itemsPerPage)
    const currentGuides = guides.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    const isEmpty = guides.length === 0 && !isLoading

    const columns: ColumnDef<GroupGuide>[] = [
        {
            accessorKey: "name",
            header: "Nome do guia",
            cell: ({ row }) => (
                <div className="flex items-center gap-3 pl-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={row.original.image} alt={row.getValue("name")} />
                        <AvatarFallback>{row.original.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-gray-900">{row.getValue("name")}</span>
                </div>
            ),
        },
        {
            accessorKey: "phone",
            header: "Telefone",
            cell: ({ row }) => <span className="text-gray-900 font-medium">{row.getValue("phone")}</span>,
        },
        {
            accessorKey: "englishLevel",
            header: "Nivel de ingles",
            cell: ({ row }) => <span className="text-gray-900 font-medium">{row.getValue("englishLevel")}</span>,
        },
        {
            accessorKey: "email",
            header: "E-mail",
            cell: ({ row }) => <span className="text-gray-900 font-medium">{row.getValue("email")}</span>,
        },
        {
            accessorKey: "type",
            header: "Tipo de guia",
            cell: ({ row }) => <span className="text-gray-900 font-medium">{row.getValue("type")}</span>,
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
        <div className="flex flex-col h-full space-y-4 bg-white p-4 rounded-2xl border border-gray-100">
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

                <div className="flex gap-3">
                    <Button
                        className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-normal text-base"
                        onClick={() => setIsAddGuidesOpen(true)}
                    >
                        Adicionar guias <UserPlus className="ml-2 h-5 w-5" />
                    </Button>
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
            </div>

            {/* Table or States */}
            <div className="flex-1 overflow-hidden">
                {isLoading && guides.length === 0 ? (
                    <div className="flex items-center justify-center h-full py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : isEmpty ? (
                    <div className="flex flex-col items-center justify-center h-full py-10 space-y-4">
                        <div className="flex flex-col items-center space-y-2">
                            <AlertTriangle className="w-12 h-12 text-red-500" />
                            <h3 className="text-lg font-semibold text-gray-900">Sem guias cadastrados</h3>
                            <p className="text-gray-500 text-sm">Cadastre guias para acompanhar o grupo.</p>
                        </div>
                    </div>
                ) : (
                    <DataTable columns={columns} data={currentGuides} />
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
                            className={`h-7 w-7 rounded-lg text-xs font-medium transition-colors shadow-none ${currentPage === page
                                ? "border border-blue-600 text-blue-600 bg-white hover:bg-blue-50"
                                : "border-none bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                                }`}
                            onClick={() => setCurrentPage(page)}
                        >
                            {page}
                        </Button>
                    ))}
                </div>
            )}
            <AddGuidesModal
                open={isAddGuidesOpen}
                onOpenChange={setIsAddGuidesOpen}
                onSave={handleAddGuides}
            />

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
