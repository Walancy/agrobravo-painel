import * as React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ChevronDown } from "lucide-react"

interface Participant {
    id: string
    name: string
    avatar: string
    group: string
    role?: string
}

interface SelectedParticipantsSummaryProps {
    selectedIds: string[]
    participants: Participant[]
    label?: string
    placeholder?: string
}

export function SelectedParticipantsSummary({
    selectedIds = [],
    participants = [],
    label = "Participantes Selecionados",
    placeholder = "Nenhum participante selecionado"
}: SelectedParticipantsSummaryProps) {
    console.log('SelectedParticipantsSummary - selectedIds:', selectedIds);
    console.log('SelectedParticipantsSummary - participants:', participants);
    const selectedParticipants = participants.filter(p => selectedIds.map(String).includes(String(p.id)))
    console.log('SelectedParticipantsSummary - selectedParticipants:', selectedParticipants);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className="border border-gray-200 rounded-xl p-4 flex items-center justify-between cursor-pointer transition-colors bg-white hover:bg-gray-50">
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
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <div className="p-4 border-b border-gray-100">
                    <h4 className="font-medium text-gray-900 text-sm">{label}</h4>
                </div>
                <div className="max-h-60 overflow-y-auto p-2 space-y-1">
                    {selectedParticipants.length === 0 ? (
                        <div className="py-8 text-center text-xs text-gray-500">
                            {placeholder}
                        </div>
                    ) : (
                        selectedParticipants.map(participant => (
                            <div key={participant.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                <Avatar className="w-8 h-8 border border-gray-100">
                                    <AvatarImage src={participant.avatar} />
                                    <AvatarFallback>{participant.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{participant.name}</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-[10px] text-gray-500 truncate">{participant.group}</p>
                                        {participant.role && (
                                            <span className="bg-blue-50 text-blue-600 text-[10px] font-medium px-1.5 py-0.5 rounded">
                                                {participant.role}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}
