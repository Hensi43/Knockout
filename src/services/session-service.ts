import { Session } from '@/types/database';

export const sessionService = {
    async startSession(tableId: string, playerCount: number = 1, userId: string | null = null) {
        const res = await fetch('/api/sessions/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tableId, playerCount, userId })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to start session');
        return data as Session;
    },

    async endSession(sessionId: string, tableId: string, totalAmount: number, discountAmount: number = 0) {
        const res = await fetch('/api/sessions/end', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, tableId, discount: discountAmount })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to end session');
        return data;
    },

    async getActiveSessions() {
        const res = await fetch('/api/sessions/active');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch active sessions');
        return data; 
    },

    async cancelSession(sessionId: string) {
        const res = await fetch(`/api/sessions/${sessionId}`, { method: 'DELETE' });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Failed to cancel session');
        }
    },

    async transferSession(sessionId: string, newTableId: string) {
        const res = await fetch(`/api/sessions/${sessionId}/transfer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newTableId })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to transfer session');
        return data;
    }
};
