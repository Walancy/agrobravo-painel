"use client"

import * as React from "react"
import { Eye, Trash2, Search, Plus, Pencil } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/ui/data-table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { guidesService } from "@/services/guidesService"
import { Loader2, RefreshCw } from "lucide-react"

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
} from "../ui/alert-dialog"

type Guide = {
    id: string
    name: string
    lastMission: string
    phone: string
    englishLevel: string
    email: string
    type: string
    photo?: string | null
}

export function GuidesList() {
    const [currentPage, setCurrentPage] = React.useState(1)
    const [guides, setGuides] = React.useState<Guide[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [selectedGuideId, setSelectedGuideId] = React.useState<string | null>(null)
    const [guideToDelete, setGuideToDelete] = React.useState<string | null>(null)
    const itemsPerPage = 5

    const fetchGuides = React.useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await guidesService.getAllGuides();
            setGuides(data);
        } catch (error) {
            console.error("Failed to fetch guides:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleDeleteGuide = async () => {
        if (!guideToDelete) return
        try {
            await guidesService.deleteGuide(guideToDelete)
            setGuideToDelete(null)
            fetchGuides()
        } catch (error) {
            console.error("Failed to delete guide:", error)
        }
    }

    React.useEffect(() => {
        fetchGuides();
    }, [fetchGuides]);

    const totalPages = isLoading ? 0 : Math.ceil(guides.length / itemsPerPage)
    const currentGuides = isLoading ? [] : guides.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const columns: ColumnDef<Guide>[] = [
        {
            accessorKey: "name",
            header: "Nome do guia",
            cell: ({ row }) => (
                <div className="flex items-center gap-3 pl-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={row.original.photo || ""} alt={row.getValue("name")} />
                        <AvatarFallback>{row.original.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-gray-900">{row.getValue("name")}</span>
                </div>
            ),
        },
        {
            accessorKey: "lastMission",
            header: "Última missão",
            cell: ({ row }) => <span className="text-gray-900 font-medium">{row.getValue("lastMission")}</span>,
        },
        {
            accessorKey: "phone",
            header: "Telefone",
            cell: ({ row }) => <span className="text-gray-900 font-medium">{row.getValue("phone")}</span>,
        },
        {
            accessorKey: "englishLevel",
            header: "Nível de inglês",
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
                            onClick={() => setSelectedGuideId(row.original.id)}
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Link href={`/guias/${row.original.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full">
                                <Pencil className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                            onClick={() => setGuideToDelete(row.original.id)}
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

                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={fetchGuides}
                        className="h-12 w-12 rounded-2xl border border-gray-200"
                        title="Atualizar"
                    >
                        <RefreshCw className={cn("h-5 w-5", isLoading && "animate-spin")} />
                    </Button>

                    <Link href="/guias/new">
                        <Button className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-normal text-base">
                            Novo guia <Plus className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-hidden">
                {isLoading && guides.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : (
                    <DataTable columns={columns} data={currentGuides} />
                )}
            </div>

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
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
                guideId={selectedGuideId}
                open={!!selectedGuideId}
                onOpenChange={(open) => !open && setSelectedGuideId(null)}
            />

            <AlertDialog open={!!guideToDelete} onOpenChange={(open) => !open && setGuideToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir guia</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir este guia? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteGuide} className="bg-red-600 hover:bg-red-700">
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
