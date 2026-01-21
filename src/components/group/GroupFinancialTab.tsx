"use client"

import * as React from "react"
import { Eye, DollarSign, Wallet, CreditCard, AlertTriangle, Check, X, Download } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { AddBudgetModal } from "@/components/group/modals/AddBudgetModal"
import { AddTransactionModal } from "@/components/group/modals/AddTransactionModal"

type FinancialRecord = {
    id: string
    category: string
    spent: number
    missing: number
    location: string
    postedBy: string
    postedByPhoto?: string | null
    status: "Pendente" | "Reembolsado" | "Recusado"
    reimbursementDate: string | null
    createdAt?: string
}



export interface GroupFinancialTabRef {
    downloadPDF: () => void;
}

export const GroupFinancialTab = React.forwardRef<GroupFinancialTabRef, {
    isEmpty?: boolean,
    groupId?: string,
    onAlertChange?: (hasAlert: boolean) => void,
    startDate?: string,
    endDate?: string,
    activeTab?: string
}>((props, ref) => {
    const { isEmpty = false, groupId, onAlertChange, startDate, endDate, activeTab } = props;
    const [isAddBudgetOpen, setIsAddBudgetOpen] = React.useState(false)
    const [isAddTransactionOpen, setIsAddTransactionOpen] = React.useState(false)
    const [currentPage, setCurrentPage] = React.useState(1)
    const [records, setRecords] = React.useState<FinancialRecord[]>([])
    const [summary, setSummary] = React.useState({
        totalBudget: 0,
        totalAdded: 0,
        currentBalance: 0,
        totalSpent: 0
    })
    const [isLoading, setIsLoading] = React.useState(true)
    const itemsPerPage = 7

    const fetchFinancialData = React.useCallback(async () => {
        if (!groupId) return;
        try {
            setIsLoading(true);
            const { financialService } = await import("@/services/financialService");
            const { itineraryService } = await import("@/services/itineraryService");
            const { getCategoryTotals } = await import("@/lib/itineraryUtils");

            const [financialData, itineraryEvents] = await Promise.all([
                financialService.getFinancialData(groupId),
                itineraryService.getEventsByGroupId(groupId)
            ]);

            // Map and filter events exactly like the Itinerary Tab
            const mappedEvents = itineraryEvents.map((e: any) => ({
                id: e.id,
                type: (e.tipo || e.type) as any,
                price: e.preco || e.price,
                passengers: e.passageiros || e.passengers,
                date: e.data
            }));

            let visibleEvents = mappedEvents;
            if (startDate && endDate) {
                const { differenceInDays, addDays, format } = await import("date-fns");
                const sStr = String(startDate).split('T')[0];
                const eStr = String(endDate).split('T')[0];
                const start = new Date(sStr + 'T12:00:00');
                const end = new Date(eStr + 'T12:00:00');
                const daysCount = differenceInDays(end, start) + 1;

                if (daysCount > 0) {
                    const validDates = new Set<string>();
                    for (let i = 0; i < daysCount; i++) {
                        validDates.add(format(addDays(start, i), 'yyyy-MM-dd'));
                    }

                    visibleEvents = mappedEvents.filter((e: any) => {
                        if (!e.date) return false;
                        const eDate = e.date.split('T')[0];
                        return validDates.has(eDate);
                    });
                }
            }

            // Calculate total using the same aggregator as the columns
            const totals = getCategoryTotals(visibleEvents as any);
            const totalQuoted = Object.values(totals).reduce((a, b) => a + b, 0);

            setSummary({
                ...financialData.summary,
                totalBudget: totalQuoted
            });

            const transactions = financialData.transactions || [];

            const hasPending = transactions.some((r: any) => r.status === 'Pendente');
            onAlertChange?.(hasPending);

            setRecords(transactions);
        } catch (error) {
            console.error("Failed to fetch financial data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [groupId, startDate, endDate, onAlertChange]);

    React.useEffect(() => {
        fetchFinancialData();
    }, [fetchFinancialData, activeTab]);

    const handleAddBudget = async (value: string) => {
        if (!groupId) return;
        try {
            const amount = parseFloat(value.replace(/[^0-9,.-]/g, '').replace(',', '.'));
            if (isNaN(amount)) return;

            const { financialService } = await import("@/services/financialService");
            await financialService.addBudget(groupId, amount);
            fetchFinancialData();
        } catch (error) {
            console.error("Failed to add budget:", error);
        }
    }

    const handleAddTransaction = async (data: any) => {
        if (!groupId) return;
        try {
            // Get current user ID
            const { createClient } = await import("@/lib/supabase/client");
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return; // Should be handled

            const { financialService } = await import("@/services/financialService");
            await financialService.addTransaction({
                groupId,
                userId: user.id,
                ...data,
                reimbursementDate: data.reimbursementDate?.toISOString()
            });
            fetchFinancialData();
        } catch (error) {
            console.error("Failed to add transaction:", error);
        }
    }

    const handleUpdateStatus = async (id: string, status: "Reembolsado" | "Recusado") => {
        if (!groupId) return;
        try {
            const { financialService } = await import("@/services/financialService");
            await financialService.updateStatus(id, status);
            fetchFinancialData();
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    }


    const handleDownloadPDF = () => {
        const doc = new jsPDF()

        // Title
        doc.setFontSize(18)
        doc.text("Relatório Financeiro do Grupo", 14, 20)

        // Date
        doc.setFontSize(10)
        doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 28)

        // Summary
        doc.setFontSize(12)
        doc.text(`Orçamento Total: ${formatCurrency(summary.totalBudget)}`, 14, 40)
        doc.text(`Saldo Atual: ${formatCurrency(summary.currentBalance)}`, 14, 46)
        doc.text(`Total Gasto: ${formatCurrency(summary.totalSpent)}`, 14, 52)
        doc.text(`Total Adicionado: ${formatCurrency(summary.totalAdded)}`, 14, 58)

        // Table
        const tableBody = records.map(record => [
            record.category,
            formatCurrency(record.spent),
            formatCurrency(record.missing),
            record.location,
            record.postedBy,
            record.status,
            formatDate(record.reimbursementDate || "")
        ])

        autoTable(doc, {
            startY: 65,
            head: [['Categoria', 'Gasto', 'Faltante', 'Local', 'Quem lançou', 'Status', 'Data Reembolso']],
            body: tableBody,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [37, 99, 235] } // Blue-600
        })

        doc.save("relatorio-financeiro.pdf")
    }

    const formatCurrency = (value: number | string) => {
        const num = Number(value);
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(isNaN(num) ? 0 : num);
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString('pt-BR');
    }

    const totalPages = isEmpty ? 0 : Math.ceil(records.length / itemsPerPage)
    const currentRecords = isEmpty ? [] : records.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const columns: ColumnDef<FinancialRecord>[] = [
        {
            accessorKey: "category",
            header: "Categoria",
            cell: ({ row }) => <span className="font-semibold text-gray-900 pl-4">{row.getValue("category")}</span>,
        },
        {
            accessorKey: "spent",
            header: "Valor gasto",
            cell: ({ row }) => <span className="text-gray-900 font-medium">{formatCurrency(row.getValue("spent"))}</span>,
        },
        {
            accessorKey: "missing",
            header: "Valor Faltante",
            cell: ({ row }) => <span className="text-gray-900 font-medium">{formatCurrency(row.getValue("missing"))}</span>,
        },
        {
            accessorKey: "location",
            header: "Local",
            cell: ({ row }) => <span className="text-gray-900 font-medium">{row.getValue("location")}</span>,
        },
        {
            accessorKey: "postedBy",
            header: "Lançado por",
            cell: ({ row }) => {
                const name = row.getValue("postedBy") as string
                const photo = row.original.postedByPhoto
                return (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={photo || ""} alt={name} />
                            <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-gray-900">{name}</span>
                    </div>
                )
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
                            status === "Pendente" && "bg-orange-100 text-orange-600",
                            status === "Reembolsado" && "bg-green-100 text-green-600",
                            status === "Recusado" && "bg-red-100 text-red-600"
                        )}
                    >
                        {status}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "reimbursementDate",
            header: "Data de reebolso",
            cell: ({ row }) => <span className="text-gray-900 font-medium">{formatDate(row.getValue("reimbursementDate"))}</span>,
        },
        {
            id: "actions",
            header: ({ column }) => <div className="text-right pr-4">Ações</div>,
            cell: ({ row }) => {
                const status = row.original.status
                return (
                    <div className="flex justify-end gap-1 pr-2">
                        {status !== "Reembolsado" && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-full"
                                onClick={() => handleUpdateStatus(row.original.id, "Reembolsado")}
                                title="Aprovar Reembolso"
                            >
                                <Check className="h-4 w-4" />
                            </Button>
                        )}
                        {status !== "Recusado" && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
                                onClick={() => handleUpdateStatus(row.original.id, "Recusado")}
                                title="Recusar Reembolso"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full">
                            <Eye className="h-4 w-4" />
                        </Button>
                    </div>
                )
            },
        },
    ]

    React.useImperativeHandle(ref, () => ({
        downloadPDF: handleDownloadPDF
    }));

    return (
        <div className="flex flex-col h-full space-y-4">



            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 border border-gray-100 flex flex-col gap-2 rounded-2xl">
                    <div className="flex items-center gap-2 text-blue-600 font-medium text-sm">
                        <DollarSign className="h-4 w-4" />
                        Valor total cotado do grupo
                    </div>
                    <span className="text-3xl font-semibold text-gray-900">{isEmpty ? formatCurrency(0) : formatCurrency(summary.totalBudget)}</span>
                </div>

                <div className="bg-white p-6 border border-gray-100 flex flex-col gap-2 relative rounded-2xl">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2 text-blue-600 font-medium text-sm">
                            <Wallet className="h-4 w-4" />
                            Saldo total do grupo
                        </div>
                        <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 font-medium"
                            onClick={() => setIsAddBudgetOpen(true)}
                        >
                            Ajustar verba <DollarSign className="ml-1 h-3 w-3" />
                        </Button>
                    </div>
                    <span className="text-3xl font-semibold text-gray-900">{isEmpty ? formatCurrency(0) : formatCurrency(summary.currentBalance)}</span>
                    <span className="absolute bottom-6 right-6 text-xs text-gray-500 font-medium">Adicionado: {formatCurrency(summary.totalAdded)}</span>
                </div>

                <div className="bg-white p-6 border border-gray-100 flex flex-col gap-2 rounded-2xl">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2 text-blue-600 font-medium text-sm">
                            <CreditCard className="h-4 w-4" />
                            Valor total gasto do grupo
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-600 border-blue-600 hover:bg-blue-50 rounded-lg px-4 font-medium"
                            onClick={() => setIsAddTransactionOpen(true)}
                        >
                            Adicionar gasto <DollarSign className="ml-1 h-3 w-3" />
                        </Button>
                    </div>
                    <span className="text-3xl font-semibold text-blue-500">{isEmpty ? formatCurrency(0) : formatCurrency(summary.totalSpent)}</span>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 bg-white p-4 border border-gray-100 flex flex-col overflow-hidden rounded-2xl">
                <div className="flex-1 overflow-hidden">
                    {isEmpty ? (
                        <div className="flex flex-col items-center justify-center h-full py-10 space-y-4">
                            <div className="flex flex-col items-center space-y-2">
                                <Wallet className="w-12 h-12 text-gray-300" />
                                <h3 className="text-lg font-semibold text-gray-900">Sem registros financeiros</h3>
                                <p className="text-gray-500 text-sm">Nenhuma movimentação financeira registrada.</p>
                            </div>
                        </div>
                    ) : (
                        <DataTable columns={columns} data={currentRecords} />
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
            </div>
            <AddBudgetModal
                open={isAddBudgetOpen}
                onOpenChange={setIsAddBudgetOpen}
                onSave={handleAddBudget}
            />
            <AddTransactionModal
                open={isAddTransactionOpen}
                onOpenChange={setIsAddTransactionOpen}
                onSave={handleAddTransaction}
            />
        </div>
    )
})
GroupFinancialTab.displayName = "GroupFinancialTab";
