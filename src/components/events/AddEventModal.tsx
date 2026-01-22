"use client"

import * as React from "react"
import FlightCard from "@/components/events/FlightCard"
import VisitForm from "@/components/events/VisitForm"
import HotelForm from "@/components/events/HotelForm"
import FoodForm from "@/components/events/FoodForm"
import LeisureForm from "@/components/events/LeisureForm"
import ReturnForm from "@/components/events/ReturnForm"
import { ParticipantsSelector } from "@/components/common/ParticipantsSelector"
import { SelectedParticipantsSummary } from "@/components/common/SelectedParticipantsSummary"
import { CostSelector } from "@/components/common/CostSelector"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Plane,
    BedDouble,
    Bus,
    Ticket,
    MoreHorizontal,
    Search,
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    DollarSign,
    Wifi,
    Usb,
    Monitor,
    Users,
    ChevronDown,
    ChevronUp,
    Utensils,
    Sun,
    Pencil,
    X,
    Star,
    ArrowLeft,
    ArrowLeftRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AirportSelector } from "@/components/common/AirportSelector"
import { airports } from "@/data/airports"
import { checkTimeConflict, validateDateSelected } from "@/lib/eventValidation"
import { ConflictAlert } from "@/components/common/ConflictAlert"


interface Event {
    id: string
    time: string
    endTime?: string
    type: 'flight' | 'transfer' | 'meal' | 'food' | 'hotel' | 'visit' | 'ai_recommendation' | 'leisure' | 'checkout' | 'return'
    title: string
    subtitle?: string
    price?: string
    status?: 'confirmed' | 'quoting' | 'quoted' | 'free'
    location?: string
    from?: string
    to?: string
    fromCode?: string
    toCode?: string
    fromTime?: string
    toTime?: string
    driver?: string
    duration?: string
    logos?: string[]
    description?: string
    isFavorite?: boolean
    passengers?: any[]
    date?: string
    hasTransfer?: boolean
    transferDate?: string
    transferTime?: string
    groupLogos?: string[]
    referenceEventId?: string
    site_url?: string
}

interface AddEventModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    clickPosition?: { x: number; y: number }
    onSave?: (events: Event[]) => void
    initialData?: Event
    missionGroups?: any[]
    missionTravelers?: any[]
    defaultDate?: string
    minDate?: string
    maxDate?: string
    existingEvents?: Event[]
}

type EventType = 'flight' | 'visit' | 'hotel' | 'food' | 'leisure' | 'return'


