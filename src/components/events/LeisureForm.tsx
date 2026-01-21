
import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Search, Sun, MapPin } from "lucide-react"
import { ParticipantsSelector } from "@/components/common/ParticipantsSelector"
import { SelectedParticipantsSummary } from "@/components/common/SelectedParticipantsSummary"
import { CostSelector } from "@/components/common/CostSelector"
import { getLocals } from "@/app/actions/get-locals"
import LeisureCard, { Participant } from "@/components/events/LeisureCard"
import { GooglePlacesAutocomplete } from "@/components/common/GooglePlacesAutocomplete"
import { checkTimeConflict, validateDateSelected } from "@/lib/eventValidation"
import { ConflictAlert } from "@/components/common/ConflictAlert"
import { Event } from "@/types/itinerary"

// Mock participants data (same as FoodForm)
const mockParticipants: Participant[] = [
    { id: '1', name: 'João Silva', avatar: 'https://github.com/shadcn.png', group: 'Grupo Alpha' },
    { id: '2', name: 'Maria Santos', avatar: 'https://github.com/shadcn.png', group: 'Grupo Alpha' },
    { id: '3', name: 'Pedro Costa', avatar: 'https://github.com/shadcn.png', group: 'Grupo Beta' },
    { id: '4', name: 'Ana Oliveira', avatar: 'https://github.com/shadcn.png', group: 'Grupo Beta' },
    { id: '5', name: 'Carlos Souza', avatar: 'https://github.com/shadcn.png', group: 'Grupo Gama' },
    { id: '6', name: 'Julia Lima', avatar: 'https://github.com/shadcn.png', group: 'Grupo Gama' },
    { id: '7', name: 'Rafael Alves', avatar: 'https://github.com/shadcn.png', group: 'Grupo Delta' },
    { id: '8', name: 'Beatriz Rocha', avatar: 'https://github.com/shadcn.png', group: 'Grupo Delta' },
]

