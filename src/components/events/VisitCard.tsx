import * as React from "react"
import { Star, MapPin, Users, Phone, Globe, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ParticipantsSelector } from "@/components/common/ParticipantsSelector"

interface VisitCardProps {
    event: {
        title: string
        address?: string
        location?: string
        thumbnail?: string
        place_id?: string
        type?: string
        link?: string
        rating?: number
        reviews?: number
        phone?: string
        website?: string
        open_state?: string
    }
    eventId: string
    index: number
    isFavorite: boolean
    onToggleFavorite: () => void
    isSelected: boolean
    onSelect: () => void
    selectedGuests?: string[]
    onGuestsChange?: (guests: string[]) => void
    missionGroups?: any[]
    missionTravelers?: any[]
}

export default function VisitCard({
    event,
    eventId,
    index,
    isFavorite,
    onToggleFavorite,
    isSelected,
    onSelect,
    selectedGuests = [],
    onGuestsChange,
    missionGroups,
    missionTravelers
}: VisitCardProps) {

    return (
        <div
            onClick={onSelect}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${isSelected ? 'bg-blue-50/50 border-blue-200' : 'bg-gray-50 border-transparent hover:border-gray-200'}`}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    {event.thumbnail ? (
                        <img src={event.thumbnail} alt={event.title} className="w-16 h-16 rounded-xl object-cover border border-gray-100" />
                    ) : (
                        <div className="w-16 h-16 bg-white rounded-xl border border-gray-100 flex items-center justify-center text-blue-600 shrink-0">
                            <MapPin className="w-8 h-8" />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 block mb-0.5">{event.type || 'Visita'}</span>
                            {event.rating && (
                                <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    <span className="text-xs font-medium text-gray-700">{event.rating}</span>
                                    <span className="text-[10px] text-gray-400">({event.reviews})</span>
                                </div>
                            )}
                        </div>
                        <h4 className="font-semibold text-gray-900 text-base leading-tight line-clamp-1">{event.title}</h4>
                        <div className="flex flex-col gap-1 mt-1">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                <MapPin className="w-3 h-3 shrink-0" />
                                <span className="truncate">{event.address || event.location || 'Local não informado'}</span>
                            </div>

                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                {event.open_state && (
                                    <div className="flex items-center gap-1 text-green-600 font-medium">
                                        <Clock className="w-3 h-3" />
                                        <span>{event.open_state}</span>
                                    </div>
                                )}
                                {event.phone && (
                                    <div className="flex items-center gap-1">
                                        <Phone className="w-3 h-3" />
                                        <span className="truncate max-w-[100px]">{event.phone}</span>
                                    </div>
                                )}
                                {event.website && (
                                    <a
                                        href={event.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex items-center gap-1 text-blue-600 hover:underline"
                                    >
                                        <Globe className="w-3 h-3" />
                                        <span>Site</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2 ml-4">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation()
                                onToggleFavorite()
                            }}
                            className="p-1.5 hover:bg-yellow-50 rounded-lg transition-colors"
                        >
                            <Star
                                className={`w-5 h-5 ${isFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-400"}`}
                            />
                        </button>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'border-blue-600' : 'border-gray-300'}`}>
                            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer with Guests Button when Selected */}
            {isSelected && (
                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                    <div onClick={(e) => e.stopPropagation()} className="w-full">
                        <ParticipantsSelector
                            value={selectedGuests}
                            onChange={onGuestsChange}
                            groups={missionGroups?.map(g => ({ id: g.id, name: g.nome, logo: g.logo }))}
                            participants={missionTravelers?.map(t => ({
                                id: t.id,
                                name: t.name,
                                avatar: t.photo || t.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=random`,
                                group: missionGroups?.find(g => g.id === t.group_id || g.id === t.groupId)?.nome || 'Sem grupo',
                                groupId: t.group_id || t.groupId,
                                role: t.role || 'Convidado'
                            }))}
                            title="Selecionar Convidados"
                            subtitle="Selecione os convidados para esta visita"
                            participantType="Convidado"
                            confirmMode={true}
                            contentClassName="w-80"
                            trigger={
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-8 text-xs font-medium px-3 shadow-sm transition-all">
                                    <Users className="w-3.5 h-3.5 mr-1.5" />
                                    Convidados: {selectedGuests.length}
                                </Button>
                            }
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
