"use client"

import { LogOut, ChevronLeft, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarLogoutProps {
    isCollapsed?: boolean
    onToggle?: () => void
}

export function SidebarLogout({ isCollapsed = false, onToggle }: SidebarLogoutProps) {
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push("/login")
        router.refresh()
    }

    return (
        <div className="p-4 border-t border-border/40 mt-auto">
            <div className={cn("flex items-center gap-2", isCollapsed && "flex-col")}>
                <button
                    onClick={handleLogout}
                    className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors group relative",
                        isCollapsed ? "justify-center flex-1 w-full" : "flex-1"
                    )}
                    title={isCollapsed ? "Log out" : undefined}
                >
                    <LogOut className="w-5 h-5" />
                    {!isCollapsed && "Log out"}
                    {isCollapsed && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                            Log out
                        </div>
                    )}
                </button>

                {onToggle && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "h-10 text-gray-400 hover:text-gray-600 shrink-0",
                            isCollapsed ? "w-full" : "w-10"
                        )}
                        onClick={onToggle}
                        title={isCollapsed ? "Expandir menu" : "Contrair menu"}
                    >
                        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </Button>
                )}
            </div>
        </div>
    )
}
