"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plane } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { airports } from "@/data/airports"

interface AirportSelectorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

export function AirportSelector({ value, onChange, placeholder = "Selecione um aeroporto..." }: AirportSelectorProps) {
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState("")

    const selectedAirport = airports.find((airport) => airport.code.toLowerCase() === value.toLowerCase())

    const filteredAirports = React.useMemo(() => {
        if (!search) return airports.slice(0, 50)

        const lowerSearch = search.toLowerCase()
        return airports
            .filter((airport) =>
                airport.code.toLowerCase().includes(lowerSearch) ||
                airport.city.toLowerCase().includes(lowerSearch) ||
                airport.name.toLowerCase().includes(lowerSearch)
            )
            .slice(0, 50)
    }, [search])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-12 bg-white border-gray-200 rounded-xl shadow-none font-normal text-base px-3"
                >
                    {selectedAirport ? (
                        <div className="flex items-center gap-2 overflow-hidden">
                            <span className="font-bold text-gray-900 shrink-0">{selectedAirport.code}</span>
                            <span className="text-gray-500 truncate text-sm">{selectedAirport.city}</span>
                        </div>
                    ) : (
                        <span className="text-gray-500">{placeholder}</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Buscar aeroporto..."
                        value={search}
                        onValueChange={setSearch}
                    />
                    <CommandList onWheel={(e) => e.stopPropagation()}>
                        {filteredAirports.length === 0 && (
                            <CommandEmpty>Nenhum aeroporto encontrado.</CommandEmpty>
                        )}
                        <CommandGroup>
                            {filteredAirports.map((airport) => (
                                <CommandItem
                                    key={airport.code}
                                    value={airport.code}
                                    onSelect={() => {
                                        onChange(airport.code.toLowerCase())
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value.toLowerCase() === airport.code.toLowerCase() ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold">{airport.code}</span>
                                            <span>{airport.city}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">{airport.name}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
