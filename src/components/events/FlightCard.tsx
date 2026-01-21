import React, { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Search, Users, Wifi, Usb, Monitor, Plane, Star, Check, ChevronDown, ChevronUp, Clock, ArrowRight } from "lucide-react"

interface FlightCardProps {
    flight: {
        id: string
        airline: string
        flightNumber: string
        price: string
        date?: string
        origin: { code: string, time: string }
        destination: { code: string, time: string }
        duration: string
        planeType: string
        logoColor: string
        logoUrl?: string
        amenities?: string[]
        connections?: {
            airline: string
            flightNumber: string
            origin: { code: string, time: string }
            destination: { code: string, time: string }
            duration: string
            layoverDuration?: string
            planeType?: string
        }[]
    }
    index: number
    isFavorite?: boolean
    onToggleFavorite?: () => void
    isSelected?: boolean
    onSelect?: () => void
    assignedPassengers: Record<string, string>
    onAssignPassenger: (passengerId: string, flightId: string | null) => void
    getFlightNumber: (flightId: string) => string | undefined
    editMode?: boolean
    missionGroups?: any[]
    missionTravelers?: any[]
}


export default function FlightCard({
    flight,
    index,
    isFavorite,
    onToggleFavorite,
    isSelected,
    onSelect,
    assignedPassengers,
    onAssignPassenger,
    getFlightNumber,
    editMode = false,
    missionGroups = [],
    missionTravelers = []
}: FlightCardProps) {
    const [isPassengerPopoverOpen, setIsPassengerPopoverOpen] = useState(false)
    const [tempSelected, setTempSelected] = useState<string[]>([])
    const [isExpanded, setIsExpanded] = useState(false)

    // Calculate passengers assigned to this specific flight (Committed State)
    const myPassengers = Object.entries(assignedPassengers)
        .filter(([_, flightId]) => flightId === flight.id)
        .map(([pId]) => pId);

    // Sync temp state when opening
    useEffect(() => {
        if (isPassengerPopoverOpen) {
            setTempSelected(myPassengers)
        }
    }, [isPassengerPopoverOpen]) // Re-initializing on open ensures fresh state

    const handleTogglePassenger = (id: string) => {
        setTempSelected(prev =>
            prev.includes(id)
                ? prev.filter(p => p !== id)
                : [...prev, id]
        )
    }

    const handleConfirm = () => {
        // Commit changes
        // 1. For newly selected (in temp but not in myPassengers) -> Assign to this flight
        tempSelected.forEach(pId => {
            if (!myPassengers.includes(pId)) {
                onAssignPassenger(pId, flight.id)
            }
        })

        // 2. For removed (in myPassengers but not in temp) -> Unassign (null)
        myPassengers.forEach(pId => {
            if (!tempSelected.includes(pId)) {
                onAssignPassenger(pId, null)
            }
        })

        setIsPassengerPopoverOpen(false)
    }

    const [searchTerm, setSearchTerm] = useState("")
    const [selectedGroup, setSelectedGroup] = useState("all")

    const handleCancel = () => {
        setIsPassengerPopoverOpen(false)
    }

    const getAmenityIcon = (text: string) => {
        const lower = text.toLowerCase();
        if (lower.includes('wi-fi')) return <Wifi className="w-3 h-3" />;
        if (lower.includes('usb') || lower.includes('power')) return <Usb className="w-3 h-3" />;
        if (lower.includes('video') || lower.includes('stream') || lower.includes('tv')) return <Monitor className="w-3 h-3" />;
        return <Check className="w-3 h-3" />;
    }

    // Helper to clean up amenity text (e.g., remove "Average legroom")
    const cleanAmenityText = (text: string) => {
        if (text.includes('legroom')) return null; // Skip legroom for now as it's not a "feature" icon usually
        if (text.includes('Carbon')) return null;
        return text;
    }

    const hasConnections = flight.connections && flight.connections.length > 0;

    return (
        <div className={`bg-gray-50 rounded-2xl p-4 border transition-all ${isSelected ? 'bg-blue-50/50 border-blue-200' : 'border-gray-100'}`}>
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                        {flight.logoUrl ? (
                            <img src={flight.logoUrl} alt={flight.airline} className="w-full h-full object-contain p-1" />
                        ) : (
                            <span className={`font-semibold text-xs ${flight.logoColor}`}>{flight.airline}</span>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">{flight.flightNumber}</span>
                            <span className="text-blue-600 font-semibold">{flight.price}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                            <span>{flight.airline}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                            {flight.date && (
                                <>
                                    <span>{flight.date}</span>
                                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                </>
                            )}
                            <span className="text-blue-600">Economy</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 min-w-[240px]">
                    <div>
                        <span className="block font-medium text-gray-900 text-base">{flight.origin.code}</span>
                        <span className="text-xs text-gray-500">{flight.origin.time}</span>
                    </div>
                    <div className="flex items-center flex-1 gap-2">
                        <Plane className="w-4 h-4 text-blue-600 rotate-45" />
                        <div className="h-[1px] bg-gray-200 flex-1" />
                    </div>
                    <div className="text-right">
                        <span className="block font-medium text-gray-900 text-base">{flight.destination.code}</span>
                        <span className="text-xs text-gray-500">{flight.destination.time}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation()
                            onToggleFavorite?.()
                        }}
                        className="focus:outline-none transition-transform active:scale-95"
                    >
                        <Star
                            className={`w-6 h-6 ${isFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-400 hover:text-yellow-400"}`}
                        />
                    </button>
                    {editMode ? (
                        <input
                            type="radio"
                            checked={isSelected}
                            onChange={() => onSelect?.()}
                            className="w-6 h-6 cursor-pointer accent-blue-600"
                        />
                    ) : (
                        <Checkbox
                            className="w-6 h-6 rounded border-gray-300"
                            checked={isSelected}
                            onCheckedChange={() => onSelect?.()}
                        />
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-900">{flight.planeType} - Duração: <span className="text-blue-600">{flight.duration}</span></span>
                        {hasConnections && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsExpanded(!isExpanded);
                                }}
                                className="flex items-center gap-1 text-[10px] font-medium text-orange-600 hover:text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full transition-colors"
                            >
                                {flight.connections!.length} conexão(ões)
                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-gray-600 font-medium flex-wrap">
                        {flight.amenities && flight.amenities.length > 0 ? (
                            flight.amenities.map((amenity, i) => {
                                const cleaned = cleanAmenityText(amenity);
                                if (!cleaned) return null;
                                return (
                                    <React.Fragment key={i}>
                                        <span className="flex items-center gap-1">
                                            {getAmenityIcon(cleaned)} {cleaned}
                                        </span>
                                        {i < flight.amenities!.length - 1 && <span className="w-1 h-1 bg-gray-300 rounded-full" />}
                                    </React.Fragment>
                                )
                            })
                        ) : (
                            // Fallback if no amenities found
                            <span className="text-gray-400 italic">Sem informações de serviços</span>
                        )}
                    </div>
                </div>
                {!editMode && isSelected && (
                    <div onClick={(e) => e.stopPropagation()}>
                        <Popover open={isPassengerPopoverOpen} onOpenChange={setIsPassengerPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-9 text-xs font-medium px-4">
                                    <Users className="w-4 h-4 mr-2" /> Passageiros: {myPassengers.length}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-0" align="end">
                                <div className="p-4 border-b border-gray-100">
                                    <h4 className="font-medium text-gray-900 mb-3">Selecione os passageiros</h4>
                                    <div className="relative mb-3">
                                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                        <Input
                                            placeholder="Buscar passageiro"
                                            className="h-8 pl-8 text-xs bg-gray-50 border-gray-200"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                                        <SelectTrigger className="w-full h-9 text-xs">
                                            <SelectValue placeholder="Filtrar por grupo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos os grupos</SelectItem>
                                            {missionGroups.map(group => (
                                                <SelectItem key={group.id} value={group.id}>
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="w-4 h-4">
                                                            <AvatarImage src={group.logo || ""} />
                                                            <AvatarFallback>{group.nome?.[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <span>{group.nome}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div
                                    className="max-h-64 overflow-y-auto p-2 overscroll-y-contain"
                                    onWheel={(e) => e.stopPropagation()}
                                >
                                    {missionTravelers
                                        .filter(traveler => {
                                            const matchesSearch = traveler.name.toLowerCase().includes(searchTerm.toLowerCase());
                                            const matchesGroup = selectedGroup === "all" || traveler.groupId === selectedGroup;
                                            return matchesSearch && matchesGroup;
                                        })
                                        .map((traveler) => {
                                            const assignedTo = assignedPassengers[traveler.id];
                                            // Use TEMP state for "isMine" to reflect current checkboxes
                                            const isMine = tempSelected.includes(String(traveler.id));
                                            const otherFlightNumber = (assignedTo && assignedTo !== flight.id)
                                                ? getFlightNumber(assignedTo)
                                                : null;

                                            return (
                                                <div
                                                    key={traveler.id}
                                                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        handleTogglePassenger(String(traveler.id))
                                                    }}
                                                >
                                                    <Checkbox
                                                        id={`p${index}-${traveler.id}`}
                                                        checked={isMine}
                                                        className="w-4 h-4"
                                                    />
                                                    <Avatar className="w-8 h-8">
                                                        <AvatarImage src={traveler.photo || `https://i.pravatar.cc/150?u=${traveler.id}`} />
                                                        <AvatarFallback>{traveler.name[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium text-gray-900">{traveler.name}</span>
                                                            {otherFlightNumber && !isMine && (
                                                                <span className="text-[10px] font-medium text-white bg-orange-500 px-1.5 py-0.5 rounded">
                                                                    {otherFlightNumber}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-500">{traveler.groupName || 'Sem grupo'}</p>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                </div>
                                <div className="p-3 border-t border-gray-100 flex justify-end gap-2 bg-gray-50">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs"
                                        onClick={handleCancel}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="h-8 text-xs bg-blue-600 text-white hover:bg-blue-700"
                                        onClick={handleConfirm}
                                    >
                                        Confirmar
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                )}
            </div>

            {isExpanded && hasConnections && (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-4">
                    {flight.connections!.map((conn, i) => (
                        <div key={i} className="relative pl-4 border-l-2 border-gray-200 ml-2">
                            {conn.layoverDuration && (
                                <div className="mb-2 flex items-center gap-2 text-xs text-orange-600 font-medium">
                                    <Clock className="w-3 h-3" />
                                    <span>Conexão: {conn.layoverDuration}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-900 text-sm">{conn.origin.code}</span>
                                        <ArrowRight className="w-3 h-3 text-gray-400" />
                                        <span className="font-semibold text-gray-900 text-sm">{conn.destination.code}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5">
                                        {conn.airline} {conn.flightNumber} • {conn.duration}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block text-xs font-medium text-gray-900">{conn.origin.time} - {conn.destination.time}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
