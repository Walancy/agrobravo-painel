"use client"

import * as React from "react"
import { X, Shield, Loader2, Trash2, Plus, Check, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogClose,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog"
import { AVAILABLE_PERMISSIONS } from "@/constants/permissions"
import { permissionsService, Role } from "@/services/permissionsService"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function PermissionsModal() {
    const [isOpen, setIsOpen] = React.useState(false)
    const [roles, setRoles] = React.useState<Role[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [editingRole, setEditingRole] = React.useState<Role | null>(null)
    const [isSaving, setIsSaving] = React.useState(false)

    // New role state
    const [newRoleName, setNewRoleName] = React.useState("")
    const [newRolePermissions, setNewRolePermissions] = React.useState<string[]>([])
    const [isCreating, setIsCreating] = React.useState(false)

    const fetchRoles = React.useCallback(async () => {
        try {
            setIsLoading(true)
            const data = await permissionsService.getAllRoles()
            setRoles(data)
        } catch (error) {
            console.error("Error fetching roles:", error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    React.useEffect(() => {
        if (isOpen) {
            fetchRoles()
        }
    }, [isOpen, fetchRoles])

    const handleCreateRole = async () => {
        if (!newRoleName.trim()) {
            toast.error("O nome do nível é obrigatório")
            return
        }

        try {
            setIsSaving(true)
            await permissionsService.createRole(newRoleName, newRolePermissions)
            toast.success("Nível criado com sucesso")
            setNewRoleName("")
            setNewRolePermissions([])
            setIsCreating(false)
            fetchRoles()
        } catch (error) {
            console.error("Error creating role:", error)
            toast.error("Erro ao criar nível")
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteRole = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este nível?")) return

        try {
            await permissionsService.deleteRole(id)
            toast.success("Nível excluído com sucesso")
            fetchRoles()
        } catch (error) {
            console.error("Error deleting role:", error)
            toast.error("Erro ao excluir nível")
        }
    }

    const handleUpdateRole = async (role: Role) => {
        try {
            await permissionsService.updateRole(role.id, role.name, role.permissions)
            toast.success("Permissões atualizadas")
            setEditingRole(null)
            fetchRoles()
        } catch (error) {
            console.error("Error updating role:", error)
            toast.error("Erro ao atualizar nível")
        }
    }

    const togglePermission = (permissionId: string, currentPermissions: string[], setPermissions: (p: string[]) => void) => {
        if (currentPermissions.includes(permissionId)) {
            setPermissions(currentPermissions.filter(p => p !== permissionId))
        } else {
            setPermissions([...currentPermissions, permissionId])
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="h-12 px-4 rounded-2xl border-gray-200 text-gray-700 hover:bg-gray-50">
                    <Shield className="mr-2 h-5 w-5" />
                    Gerenciar Permissões
                </Button>
            </DialogTrigger>
            <DialogContent
                aria-describedby={undefined}
                overlayClassName="!animate-none !duration-0 !transition-none"
                className="w-[98vw] max-w-[1000px] p-0 overflow-hidden gap-0 bg-white [&>button]:hidden !animate-none !duration-0 !transition-none"
            >
                {/* Header */}
                <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white">
                    <div>
                        <DialogTitle className="text-lg font-semibold text-gray-900">Gerenciar Níveis de Acesso</DialogTitle>
                        <DialogDescription className="text-xs text-gray-500">Crie e configure os níveis de hierarquia e suas permissões.</DialogDescription>
                    </div>
                    <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </DialogClose>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[70vh]">
                    {/* Create New Role Section */}
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-semibold text-gray-900">Novo Nível</h3>
                                <p className="text-xs text-gray-500">Adicione um novo nível de acesso ao sistema</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsCreating(!isCreating)}
                                className={cn(
                                    "text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors",
                                    isCreating && "bg-blue-50"
                                )}
                            >
                                {isCreating ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                                {isCreating ? "Cancelar" : "Adicionar Nível"}
                            </Button>
                        </div>

                        {isCreating && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="space-y-1.5">
                                    <Label htmlFor="roleName" className="text-xs text-gray-500">Nome do Nível<span className="text-red-500">*</span></Label>
                                    <Input
                                        id="roleName"
                                        value={newRoleName}
                                        onChange={(e) => setNewRoleName(e.target.value)}
                                        placeholder="Ex: Gerente de Vendas"
                                        className="h-12 bg-white border-gray-200 rounded-xl shadow-none focus-visible:ring-blue-600"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-gray-500 block">Permissões</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {AVAILABLE_PERMISSIONS.map((perm) => (
                                            <div
                                                key={perm.id}
                                                className={cn(
                                                    "flex items-start space-x-3 p-3 rounded-xl border transition-colors cursor-pointer",
                                                    newRolePermissions.includes(perm.id)
                                                        ? "bg-blue-50 border-blue-200"
                                                        : "bg-white border-gray-200 hover:border-gray-300"
                                                )}
                                                onClick={() => togglePermission(perm.id, newRolePermissions, setNewRolePermissions)}
                                            >
                                                <Checkbox
                                                    id={`new-${perm.id}`}
                                                    checked={newRolePermissions.includes(perm.id)}
                                                    onCheckedChange={() => togglePermission(perm.id, newRolePermissions, setNewRolePermissions)}
                                                    className="mt-0.5"
                                                />
                                                <div className="grid gap-1 leading-none">
                                                    <label
                                                        htmlFor={`new-${perm.id}`}
                                                        className="text-sm font-medium leading-none cursor-pointer text-gray-900"
                                                    >
                                                        {perm.label}
                                                    </label>
                                                    <p className="text-xs text-gray-500 leading-normal">
                                                        {perm.description}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-end pt-2">
                                    <Button
                                        onClick={handleCreateRole}
                                        disabled={isSaving || !newRoleName.trim()}
                                        className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                                    >
                                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                                        Criar Nível
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Existing Roles List */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 px-1">Níveis Existentes</h3>
                        {isLoading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            </div>
                        ) : roles.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <Shield className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 font-medium">Nenhum nível de hierarquia configurado.</p>
                                <p className="text-sm text-gray-400 mt-1">Clique em "Adicionar Nível" para começar.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {roles.map((role) => (
                                    <div
                                        key={role.id}
                                        className={cn(
                                            "border transition-all",
                                            editingRole?.id === role.id
                                                ? "p-6 bg-gray-50 rounded-xl border-blue-200 ring-1 ring-blue-100"
                                                : "p-3 rounded-lg flex items-center justify-between border-gray-200 bg-white hover:border-blue-200 hover:shadow-sm"
                                        )}
                                    >
                                        {editingRole?.id === role.id ? (
                                            <div className="w-full space-y-6 animate-in fade-in duration-200">
                                                <div className="space-y-1.5">
                                                    <Label htmlFor={`edit-name-${role.id}`} className="text-xs text-gray-500">Nome do Nível<span className="text-red-500">*</span></Label>
                                                    <Input
                                                        id={`edit-name-${role.id}`}
                                                        value={editingRole.name}
                                                        onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                                                        className="h-12 bg-white border-gray-200 rounded-xl shadow-none focus-visible:ring-blue-600"
                                                        autoFocus
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-xs text-gray-500 block">Permissões</Label>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {AVAILABLE_PERMISSIONS.map((perm) => (
                                                            <div
                                                                key={perm.id}
                                                                className={cn(
                                                                    "flex items-start space-x-3 p-3 rounded-xl border transition-colors cursor-pointer",
                                                                    editingRole.permissions.includes(perm.id)
                                                                        ? "bg-blue-50 border-blue-200"
                                                                        : "bg-white border-gray-200 hover:border-gray-300"
                                                                )}
                                                                onClick={() => togglePermission(perm.id, editingRole.permissions, (p) => setEditingRole({ ...editingRole, permissions: p }))}
                                                            >
                                                                <Checkbox
                                                                    id={`edit-${role.id}-${perm.id}`}
                                                                    checked={editingRole.permissions.includes(perm.id)}
                                                                    onCheckedChange={() => togglePermission(perm.id, editingRole.permissions, (p) => setEditingRole({ ...editingRole, permissions: p }))}
                                                                    className="mt-0.5"
                                                                />
                                                                <div className="grid gap-1 leading-none">
                                                                    <label
                                                                        htmlFor={`edit-${role.id}-${perm.id}`}
                                                                        className="text-sm font-medium leading-none cursor-pointer text-gray-900"
                                                                    >
                                                                        {perm.label}
                                                                    </label>
                                                                    <p className="text-xs text-gray-500 leading-normal">
                                                                        {perm.description}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex justify-end gap-3 pt-2">
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => setEditingRole(null)}
                                                        className="h-11 px-6 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl"
                                                    >
                                                        Cancelar
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleUpdateRole(editingRole)}
                                                        className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                                                    >
                                                        <Check className="h-4 w-4 mr-2" />
                                                        Salvar Alterações
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                                        <Shield className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 text-sm">{role.name}</h4>
                                                        <p className="text-xs text-gray-500">
                                                            {role.permissions.length} permissões configuradas
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setEditingRole(role)}
                                                        className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeleteRole(role.id)}
                                                        className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
