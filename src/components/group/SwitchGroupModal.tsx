"use client"

import * as React from "react"
import { X, CalendarIcon, Users, ChevronRight, Search } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
// import { Button } from "@/components/ui/button" // Keeping raw HTML for list items, but using standard UI for dialog
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogClose,
    DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"

interface SwitchGroupModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    missionId: string
    currentGroupId: string
}

export function SwitchGroupModal({ open, onOpenChange, missionId, currentGroupId }: SwitchGroupModalProps) {
    const router = useRouter()
    const [groups, setGroups] = React.useState<any[]>([])
    const [searchQuery, setSearchQuery] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(false)

    React.useEffect(() => {
        const fetchGroups = async () => {
            if (!missionId || !open) return
            try {
                setIsLoading(true)
                const { groupsService } = await import("@/services/groupsService")
                const data = await groupsService.getGroupsByMissionId(missionId)
                setGroups(data)
            } catch (error) {
                console.error("Error fetching groups:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchGroups()
    }, [missionId, open])

    const filteredGroups = groups.filter(g =>
        g.nome?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleSelectGroup = (groupId: string) => {
        router.push(`/grupos/${groupId}`)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                aria-describedby={undefined}
                overlayClassName="!animate-none !duration-0 !transition-none"
                className="w-[98vw] max-w-[480px] p-0 overflow-hidden gap-0 bg-white [&>button]:hidden !animate-none !duration-0 !transition-none"
            >
                {/* Header */}
                <div className="h-14 border-b border-gray-100 flex items-center justify-between px-4 bg-white">
                    <div>
                        <DialogTitle className="text-base font-semibold text-gray-900">Trocar de Grupo</DialogTitle>
                        <DialogDescription className="text-[11px] text-gray-500">Selecione outro grupo desta missão para visualizar</DialogDescription>
                    </div>
                    <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </DialogClose>
                </div>

                <div className="p-4 space-y-4">
                    <div className="relative">
                        <Input
                            placeholder="Buscar grupo..."
                            className="h-10 pl-9 bg-gray-50 border-gray-200 rounded-lg shadow-none text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>

                    <div className="space-y-1 max-h-[300px] overflow-y-auto">
                        {isLoading ? (
                            <div className="p-4 text-center text-xs text-gray-500">Carregando grupos...</div>
                        ) : filteredGroups.length === 0 ? (
                            <div className="p-4 text-center text-xs text-gray-500">Nenhum grupo encontrado.</div>
                        ) : (
                            filteredGroups.map(group => {
                                const isCurrent = group.id === currentGroupId
                                const startDate = group.data_inicio ? new Date(group.data_inicio) : null
                                const endDate = group.data_fim ? new Date(group.data_fim) : null

                                return (
                                    <button
                                        key={group.id}
                                        onClick={() => handleSelectGroup(group.id)}
                                        disabled={isCurrent}
                                        className={cn(
                                            "w-full flex items-center gap-3 p-3 rounded-lg border border-transparent transition-all text-left",
                                            isCurrent
                                                ? "bg-blue-50 border-blue-100 cursor-default"
                                                : "hover:bg-gray-50 hover:border-gray-100 cursor-pointer"
                                        )}
                                    >
                                        <Avatar className="h-10 w-10 border border-gray-100 rounded-lg">
                                            <AvatarImage src={group.logo || undefined} className="object-cover rounded-lg" />
                                            <AvatarFallback className="rounded-lg bg-gray-100 text-gray-500 text-xs">
                                                {group.nome?.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className={cn("font-medium truncate text-sm", isCurrent ? "text-blue-700" : "text-gray-900")}>
                                                    {group.nome}
                                                </span>
                                                {isCurrent && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">Atual</span>}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <CalendarIcon className="w-3 h-3" />
                                                    {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "--"}
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    {group.vagas || 0} vagas
                                                </span>
                                            </div>
                                        </div>

                                        {!isCurrent && <ChevronRight className="w-4 h-4 text-gray-300" />}
                                    </button>
                                )
                            })
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
