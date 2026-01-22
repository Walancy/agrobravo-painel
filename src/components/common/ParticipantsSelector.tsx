
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ChevronDown, Users, Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface Participant {
    id: string
    name: string
    avatar: string
    group: string
    groupId?: string
    role?: string
}

// Removed mockParticipants definition

interface ParticipantsSelectorProps {
    value?: string[]
    onChange?: (value: string[]) => void
    participants?: Participant[]
    groups?: { id: string, name?: string, nome?: string, logo?: string | null }[]
    disabled?: boolean
    label?: string
    title?: string
    subtitle?: string
    participantType?: string
    emptyMessage?: string
    className?: string
}

export function ParticipantsSelector({
    value = [],
    onChange,
    participants = [],
    groups: passedGroups,
    disabled,
    label = "Participantes",
    title = "Participantes Selecionados",
    subtitle = "Visualizando seleção",
    participantType = "Participante",
    emptyMessage = "Nenhum participante encontrado",
    className,
    trigger,
    contentClassName,
    confirmMode = false
}: ParticipantsSelectorProps & { trigger?: React.ReactNode, contentClassName?: string, confirmMode?: boolean }) {
    const [searchTerm, setSearchTerm] = React.useState('')
    const [selectedGroup, setSelectedGroup] = React.useState('Todos')
    const [isOpen, setIsOpen] = React.useState(false)

    // Use internal state for both controlled (in confirmMode) and uncontrolled scenarios
    const [internalValue, setInternalValue] = React.useState<string[]>([])

    // If confirmMode is true, we use internalValue for rendering selections until confirmed.
    // If confirmMode is false, we use value (if provided) or internalValue (if uncontrolled).
    const selectedParticipants = confirmMode ? internalValue : (value || internalValue)

    console.log('ParticipantsSelector - value:', value);
    console.log('ParticipantsSelector - selectedParticipants:', selectedParticipants);
    console.log('ParticipantsSelector - participants:', participants);

    React.useEffect(() => {
        if (isOpen) {
            setInternalValue(value || [])
        }
    }, [isOpen]) // Only sync when opening to avoid resetting user selection on parent re-renders

    const handleSelectionChange = (newSelection: string[]) => {
        if (confirmMode) {
            setInternalValue(newSelection)
        } else {
            if (onChange) {
                onChange(newSelection)
            } else {
                setInternalValue(newSelection)
            }
        }
    }

    const handleConfirm = () => {
        if (onChange) onChange(internalValue)
        setIsOpen(false)
    }

    const handleCancel = () => {
        if (value) setInternalValue(value)
        setIsOpen(false)
    }

    const toggleParticipant = (id: string) => {
        if (disabled) return
        const newSelection = selectedParticipants.map(String).includes(String(id))
            ? selectedParticipants.filter(p => String(p) !== String(id))
            : [...selectedParticipants, id]
        handleSelectionChange(newSelection)
    }

    const toggleAll = () => {
        if (disabled) return
        const filtered = filteredParticipants
        const allSelected = filtered.every(p => selectedParticipants.includes(p.id))
        let newSelection: string[]

        if (allSelected) {
            // Deselect all filtered
            newSelection = selectedParticipants.filter(id => !filtered.find(p => p.id === id))
        } else {
            // Select all filtered
            const newIds = filtered.map(p => p.id)
            newSelection = [...new Set([...selectedParticipants, ...newIds])]
        }
        handleSelectionChange(newSelection)
    }

    const clearSelection = () => {
        if (disabled) return
        handleSelectionChange([])
    }

    const filteredParticipants = participants.filter(participant => {
        const matchesSearch = participant.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesGroup = selectedGroup === 'Todos' || participant.group === selectedGroup || participant.groupId === selectedGroup
        return matchesSearch && matchesGroup
    })

    const selectedNames = participants
        .filter(p => selectedParticipants.includes(p.id))
        .slice(0, 3)

    // Calculate if all filtered are selected (for potential select all checkbox if we wanted one)
    const allFilteredSelected = filteredParticipants.length > 0 && filteredParticipants.every(p => selectedParticipants.includes(p.id))

    return (
        <Popover open={isOpen} onOpenChange={disabled ? undefined : setIsOpen}>
            <PopoverTrigger asChild disabled={disabled}>
                {trigger ? (
                    trigger
                ) : (
                    <div className={`border border-gray-200 rounded-xl p-4 flex items-center justify-between cursor-pointer transition-colors bg-white ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'} ${className}`}>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                                {selectedParticipants.length}
                            </div>
                            <div className="text-left">
                                <p className="font-medium text-sm text-gray-900">{label}</p>
                                <p className="text-xs text-gray-500">
                                    {selectedParticipants.length} selecionado{selectedParticipants.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                    </div>
                )}
            </PopoverTrigger>
            <PopoverContent
                className={`p-0 ${contentClassName || 'w-[var(--radix-popover-trigger-width)]'}`}
                align="start"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <div className="p-4 border-b border-gray-100 space-y-3">
                    <div>
                        <h4 className="font-medium text-gray-900 text-sm mb-1">{title}</h4>
                        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
                    </div>

                    {/* Search & Select All */}
                    <div className="flex items-center gap-2">
                        <Checkbox
                            checked={allFilteredSelected}
                            onCheckedChange={toggleAll}
                            title="Selecionar todos filtrados"
                            className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 w-4 h-4 rounded shrink-0"
                        />
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <Input
                                placeholder="Buscar por nome ou grupo"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-8 pl-8 text-xs bg-gray-50 border-gray-200 rounded-lg shadow-none focus-visible:ring-1 focus-visible:ring-blue-600 w-full"
                            />
                        </div>
                    </div>

                    {/* Group Filter */}
                    {passedGroups && passedGroups.length > 0 && (
                        <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                            <SelectTrigger className="w-full h-9 text-xs bg-white border-gray-200 rounded-lg shadow-none focus:ring-1 focus:ring-blue-600">
                                <SelectValue placeholder="Filtrar por grupo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Todos">Todos os grupos</SelectItem>
                                {passedGroups.map(group => {
                                    const groupName = group.name || group.nome || 'Grupo sem nome'
                                    return (
                                        <SelectItem key={group.id} value={group.id}>
                                            <div className="flex items-center gap-2">
                                                {group.logo && (
                                                    <Avatar className="w-4 h-4">
                                                        <AvatarImage src={group.logo} />
                                                        <AvatarFallback>{groupName[0]}</AvatarFallback>
                                                    </Avatar>
                                                )}
                                                <span>{groupName}</span>
                                            </div>
                                        </SelectItem>
                                    )
                                })}
                            </SelectContent>
                        </Select>
                    )}
                </div>

                {/* Participants List */}
                <div
                    className="max-h-60 overflow-y-auto p-2 space-y-1"
                    onWheel={(e) => e.stopPropagation()}
                >
                    {filteredParticipants.length === 0 ? (
                        <div className="py-8 text-center text-xs text-gray-500">
                            {emptyMessage}
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filteredParticipants.map(participant => {
                                const isSelected = selectedParticipants.map(String).includes(String(participant.id))
                                return (
                                    <div
                                        key={participant.id}
                                        className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => toggleParticipant(participant.id)}
                                            className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 w-4 h-4 rounded"
                                        />
                                        <div
                                            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                                            onClick={() => toggleParticipant(participant.id)}
                                        >
                                            <Avatar className="w-8 h-8 border border-gray-100">
                                                <AvatarImage src={participant.avatar} />
                                                <AvatarFallback>{participant.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{participant.name}</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[10px] text-gray-500 truncate">{participant.group}</p>
                                                    <span className="bg-blue-50 text-blue-600 text-[10px] font-medium px-1.5 py-0.5 rounded">
                                                        {participant.role || participantType}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {confirmMode && (
                    <div className="p-3 border-t border-gray-100 flex justify-end gap-2 bg-gray-50 rounded-b-lg">
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
                )}
            </PopoverContent>
        </Popover>
    )
}
