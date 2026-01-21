"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { X, Save, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { guidesService } from "@/services/guidesService"
import { collaboratorsService } from "@/services/collaboratorsService"
import { Loader2 } from "lucide-react"
import { maskCPF, maskPhone, maskCEP, validateEmail } from "@/lib/form-utils"

interface GuideFormProps {
    guideId?: string
}

export function GuideForm({ guideId }: GuideFormProps) {
    // Form component for creating/editing guides with proper spacing
    const router = useRouter()
    const [profileImage, setProfileImage] = React.useState<string | null>(null)
    const [errors, setErrors] = React.useState<Record<string, string>>({})

    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        document: '',
        phone: '',
        accessLevel: '',
        guideType: '',
        nationality: '',
        languages: '',
        englishLevel: '',
        city: '',
        state: '',
        cep: '',
        street: '',
        neighborhood: '',
        number: '',
        complement: '',
        observations: ''
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target
        let formattedValue = value

        if (id === 'cep') {
            formattedValue = maskCEP(value)
        } else if (id === 'phone') {
            formattedValue = maskPhone(value)
        } else if (id === 'document') {
            formattedValue = maskCPF(value)
        }

        setFormData(prev => ({ ...prev, [id]: formattedValue }))

        // Clear error when user types
        if (errors[id]) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[id]
                return newErrors
            })
        }
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.name.trim()) newErrors.name = "Nome é obrigatório"
        if (!formData.email.trim()) {
            newErrors.email = "E-mail é obrigatório"
        } else if (!validateEmail(formData.email)) {
            newErrors.email = "E-mail inválido"
        }
        if (!formData.document.trim()) newErrors.document = "CPF é obrigatório"
        if (formData.document.replace(/\D/g, '').length !== 11) newErrors.document = "CPF incompleto"
        if (!formData.phone.trim()) newErrors.phone = "Telefone é obrigatório"
        if (!formData.accessLevel) newErrors.accessLevel = "Nível de acesso é obrigatório"
        if (!formData.guideType) newErrors.guideType = "Tipo de guia é obrigatório"

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSelectChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
            })
        }
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setProfileImage(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleCancel = () => {
        router.push("/guias")
    }

    const [isSaving, setIsSaving] = React.useState(false)
    const [isFetching, setIsFetching] = React.useState(!!guideId)

    React.useEffect(() => {
        const fetchGuideData = async () => {
            if (!guideId) return
            try {
                setIsFetching(true)
                const data = await guidesService.getGuideById(guideId)
                setFormData(data)
                if (data.photo) setProfileImage(data.photo)
            } catch (error) {
                console.error("Failed to fetch guide data:", error)
                alert("Erro ao carregar dados do guia.")
            } finally {
                setIsFetching(false)
            }
        }

        fetchGuideData()
    }, [guideId])

    // Check if email exists
    React.useEffect(() => {
        const checkEmail = async () => {
            if (!formData.email || !validateEmail(formData.email)) return

            // If editing, don't check
            if (guideId) return

            try {
                const exists = await collaboratorsService.checkEmailExists(formData.email)
                if (exists) {
                    setErrors(prev => ({ ...prev, email: "Este e-mail já está em uso" }))
                }
            } catch (error) {
                console.error("Error checking email:", error)
            }
        }

        const timer = setTimeout(checkEmail, 500)
        return () => clearTimeout(timer)
    }, [formData.email, guideId])

    const handleSave = async () => {
        if (!validateForm()) return

        try {
            setIsSaving(true)
            console.log("Saving data:", formData)

            if (guideId) {
                await guidesService.updateGuide(guideId, {
                    ...formData,
                    photo: profileImage
                })
            } else {
                await guidesService.createGuide({
                    ...formData,
                    photo: profileImage
                })
            }

            router.push("/guias")
        } catch (error) {
            console.error("Failed to save guide:", error)
            alert("Erro ao salvar guia. Por favor, tente novamente.")
        } finally {
            setIsSaving(false)
        }
    }

    if (isFetching) {
        return (
            <div className="flex items-center justify-center h-full bg-white rounded-xl">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-white rounded-xl">
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4">
                <h1 className="text-xl font-semibold text-gray-900">
                    {guideId ? "Editar guia" : "Cadastrar novo guia"}
                </h1>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div>
                    {/* Dados Básicos */}
                    <div>
                        <h2 className="text-sm font-semibold text-gray-900 mb-4">Dados básicos</h2>
                        {/* First row - 5 columns */}
                        <div className="flex gap-4 mb-4">
                            <div className="flex-1">
                                <Label htmlFor="name" className="text-xs text-gray-500 mb-1.5 block">
                                    Nome completo*
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="Digite o nome"
                                    className={cn(
                                        "h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none focus-visible:ring-blue-600 w-full",
                                        errors.name && "border-red-500 focus-visible:ring-red-500"
                                    )}
                                    maxLength={100}
                                    value={formData.name}
                                    onChange={handleInputChange}
                                />
                                {errors.name && <span className="text-[10px] text-red-500 mt-1">{errors.name}</span>}
                            </div>

                            <div className="flex-[2] min-w-[220px]">
                                <Label htmlFor="email" className="text-xs text-gray-500 mb-1.5 block">
                                    E-mail*
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Digite o e-mail"
                                    className={cn(
                                        "h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none focus-visible:ring-blue-600 w-full",
                                        errors.email && "border-red-500 focus-visible:ring-red-500"
                                    )}
                                    maxLength={100}
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />
                                {errors.email && <span className="text-[10px] text-red-500 mt-1">{errors.email}</span>}
                            </div>

                            <div className="w-[160px]">
                                <Label htmlFor="document" className="text-xs text-gray-500 mb-1.5 block">
                                    Doc. number
                                </Label>
                                <Input
                                    id="document"
                                    placeholder="Ex: CPF,RG..."
                                    className={cn(
                                        "h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none focus-visible:ring-blue-600 w-full",
                                        errors.document && "border-red-500 focus-visible:ring-red-500"
                                    )}
                                    maxLength={14}
                                    value={formData.document}
                                    onChange={handleInputChange}
                                />
                                {errors.document && <span className="text-[10px] text-red-500 mt-1">{errors.document}</span>}
                            </div>

                            <div className="w-[180px]">
                                <Label htmlFor="phone" className="text-xs text-gray-500 mb-1.5 block">
                                    Telefone*
                                </Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="+__(__) ____-____"
                                    className={cn(
                                        "h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none focus-visible:ring-blue-600 w-full",
                                        errors.phone && "border-red-500 focus-visible:ring-red-500"
                                    )}
                                    maxLength={15}
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                />
                                {errors.phone && <span className="text-[10px] text-red-500 mt-1">{errors.phone}</span>}
                            </div>

                            <div className="w-[240px]">
                                <Label htmlFor="access-level" className="text-xs text-gray-500 mb-1.5 block">
                                    Nível de acesso*
                                </Label>
                                <Select value={formData.accessLevel} onValueChange={(val) => handleSelectChange('accessLevel', val)}>
                                    <SelectTrigger id="access-level" className={cn(
                                        "h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none focus-visible:ring-blue-600 w-full",
                                        errors.accessLevel && "border-red-500 focus-visible:ring-red-500"
                                    )}>
                                        <SelectValue placeholder="Gerenciar usuários, editar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Administrador</SelectItem>
                                        <SelectItem value="manager">Gerenciar usuários, editar</SelectItem>
                                        <SelectItem value="viewer">Visualizador</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.accessLevel && <span className="text-[10px] text-red-500 mt-1">{errors.accessLevel}</span>}
                            </div>
                        </div>

                        {/* Second row - 4 columns */}
                        <div className="flex gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <Label htmlFor="guide-type" className="text-xs text-gray-500 mb-1.5 block">
                                    Tipo de guia*
                                </Label>
                                <Select value={formData.guideType} onValueChange={(val) => handleSelectChange('guideType', val)}>
                                    <SelectTrigger id="guide-type" className={cn(
                                        "h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none focus-visible:ring-blue-600 w-full",
                                        errors.guideType && "border-red-500 focus-visible:ring-red-500"
                                    )}>
                                        <SelectValue placeholder="Selecione o tipo do guia" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="tecnico">Guia técnico</SelectItem>
                                        <SelectItem value="logistico">Guia logístico</SelectItem>
                                        <SelectItem value="turistico">Guia turístico</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.guideType && <span className="text-[10px] text-red-500 mt-1">{errors.guideType}</span>}
                            </div>

                            <div className="flex-1 min-w-[180px]">
                                <Label htmlFor="nationality" className="text-xs text-gray-500 mb-1.5 block">
                                    Nacionalidade*
                                </Label>
                                <Select value={formData.nationality} onValueChange={(val) => handleSelectChange('nationality', val)}>
                                    <SelectTrigger id="nationality" className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none focus-visible:ring-blue-600 w-full">
                                        <SelectValue placeholder="Selecione um país" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="br">Brasil</SelectItem>
                                        <SelectItem value="us">Estados Unidos</SelectItem>
                                        <SelectItem value="ar">Argentina</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex-1 min-w-[200px]">
                                <Label htmlFor="languages" className="text-xs text-gray-500 mb-1.5 block">
                                    Idiomas*
                                </Label>
                                <Select value={formData.languages} onValueChange={(val) => handleSelectChange('languages', val)}>
                                    <SelectTrigger id="languages" className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none focus-visible:ring-blue-600 w-full">
                                        <SelectValue placeholder="Selecione os idiomas do guia" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pt">Português</SelectItem>
                                        <SelectItem value="en">Inglês</SelectItem>
                                        <SelectItem value="es">Espanhol</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="w-[180px]">
                                <Label htmlFor="english-level" className="text-xs text-gray-500 mb-1.5 block">
                                    Nível de inglês*
                                </Label>
                                <Select value={formData.englishLevel} onValueChange={(val) => handleSelectChange('englishLevel', val)}>
                                    <SelectTrigger id="english-level" className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none focus-visible:ring-blue-600 w-full">
                                        <SelectValue placeholder="Básico" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="basico">Básico</SelectItem>
                                        <SelectItem value="intermediario">Intermediário</SelectItem>
                                        <SelectItem value="avancado">Avançado</SelectItem>
                                        <SelectItem value="fluente">Fluente</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Endereço */}
                    <div className="pt-16 mt-[20px]" style={{ marginTop: '20px !important' }}>
                        <div className="flex items-center gap-4 mb-4">
                            <h2 className="text-sm font-semibold text-gray-900 whitespace-nowrap">Endereço</h2>
                            <div className="flex-1 h-px bg-gray-200 opacity-30"></div>
                        </div>
                        {/* First row */}
                        <div className="flex gap-4 mb-4">
                            <div className="flex-1">
                                <Label htmlFor="city" className="text-xs text-gray-500 mb-1.5 block">
                                    Cidade*
                                </Label>
                                <Select value={formData.city} onValueChange={(val) => handleSelectChange('city', val)}>
                                    <SelectTrigger id="city" className={cn(
                                        "h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none focus-visible:ring-blue-600 w-full",
                                        errors.city && "border-red-500 focus-visible:ring-red-500"
                                    )}>
                                        <SelectValue placeholder="Selecione uma cidade" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sp">São Paulo</SelectItem>
                                        <SelectItem value="rj">Rio de Janeiro</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.city && <span className="text-[10px] text-red-500 mt-1">{errors.city}</span>}
                            </div>

                            <div className="flex-1">
                                <Label htmlFor="state" className="text-xs text-gray-500 mb-1.5 block">
                                    Estado*
                                </Label>
                                <Select value={formData.state} onValueChange={(val) => handleSelectChange('state', val)}>
                                    <SelectTrigger id="state" className={cn(
                                        "h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none focus-visible:ring-blue-600 w-full",
                                        errors.state && "border-red-500 focus-visible:ring-red-500"
                                    )}>
                                        <SelectValue placeholder="Selecione um estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sp">São Paulo</SelectItem>
                                        <SelectItem value="rj">Rio de Janeiro</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.state && <span className="text-[10px] text-red-500 mt-1">{errors.state}</span>}
                            </div>

                            <div className="w-[200px]">
                                <Label htmlFor="cep" className="text-xs text-gray-500 mb-1.5 block">
                                    CEP
                                </Label>
                                <Input
                                    id="cep"
                                    placeholder="Insira o CEP"
                                    className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none focus-visible:ring-blue-600 w-full"
                                    maxLength={9}
                                    value={formData.cep}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        {/* Second row */}
                        <div className="flex gap-4 w-full">
                            <div className="flex-[4]">
                                <Label htmlFor="street" className="text-xs text-gray-500 mb-1.5 block">
                                    Rua-Avenida*
                                </Label>
                                <Input
                                    id="street"
                                    placeholder="Digite o nome da rua e bairro"
                                    className={cn(
                                        "h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none focus-visible:ring-blue-600 w-full",
                                        errors.street && "border-red-500 focus-visible:ring-red-500"
                                    )}
                                    maxLength={150}
                                    value={formData.street}
                                    onChange={handleInputChange}
                                />
                                {errors.street && <span className="text-[10px] text-red-500 mt-1">{errors.street}</span>}
                            </div>

                            <div className="flex-[4]">
                                <Label htmlFor="neighborhood" className="text-xs text-gray-500 mb-1.5 block">
                                    Bairro*
                                </Label>
                                <Input
                                    id="neighborhood"
                                    placeholder="Digite o nome da rua e bairro"
                                    className={cn(
                                        "h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none focus-visible:ring-blue-600 w-full",
                                        errors.neighborhood && "border-red-500 focus-visible:ring-red-500"
                                    )}
                                    maxLength={100}
                                    value={formData.neighborhood}
                                    onChange={handleInputChange}
                                />
                                {errors.neighborhood && <span className="text-[10px] text-red-500 mt-1">{errors.neighborhood}</span>}
                            </div>

                            <div className="w-[100px] flex-none">
                                <Label htmlFor="number" className="text-xs text-gray-500 mb-1.5 block">
                                    Número*
                                </Label>
                                <Input
                                    id="number"
                                    placeholder="-"
                                    className={cn(
                                        "h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none focus-visible:ring-blue-600 w-full",
                                        errors.number && "border-red-500 focus-visible:ring-red-500"
                                    )}
                                    maxLength={10}
                                    value={formData.number}
                                    onChange={handleInputChange}
                                />
                                {errors.number && <span className="text-[10px] text-red-500 mt-1">{errors.number}</span>}
                            </div>

                            <div className="flex-[3]">
                                <Label htmlFor="complement" className="text-xs text-gray-500 mb-1.5 block">
                                    Complemento(opcional)
                                </Label>
                                <Input
                                    id="complement"
                                    placeholder="Digite"
                                    className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none focus-visible:ring-blue-600 w-full"
                                    maxLength={50}
                                    value={formData.complement}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Outros */}
                    <div className="pt-16 mt-[20px]" style={{ marginTop: '20px !important' }}>
                        <div className="flex items-center gap-4 mb-4">
                            <h2 className="text-sm font-semibold text-gray-900 whitespace-nowrap">Outros</h2>
                            <div className="flex-1 h-px bg-gray-200 opacity-30"></div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-900 mb-2 block">
                                    Foto de perfil (opcional)
                                </Label>
                                <p className="text-xs text-gray-500 mb-3">
                                    A imagem precisa ter 1080x1080px
                                </p>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="file"
                                        id="profile-image"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                    />
                                    <label htmlFor="profile-image">
                                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                                            <Upload className="h-5 w-5 text-white" />
                                        </div>
                                    </label>
                                    {profileImage && (
                                        <img
                                            src={profileImage}
                                            alt="Profile preview"
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="observations" className="text-sm font-medium text-gray-900 mb-2 block">
                                    Observações
                                </Label>
                                <Textarea
                                    id="observations"
                                    placeholder="Informações adicionais do guia (opcional)"
                                    className="min-h-[120px] rounded-lg border-gray-200 resize-none"
                                    value={formData.observations}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
                <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="h-11 px-6 rounded-2xl border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                    Cancelar <X className="ml-2 h-4 w-4" />
                </Button>
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl min-w-[120px]"
                >
                    {isSaving ? (
                        <>Salvando... <Loader2 className="ml-2 h-4 w-4 animate-spin" /></>
                    ) : (
                        <>Salvar <Save className="ml-2 h-4 w-4" /></>
                    )}
                </Button>
            </div>
        </div>
    )
}
