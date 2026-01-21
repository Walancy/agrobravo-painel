"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Pencil, Loader2 } from "lucide-react"
import { toast } from "sonner"

type TravelerData = {
    name: string
    email: string
    phone: string
    birthDate: string
    nationality: string
    passport: string
    cpf: string
    ssn: string
    company: string
    position: string
    dietaryRestrictions: string[]
    medicalRestrictions: string[]
    observations: string
}

export function TravelerDataTab({ travelerId }: { travelerId: string }) {
    const [isEditing, setIsEditing] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [data, setData] = useState<TravelerData>({
        name: '',
        email: '',
        phone: '',
        birthDate: '',
        nationality: '',
        passport: '',
        cpf: '',
        ssn: '',
        company: '',
        position: '',
        dietaryRestrictions: [],
        medicalRestrictions: [],
        observations: ''
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true)
                const response = await fetch(`/api/travelers/${travelerId}`)
                if (!response.ok) throw new Error('Failed to fetch data')
                const traveler = await response.json()

                setData({
                    name: traveler.name || '',
                    email: traveler.email || '',
                    phone: traveler.phone || '',
                    birthDate: traveler.birthDate || '',
                    nationality: traveler.nationality || '',
                    passport: traveler.passport || '',
                    cpf: traveler.cpf || '',
                    ssn: traveler.ssn || '',
                    company: traveler.company || '',
                    position: traveler.position || '',
                    dietaryRestrictions: traveler.dietaryRestrictions || [],
                    medicalRestrictions: traveler.medicalRestrictions || [],
                    observations: traveler.observations || ''
                })
            } catch (error) {
                console.error('Error fetching traveler data:', error)
                toast.error('Erro ao carregar dados do viajante')
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [travelerId])

    const handleSave = async () => {
        try {
            setIsSaving(true)
            const response = await fetch(`/api/travelers/${travelerId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            if (!response.ok) throw new Error('Failed to save')

            toast.success('Dados salvos com sucesso!')
            setIsEditing(false)
        } catch (error) {
            console.error('Error saving traveler data:', error)
            toast.error('Erro ao salvar dados')
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100">
            {/* Header with Edit Button */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Dados básicos</h2>
                {!isEditing && (
                    <Button
                        onClick={() => setIsEditing(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                    >
                        Editar <Pencil className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Form Grid */}
            <div className="space-y-6">
                {/* Row 1 */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <Label htmlFor="name" className="text-xs text-gray-500 font-medium mb-1.5 block">Nome do usuário</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData({ ...data, name: e.target.value })}
                            disabled={!isEditing}
                            className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                        />
                    </div>
                    <div>
                        <Label htmlFor="email" className="text-xs text-gray-500 font-medium mb-1.5 block">E-mail</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData({ ...data, email: e.target.value })}
                            disabled={!isEditing}
                            className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                        />
                    </div>
                    <div>
                        <Label htmlFor="phone" className="text-xs text-gray-500 font-medium mb-1.5 block">Telefone</Label>
                        <Input
                            id="phone"
                            value={data.phone}
                            onChange={(e) => setData({ ...data, phone: e.target.value })}
                            disabled={!isEditing}
                            className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                        />
                    </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-4 gap-4">
                    <div>
                        <Label htmlFor="birthDate" className="text-xs text-gray-500 font-medium mb-1.5 block">Data de nascimento</Label>
                        <Input
                            id="birthDate"
                            type="date"
                            value={data.birthDate}
                            onChange={(e) => setData({ ...data, birthDate: e.target.value })}
                            disabled={!isEditing}
                            className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                        />
                    </div>
                    <div>
                        <Label htmlFor="nationality" className="text-xs text-gray-500 font-medium mb-1.5 block">Nacionalidade</Label>
                        <Input
                            id="nationality"
                            value={data.nationality}
                            onChange={(e) => setData({ ...data, nationality: e.target.value })}
                            disabled={!isEditing}
                            className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                        />
                    </div>
                    <div>
                        <Label htmlFor="passport" className="text-xs text-gray-500 font-medium mb-1.5 block">Passaporte</Label>
                        <Input
                            id="passport"
                            value={data.passport}
                            onChange={(e) => setData({ ...data, passport: e.target.value })}
                            disabled={!isEditing}
                            className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                        />
                    </div>
                    <div>
                        <Label htmlFor="cpf" className="text-xs text-gray-500 font-medium mb-1.5 block">CPF (Exclusive RR)</Label>
                        <Input
                            id="cpf"
                            value={data.cpf}
                            onChange={(e) => setData({ ...data, cpf: e.target.value })}
                            disabled={!isEditing}
                            className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                        />
                    </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <Label htmlFor="ssn" className="text-xs text-gray-500 font-medium mb-1.5 block">Social Security Number ou ID (Exclusive Estrangeiro)</Label>
                        <Input
                            id="ssn"
                            value={data.ssn}
                            onChange={(e) => setData({ ...data, ssn: e.target.value })}
                            disabled={!isEditing}
                            className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                        />
                    </div>
                    <div>
                        <Label htmlFor="company" className="text-xs text-gray-500 font-medium mb-1.5 block">Empresa</Label>
                        <Input
                            id="company"
                            value={data.company}
                            onChange={(e) => setData({ ...data, company: e.target.value })}
                            disabled={!isEditing}
                            className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                        />
                    </div>
                    <div>
                        <Label htmlFor="position" className="text-xs text-gray-500 font-medium mb-1.5 block">Cargo</Label>
                        <Input
                            id="position"
                            value={data.position}
                            onChange={(e) => setData({ ...data, position: e.target.value })}
                            disabled={!isEditing}
                            className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                        />
                    </div>
                </div>

                {/* Dietary Restrictions */}
                <div>
                    <Label className="text-sm text-gray-900 font-semibold uppercase mb-4 block">Restrições alimentares</Label>
                    <div className="mt-2 flex flex-wrap gap-4">
                        {['Vegano(a)', 'Sem glúten', 'Sem lactose'].map((restriction) => (
                            <div key={restriction} className="flex items-center gap-2">
                                <Checkbox
                                    checked={data.dietaryRestrictions.includes(restriction)}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            setData({ ...data, dietaryRestrictions: [...data.dietaryRestrictions, restriction] })
                                        } else {
                                            setData({ ...data, dietaryRestrictions: data.dietaryRestrictions.filter(r => r !== restriction) })
                                        }
                                    }}
                                    disabled={!isEditing}
                                    className="w-5 h-5 rounded border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 shadow-none"
                                />
                                <span className="text-sm text-gray-700">{restriction}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Medical Restrictions */}
                <div>
                    <Label className="text-sm text-gray-900 font-semibold uppercase mb-4 block">Restrições médicas</Label>
                    <div className="mt-2 flex flex-wrap gap-4">
                        {['Asma', 'Alergia a frutos do mar', 'Diabetes tipo 2', 'Intolerância à lactose'].map((restriction) => (
                            <div key={restriction} className="flex items-center gap-2">
                                <Checkbox
                                    checked={data.medicalRestrictions.includes(restriction)}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            setData({ ...data, medicalRestrictions: [...data.medicalRestrictions, restriction] })
                                        } else {
                                            setData({ ...data, medicalRestrictions: data.medicalRestrictions.filter(r => r !== restriction) })
                                        }
                                    }}
                                    disabled={!isEditing}
                                    className="w-5 h-5 rounded border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 shadow-none"
                                />
                                <span className="text-sm text-gray-700">{restriction}</span>
                            </div>
                        ))}
                    </div>
                    <Label className="text-xs text-gray-500 font-medium mt-4 mb-1.5 block">Observações adicionais</Label>
                    <Input
                        value={data.observations}
                        onChange={(e) => setData({ ...data, observations: e.target.value })}
                        disabled={!isEditing}
                        placeholder="Sem informações"
                        className="h-12 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                    />
                </div>

                {/* Action Buttons */}
                {isEditing && (
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                            disabled={isSaving}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                'Salvar'
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
