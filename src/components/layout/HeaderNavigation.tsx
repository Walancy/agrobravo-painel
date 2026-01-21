"use client"

import { usePathname, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

const pageTitles: Record<string, string> = {
    "/": "Início",
    "/missoes": "Gestão de Missões",
    "/missoes/grupos": "Gestão de Grupos",
    "/viajantes": "Viajantes",
    "/guias": "Guias",
    "/fornecedores": "Fornecedores",
    "/admin": "Administração",
    "/cotacoes": "Cotações",
}

export function HeaderNavigation() {
    const pathname = usePathname()
    const router = useRouter()
    const title = pageTitles[pathname] || "AgroBravo Enterprise"

    return (
        <div className="flex items-center gap-4">
            <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 h-8 w-8"
                onClick={() => router.back()}
            >
                <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        </div>
    )
}
