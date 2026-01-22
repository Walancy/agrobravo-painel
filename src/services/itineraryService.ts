const API_URL = '/api/itinerary';

export type ItineraryEvent = {
    id: string
    grupo_id: string
    tipo: string
    titulo: string
    subtitulo?: string
    data: string
    hora_inicio: string
    hora_fim?: string
    duracao?: string
    preco?: string
    status?: 'confirmed' | 'quoting' | 'quoted' | 'free'
    localizacao?: string
    de?: string
    para?: string
    codigo_de?: string
    codigo_para?: string
    hora_de?: string
    hora_para?: string
    motorista?: string
    logos?: string[]
    atrasado?: boolean
    atraso?: string
    favorito?: boolean
    descricao?: string
    passageiros?: (string | number)[]
    possui_transfer?: boolean
    site_url?: string
    source?: 'eventos' | 'gruposAtividades' // Track source table
    created_at?: string
    evento_referencia_id?: string
    transfer_data?: string
    transfer_hora?: string
    conexoes?: any[]
}

export const itineraryService = {
    // Get all events for a group
    getEventsByGroupId: async (groupId: string): Promise<ItineraryEvent[]> => {
        const response = await fetch(`${API_URL}?groupId=${groupId}`);
        if (!response.ok) throw new Error('Failed to fetch itinerary events');
        const data = await response.json();
        return data.events || [];
    },

    // Create a new event
    createEvent: async (event: Partial<ItineraryEvent>) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event)
        });
        if (!response.ok) throw new Error('Failed to create event');
        return await response.json();
    },

    // Update an event
    updateEvent: async (id: string, updates: Partial<ItineraryEvent>) => {
        const response = await fetch(API_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...updates })
        });
        if (!response.ok) throw new Error('Failed to update event');
        return await response.json();
    },

    // Delete an event
    deleteEvent: async (id: string) => {
        const response = await fetch(`${API_URL}?id=${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete event');
        return await response.json();
    }
}
