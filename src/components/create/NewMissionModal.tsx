"use client"

import * as React from "react"
import { X, Upload, CalendarIcon, Check, XCircle, ChevronDown, Search } from "lucide-react"


import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogClose,
    DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

interface NewMissionModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: (data: any) => void
}

const DOCUMENTS_LIST = [
    "Passaporte",
    "Visto",
    "Vacinas",
    "Seguros",
    "Carteira de motorista",
    "Autorização dos pais (para menores)",
]

const REGIONS_LIST = [
    "África",
    "América Central",
    "América do Norte",
    "América do Sul",
    "Ásia",
    "Caribe",
    "Europa",
    "Oceania",
    "Oriente Médio",
]

const COUNTRIES_BY_REGION: Record<string, string[]> = {
    "África": [
        "África do Sul", "Angola", "Argélia", "Benin", "Botsuana", "Burkina Faso", "Burundi", "Camarões", "Cabo Verde",
        "Chade", "Comores", "Congo", "Costa do Marfim", "Egito", "Eritreia", "Etiópia", "Gabão", "Gana", "Guiné", "Guiné-Bissau",
        "Guiné Equatorial", "Lesoto", "Libéria", "Líbia", "Madagascar", "Malawi", "Mali", "Marrocos", "Maurício", "Mauritânia",
        "Moçambique", "Namíbia", "Níger", "Nigéria", "Quênia", "República Centro-Africana", "República Democrática do Congo",
        "Ruanda", "São Tomé e Príncipe", "Senegal", "Serra Leoa", "Seychelles", "Somália", "Suazilândia", "Sudão", "Sudão do Sul",
        "Tanzânia", "Togo", "Tunísia", "Uganda", "Zâmbia", "Zimbábue"
    ],
    "América Central": [
        "Belize", "Costa Rica", "El Salvador", "Guatemala", "Honduras", "Nicarágua", "Panamá"
    ],
    "América do Norte": [
        "Canadá", "Estados Unidos", "México"
    ],
    "América do Sul": [
        "Argentina", "Bolívia", "Brasil", "Chile", "Colômbia", "Equador", "Guiana", "Paraguai", "Peru", "Suriname", "Uruguai", "Venezuela"
    ],
    "Ásia": [
        "Afeganistão", "Bangladesh", "Brunei", "Butão", "Camboja", "China", "Coreia do Norte", "Coreia do Sul", "Filipinas",
        "Índia", "Indonésia", "Japão", "Laos", "Malásia", "Maldivas", "Mongólia", "Myanmar", "Nepal", "Paquistão", "Cazaquistão",
        "Quirguistão", "Singapura", "Sri Lanka", "Tajiquistão", "Tailândia", "Timor-Leste", "Turcomenistão", "Uzbequistão", "Vietnã"
    ],
    "Caribe": [
        "Antígua e Barbuda", "Bahamas", "Barbados", "Cuba", "Dominica", "Granada", "Haiti", "Jamaica", "República Dominicana",
        "Santa Lúcia", "São Cristóvão e Neves", "São Vicente e Granadinas", "Trinidad e Tobago"
    ],
    "Europa": [
        "Albânia", "Alemanha", "Andorra", "Armênia", "Áustria", "Azerbaijão", "Bélgica", "Bielorrússia", "Bósnia e Herzegovina",
        "Bulgária", "Chipre", "Croácia", "Dinamarca", "Eslováquia", "Eslovênia", "Espanha", "Estônia", "Finlândia", "França",
        "Geórgia", "Grécia", "Hungria", "Irlanda", "Islândia", "Itália", "Kosovo", "Letônia", "Liechtenstein", "Lituânia",
        "Luxemburgo", "Macedônia do Norte", "Malta", "Moldávia", "Mônaco", "Montenegro", "Noruega", "Países Baixos", "Polônia",
        "Portugal", "Reino Unido", "República Checa", "Romênia", "Rússia", "San Marino", "Sérvia", "Suécia", "Suíça", "Turquia",
        "Ucrânia", "Vaticano"
    ],
    "Oceania": [
        "Austrália", "Fiji", "Ilhas Marshall", "Ilhas Salomão", "Kiribati", "Micronésia", "Nauru", "Nova Zelândia", "Palau",
        "Papua Nova Guiné", "Samoa", "Tonga", "Tuvalu", "Vanuatu"
    ],
    "Oriente Médio": [
        "Arábia Saudita", "Bahrein", "Catar", "Emirados Árabes Unidos", "Iêmen", "Irã", "Iraque", "Israel", "Jordânia", "Kuwait",
        "Líbano", "Omã", "Síria", "Palestina"
    ],
}

