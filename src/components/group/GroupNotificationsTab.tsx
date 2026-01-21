"use client"

import * as React from "react"
import { Search, BellRing, CalendarIcon, Bell, Trash2 } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/ui/data-table"
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { NewNotificationModal } from "@/components/group/modals/NewNotificationModal"

type GroupNotification = {
    id: number
    sender: string
    date: string
    originalDate: Date
    description: string
    title?: string
    postId?: string
    senderPhoto?: string
}



export function GroupNotificationsTab({ isEmpty = false, missionId, groupId }: { isEmpty?: boolean, missionId?: string, groupId?: string }) {
    const [notifications, setNotifications] = React.useState<GroupNotification[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [isNewNotificationOpen, setIsNewNotificationOpen] = React.useState(false)
    const [currentPage, setCurrentPage] = React.useState(1)
    const [date, setDate] = React.useState<Date>()
    const [searchTerm, setSearchTerm] = React.useState("")
    const [notificationToDelete, setNotificationToDelete] = React.useState<GroupNotification | null>(null)
    const itemsPerPage = 8

    const fetchNotifications = React.useCallback(async () => {
        if (!missionId) return;
        try {
            setIsLoading(true);
            const { notificationsService } = await import("@/services/notificationsService");
            const data = await notificationsService.getNotificationsByMissionId(missionId);
            // Format dates
            const formattedData = data.map((n: any) => ({
                id: n.id,
                sender: n.sender || "Sistema",
                senderPhoto: n.senderPhoto,
                date: format(new Date(n.date), "dd/MM/yyyy HH:mm"),
                originalDate: new Date(n.date),
                description: n.description,
                title: n.title,
                postId: n.postId
            }));
            setNotifications(formattedData);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setIsLoading(false);
        }
    }, [missionId]);

    React.useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleSendNotification = async (data: any) => {
        if (!groupId || !data.description) return;
        try {
            const { notificationsService } = await import("@/services/notificationsService");
            // For now we just use the description as the message. Title could be added to modal later or derived.
            // Fetch current user using the correct browser client
            const { createClient } = await import("@/lib/supabase/client");
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            await notificationsService.sendNotification({
                groupId,
                title: "Aviso",
                message: data.description,
                senderId: user?.id
            });
            fetchNotifications(); // Refresh list
        } catch (error) {
            console.error("Failed to send notification", error);
        }
    }

    const handleDeleteNotification = async () => {
        if (!notificationToDelete) return;
        try {
            const { notificationsService } = await import("@/services/notificationsService");
            // Use String() to ensure id is string if it's number
            await notificationsService.deleteNotification(String(notificationToDelete.id), notificationToDelete.postId);
            fetchNotifications();
        } catch (error) {
            console.error("Failed to delete notification", error);
        } finally {
            setNotificationToDelete(null);
        }
    }

    const filteredNotifications = notifications.filter(n => {
        const matchesSearch = (n.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
            n.description.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesDate = date ? n.originalDate.toDateString() === date.toDateString() : true;

        return matchesSearch && matchesDate;
    });

    const totalPages = isEmpty ? 0 : Math.ceil(filteredNotifications.length / itemsPerPage)
    const currentNotifications = isEmpty ? [] : filteredNotifications.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)


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
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                            {String(row.getValue("sender")).charAt(0).toUpperCase()}
                        </div>
                    )}
                    <span className="font-semibold text-gray-900">{row.getValue("sender")}</span>
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
            cell: ({ row }) => <span className="text-gray-900 font-medium">{row.getValue("description")}</span>,
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
                            className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                            onClick={() => setNotificationToDelete(row.original)}
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
            <div className="flex flex-col xl:flex-row gap-4 items-end justify-between shrink-0">
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

                <div className="flex gap-4 items-end">
                    <div className="relative">
                        <span className="absolute -top-2 left-4 bg-white px-1 text-xs text-gray-500 z-10">
                            Data de notificação*
                        </span>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-[180px] h-12 justify-between text-left font-normal rounded-2xl border-gray-200 bg-transparent hover:bg-transparent hover:text-foreground",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    {date ? format(date, "dd/MM/yyyy") : <span className="text-gray-500">--/--/----</span>}
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

                    <Button
                        className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-normal text-base"
                        onClick={() => setIsNewNotificationOpen(true)}
                    >
                        Nova notificação <BellRing className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Table or Empty State */}
            <div className="flex-1 overflow-hidden">
                {isEmpty ? (
                    <div className="flex flex-col items-center justify-center h-full py-10 space-y-4">
                        <div className="flex flex-col items-center space-y-2">
                            <Bell className="w-12 h-12 text-gray-300" />
                            <h3 className="text-lg font-semibold text-gray-900">Sem notificações</h3>
                            <p className="text-gray-500 text-sm">Nenhuma notificação foi enviada para este grupo.</p>
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
            <NewNotificationModal
                open={isNewNotificationOpen}
                onOpenChange={setIsNewNotificationOpen}
                onSave={handleSendNotification}
            />

            <AlertDialog open={!!notificationToDelete} onOpenChange={(open) => !open && setNotificationToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir notificação</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir esta notificação?
                            Esta ação removerá o aviso para todos os usuários do grupo.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteNotification} className="bg-red-600 hover:bg-red-700">
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
