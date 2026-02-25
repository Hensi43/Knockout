import { supabase } from '@/lib/supabase';
import { Session } from '@/types/database';
import { tableService } from './table-service';

export const sessionService = {
    async startSession(tableId: string, playerCount: number = 1, userId: string | null = null) {
        if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
            return {
                id: Math.random().toString(36).substr(2, 9),
                table_id: tableId,
                user_id: userId,
                start_time: new Date().toISOString(),
                status: 'active',
                player_count: playerCount,
                total_amount: 0,
                discount_amount: 0,
                created_at: new Date().toISOString()
            } as Session;
        }
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
        if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
            return [
                {
                    id: 's1',
                    table_id: '1',
                    start_time: new Date(Date.now() - 3600000).toISOString(),
                    status: 'active',
                    player_count: 2,
                    snooker_tables: { name: 'Table 1', hourly_rate: 210 }
                },
                {
                    id: 's2',
                    table_id: '4',
                    start_time: new Date(Date.now() - 1800000).toISOString(),
                    status: 'active',
                    player_count: 1,
                    snooker_tables: { name: 'Table 4', hourly_rate: 210 }
                }
            ];
        }
        const { data, error } = await supabase
            .from('sessions')
            .select('*, snooker_tables(name, hourly_rate)')
            .eq('status', 'active');

        if (error) throw error;
        return data;
    }
};
