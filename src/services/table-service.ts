import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { SnookerTable } from '@/types/database';

export const tableService = {
    async getTables() {
        const { data, error } = await supabase
            .from('snooker_tables')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        return data as SnookerTable[];
    },

    async createTable(name: string, hourlyRate: number) {
        let client = supabase;
        if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
            client = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
            );
        }

        const { data, error } = await client
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
