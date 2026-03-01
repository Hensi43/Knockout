import { supabase } from '@/lib/supabase';
import { Session } from '@/types/database';
import { tableService } from './table-service';

export const sessionService = {
    async startSession(tableId: string, playerCount: number = 1, userId: string | null = null) {
        const { data, error } = await supabase
            .from('sessions')
            .insert([{
                table_id: tableId,
                user_id: userId,
                start_time: new Date().toISOString(),
                player_count: playerCount,
                status: 'active'
            }])
            .select();

        if (error) throw error;

        // Update table status to occupied
        await tableService.updateTableStatus(tableId, 'occupied');

        return data[0] as Session;
    },

    async endSession(sessionId: string, tableId: string, totalAmount: number, discountAmount: number = 0) {
        const { error } = await supabase
            .from('sessions')
            .update({
                end_time: new Date().toISOString(),
                total_amount: totalAmount,
                discount_amount: discountAmount,
                status: 'completed'
            })
            .eq('id', sessionId);

        if (error) throw error;

        // Update table status back to available
        await tableService.updateTableStatus(tableId, 'available');
    },

    async getActiveSessions() {
        const { data, error } = await supabase
            .from('sessions')
            .select('*, snooker_tables(name, hourly_rate)')
            .eq('status', 'active');

        if (error) throw error;
        return data;
    }
};
