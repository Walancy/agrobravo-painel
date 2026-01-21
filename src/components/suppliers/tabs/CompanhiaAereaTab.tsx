import * as React from "react"
import { Search, Star, Plane, Plus, User, ChevronDown, Wifi, Battery, Monitor, Link as LinkIcon } from "lucide-react"
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

type Flight = {
    id: number
    flightNumber: string
    time: string
    route: string
    duration: string
    origin: string
    destination: string
    amenities: string[]
    isFavorite: boolean
}

const flights: Flight[] = [
    {
        id: 1,
        flightNumber: "AZ 2818",
        time: "08:15h",
        route: "Azul • Economy",
        duration: "35 min",
        origin: "MGF",
        destination: "GRU",
        amenities: ["Wi-Fi", "USB in-seat", "Stream media"],
        isFavorite: false
    },
    {
        id: 2,
        flightNumber: "AZ 2818",
        time: "08:15h",
        route: "Azul • Economy",
        duration: "35 min",
        origin: "MGF",
        destination: "GRU",
        amenities: ["Wi-Fi", "USB in-seat", "Stream media"],
        isFavorite: true
    },
]

export function CompanhiaAereaTab() {
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
                                    <SelectItem value="time">Horário</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center justify-between py-2">
                            <Label htmlFor="favorites-flight" className="text-sm font-medium text-gray-700 cursor-pointer">
                                Exibir apenas favoritos
                            </Label>
                            <Checkbox id="favorites-flight" className="w-5 h-5 rounded border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 shadow-none" />
                        </div>
                    </div>
                </div>

                <Collapsible defaultOpen className="space-y-4">
                    <CollapsibleTrigger className="flex items-center justify-between w-full group">
                        <h3 className="text-sm font-semibold text-gray-900">Origem / Destino</h3>
                        <ChevronDown className="h-4 w-4 text-gray-400 group-data-[state=open]:rotate-180 transition-transform" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4 pt-2">
                        <div className="space-y-4">
                            <div>
                                <Label className="text-xs font-medium text-gray-500 mb-2 block">País de Origem</Label>
                                <Select>
                                    <SelectTrigger className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none">
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="brazil">Brasil</SelectItem>
                                        <SelectItem value="usa">EUA</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-xs font-medium text-gray-500 mb-2 block">País de Destino</Label>
                                <Select>
                                    <SelectTrigger className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none">
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="brazil">Brasil</SelectItem>
                                        <SelectItem value="usa">EUA</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>

                <Collapsible defaultOpen className="space-y-4">
                    <CollapsibleTrigger className="flex items-center justify-between w-full group">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Companhias</h3>
                        <ChevronDown className="h-4 w-4 text-gray-400 group-data-[state=open]:rotate-180 transition-transform" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-6 pt-2">
                        <div className="space-y-3">
                            {['Azul', 'Gol', 'Latam', 'American Airlines', 'Fly Emirates'].map((airline) => (
                                <div key={airline} className="flex items-center justify-between">
                                    <Label htmlFor={airline.toLowerCase()} className="text-sm font-medium text-gray-700 cursor-pointer">{airline}</Label>
                                    <Checkbox id={airline.toLowerCase()} className="w-5 h-5 rounded border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 shadow-none" />
                                </div>
                            ))}
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
                    {flights.map((flight) => (
                        <div key={flight.id} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:shadow-gray-200/50 transition-all group relative">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <button className="text-gray-300 hover:text-orange-400 transition-colors shrink-0">
                                        <Star className={cn("h-6 w-6", flight.isFavorite && "fill-orange-400 text-orange-400")} />
                                    </button>
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                        <Plane className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Voo</div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-bold text-gray-900 text-xl">{flight.flightNumber}</h3>
                                            <span className="text-blue-600 font-bold">{flight.time}</span>
                                        </div>
                                        <div className="text-sm font-medium text-gray-500">{flight.route}</div>
                                        <div className="flex items-center gap-3 pt-1">
                                            {flight.amenities.includes("Wi-Fi") && <Wifi className="h-4 w-4 text-gray-400" />}
                                            {flight.amenities.includes("USB in-seat") && <Battery className="h-4 w-4 text-gray-400" />}
                                            {flight.amenities.includes("Stream media") && <Monitor className="h-4 w-4 text-gray-400" />}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-12">
                                    <div className="text-center">
                                        <div className="text-2xl font-black text-gray-900">{flight.origin}</div>
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Origem</div>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 min-w-[100px]">
                                        <div className="text-[10px] font-bold text-blue-600 uppercase">{flight.duration}</div>
                                        <div className="w-full h-[2px] bg-blue-100 relative">
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-600" />
                                        </div>
                                        <Plane className="h-4 w-4 text-blue-600 mt-1" />
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-black text-gray-900">{flight.destination}</div>
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Destino</div>
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
