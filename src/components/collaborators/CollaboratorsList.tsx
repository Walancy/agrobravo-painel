"use client"

import * as React from "react"
import { Eye, Trash2, Search, Plus, Pencil, RefreshCw } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { collaboratorsService, Collaborator } from "@/services/collaboratorsService"
import { useUserPermissions } from "@/hooks/useUserPermissions"
import { toast } from "sonner"


export function CollaboratorsList() {
    const router = useRouter()
    const { hasPermission } = useUserPermissions()
    const [collaborators, setCollaborators] = React.useState<Collaborator[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [currentPage, setCurrentPage] = React.useState(1)
    const itemsPerPage = 10

    const fetchCollaborators = React.useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await collaboratorsService.getAllCollaborators();
            setCollaborators(data);
        } catch (error) {
            console.error("Failed to fetch collaborators:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchCollaborators();
    }, [fetchCollaborators]);

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este colaborador?")) return;
        try {
            await collaboratorsService.deleteCollaborator(id);
            fetchCollaborators();
        } catch (error) {
            console.error("Failed to delete collaborator:", error);
            alert("Erro ao excluir colaborador.");
        }
    };

    const totalPages = Math.ceil(collaborators.length / itemsPerPage)
    const currentCollaborators = collaborators.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const columns: ColumnDef<Collaborator>[] = [
        {
            accessorKey: "name",
            header: "Nome",
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
            accessorKey: "email",
            header: "E-mail",
            cell: ({ row }) => <span className="text-gray-900 font-medium">{row.getValue("email")}</span>,
        },
        {
            accessorKey: "permissoes",
            header: "Permissões",
            cell: ({ row }) => {
                const permissions = (row.getValue("permissoes") as string[]) || []

                if (permissions.includes("TODAS_AS_PERMISSOES")) {
                    return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">Admin</Badge>
                }

                if (permissions.length === 0) {
                    return <span className="text-gray-500 text-sm">Sem permissões</span>
                }

                return (
                    <div className="flex flex-wrap gap-1">
                        {permissions.slice(0, 2).map((perm) => {
                            let label = perm
                            if (perm === "GERENCIAR_USUARIOS") label = "Gerenciar usuários"
                            if (perm === "EDITAR_MISSOES") label = "Editar missões"
                            if (perm === "EDITAR_FORNECEDORES") label = "Editar fornecedores"
                            return (
                                <Badge key={perm} variant="outline" className="text-[10px] px-1 bg-gray-50 text-gray-700 border-gray-200">
                                    {label}
                                </Badge>
                            )
                        })}
                        {permissions.length > 2 && (
                            <Badge variant="outline" className="text-[10px] px-1 bg-gray-50 text-gray-700 border-gray-200">
                                +{permissions.length - 2}
                            </Badge>
                        )}
                    </div>
                )
            },
        },
        {
            accessorKey: "createdAt",
            header: "Criado em",
            cell: ({ row }) => <span className="text-gray-900 font-medium">{row.getValue("createdAt")}</span>,
        },
        {
            accessorKey: "createdBy",
            header: "Criado por",
            cell: ({ row }) => <span className="text-gray-900 font-medium">{row.getValue("createdBy")}</span>,
        },
        {
            accessorKey: "status",
            header: () => <div className="text-center">Status</div>,
            cell: ({ row }) => {
                const status = row.getValue("status") as string
                return (
                    <div className="text-center">
                        <Badge
                            variant="secondary"
                            className={cn(
                                "font-medium rounded-full px-4 py-1 text-xs border-none shadow-none",
                                status === "Ativo" && "bg-green-100 text-green-600",
                                status === "Inativo" && "bg-red-100 text-red-600"
                            )}
                        >
                            {status}
                        </Badge>
                    </div>
                )
            },
        },
        {
            id: "actions",
            header: () => <div className="text-right pr-4">Ações</div>,
            cell: ({ row }) => {
                return (
                    <div className="flex justify-end gap-1 pr-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full">
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                            onClick={() => router.push(`/administracao/colaboradores/${row.original.id}`)}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
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
                        onClick={fetchCollaborators}
                        className="h-12 w-12 rounded-2xl border border-gray-200"
                        title="Atualizar"
                    >
                        <RefreshCw className={cn("h-5 w-5", isLoading && "animate-spin")} />
                    </Button>

                    <div className="flex gap-3">
                        <Button
                            onClick={() => {
                                if (hasPermission('GERENCIAR_USUARIOS')) {
                                    router.push("/administracao/colaboradores/new")
                                } else {
                                    toast.error("Acesso negado", {
                                        description: "Você não tem permissão para criar colaboradores."
                                    })
                                }
                            }}
                            className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-normal text-base"
                        >
                            Novo colaborador <Plus className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : (
                    <DataTable columns={columns} data={currentCollaborators} />
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
        </div>
    )
}
