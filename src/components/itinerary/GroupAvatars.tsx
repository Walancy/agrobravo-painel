import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Event } from "@/types/itinerary"

interface GroupAvatarsProps {
    event: Event
    maxDisplay?: number
}

export function GroupAvatars({ event, maxDisplay = 3 }: GroupAvatarsProps) {
    // Only show group logos - no fake avatars
    if (event.groupLogos && event.groupLogos.length > 0) {
        return (
            <div className="flex -space-x-2">
                {event.groupLogos.slice(0, maxDisplay).map((logo, i) => (
                    <Avatar
                        key={i}
                        className="w-7 h-7 border-2 border-white shadow-sm hover:scale-110 transition-transform cursor-pointer"
                        title="Grupo participante"
                    >
                        <AvatarImage
                            src={logo}
                            alt="Logo do grupo"
                            className="object-cover"
                        />
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-semibold">
                            G
                        </AvatarFallback>
                    </Avatar>
                ))}
                {event.groupLogos.length > maxDisplay && (
                    <div
                        className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-white shadow-sm flex items-center justify-center text-[10px] font-bold text-white hover:scale-110 transition-transform cursor-pointer"
                        title={`+${event.groupLogos.length - maxDisplay} grupos`}
                    >
                        +{event.groupLogos.length - maxDisplay}
                    </div>
                )}
            </div>
        )
    }

    return null
}
