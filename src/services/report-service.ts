import { supabase } from '@/lib/supabase';

export const reportService = {
    async getDailyRevenue() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data, error } = await supabase
            .from('sessions')
            .select('total_amount, created_at')
            .eq('status', 'completed')
            .gte('created_at', today.toISOString());

        if (error) throw error;
        return data.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);
    },

    async getMonthlyRevenue() {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { data, error } = await supabase
            .from('sessions')
            .select('total_amount')
            .eq('status', 'completed')
            .gte('created_at', startOfMonth.toISOString());

        if (error) throw error;
        return data.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);
    },

    async getMostUsedTable() {
        const { data, error } = await supabase
            .from('sessions')
            .select('table_id, snooker_tables(name)')
            .eq('status', 'completed');

        if (error) throw error;

        const usage: Record<string, { count: number, name: string }> = {};
        data.forEach((session: any) => {
            const id = session.table_id;
            if (!usage[id]) {
                usage[id] = { count: 0, name: session.snooker_tables.name };
            }
            usage[id].count++;
        });

        const sorted = Object.values(usage).sort((a, b) => b.count - a.count);
        return sorted[0] || { name: 'N/A', count: 0 };
    },

    async getRevenueStats() {
        const { data, error } = await supabase
            .from('sessions')
            .select('total_amount, created_at')
            .eq('status', 'completed')
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
    }
};
