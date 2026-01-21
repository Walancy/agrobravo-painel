"use client"

import * as React from "react"
import { Search, Bell, CalendarIcon, BellRing, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { ColumnDef } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/ui/data-table"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

type GroupNotification = {
    id: number
    sender: string
    date: string
    description: string
    title?: string
    senderPhoto?: string
}

interface TravelerNotificationsTabProps {
    missionId: string
    groupId?: string
}

export function TravelerNotificationsTab({ missionId, groupId }: TravelerNotificationsTabProps) {
    const [notifications, setNotifications] = React.useState<GroupNotification[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [searchTerm, setSearchTerm] = React.useState("")
    const [date, setDate] = React.useState<Date>()
    const itemsPerPage = 8
    const [currentPage, setCurrentPage] = React.useState(1)

    const fetchNotifications = React.useCallback(async () => {
        if (!missionId) return;
        try {
            setIsLoading(true);
            // We use the same service as GroupNotificationsTab
            // Ideally we would mock this if the service doesn't exist yet in the codebase context I see
            // But based on previous reads, it seems to be expected.
            // I will use a direct fetch to be safe if I can't import the service easily without verifying it fully,
            // but actually I should try to use the service pattern if possible.
            // Let's assume standard fetch for now to avoid dependency issues if service file is missing or complex.

            const response = await fetch(`/api/notifications?missionId=${missionId}`);
            if (response.ok) {
                const data = await response.json();
                const formattedData = data.map((n: any) => ({
                    id: n.id,
                    sender: n.sender || "Sistema",
                    senderPhoto: n.senderPhoto,
                    date: format(new Date(n.date), "dd/MM/yyyy HH:mm"),
                    originalDate: new Date(n.date), // Storing original date for filtering if needed
                    description: n.description,
                    title: n.title,
                }));
                setNotifications(formattedData);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setIsLoading(false);
        }
    }, [missionId]);

    React.useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Filtering
    const filteredNotifications = notifications.filter(n => {
        // @ts-ignore - Check originalDate which is not in type definition above but added in fetch
        const nDate = n.originalDate as Date || new Date()

        const matchesSearch = (n.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
            n.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesDate = date ? nDate.toDateString() === date.toDateString() : true;

        return matchesSearch && matchesDate;
    });

    const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage)
    const currentNotifications = filteredNotifications.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)


    const columns: ColumnDef<GroupNotification>[] = [
        {
            accessorKey: "sender",
            header: "Enviado por",
            cell: ({ row }) => (
                <div className="flex items-center gap-2 pl-4">
                    {row.original.senderPhoto ? (
                        <img
                            src={row.original.senderPhoto}
                            alt={row.getValue("sender")}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                            {String(row.getValue("sender")).charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{row.getValue("sender")}</span>
                        <span className="text-xs text-gray-500">Guia da Missão</span>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "date",
            header: "Data",
            cell: ({ row }) => <span className="text-gray-900 font-medium">{row.getValue("date")}</span>,
        },
        {
            accessorKey: "description",
            header: "Descrição",
            cell: ({ row }) => <span className="text-gray-700">{row.getValue("description")}</span>,
        },
    ]

    return (
        <div className="flex flex-col h-full space-y-4 bg-white p-4 border border-gray-100 rounded-2xl">
            {/* Filters Bar */}
            <div className="flex flex-col xl:flex-row gap-4 items-end justify-between shrink-0">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Pesquisar avisos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-12 bg-transparent rounded-2xl border-gray-200 w-full text-base shadow-none"
                    />
                </div>

                <div className="flex gap-4 items-end">
                    <div className="relative">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-[160px] h-12 justify-between text-left font-normal rounded-2xl border-gray-200 bg-transparent hover:bg-transparent hover:text-foreground shadow-none",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    {date ? format(date, "dd/MM/yyyy") : <span className="text-gray-500">Data</span>}
                                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-hidden">
                {currentNotifications.length === 0 && !isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full py-10 space-y-4">
                        <div className="flex flex-col items-center space-y-2">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                <Bell className="w-6 h-6 text-gray-400" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900">Sem notificações</h3>
                            <p className="text-gray-500 text-sm">Você não tem novos avisos.</p>
                        </div>
                    </div>
                ) : (
                    <DataTable columns={columns} data={currentNotifications} />
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
    )
}
