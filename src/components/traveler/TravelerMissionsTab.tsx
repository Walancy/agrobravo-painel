"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// Remove unused imports
// import { Button } from "@/components/ui/button" 

export type MissionHistoryItem = {
    id: string
    missionName: string
    missionLogo?: string
    groupName: string
    groupLogo?: string
    destination: string
    status: string
    startDate: string
    endDate: string
    value: number
}

interface TravelerMissionsTabProps {
    missions?: MissionHistoryItem[]
}

export function TravelerMissionsTab({ missions = [] }: TravelerMissionsTabProps) {
    const [searchTerm, setSearchTerm] = React.useState("")

    const filteredMissions = missions.filter(m =>
        m.missionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.groupName.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const columns: ColumnDef<MissionHistoryItem>[] = [
        {
            accessorKey: "missionName",
            header: "Nome da Missão",
            cell: ({ row }) => (
                <div className="flex items-center gap-3 pl-2">
                    <Avatar className="h-8 w-8 bg-gray-100 border border-gray-200">
                        <AvatarImage src={row.original.missionLogo} className="object-cover" />
                        <AvatarFallback className="text-xs text-gray-500 font-medium">
                            {row.original.missionName?.substring(0, 2).toUpperCase() || 'MI'}
                        </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-gray-900">{row.getValue("missionName")}</span>
                </div>
            ),
        },
        {
            accessorKey: "destination",
            header: "Destino",
            cell: ({ row }) => (
                <span className="text-gray-900 font-medium">
                    {row.getValue("destination")}
                </span>
            ),
        },
        {
            accessorKey: "groupName",
            header: "Grupo",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 bg-gray-100 border border-gray-200">
                        <AvatarImage src={row.original.groupLogo} className="object-cover" />
                        <AvatarFallback className="text-xs text-green-700 bg-green-100 font-medium">
                            {row.original.groupName?.substring(0, 2).toUpperCase() || 'GR'}
                        </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-gray-900">{row.getValue("groupName")}</span>
                </div>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string
                return (
                    <Badge variant="secondary" className={cn(
                        "font-medium rounded-full px-4 py-1 text-xs border-none shadow-none",
                        status === "Pendente" && "bg-red-100 text-red-600",
                        status === "Em andamento" && "bg-blue-100 text-blue-600",
                        status === "Planejado" && "bg-orange-100 text-orange-600",
                        status === "Finalizada" && "bg-green-100 text-green-600",
                        status === "Concluída" && "bg-green-100 text-green-600"
                    )}>
                        {status}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "startDate",
            header: "Data de inicio",
            cell: ({ row }) => {
                const date = row.getValue("startDate") as string
                return <span className="text-gray-600 font-medium">{date ? new Date(date).toLocaleDateString('pt-BR') : '-'}</span>
            },
        },
        {
            accessorKey: "endDate",
            header: "Data de fim",
            cell: ({ row }) => {
                const date = row.getValue("endDate") as string
                return <span className="text-gray-600 font-medium">{date ? new Date(date).toLocaleDateString('pt-BR') : '-'}</span>
            },
        },
        {
            accessorKey: "value",
            header: "Valor",
            cell: ({ row }) => {
                const value = row.getValue("value") as number
                return <span className="text-gray-900 font-bold">
                    {value ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                </span>
            },
        },
    ]

    return (
        <div className="flex flex-col h-full space-y-4 bg-white p-6 rounded-2xl border border-gray-100">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Pesquisar"
                        className="pl-10 h-12 bg-transparent border-gray-200 rounded-2xl w-full text-base shadow-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {/* Optional filters can go here */}
            </div>

            {/* Table */}
            <div className="flex-1 overflow-hidden">
                <DataTable columns={columns} data={filteredMissions} />
            </div>
        </div>
    )
}
