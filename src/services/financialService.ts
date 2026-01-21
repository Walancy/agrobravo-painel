
export const financialService = {
    getFinancialData: async (groupId: string) => {
        const response = await fetch(`/api/financial?groupId=${groupId}`);
        if (!response.ok) throw new Error('Failed to fetch financial data');
        return response.json();
    },

    addTransaction: async (data: {
        groupId: string,
        category: string,
        spent: number,
        missing?: number,
        location: string,
        userId: string,
        status?: string,
        reimbursementDate?: string
    }) => {
        const response = await fetch('/api/financial', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'transaction', ...data })
        });
        if (!response.ok) throw new Error('Failed to add transaction');
        return response.json();
    },

    addBudget: async (groupId: string, amount: number) => {
        const response = await fetch('/api/financial', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'budget_add', groupId, amount })
        });
        if (!response.ok) throw new Error('Failed to add budget');
        return response.json();
    },
    updateStatus: async (id: string, status: string) => {
        const response = await fetch('/api/financial', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status })
        });
        if (!response.ok) throw new Error('Failed to update status');
        return response.json();
    }
}
