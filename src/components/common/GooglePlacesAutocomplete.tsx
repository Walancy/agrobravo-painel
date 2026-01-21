"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { MapPin, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface GooglePlacesAutocompleteProps {
    value: string
    onChange: (value: string) => void
    onPlaceSelect?: (place: any) => void
    placeholder?: string
    className?: string
}

export function GooglePlacesAutocomplete({
    value,
    onChange,
    onPlaceSelect,
    placeholder = "Buscar local...",
    className
}: GooglePlacesAutocompleteProps) {
    const [inputValue, setInputValue] = React.useState(value)
    const [predictions, setPredictions] = React.useState<any[]>([])
    const [showSuggestions, setShowSuggestions] = React.useState(false)
    const [isSearching, setIsSearching] = React.useState(false)

    const autocompleteService = React.useRef<any>(null)
    const placesService = React.useRef<any>(null)
    const sessionToken = React.useRef<any>(null)
    const containerRef = React.useRef<HTMLDivElement>(null)

    // Sincroniza valor externo
    React.useEffect(() => {
        setInputValue(value)
    }, [value])

    // Fecha ao clicar fora
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const initServices = React.useCallback(async () => {
        if (!(window as any).google || autocompleteService.current) return

        try {
            const { AutocompleteService, PlacesService, AutocompleteSessionToken } =
                await (window as any).google.maps.importLibrary("places") as any

            autocompleteService.current = new AutocompleteService()
            sessionToken.current = new AutocompleteSessionToken()
            // PlacesService precisa de um elemento HTML, mesmo que não usemos o mapa
            placesService.current = new PlacesService(document.createElement('div'))
        } catch (error) {
            console.error("Error loading Google Services:", error)
        }
    }, [])

    React.useEffect(() => {
        const loadGoogleMaps = async () => {
            if (typeof window === 'undefined') return
            if ((window as any).google?.maps?.importLibrary) {
                initServices()
                return
            }

            const script = document.createElement('script')
            script.innerHTML = `
                (g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"-"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=\`https://maps.\${c}apis.com/maps/api/js?\`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?(console.warn(p+" only loads once. Ignoring:",g),u()):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})({
                    key: "${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}",
                    v: "weekly",
                });
            `
            document.head.appendChild(script)

            const checkGoogle = setInterval(() => {
                if ((window as any).google?.maps?.importLibrary) {
                    clearInterval(checkGoogle)
                    initServices()
                }
            }, 100)
        }

        if (process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY) {
            loadGoogleMaps()
        }
    }, [initServices])

    const fetchPredictions = React.useMemo(
        () => {
            let timeoutId: NodeJS.Timeout
            return (input: string) => {
                if (timeoutId) clearTimeout(timeoutId)
                if (!input || input.length < 2) {
                    setPredictions([])
                    return
                }

                timeoutId = setTimeout(() => {
                    if (!autocompleteService.current) return
                    setIsSearching(true)
                    autocompleteService.current.getPlacePredictions(
                        {
                            input,
                            sessionToken: sessionToken.current,
                            types: ["geocode", "establishment"]
                        },
                        (results: any[], status: string) => {
                            setIsSearching(false)
                            if (status === "OK" && results) {
                                setPredictions(results)
                                setShowSuggestions(true)
                            } else {
                                setPredictions([])
                            }
                        }
                    )
                }, 300)
            }
        },
        []
    )

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setInputValue(val)
        onChange(val)
        fetchPredictions(val)
    }

    const handleSelectPrediction = (prediction: any) => {
        setInputValue(prediction.description)
        onChange(prediction.description)
        setShowSuggestions(false)

        if (placesService.current) {
            placesService.current.getDetails(
                {
                    placeId: prediction.place_id,
                    fields: ["formatted_address", "geometry", "name", "address_components"],
                    sessionToken: sessionToken.current
                },
                (place: any, status: string) => {
                    if (status === "OK" && place) {
                        if (onPlaceSelect) onPlaceSelect(place)
                        // Gera novo token para a próxima sessão de busca
                        sessionToken.current = new (window as any).google.maps.places.AutocompleteSessionToken()
                    }
                }
            )
        }
    }

    return (
        <div ref={containerRef} className={cn("relative w-full", className)}>
            {!process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-50 border border-red-200 rounded-xl z-10">
                    <p className="text-[10px] text-red-600 px-2 text-center">
                        Erro: API Key não configurada
                    </p>
                </div>
            )}

            <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={() => predictions.length > 0 && setShowSuggestions(true)}
                    placeholder={placeholder}
                    className="pl-11 h-12 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all shadow-none"
                    disabled={!process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}
                />
                {isSearching && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                    </div>
                )}
            </div>

            {/* Lista de Sugestões Estilizada */}
            {showSuggestions && predictions.length > 0 && (
                <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-black/5 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="py-2">
                        {predictions.map((p) => (
                            <button
                                key={p.place_id}
                                onClick={() => handleSelectPrediction(p)}
                                className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left group"
                            >
                                <div className="mt-0.5 p-1.5 bg-gray-100 rounded-lg group-hover:bg-white transition-colors">
                                    <MapPin className="w-3.5 h-3.5 text-gray-500" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-900 leading-tight">
                                        {p.structured_formatting.main_text}
                                    </span>
                                    <span className="text-[12px] text-gray-500 mt-0.5">
                                        {p.structured_formatting.secondary_text}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                    <div className="bg-gray-50/50 px-4 py-2 border-t border-gray-50 flex justify-end">
                        <img
                            src="https://maps.gstatic.com/mapfiles/api-3/images/powered-by-google-on-white3.png"
                            alt="Powered by Google"
                            className="h-3 opacity-50"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
