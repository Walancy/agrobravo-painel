import * as React from "react"
import { Search, Star, Bed, MapPin, Phone, Plus, User, ChevronDown, Link as LinkIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

type Hotel = {
    id: number
    name: string
    rating: number
    location: string
    location_link: string
    phone: string
    contact: string
    isFavorite: boolean
    price_single: number
    price_total: number
    taxes_single: string
    taxes_total: string
    people_count: number
    rooms_count: number
    days_count: number
}

const hotels: Hotel[] = [
    {
        id: 1,
        name: "Freehand Chicago",
        rating: 9.3,
        location: "River North, Chicago",
        location_link: "#",
        phone: "+1 987-658",
        contact: "Felipe",
        isFavorite: false,
        price_single: 240,
        price_total: 7480.00,
        taxes_single: "+R$ 167,00 em impostos e taxas",
        taxes_total: "+R$ 629,00 em impostos e taxas",
        people_count: 30,
        rooms_count: 12,
        days_count: 5
    },
    {
        id: 2,
        name: "Freehand Chicago",
        rating: 9.3,
        location: "River North, Chicago",
        location_link: "#",
        phone: "+1 987-658",
        contact: "Joseph",
        isFavorite: true,
        price_single: 240,
        price_total: 7480.00,
        taxes_single: "+R$ 167,00 em impostos e taxas",
        taxes_total: "+R$ 629,00 em impostos e taxas",
        people_count: 30,
        rooms_count: 12,
        days_count: 5
    },
]

export function HospedagemTab() {
    const [searchQuery, setSearchQuery] = React.useState("")

    return (
        <div className="flex h-full bg-transparent p-6 gap-6">
            {/* Sidebar Filters */}
            <div className="w-[300px] bg-white rounded-2xl p-6 space-y-8 overflow-y-auto shadow-sm border-r-2 border-blue-600/20">
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Filtros globais</h3>
                    <div className="space-y-4">
                        <div>
                            <Label className="text-xs font-medium text-gray-500 mb-2 block">Ordenar por:</Label>
                            <Select defaultValue="name">
                                <SelectTrigger className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="name">Nome</SelectItem>
                                    <SelectItem value="rating">Avaliação</SelectItem>
                                    <SelectItem value="price">Preço</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center justify-between py-2">
                            <Label htmlFor="favorites" className="text-sm font-medium text-gray-700 cursor-pointer">
                                Exibir apenas favoritos
                            </Label>
                            <Checkbox id="favorites" className="w-5 h-5 rounded border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 shadow-none" />
                        </div>
                    </div>
                </div>

                <Collapsible defaultOpen className="space-y-4">
                    <CollapsibleTrigger className="flex items-center justify-between w-full group">
                        <h3 className="text-sm font-semibold text-gray-900">Localização</h3>
                        <ChevronDown className="h-4 w-4 text-gray-400 group-data-[state=open]:rotate-180 transition-transform" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4 pt-2">
                        <div className="space-y-4">
                            <div>
                                <Label className="text-xs font-medium text-gray-500 mb-2 block">País</Label>
                                <Select>
                                    <SelectTrigger className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none">
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="usa">Estados Unidos</SelectItem>
                                        <SelectItem value="brazil">Brasil</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-xs font-medium text-gray-500 mb-2 block">Estado</Label>
                                <Select>
                                    <SelectTrigger className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none">
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="il">Illinois</SelectItem>
                                        <SelectItem value="ny">New York</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-xs font-medium text-gray-500 mb-2 block">Cidade</Label>
                                <Select>
                                    <SelectTrigger className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none">
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="chicago">Chicago</SelectItem>
                                        <SelectItem value="nyc">New York City</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>

                <Collapsible defaultOpen className="space-y-4">
                    <CollapsibleTrigger className="flex items-center justify-between w-full group">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Filtros categóricos</h3>
                        <ChevronDown className="h-4 w-4 text-gray-400 group-data-[state=open]:rotate-180 transition-transform" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-6 pt-2">
                        <div className="space-y-4">
                            <Label className="text-sm font-semibold text-gray-900 block">Tipo de quarto</Label>
                            <div className="space-y-3">
                                {['Single', 'Double', 'Twin', 'Triple', 'Quadruple'].map((type) => (
                                    <div key={type} className="flex items-center justify-between">
                                        <Label htmlFor={type.toLowerCase()} className="text-sm font-medium text-gray-700 cursor-pointer">{type}</Label>
                                        <Checkbox id={type.toLowerCase()} defaultChecked={type === 'Single' || type === 'Double' || type === 'Twin' || type === 'Quadruple'} className="w-5 h-5 rounded border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 shadow-none" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-sm font-semibold text-gray-900 block">Ocupantes</Label>
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-xs font-medium text-gray-500 mb-2 block">Pessoas*</Label>
                                    <div className="relative">
                                        <Input type="number" defaultValue="30" className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none pr-10" />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
                                            <ChevronDown className="h-3 w-3 text-gray-400 rotate-180 cursor-pointer hover:text-blue-600" />
                                            <ChevronDown className="h-3 w-3 text-gray-400 cursor-pointer hover:text-blue-600" />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-xs font-medium text-gray-500 mb-2 block">Quartos*</Label>
                                    <div className="relative">
                                        <Input type="number" defaultValue="12" className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none pr-10" />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
                                            <ChevronDown className="h-3 w-3 text-gray-400 rotate-180 cursor-pointer hover:text-blue-600" />
                                            <ChevronDown className="h-3 w-3 text-gray-400 cursor-pointer hover:text-blue-600" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Search and Action Bar */}
                <div className="p-6 flex items-center gap-4 bg-white rounded-2xl shadow-sm mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            type="search"
                            placeholder="Pesquisar"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 h-12 rounded-2xl border-gray-200 bg-gray-50 focus:bg-white transition-colors text-base shadow-none"
                        />
                    </div>
                    <Button className="h-12 px-8 bg-blue-600 hover:bg-blue-700 rounded-2xl font-semibold shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] active:scale-[0.98]">
                        Adicionar fornecedor
                    </Button>
                </div>

                {/* Suppliers List */}
                <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                    {hotels.map((hotel) => (
                        <div key={hotel.id} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:shadow-gray-200/50 transition-all group relative">
                            <div className="flex items-center gap-6">
                                {/* Left Section: Info */}
                                <div className="flex items-center gap-4 flex-1">
                                    <button className="text-gray-300 hover:text-orange-400 transition-colors shrink-0">
                                        <Star className={cn("h-6 w-6", hotel.isFavorite && "fill-orange-400 text-orange-400")} />
                                    </button>
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                        <Bed className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Hospedagem</div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-gray-900 text-xl">{hotel.name}</h3>
                                            <span className="text-sm font-bold text-gray-400">{hotel.rating}</span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                                            <a href={hotel.location_link} className="flex items-center gap-1.5 text-blue-600 font-medium hover:underline">
                                                <LinkIcon className="h-3.5 w-3.5" />
                                                {hotel.location}
                                            </a>
                                            <div className="w-px h-3 bg-gray-200 mx-1" />
                                            <div className="flex items-center gap-1.5 text-blue-600 font-medium">
                                                <Phone className="h-3.5 w-3.5" />
                                                {hotel.phone}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-blue-600 font-medium">
                                                <span className="text-gray-300">•</span>
                                                {hotel.contact}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Section: Pricing */}
                                <div className="flex items-center gap-10 shrink-0">
                                    {/* Single Price */}
                                    <div className="text-right space-y-1 min-w-[140px]">
                                        <div className="text-xs font-medium text-gray-400">1 diária, 2 adultos</div>
                                        <div className="text-2xl font-bold text-gray-900">R$ {hotel.price_single.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</div>
                                        <div className="text-[10px] font-bold text-blue-600">{hotel.taxes_single}</div>
                                    </div>

                                    {/* Divider */}
                                    <div className="w-px h-12 bg-gray-100" />

                                    {/* Total Price */}
                                    <div className="text-right space-y-1 min-w-[180px]">
                                        <div className="text-xs font-medium text-gray-400">{hotel.people_count} pessoas {hotel.rooms_count} quartos {hotel.days_count} dias</div>
                                        <div className="text-2xl font-bold text-gray-900">R$ {hotel.price_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                                        <div className="text-[10px] font-bold text-blue-600">{hotel.taxes_total}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </div>
    )
}
