import { SnookerTable } from '@/types/database';

export const tableService = {
    async getTables() {
        const res = await fetch('/api/tables');
        if (!res.ok) throw new Error('Failed to fetch tables');
        return res.json() as Promise<SnookerTable[]>;
    },

    async createTable(name: string, hourlyRate: number) {
        const res = await fetch('/api/tables', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, hourlyRate })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create table');
        return data as SnookerTable;
    },

    async updateTableStatus(id: string, status: 'available' | 'occupied') {
        return this.updateTableDetails(id, { status });
    },

    async updateTableDetails(id: string, updates: Partial<SnookerTable>) {
        const res = await fetch(`/api/tables/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update table details');
        return data as SnookerTable;
    },

    async deleteTable(id: string) {
        const res = await fetch(`/api/tables/${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Failed to delete table');
        }
    }
};
