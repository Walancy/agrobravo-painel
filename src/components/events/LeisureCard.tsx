
import * as React from "react"
import { Star, MapPin, Search, Sun, Check, User, Camera, Users } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ParticipantsSelector } from "@/components/common/ParticipantsSelector"

export interface Participant {
    id: string
    name: string
    avatar: string
    group: string
}

interface LeisureCardProps {
    place: {
        title: string
        place_id: string
        rating?: number
        reviews?: number
        price?: string
        type?: string
        address?: string
        thumbnail?: string
        gps_coordinates?: {
            latitude: number
            longitude: number
        }
        description?: string
    }
    isFavorite: boolean
    onToggleFavorite: () => void
    isSelected: boolean
    onSelect: () => void
    participants?: Participant[]
    selectedGuests?: string[]
    onGuestsChange?: (guests: string[]) => void
    missionGroups?: any[]
    missionTravelers?: any[]
}

export default function LeisureCard({
    place,
    isFavorite,
    onToggleFavorite,
    isSelected,
    onSelect,
    participants = [],
    selectedGuests = [],
    onGuestsChange,
    missionGroups,
    missionTravelers
}: LeisureCardProps) {
    const openGoogleMaps = () => {
        if (place.gps_coordinates) {
            const { latitude, longitude } = place.gps_coordinates
            window.open(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`, '_blank')
        }
    }

    return (
        <div
            onClick={onSelect}
            className={`bg-gray-50 rounded-2xl p-4 border transition-all cursor-pointer ${isSelected ? 'bg-blue-50/50 border-blue-200' : 'border-gray-100'}`}
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3 flex-1">
                    <Avatar className="w-16 h-16 rounded-xl border border-gray-100 shrink-0">
                        <AvatarImage src={place.thumbnail} className="object-cover" />
                        <AvatarFallback className="rounded-xl bg-gray-100 text-gray-500">{place.title[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 text-base leading-tight line-clamp-2">{place.title}</h3>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-gray-500">
                            {place.rating && (
                                <div className="flex items-center gap-1">
                                    <div className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
                                        {place.rating}
                                    </div>
                                    <span className="font-medium text-gray-700">Avaliação</span>
                                    <span className="text-gray-400">({place.reviews} reviews)</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] text-gray-500">{place.type || 'Lazer'}</span>
                            {place.price && (
                                <>
                                    <span className="w-0.5 h-0.5 bg-gray-300 rounded-full" />
                                    <span className="text-[10px] text-gray-900 font-medium">{place.price}</span>
                                </>
                            )}
                        </div>
                        {place.address && (
                            <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{place.address}</p>
                        )}
                        {place.description && (
                            <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{place.description}</p>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-end gap-1 ml-4">
                    <div className="flex items-center gap-2 mt-2">
                        {place.gps_coordinates && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    openGoogleMaps()
                                }}
                                className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 transition-colors"
                                title="Ver no Google Maps"
                            >
                                <MapPin className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation()
                                onToggleFavorite?.()
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

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-3 flex-1 mr-4 overflow-hidden">
                    <div className="flex items-center gap-2 text-[10px] text-gray-600 font-medium overflow-hidden whitespace-nowrap">
                        <Sun className="w-3 h-3 text-blue-500" />
                        <span>Atividade de Lazer / Livre</span>
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    {isSelected && (
                        <div onClick={(e) => e.stopPropagation()}>
                            <ParticipantsSelector
                                value={selectedGuests}
                                onChange={(guests) => onGuestsChange?.(guests)}
                                participants={missionTravelers?.map(t => ({
                                    id: t.id,
                                    name: t.name,
                                    avatar: t.photo || t.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=random`,
                                    group: missionGroups?.find(g => g.id === t.group_id || g.id === t.groupId)?.nome || 'Sem grupo',
                                    role: t.role || 'Convidado'
                                })) || []}
                                label="Convidados"
                                title="Selecionar participantes"
                                subtitle="Selecione quem irá nesta atividade"
                                participantType="Convidado"
                                emptyMessage="Nenhum participante encontrado"
                                confirmMode={true}
                                groups={missionGroups}
                                contentClassName="w-80"
                                trigger={
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-8 text-xs font-medium px-3 shadow-sm transition-all">
                                        <Users className="w-3.5 h-3.5 mr-1.5" />
                                        Convidados: {selectedGuests.length}
                                    </Button>
                                }
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
