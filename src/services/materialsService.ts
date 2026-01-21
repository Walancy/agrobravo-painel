export const materialsService = {
    getMaterials: async (groupId: string) => {
        const response = await fetch(`/api/materials?groupId=${groupId}`);
        if (!response.ok) throw new Error('Failed to fetch materials');
        return response.json();
    },

    addMaterial: async (data: FormData) => {
        const response = await fetch('/api/materials', {
            method: 'POST',
            body: data,
            // Do not set Content-Type header when sending FormData, 
            // browser/fetch sets it automatically with boundary
        });
        if (!response.ok) throw new Error('Failed to add material');
        return response.json();
    },

    deleteMaterial: async (id: string) => {
        const response = await fetch(`/api/materials?id=${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete material');
        return response.json();
    },

    updateStatus: async (id: string, status: "Visivel" | "Oculto") => {
        const response = await fetch('/api/materials', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status })
        });
        if (!response.ok) throw new Error('Failed to update material status');
        return response.json();
    }
}
