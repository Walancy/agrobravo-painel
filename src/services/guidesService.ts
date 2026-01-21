
export type MissionGuide = {
    id: string // ID from lideresGrupo or user ID? Ideally unique per row.
    nome: string
    foto: string | null
    grupo_nome: string
    telefone: string | null
    nivel_ingles: string | null
    email: string
    tipoUser: string | null // Guide type

    // Raw IDs for reference
    user_id: string
    grupo_id: string
}

const API_URL = '/api/mission-guides';

export const guidesService = {
    // Get all guides for a specific mission
    getGuidesByMissionId: async (missionId: string) => {
        const response = await fetch(`${API_URL}?missionId=${missionId}`);
        if (!response.ok) throw new Error('Failed to fetch guides');
        const data = await response.json();
        return processGuides(data);
    },

    getGuidesByGroupId: async (groupId: string) => {
        const response = await fetch(`${API_URL}?groupId=${groupId}`);
        if (!response.ok) throw new Error('Failed to fetch guides');
        const data = await response.json();
        return processGuides(data);
    },

    assignGuidesToGroup: async (groupId: string, guideIds: string[]) => {
        const response = await fetch(`${API_URL}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ grupo_id: groupId, lider_ids: guideIds })
        });
        if (!response.ok) throw new Error('Failed to assign guides');
        return await response.json();
    },

    // Get all guides (global list for /guias page)
    getAllGuides: async () => {
        const response = await fetch('/api/guides');
        if (!response.ok) throw new Error('Failed to fetch guides');
        const data = await response.json();

        // Map backend response to Frontend Guide type
        return data.map((item: any) => ({
            id: item.id,
            name: item.nome || 'Nome não encontrado',
            lastMission: item.lastMission || '-',
            phone: item.telefone || '-',
            englishLevel: item.nivel_ingles || '-',
            email: item.email || '-',
            type: item.cargo || 'Guia', // Using cargo for type
            photo: item.foto
        }));
    },

    createGuide: async (guideData: any) => {
        const response = await fetch('/api/guides', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(guideData),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create guide');
        }
        return response.json();
    },

    getGuideById: async (id: string) => {
        const response = await fetch(`/api/guides/${id}`);
        if (!response.ok) throw new Error('Failed to fetch guide');
        const data = await response.json();

        // Map backend permissions to frontend accessLevel
        let accessLevel = 'viewer';
        const perms = data.permissoes || [];
        if (perms.includes('TODAS_AS_PERMISSOES')) {
            accessLevel = 'admin';
        } else if (perms.includes('GERENCIAR_USUARIOS') || perms.includes('EDITAR_MISSOES')) {
            accessLevel = 'manager';
        }

        // Map backend response to Frontend Guide form structure
        return {
            name: data.nome || '',
            email: data.email || '',
            document: data.cpf || '',
            phone: data.telefone || '',
            accessLevel: accessLevel,
            guideType: data.cargo || '',
            nationality: data.nacionalidade || '',
            languages: data.idiomas?.[0] || '',
            englishLevel: data.nivel_ingles || '',
            city: data.cidade || '',
            state: data.estado || '',
            cep: data.cep || '',
            street: data.rua || '',
            neighborhood: data.bairro || '',
            number: data.numero || '',
            complement: data.complemento || '',
            observations: data.observacoes || '',
            photo: data.foto
        };
    },

    updateGuide: async (id: string, guideData: any) => {
        const response = await fetch(`/api/guides/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(guideData),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update guide');
        }
        return response.json();
    },

    deleteGuide: async (id: string) => {
        const response = await fetch(`/api/guides/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete guide');
        }
        return response.json();
    },

    unassignGuideFromGroup: async (liderId: string, groupId: string) => {
        const response = await fetch(`${API_URL}?liderId=${liderId}&groupId=${groupId}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to unassign guide');
        }
        return response.json();
    }
}

// Convert nested Supabase response to flat structure for the UI
function processGuides(data: any[]): MissionGuide[] {
    return data.map((item: any) => ({
        id: `${item.lider_id}_${item.grupo_id}`,
        user_id: item.lider_id,
        grupo_id: item.grupo_id,
        nome: item.users?.nome || 'Nome não encontrado',
        foto: item.users?.foto || null,
        grupo_nome: item.grupos?.nome || 'Sem grupo',
        telefone: item.users?.telefone || '-',
        nivel_ingles: item.users?.nivel_ingles || '-',
        email: item.users?.email || '-',
        tipoUser: item.users?.cargo || 'Guia',
    }));
}
