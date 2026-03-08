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
        return data; // contains joined snooker_tables
    }
};
