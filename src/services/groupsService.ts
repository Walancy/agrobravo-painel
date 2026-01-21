// This service now connects to our internal Next.js API, which then talks to Supabase
// Flow: System (Component) -> this Service -> Next.js API (Server) -> Supabase

export type Mission = {
    id: string
    name: string
    start_date: string | null
    end_date: string | null
    status: string
    created_at: string
}

// Updated to match 'grupos' table schema
// {
//   id: uuid, nome: text, data_inicio: date, data_fim: date, 
//   missao_id: uuid, logo: text, status: text, vagas: int, ...
// }
export type MissionGroup = {
    id: string
    missao_id: string
    nome: string
    logo: string | null
    vagas: number
    // Derived or specific fields
    participants_count?: number // Usually counted from relation
    guides_count?: number
    next_event?: {
        titulo: string
        hora: string
    } | null
    status: string
    data_inicio: string | null
    data_fim: string | null
    created_at: string
    custo_cotado: number | null
    custo_atingido: number | null
    missoes?: {
        nome: string
        logo?: string | null
    }
    missionName?: string // Flattened for easier display
    missionLogo?: string | null
}

const API_URL = '/api/mission-groups';

export const groupsService = {
    // Get all groups for a specific mission
    getGroupsByMissionId: async (missionId: string) => {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch groups');
        const data = await response.json();
        const groups = data.filter((g: any) => g.missao_id === missionId) as MissionGroup[];
        return processGroups(groups);
    },

    // Get all groups
    getAllGroups: async () => {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch groups');
        const data = await response.json() as MissionGroup[];
        return processGroups(data);
    },

    // Get a single group by ID
    getGroupById: async (id: string) => {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('Failed to fetch group');
        const data = await response.json();
        // Wrap in array to reuse processGroups, then destructure
        const [processed] = processGroups([data]);
        return processed;
    },

    // Create a new group
    createGroup: async (group: Partial<MissionGroup>) => {
        // Map frontend fields back to DB fields if needed, currently straightforward mapping
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(group)
        });
        if (!response.ok) throw new Error('Failed to create group');
        return await response.json() as MissionGroup;
    },

    // Update a group
    updateGroup: async (id: string, updates: Partial<MissionGroup>) => {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        if (!response.ok) throw new Error('Failed to update group');
        return await response.json() as MissionGroup;
    },

    // Delete a group
    deleteGroup: async (id: string) => {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete group');
    }
}

// Helper to ensure fields exist or have default values if DB is messy
function processGroups(groups: any[]): MissionGroup[] {
    return groups.map(g => ({
        ...g,
        participants_count: g.participants_count ?? (g.vagas || 0),
        guides_count: g.guides_count ?? 0,
        custo_cotado: g.custo_cotado ?? 0,
        custo_atingido: g.custo_atingido ?? 0,
        next_event: g.next_event || null,
        missionName: g.missoes?.nome || 'Sem missão',
        missionLogo: g.missoes?.logo || null
    }));
}
