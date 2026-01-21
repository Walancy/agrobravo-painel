"use client"

import * as React from "react"
import { Eye, Trash2, Search, Plus, Hotel, Utensils, MapPin, Plane, Star } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type Supplier = {
    id: number
    category: string
    name: string
    city: string
    country: string
    company: string
    rating: number
    missionsUsed: number
}

const suppliers: Supplier[] = [
    {
        id: 1,
        category: "Hospedagem",
        name: "Grand Hyatt",
        city: "Nova York",
        country: "EUA",
        company: "Grand Hyatt",
        rating: 4.9,
        missionsUsed: 10,
    },
    {
        id: 2,
        category: "Restaurante",
        name: "La Pergola",
        city: "Roma",
        country: "Itália",
        company: "Pergola",
        rating: 4.7,
        missionsUsed: 14,
    },
    {
        id: 3,
        category: "Visita",
        name: "John Deere Factory",
        city: "Moline",
        country: "EUA",
        company: "John Deere",
        rating: 4.5,
        missionsUsed: 8,
    },
    {
        id: 4,
        category: "Companhia aérea",
        name: "Azul AD 4587",
        city: "São Paulo",
        country: "Brasil",
        company: "Azul",
        rating: 4.8,
        missionsUsed: 12,
    },
    {
        id: 5,
        category: "Transfer",
        name: "Viação Nordeste",
        city: "Campo Mourão",
        country: "Brasil",
        company: "Em andamento",
        rating: 4.4,
        missionsUsed: 10,
    },
]

const getCategoryIcon = (category: string) => {
    switch (category) {
        case "Hospedagem":
            return <Hotel className="h-4 w-4" />
        case "Restaurante":
            return <Utensils className="h-4 w-4" />
        case "Visita":
            return <MapPin className="h-4 w-4" />
        case "Companhia aérea":
            return <Plane className="h-4 w-4" />
        case "Transfer":
            return <Plane className="h-4 w-4" />
        default:
            return null
    }
}

export function SuppliersList() {
    const [currentPage, setCurrentPage] = React.useState(1)
    const [serviceTypeFilter, setServiceTypeFilter] = React.useState("")
    const [cityFilter, setCityFilter] = React.useState("")
    const [countryFilter, setCountryFilter] = React.useState("")
    const itemsPerPage = 5

    const totalPages = Math.ceil(suppliers.length / itemsPerPage)
    const currentSuppliers = suppliers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const columns: ColumnDef<Supplier>[] = [
        {
            accessorKey: "category",
            header: "Categoria",
            cell: ({ row }) => (
                <div className="flex items-center gap-2 pl-2">
                    <div className="text-blue-600">
                        {getCategoryIcon(row.getValue("category"))}
                    </div>
                    <span className="font-semibold text-gray-900">{row.getValue("category")}</span>
                </div>
            ),
        },
        {
            accessorKey: "name",
            header: "Nome",
            cell: ({ row }) => <span className="text-gray-900 font-medium">{row.getValue("name")}</span>,
        },
        {
            accessorKey: "city",
            header: "Cidade",
            cell: ({ row }) => <span className="text-gray-900 font-medium">{row.getValue("city")}</span>,
        },
        {
            accessorKey: "country",
            header: "País",
            cell: ({ row }) => <span className="text-gray-900 font-medium">{row.getValue("country")}</span>,
        },
        {
            accessorKey: "company",
            header: "Empresa",
            cell: ({ row }) => <span className="text-gray-900 font-medium">{row.getValue("company")}</span>,
        },
        {
            accessorKey: "rating",
            header: "Avaliação",
            cell: ({ row }) => {
                const rating = row.getValue("rating") as number
                return (
                    <div className="flex items-center gap-1">
                        <span className="text-gray-900 font-medium">{rating.toFixed(1)}</span>
                        <span className="text-gray-500 text-xs">({(rating * 1000).toFixed(0)} mil)</span>
                    </div>
                )
            },
        },
        {
            accessorKey: "missionsUsed",
            header: ({ column }) => <div className="text-center">Usado em Missões</div>,
            cell: ({ row }) => <div className="text-center text-gray-900 font-medium">{row.getValue("missionsUsed")}</div>,
        },
        {
            id: "actions",
            header: ({ column }) => <div className="text-right pr-4">Ações</div>,
            cell: ({ row }) => {
                return (
                    <div className="flex justify-end gap-1 pr-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full">
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full">
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

                <div className="flex flex-wrap gap-4 items-end w-full xl:w-auto">
                    <div className="relative">
                        <span className="absolute -top-2 left-4 bg-white px-1 text-xs text-gray-500 z-10">
                            Tipo de serviço
                        </span>
                        <Select value={serviceTypeFilter} onValueChange={setServiceTypeFilter}>
                            <SelectTrigger className="w-[200px] h-12 rounded-2xl border-gray-200 bg-transparent">
                                <SelectValue placeholder="Selecionados: 2" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="hospedagem">Hospedagem</SelectItem>
                                <SelectItem value="restaurante">Restaurante</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="relative">
                        <span className="absolute -top-2 left-4 bg-white px-1 text-xs text-gray-500 z-10">
                            Cidade
                        </span>
                        <Select value={cityFilter} onValueChange={setCityFilter}>
                            <SelectTrigger className="w-[200px] h-12 rounded-2xl border-gray-200 bg-transparent">
                                <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas</SelectItem>
                                <SelectItem value="ny">Nova York</SelectItem>
                                <SelectItem value="roma">Roma</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="relative">
                        <span className="absolute -top-2 left-4 bg-white px-1 text-xs text-gray-500 z-10">
                            País
                        </span>
                        <Select value={countryFilter} onValueChange={setCountryFilter}>
                            <SelectTrigger className="w-[200px] h-12 rounded-2xl border-gray-200 bg-transparent">
                                <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="usa">EUA</SelectItem>
                                <SelectItem value="italia">Itália</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-normal text-base">
                        Atualizar <Plus className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Filters Pills */}
            <div className="flex gap-2 items-center">
                <Badge variant="secondary" className="bg-blue-50 text-blue-600 border border-blue-200 rounded-full px-3 py-1 text-xs font-medium">
                    <Hotel className="h-3 w-3 mr-1" />
                    Hospedagem
                    <button className="ml-2 hover:text-blue-800">×</button>
                </Badge>
                <Badge variant="secondary" className="bg-blue-50 text-blue-600 border border-blue-200 rounded-full px-3 py-1 text-xs font-medium">
                    <Utensils className="h-3 w-3 mr-1" />
                    Restaurante
                    <button className="ml-2 hover:text-blue-800">×</button>
                </Badge>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-hidden">
                <DataTable columns={columns} data={currentSuppliers} />
            </div>

            {/* Pagination */}
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
        </div>
    )
}
