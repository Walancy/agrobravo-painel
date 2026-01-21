"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { X, Save, Upload, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { collaboratorsService } from "@/services/collaboratorsService"
import { maskCPF, maskPhone, maskCEP, validateEmail } from "@/lib/form-utils"
import { cn } from "@/lib/utils"

import { useUserPermissions } from "@/hooks/useUserPermissions"
import { toast } from "sonner"

interface CollaboratorFormProps {
    collaboratorId?: string
}

export function CollaboratorForm({ collaboratorId }: CollaboratorFormProps) {
    const router = useRouter()
    const { hasPermission, isLoading: isLoadingPermissions } = useUserPermissions()

    React.useEffect(() => {
        if (!isLoadingPermissions && !hasPermission('GERENCIAR_USUARIOS')) {
            toast.error("Acesso negado", {
                description: "Você não tem permissão para gerenciar colaboradores."
            })
            router.push("/administracao")
        }
    }, [isLoadingPermissions, hasPermission, router])
    const [profileImage, setProfileImage] = React.useState<string | null>(null)
    const [isSaving, setIsSaving] = React.useState(false)
    const [isFetching, setIsFetching] = React.useState(!!collaboratorId)
    const [errors, setErrors] = React.useState<Record<string, string>>({})

    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        document: '',
        phone: '',
        accessLevel: '',
        city: '',
        state: '',
        cep: '',
        street: '',
        neighborhood: '',
        number: '',
        complement: ''
    })

    React.useEffect(() => {
        const fetchCollaboratorData = async () => {
            if (!collaboratorId) return
            try {
                setIsFetching(true)
                const data = await collaboratorsService.getCollaboratorById(collaboratorId)
                setFormData(data)
                if (data.photo) setProfileImage(data.photo)
            } catch (error) {
                console.error("Failed to fetch collaborator data:", error)
                alert("Erro ao carregar dados do colaborador.")
            } finally {
                setIsFetching(false)
            }
        }

        fetchCollaboratorData()
    }, [collaboratorId])

    // Check if email exists
    React.useEffect(() => {
        const checkEmail = async () => {
            if (!formData.email || !validateEmail(formData.email)) return

            // If editing, don't check if it's the same email
            if (collaboratorId) {
                // We would need the original email here to be perfect, 
                // but let's assume if it's valid and we are editing, 
                // we only show error if it's different from what was loaded.
                // For now, let's just do the check and the user can ignore if it's their own.
                // Better: only check if it's a new collaborator for now to avoid confusion.
                return
            }

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
    }, [formData.email, collaboratorId])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

        // Address validation
        if (!formData.city) newErrors.city = "Cidade é obrigatória"
        if (!formData.state) newErrors.state = "Estado é obrigatório"
        if (!formData.street.trim()) newErrors.street = "Rua é obrigatória"
        if (!formData.neighborhood.trim()) newErrors.neighborhood = "Bairro é obrigatório"
        if (!formData.number.trim()) newErrors.number = "Número é obrigatório"

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSelectChange = (id: string, value: string) => {
        setFormData(prev => ({ ...prev, [id]: value }))
        if (errors[id]) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[id]
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

    const handleSave = async () => {
        if (!validateForm()) return

        try {
            setIsSaving(true)
            const payload = { ...formData, photo: profileImage }

            if (collaboratorId) {
                await collaboratorsService.updateCollaborator(collaboratorId, payload)
            } else {
                await collaboratorsService.createCollaborator(payload)
            }

            router.push("/administracao")
        } catch (error) {
            console.error("Failed to save collaborator:", error)
            alert("Erro ao salvar colaborador. Por favor, tente novamente.")
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
        <div className="flex flex-col h-full bg-white rounded-xl overflow-hidden">
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4">
                <h1 className="text-xl font-semibold text-gray-900">
                    {collaboratorId ? "Editar colaborador" : "Cadastrar um novo colaborador"}
                </h1>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Dados básicos */}
                <section>
                    <h2 className="text-sm font-semibold text-gray-900 mb-4">Dados básicos</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="lg:col-span-1">
                            <Label htmlFor="name" className="text-xs text-gray-500 mb-1.5 block">Nome completo*</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Digite o nome"
                                className={cn(
                                    "h-12 bg-gray-50 border-gray-200 rounded-xl",
                                    errors.name && "border-red-500 focus-visible:ring-red-500"
                                )}
                                maxLength={100}
                            />
                            {errors.name && <span className="text-[10px] text-red-500 mt-1">{errors.name}</span>}
                        </div>
                        <div className="lg:col-span-1">
                            <Label htmlFor="email" className="text-xs text-gray-500 mb-1.5 block">E-mail*</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Digite o e-mail"
                                className={cn(
                                    "h-12 bg-gray-50 border-gray-200 rounded-xl",
                                    errors.email && "border-red-500 focus-visible:ring-red-500"
                                )}
                                maxLength={100}
                            />
                            {errors.email && <span className="text-[10px] text-red-500 mt-1">{errors.email}</span>}
                        </div>
                        <div className="lg:col-span-1">
                            <Label htmlFor="document" className="text-xs text-gray-500 mb-1.5 block">CPF*</Label>
                            <Input
                                id="document"
                                value={formData.document}
                                onChange={handleInputChange}
                                placeholder="___.___.___-__"
                                className={cn(
                                    "h-12 bg-gray-50 border-gray-200 rounded-xl",
                                    errors.document && "border-red-500 focus-visible:ring-red-500"
                                )}
                                maxLength={14}
                            />
                            {errors.document && <span className="text-[10px] text-red-500 mt-1">{errors.document}</span>}
                        </div>
                        <div className="lg:col-span-1">
                            <Label htmlFor="phone" className="text-xs text-gray-500 mb-1.5 block">Telefone*</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="+__ (__) _____-____"
                                className={cn(
                                    "h-12 bg-gray-50 border-gray-200 rounded-xl",
                                    errors.phone && "border-red-500 focus-visible:ring-red-500"
                                )}
                                maxLength={15}
                            />
                            {errors.phone && <span className="text-[10px] text-red-500 mt-1">{errors.phone}</span>}
                        </div>
                        <div className="lg:col-span-1">
                            <Label htmlFor="accessLevel" className="text-xs text-gray-500 mb-1.5 block">Nível de acesso*</Label>
                            <Select value={formData.accessLevel} onValueChange={(val) => handleSelectChange('accessLevel', val)}>
                                <SelectTrigger className={cn(
                                    "h-12 bg-gray-50 border-gray-200 rounded-xl",
                                    errors.accessLevel && "border-red-500 focus-visible:ring-red-500"
                                )}>
                                    <SelectValue placeholder="Selecione" />
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
                </section>

                {/* Endereço */}
                <section>
                    <h2 className="text-sm font-semibold text-gray-900 mb-4">Endereço</h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-1">
                                <Label htmlFor="city" className="text-xs text-gray-500 mb-1.5 block">Cidade*</Label>
                                <Select value={formData.city} onValueChange={(val) => handleSelectChange('city', val)}>
                                    <SelectTrigger className={cn(
                                        "h-12 bg-gray-50 border-gray-200 rounded-xl",
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
                            <div className="md:col-span-1">
                                <Label htmlFor="state" className="text-xs text-gray-500 mb-1.5 block">Estado*</Label>
                                <Select value={formData.state} onValueChange={(val) => handleSelectChange('state', val)}>
                                    <SelectTrigger className={cn(
                                        "h-12 bg-gray-50 border-gray-200 rounded-xl",
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
                            <div className="md:col-span-1">
                                <Label htmlFor="cep" className="text-xs text-gray-500 mb-1.5 block">CEP</Label>
                                <Input id="cep" value={formData.cep} onChange={handleInputChange} placeholder="Insira o CEP" className="h-12 bg-gray-50 border-gray-200 rounded-xl" maxLength={9} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-1">
                                <Label htmlFor="street" className="text-xs text-gray-500 mb-1.5 block">Rua-Avenida*</Label>
                                <Input
                                    id="street"
                                    value={formData.street}
                                    onChange={handleInputChange}
                                    placeholder="Digite o nome da rua"
                                    className={cn(
                                        "h-12 bg-gray-50 border-gray-200 rounded-xl",
                                        errors.street && "border-red-500 focus-visible:ring-red-500"
                                    )}
                                    maxLength={150}
                                />
                                {errors.street && <span className="text-[10px] text-red-500 mt-1">{errors.street}</span>}
                            </div>
                            <div className="md:col-span-1">
                                <Label htmlFor="neighborhood" className="text-xs text-gray-500 mb-1.5 block">Bairro*</Label>
                                <Input
                                    id="neighborhood"
                                    value={formData.neighborhood}
                                    onChange={handleInputChange}
                                    placeholder="Digite o nome do bairro"
                                    className={cn(
                                        "h-12 bg-gray-50 border-gray-200 rounded-xl",
                                        errors.neighborhood && "border-red-500 focus-visible:ring-red-500"
                                    )}
                                    maxLength={100}
                                />
                                {errors.neighborhood && <span className="text-[10px] text-red-500 mt-1">{errors.neighborhood}</span>}
                            </div>
                            <div className="md:col-span-1">
                                <Label htmlFor="number" className="text-xs text-gray-500 mb-1.5 block">Número*</Label>
                                <Input
                                    id="number"
                                    value={formData.number}
                                    onChange={handleInputChange}
                                    placeholder="-"
                                    className={cn(
                                        "h-12 bg-gray-50 border-gray-200 rounded-xl",
                                        errors.number && "border-red-500 focus-visible:ring-red-500"
                                    )}
                                    maxLength={10}
                                />
                                {errors.number && <span className="text-[10px] text-red-500 mt-1">{errors.number}</span>}
                            </div>
                            <div className="md:col-span-1">
                                <Label htmlFor="complement" className="text-xs text-gray-500 mb-1.5 block">Complemento(opcional)</Label>
                                <Input id="complement" value={formData.complement} onChange={handleInputChange} placeholder="Digite" className="h-12 bg-gray-50 border-gray-200 rounded-xl" maxLength={100} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Foto de perfil */}
                <section>
                    <h2 className="text-sm font-semibold text-gray-900 mb-1">Foto de perfil (opcional)</h2>
                    <p className="text-xs text-gray-500 mb-4">A imagem precisa ter 1080x1080px</p>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <input type="file" id="photo-upload" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            <label htmlFor="photo-upload" className="flex items-center justify-center w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full cursor-pointer transition-colors">
                                <Upload className="h-5 w-5" />
                            </label>
                        </div>
                        {profileImage && (
                            <img src={profileImage} alt="Preview" className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                        )}
                    </div>
                </section>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3 bg-gray-50">
                <Button variant="ghost" onClick={() => router.push("/administracao")} className="h-11 px-6 text-gray-500 hover:text-gray-700 rounded-2xl">
                    Cancelar <X className="ml-2 h-4 w-4" />
                </Button>
                <Button onClick={handleSave} disabled={isSaving} className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl min-w-[120px]">
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