export default function LeisureForm({
    onSave,
    onCancel,
    initialData,
    persistedState,
    onPersistState,
    missionGroups,
    missionTravelers,
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
    const [selectedPlacePrice, setSelectedPlacePrice] = React.useState('')
    const [selectedPlaceId, setSelectedPlaceId] = React.useState<string | null>(null)
    const [placeGuests, setPlaceGuests] = React.useState<Record<string, string[]>>({})
    const [favorites, setFavorites] = React.useState<string[]>([])
    const [showFavorites, setShowFavorites] = React.useState(false)
    const [isManualMode, setIsManualMode] = React.useState(false)
    const [hasTransfer, setHasTransfer] = React.useState(false)

    // Search State
    const [searchLocation, setSearchLocation] = React.useState('São Paulo, Brasil')
    const [searchQuery, setSearchQuery] = React.useState('')
    const [places, setPlaces] = React.useState<any[]>([])
    const [isLoading, setIsLoading] = React.useState(false)

    // Form State
    const [date, setDate] = React.useState(defaultDate || '2025-05-22')
    const [startTime, setStartTime] = React.useState('09:00')
    const [endTime, setEndTime] = React.useState('15:00')

    // Manual Mode State
    const [manualData, setManualData] = React.useState({
        name: '',
        category: '',
        address: '',
        city: '',
        country: '',
        date: defaultDate || '2025-05-22',
        startTime: '09:00',
        endTime: '15:00',
        description: '',
        price: 'Sem custo'
    })

    // Initialize from persisted state
    React.useEffect(() => {
        if (persistedState) {
            if (persistedState.searchLocation) setSearchLocation(persistedState.searchLocation)
            if (persistedState.searchQuery) setSearchQuery(persistedState.searchQuery)
            if (persistedState.places) setPlaces(persistedState.places)
            if (persistedState.selectedPlaceId) setSelectedPlaceId(persistedState.selectedPlaceId)
            if (persistedState.placeGuests) setPlaceGuests(persistedState.placeGuests)
            if (persistedState.favorites) setFavorites(persistedState.favorites)
            if (persistedState.showFavorites !== undefined) setShowFavorites(persistedState.showFavorites)
            if (persistedState.isManualMode !== undefined) setIsManualMode(persistedState.isManualMode)
            if (persistedState.manualData) setManualData(persistedState.manualData)
            if (persistedState.date) setDate(persistedState.date)
            if (persistedState.startTime) setStartTime(persistedState.startTime)
            if (persistedState.endTime) setEndTime(persistedState.endTime)
        }
    }, [])

    // Persist state changes
    React.useEffect(() => {
        if (onPersistState) {
            const timeoutId = setTimeout(() => {
                onPersistState({
                    searchLocation,
                    searchQuery,
                    places,
                    selectedPlaceId,
                    placeGuests,
                    favorites,
                    showFavorites,
                    isManualMode,
                    manualData,
                    date,
                    startTime,
                    endTime
                })
            }, 500)
            return () => clearTimeout(timeoutId)
        }
    }, [
        searchLocation, searchQuery,
        places, selectedPlaceId, placeGuests, favorites,
        showFavorites, isManualMode, manualData, date,
        startTime, endTime, onPersistState
    ])

    React.useEffect(() => {
        if (initialData) {
            setManualData({
                name: initialData.title || '',
                category: initialData.subtitle || '',
                address: initialData.location || '',
                city: initialData.city || '',
                country: initialData.country || '',
                date: initialData.date || '2025-05-22',
                startTime: initialData.time || '09:00',
                endTime: initialData.endTime || initialData.toTime || '15:00',
                description: initialData.description || '',
                price: initialData.price || ''
            })
            // setIsManualMode(true)
            if (initialData.location) setSearchLocation(initialData.location)

            // Populate search mode states
            if (initialData.date) setDate(initialData.date)
            if (initialData.time) setStartTime(initialData.time)
            if (initialData.endTime || initialData.toTime) setEndTime(initialData.endTime || initialData.toTime)

            // Populate leisure places list with the current event data so it shows as selected
            if (initialData.title) {
                const mockPlace = {
                    place_id: initialData.id,
                    title: initialData.title,
                    address: initialData.location,
                    thumbnail: initialData.logos?.[0],
                    type: initialData.subtitle,
                    rating: 0,
                    reviews: 0
                };
                setPlaces([mockPlace]);
                setSelectedPlaceId(initialData.id);

                // Initialize placeGuests from passengers
                if (initialData.passengers && Array.isArray(initialData.passengers)) {
                    setPlaceGuests({
                        [initialData.id]: initialData.passengers.map(String)
                    });
                }

                // Initialize hasTransfer
                if (initialData.hasTransfer !== undefined) {
                    setHasTransfer(initialData.hasTransfer)
                }

                // Initialize costType and price
                if (initialData.status === 'quoting') {
                    setCostType('quoting')
                } else if (initialData.status === 'free') {
                    setCostType('free')
                } else {
                    setCostType('confirmed')
                }
                if (initialData.price) setSelectedPlacePrice(initialData.price)
            }
        }
    }, [initialData])

    const [conflictInfo, setConflictInfo] = React.useState<{ hasConflict: boolean; message: string; conflictingEvents: Event[] }>({ hasConflict: false, message: '', conflictingEvents: [] })

    // Check for conflicts
    React.useEffect(() => {
        if (!existingEvents) return;

        const currentDate = isManualMode ? manualData.date : date;

        // Don't show conflicts if no date is selected
        if (!validateDateSelected(currentDate)) {
            setConflictInfo({ hasConflict: false, message: '', conflictingEvents: [] });
            return;
        }

        const conflict = checkTimeConflict({
            time: isManualMode ? manualData.startTime : startTime,
            toTime: isManualMode ? manualData.endTime : endTime,
            date: currentDate,
            id: initialData?.id, // Exclude current event from check if editing
            type: 'leisure'
        } as unknown as Event, existingEvents);

        setConflictInfo(conflict);
    }, [startTime, endTime, date, manualData.startTime, manualData.endTime, manualData.date, isManualMode, existingEvents, initialData?.id])

    const handleSearchPlaces = async () => {
        setIsLoading(true)
        try {
            // Combine query and location for better SerpApi results
            const queryWithLocation = searchQuery
                ? `${searchQuery} em ${searchLocation}`
                : `O que fazer em ${searchLocation}`;

            console.log('LeisureForm: Searching with', { query: queryWithLocation });

            const data = await getLocals({
                query: queryWithLocation,
                location: '' // Leave empty to avoid strict location errors
            })

            if (data && data.local_results) {
                setPlaces(data.local_results)
            }
        } catch (error) {
            console.error("Error searching places:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const toggleFavorite = (placeId: string) => {
        setFavorites(prev =>
            prev.includes(placeId)
                ? prev.filter(id => id !== placeId)
                : [...prev, placeId]
        )
    }

    const selectPlace = (placeId: string) => {
        setSelectedPlaceId(prev => prev === placeId ? null : placeId)
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
                    <h2 className="text-lg font-semibold text-gray-900">Adicionar Local/Atividade Manualmente</h2>
                </div>
            )}
            <div className="flex flex-1 overflow-hidden p-6">
                {!isManualMode ? (
                    <>
                        {/* Left Column - Form Fields */}
                        <div className="w-1/2 flex flex-col gap-5 overflow-y-auto pr-8 pl-1 py-1">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-gray-500">Dia do evento*</Label>
                                    <div className="relative">
                                        <Input
                                            type="date"
                                            value={date ? (date.includes('/') ? date.split('/').map(p => p.trim()).reverse().join('-') : date.trim()) : ''}
                                            onChange={(e) => setDate(e.target.value.includes('-') ? e.target.value.split('-').map(p => p.trim()).reverse().join('/') : e.target.value.trim())}
                                            min={minDate}
                                            max={maxDate}
                                            className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-gray-500">Horario de inicio*</Label>
                                    <div className="relative">
                                        <Input
                                            type="time"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-gray-500">Horario de fim*</Label>
                                    <div className="relative">
                                        <Input
                                            type="time"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                                        />
                                    </div>
                                </div>
                            </div>
                            <ConflictAlert conflictingEvents={conflictInfo.conflictingEvents} message={conflictInfo.message} />


                            <div className="space-y-1.5">
                                <Label className="text-xs text-gray-500">Localização*</Label>
                                <GooglePlacesAutocomplete
                                    value={searchLocation}
                                    onChange={setSearchLocation}
                                    placeholder="Cidade ou endereço"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs text-gray-500">Buscar Atividade/Local</Label>
                                <div className="relative">
                                    <Input
                                        placeholder="Ex: Parques, Museus, Shoppings..."
                                        className="h-12 pl-4 pr-10 bg-white border-gray-200 rounded-xl shadow-none"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearchPlaces()}
                                    />
                                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    onClick={handleSearchPlaces}
                                    disabled={isLoading}
                                    className="h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium"
                                >
                                    {isLoading ? "Buscando..." : "Buscar Locais"}
                                </Button>
                                <Button
                                    onClick={() => setIsManualMode(true)}
                                    variant="outline"
                                    className="h-12 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-xl font-medium"
                                >
                                    Adicionar Manualmente
                                </Button>
                            </div>

                            <div className="flex items-center gap-4 my-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-900">Possuí transfer</span>
                                    <Checkbox
                                        checked={hasTransfer}
                                        onCheckedChange={(checked) => setHasTransfer(checked as boolean)}
                                        className="w-5 h-5 rounded border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 shadow-none"
                                    />
                                </div>

                                <div className="flex-1">
                                    <SelectedParticipantsSummary
                                        selectedIds={selectedPlaceId ? placeGuests[selectedPlaceId] || [] : []}
                                        participants={missionTravelers?.map(t => ({
                                            id: t.id,
                                            name: t.name,
                                            avatar: t.photo || t.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=random`,
                                            group: missionGroups?.find(g => g.id === t.group_id || g.id === t.groupId)?.nome || 'Sem grupo',
                                            role: t.role || 'Convidado'
                                        })) || []}
                                        label="Participantes Selecionados"
                                        placeholder="Nenhum participante selecionado"
                                    />
                                </div>
                            </div>


                            <CostSelector
                                costType={costType}
                                setCostType={setCostType}
                                price={selectedPlacePrice}
                                setPrice={setSelectedPlacePrice}
                            />
                        </div>

                        {/* Right Column - Place Selection */}
                        <div className="w-1/2 flex flex-col pl-8 border-l border-gray-100">
                            <div className="mb-6">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-medium text-gray-900">Locais disponíveis:</h3>
                                    <div className="flex flex-col items-center gap-1">
                                        <Switch
                                            id="favorites"
                                            checked={showFavorites}
                                            onCheckedChange={setShowFavorites}
                                        />
                                        <Label htmlFor="favorites" className="text-[10px] text-gray-500 font-medium">Favoritos</Label>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mb-4">Obs: Selecione um local para o tempo livre.</p>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3">
                                {isLoading ? (
                                    <div className="flex items-center justify-center h-40 text-gray-500">
                                        Carregando locais...
                                    </div>
                                ) : places.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center flex-1 h-full text-gray-500">
                                        <Sun className="w-12 h-12 mb-2 text-gray-300" />
                                        <p className="text-sm">Nenhum local encontrado</p>
                                        <p className="text-xs">Faça uma busca para ver sugestões</p>
                                    </div>
                                ) : (
                                    places
                                        .filter(place => !showFavorites || favorites.includes(place.place_id))
                                        .map((place) => (
                                            <LeisureCard
                                                key={place.place_id}
                                                place={place}
                                                isFavorite={favorites.includes(place.place_id)}
                                                onToggleFavorite={() => toggleFavorite(place.place_id)}
                                                isSelected={selectedPlaceId === place.place_id}
                                                onSelect={() => selectPlace(place.place_id)}
                                                participants={mockParticipants}
                                                selectedGuests={placeGuests[place.place_id] || []}
                                                onGuestsChange={(guests) => setPlaceGuests(prev => ({
                                                    ...prev,
                                                    [place.place_id]: guests
                                                }))}
                                                missionGroups={missionGroups}
                                                missionTravelers={missionTravelers}
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
                                        disabled={!selectedPlaceId || !validateDateSelected(date)}
                                        onClick={() => {
                                            if (!onSave) return;
                                            if (!validateDateSelected(date)) {
                                                alert('Por favor, selecione uma data para o evento.')
                                                return;
                                            }
                                            const selectedPlace = places.find(p => p.place_id === selectedPlaceId);
                                            if (selectedPlace) {
                                                const [sh, sm] = startTime.split(':').map(Number);
                                                const [eh, em] = endTime.split(':').map(Number);
                                                let minutes = (eh * 60 + em) - (sh * 60 + sm);
                                                if (minutes < 0) minutes += 24 * 60;
                                                const h = Math.floor(minutes / 60);
                                                const m = minutes % 60;
                                                const duration = `${h}h${m > 0 ? ` ${m}min` : ''}`;

                                                const events: any[] = [];

                                                // Create leisure event
                                                const leisureEvent = {
                                                    id: Math.random().toString(36).substr(2, 9),
                                                    time: startTime,
                                                    date: date,
                                                    toTime: endTime,
                                                    type: 'leisure',
                                                    title: selectedPlace.title,
                                                    subtitle: selectedPlace.btype || "Lazer",
                                                    location: selectedPlace.address || selectedPlace.title,
                                                    status: costType as 'free' | 'confirmed' | 'quoting',
                                                    price: costType === 'free' ? 'Sem custo' : (selectedPlacePrice || 'N/A'),
                                                    duration: duration,
                                                    logos: selectedPlace.thumbnail ? [selectedPlace.thumbnail] : [],
                                                    passengers: placeGuests[selectedPlace.place_id] || [],
                                                    hasTransfer: hasTransfer
                                                };
                                                events.push(leisureEvent);

                                                // Create transfer event if selected
                                                if (hasTransfer) {
                                                    const transferEvent = {
                                                        id: Math.random().toString(36).substr(2, 9),
                                                        time: endTime,
                                                        date: date,
                                                        type: 'transfer',
                                                        title: 'Transferência',
                                                        subtitle: 'Transporte',
                                                        location: selectedPlace.address || selectedPlace.title,
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
                                    <Label className="text-xs text-gray-500">Nome do Local*</Label>
                                    <Input
                                        placeholder="Ex: Millennium Park"
                                        className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                                        value={manualData.name}
                                        onChange={(e) => setManualData({ ...manualData, name: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1.5 col-span-2">
                                    <Label className="text-xs text-gray-500">Categoria*</Label>
                                    <Input
                                        placeholder="Ex: Parque, Museu, etc"
                                        className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                                        value={manualData.category}
                                        onChange={(e) => setManualData({ ...manualData, category: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1.5 col-span-4">
                                    <Label className="text-xs text-gray-500">Endereço*</Label>
                                    <Input
                                        placeholder="Endereço completo"
                                        className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                                        value={manualData.address}
                                        onChange={(e) => setManualData({ ...manualData, address: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1.5 col-span-2">
                                    <Label className="text-xs text-gray-500">Cidade*</Label>
                                    <Input
                                        placeholder="Cidade"
                                        className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                                        value={manualData.city}
                                        onChange={(e) => setManualData({ ...manualData, city: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1.5 col-span-2">
                                    <Label className="text-xs text-gray-500">País*</Label>
                                    <Input
                                        placeholder="País"
                                        className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                                        value={manualData.country}
                                        onChange={(e) => setManualData({ ...manualData, country: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1.5 col-span-2">
                                    <Label className="text-xs text-gray-500">Dia do evento*</Label>
                                    <div className="relative">
                                        <Input
                                            type="date"
                                            value={manualData.date}
                                            onChange={(e) => setManualData({ ...manualData, date: e.target.value })}
                                            min={minDate}
                                            max={maxDate}
                                            className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs text-gray-500">Horário de início*</Label>
                                    <div className="relative">
                                        <Input
                                            type="time"
                                            value={manualData.startTime}
                                            onChange={(e) => setManualData({ ...manualData, startTime: e.target.value })}
                                            className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs text-gray-500">Horário de fim*</Label>
                                    <div className="relative">
                                        <Input
                                            type="time"
                                            value={manualData.endTime}
                                            onChange={(e) => setManualData({ ...manualData, endTime: e.target.value })}
                                            className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                                        />
                                    </div>
                                </div>
                                <div className="col-span-4">
                                    <ConflictAlert conflictingEvents={conflictInfo.conflictingEvents} message={conflictInfo.message} />
                                </div>

                                <div className="col-span-2">
                                    <SelectedParticipantsSummary
                                        selectedIds={[]} // Manual mode doesn't support selection yet in this context, or needs state
                                        participants={[]}
                                        label="Participantes Selecionados"
                                        placeholder="Seleção de participantes indisponível no modo manual"
                                    />
                                </div>

                                <div className="space-y-1.5 col-span-4">
                                    <Label className="text-xs text-gray-500">Descrição da atividade</Label>
                                    <Input
                                        placeholder="Ex: Passeio livre pelo parque"
                                        className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                                        value={manualData.description}
                                        onChange={(e) => setManualData({ ...manualData, description: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-4 border-t border-gray-100 pt-4">
                                    <CostSelector
                                        costType={costType}
                                        setCostType={setCostType}
                                        price={manualData.price}
                                        setPrice={(price) => setManualData({ ...manualData, price })}
                                    />
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
                                    disabled={!validateDateSelected(manualData.date)}
                                    onClick={() => {
                                        if (!onSave) return;
                                        if (!validateDateSelected(manualData.date)) {
                                            alert('Por favor, selecione uma data para o evento.')
                                            return;
                                        }

                                        const [sh, sm] = manualData.startTime.split(':').map(Number);
                                        const [eh, em] = manualData.endTime.split(':').map(Number);
                                        let minutes = (eh * 60 + em) - (sh * 60 + sm);
                                        if (minutes < 0) minutes += 24 * 60;
                                        const h = Math.floor(minutes / 60);
                                        const m = minutes % 60;
                                        const duration = `${h}h${m > 0 ? ` ${m}min` : ''}`;

                                        const events: any[] = [];

                                        // Create leisure event
                                        const leisureEvent = {
                                            id: Math.random().toString(36).substr(2, 9),
                                            time: manualData.startTime,
                                            date: manualData.date,
                                            toTime: manualData.endTime,
                                            fromTime: manualData.startTime,
                                            type: 'leisure',
                                            title: manualData.name,
                                            subtitle: manualData.category || 'Lazer',
                                            location: manualData.address,
                                            price: costType === 'free' ? 'Sem custo' : (manualData.price || 'N/A'),
                                            status: costType as 'free' | 'confirmed' | 'quoting',
                                            description: manualData.description,
                                            duration: duration,
                                            logos: [],
                                            hasTransfer: hasTransfer
                                        };
                                        events.push(leisureEvent);

                                        // Create transfer event if selected
                                        if (hasTransfer) {
                                            const transferEvent = {
                                                id: Math.random().toString(36).substr(2, 9),
                                                time: manualData.endTime,
                                                date: manualData.date,
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
                                    Adicionar Atividade
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
