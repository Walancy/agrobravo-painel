
import { createClient } from "@/lib/supabase/client"

export type Country = {
    id: number
    pais: string
    continente: string
    ddi: string
    bandeira: string
}

export const countriesService = {
    getAllCountries: async () => {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('paises')
            .select('*')
            .order('pais')

        if (error) throw error
        return data as Country[]
    }
}
