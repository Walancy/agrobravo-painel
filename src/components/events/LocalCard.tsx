import React from "react"
import { Star, MapPin, DollarSign } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface LocalCardProps {
    local: {
        title: string
        rating?: number
        reviews?: number
        price?: string
        type: string
        address: string
        description?: string
        thumbnail?: string
        place_id: string
    }
    index: number
    isFavorite?: boolean
    onToggleFavorite?: () => void
    isSelected?: boolean
    onSelect?: () => void
}

export default function LocalCard({
    local,
    index,
    isFavorite,
    onToggleFavorite,
    isSelected,
    onSelect
}: LocalCardProps) {
    return (
        <div
            className={`bg-white rounded-2xl p-5 border-2 transition-all cursor-pointer hover:shadow-md ${isSelected ? "border-blue-600 shadow-lg" : "border-gray-100"
                }`}
            onClick={() => onSelect?.()}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                    {local.thumbnail && (
                        <Avatar className="w-16 h-16 rounded-xl">
                            <AvatarImage src={local.thumbnail} className="object-cover" />
                            <AvatarFallback className="rounded-xl">{local.title[0]}</AvatarFallback>
                        </Avatar>
                    )}
                    <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 text-base leading-tight">{local.title}</h3>
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full shrink-0">
                                #{index}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{local.type}</p>
                        {local.description && (
                            <p className="text-xs text-gray-600 line-clamp-2">{local.description}</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {local.rating && (
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium text-gray-900">{local.rating}</span>
                            {local.reviews && (
                                <span className="text-xs text-gray-500">({local.reviews})</span>
                            )}
                        </div>
                    )}
                    {local.price && (
                        <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-gray-900">{local.price}</span>
                        </div>
                    )}
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
                    <Checkbox
                        className="w-6 h-6 rounded border-gray-300"
                        checked={isSelected}
                        onCheckedChange={() => onSelect?.()}
                    />
                </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-gray-600 line-clamp-2">{local.address}</span>
                </div>
            </div>
        </div>
    )
}
