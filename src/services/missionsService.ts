export type Mission = {
    id: string
    nome: string
    continente: string | null
    paises: string[] | null
    data_inicio: string | null
    data_fim: string | null
    observacoes: string | null
    logo: string | null
    documentos_exigidos: string[] | null
    status: string | null
    created_at: string
    criado_por: string | null
    editado_por: string | null
    deletado_por: string | null
    deleted_at: string | null
    criador?: { nome: string } | null
    // Legacy/UI fields mapping (optional, or remove if UI updates)
    custo_cotado?: number | null
    custo_atingido?: number | null
    destino?: string | null // Computed from paises?
}

const API_URL = '/api/missions';

export const missionsService = {
    getAllMissions: async () => {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch missions');
        return await response.json() as Mission[];
    },

    getMissionById: async (id: string) => {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('Failed to fetch mission');
        return await response.json() as Mission;
    },

    createMission: async (mission: Partial<Mission>) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mission)
        });
        if (!response.ok) throw new Error('Failed to create mission');
        return await response.json() as Mission;
    },

    updateMission: async (id: string, updates: Partial<Mission>) => {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        if (!response.ok) throw new Error('Failed to update mission');
        return await response.json() as Mission;
    },

    deleteMission: async (id: string) => {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete mission');
    }
}
