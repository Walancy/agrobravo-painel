"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

export type UserPermissions = {
    tipoUser: string[]
    permissoes: string[]
    isLoading: boolean
}

export function useUserPermissions() {
    const [permissions, setPermissions] = useState<UserPermissions>({
        tipoUser: [],
        permissoes: [],
        isLoading: true
    })

    useEffect(() => {
        const fetchPermissions = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                const { data: profile } = await supabase
                    .from('users')
                    .select('tipoUser, permissoes')
                    .eq('id', user.id)
                    .single()

                if (profile) {
                    let allPermissions = [...(profile.permissoes || [])]
                    const userRoles = profile.tipoUser || []

                    // Fetch permissions for roles
                    if (userRoles.length > 0) {
                        try {
                            const { data: rolesData, error: rolesError } = await supabase
                                .from('roles')
                                .select('permissions')
                                .in('name', userRoles)

                            if (!rolesError && rolesData) {
                                rolesData.forEach(role => {
                                    if (role.permissions) {
                                        allPermissions = [...allPermissions, ...role.permissions]
                                    }
                                })
                            }
                        } catch (e) {
                            // Ignore error if roles table doesn't exist
                            console.warn("Could not fetch roles permissions", e)
                        }

                        // Legacy/Fallback support for hardcoded roles if not in DB or DB error
                        if (userRoles.includes('MASTER')) {
                            allPermissions.push('TODAS_AS_PERMISSOES')
                        }
                        // We can add other legacy mappings here if needed, but MASTER is the critical one
                    }

                    // Deduplicate permissions
                    allPermissions = Array.from(new Set(allPermissions))

                    setPermissions({
                        tipoUser: userRoles,
                        permissoes: allPermissions,
                        isLoading: false
                    })
                    return
                }
            }

            setPermissions(prev => ({ ...prev, isLoading: false }))
        }

        fetchPermissions()
    }, [])

    const hasPermission = (requiredPermission?: string) => {
        if (!requiredPermission) return true
        if (permissions.isLoading) return false // Fail safe while loading

        // Master has access to everything
        if (permissions.tipoUser.includes('MASTER')) return true
        if (permissions.permissoes.includes('TODAS_AS_PERMISSOES')) return true

        return permissions.permissoes.includes(requiredPermission)
    }

    const isMaster = () => {
        return permissions.tipoUser.includes('MASTER') || permissions.permissoes.includes('TODAS_AS_PERMISSOES')
    }

    return { ...permissions, hasPermission, isMaster }
}
