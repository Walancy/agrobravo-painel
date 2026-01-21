"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import * as React from "react"

export function HeaderProfile() {
    const supabase = createClient()
    const router = useRouter()
    const [user, setUser] = React.useState<any>(null)
    const [profile, setProfile] = React.useState<any>(null)

    React.useEffect(() => {
        const getUserData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUser(user)
                const { data: profileData } = await supabase
                    .from('users')
                    .select('nome, tipoUser, foto, permissoes')
                    .eq('id', user.id)
                    .single()
                setProfile(profileData)
            }
        }
        getUserData()
    }, [supabase])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push("/login")
        router.refresh()
    }

    const fullName = profile?.nome || user?.user_metadata?.nome || user?.email?.split('@')[0] || "Usuário"
    const firstName = fullName.split(' ')[0]
    const initials = firstName.substring(0, 2).toUpperCase()

    // Get the most relevant access level
    // Get the most relevant access level
    const accessLevel = profile?.tipoUser?.includes('MASTER') || profile?.permissoes?.includes('TODAS_AS_PERMISSOES') ? 'Master' :
        profile?.tipoUser?.includes('COLABORADOR') ? 'Colaborador' :
            'Usuário'

    return (
        <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-gray-900 leading-tight">{firstName}</div>
                <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-100 mt-0.5">
                    {accessLevel}
                </div>
            </div>
            <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-gray-100">
                <AvatarImage src={profile?.foto || user?.user_metadata?.foto} />
                <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">
                    {initials}
                </AvatarFallback>
            </Avatar>
        </div>
    )
}
