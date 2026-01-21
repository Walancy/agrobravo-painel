
export const notificationsService = {
    getNotificationsByMissionId: async (missionId: string) => {
        const response = await fetch(`/api/notifications?missionId=${missionId}`);
        if (!response.ok) throw new Error('Failed to fetch notifications');
        return response.json();
    },

    sendNotification: async (data: { groupId: string, title: string, message: string, senderId?: string }) => {
        const response = await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to send notification');
        }

        return response.json();
    },

    deleteNotification: async (id: string, postId?: string) => {
        let url = `/api/notifications?id=${id}`;
        if (postId) {
            // postId now actually holds the created_at timestamp string
            url = `/api/notifications?createdAt=${encodeURIComponent(postId)}`;
        }
        const response = await fetch(url, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete notification');
        return response.json();
    }
}