export function NewMissionModal({ open, onOpenChange, onSave }: NewMissionModalProps) {
    // List State
    const [countriesList, setCountriesList] = React.useState<any[]>([])
    const [isLoadingCountries, setIsLoadingCountries] = React.useState(false)

    // Form State
    const [name, setName] = React.useState("")
    const [region, setRegion] = React.useState("")
    const [selectedCountries, setSelectedCountries] = React.useState<number[]>([]) // Changed to store IDs
    const [searchTerm, setSearchTerm] = React.useState("")
    const [startDate, setStartDate] = React.useState<Date>()
    const [endDate, setEndDate] = React.useState<Date>()
    const [selectedDocuments, setSelectedDocuments] = React.useState<string[]>([])
    const [observations, setObservations] = React.useState("")
    const [logo, setLogo] = React.useState<File | null>(null)
    const [isDragging, setIsDragging] = React.useState(false)

    // Fetch countries on mount
    React.useEffect(() => {
        const loadCountries = async () => {
            setIsLoadingCountries(true)
            try {
                const { countriesService } = await import("@/services/countriesService")
                const data = await countriesService.getAllCountries()
                setCountriesList(data)
            } catch (error) {
                console.error("Error loading countries:", error)
            } finally {
                setIsLoadingCountries(false)
            }
        }
        loadCountries()
    }, [])

    // Reset state when modal opens
    React.useEffect(() => {
        if (open) {
            setName("")
            setRegion("")
            setSelectedCountries([])
            setSearchTerm("")
            setStartDate(undefined)
            setEndDate(undefined)
            setSelectedDocuments([])
            setObservations("")
            setLogo(null)
        }
    }, [open])

    const isValid = name && region && selectedCountries.length > 0 && startDate && endDate && selectedDocuments.length > 0

    const getCountriesByRegion = (regionName: string) => {
        return countriesList.filter(c => c.continente === regionName)
    }

    const handleSave = () => {
        if (!isValid) return
        onSave({
            name,
            region,
            countries: selectedCountries, // IDs
            startDate,
            endDate,
            documents: selectedDocuments,
            observations,
            logo,
        })
        onOpenChange(false)
    }

    const toggleDocument = (doc: string) => {
        setSelectedDocuments((prev) =>
            prev.includes(doc)
                ? prev.filter((d) => d !== doc)
                : [...prev, doc]
        )
    }

    const toggleCountry = (countryId: number) => {
        setSelectedCountries((prev) =>
            prev.includes(countryId)
                ? prev.filter((c) => c !== countryId)
                : [...prev, countryId]
        )
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setLogo(e.dataTransfer.files[0])
        }
    }

    // File input handler for click
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const handleFileClick = () => {
        fileInputRef.current?.click()
    }
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setLogo(e.target.files[0])
        }
    }

    const removeLogo = (e: React.MouseEvent) => {
        e.stopPropagation()
        setLogo(null)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                aria-describedby={undefined}
                overlayClassName="!animate-none !duration-0 !transition-none"
                className="w-[98vw] max-w-[1400px] p-0 overflow-hidden gap-0 bg-white [&>button]:hidden !animate-none !duration-0 !transition-none"
            >
                {/* Header */}
                <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white">
                    <div>
                        <DialogTitle className="text-lg font-semibold text-gray-900">Nova missão</DialogTitle>
                        <DialogDescription className="text-xs text-gray-500">Defina os dados principais da missão</DialogDescription>
                    </div>
                    <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </DialogClose>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-1.5">
                        <Label className="text-xs text-gray-500">Nome da missão<span className="text-red-500">*</span></Label>
                        <Input
                            placeholder="Informe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none focus-visible:ring-blue-600"
                        />
                    </div>

                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-3 space-y-1.5">
                            <Label className="text-xs text-gray-500">Região<span className="text-red-500">*</span></Label>
                            <Select
                                value={region}
                                onValueChange={(val) => {
                                    setRegion(val)
                                    setSelectedCountries([])
                                    setSearchTerm("")
                                }}
                            >
                                <SelectTrigger className="w-full !h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none">
                                    <SelectValue placeholder="Selecione uma região" />
                                </SelectTrigger>
                                <SelectContent className="max-h-60">
                                    {REGIONS_LIST.map((r) => (
                                        <SelectItem key={r} value={r}>{r}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="col-span-3 space-y-1.5">
                            <Label className="text-xs text-gray-500">Países a visitar<span className="text-red-500">*</span></Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full h-12 justify-between text-left font-normal bg-gray-50 border-gray-200 rounded-xl shadow-none hover:bg-gray-100 px-3"
                                        disabled={!region}
                                    >
                                        <span className={cn("text-xs truncate", (!region || selectedCountries.length === 0) && "text-muted-foreground")}>
                                            {!region
                                                ? "Selecione a região primeiro"
                                                : selectedCountries.length > 0
                                                    ? `${selectedCountries.length} selecionado(s)`
                                                    : <span className="text-gray-500 text-sm">Selecione</span>
                                            }
                                        </span>
                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                                    <div className="p-2 border-b sticky top-0 bg-white z-10">
                                        <div className="relative">
                                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                placeholder="Buscar país..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-8 h-9 text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="max-h-60 overflow-y-auto" onWheel={(e) => e.stopPropagation()}>
                                        <div className="p-2 space-y-1">
                                            {getCountriesByRegion(region)
                                                ?.filter(c => c.pais.toLowerCase().includes(searchTerm.toLowerCase()))
                                                .map((c) => (
                                                    <div
                                                        key={c.id}
                                                        className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md cursor-pointer"
                                                        onClick={() => toggleCountry(c.id)}
                                                    >
                                                        <Checkbox
                                                            id={String(c.id)}
                                                            checked={selectedCountries.includes(c.id)}
                                                            onCheckedChange={() => toggleCountry(c.id)}
                                                        />
                                                        <label
                                                            htmlFor={String(c.id)}
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer w-full"
                                                        >
                                                            {c.pais}
                                                        </label>
                                                    </div>
                                                ))}
                                            {region && getCountriesByRegion(region)?.filter(c => c.pais.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                                                <div className="p-4 text-center text-sm text-gray-500">
                                                    Nenhum país encontrado.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                            {/* Selected Countries Tags (Only if needed, for now hidden inside dropdown count, but user asked for multi select. Might want tags?) */}
                            {/* User asked for checkboxes to select more than 1. Similar to documents. Tags would be nice. */}
                            {selectedCountries.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {selectedCountries.map((cId) => {
                                        const country = countriesList.find(c => c.id === cId)
                                        if (!country) return null
                                        return (
                                            <Badge key={cId} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md py-1 px-2 gap-1 font-normal text-xs">
                                                {country.pais}
                                                <span
                                                    role="button"
                                                    className="cursor-pointer hover:text-blue-900 flex items-center justify-center"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        toggleCountry(cId)
                                                    }}
                                                >
                                                    <X className="h-3 w-3" />
                                                </span>
                                            </Badge>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="col-span-3 space-y-1.5">
                            <Label className="text-xs text-gray-500">Data de inicio<span className="text-red-500">*</span></Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full h-12 justify-between text-left font-normal rounded-xl bg-gray-50 border-gray-200 shadow-none hover:bg-gray-100 px-3 text-sm",
                                            !startDate && "text-gray-500"
                                        )}
                                    >
                                        {startDate ? format(startDate, "dd/MM/yyyy") : <span>--/--/----</span>}
                                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={startDate}
                                        onSelect={setStartDate}
                                        initialFocus
                                        locale={ptBR}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="col-span-3 space-y-1.5">
                            <Label className="text-xs text-gray-500">Data de fim<span className="text-red-500">*</span></Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full h-12 justify-between text-left font-normal rounded-xl bg-gray-50 border-gray-200 shadow-none hover:bg-gray-100 px-3 text-sm",
                                            !endDate && "text-gray-500"
                                        )}
                                    >
                                        {endDate ? format(endDate, "dd/MM/yyyy") : <span>--/--/----</span>}
                                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={endDate}
                                        onSelect={setEndDate}
                                        initialFocus
                                        locale={ptBR}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {/* Second Row: Documents & Observations */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs text-gray-500">Documentos obrigatórios<span className="text-red-500">*</span></Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full h-12 justify-between text-left font-normal bg-gray-50 border-gray-200 rounded-xl shadow-none hover:bg-gray-100 px-3"
                                    >
                                        <span className={cn("text-xs truncate", selectedDocuments.length === 0 && "text-muted-foreground")}>
                                            {selectedDocuments.length > 0
                                                ? `${selectedDocuments.length} selecionado(s)`
                                                : <span className="text-gray-500 text-sm">Selecione pelo menos um documento</span>}
                                        </span>
                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                                    <div className="max-h-60 overflow-y-auto" onWheel={(e) => e.stopPropagation()}>
                                        <div className="p-2 space-y-1">
                                            {DOCUMENTS_LIST.map((doc) => (
                                                <div
                                                    key={doc}
                                                    className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md cursor-pointer"
                                                    onClick={() => toggleDocument(doc)}
                                                >
                                                    <Checkbox
                                                        id={doc}
                                                        checked={selectedDocuments.includes(doc)}
                                                        onCheckedChange={() => toggleDocument(doc)}
                                                    />
                                                    <label
                                                        htmlFor={doc}
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer w-full"
                                                    >
                                                        {doc}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                            {/* Selected Tags */}
                            <div className="flex flex-wrap gap-2 mt-2">
                                {selectedDocuments.map((doc) => (
                                    <Badge key={doc} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md py-1 px-2 gap-1 font-normal">
                                        {doc}
                                        <span
                                            role="button"
                                            className="cursor-pointer hover:text-blue-900 flex items-center justify-center"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                toggleDocument(doc)
                                            }}
                                        >
                                            <X className="h-3 w-3" />
                                        </span>
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs text-gray-500">Observações</Label>
                            <Input
                                placeholder="Informações adicionais da missão (opcional)"
                                value={observations}
                                onChange={(e) => setObservations(e.target.value)}
                                className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                            />
                        </div>
                    </div>

                    {/* Logo Upload - Drag & Drop */}
                    <div className="space-y-1.5">
                        {/* Hidden Input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />

                        {!logo ? (
                            <div
                                className={cn(
                                    "flex items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-colors",
                                    isDragging ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                                )}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={handleFileClick}
                            >
                                <div className="flex flex-col items-center gap-2 text-gray-500">
                                    <Upload className={cn("w-8 h-8", isDragging ? "text-blue-500" : "text-gray-400")} />
                                    <div className="text-sm font-medium">
                                        Arraste o logo aqui ou <span className="text-blue-600">clique para selecionar</span>
                                    </div>
                                    <div className="text-xs text-gray-400">PNG, JPG (máx. 5MB)</div>
                                </div>
                            </div>
                        ) : (
                            <div className="relative flex items-center justify-center w-full h-40 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden group">
                                <img
                                    src={URL.createObjectURL(logo)}
                                    alt="Logo preview"
                                    className="h-full object-contain"
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded">
                                        {(logo.size / 1024).toFixed(0)} KB
                                    </span>
                                </div>
                                <button
                                    onClick={removeLogo}
                                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-gray-100 text-gray-500 z-10"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 pt-2 flex gap-3">
                    <Button
                        variant="outline"
                        className="flex-1 h-12 rounded-xl text-gray-700 font-medium border-gray-200 hover:bg-gray-50"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancelar
                    </Button>
                    <Button
                        className={cn(
                            "flex-1 h-12 rounded-xl text-white font-medium transition-colors",
                            isValid ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-200 text-gray-400 cursor-not-allowed hover:bg-gray-200"
                        )}
                        onClick={handleSave}
                        disabled={!isValid}
                    >
                        Salvar Missão
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
