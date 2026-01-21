"use client"

import * as React from "react"
import { CheckCircle2, XCircle, AlertTriangle, RefreshCw, Loader2, Search } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

type MissionExpense = {
    id: string
    categoria: string
    valor_gasto: number
    grupo_nome: string
    grupo_logo: string | null
    guia_nome: string
    guia_foto: string | null
    status: "Pendente" | "Aprovado" | "Recusado"
    created_at: string
}

export function MissionExpensesTab({ isEmpty = false, missionId }: { isEmpty?: boolean, missionId: string }) {
    const [currentPage, setCurrentPage] = React.useState(1)
    const [expenses, setExpenses] = React.useState<MissionExpense[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const itemsPerPage = 8

    const fetchExpenses = React.useCallback(async () => {
        try {
            setIsLoading(true)
            const response = await fetch(`/api/mission-expenses?missionId=${missionId}`)
            if (!response.ok) throw new Error('Failed to fetch expenses')
            const data = await response.json()
            setExpenses(data)
        } catch (error) {
            console.error('Error fetching expenses:', error)
        } finally {
            setIsLoading(false)
        }
    }, [missionId])

    React.useEffect(() => {
        if (!isEmpty) {
            fetchExpenses()
        } else {
            setIsLoading(false)
        }
    }, [isEmpty, fetchExpenses])

    const totalPages = isEmpty || expenses.length === 0 ? 0 : Math.ceil(expenses.length / itemsPerPage)
    const currentExpenses = isEmpty || expenses.length === 0 ? [] : expenses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value)
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('pt-BR')
    }

    const columns: ColumnDef<MissionExpense>[] = [
        {
            accessorKey: "grupo_nome",
            header: "Grupo",
            cell: ({ row }) => (
                <div className="flex items-center gap-3 pl-2">
                    <Avatar className="h-8 w-8 border border-gray-100 shadow-sm">
                        <AvatarImage src={row.original.grupo_logo || ""} alt={row.getValue("grupo_nome")} className="object-cover" />
                        <AvatarFallback className="bg-blue-50 text-blue-600 font-bold text-xs">
                            {row.original.grupo_nome.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <span className="text-gray-900 font-semibold uppercase text-xs tracking-wider">{row.getValue("grupo_nome")}</span>
                </div>
            ),
        },
        {
            accessorKey: "categoria",
            header: "Categoria",
            cell: ({ row }) => <span className="text-gray-900 font-semibold">{row.getValue("categoria")}</span>,
        },
        {
            accessorKey: "valor_gasto",
            header: "Valor gasto",
            cell: ({ row }) => <span className="text-gray-900 font-bold">{formatCurrency(row.getValue("valor_gasto"))}</span>,
        },
        {
            accessorKey: "guia_nome",
            header: "Guia",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border border-gray-100 shadow-sm">
                        <AvatarImage src={row.original.guia_foto || ""} alt={row.original.guia_nome || ""} className="object-cover" />
                        <AvatarFallback className="bg-gray-50 text-gray-600 font-bold text-xs">
                            {row.original.guia_nome ? row.original.guia_nome.substring(0, 2).toUpperCase() : "??"}
                        </AvatarFallback>
                    </Avatar>
                    <span className="text-gray-900 font-semibold">{row.getValue("guia_nome") || "-"}</span>
                </div>
            ),
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
                            status === "Recusado" && "bg-red-100 text-red-600",
                            status === "Pendente" && "bg-orange-100 text-orange-600",
                            status === "Aprovado" && "bg-green-100 text-green-600"
                        )}
                    >
                        {status}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "created_at",
            header: "Data",
            cell: ({ row }) => <span className="text-gray-900 font-semibold">{formatDate(row.getValue("created_at"))}</span>,
        },
        {
            id: "actions",
            header: ({ column }) => <div className="text-right pr-4">Ações</div>,
            cell: ({ row }) => {
                return (
                    <div className="flex justify-end gap-1 pr-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-50 rounded-full">
                            <CheckCircle2 className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full">
                            <XCircle className="h-5 w-5" />
                        </Button>
                    </div>
                )
            },
        },
    ]

    const isEmptyState = !isLoading && expenses.length === 0

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
                    onClick={fetchExpenses}
                    className="h-12 w-12 rounded-2xl border border-gray-200 bg-transparent hover:bg-gray-50"
                    title="Atualizar"
                    disabled={isLoading}
                >
                    <RefreshCw className={cn("h-5 w-5", isLoading && "animate-spin")} />
                </Button>
            </div>

            {/* Table or Empty State */}
            <div className="flex-1 overflow-hidden">
                {isLoading && expenses.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : isEmptyState ? (
                    <div className="flex flex-col items-center justify-center h-full py-10 space-y-4">
                        <div className="flex flex-col items-center space-y-2">
                            <AlertTriangle className="w-12 h-12 text-red-500" />
                            <h3 className="text-lg font-semibold text-gray-900">Sem despesas cadastradas</h3>
                            <p className="text-gray-500 text-sm">Aguarde o lançamento de despesas pelos guias ou viajantes.</p>
                        </div>
                    </div>
                ) : (
                    <DataTable columns={columns} data={currentExpenses} />
                )}
            </div>

            {/* Pagination */}
            {!isLoading && !isEmptyState && totalPages > 1 && (
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
