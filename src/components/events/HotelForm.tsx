

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Calendar as CalendarIcon, ChevronDown, ChevronUp, Search, Bed, Link as LinkIcon, ArrowLeft, Star } from "lucide-react"
import { ParticipantsSelector, Participant } from "@/components/common/ParticipantsSelector"
import { SelectedParticipantsSummary } from "@/components/common/SelectedParticipantsSummary"
import { CostSelector } from "@/components/common/CostSelector"
import { getHotels } from "@/app/actions/get-hotels"
import HotelCard from "@/components/events/HotelCard"
import { GooglePlacesAutocomplete } from "@/components/common/GooglePlacesAutocomplete"
import { cn } from "@/lib/utils"
import { checkTimeConflict, validateDateSelected } from "@/lib/eventValidation"
import { ConflictAlert } from "@/components/common/ConflictAlert"
import { Event } from "@/types/itinerary"

// Removed mockParticipants


export default function HotelForm({
    onSave,
    onCancel,
    initialData,
    persistedState,
    onPersistState,
    missionGroups = [],
    missionTravelers = [],
    defaultDate,
    minDate,
    maxDate,
    existingEvents
}: {
    onSave?: (events: any[]) => void;
    onCancel?: () => void;
    initialData?: any;
    persistedState?: any;
    onPersistState?: (data: any) => void;
    missionGroups?: any[];
    missionTravelers?: any[];
    defaultDate?: string;
    minDate?: string;
    maxDate?: string;
    existingEvents?: Event[];
}) {
    const [costType, setCostType] = React.useState('free')
    const [selectedHotelId, setSelectedHotelId] = React.useState<string | null>(null)
    const [hotelGuests, setHotelGuests] = React.useState<Record<string, string[]>>({})
    const [isManualMode, setIsManualMode] = React.useState(false)
    const [favorites, setFavorites] = React.useState<string[]>([])
    const [showFavorites, setShowFavorites] = React.useState(false)
    const [searchLocation, setSearchLocation] = React.useState('São Paulo, Brasil')
    const [searchQuery, setSearchQuery] = React.useState('')
    const [checkInDate, setCheckInDate] = React.useState(defaultDate ? defaultDate.replace(/\s/g, '') : '2026-05-22')
    const [checkOutDate, setCheckOutDate] = React.useState('2026-11-15')
    const [checkInTime, setCheckInTime] = React.useState('09:00')
    const [checkOutTime, setCheckOutTime] = React.useState('14:00')
    const [hotels, setHotels] = React.useState<any[]>([])
    const [isLoading, setIsLoading] = React.useState(false)
    const [hasCheckInTransfer, setHasCheckInTransfer] = React.useState(false)
    const [hasCheckOutTransfer, setHasCheckOutTransfer] = React.useState(false)
    const [createCheckIn, setCreateCheckIn] = React.useState(true)
    const [createCheckOut, setCreateCheckOut] = React.useState(true)
    const [checkOutTransferDate, setCheckOutTransferDate] = React.useState('')
    const [checkOutTransferTime, setCheckOutTransferTime] = React.useState('14:00')
    const [price, setPrice] = React.useState('')
    const [pairedEventId, setPairedEventId] = React.useState<string | null>(null)

    const [manualData, setManualData] = React.useState({
        name: '',
        address: '',
        city: '',
        country: '',
        checkInDate: defaultDate ? defaultDate.replace(/\s/g, '') : '2026-05-22',
        checkOutDate: '2026-11-15',
        checkInTime: '09:00',
        checkOutTime: '14:00',
        guests: '30',
        price: '',
        taxes: '',
        notes: ''
    })

    const participants = React.useMemo(() => {
        console.log('HotelForm: missionTravelers', missionTravelers);
        return missionTravelers.map(traveler => {
            // Try to find group by id, handling potential field name differences (group_id vs groupId)
            const travelerGroupId = traveler.group_id || traveler.groupId;
            const group = missionGroups.find(g => g.id === travelerGroupId);

            let role = 'Viajante';
            // Check various properties that might indicate guest status
            if (traveler.type === 'guest' || traveler.status === 'guest' || traveler.isGuest || traveler.role === 'Convidado') {
                role = 'Convidado';
            } else if (traveler.type === 'staff' || traveler.role === 'staff') {
                role = 'Staff';
            }

            return {
                id: traveler.id,
                name: traveler.name,
                avatar: traveler.photo || traveler.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(traveler.name)}&background=random`,
                group: group?.name || group?.nome || 'Sem grupo',
                groupId: travelerGroupId,
                role: role
            }
        })
    }, [missionTravelers, missionGroups])

    React.useEffect(() => {
        console.log('HotelForm: Computed participants', participants);
    }, [participants]);

    // Initialize from persisted state
    // Initialize from persisted state
    React.useEffect(() => {
        if (persistedState) {
            if (persistedState.searchLocation) setSearchLocation(persistedState.searchLocation)
            if (persistedState.searchQuery) setSearchQuery(persistedState.searchQuery)
            if (persistedState.checkInDate) setCheckInDate(persistedState.checkInDate.replace(/\s/g, ''))
            if (persistedState.checkOutDate) setCheckOutDate(persistedState.checkOutDate.replace(/\s/g, ''))
            if (persistedState.checkInTime) setCheckInTime(persistedState.checkInTime)
            if (persistedState.checkOutTime) setCheckOutTime(persistedState.checkOutTime)
            if (persistedState.hotels) setHotels(persistedState.hotels)
            if (persistedState.selectedHotelId) setSelectedHotelId(persistedState.selectedHotelId)
            if (persistedState.hotelGuests) setHotelGuests(persistedState.hotelGuests)
            if (persistedState.isManualMode !== undefined) setIsManualMode(persistedState.isManualMode)
            if (persistedState.manualData) setManualData(persistedState.manualData)
            if (persistedState.price) setPrice(persistedState.price)
            if (persistedState.costType) setCostType(persistedState.costType)
        }
    }, [])

    // Persist state changes
    React.useEffect(() => {
        if (onPersistState) {
            const timeoutId = setTimeout(() => {
                onPersistState({
                    searchLocation,
                    searchQuery,
                    checkInDate,
                    checkOutDate,
                    checkInTime,
                    checkOutTime,
                    hotels,
                    selectedHotelId,
                    hotelGuests,
                    isManualMode,
                    manualData,
                    price,
                    costType
                })
            }, 500) // Debounce persistence
            return () => clearTimeout(timeoutId)
        }
    }, [
        searchLocation, searchQuery, checkInDate, checkOutDate,
        checkInTime, checkOutTime, hotels, selectedHotelId,
        hotelGuests, isManualMode, manualData, onPersistState
    ])

    React.useEffect(() => {
        if (initialData) {
            setManualData({
                name: initialData.title || '',
                address: initialData.location || '',
                city: initialData.city || '',
                country: initialData.country || '',
                checkInDate: initialData.date ? initialData.date.replace(/\s/g, '') : '2026-05-22',
                checkOutDate: initialData.endDate ? initialData.endDate.replace(/\s/g, '') : '2026-11-15',
                checkInTime: initialData.time || '09:00',
                checkOutTime: initialData.endTime || '14:00',
                guests: initialData.passengers ? String(initialData.passengers.length) : '30',
                price: initialData.price || '',
                taxes: initialData.taxes || '',
                notes: initialData.description || ''
            })
            // Ensure we show the hotel card, not manual mode
            setIsManualMode(false)
            if (initialData.location) setSearchLocation(initialData.location)
            if (initialData.date) setCheckInDate(initialData.date.replace(/\s/g, ''))
            if (initialData.endDate) {
                setCheckOutDate(initialData.endDate.replace(/\s/g, ''))
                setCheckOutTransferDate(initialData.endDate.replace(/\s/g, ''))
            }
            if (initialData.time) setCheckInTime(initialData.time)
            if (initialData.endTime) {
                setCheckOutTime(initialData.endTime)
                setCheckOutTransferTime(initialData.endTime)
            }

            // Initialize hasTransfer
            if (initialData.hasTransfer !== undefined) {
                if (initialData.subtitle === 'Check-in') {
                    setHasCheckInTransfer(initialData.hasTransfer)
                    setHasCheckOutTransfer(false)
                    setCreateCheckIn(true)
                    setCreateCheckOut(false)
                } else if (initialData.subtitle === 'Check-out') {
                    setHasCheckInTransfer(false)
                    setHasCheckOutTransfer(initialData.hasTransfer)
                    setCreateCheckIn(false)
                    setCreateCheckOut(true)
                } else {
                    // Fallback for legacy or undefined subtitle
                    setHasCheckInTransfer(initialData.hasTransfer)
                    setHasCheckOutTransfer(false)
                    setCreateCheckIn(true)
                    setCreateCheckOut(true)
                }
            } else {
                // If hasTransfer is undefined but we are editing, we should still set create flags
                if (initialData.subtitle === 'Check-in') {
                    setCreateCheckIn(true)
                    setCreateCheckOut(false)
                } else if (initialData.subtitle === 'Check-out') {
                    setCreateCheckIn(false)
                    setCreateCheckOut(true)
                }
            }

            // Initialize costType
            if (initialData.status === 'quoting') {
                setCostType('quoting')
            } else if (initialData.status === 'free') {
                setCostType('free')
            } else {
                setCostType('confirmed')
            }
            if (initialData.price) setPrice(initialData.price)

            // Find paired event (Check-in <-> Check-out)
            if (existingEvents && initialData.title) {
                const isCheckIn = initialData.subtitle === 'Check-in';
                const targetSubtitle = isCheckIn ? 'Check-out' : 'Check-in';

                const paired = existingEvents.find(e =>
                    e.title === initialData.title &&
                    e.subtitle === targetSubtitle &&
                    e.id !== initialData.id
                );

                if (paired) {
                    setPairedEventId(paired.id);
                    if (isCheckIn) {
                        setCreateCheckOut(true);
                        setCheckOutDate(paired.date ? paired.date.replace(/\s/g, '') : '');
                        setCheckOutTime(paired.time || '14:00');
                        setHasCheckOutTransfer(!!paired.hasTransfer);
                        if (paired.hasTransfer && paired.transferDate) {
                            setCheckOutTransferDate(paired.transferDate.replace(/\s/g, ''));
                        }
                        if (paired.hasTransfer && paired.transferTime) {
                            setCheckOutTransferTime(paired.transferTime);
                        }
                    } else {
                        setCreateCheckIn(true);
                        setCheckInDate(paired.date ? paired.date.replace(/\s/g, '') : '');
                        setCheckInTime(paired.time || '09:00');
                        setHasCheckInTransfer(!!paired.hasTransfer);
                    }
                }
            }

            // Populate hotels list with the current event data so it shows as selected
            if (initialData.title) {
                const mockHotel = {
                    property_token: initialData.id,
                    name: initialData.title,
                    location: initialData.location,
                    thumbnail: initialData.hotelData?.thumbnail || initialData.logos?.[0],
                    stars: 0,
                    overall_rating: initialData.hotelData?.rating || 0,
                    reviews: initialData.hotelData?.reviews || 0,
                    price: initialData.price,
                    rate_per_night: { lowest: initialData.price },
                    amenities: initialData.hotelData?.amenities || [],
                    description: initialData.hotelData?.description || '',
                    link: initialData.hotelData?.link || initialData.location
                };
                setHotels([mockHotel]);
                setSelectedHotelId(initialData.id);

                // If missing rich data, fetch from API to populate the card
                if (!initialData.hotelData || !initialData.hotelData.amenities || initialData.hotelData.amenities.length === 0) {
                    const fetchDetails = async () => {
                        try {
                            // Search using hotel name and city for better precision
                            const queryLocation = initialData.location || '';
                            const queryName = initialData.title || '';
                            // Combine for search if needed, or just use location if it contains the hotel name
                            // Assuming getHotels searches by text query in location field

                            const data = await getHotels({
                                location: `${queryName} ${initialData.city || ''}`,
                                checkIn: initialData.date ? initialData.date.replace(/\s/g, '') : '2026-05-22',
                                checkOut: initialData.endDate ? initialData.endDate.replace(/\s/g, '') : '2026-05-23',
                                adults: 2,
                                children: 0
                            });

                            if (data && data.properties && data.properties.length > 0) {
                                // Find the best match or take the first one
                                const found = data.properties[0];

                                setHotels(currentHotels => {
                                    if (currentHotels.length === 0) return currentHotels;
                                    const currentMock = currentHotels[0];
                                    return [{
                                        ...currentMock,
                                        thumbnail: found.thumbnail || currentMock.thumbnail,
                                        overall_rating: found.overall_rating,
                                        reviews: found.reviews,
                                        amenities: found.amenities,
                                        description: found.description,
                                        link: found.link,
                                        // Update price display if missing
                                        rate_per_night: found.rate_per_night
                                    }];
                                });
                            }
                        } catch (err) {
                            console.error("Failed to fetch hotel details for edit mode", err);
                        }
                    };
                    fetchDetails();
                }

                // Initialize hotelGuests from passengers
                if (initialData.passengers && Array.isArray(initialData.passengers)) {
                    setHotelGuests({
                        [initialData.id]: initialData.passengers.map(String)
                    });
                }
            }
        }
    }, [initialData])

    // Update price when a hotel is selected or guest count changes
    React.useEffect(() => {
        if (costType === 'confirmed' && selectedHotelId && !isManualMode) {
            const selectedHotel = hotels.find(h => (h.property_token || h.id) === selectedHotelId);
            if (selectedHotel && selectedHotel.rate_per_night?.lowest) {
                const guests = hotelGuests[selectedHotelId] || [];
                const guestCount = guests.length;

                if (guestCount > 0) {
                    const priceStr = selectedHotel.rate_per_night.lowest.replace(/[^\d.,]/g, '');
                    const lastComma = priceStr.lastIndexOf(',');
                    const lastDot = priceStr.lastIndexOf('.');

                    let priceValue = 0;
                    if (lastComma > lastDot) {
                        priceValue = parseFloat(priceStr.replace(/\./g, '').replace(',', '.')) || 0;
                    } else {
                        priceValue = parseFloat(priceStr.replace(/,/g, '')) || 0;
                    }

                    if (priceValue > 0) {
                        setPrice(priceValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
                    }
                }
            }
        }
    }, [costType, selectedHotelId, hotelGuests, hotels, isManualMode]);


    const [conflictInfo, setConflictInfo] = React.useState<{ hasConflict: boolean; message: string; conflictingEvents: Event[] }>({ hasConflict: false, message: '', conflictingEvents: [] })

    // Check for conflicts
    React.useEffect(() => {
        if (!existingEvents) return;

        const currentCheckInDate = isManualMode ? manualData.checkInDate : checkInDate;
        const currentCheckOutDate = isManualMode ? manualData.checkOutDate : checkOutDate;

        // Skip if either relevant date is not selected
        if ((createCheckIn && !validateDateSelected(currentCheckInDate)) ||
            (createCheckOut && !validateDateSelected(currentCheckOutDate))) {
            setConflictInfo({ hasConflict: false, message: '', conflictingEvents: [] });
            return;
        }

        // Define check-in conflict check
        let checkInConflict: { hasConflict: boolean; message: string; conflictingEvents: Event[] } = { hasConflict: false, message: '', conflictingEvents: [] };
        if (createCheckIn) {
            checkInConflict = checkTimeConflict({
                time: isManualMode ? manualData.checkInTime : checkInTime,
                date: currentCheckInDate,
                id: initialData?.id,
                type: 'hotel'
            } as unknown as Event, existingEvents);
        }

        // Define check-out conflict check
        let checkOutConflict: { hasConflict: boolean; message: string; conflictingEvents: Event[] } = { hasConflict: false, message: '', conflictingEvents: [] };
        if (createCheckOut) {
            checkOutConflict = checkTimeConflict({
                time: isManualMode ? manualData.checkOutTime : checkOutTime,
                date: currentCheckOutDate,
                id: initialData?.id,
                type: 'hotel'
            } as unknown as Event, existingEvents);
        }

        // Combine conflicts (prioritize check-in message orconcatenate)
        if (checkInConflict.hasConflict) {
            setConflictInfo({
                ...checkInConflict,
                message: `Conflito no Check-in: ${checkInConflict.message}`
            });
        } else if (checkOutConflict.hasConflict) {
            setConflictInfo({
                ...checkOutConflict,
                message: `Conflito no Check-out: ${checkOutConflict.message}`
            });
        } else {
            setConflictInfo({ hasConflict: false, message: '', conflictingEvents: [] });
        }
    }, [checkInTime, checkInDate, checkOutTime, checkOutDate, manualData.checkInDate, manualData.checkOutDate, manualData.checkInTime, manualData.checkOutTime, isManualMode, existingEvents, initialData?.id, createCheckIn, createCheckOut])

    const handleSearchHotels = async () => {
        if (!checkInDate || !checkOutDate) {
            console.error("Missing dates for hotel search");
            return;
        }
        if (!searchLocation) {
            console.error("Missing location for hotel search");
            return;
        }

        setIsLoading(true)
        try {
            console.log("Searching hotels with:", {
                location: searchQuery ? `${searchQuery} em ${searchLocation}` : searchLocation,
                checkIn: checkInDate,
                checkOut: checkOutDate
            });

            const data = await getHotels({
                location: searchQuery ? `${searchQuery} em ${searchLocation}` : searchLocation,
                checkIn: checkInDate,
                checkOut: checkOutDate,
                adults: 2,
                children: 0
            })

            console.log("Hotel search result:", data);

            if (data && data.properties) {
                setHotels(data.properties)
            } else if (data && data.error) {
                console.error("SerpApi returned error:", data.error);
            } else {
                console.warn("No properties found or invalid response format");
                setHotels([]);
            }
        } catch (error) {
            console.error("Error searching hotels:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const toggleFavorite = (hotelId: string) => {
        setFavorites(prev =>
            prev.includes(hotelId)
                ? prev.filter(id => id !== hotelId)
                : [...prev, hotelId]
        )
    }

    const selectHotel = (propertyToken: string) => {
        setSelectedHotelId(prev => prev === propertyToken ? null : propertyToken)
    }

    const handlePlaceSelect = (place: any) => {
        let city = ''
        let country = ''

        if (place.address_components) {
            for (const component of place.address_components) {
                const types = component.types
                if (types.includes('locality')) {
                    city = component.long_name
                } else if (types.includes('country')) {
                    country = component.long_name
                }
            }
        }

        setManualData(prev => ({
            ...prev,
            address: place.formatted_address || place.name,
            city,
            country
        }))
    }

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
                    <h2 className="text-lg font-semibold text-gray-900">Adicionar Hotel Manualmente</h2>
                </div>
            )}

            <div className="flex flex-1 overflow-hidden p-6">
                {!isManualMode ? (
                    <>
                        {/* Left Column - Form Fields */}
                        <div className="w-1/2 flex flex-col gap-5 overflow-y-auto pr-8 pl-1 py-1">
                            <div className="space-y-3">
                                <Label className="text-sm font-medium text-gray-900">Tipo de Hospedagem</Label>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            checked={createCheckIn}
                                            onCheckedChange={(checked) => setCreateCheckIn(checked as boolean)}
                                            className="w-5 h-5 rounded border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 shadow-none"
                                        />
                                        <span className="text-sm font-medium text-gray-900">Check-in</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            checked={createCheckOut}
                                            onCheckedChange={(checked) => setCreateCheckOut(checked as boolean)}
                                            className="w-5 h-5 rounded border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 shadow-none"
                                        />
                                        <span className="text-sm font-medium text-gray-900">Check-out</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {createCheckIn && (
                                    <>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-gray-500">Data de check-in*</Label>
                                            <div className="relative">
                                                <Input
                                                    type="date"
                                                    value={checkInDate ? (checkInDate.replace(/\s/g, '').includes('/') ? checkInDate.replace(/\s/g, '').split('/').reverse().join('-') : checkInDate.replace(/\s/g, '')) : ''}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setCheckInDate(val.includes('-') ? val.split('-').reverse().join('/') : val)
                                                    }}
                                                    min={minDate}
                                                    max={maxDate}
                                                    className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-gray-500">Horário de check-in*</Label>
                                            <div className="relative">
                                                <Input
                                                    type="time"
                                                    value={checkInTime}
                                                    onChange={(e) => setCheckInTime(e.target.value)}
                                                    className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                                {createCheckOut && (
                                    <>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-gray-500">Data de check-out*</Label>
                                            <div className="relative">
                                                <Input
                                                    type="date"
                                                    value={checkOutDate ? (checkOutDate.replace(/\s/g, '').includes('/') ? checkOutDate.replace(/\s/g, '').split('/').reverse().join('-') : checkOutDate.replace(/\s/g, '')) : ''}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        const newVal = val.includes('-') ? val.split('-').reverse().join('/') : val
                                                        setCheckOutDate(newVal)
                                                        setCheckOutTransferDate(newVal)
                                                    }}
                                                    min={minDate}
                                                    max={maxDate}
                                                    className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-gray-500">Horário de check-out*</Label>
                                            <div className="relative">
                                                <Input
                                                    type="time"
                                                    value={checkOutTime}
                                                    onChange={(e) => setCheckOutTime(e.target.value)}
                                                    className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                            <ConflictAlert conflictingEvents={conflictInfo.conflictingEvents} message={conflictInfo.message} />

                            <div className="space-y-1.5">
                                <Label className="text-xs text-gray-500">Localização*</Label>
                                <GooglePlacesAutocomplete
                                    value={searchLocation}
                                    onChange={setSearchLocation}
                                    placeholder="Cidade ou endereço do hotel"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs text-gray-500">Nome do hotel (opcional)</Label>
                                <div className="relative">
                                    <Input
                                        placeholder="Ex: Hilton, Marriot..."
                                        className="h-12 pl-4 pr-10 bg-white border-gray-200 rounded-xl shadow-none"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearchHotels()}
                                    />
                                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    onClick={handleSearchHotels}
                                    disabled={isLoading}
                                    className="h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium"
                                >
                                    {isLoading ? "Buscando..." : "Buscar Hotéis"}
                                </Button>
                                <Button
                                    onClick={() => setIsManualMode(true)}
                                    variant="outline"
                                    className="h-12 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-xl font-medium"
                                >
                                    Adicionar Manualmente
                                </Button>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex flex-col gap-3">
                                    <div className={cn("flex items-center gap-2", initialData && initialData.subtitle === 'Check-out' && "opacity-50 cursor-not-allowed")}>
                                        <Checkbox
                                            checked={hasCheckInTransfer}
                                            onCheckedChange={(checked) => {
                                                if (initialData && initialData.subtitle === 'Check-out') return;
                                                setHasCheckInTransfer(checked as boolean)
                                            }}
                                            className="w-5 h-5 rounded border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 shadow-none"
                                            disabled={!createCheckIn || (initialData && initialData.subtitle === 'Check-out')}
                                        />
                                        <span className="text-sm font-medium text-gray-900" title={initialData && initialData.subtitle === 'Check-out' ? "Edite o evento de Check-in para alterar este transfer" : ""}>
                                            Transfer Check-in
                                        </span>
                                    </div>

                                    <div className={cn("flex items-center gap-2", initialData && initialData.subtitle === 'Check-in' && "opacity-50 cursor-not-allowed")}>
                                        <Checkbox
                                            checked={hasCheckOutTransfer}
                                            onCheckedChange={(checked) => {
                                                if (initialData && initialData.subtitle === 'Check-in') return;
                                                setHasCheckOutTransfer(checked as boolean)
                                            }}
                                            className="w-5 h-5 rounded border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 shadow-none"
                                            disabled={!createCheckOut || (initialData && initialData.subtitle === 'Check-in')}
                                        />
                                        <span className="text-sm font-medium text-gray-900" title={initialData && initialData.subtitle === 'Check-in' ? "Edite o evento de Check-out para alterar este transfer" : ""}>
                                            Transfer Check-out
                                        </span>
                                    </div>


                                </div>

                                <div className="flex-1">
                                    <SelectedParticipantsSummary
                                        selectedIds={selectedHotelId ? hotelGuests[selectedHotelId] || [] : []}
                                        participants={participants}
                                        label="Hóspedes Selecionados"
                                        placeholder="Nenhum hóspede selecionado"
                                    />
                                </div>
                            </div>



                            <CostSelector
                                costType={costType}
                                setCostType={setCostType}
                                price={price}
                                setPrice={setPrice}
                            />

                        </div>

                        {/* Right Column - Hotel Selection */}
                        <div className="w-1/2 flex flex-col pl-8 border-l border-gray-100">
                            <div className="mb-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-medium text-gray-900">Hotéis disponíveis:</h3>
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

                            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-4">
                                {isLoading ? (
                                    <div className="flex items-center justify-center h-40 text-gray-500">
                                        Carregando hotéis...
                                    </div>
                                ) : hotels.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center flex-1 h-full text-gray-500">
                                        <Bed className="w-12 h-12 mb-2 text-gray-300" />
                                        <p className="text-sm">Nenhum hotel encontrado</p>
                                        <p className="text-xs">Faça uma busca para ver os resultados</p>
                                    </div>
                                ) : (
                                    hotels
                                        .filter(hotel => {
                                            // Filter by favorites
                                            if (showFavorites && !favorites.includes(hotel.property_token)) return false

                                            // Filter by pending quote (mock logic - assuming all API results are 'quoted' for now, 
                                            // but if we had a field we would filter here. For now, let's just not filter out anything 
                                            // or maybe filter by price presence if that was the intent. 
                                            // User asked to "add the option", usually implies a filter or a state to save.)
                                            // Since we don't have a 'pending' field in API, we'll just keep the state for the save object.

                                            return true
                                        })
                                        .map((hotel, index) => (
                                            <HotelCard
                                                key={hotel.property_token}
                                                hotel={hotel}
                                                index={index + 1}
                                                isFavorite={favorites.includes(hotel.property_token)}
                                                onToggleFavorite={() => toggleFavorite(hotel.property_token)}
                                                isSelected={selectedHotelId === hotel.property_token}
                                                onSelect={() => selectHotel(hotel.property_token)}
                                                favorites={favorites}
                                                participants={participants}
                                                selectedGuests={hotelGuests[hotel.property_token] || []}
                                                onGuestsChange={(guests) => setHotelGuests(prev => ({
                                                    ...prev,
                                                    [hotel.property_token]: guests
                                                }))}
                                                groups={missionGroups}
                                            />
                                        ))
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100">

                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        className="flex-1 h-12 rounded-xl border-blue-600 text-blue-600 hover:bg-blue-50 font-medium"
                                        onClick={onCancel}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium"
                                        disabled={!selectedHotelId || (createCheckIn && !validateDateSelected(checkInDate)) || (createCheckOut && !validateDateSelected(checkOutDate))}
                                        onClick={() => {
                                            if (!onSave) return;

                                            if (createCheckIn && !validateDateSelected(checkInDate)) {
                                                alert('Por favor, selecione uma data de Check-in para o evento.')
                                                return;
                                            }
                                            if (createCheckOut && !validateDateSelected(checkOutDate)) {
                                                alert('Por favor, selecione uma data de Check-out para o evento.')
                                                return;
                                            }

                                            const selectedHotel = hotels.find(h => h.property_token === selectedHotelId);
                                            if (selectedHotel) {
                                                const events: any[] = [];

                                                // Create check-in event if selected
                                                // Create hotel event (Check-in)
                                                if (createCheckIn) {
                                                    const isCheckInEvent = initialData?.subtitle === 'Check-in';
                                                    const isCheckOutEvent = initialData?.subtitle === 'Check-out';

                                                    // If we are editing Check-in, use selectedHotelId (which is initialData.id).
                                                    // If we are editing Check-out, and found a paired Check-in, use pairedEventId.
                                                    // Otherwise generate new ID.
                                                    let eventId = selectedHotelId || Math.random().toString(36).substr(2, 9);
                                                    if (isCheckInEvent) eventId = initialData.id;
                                                    else if (isCheckOutEvent && pairedEventId) eventId = pairedEventId;

                                                    const checkInEvent = {
                                                        id: eventId,
                                                        time: checkInTime,
                                                        date: checkInDate.replace(/\s/g, ''),
                                                        type: 'hotel',
                                                        title: selectedHotel.name,
                                                        subtitle: "Check-in",
                                                        price: costType === 'free' ? 'Sem custo' : (price || selectedHotel.rate_per_night?.lowest || selectedHotel.price || 'N/A'),
                                                        location: selectedHotel.location || selectedHotel.link || '',
                                                        status: costType as 'free' | 'confirmed' | 'quoting',
                                                        duration: "1 dia",
                                                        logos: selectedHotel.thumbnail ? [selectedHotel.thumbnail] : [],
                                                        passengers: selectedHotelId ? (hotelGuests[selectedHotelId] || []) : [],
                                                        hasTransfer: hasCheckInTransfer,
                                                        transferDate: hasCheckInTransfer ? checkInDate.replace(/\s/g, '') : undefined,
                                                        transferTime: hasCheckInTransfer ? checkInTime : undefined,
                                                        // Hotel details for display
                                                        hotelData: {
                                                            rating: selectedHotel.overall_rating,
                                                            reviews: selectedHotel.reviews,
                                                            amenities: selectedHotel.amenities || [],
                                                            thumbnail: selectedHotel.thumbnail,
                                                            description: selectedHotel.description,
                                                            link: selectedHotel.link
                                                        }
                                                    };
                                                    events.push(checkInEvent);
                                                }

                                                // Create hotel event (Check-out)
                                                if (createCheckOut) {
                                                    const isCheckInEvent = initialData?.subtitle === 'Check-in';
                                                    const isCheckOutEvent = initialData?.subtitle === 'Check-out';

                                                    // If we are editing Check-out, use initialData.id (which might be passed as selectedHotelId or we need to grab it).
                                                    // Note: selectedHotelId is usually the hotel ID from API, or initialData.id if editing.

                                                    let eventId = Math.random().toString(36).substr(2, 9);
                                                    if (isCheckOutEvent) eventId = initialData.id;
                                                    else if (isCheckInEvent && pairedEventId) eventId = pairedEventId;

                                                    const checkOutEvent = {
                                                        id: eventId,
                                                        time: checkOutTime,
                                                        date: checkOutDate.replace(/\s/g, ''),
                                                        type: 'hotel',
                                                        title: selectedHotel.name,
                                                        subtitle: "Check-out",
                                                        price: '', // Check-out event should not have price to avoid double counting
                                                        location: selectedHotel.location || selectedHotel.link || '',
                                                        status: 'confirmed',
                                                        duration: "1 dia",
                                                        logos: selectedHotel.thumbnail ? [selectedHotel.thumbnail] : [],
                                                        passengers: selectedHotelId ? (hotelGuests[selectedHotelId] || []) : [],
                                                        hasTransfer: hasCheckOutTransfer,
                                                        transferDate: hasCheckOutTransfer ? (checkOutTransferDate ? checkOutTransferDate.replace(/\s/g, '') : checkOutDate.replace(/\s/g, '')) : undefined,
                                                        transferTime: hasCheckOutTransfer ? checkOutTransferTime : undefined,
                                                        // Hotel details for display
                                                        hotelData: {
                                                            rating: selectedHotel.overall_rating,
                                                            reviews: selectedHotel.reviews,
                                                            amenities: selectedHotel.amenities || [],
                                                            thumbnail: selectedHotel.thumbnail,
                                                            description: selectedHotel.description,
                                                            link: selectedHotel.link
                                                        }
                                                    };
                                                    events.push(checkOutEvent);
                                                }

                                                // Create transfer event for check-in if selected
                                                if (hasCheckInTransfer && createCheckIn) {
                                                    const transferEvent = {
                                                        id: Math.random().toString(36).substr(2, 9),
                                                        time: checkInTime,
                                                        date: checkInDate.replace(/\s/g, ''),
                                                        type: 'transfer',
                                                        title: 'Transferência',
                                                        subtitle: 'Transporte',
                                                        location: selectedHotel.location || selectedHotel.name,
                                                        driver: 'David Príncipe',
                                                        duration: '1h 00 min',
                                                        logos: [],
                                                        status: 'confirmed'
                                                    };
                                                    events.push(transferEvent);
                                                }

                                                // Create transfer event for check-out if selected
                                                if (hasCheckOutTransfer && createCheckOut) {
                                                    const transferEvent = {
                                                        id: Math.random().toString(36).substr(2, 9),
                                                        time: checkOutTransferTime || checkOutTime,
                                                        date: checkOutTransferDate ? checkOutTransferDate.replace(/\s/g, '') : checkOutDate.replace(/\s/g, ''),
                                                        type: 'transfer',
                                                        title: 'Transferência',
                                                        subtitle: 'Transporte',
                                                        location: selectedHotel.location || selectedHotel.name,
                                                        driver: 'David Príncipe',
                                                        duration: '1h 00 min',
                                                        logos: [],
                                                        status: 'confirmed'
                                                    };
                                                    events.push(transferEvent);
                                                }

                                                onSave(events);
                                            }
                                        }}
                                    >
                                        Salvar
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
                                    <Label className="text-xs text-gray-500">Nome do Hotel*</Label>
                                    <Input
                                        placeholder="Digite o nome do hotel"
                                        className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                                        value={manualData.name}
                                        onChange={(e) => setManualData({ ...manualData, name: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1.5 col-span-4">
                                    <Label className="text-xs text-gray-500">Localização/Endereço*</Label>
                                    <GooglePlacesAutocomplete
                                        value={manualData.address}
                                        onChange={(val) => setManualData({ ...manualData, address: val })}
                                        onPlaceSelect={handlePlaceSelect}
                                        placeholder="Endereço completo ou cidade"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs text-gray-500">Dia do evento*</Label>
                                    <div className="relative">
                                        <Input
                                            defaultValue="22/05/2025"
                                            className="h-12 bg-gray-50 border-gray-200 rounded-xl pr-10 shadow-none"
                                            value={manualData.checkInDate}
                                            onChange={(e) => setManualData({ ...manualData, checkInDate: e.target.value })}
                                        />
                                        <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs text-gray-500">Data de check-out*</Label>
                                    <div className="relative">
                                        <Input
                                            defaultValue="15/11/2025"
                                            className="h-12 bg-gray-50 border-gray-200 rounded-xl pr-10 shadow-none"
                                            value={manualData.checkOutDate}
                                            onChange={(e) => setManualData({ ...manualData, checkOutDate: e.target.value })}
                                        />
                                        <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs text-gray-500">Horario de check-in*</Label>
                                    <div className="relative">
                                        <Input
                                            defaultValue="09:00"
                                            className="h-12 bg-gray-50 border-gray-200 rounded-xl pr-10 shadow-none"
                                            value={manualData.checkInTime}
                                            onChange={(e) => setManualData({ ...manualData, checkInTime: e.target.value })}
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col">
                                            <ChevronUp className="w-3 h-3 text-gray-400 cursor-pointer" />
                                            <ChevronDown className="w-3 h-3 text-gray-400 cursor-pointer" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs text-gray-500">Horario de check-out*</Label>
                                    <div className="relative">
                                        <Input
                                            defaultValue="14:00"
                                            className="h-12 bg-gray-50 border-gray-200 rounded-xl pr-10 shadow-none"
                                            value={manualData.checkOutTime}
                                            onChange={(e) => setManualData({ ...manualData, checkOutTime: e.target.value })}
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col">
                                            <ChevronUp className="w-3 h-3 text-gray-400 cursor-pointer" />
                                            <ChevronDown className="w-3 h-3 text-gray-400 cursor-pointer" />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-4">
                                    <ConflictAlert conflictingEvents={conflictInfo.conflictingEvents} message={conflictInfo.message} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs text-gray-500">Pessoas*</Label>
                                    <div className="relative">
                                        <Input defaultValue="30" className="h-12 bg-gray-50 border-gray-200 rounded-xl pr-8 shadow-none" />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col">
                                            <ChevronUp className="w-3 h-3 text-gray-400 cursor-pointer" />
                                            <ChevronDown className="w-3 h-3 text-gray-400 cursor-pointer" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs text-gray-500">Quartos*</Label>
                                    <div className="relative">
                                        <Input defaultValue="12" className="h-12 bg-gray-50 border-gray-200 rounded-xl pr-8 shadow-none" />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col">
                                            <ChevronUp className="w-3 h-3 text-gray-400 cursor-pointer" />
                                            <ChevronDown className="w-3 h-3 text-gray-400 cursor-pointer" />
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-4 border-t border-gray-100 pt-4">
                                    <CostSelector
                                        costType={costType}
                                        setCostType={setCostType}
                                        price={manualData.price}
                                        setPrice={(price) => setManualData({ ...manualData, price })}
                                    />
                                </div>

                                <div className="col-span-2">
                                    <div className="flex flex-col gap-3 mb-3">
                                        <div className={cn("flex items-center gap-2", initialData && initialData.subtitle === 'Check-out' && "opacity-50 cursor-not-allowed")}>
                                            <Checkbox
                                                checked={hasCheckInTransfer}
                                                onCheckedChange={(checked) => {
                                                    if (initialData && initialData.subtitle === 'Check-out') return;
                                                    setHasCheckInTransfer(checked as boolean)
                                                }}
                                                className="w-5 h-5 rounded border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 shadow-none"
                                                disabled={!createCheckIn || (initialData && initialData.subtitle === 'Check-out')}
                                            />
                                            <span className="text-sm font-medium text-gray-900" title={initialData && initialData.subtitle === 'Check-out' ? "Edite o evento de Check-in para alterar este transfer" : ""}>
                                                Transfer Check-in
                                            </span>
                                        </div>

                                        <div className={cn("flex items-center gap-2", initialData && initialData.subtitle === 'Check-in' && "opacity-50 cursor-not-allowed")}>
                                            <Checkbox
                                                checked={hasCheckOutTransfer}
                                                onCheckedChange={(checked) => {
                                                    if (initialData && initialData.subtitle === 'Check-in') return;
                                                    setHasCheckOutTransfer(checked as boolean)
                                                }}
                                                className="w-5 h-5 rounded border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 shadow-none"
                                                disabled={!createCheckOut || (initialData && initialData.subtitle === 'Check-in')}
                                            />
                                            <span className="text-sm font-medium text-gray-900" title={initialData && initialData.subtitle === 'Check-in' ? "Edite o evento de Check-out para alterar este transfer" : ""}>
                                                Transfer Check-out
                                            </span>
                                        </div>
                                    </div>

                                    <ParticipantsSelector
                                        value={hotelGuests['manual'] || []}
                                        onChange={(selectedIds) => setHotelGuests({ ...hotelGuests, 'manual': selectedIds })}
                                        label="Hóspedes"
                                        title="Hóspedes Selecionados"
                                        subtitle="Visualizando seleção do hotel"
                                        participantType="Hóspede"
                                        emptyMessage="Nenhum hóspede selecionado"
                                        groups={missionGroups}
                                        participants={participants}
                                    />
                                </div>

                                <div className="space-y-1.5 col-span-4">
                                    <Label className="text-xs text-gray-500">Observações</Label>
                                    <Input placeholder="Informações adicionais" className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none" />
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100">

                            <div className="flex justify-end gap-3">
                                <Button
                                    variant="outline"
                                    className="h-12 px-6 rounded-xl border-blue-600 text-blue-600 hover:bg-blue-50 font-medium"
                                    onClick={() => setIsManualMode(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium"
                                    disabled={(createCheckIn && !validateDateSelected(manualData.checkInDate)) || (createCheckOut && !validateDateSelected(manualData.checkOutDate))}
                                    onClick={() => {
                                        if (!onSave) return;

                                        if (createCheckIn && !validateDateSelected(manualData.checkInDate)) {
                                            alert('Por favor, selecione uma data de Check-in para o evento.')
                                            return;
                                        }
                                        if (createCheckOut && !validateDateSelected(manualData.checkOutDate)) {
                                            alert('Por favor, selecione uma data de Check-out para o evento.')
                                            return;
                                        }

                                        const events: any[] = [];

                                        // Create check-in event if selected
                                        // Create check-in event if selected
                                        if (createCheckIn) {
                                            const isCheckInEvent = initialData?.subtitle === 'Check-in';
                                            const isCheckOutEvent = initialData?.subtitle === 'Check-out';

                                            let eventId = Math.random().toString(36).substr(2, 9);
                                            if (isCheckInEvent) eventId = initialData.id;
                                            else if (isCheckOutEvent && pairedEventId) eventId = pairedEventId;

                                            const checkInEvent = {
                                                id: eventId,
                                                time: manualData.checkInTime,
                                                date: manualData.checkInDate.replace(/\s/g, ''),
                                                type: 'hotel',
                                                title: manualData.name,
                                                subtitle: "Check-in",
                                                price: costType === 'free' ? 'Sem custo' : (manualData.price || 'N/A'),
                                                location: manualData.address,
                                                city: manualData.city,
                                                country: manualData.country,
                                                status: costType as 'free' | 'confirmed' | 'quoting',
                                                duration: "1 dia",
                                                logos: [],
                                                passengers: hotelGuests['manual'] || [],
                                                hasTransfer: hasCheckInTransfer,
                                                description: manualData.notes
                                            };
                                            events.push(checkInEvent);
                                        }

                                        // Create check-out event if selected
                                        if (createCheckOut) {
                                            const isCheckInEvent = initialData?.subtitle === 'Check-in';
                                            const isCheckOutEvent = initialData?.subtitle === 'Check-out';

                                            let eventId = Math.random().toString(36).substr(2, 9);
                                            if (isCheckOutEvent) eventId = initialData.id;
                                            else if (isCheckInEvent && pairedEventId) eventId = pairedEventId;

                                            const checkOutEvent = {
                                                id: eventId,
                                                time: manualData.checkOutTime,
                                                date: manualData.checkOutDate.replace(/\s/g, ''),
                                                type: 'hotel',
                                                title: manualData.name,
                                                subtitle: "Check-out",
                                                price: '', // Check-out event should not have price to avoid double counting
                                                location: manualData.address,
                                                city: manualData.city,
                                                country: manualData.country,
                                                status: 'confirmed',
                                                duration: "1 dia",
                                                logos: [],
                                                passengers: hotelGuests['manual'] || [],
                                                hasTransfer: hasCheckOutTransfer,
                                                description: manualData.notes
                                            };
                                            events.push(checkOutEvent);
                                        }

                                        // Create transfer event for check-in if selected
                                        if (hasCheckInTransfer && createCheckIn) {
                                            const transferEvent = {
                                                id: Math.random().toString(36).substr(2, 9),
                                                time: manualData.checkInTime,
                                                date: manualData.checkInDate.replace(/\s/g, ''),
                                                type: 'transfer',
                                                title: 'Transferência',
                                                subtitle: 'Transporte',
                                                location: manualData.address || manualData.name,
                                                driver: 'David Príncipe',
                                                duration: '1h 00 min',
                                                logos: [],
                                                status: 'confirmed'
                                            };
                                            events.push(transferEvent);
                                        }

                                        // Create transfer event for check-out if selected
                                        if (hasCheckOutTransfer && createCheckOut) {
                                            const transferEvent = {
                                                id: Math.random().toString(36).substr(2, 9),
                                                time: manualData.checkOutTime,
                                                date: manualData.checkOutDate.replace(/\s/g, ''),
                                                type: 'transfer',
                                                title: 'Transferência',
                                                subtitle: 'Transporte',
                                                location: manualData.address || manualData.name,
                                                driver: 'David Príncipe',
                                                duration: '1h 00 min',
                                                logos: [],
                                                status: 'confirmed'
                                            };
                                            events.push(transferEvent);
                                        }

                                        onSave(events);
                                    }}
                                >
                                    Adicionar Hotel
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div >
    )
}
