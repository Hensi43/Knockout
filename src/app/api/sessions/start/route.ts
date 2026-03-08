import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export async function POST(request: Request) {
    try {
        const supabase = getSupabaseAdmin();
        const { tableId, playerCount, userId } = await request.json();

        if (!tableId) {
            return NextResponse.json({ error: 'Table ID is required' }, { status: 400 });
        }

        // Check table status
        const { data: tableData, error: tableError } = await supabase
            .from('snooker_tables')
            .select('status')
            .eq('id', tableId)
            .single();

        if (tableError) throw tableError;
        if (tableData.status === 'occupied') {
            return NextResponse.json({ error: 'Table is already occupied' }, { status: 400 });
        }

        // Create session
        const { data: sessionData, error: sessionError } = await supabase
            .from('sessions')
            .insert([{
                table_id: tableId,
                user_id: userId || null,
                start_time: new Date().toISOString(),
                player_count: playerCount || 1,
                status: 'active'
            }])
            .select();

        if (sessionError) throw sessionError;

        // Mark table OCCUPIED
        const { error: updateError } = await supabase
            .from('snooker_tables')
            .update({ status: 'occupied' })
            .eq('id', tableId);

        if (updateError) throw updateError;

        return NextResponse.json(sessionData[0]);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
