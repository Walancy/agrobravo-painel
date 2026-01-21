"use client"

import { useRouter, usePathname } from "next/navigation"
import { LucideIcon, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { toast } from "sonner"
import { useUserPermissions } from "@/hooks/useUserPermissions"

interface SidebarItemProps {
    name: string
    icon: LucideIcon
    href: string
    subItems?: { name: string; icon: LucideIcon; href: string }[]
    isCollapsed?: boolean
}

// Map routes to required permissions
const ROUTE_PERMISSIONS: Record<string, string> = {
    '/administracao': 'GERENCIAR_USUARIOS',
    '/missoes': 'EDITAR_MISSOES',
    '/fornecedores': 'EDITAR_CATALOGOS_DE_SERVICO',
    '/cotacoes': 'EDITAR_MISSOES', // Assuming same as missions for now
}

export function SidebarItem({ name, icon: Icon, href, subItems, isCollapsed = false }: SidebarItemProps) {
    const pathname = usePathname()
    const router = useRouter()
    const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
    const [isOpen, setIsOpen] = useState(isActive)
    const { hasPermission, isLoading } = useUserPermissions()

    const hasSubItems = subItems && subItems.length > 0

    const handleClick = (targetHref: string) => {
        // Always allow home
        if (targetHref === '/') {
            router.push(targetHref)
            return
        }

        // If loading, prevent action
        if (isLoading) return

        // Check specific permission for the route
        const requiredPermission = ROUTE_PERMISSIONS[targetHref]

        if (requiredPermission && !hasPermission(requiredPermission)) {
            toast.error("Acesso negado", {
                description: "Você não tem permissão para acessar esta área.",
                action: {
                    label: "Entendi",
                    onClick: () => console.log("Toast closed"),
                },
            })
            return
        }

        router.push(targetHref)
    }

    if (isCollapsed) {
        return (
            <div
                onClick={() => handleClick(href)}
                className={cn(
                    "flex items-center justify-center p-3 rounded-md transition-colors cursor-pointer group relative",
                    isActive
                        ? "bg-muted text-foreground"
                        : "text-foreground hover:bg-muted/50"
                )}
                title={name}
            >
                <Icon className={cn(
                    "w-5 h-5",
                    isActive ? "text-primary" : "text-foreground"
                )} />
                {/* Tooltip */}
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    {name}
                </div>
            </div>
        )
    }

    return (
        <div>
            <div
                className={cn(
                    "flex items-center justify-between pr-2 rounded-md transition-colors cursor-pointer",
                    isActive
                        ? "bg-muted text-foreground"
                        : "text-foreground hover:bg-muted/50"
                )}
            >
                <div
                    onClick={() => handleClick(href)}
                    className="flex-1 flex items-center gap-3 px-3 py-2 text-sm font-medium"
                >
                    <Icon className={cn(
                        "w-5 h-5",
                        isActive ? "text-primary" : "text-foreground"
                    )} />
                    {name}
                </div>
                {hasSubItems && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            setIsOpen(!isOpen)
                        }}
                        className="p-1 hover:bg-gray-200 rounded-md transition-colors"
                    >
                        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
                    </button>
                )}
            </div>

            {hasSubItems && isOpen && (
                <div className="ml-4 mt-1 space-y-1 border-l border-border/40 pl-2">
                    {subItems?.map((subItem) => {
                        const isSubActive = pathname === subItem.href
                        return (
                            <div
                                key={subItem.name}
                                onClick={() => handleClick(subItem.href)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                                    isSubActive
                                        ? "text-primary bg-blue-50"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                <subItem.icon className={cn(
                                    "w-4 h-4",
                                    isSubActive ? "text-primary" : "text-muted-foreground"
                                )} />
                                {subItem.name}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
