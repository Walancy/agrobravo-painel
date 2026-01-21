
import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Calendar as CalendarIcon, ChevronDown, ChevronUp, MapPin, Search, ArrowLeft } from "lucide-react"
import { ParticipantsSelector } from "@/components/common/ParticipantsSelector"
import { SelectedParticipantsSummary } from "@/components/common/SelectedParticipantsSummary"
import { CostSelector } from "@/components/common/CostSelector"
import { LocationSelector } from "@/components/common/LocationSelector"
import { getLocals } from "@/app/actions/get-locals"
import VisitCard from "@/components/events/VisitCard"
import { cn } from "@/lib/utils"
import { checkTimeConflict, validateDateSelected } from "@/lib/eventValidation"
import { ConflictAlert } from "@/components/common/ConflictAlert"
import { Event } from "@/types/itinerary"

export default function VisitForm({
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
    const [selectedEventPrice, setSelectedEventPrice] = React.useState('')
    const [selectedEventId, setSelectedEventId] = React.useState<string | null>(null)
    const [visitGuests, setVisitGuests] = React.useState<Record<string, string[]>>({})
    const [favorites, setFavorites] = React.useState<string[]>([])
    const [showFavorites, setShowFavorites] = React.useState(false)
    const [isManualMode, setIsManualMode] = React.useState(false)
    const [conflictInfo, setConflictInfo] = React.useState<{ hasConflict: boolean; message: string; conflictingEvents: Event[] }>({ hasConflict: false, message: '', conflictingEvents: [] })

    // Format defaultDate to DD/MM/YYYY for manualData
    const formattedDefaultDate = defaultDate ? defaultDate.split('-').reverse().join('/') : '22/05/2026';

    const [manualData, setManualData] = React.useState({
        title: '',
        location: '',
        city: '',
        state: '',
        country: '',
        date: formattedDefaultDate,
        startTime: '09:00',
        endTime: '15:00',
        contactName: '',
        contactPhone: '',
        description: '',
        participants: '30',
        price: ''
    })

    const [searchCountry, setSearchCountry] = React.useState('Brasil')
    const [searchState, setSearchState] = React.useState('São Paulo')
    const [searchCity, setSearchCity] = React.useState('São Paulo')
    const [searchQuery, setSearchQuery] = React.useState('')
    const [visitEvents, setVisitEvents] = React.useState<any[]>([])
    const [isLoading, setIsLoading] = React.useState(false)

    // Form State for Search Mode
    const [date, setDate] = React.useState(defaultDate || '2026-05-22')
    const [startTime, setStartTime] = React.useState('09:00')
    const [endTime, setEndTime] = React.useState('15:00')
    const [description, setDescription] = React.useState('')
    const [hasTransfer, setHasTransfer] = React.useState(false)

    React.useEffect(() => {
        if (initialData) {
            setManualData({
                title: initialData.title || '',
                location: initialData.location || '',
                city: initialData.city || '',
                state: initialData.state || '',
                country: initialData.country || '',
                date: initialData.date || formattedDefaultDate,
                startTime: initialData.time || '09:00',
                endTime: initialData.toTime || initialData.endTime || '15:00',
                contactName: initialData.contactName || '',
                contactPhone: initialData.contactPhone || '',
                description: initialData.description || initialData.notes?.replace(/Contato: [^ ]+ [^ ]+ /, '') || '',
                participants: initialData.passengers ? String(initialData.passengers.length) : '30',
                price: initialData.price || ''
            })

            // Set cost type based on status
            if (initialData.status === 'quoting') setCostType('quoting')
            else if (initialData.status === 'free') setCostType('free')
            else setCostType('confirmed')

            if (initialData.country) setSearchCountry(initialData.country)
            if (initialData.state) setSearchState(initialData.state)
            if (initialData.city) setSearchCity(initialData.city)

            // Populate search mode states as well
            if (initialData.date) setDate(initialData.date)
            if (initialData.time) setStartTime(initialData.time)
            if (initialData.endTime || initialData.toTime) setEndTime(initialData.endTime || initialData.toTime)
            if (initialData.description) setDescription(initialData.description)

            // Initialize hasTransfer
            if (initialData.hasTransfer !== undefined) setHasTransfer(initialData.hasTransfer)

            // Populate visit events list with the current event data so it shows as selected
            if (initialData.title) {
                const mockEvent = {
                    place_id: initialData.id,
                    title: initialData.title,
                    address: initialData.location,
                    thumbnail: initialData.logos?.[0],
                    type: initialData.subtitle,
                    rating: 0,
                    reviews: 0
                };
                setVisitEvents([mockEvent]);
                setSelectedEventId(initialData.id);

                // Initialize visitGuests from passengers
                if (initialData.passengers && Array.isArray(initialData.passengers)) {
                    setVisitGuests({
                        [initialData.id]: initialData.passengers.map(String)
                    });
                }
                if (initialData.price) {
                    setSelectedEventPrice(initialData.price)
                }
            }

            // If it's not a manual entry (no contact info usually), stay in search mode but with the item selected
            if (initialData.contactName || initialData.contactPhone) {
                setIsManualMode(true)
            }
        }
    }, [initialData])

    const toggleFavorite = (eventId: string) => {
        setFavorites(prev =>
            prev.includes(eventId)
                ? prev.filter(id => id !== eventId)
                : [...prev, eventId]
        )
    }

    // Initialize from persisted state
    React.useEffect(() => {
        if (persistedState && !initialData) {
            if (persistedState.searchCountry) setSearchCountry(persistedState.searchCountry)
            if (persistedState.searchState) setSearchState(persistedState.searchState)
            if (persistedState.searchCity) setSearchCity(persistedState.searchCity)
            if (persistedState.searchQuery) setSearchQuery(persistedState.searchQuery)
            if (persistedState.visitEvents) setVisitEvents(persistedState.visitEvents)
            if (persistedState.selectedEventId) setSelectedEventId(persistedState.selectedEventId)
            if (persistedState.visitGuests) setVisitGuests(persistedState.visitGuests)
            if (persistedState.favorites) setFavorites(persistedState.favorites)
            if (persistedState.showFavorites !== undefined) setShowFavorites(persistedState.showFavorites)
            if (persistedState.isManualMode !== undefined) setIsManualMode(persistedState.isManualMode)
            if (persistedState.manualData) setManualData(persistedState.manualData)
            if (persistedState.date) setDate(persistedState.date)
            if (persistedState.startTime) setStartTime(persistedState.startTime)
            if (persistedState.endTime) setEndTime(persistedState.endTime)
            if (persistedState.description) setDescription(persistedState.description)
            if (persistedState.hasTransfer !== undefined) setHasTransfer(persistedState.hasTransfer)
        }
    }, [persistedState, initialData])

    // Persist state changes
    React.useEffect(() => {
        if (onPersistState && !initialData) {
            const timeoutId = setTimeout(() => {
                onPersistState({
                    searchCountry,
                    searchState,
                    searchCity,
                    searchQuery,
                    visitEvents,
                    selectedEventId,
                    visitGuests,
                    favorites,
                    showFavorites,
                    isManualMode,
                    manualData,
                    date,
                    startTime,
                    endTime,
                    description,
                    hasTransfer
                })
            }, 500)
            return () => clearTimeout(timeoutId)
        }
    }, [
        searchCountry, searchState, searchCity, searchQuery,
        visitEvents, selectedEventId, visitGuests, favorites,
        showFavorites, isManualMode, manualData, date,
        startTime, endTime, description, hasTransfer, onPersistState, initialData
    ])

    const handleSearch = async () => {
        setIsLoading(true)
        try {
            const locationParts = [searchCity, searchState, searchCountry].filter(Boolean);
            const uniqueParts = Array.from(new Set(locationParts));
            const locationString = uniqueParts.join(', ');

            const queryWithLocation = `${searchQuery || 'Eventos e Locais'} em ${locationString}`;

            console.log('VisitForm: Searching with', { query: queryWithLocation });
            const data = await getLocals({ query: queryWithLocation, location: '' })
            console.log('VisitForm: API Response', data);

            if (data.local_results?.places) {
                setVisitEvents(data.local_results.places)
            } else if (data.mac_results?.places) {
                setVisitEvents(data.mac_results.places)
            } else if (data.local_results) {
                setVisitEvents(Array.isArray(data.local_results) ? data.local_results : [])
            } else if (data.organic_results) {
                setVisitEvents(data.organic_results.map((r: any) => ({
                    title: r.title,
                    address: r.snippet,
                    type: 'Web Result',
                    place_id: r.link
                })))
            } else {
                console.warn('VisitForm: No results found in known formats');
                setVisitEvents([])
            }
        } catch (error) {
            console.error(error)
            setVisitEvents([])
        } finally {
            setIsLoading(false)
        }
    }

    // Check for time conflicts whenever time or date changes
    React.useEffect(() => {
        if (!existingEvents || existingEvents.length === 0) {
            setConflictInfo({ hasConflict: false, message: '', conflictingEvents: [] })
            return
        }

        const currentDate = isManualMode ? manualData.date : date;

        // Don't show conflicts if no date is selected
        if (!validateDateSelected(currentDate)) {
            setConflictInfo({ hasConflict: false, message: '', conflictingEvents: [] })
            return
        }

        const newEvent = {
            time: isManualMode ? manualData.startTime : startTime,
            endTime: isManualMode ? manualData.endTime : endTime,
            date: currentDate,
            type: 'visit',
            id: initialData?.id
        }

        const conflict = checkTimeConflict(newEvent as any, existingEvents)
        setConflictInfo(conflict)
    }, [isManualMode, date, startTime, endTime, manualData.date, manualData.startTime, manualData.endTime, existingEvents, initialData?.id])

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
                    <h2 className="text-lg font-semibold text-gray-900">
                        {initialData ? 'Editar Visita' : 'Adicionar Visita Manualmente'}
                    </h2>
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
                                    <Label className="text-xs text-gray-500">Início*</Label>
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
                                    <Label className="text-xs text-gray-500">Fim*</Label>
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
                                <Label className="text-xs text-gray-500">Buscar Evento ou Local</Label>
                                <div className="relative">
                                    <Input
                                        placeholder="Ex: Agrishow, Fazenda Santa Cruz..."
                                        className="h-12 pl-4 pr-10 bg-white border-gray-200 rounded-xl shadow-none"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    onClick={handleSearch}
                                    disabled={isLoading}
                                    className="h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium"
                                >
                                    {isLoading ? "Buscando..." : "Buscar Eventos"}
                                </Button>
                                <Button
                                    onClick={() => setIsManualMode(true)}
                                    variant="outline"
                                    className="h-12 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-xl font-medium"
                                >
                                    Adicionar Manualmente
                                </Button>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs text-gray-500">Descrição (opcional)</Label>
                                <Input
                                    placeholder="Ex: dresscode social"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                                />
                            </div>

                            <div className="flex items-center gap-4">
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
                                        selectedIds={selectedEventId ? visitGuests[selectedEventId] || [] : []}
                                        participants={missionTravelers?.map(t => ({
                                            id: t.id,
                                            name: t.name,
                                            avatar: t.photo || t.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=random`,
                                            group: missionGroups?.find(g => g.id === t.group_id || g.id === t.groupId)?.nome || 'Sem grupo',
                                            role: t.role || 'Convidado'
                                        })) || []}
                                        label="Convidados Selecionados"
                                        placeholder="Nenhum convidado selecionado"
                                    />
                                </div>
                            </div>


                            <CostSelector
                                costType={costType}
                                setCostType={setCostType}
                                price={selectedEventPrice}
                                setPrice={setSelectedEventPrice}
                            />
                        </div>

                        {/* Right Column - Event Selection */}
                        <div className="w-1/2 flex flex-col pl-8 border-l border-gray-100">
                            <div className="mb-6">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-medium text-gray-900">Selecione um dos eventos disponíveis para o grupo:</h3>
                                    <div className="flex flex-col items-center gap-1">
                                        <Switch
                                            id="favorites"
                                            checked={showFavorites}
                                            onCheckedChange={setShowFavorites}
                                        />
                                        <Label htmlFor="favorites" className="text-[10px] text-gray-500 font-medium">Favoritos</Label>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mb-4">Obs: A listagem de eventos é baseada no calculo ETA.</p>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3">
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-8 text-gray-500">
                                        Carregando...
                                    </div>
                                ) : visitEvents.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center flex-1 h-full text-gray-500">
                                        <MapPin className="w-12 h-12 mb-2 text-gray-300" />
                                        <p className="text-sm font-medium text-gray-900">Nenhum evento encontrado</p>
                                        <p className="text-xs">Faça uma busca para ver os resultados</p>
                                    </div>
                                ) : (
                                    visitEvents
                                        .filter(event => !showFavorites || favorites.includes(event.place_id || event.title))
                                        .map((event, index) => {
                                            const eventId = event.place_id || `event-${index}`;
                                            return (
                                                <VisitCard
                                                    key={eventId}
                                                    event={event}
                                                    eventId={eventId}
                                                    index={index}
                                                    isFavorite={favorites.includes(eventId)}
                                                    onToggleFavorite={() => toggleFavorite(eventId)}
                                                    isSelected={selectedEventId === eventId}
                                                    onSelect={() => setSelectedEventId(eventId)}
                                                    selectedGuests={visitGuests[eventId] || []}
                                                    onGuestsChange={(guests) => setVisitGuests(prev => ({ ...prev, [eventId]: guests }))}
                                                    missionGroups={missionGroups}
                                                    missionTravelers={missionTravelers}
                                                />
                                            )
                                        })
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
                                        disabled={!validateDateSelected(date)}
                                        onClick={() => {
                                            if (!onSave) return;
                                            if (!validateDateSelected(date)) {
                                                alert('Por favor, selecione uma data para o evento.')
                                                return
                                            }
                                            const event = visitEvents.find((e, index) => (e.place_id || `event-${index}`) === selectedEventId);
                                            if (!event) return;

                                            const [sh, sm] = startTime.split(':').map(Number);
                                            const [eh, em] = endTime.split(':').map(Number);
                                            let minutes = (eh * 60 + em) - (sh * 60 + sm);
                                            if (minutes < 0) minutes += 24 * 60;
                                            const h = Math.floor(minutes / 60);
                                            const m = minutes % 60;
                                            const duration = `${h}h${m > 0 ? ` ${m}min` : ''}`;

                                            const events: any[] = [];
                                            const visitEvent = {
                                                id: initialData?.id || Math.random().toString(36).substr(2, 9),
                                                time: startTime,
                                                toTime: endTime,
                                                date: date,
                                                type: 'visit',
                                                title: event.title,
                                                subtitle: description || event.type || 'Visita',
                                                location: event.address || event.location,
                                                status: costType as 'free' | 'confirmed' | 'quoting',
                                                price: costType === 'free' ? 'Sem custo' : selectedEventPrice,
                                                duration: duration,
                                                logos: event.thumbnail ? [event.thumbnail] : [],
                                                notes: `Contato: Não informado ${hasTransfer ? '(Transfer Incluso)' : ''}`,
                                                passengers: (selectedEventId && visitGuests[selectedEventId]) || [],
                                                hasTransfer: hasTransfer
                                            };
                                            events.push(visitEvent);

                                            if (hasTransfer) {
                                                events.push({
                                                    id: Math.random().toString(36).substr(2, 9),
                                                    time: endTime,
                                                    date: date,
                                                    type: 'transfer',
                                                    title: 'Transferência',
                                                    subtitle: 'Transporte',
                                                    location: event.address || event.location || event.title,
                                                    driver: 'David Príncipe',
                                                    duration: '1h 00 min',
                                                    logos: [],
                                                    status: 'confirmed'
                                                });
                                            }

                                            onSave(events);
                                        }}
                                    >
                                        {initialData ? 'Salvar Alterações' : 'Adicionar Visita'}
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
                                    <Label className="text-xs text-gray-500">Nome do Evento*</Label>
                                    <Input
                                        placeholder="Ex: Farm Progress Show"
                                        className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                                        value={manualData.title}
                                        onChange={(e) => setManualData({ ...manualData, title: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1.5 col-span-2">
                                    <Label className="text-xs text-gray-500">Local/Endereço*</Label>
                                    <Input
                                        placeholder="Endereço completo"
                                        className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                                        value={manualData.location}
                                        onChange={(e) => setManualData({ ...manualData, location: e.target.value })}
                                    />
                                </div>

                                <div className="col-span-4 grid grid-cols-2 gap-6">
                                    <LocationSelector
                                        country={manualData.country}
                                        state={manualData.state}
                                        city={manualData.city}
                                        onCountryChange={(val) => setManualData(prev => ({ ...prev, country: val }))}
                                        onStateChange={(val) => setManualData(prev => ({ ...prev, state: val }))}
                                        onCityChange={(val) => setManualData(prev => ({ ...prev, city: val }))}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs text-gray-500">Dia do evento*</Label>
                                    <div className="relative">
                                        <Input
                                            type="date"
                                            className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                                            value={manualData.date.split('/').reverse().join('-')}
                                            onChange={(e) => setManualData({ ...manualData, date: e.target.value.split('-').reverse().join('/') })}
                                            min={minDate}
                                            max={maxDate}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs text-gray-500">Horário de início*</Label>
                                    <div className="relative">
                                        <Input
                                            defaultValue="09:00"
                                            className="h-12 bg-gray-50 border-gray-200 rounded-xl pr-10 shadow-none"
                                            value={manualData.startTime}
                                            onChange={(e) => setManualData({ ...manualData, startTime: e.target.value })}
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col">
                                            <ChevronUp className="w-3 h-3 text-gray-400 cursor-pointer" />
                                            <ChevronDown className="w-3 h-3 text-gray-400 cursor-pointer" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs text-gray-500">Horário de fim*</Label>
                                    <div className="relative">
                                        <Input
                                            defaultValue="15:00"
                                            className="h-12 bg-gray-50 border-gray-200 rounded-xl pr-10 shadow-none"
                                            value={manualData.endTime}
                                            onChange={(e) => setManualData({ ...manualData, endTime: e.target.value })}
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

                                <div className="space-y-1.5 col-span-2">
                                    <Label className="text-xs text-gray-500">Nome do contato fornecedor</Label>
                                    <Input
                                        placeholder="Nome"
                                        className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                                        value={manualData.contactName}
                                        onChange={(e) => setManualData({ ...manualData, contactName: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1.5 col-span-2">
                                    <Label className="text-xs text-gray-500">Contato do fornecedor</Label>
                                    <Input
                                        placeholder="+ DDD"
                                        className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                                        value={manualData.contactPhone}
                                        onChange={(e) => setManualData({ ...manualData, contactPhone: e.target.value })}
                                    />
                                </div>

                                <div className="col-span-2">
                                    <ParticipantsSelector
                                        value={visitGuests['visit-manual'] || []}
                                        onChange={(guests) => setVisitGuests(prev => ({ ...prev, 'visit-manual': guests }))}
                                        label="Convidados"
                                        title="Convidados Selecionados"
                                        subtitle="Visualizando seleção para visita"
                                        participantType="Convidado"
                                        emptyMessage="Nenhum convidado selecionado"
                                        groups={missionGroups}
                                        participants={missionTravelers}
                                    />
                                </div>

                                <div className="space-y-1.5 col-span-4">
                                    <Label className="text-xs text-gray-500">Descrição (opcional)</Label>
                                    <Input
                                        placeholder="Ex: dresscode social"
                                        className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                                        value={manualData.description}
                                        onChange={(e) => setManualData({ ...manualData, description: e.target.value })}
                                    />
                                </div>

                                <div className="col-span-4 border-t border-gray-100 pt-4 mb-4">
                                    <CostSelector
                                        costType={costType}
                                        setCostType={setCostType}
                                        price={manualData.price}
                                        setPrice={(price) => setManualData({ ...manualData, price })}
                                    />
                                </div>

                                <div className="col-span-4 flex items-center gap-2">
                                    <Checkbox
                                        id="manual-transfer"
                                        checked={hasTransfer}
                                        onCheckedChange={(checked) => setHasTransfer(checked as boolean)}
                                        className="w-5 h-5 rounded border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 shadow-none"
                                    />
                                    <Label htmlFor="manual-transfer" className="text-sm font-medium text-gray-900">Possuí transfer</Label>
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
                                            return
                                        }
                                        const events: any[] = [];
                                        const visitEvent = {
                                            id: initialData?.id || Math.random().toString(36).substr(2, 9),
                                            time: manualData.startTime,
                                            toTime: manualData.endTime,
                                            fromTime: manualData.startTime,
                                            date: manualData.date,
                                            type: 'visit',
                                            title: manualData.title || "Visita Manual",
                                            subtitle: manualData.description || "Visita",
                                            location: manualData.location || "Local Definido",
                                            status: costType as 'free' | 'confirmed' | 'quoting',
                                            price: costType === 'free' ? 'Sem custo' : (manualData.price || 'N/A'),
                                            duration: "2h",
                                            logos: [],
                                            notes: `Contato: ${manualData.contactName} - ${manualData.contactPhone}`,
                                            passengers: visitGuests['visit-manual'] || [],
                                            hasTransfer: hasTransfer
                                        };
                                        events.push(visitEvent);

                                        if (hasTransfer) {
                                            events.push({
                                                id: Math.random().toString(36).substr(2, 9),
                                                time: manualData.endTime,
                                                date: manualData.date,
                                                type: 'transfer',
                                                title: 'Transferência',
                                                subtitle: 'Transporte',
                                                location: manualData.location || manualData.title,
                                                driver: 'David Príncipe',
                                                duration: '1h 00 min',
                                                logos: [],
                                                status: 'confirmed'
                                            });
                                        }

                                        onSave(events);
                                    }}
                                >
                                    {initialData ? 'Salvar Alterações' : 'Adicionar Visita'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
