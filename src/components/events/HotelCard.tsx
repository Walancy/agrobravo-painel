import * as React from "react"
import { Star, MapPin, ExternalLink, Users, Search, Wifi, Car, Coffee, Utensils, Check, ChevronDown, ChevronUp } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ParticipantsSelector, Participant } from "@/components/common/ParticipantsSelector"

interface HotelCardProps {
    hotel: {
        name: string
        property_token: string
        overall_rating?: number
        reviews?: number
        price?: string
        hotel_class?: number
        source?: string
        source_icon?: string
        link?: string
        thumbnail?: string
        images?: { thumbnail: string }[]
        description?: string
        gps_coordinates?: {
            latitude: number
            longitude: number
        }
        rate_per_night?: {
            lowest?: string
            extracted_lowest?: number
        }
        amenities?: string[]
    }
    index: number
    isFavorite: boolean
    onToggleFavorite: () => void
    isSelected: boolean
    onSelect: () => void
    participants?: Participant[]
    selectedGuests?: string[]
    onGuestsChange?: (guests: string[]) => void
    favorites: string[]
    groups?: any[]
}

export default function HotelCard({
    hotel,
    index,
    isFavorite,
    onToggleFavorite,
    isSelected,
    onSelect,
    participants = [],
    selectedGuests = [],
    onGuestsChange,
    favorites,
    groups = []
}: HotelCardProps) {
    const [isExpanded, setIsExpanded] = React.useState(false)

    const openGoogleMaps = () => {
        if (hotel.gps_coordinates) {
            const { latitude, longitude } = hotel.gps_coordinates
            window.open(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`, '_blank')
        }
    }

    const getAmenityIcon = (text: string) => {
        const lower = text.toLowerCase();
        if (lower.includes('wi-fi') || lower.includes('internet')) return <Wifi className="w-3 h-3" />;
        if (lower.includes('parking') || lower.includes('estacionamento')) return <Car className="w-3 h-3" />;
        if (lower.includes('breakfast') || lower.includes('café')) return <Coffee className="w-3 h-3" />;
        if (lower.includes('restaurant') || lower.includes('restaurante')) return <Utensils className="w-3 h-3" />;
        return <Check className="w-3 h-3" />;
    }



    return (
        <div
            onClick={onSelect}
            className={`bg-gray-50 rounded-2xl p-4 border transition-all cursor-pointer ${isSelected ? 'bg-blue-50/50 border-blue-200' : 'border-gray-100'}`}
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3 flex-1">
                    <Avatar className="w-16 h-16 rounded-xl border border-gray-100 shrink-0">
                        <AvatarImage src={hotel.thumbnail} className="object-cover" />
                        <AvatarFallback className="rounded-xl bg-gray-100 text-gray-500">{hotel.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 text-base leading-tight line-clamp-2">{hotel.name}</h3>
                            {hotel.hotel_class && (
                                <div className="flex items-center gap-0.5 bg-yellow-50 px-1.5 py-0.5 rounded shrink-0">
                                    {[...Array(Math.floor(Number(String(hotel.hotel_class).replace(/\D/g, ''))))].map((_, i) => (
                                        <Star key={i} className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-gray-500">
                            {hotel.overall_rating && (
                                <div className="flex items-center gap-1">
                                    <div className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
                                        {hotel.overall_rating.toFixed(1)}
                                    </div>
                                    <span className="font-medium text-gray-700">Excelente</span>
                                    <span className="text-gray-400">({hotel.reviews} avaliações)</span>
                                </div>
                            )}
                            {hotel.link && (
                                <a
                                    href={hotel.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex items-center gap-1 text-[10px] text-blue-600 hover:underline"
                                >
                                    Ver detalhes
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            )}
                        </div>

                        {hotel.source && (
                            <div className="flex items-center gap-2 mt-1.5">
                                {hotel.source_icon && (
                                    <img src={hotel.source_icon} alt={hotel.source} className="w-3 h-3 object-contain" />
                                )}
                                <span className="text-[10px] text-gray-400">{hotel.source}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-end gap-1 ml-4">
                    {(hotel.rate_per_night?.lowest || hotel.price) && (
                        <div className="text-right">
                            <span className="block font-bold text-blue-600 text-lg">
                                {hotel.rate_per_night?.lowest || hotel.price}
                            </span>
                            <span className="text-xs text-gray-400">/noite</span>
                        </div>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                        {hotel.gps_coordinates && (
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
                    <div className="flex items-center gap-3 text-[10px] text-gray-600 font-medium overflow-hidden whitespace-nowrap">
                        {hotel.amenities && hotel.amenities.length > 0 ? (
                            hotel.amenities.slice(0, 5).map((amenity, i) => (
                                <React.Fragment key={i}>
                                    <span className="flex items-center gap-1 shrink-0">
                                        {getAmenityIcon(amenity)} {amenity}
                                    </span>
                                    {i < Math.min(hotel.amenities!.length, 5) - 1 && <span className="w-0.5 h-0.5 bg-gray-300 rounded-full shrink-0" />}
                                </React.Fragment>
                            ))
                        ) : (
                            <span className="text-gray-400 italic text-xs">Sem informações de amenidades</span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">


                    {isSelected && (
                        <div onClick={(e) => e.stopPropagation()}>
                            <ParticipantsSelector
                                value={selectedGuests}
                                onChange={onGuestsChange}
                                participants={participants}
                                groups={groups}
                                label="Hóspedes"
                                title="Selecionar hóspedes"
                                subtitle="Selecione os hóspedes para este quarto"
                                participantType="Hóspede"
                                contentClassName="w-80"
                                confirmMode={true}
                                trigger={
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-8 text-xs font-medium px-3 shadow-sm transition-all">
                                        <Users className="w-3.5 h-3.5 mr-1.5" />
                                        Hóspedes: {selectedGuests.length}
                                    </Button>
                                }
                            />
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation()
                            setIsExpanded(!isExpanded)
                        }}
                        className="p-1 hover:bg-gray-100 rounded-md transition-colors text-gray-400 hover:text-gray-600"
                    >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
                    {hotel.description && (
                        <div className="mb-4">
                            <h4 className="text-xs font-semibold text-gray-900 mb-1">Sobre</h4>
                            <p className="text-xs text-gray-600 leading-relaxed">{hotel.description}</p>
                        </div>
                    )}

                    {hotel.amenities && hotel.amenities.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-xs font-semibold text-gray-900 mb-2">Comodidades</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {hotel.amenities.map((amenity, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                                        {getAmenityIcon(amenity)}
                                        <span>{amenity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {hotel.images && hotel.images.length > 0 && (
                        <div>
                            <h4 className="text-xs font-semibold text-gray-900 mb-2">Fotos</h4>
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">
                                {hotel.images.map((img, i) => (
                                    <img key={i} src={img.thumbnail} alt={hotel.name} className="w-20 h-20 object-cover rounded-lg border border-gray-100 shrink-0" />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
