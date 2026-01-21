import { createClient } from "@/lib/supabase/client"

export type Role = {
    id: string
    name: string
    permissions: string[]
    created_at: string
}

export const permissionsService = {
    getAllRoles: async (): Promise<Role[]> => {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('roles')
            .select('*')
            .order('name')

        if (error) throw error
        return data
    },

    createRole: async (name: string, permissions: string[]) => {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('roles')
            .insert({ name, permissions })
            .select()
            .single()

        if (error) throw error
        return data
    },

    updateRole: async (id: string, name: string, permissions: string[]) => {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('roles')
            .update({ name, permissions })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    deleteRole: async (id: string) => {
        const supabase = createClient()
        const { error } = await supabase
            .from('roles')
            .delete()
            .eq('id', id)

        if (error) throw error
    }
}
