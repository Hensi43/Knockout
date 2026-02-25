import { supabase } from '@/lib/supabase';
import { SnookerTable } from '@/types/database';

export const tableService = {
    async getTables() {
        if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
            return [
                { id: '1', name: 'Table 1', hourly_rate: 210, status: 'occupied', created_at: new Date().toISOString() },
                { id: '2', name: 'Table 2', hourly_rate: 210, status: 'available', created_at: new Date().toISOString() },
                { id: '3', name: 'Table 3', hourly_rate: 210, status: 'available', created_at: new Date().toISOString() },
                { id: '4', name: 'Table 4', hourly_rate: 210, status: 'occupied', created_at: new Date().toISOString() },
            ] as SnookerTable[];
        }
        const { data, error } = await supabase
            .from('snooker_tables')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        return data as SnookerTable[];
    },

    async createTable(name: string, hourlyRate: number) {
        const { data, error } = await supabase
            .from('snooker_tables')
            .insert([{ name, hourly_rate: hourlyRate, status: 'available' }])
            .select();

        if (error) throw error;
        return data[0];
    },

    async updateTableStatus(id: string, status: 'available' | 'occupied') {
        const { error } = await supabase
            .from('snooker_tables')
            .update({ status })
            .eq('id', id);

        if (error) throw error;
    },

    async deleteTable(id: string) {
        const { error } = await supabase
            .from('snooker_tables')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
