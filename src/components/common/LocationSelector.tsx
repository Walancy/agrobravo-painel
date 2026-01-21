import * as React from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type City = string;
type State = {
    name: string;
    cities: City[];
};
type Country = {
    name: string;
    states: State[];
};

export const LOCATIONS_DATA: Record<string, State[]> = {
    "Brasil": [
        { name: "São Paulo", cities: ["São Paulo", "Campinas", "Santos", "Ribeirão Preto"] },
        { name: "Rio de Janeiro", cities: ["Rio de Janeiro", "Niterói", "Petrópolis"] },
        { name: "Minas Gerais", cities: ["Belo Horizonte", "Ouro Preto", "Uberlândia"] },
        { name: "Distrito Federal", cities: ["Brasília"] },
        { name: "Bahia", cities: ["Salvador", "Porto Seguro"] },
        { name: "Paraná", cities: ["Curitiba", "Foz do Iguaçu"] },
        { name: "Santa Catarina", cities: ["Florianópolis", "Balneário Camboriú"] },
    ],
    "EUA": [
        { name: "Nova York", cities: ["Nova York", "Buffalo"] },
        { name: "Flórida", cities: ["Miami", "Orlando", "Tampa"] },
        { name: "Califórnia", cities: ["Los Angeles", "San Francisco", "San Diego"] },
        { name: "Illinois", cities: ["Chicago"] },
        { name: "Nevada", cities: ["Las Vegas"] },
    ],
    "França": [
        { name: "Île-de-France", cities: ["Paris"] },
        { name: "Auvergne-Rhône-Alpes", cities: ["Lyon"] },
        { name: "Provence-Alpes-Côte d'Azur", cities: ["Nice", "Marselha"] },
    ],
    // Simplified for others
    "Itália": [{ name: "Lazio", cities: ["Roma"] }, { name: "Lombardia", cities: ["Milão"] }, { name: "Vêneto", cities: ["Veneza"] }, { name: "Toscana", cities: ["Florença"] }],
    "Japão": [{ name: "Tóquio", cities: ["Tóquio"] }, { name: "Osaka", cities: ["Osaka"] }, { name: "Quioto", cities: ["Kyoto"] }],
    "Reino Unido": [{ name: "Inglaterra", cities: ["Londres", "Manchester", "Liverpool"] }],
    "Espanha": [{ name: "Catalunha", cities: ["Barcelona"] }, { name: "Comunidade de Madrid", cities: ["Madrid"] }, { name: "Andaluzia", cities: ["Sevilha"] }],
    "Emirados Árabes": [{ name: "Dubai", cities: ["Dubai"] }, { name: "Abu Dhabi", cities: ["Abu Dhabi"] }],
    "Austrália": [{ name: "Nova Gales do Sul", cities: ["Sydney"] }, { name: "Victoria", cities: ["Melbourne"] }],
    "Holanda": [{ name: "Holanda do Norte", cities: ["Amsterdã"] }, { name: "Holanda do Sul", cities: ["Roterdã"] }],
    "Portugal": [{ name: "Lisboa", cities: ["Lisboa"] }, { name: "Porto", cities: ["Porto"] }],
    "Alemanha": [{ name: "Berlim", cities: ["Berlim"] }, { name: "Baviera", cities: ["Munique"] }, { name: "Hesse", cities: ["Frankfurt"] }],
    "Argentina": [{ name: "Buenos Aires", cities: ["Buenos Aires"] }, { name: "Mendoza", cities: ["Mendoza"] }],
}

interface LocationSelectorProps {
    country: string
    state: string
    city: string
    onCountryChange: (country: string) => void
    onStateChange: (state: string) => void
    onCityChange: (city: string) => void
    disabled?: boolean
}

export function LocationSelector({ country, state, city, onCountryChange, onStateChange, onCityChange, disabled }: LocationSelectorProps) {
    const handleCountryChange = (value: string) => {
        onCountryChange(value)
        onStateChange("")
        onCityChange("")
    }

    const handleStateChange = (value: string) => {
        onStateChange(value)
        onCityChange("")
    }

    const states = LOCATIONS_DATA[country] || []
    const selectedStateObj = states.find(s => s.name === state)
    const cities = selectedStateObj ? selectedStateObj.cities : []

    return (
        <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">País</Label>
                <Select value={country} onValueChange={handleCountryChange} disabled={disabled}>
                    <SelectTrigger className="w-full !h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none focus:ring-0 text-gray-900 text-left pl-4">
                        <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.keys(LOCATIONS_DATA).sort().map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">Estado</Label>
                <Select value={state} onValueChange={handleStateChange} disabled={!country || disabled}>
                    <SelectTrigger className="w-full !h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none focus:ring-0 text-gray-900 text-left pl-4">
                        <SelectValue placeholder={country ? "Selecione" : "-"} />
                    </SelectTrigger>
                    <SelectContent>
                        {states.sort((a, b) => a.name.localeCompare(b.name)).map((s) => (
                            <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">Cidade</Label>
                <Select value={city} onValueChange={onCityChange} disabled={!state || disabled}>
                    <SelectTrigger className="w-full !h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none focus:ring-0 text-gray-900 text-left pl-4">
                        <SelectValue placeholder={state ? "Selecione" : "-"} />
                    </SelectTrigger>
                    <SelectContent>
                        {cities.sort().map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
