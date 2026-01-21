"use client"

import * as React from "react"
import { Eye, EyeOff, Trash2, Search, Download, FilePlus, FolderOpen } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { AddMaterialModal } from "@/components/group/modals/AddMaterialModal"

import { format } from "date-fns"

type GroupMaterial = {
    id: string
    name: string
    size: string
    sentDate: string
    status: "Oculto" | "Visivel"
    lastUpdate: string
    url?: string
}

export function GroupMaterialsTab({ groupId, isEmpty }: { groupId?: string; isEmpty?: boolean }) {
    const [isAddMaterialOpen, setIsAddMaterialOpen] = React.useState(false)
    const [currentPage, setCurrentPage] = React.useState(1)
    const [materials, setMaterials] = React.useState<GroupMaterial[]>([])
    const [isLoading, setIsLoading] = React.useState(false)
    const itemsPerPage = 7

    const fetchMaterials = React.useCallback(async () => {
        if (!groupId || isEmpty) return; // Don't fetch if empty/new
        setIsLoading(true);
        try {
            const { materialsService } = await import("@/services/materialsService");
            const data = await materialsService.getMaterials(groupId);

            // Map API data (pt-BR db fields) to Component types
            const mapped = data.map((item: any) => ({
                id: item.id,
                name: item.nome,
                size: item.tamanho,
                sentDate: format(new Date(item.created_at), 'dd/MM/yyyy'),
                status: item.status,
                lastUpdate: format(new Date(item.updated_at || item.created_at), 'dd/MM/yyyy'),
                url: item.url
            }));
            setMaterials(mapped);
        } catch (error) {
            console.error("Failed to fetch materials:", error);
        } finally {
            setIsLoading(false);
        }
    }, [groupId, isEmpty]);

    React.useEffect(() => {
        fetchMaterials();
    }, [fetchMaterials]);

    const handleAddMaterial = async (data: { name: string, isVisible: boolean, file: File | null }) => {
        if (!groupId || !data.file) return;
        try {
            const formData = new FormData();
            formData.append('groupId', groupId);
            formData.append('name', data.name);
            formData.append('isVisible', String(data.isVisible));
            formData.append('file', data.file); // Add file

            const { materialsService } = await import("@/services/materialsService");
            await materialsService.addMaterial(formData);

            fetchMaterials();
        } catch (error) {
            console.error("Failed to add material:", error);
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este material?")) return;
        try {
            const { materialsService } = await import("@/services/materialsService");
            await materialsService.deleteMaterial(id);
            fetchMaterials();
        } catch (error) {
            console.error("Failed to delete material:", error);
        }
    }

    const handleToggleStatus = async (id: string, currentStatus: "Visivel" | "Oculto") => {
        const newStatus = currentStatus === "Visivel" ? "Oculto" : "Visivel";
        try {
            const { materialsService } = await import("@/services/materialsService");
            await materialsService.updateStatus(id, newStatus);
            fetchMaterials();
        } catch (error) {
            console.error("Failed to toggle status:", error);
        }
    }

    const totalPages = Math.ceil(materials.length / itemsPerPage)
    const currentMaterials = materials.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    const isListEmpty = !isLoading && materials.length === 0;

    const columns: ColumnDef<GroupMaterial>[] = [
        {
            accessorKey: "name",
            header: "Nome do material",
            cell: ({ row }) => <span className="font-semibold text-gray-900 pl-4">{row.getValue("name")}</span>,
        },
        {
            accessorKey: "size",
            header: "Tamanho",
            cell: ({ row }) => <span className="text-gray-900 font-medium">{row.getValue("size")}</span>,
        },
        {
            accessorKey: "sentDate",
            header: "Data de envio",
            cell: ({ row }) => <span className="text-gray-900 font-bold">{row.getValue("sentDate")}</span>,
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
                            status === "Oculto" && "bg-orange-100 text-orange-600",
                            status === "Visivel" && "bg-green-100 text-green-600"
                        )}
                    >
                        {status}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "lastUpdate",
            header: "Data da ultima atualização",
            cell: ({ row }) => <span className="text-gray-900 font-bold">{row.getValue("lastUpdate")}</span>,
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
                            onClick={() => handleToggleStatus(row.original.id, row.original.status)}
                            title={row.original.status === "Visivel" ? "Ocultar" : "Tornar Visível"}
                        >
                            {row.original.status === "Visivel" ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-gray-400" />}
                        </Button>
                        {row.original.url && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                                onClick={() => window.open(row.original.url, '_blank')}
                            >
                                <Download className="h-4 w-4" />
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                            onClick={() => handleDelete(row.original.id)}
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
                    className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-normal text-base"
                    onClick={() => setIsAddMaterialOpen(true)}
                >
                    Adicionar material <FilePlus className="ml-2 h-5 w-5" />
                </Button>
            </div>

            {/* Table or Empty State */}
            <div className="flex-1 overflow-hidden">
                {isEmpty || isListEmpty ? (
                    <div className="flex flex-col items-center justify-center h-full py-10 space-y-4">
                        <div className="flex flex-col items-center space-y-2">
                            <FolderOpen className="w-12 h-12 text-gray-300" />
                            <h3 className="text-lg font-semibold text-gray-900">Sem materiais</h3>
                            <p className="text-gray-500 text-sm">Nenhum material cadastrado para este grupo.</p>
                        </div>
                    </div>
                ) : (
                    <DataTable columns={columns} data={currentMaterials} />
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
            <AddMaterialModal
                open={isAddMaterialOpen}
                onOpenChange={setIsAddMaterialOpen}
                onSave={handleAddMaterial}
            />
        </div>
    )
}
