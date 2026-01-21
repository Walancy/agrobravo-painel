export const travelersService = {
    getAllTravelers: async (params?: { missionId?: string, groupId?: string }) => {
        const queryParams = new URLSearchParams();
        if (params?.missionId) queryParams.append('missionId', params.missionId);
        if (params?.groupId) queryParams.append('groupId', params.groupId);

        const url = `/api/travelers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch travelers');
        return response.json();
    },

    deleteTraveler: async (id: string, groupId?: string) => {
        const queryParams = new URLSearchParams();
        if (groupId) queryParams.append('groupId', groupId);

        const url = `/api/travelers/${id}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

        const response = await fetch(url, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete traveler');
        return response.json();
    },

    inviteTravelers: async (data: { groupId: string, invites: { value: string, type: string }[] }) => {
        const response = await fetch('/api/travelers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to invite travelers');
        }
        return response.json();
    }
};
