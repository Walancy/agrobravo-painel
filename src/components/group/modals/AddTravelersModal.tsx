"use client"

import * as React from "react"
import { X, Tag, User, Trash2, Mail, Phone, Loader2 } from "lucide-react"
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
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { toast } from "sonner"

interface AddTravelersModalProps {
    groupId?: string
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: () => void
}

type Invite = {
    id: string
    value: string
    type: 'email' | 'phone'
}

export function AddTravelersModal({ groupId, open, onOpenChange, onSave }: AddTravelersModalProps) {
    const [invited, setInvited] = React.useState<Invite[]>([])
    const [inputValue, setInputValue] = React.useState("")
    const [inviteType, setInviteType] = React.useState<'email' | 'phone'>('email')
    const [isSaving, setIsSaving] = React.useState(false)

    // Reset state when opening/closing
    React.useEffect(() => {
        if (!open) {
            setInvited([])
            setInputValue("")
            setInviteType('email')
        }
    }, [open])

    const removeInvited = (id: string) => {
        setInvited(prev => prev.filter(i => i.id !== id))
    }

    const addItem = () => {
        if (!inputValue) return

        // Simple validation
        if (inviteType === 'email' && !inputValue.includes('@')) {
            toast.error("Insira um e-mail válido")
            return
        }

        if (invited.some(i => i.value === inputValue)) {
            toast.error("Este convidado já está na lista")
            return
        }

        setInvited(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), value: inputValue, type: inviteType }])
        setInputValue("")
    }

    const handleSave = async () => {
        if (!groupId) {
            toast.error("Erro: Grupo não identificado")
            return
        }

        if (invited.length === 0) {
            toast.error("Adicione ao menos um convidado")
            return
        }

        try {
            setIsSaving(true)
            const { travelersService } = await import("@/services/travelersService")
            await travelersService.inviteTravelers({
                groupId,
                invites: invited.map(({ value, type }) => ({ value, type }))
            })

            toast.success("Convites enviados com sucesso!")
            onSave()
            onOpenChange(false)
        } catch (error: any) {
            console.error("Failed to invite travelers:", error)
            toast.error(error.message || "Erro ao enviar convites")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                aria-describedby={undefined}
                overlayClassName="!animate-none !duration-0 !transition-none"
                className="!max-w-[650px] p-0 overflow-hidden gap-0 bg-white [&>button]:hidden !animate-none !duration-0 !transition-none rounded-3xl"
                style={{ maxWidth: '650px', width: '90vw' }}
            >
                {/* Header */}
                <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white">
                    <div>
                        <DialogTitle className="text-lg font-semibold text-gray-900">Adicionar Viajantes</DialogTitle>
                        <DialogDescription className="text-xs text-gray-500">Convide os viajantes para este grupo</DialogDescription>
                    </div>
                    <DialogClose className="rounded-full p-2 hover:bg-gray-100 transition-colors">
                        <X className="h-4 w-4 text-gray-400" />
                        <span className="sr-only">Close</span>
                    </DialogClose>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex items-center gap-3">
                        {/* Custom Switch with Icon in Thumb */}
                        <div className="flex items-center gap-3 bg-gray-50 p-2 pr-4 rounded-2xl border border-gray-100">
                            <SwitchPrimitives.Root
                                checked={inviteType === 'phone'}
                                onCheckedChange={(checked) => setInviteType(checked ? 'phone' : 'email')}
                                className={cn(
                                    "peer inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
                                    inviteType === 'phone' ? "bg-blue-600" : "bg-blue-100"
                                )}
                            >
                                <SwitchPrimitives.Thumb
                                    className={cn(
                                        "pointer-events-none flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-lg ring-0 transition-transform",
                                        inviteType === 'phone' ? "translate-x-5" : "translate-x-0"
                                    )}
                                >
                                    {inviteType === 'email' ? (
                                        <Mail className="h-3 w-3 text-blue-600" />
                                    ) : (
                                        <Phone className="h-3 w-3 text-blue-600" />
                                    )}
                                </SwitchPrimitives.Thumb>
                            </SwitchPrimitives.Root>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest select-none">
                                {inviteType === 'email' ? 'E-mail' : 'Telefone'}
                            </span>
                        </div>

                        {/* Input Row */}
                        <div className="flex-1 flex gap-2">
                            <Input
                                placeholder={inviteType === 'email' ? "Insira o e-mail do viajante" : "+55 (00) 00000-0000"}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="h-12 bg-white border-gray-200 rounded-2xl shadow-none focus-visible:ring-blue-600 px-4 flex-1 text-sm"
                                onKeyDown={(e) => e.key === 'Enter' && addItem()}
                            />
                            <Button
                                className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-normal shadow-none shrink-0"
                                onClick={addItem}
                            >
                                Adicionar
                            </Button>
                        </div>
                    </div>

                    {/* Invited List */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <span className="text-sm font-semibold text-gray-900">Convidando ({invited.length})</span>
                        </div>

                        <div className="max-h-[200px] overflow-y-auto pr-1 space-y-2">
                            {invited.length === 0 ? (
                                <div className="text-center py-8 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                    <User className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-xs text-gray-400 font-medium tracking-wide">Nenhum convidado adicionado</p>
                                </div>
                            ) : (
                                invited.map((item) => (
                                    <div key={item.id} className="group flex items-center justify-between p-3 bg-white border border-gray-100 rounded-2xl hover:border-blue-100 hover:bg-blue-50/30 transition-all duration-200">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-xl bg-gray-50 group-hover:bg-white flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">
                                                {item.type === 'email' ? <Mail className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                                            </div>
                                            <span className="text-gray-900 font-medium text-sm">{item.value}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                            onClick={() => removeInvited(item.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 pt-2 flex gap-3 bg-gray-50/50 border-t border-gray-100">
                    <Button
                        variant="outline"
                        className="flex-1 h-12 rounded-2xl text-gray-600 font-normal border-gray-200 hover:bg-gray-100 border-1 shadow-none"
                        onClick={() => onOpenChange(false)}
                        disabled={isSaving}
                    >
                        Cancelar
                    </Button>
                    <Button
                        className="flex-1 h-12 rounded-2xl text-white font-normal bg-blue-600 hover:bg-blue-700 disabled:opacity-70"
                        onClick={handleSave}
                        disabled={isSaving || invited.length === 0}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            "Finalizar convites"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