export function AddEventModal({ open, onOpenChange, clickPosition, onSave, initialData, missionGroups, missionTravelers, defaultDate, minDate, maxDate, existingEvents }: AddEventModalProps) {
    const [activeType, setActiveType] = React.useState<EventType>('flight')

    React.useEffect(() => {
        if (initialData) {
            // Map event types to supported tabs
            const typeMap: Record<string, EventType> = {
                'flight': 'flight',
                'visit': 'visit',
                'hotel': 'hotel',
                'food': 'food',
                'meal': 'food',
                'leisure': 'leisure',
                'return': 'return'
            }
            if (typeMap[initialData.type]) {
                setActiveType(typeMap[initialData.type])
            }
        }
    }, [initialData])

    const sidebarItems = [
        { id: 'flight', label: 'Voo', icon: Plane },
        { id: 'hotel', label: 'Hospedagem', icon: BedDouble },
        { id: 'visit', label: 'Visita', icon: MapPin },
        { id: 'food', label: 'Alimentação', icon: Utensils },
        { id: 'leisure', label: 'Livre', icon: Sun },
        { id: 'return', label: 'Retorno', icon: ArrowLeftRight },
    ]

    const [persistedState, setPersistedState] = React.useState<Record<string, any>>({})

    const handlePersistState = (type: EventType, data: any) => {
        setPersistedState(prev => ({
            ...prev,
            [type]: data
        }))
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-w-[85vw] h-[85vh] p-0 overflow-hidden gap-0 flex flex-col sm:flex-row [&>button]:hidden
                    duration-0 data-[state=open]:animate-none data-[state=closed]:animate-none
                    data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0
                    data-[state=open]:zoom-in-100 data-[state=closed]:zoom-out-100
                    data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-1/2
                    data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-1/2"
            >
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 z-10">
                    <div>
                        <DialogTitle className="text-lg font-semibold text-gray-900">Adicionar evento</DialogTitle>
                        <DialogDescription className="text-xs text-gray-500">Selecione o tipo de evento</DialogDescription>
                    </div>
                    <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </DialogClose>
                </div>

                {/* Sidebar */}
                <div className="w-64 bg-gray-50 border-r border-gray-100 flex flex-col p-4 gap-2 shrink-0 hidden md:flex mt-16">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon
                        const isActive = activeType === item.id
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveType(item.id as EventType)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left",
                                    isActive
                                        ? "bg-white text-blue-600 border border-gray-100"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                )}
                            >
                                <Icon className={cn("w-5 h-5", isActive ? "text-blue-600" : "text-gray-400")} />
                                {item.label}
                            </button>
                        )
                    })}
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white mt-16">
                    <div className={cn("flex-1 min-h-0", activeType === 'flight' ? "overflow-hidden" : "overflow-y-auto")}>
                        {activeType === 'flight' && (
                            <FlightForm
                                onSave={onSave}
                                onCancel={() => onOpenChange(false)}
                                initialData={initialData}
                                missionGroups={missionGroups}
                                missionTravelers={missionTravelers}
                                persistedState={persistedState['flight']}
                                onPersistState={(data) => handlePersistState('flight', data)}
                                defaultDate={defaultDate}
                                minDate={minDate}
                                maxDate={maxDate}
                                existingEvents={existingEvents}
                            />
                        )}
                        {activeType === 'visit' && (
                            <VisitForm
                                onSave={onSave}
                                onCancel={() => onOpenChange(false)}
                                persistedState={persistedState['visit']}
                                onPersistState={(data: any) => handlePersistState('visit', data)}
                                missionGroups={missionGroups}
                                missionTravelers={missionTravelers}
                                defaultDate={defaultDate}
                                minDate={minDate}
                                maxDate={maxDate}
                                existingEvents={existingEvents}
                            />
                        )}
                        {activeType === 'hotel' && (
                            <HotelForm
                                onSave={onSave}
                                onCancel={() => onOpenChange(false)}
                                initialData={initialData}
                                persistedState={persistedState['hotel']}
                                onPersistState={(data: any) => handlePersistState('hotel', data)}
                                missionGroups={missionGroups}
                                missionTravelers={missionTravelers}
                                defaultDate={defaultDate}
                                minDate={minDate}
                                maxDate={maxDate}
                                existingEvents={existingEvents}
                            />
                        )}
                        {activeType === 'food' && (
                            <FoodForm
                                onSave={onSave}
                                onCancel={() => onOpenChange(false)}
                                persistedState={persistedState['food']}
                                onPersistState={(data: any) => handlePersistState('food', data)}
                                missionGroups={missionGroups}
                                missionTravelers={missionTravelers}
                                defaultDate={defaultDate}
                                minDate={minDate}
                                maxDate={maxDate}
                                existingEvents={existingEvents}
                            />
                        )}
                        {activeType === 'leisure' && (
                            <LeisureForm
                                onSave={onSave}
                                onCancel={() => onOpenChange(false)}
                                persistedState={persistedState['leisure']}
                                onPersistState={(data: any) => handlePersistState('leisure', data)}
                                missionGroups={missionGroups}
                                missionTravelers={missionTravelers}
                                defaultDate={defaultDate}
                                minDate={minDate}
                                maxDate={maxDate}
                                existingEvents={existingEvents}
                            />
                        )}
                        {activeType === 'return' && (
                            <ReturnForm
                                onSave={onSave}
                                onCancel={() => onOpenChange(false)}
                                persistedState={persistedState['return']}
                                onPersistState={(data: any) => handlePersistState('return', data)}
                                defaultDate={defaultDate}
                                minDate={minDate}
                                maxDate={maxDate}
                                existingEvents={existingEvents}
                            />
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

import { getFlights } from "@/app/(dashboard)/actions/get-flights"

// ... (keep existing imports)

// ... (keep AddEventModal component)

export function FlightForm({
    onSave,
    onCancel,
    initialData,
    missionGroups,
    missionTravelers,
    persistedState,
    onPersistState,
    defaultDate,
    minDate,
    maxDate,
    existingEvents
}: {
    onSave?: (events: Event[]) => void;
    onCancel?: () => void;
    initialData?: Event;
    missionGroups?: any[];
    missionTravelers?: any[];
    persistedState?: any;
    onPersistState?: (data: any) => void;
    defaultDate?: string;
    minDate?: string;
    maxDate?: string;
    existingEvents?: Event[];
}) {
    const [conflictInfo, setConflictInfo] = React.useState<{ hasConflict: boolean; message: string; conflictingEvents: Event[] }>({ hasConflict: false, message: '', conflictingEvents: [] })


    const [selectedFlightIds, setSelectedFlightIds] = React.useState<string[]>([])
    const [passengerAssignments, setPassengerAssignments] = React.useState<Record<string, string>>({})
    const [isManualMode, setIsManualMode] = React.useState(false)
    const [favorites, setFavorites] = React.useState<string[]>([])
    const [showFavorites, setShowFavorites] = React.useState(false)
    const [showAssignedOnly, setShowAssignedOnly] = React.useState(false)
    const [hasTransfer, setHasTransfer] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)
    const [showCostDivision, setShowCostDivision] = React.useState(false)
    const [costDivision, setCostDivision] = React.useState({ company: 50, traveler: 50 })
    const [flights, setFlights] = React.useState<any[]>([])

    // Format defaultDate to DD/MM/YYYY for display
    const formattedDefaultDate = defaultDate ? defaultDate.split('-').reverse().join('/') : '22/05/2026';

    // Selection Mode State (Left Column)
    const [selectionData, setSelectionData] = React.useState({
        date: formattedDefaultDate,
        time: '09:00',
        origin: 'cac',
        destination: 'gru',
        query: ''
    })

    // Manual Mode State
    const [manualData, setManualData] = React.useState({
        airline: '',
        number: '',
        origin: '',
        destination: '',
        date: formattedDefaultDate,
        passengers: '30',
        startTime: '09:00',
        endTime: '11:00',
        plane: '',
        price: '',
        notes: ''
    })

    React.useEffect(() => {
        if (!existingEvents) return

        const currentData = isManualMode ? {
            date: manualData.date,
            time: manualData.startTime,
            endTime: manualData.endTime,
            type: 'flight',
            id: initialData?.id
        } : {
            date: selectionData.date,
            time: selectionData.time,
            type: 'flight',
            id: initialData?.id
        }

        // Don't show conflicts if no date is selected
        if (!validateDateSelected(currentData.date)) {
            setConflictInfo({ hasConflict: false, message: '', conflictingEvents: [] })
            return
        }

        const conflict = checkTimeConflict(currentData, existingEvents)
        setConflictInfo(conflict)
    }, [isManualMode, manualData.date, manualData.startTime, manualData.endTime, selectionData.date, selectionData.time, existingEvents, initialData?.id])

    // Initialize from persisted state
    React.useEffect(() => {
        if (persistedState) {
            if (persistedState.selectionData) setSelectionData(persistedState.selectionData)
            if (persistedState.manualData) setManualData(persistedState.manualData)
            if (persistedState.flights) setFlights(persistedState.flights)
            if (persistedState.selectedFlightIds) setSelectedFlightIds(persistedState.selectedFlightIds)
            if (persistedState.passengerAssignments) setPassengerAssignments(persistedState.passengerAssignments)
            if (persistedState.isManualMode !== undefined) setIsManualMode(persistedState.isManualMode)
            if (persistedState.favorites) setFavorites(persistedState.favorites)
            if (persistedState.showFavorites !== undefined) setShowFavorites(persistedState.showFavorites)
            if (persistedState.showAssignedOnly !== undefined) setShowAssignedOnly(persistedState.showAssignedOnly)
            if (persistedState.hasTransfer !== undefined) setHasTransfer(persistedState.hasTransfer)
        }
    }, [])

    // Persist state changes
    React.useEffect(() => {
        if (onPersistState) {
            const timeoutId = setTimeout(() => {
                onPersistState({
                    selectionData,
                    manualData,
                    flights,
                    selectedFlightIds,
                    passengerAssignments,
                    isManualMode,
                    favorites,
                    showFavorites,
                    showAssignedOnly,
                    hasTransfer
                })
            }, 500)
            return () => clearTimeout(timeoutId)
        }
    }, [
        selectionData, manualData, flights, selectedFlightIds,
        passengerAssignments, isManualMode, favorites,
        showFavorites, showAssignedOnly, hasTransfer, onPersistState
    ])

    // Map codes to cities using the airports data
    const getLoc = React.useCallback((code: string) => {
        const airport = airports.find(a => a.code.toLowerCase() === code.toLowerCase());
        return {
            code: code.toUpperCase(),
            city: airport ? airport.city : code.toUpperCase()
        };
    }, []);

    React.useEffect(() => {
        if (initialData && initialData.type === 'flight') {
            // Populate manual data
            setManualData({
                airline: initialData.title.split(' ')[0] || '',
                number: initialData.title.split(' ').slice(1).join(' ') || '',
                origin: initialData.fromCode || '',
                destination: initialData.toCode || '',
                date: initialData.date || '22/05/2026',
                passengers: initialData.passengers ? String(initialData.passengers.length) : '30',
                startTime: initialData.fromTime || initialData.time || '09:00',
                endTime: initialData.toTime || '11:00',
                plane: '',
                price: initialData.price || '',
                notes: initialData.description || ''
            })

            // Populate selection data
            setSelectionData(prev => ({
                ...prev,
                date: initialData.date || prev.date,
                time: initialData.fromTime || initialData.time || prev.time,
                origin: initialData.fromCode?.toLowerCase() || prev.origin,
                destination: initialData.toCode?.toLowerCase() || prev.destination
            }))

            // Initialize passenger assignments
            if (initialData.passengers) {
                const assignments: Record<string, string> = {}
                initialData.passengers.forEach(pId => {
                    assignments[String(pId)] = initialData.id
                })
                setPassengerAssignments(assignments)
            }

            // Create synthetic flight to show as current selection
            const syntheticFlight = {
                id: initialData.id,
                airline: initialData.title.split(' ')[0] || 'Unknown',
                flightNumber: initialData.title.split(' ').slice(1).join(' ') || initialData.title,
                price: initialData.price || 'R$ 0,00',
                date: initialData.date || '22/05/2026',
                origin: { code: initialData.fromCode || '???', time: initialData.fromTime || initialData.time },
                destination: { code: initialData.toCode || '???', time: initialData.toTime || '' },
                duration: initialData.duration || '',
                planeType: 'N/A',
                logoColor: 'text-gray-900',
                logoUrl: initialData.logos?.[0],
                amenities: [],
                connections: []
            }
            setFlights([syntheticFlight])
            setSelectedFlightIds([`flight-${initialData.id}`])
            setHasTransfer(!!initialData.hasTransfer)
        }
    }, [initialData])

    const toggleFavorite = (flightId: string) => {
        setFavorites(prev =>
            prev.includes(flightId)
                ? prev.filter(id => id !== flightId)
                : [...prev, flightId]
        )
    }



    const handleSearchFlights = async () => {
        setIsLoading(true)
        try {
            // Convert date from DD/MM/YYYY to YYYY-MM-DD
            const [day, month, year] = selectionData.date.split('/')
            const formattedDate = `${year}-${month}-${day}`

            const data = await getFlights({
                departure_id: selectionData.origin.toUpperCase(),
                arrival_id: selectionData.destination.toUpperCase(),
                outbound_date: formattedDate,
            })

            if (data && (data.best_flights || data.other_flights)) {
                const allFlights = [...(data.best_flights || []), ...(data.other_flights || [])]

                const mappedFlights = allFlights
                    .filter((item: any) => {
                        if (!selectionData.query) return true;
                        const firstLeg = item.flights[0];
                        const airline = firstLeg.airline || "";
                        const flightNum = firstLeg.flight_number || "";
                        const q = selectionData.query.toLowerCase();
                        return airline.toLowerCase().includes(q) || flightNum.toLowerCase().includes(q);
                    })
                    .map((item: any, index: number) => {
                        // ... (keep existing mapping)
                        const firstLeg = item.flights[0]
                        const lastLeg = item.flights[item.flights.length - 1]

                        const startDateParts = firstLeg.departure_airport.time.split(' ');
                        const startTime = startDateParts[1];
                        const [y, mo, d] = startDateParts[0].split('-');
                        const formattedDate = `${d}/${mo}/${y}`;

                        const endTime = lastLeg.arrival_airport.time.split(' ')[1]

                        let logoColor = 'text-gray-900'
                        if (firstLeg.airline.includes('Azul')) logoColor = 'text-blue-900'
                        if (firstLeg.airline.includes('LATAM')) logoColor = 'text-red-700'
                        if (firstLeg.airline.includes('GOL')) logoColor = 'text-orange-500'

                        let connections: any[] = [];
                        if (item.flights.length > 1) {
                            connections = item.flights.slice(1).map((leg: any, i: number) => {
                                const prevLeg = item.flights[i];
                                const arrivalPrev = new Date(prevLeg.arrival_airport.time);
                                const departCurr = new Date(leg.departure_airport.time);
                                const diffMs = departCurr.getTime() - arrivalPrev.getTime();
                                const diffMins = Math.floor(diffMs / 60000);
                                const h = Math.floor(diffMins / 60);
                                const m = diffMins % 60;
                                const layover = `${h}h ${m}m`;

                                return {
                                    airline: leg.airline,
                                    flightNumber: leg.flight_number,
                                    origin: {
                                        code: leg.departure_airport.id,
                                        time: leg.departure_airport.time.split(' ')[1]
                                    },
                                    destination: {
                                        code: leg.arrival_airport.id,
                                        time: leg.arrival_airport.time.split(' ')[1]
                                    },
                                    duration: `${leg.duration} min`,
                                    layoverDuration: layover,
                                    planeType: leg.airplane
                                };
                            });
                        }

                        return {
                            id: item.departure_token || `api-${index}`,
                            airline: firstLeg.airline,
                            flightNumber: firstLeg.flight_number,
                            price: `$${item.price}`,
                            date: formattedDate,
                            origin: {
                                code: firstLeg.departure_airport.id,
                                name: firstLeg.departure_airport.name,
                                time: startTime
                            },
                            destination: {
                                code: lastLeg.arrival_airport.id,
                                name: lastLeg.arrival_airport.name,
                                time: endTime
                            },
                            duration: `${item.total_duration || item.duration} min`,
                            planeType: firstLeg.airplane || 'N/A',
                            logoColor: logoColor,
                            logoUrl: item.airline_logo,
                            amenities: firstLeg.extensions,
                            connections: connections
                        }
                    })

                // Preserve synthetic flight if it's selected
                if (initialData && initialData.type === 'flight') {
                    const syntheticId = initialData.id;
                    const isSyntheticSelected = selectedFlightIds.includes(`flight-${syntheticId}`);
                    if (isSyntheticSelected && !mappedFlights.find(f => f.id === syntheticId)) {
                        const syntheticFlight = flights.find(f => f.id === syntheticId);
                        if (syntheticFlight) {
                            setFlights([syntheticFlight, ...mappedFlights]);
                        } else {
                            setFlights(mappedFlights);
                        }
                    } else {
                        setFlights(mappedFlights);
                    }
                } else {
                    setFlights(mappedFlights);
                }
            }
        } catch (error) {
            console.error("Error searching flights:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const getFlightNumber = (flightId: string) => flights.find(f => f.id === flightId)?.flightNumber;



    // Sync selectionData with selectedFlight
    React.useEffect(() => {
        if (selectedFlightIds.length === 0) return;
        // Use the last selected flight for form data, or first one
        const lastId = selectedFlightIds[selectedFlightIds.length - 1];
        const id = lastId.replace('flight-', '');
        const flight = flights.find(f => f.id === id);
        if (flight) {
            setSelectionData(prev => ({
                ...prev,
                time: flight.origin.time.replace('h', ''),
                origin: flight.origin.code.toLowerCase(),
                destination: flight.destination.code.toLowerCase(),
            }));
        }
    }, [selectedFlightIds, flights]); // Added flights dependency



    // Populate form if editing
    React.useEffect(() => {
        if (initialData && initialData.type === 'flight') {
            // We removed setIsManualMode(true) to allow search mode by default
            // But we keep the data population logic if needed elsewhere
        }
    }, [initialData])

    const handleSave = async () => {
        if (!onSave || isLoading) return
        setIsLoading(true)
        try {
            const newEvents: Event[] = []

            const fromLoc = getLoc(selectionData.origin);
            const toLoc = getLoc(selectionData.destination);

            if (isManualMode) {
                const manualEvent: Event = {
                    id: initialData?.id || Math.random().toString(36).substr(2, 9),
                    time: manualData.startTime,
                    type: 'flight',
                    title: `${manualData.airline} ${manualData.number}`,
                    subtitle: 'Voo',
                    from: getLoc(manualData.origin).city,
                    to: getLoc(manualData.destination).city,
                    fromCode: manualData.origin,
                    toCode: manualData.destination,
                    fromTime: manualData.startTime,
                    toTime: manualData.endTime,
                    price: manualData.price,
                    description: manualData.notes,
                    passengers: Array.from({ length: parseInt(manualData.passengers) || 0 }, (_, i) => String(i + 1)),
                    hasTransfer: hasTransfer
                }
                newEvents.push(manualEvent)

                if (hasTransfer) {
                    const transferEvent: Event = {
                        id: Math.random().toString(36).substr(2, 9),
                        time: manualData.endTime,
                        type: 'transfer',
                        title: 'Transferência',
                        subtitle: 'Transporte',
                        location: manualData.destination,
                        driver: 'David Príncipe',
                        duration: '1h 00 min',
                        logos: [],
                        status: 'confirmed'
                    }
                    newEvents.push(transferEvent)
                }
            } else {
                // Iterate over ALL selected flights
                selectedFlightIds.forEach(flightId => {
                    const selectedId = flightId.replace('flight-', '')
                    const selectedFlightData = flights.find(f => f.id === selectedId)

                    if (!selectedFlightData) return;

                    // Calculate arrival time fallback
                    let arrivalTime = "";
                    if (selectedFlightData.duration && selectionData.time) {
                        const durationMatch = selectedFlightData.duration.match(/(\d+)/);
                        const durationMin = durationMatch ? parseInt(durationMatch[1]) : 0;
                        const [sh, sm] = selectionData.time.split(':').map(Number);
                        let totalM = (sh * 60 + sm) + durationMin;
                        if (totalM >= 24 * 60) totalM -= 24 * 60;
                        const eh = Math.floor(totalM / 60);
                        const em = totalM % 60;
                        arrivalTime = `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
                    }

                    // Create Flight Event
                    const flightEvent: Event = {
                        id: (initialData?.id && selectedFlightIds.length === 1) ? initialData.id : Math.random().toString(36).substr(2, 9),
                        time: selectedFlightData.origin.time || selectionData.time,
                        type: 'flight',
                        title: `${selectedFlightData.airline} ${selectedFlightData.flightNumber}`,
                        subtitle: 'Voo',
                        price: selectedFlightData.price,
                        status: 'confirmed',
                        from: fromLoc.city,
                        to: toLoc.city,
                        fromCode: selectedFlightData.origin.code || fromLoc.code,
                        toCode: selectedFlightData.destination.code || toLoc.code,
                        fromTime: selectedFlightData.origin.time || selectionData.time,
                        toTime: selectedFlightData.destination.time || arrivalTime,
                        duration: selectedFlightData.duration,
                        logos: [selectedFlightData.logoUrl].filter(Boolean) as string[],
                        passengers: Object.entries(passengerAssignments)
                            .filter(([_, fId]) => fId === selectedFlightData.id)
                            .map(([pId]) => pId),
                        hasTransfer: hasTransfer,
                        connections: selectedFlightData.connections
                    }
                    newEvents.push(flightEvent)

                    // Create Transfer Event if selected
                    // Only create transfer if it's a new event OR if we are explicitly handling transfer updates in the parent
                    // But here, the parent (EditFlightModal) expects us to return the transfer event if hasTransfer is true.
                    // The issue is that the parent MIGHT already have a transfer event in the database.
                    // However, the current logic in EditFlightModal simply updates the flight event and creates new events for anything else returned.
                    // To fix duplication, we should only return the transfer event here. The parent (GroupItineraryTab) handles deletion of old transfers if hasTransfer becomes false.
                    // But if hasTransfer is true, we need to know if we should CREATE a new one or UPDATE the existing one.
                    // Since we don't pass the existing transfer ID to this form, we can't update it easily.
                    // A simple fix for "duplication on edit" is to NOT return a transfer event if we are in edit mode (initialData exists) AND the user didn't change the transfer status.
                    // BUT, if the user ADDS a transfer during edit, we need to return it.
                    // AND if the user REMOVES a transfer, we need to return the flight without transfer (which we do).

                    // Actually, the duplication happens because EditFlightModal calls onSave with the array.
                    // GroupItineraryTab.handleEditEventSave iterates over this array.
                    // If it finds an event with the same ID as editingEvent, it updates it.
                    // If it finds an event with a NEW ID (which our transfer has), it CREATES it.
                    // So every time we save an edit with hasTransfer=true, we generate a NEW transfer event ID, and GroupItineraryTab creates it.

                    // FIX: If we are editing (initialData exists) and hasTransfer is true, we should try to reuse the existing transfer ID if possible, or let the parent handle it.
                    // Since we don't have the transfer ID here, we can't reuse it.
                    // We will rely on the parent to manage the transfer existence.
                    // If we are editing, we will NOT push a transfer event here. The parent should check 'hasTransfer' on the flight and ensure a transfer exists.
                    // WAIT, GroupItineraryTab DOES NOT automatically create a transfer if flight.hasTransfer is true. It only creates events passed to it.

                    // So we MUST pass the transfer event. But we need to prevent GroupItineraryTab from creating a DUPLICATE.
                    // The problem is that GroupItineraryTab sees a new ID and creates a new event.
                    // We need to signal to GroupItineraryTab that this transfer corresponds to the existing one.

                    // Let's modify the logic:
                    // If initialData exists (editing), we DON'T add the transfer event to the array here.
                    // Instead, we rely on the fact that the Flight Event has `hasTransfer: true`.
                    // We need to update GroupItineraryTab to check for this flag and create/update the transfer accordingly.

                    // However, changing GroupItineraryTab is risky.
                    // Alternative: If initialData exists, we assume the transfer already exists if it was there before.
                    // But what if it wasn't?

                    // Let's look at how we can fix this in AddEventModal.
                    // If we are editing, we should only add the transfer event if it didn't exist before?
                    // Or maybe we can't fix it here without the transfer ID.

                    // Let's go with the user's request: "se eu edito o evento de voo, o card de transfer duplica."
                    // This implies we are creating a NEW transfer every time.
                    // If we simply STOP returning the transfer event when editing, the duplicate won't be created.
                    // But what if the user wants to ADD a transfer?

                    // Let's try this: Only add transfer event if !initialData OR (initialData && !initialData.hasTransfer).
                    // If initialData.hasTransfer is true, and we still have hasTransfer true, we assume the existing one is fine and don't return a new one.
                    // This assumes the transfer details (time, location) don't need to change or are updated elsewhere.
                    // But transfer time depends on flight arrival. If flight changes, transfer should update.

                    // Ideally, we should pass the transfer ID to this form. But we don't have it easily.

                    // Let's try the condition:
                    if (hasTransfer) {
                        // Only create a NEW transfer event object if we are NOT editing an event that already had a transfer.
                        // If we are editing an event that already had a transfer, we assume the parent/backend handles the update via the 'hasTransfer' flag or we need a way to identify the existing transfer.
                        // Since GroupItineraryTab logic for 'handleEditEventSave' creates any event with a new ID, we must avoid sending a new ID for an existing transfer.

                        const shouldCreateTransferObject = !initialData || !initialData.hasTransfer;

                        if (shouldCreateTransferObject) {
                            const transferEvent: Event = {
                                id: Math.random().toString(36).substr(2, 9),
                                time: selectedFlightData.destination.time || arrivalTime || "12:00",
                                type: 'transfer',
                                title: 'Transferência',
                                subtitle: 'Transporte',
                                location: selectedFlightData.destination.name || toLoc.city,
                                driver: 'David Príncipe',
                                duration: '1h 00 min',
                                logos: [],
                                status: 'confirmed'
                            }
                            newEvents.push(transferEvent)
                        }
                    }
                });
            }

            await onSave(newEvents)
        } catch (error) {
            console.error("Error saving flight:", error)
        } finally {
            setIsLoading(false)
        }
    }


    const handleFlightSelection = (flightId: string) => {
        const fid = `flight-${flightId}`

        setSelectedFlightIds(prev => {
            const isSelected = prev.includes(fid)
            if (isSelected) {
                // Deselecting: Remove assigned passengers
                setPassengerAssignments(pPrev => {
                    const next = { ...pPrev }
                    Object.keys(next).forEach(key => {
                        if (next[key] === flightId) {
                            delete next[key]
                        }
                    })
                    return next
                })
                return prev.filter(id => id !== fid)
            } else {
                // Selecting: Add only if not already present
                return prev.includes(fid) ? prev : [...prev, fid]
            }
        })
    }

    const totalCost = selectedFlightIds.reduce((acc, flightId) => {
        const selectedId = flightId.replace('flight-', '')
        const flight = flights.find(f => f.id === selectedId)
        if (!flight) return acc

        // Robust price parsing
        let priceStr = flight.price.replace(/[R$\s]/g, '');
        const lastComma = priceStr.lastIndexOf(',');
        const lastDot = priceStr.lastIndexOf('.');

        if (lastComma > lastDot) {
            // Likely Brazilian format: 1.234,56 or 1234,56
            priceStr = priceStr.replace(/\./g, '').replace(',', '.');
        } else if (lastDot > lastComma) {
            // Likely US format: 1,234.56 or 1234.56
            priceStr = priceStr.replace(/,/g, '');
        }

        const price = parseFloat(priceStr) || 0

        const passengersCount = Object.values(passengerAssignments).filter(fid => fid === selectedId).length
        return acc + (price * passengersCount)
    }, 0)

    return (
        <div className="flex flex-col h-full">
            {isManualMode && (
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsManualMode(false)}
                        className="h-8 w-8"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h2 className="text-lg font-semibold text-gray-900">Adicionar Voo Manualmente</h2>
                </div>
            )}
            <div className="flex flex-1 overflow-hidden p-6">
                {!isManualMode ? (
                    <>
                        {/* Left Column - Form Fields */}
                        <div className="w-1/2 flex flex-col gap-5 overflow-y-auto pr-8 pl-1 py-1">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-gray-500">Dia do evento*</Label>
                                    <div className="relative">
                                        <Input
                                            type="date"
                                            value={selectionData.date.split('/').reverse().join('-')}
                                            onChange={(e) => setSelectionData({ ...selectionData, date: e.target.value.split('-').reverse().join('/') })}
                                            min={minDate}
                                            max={maxDate}
                                            className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs text-gray-500">Horario de viagem*</Label>
                                    <div className="relative">
                                        <Input
                                            type="time"
                                            value={selectionData.time}
                                            onChange={(e) => setSelectionData({ ...selectionData, time: e.target.value })}
                                            className="h-12 bg-gray-50 border-gray-200 rounded-xl px-4 shadow-none block"
                                        />
                                    </div>
                                </div>

                                <div className="col-span-2">
                                    <ConflictAlert
                                        message={conflictInfo.message}
                                        conflictingEvents={conflictInfo.conflictingEvents}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-gray-500">Origem*</Label>
                                    <AirportSelector
                                        value={selectionData.origin}
                                        onChange={(val) => setSelectionData({ ...selectionData, origin: val })}
                                        placeholder="Selecione origem"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-gray-500">Destino*</Label>
                                    <AirportSelector
                                        value={selectionData.destination}
                                        onChange={(val) => setSelectionData({ ...selectionData, destination: val })}
                                        placeholder="Selecione destino"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs text-gray-500">Número do voo ou Companhia (opcional)</Label>
                                <div className="relative">
                                    <Input
                                        placeholder="Ex: LA3456, Latam..."
                                        className="h-12 pl-4 pr-10 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                                        value={selectionData.query}
                                        onChange={(e) => setSelectionData({ ...selectionData, query: e.target.value })}
                                    />
                                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                </div>
                            </div>


                            <Button
                                onClick={handleSearchFlights}
                                disabled={isLoading}
                                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium"
                            >
                                {isLoading ? "Buscando..." : "Buscar Voos"}
                            </Button>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-900">Possuí transfer</span>
                                    <Checkbox
                                        className="w-5 h-5 rounded border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 shadow-none"
                                        checked={hasTransfer}
                                        onCheckedChange={(checked) => setHasTransfer(checked as boolean)}
                                    />
                                </div>

                                <div className="flex-1">
                                    <SelectedParticipantsSummary
                                        selectedIds={Object.keys(passengerAssignments)}
                                        participants={missionTravelers?.map(t => {
                                            const flightId = passengerAssignments[String(t.id)];
                                            const flightNumber = flightId ? getFlightNumber(flightId) : undefined;
                                            const group = missionGroups?.find(g => g.id === t.group_id || g.id === t.groupId);
                                            return {
                                                id: t.id,
                                                name: t.name,
                                                avatar: t.photo || t.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=random`,
                                                group: group?.name || group?.nome || 'Sem grupo',
                                                role: flightNumber ? `Voo ${flightNumber}` : undefined
                                            }
                                        }) || []}
                                        label="Passageiros Selecionados"
                                        placeholder="Nenhum passageiro selecionado"
                                    />
                                </div>
                            </div>
                        </div>




                        {/* Divider */}
                        <div className="w-[1px] bg-gray-200/50 h-full" />

                        {/* Right Column - Flight Selection */}
                        <div className="w-1/2 flex flex-col overflow-hidden pl-8">
                            <div className="mb-6">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-medium text-gray-900">Selecione um dos voos disponíveis para o grupo:</h3>
                                    <div className="flex items-center gap-4">
                                        <div className={cn("flex flex-col items-center gap-1", Object.keys(passengerAssignments).length === 0 && "opacity-50")}>
                                            <Switch
                                                id="assigned-only"
                                                checked={showAssignedOnly}
                                                onCheckedChange={setShowAssignedOnly}
                                                disabled={Object.keys(passengerAssignments).length === 0}
                                            />
                                            <Label htmlFor="assigned-only" className="text-[10px] text-gray-500 font-medium">Com passageiros</Label>
                                        </div>
                                        <div className="flex flex-col items-center gap-1">
                                            <Switch
                                                id="favorites"
                                                checked={showFavorites}
                                                onCheckedChange={setShowFavorites}
                                            />
                                            <Label htmlFor="favorites" className="text-[10px] text-gray-500 font-medium">Favoritos</Label>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mb-4">Obs: A listagem de voos é baseada no calculo ETA e quantidade de assentos livres.</p>


                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 flex flex-col">
                                <div className={cn("space-y-4 flex-1", flights.length === 0 && !isLoading && "flex flex-col")}>
                                    {isLoading ? (
                                        <div className="flex items-center justify-center h-40 text-gray-500">
                                            Carregando voos...
                                        </div>
                                    ) : flights.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center flex-1 h-full text-gray-500">
                                            <Plane className="w-12 h-12 mb-2 text-gray-300" />
                                            <p className="text-sm font-medium text-gray-900">Nenhum voo encontrado</p>
                                            <p className="text-xs">Faça uma busca para ver os resultados</p>
                                        </div>
                                    ) : (
                                        flights
                                            .filter(flight => {
                                                if (showFavorites && !favorites.includes(flight.id)) return false;
                                                if (showAssignedOnly) {
                                                    const hasPassengers = Object.values(passengerAssignments).includes(flight.id);
                                                    if (!hasPassengers) return false;
                                                }
                                                return true;
                                            })
                                            .map((flight, index) => (
                                                <div
                                                    key={flight.id}
                                                    className="cursor-default"
                                                >
                                                    <FlightCard
                                                        flight={flight}
                                                        index={index + 1}
                                                        isFavorite={favorites.includes(flight.id)}
                                                        onToggleFavorite={() => toggleFavorite(flight.id)}
                                                        isSelected={selectedFlightIds.includes(`flight-${flight.id}`)}
                                                        onSelect={() => handleFlightSelection(flight.id)}
                                                        assignedPassengers={passengerAssignments}
                                                        onAssignPassenger={(pId, fId) => {
                                                            setPassengerAssignments(prev => {
                                                                if (fId === null) {
                                                                    const next = { ...prev };
                                                                    delete next[pId];
                                                                    return next;
                                                                }
                                                                return { ...prev, [pId]: fId };
                                                            })
                                                        }}
                                                        getFlightNumber={getFlightNumber}
                                                        missionGroups={missionGroups}
                                                        missionTravelers={missionTravelers}
                                                    />
                                                </div>
                                            ))
                                    )}
                                </div>
                            </div>

                            {/* Footer Section - Added to match FlightForm */}
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className={cn("mb-4 transition-opacity duration-200", selectedFlightIds.length === 0 ? "opacity-50 pointer-events-none" : "opacity-100")}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-gray-500">Custo total estimado</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-semibold text-gray-900">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalCost)}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-gray-400 hover:text-gray-600"
                                                onClick={() => setShowCostDivision(!showCostDivision)}
                                            >
                                                <Pencil className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>

                                    {showCostDivision ? (
                                        <div className="mt-4 space-y-4">
                                            <p className="text-xs text-gray-500 font-medium">Divisão de custo:</p>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <div className="flex justify-between">
                                                        <Label className="text-xs text-gray-500">Agrobravo</Label>
                                                        <span className="text-xs text-gray-400">
                                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalCost * (costDivision.company / 100))}
                                                        </span>
                                                    </div>
                                                    <div className="relative">
                                                        <Input
                                                            type="number"
                                                            value={costDivision.company}
                                                            onChange={(e) => setCostDivision({
                                                                company: Number(e.target.value),
                                                                traveler: 100 - Number(e.target.value)
                                                            })}
                                                            className="h-10 bg-gray-50 border-gray-200 rounded-xl pr-8 shadow-none"
                                                        />
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">%</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <div className="flex justify-between">
                                                        <Label className="text-xs text-gray-500">Viajante</Label>
                                                        <span className="text-xs text-gray-400">
                                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalCost * (costDivision.traveler / 100))}
                                                        </span>
                                                    </div>
                                                    <div className="relative">
                                                        <Input
                                                            type="number"
                                                            value={costDivision.traveler}
                                                            onChange={(e) => setCostDivision({
                                                                traveler: Number(e.target.value),
                                                                company: 100 - Number(e.target.value)
                                                            })}
                                                            className="h-10 bg-gray-50 border-gray-200 rounded-xl pr-8 shadow-none"
                                                        />
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-center text-xs text-gray-400">
                                            <span>Divisão por passageiro</span>
                                            <span>
                                                {Object.keys(passengerAssignments).length > 0 ? (
                                                    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                                        totalCost / Object.keys(passengerAssignments).length
                                                    )
                                                ) : 'R$ 0,00'}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <Button variant="outline" className="flex-1 h-12 rounded-xl border-blue-600 text-blue-600 hover:bg-blue-50 font-medium" onClick={onCancel}>
                                        Cancelar
                                    </Button>
                                    <Button
                                        className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium"
                                        onClick={handleSave}
                                        disabled={isLoading || Object.keys(passengerAssignments).length === 0}
                                    >
                                        {isLoading ? "Salvando..." : "Salvar"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Manual Registration Form */
                    <div className="w-full flex flex-col h-full">
                        <div className="flex-1 overflow-y-auto px-6">
                            <div className="grid grid-cols-4 gap-x-6 gap-y-5">
                                <div className="space-y-1.5 col-span-2">
                                    <Label className="text-xs text-gray-500">Companhia Aérea*</Label>
                                    <Input
                                        placeholder="Ex: Azul, LATAM, GOL"
                                        className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                                        value={manualData.airline}
                                        onChange={(e) => setManualData({ ...manualData, airline: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1.5 col-span-2">
                                    <Label className="text-xs text-gray-500">Número do Voo*</Label>
                                    <Input
                                        placeholder="Ex: AZ 2818"
                                        className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                                        value={manualData.number}
                                        onChange={(e) => setManualData({ ...manualData, number: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs text-gray-500">Origem (Aeroporto)*</Label>
                                    <Input
                                        placeholder="Ex: GRU - Guarulhos"
                                        className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                                        value={manualData.origin}
                                        onChange={(e) => setManualData({ ...manualData, origin: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs text-gray-500">Destino (Aeroporto)*</Label>
                                    <Input
                                        placeholder="Ex: CGH - Congonhas"
                                        className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                                        value={manualData.destination}
                                        onChange={(e) => setManualData({ ...manualData, destination: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs text-gray-500">Data do voo*</Label>
                                    <div className="relative">
                                        <Input
                                            type="date"
                                            value={manualData.date.split('/').reverse().join('-')}
                                            onChange={(e) => setManualData({ ...manualData, date: e.target.value.split('-').reverse().join('/') })}
                                            min={minDate}
                                            max={maxDate}
                                            className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs text-gray-500">Quantidade de passageiros*</Label>
                                    <div className="relative">
                                        <Input
                                            value={manualData.passengers}
                                            onChange={(e) => setManualData({ ...manualData, passengers: e.target.value })}
                                            className="h-12 bg-gray-50 border-gray-200 rounded-xl pr-8 shadow-none"
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col">
                                            <ChevronUp className="w-3 h-3 text-gray-400 cursor-pointer" />
                                            <ChevronDown className="w-3 h-3 text-gray-400 cursor-pointer" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs text-gray-500">Horário de partida*</Label>
                                    <div className="relative">
                                        <Input
                                            type="time"
                                            className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                                            value={manualData.startTime}
                                            onChange={(e) => setManualData({ ...manualData, startTime: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs text-gray-500">Horário de chegada*</Label>
                                    <div className="relative">
                                        <Input
                                            type="time"
                                            className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                                            value={manualData.endTime}
                                            onChange={(e) => setManualData({ ...manualData, endTime: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="col-span-4">
                                    <ConflictAlert
                                        message={conflictInfo.message}
                                        conflictingEvents={conflictInfo.conflictingEvents}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs text-gray-500">Tipo de aeronave</Label>
                                    <Input
                                        placeholder="Ex: AIRBUS A320"
                                        className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                                        value={manualData.plane}
                                        onChange={(e) => setManualData({ ...manualData, plane: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs text-gray-500">Preço por passageiro*</Label>
                                    <Input
                                        placeholder="R$ 0,00"
                                        className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                                        value={manualData.price}
                                        onChange={(e) => setManualData({ ...manualData, price: e.target.value })}
                                    />
                                </div>


                                <div className="col-span-2">
                                    <ParticipantsSelector
                                        groups={missionGroups?.map(g => ({ id: g.id, name: g.nome, logo: g.logo }))}
                                        participants={missionTravelers?.map(t => ({
                                            id: t.id,
                                            name: t.name,
                                            avatar: t.photo || `https://i.pravatar.cc/150?u=${t.id}`,
                                            group: t.groupName,
                                            groupId: t.groupId
                                        }))}
                                        title="Selecione os passageiros"
                                        subtitle="Filtrar por grupo ou nome"
                                    />
                                </div>

                                <div className="space-y-1.5 col-span-2">
                                    <Label className="text-xs text-gray-500">Observações</Label>
                                    <Input
                                        placeholder="Informações adicionais"
                                        className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                                        value={manualData.notes}
                                        onChange={(e) => setManualData({ ...manualData, notes: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="h-12 px-6 rounded-xl border-blue-600 text-blue-600 hover:bg-blue-50 font-medium"
                                    onClick={() => setIsManualMode(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium"
                                    disabled={isLoading}
                                    onClick={async () => {
                                        if (!onSave || isLoading) return;
                                        setIsLoading(true);
                                        try {
                                            // Calculate duration
                                            const [sh, sm] = manualData.startTime.split(':').map(Number);
                                            const [eh, em] = manualData.endTime.split(':').map(Number);
                                            let minutes = (eh * 60 + em) - (sh * 60 + sm);
                                            if (minutes < 0) minutes += 24 * 60;
                                            const h = Math.floor(minutes / 60);
                                            const m = minutes % 60;
                                            const duration = `${h}h ${m}m`;

                                            await onSave([{
                                                id: initialData?.id || Math.random().toString(36).substr(2, 9),
                                                time: manualData.startTime,
                                                type: 'flight',
                                                title: `${manualData.airline} ${manualData.number}`,
                                                subtitle: 'Voo',
                                                price: manualData.price,
                                                from: getLoc(manualData.origin).city,
                                                to: getLoc(manualData.destination).city,
                                                fromCode: manualData.origin.toUpperCase(),
                                                toCode: manualData.destination.toUpperCase(),
                                                fromTime: manualData.startTime,
                                                toTime: manualData.endTime,
                                                status: 'confirmed',
                                                description: manualData.notes,
                                                duration: duration,
                                                date: manualData.date,
                                                logos: []
                                            }]);
                                        } catch (error) {
                                            console.error("Error saving manual flight:", error);
                                        } finally {
                                            setIsLoading(false);
                                        }
                                    }}
                                >
                                    {isLoading ? "Salvando..." : "Adicionar Voo"}
                                </Button>
                            </div>
                        </div>
                    </div>
                )
                }
            </div >
        </div >
    )
}



function TransferForm() {
    return (
        <div className="space-y-6 p-6">
            <h3 className="text-lg font-semibold text-gray-900">Detalhes do Transfer</h3>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2 col-span-2">
                    <Label>Empresa / Motorista</Label>
                    <Input placeholder="Ex: Dave Prince" />
                </div>

                <div className="space-y-2">
                    <Label>Data e Hora</Label>
                    <div className="relative">
                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input type="datetime-local" className="pl-9" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Duração Estimada</Label>
                    <Input placeholder="Ex: 1h 30min" />
                </div>

                <div className="space-y-2 col-span-2">
                    <Label>Origem</Label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input placeholder="Local de partida" className="pl-9" />
                    </div>
                </div>

                <div className="space-y-2 col-span-2">
                    <Label>Destino</Label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input placeholder="Local de chegada" className="pl-9" />
                    </div>
                </div>
            </div>
        </div>
    )
}

function ActivityForm() {
    return (
        <div className="space-y-6 p-6">
            <h3 className="text-lg font-semibold text-gray-900">Detalhes da Atividade</h3>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2 col-span-2">
                    <Label>Nome da Atividade</Label>
                    <Input placeholder="Ex: Visita à Fábrica" />
                </div>

                <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="visit">Visita Técnica</SelectItem>
                            <SelectItem value="meal">Refeição</SelectItem>
                            <SelectItem value="leisure">Lazer</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Data e Hora</Label>
                    <div className="relative">
                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input type="datetime-local" className="pl-9" />
                    </div>
                </div>

                <div className="space-y-2 col-span-2">
                    <Label>Localização</Label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input placeholder="Endereço ou nome do local" className="pl-9" />
                    </div>
                </div>

                <div className="space-y-2 col-span-2">
                    <Label>Descrição / Notas</Label>
                    <Input placeholder="Detalhes adicionais..." />
                </div>
            </div>
        </div>
    )
}



