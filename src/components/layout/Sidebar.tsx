"use client"

import { Home, Users, Plane, Folder, Settings, FileText, PersonStanding, ShieldCheck, ClipboardList, ChevronLeft, ChevronRight } from "lucide-react"
import { SidebarItem } from "@/components/layout/SidebarItem"
import { SidebarLogout } from "@/components/layout/SidebarLogout"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const sidebarItems = [
  { name: "Início", icon: Home, href: "/" },
  { name: "Viajantes", icon: Users, href: "/viajantes" },
  { name: "Guias", icon: PersonStanding, href: "/guias" },
  {
    name: "Missões",
    icon: Plane,
    href: "/missoes",
    subItems: [
      { name: "Grupos", icon: Users, href: "/missoes/grupos" }
    ]
  },
  { name: "Fornecedores", icon: Folder, href: "/fornecedores" },
  { name: "Administração", icon: ShieldCheck, href: "/administracao" },
  { name: "Cotações", icon: ClipboardList, href: "/cotacoes" },
]

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  return (
    <aside className={cn(
      "bg-white flex flex-col h-full border-r border-border/40 shrink-0 transition-all duration-300",
      isCollapsed ? "w-[70px]" : "w-[240px]"
    )}>
      <nav className="flex-1 px-4 py-6 space-y-1">
        {sidebarItems.map((item) => (
          <SidebarItem
            key={item.name}
            name={item.name}
            icon={item.icon}
            href={item.href}
            subItems={item.subItems}
            isCollapsed={isCollapsed}
          />
        ))}
      </nav>
      <SidebarLogout isCollapsed={isCollapsed} onToggle={onToggle} />
    </aside>
  )
}
