
export type Collaborator = {
    id: string
    name: string
    email: string
    accessLevel: string
    createdAt: string
    createdBy: string
    status: 'Ativo' | 'Inativo'
    photo?: string | null
}

export type CollaboratorFormData = {
    name: string
    email: string
    document: string
    phone: string
    permissoes: string[]
    city: string
    state: string
    cep: string
    street: string
    neighborhood: string
    number: string
    complement: string
    photo?: string | null
}

export const collaboratorsService = {
    getAllCollaborators: async () => {
        const response = await fetch('/api/collaborators');
        if (!response.ok) throw new Error('Failed to fetch collaborators');
        const data = await response.json();
        return data as Collaborator[];
    },

    getCollaboratorById: async (id: string): Promise<CollaboratorFormData> => {
        const response = await fetch(`/api/collaborators/${id}`);
        if (!response.ok) throw new Error('Failed to fetch collaborator');
        const data = await response.json();

        // Map backend response to Frontend form structure
        return {
            name: data.nome || '',
            email: data.email || '',
            document: data.cpf || '',
            phone: data.telefone || '',
            permissoes: data.permissoes || [],
            city: data.cidade || '',
            state: data.estado || '',
            cep: data.cep || '',
            street: data.rua || '',
            neighborhood: data.bairro || '',
            number: data.numero || '',
            complement: data.complemento || '',
            photo: data.foto
        };
    },

    createCollaborator: async (data: CollaboratorFormData) => {
        const response = await fetch('/api/collaborators', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create collaborator');
        }
        return response.json();
    },

    updateCollaborator: async (id: string, data: CollaboratorFormData) => {
        const response = await fetch(`/api/collaborators/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update collaborator');
        }
        return response.json();
    },

    deleteCollaborator: async (id: string) => {
        const response = await fetch(`/api/collaborators/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete collaborator');
        return response.json();
    },

    checkEmailExists: async (email: string) => {
        const response = await fetch(`/api/users/check-email?email=${encodeURIComponent(email)}`);
        if (!response.ok) throw new Error('Failed to check email');
        const data = await response.json();
        return data.exists as boolean;
    }
}
