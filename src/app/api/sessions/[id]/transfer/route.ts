import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export async function POST(request: Request, context: any) {
    try {
        const params = await context.params;
        const { id } = params;
        const { newTableId } = await request.json();
        
        if (!id || !newTableId) {
            return NextResponse.json({ error: 'Session ID and new Table ID are required' }, { status: 400 });
        }

        const supabase = getSupabaseAdmin();

        // 1. Get current session to find old table ID
        const { data: sessionData, error: sessionError } = await supabase
            .from('sessions')
            .select('table_id')
            .eq('id', id)
            .single();

        if (sessionError) throw sessionError;
        const oldTableId = sessionData.table_id;

        // 2. Update new table status to occupied
        const { error: newTableError } = await supabase
            .from('snooker_tables')
            .update({ status: 'occupied' })
            .eq('id', newTableId);
        
        if (newTableError) throw newTableError;

        // 3. Re-link session to new table
        const { error: updateSessionError } = await supabase
            .from('sessions')
            .update({ table_id: newTableId })
            .eq('id', id);

        if (updateSessionError) throw updateSessionError;

        // 4. Update old table status back to available
        const { error: oldTableError } = await supabase
            .from('snooker_tables')
            .update({ status: 'available' })
            .eq('id', oldTableId);

        if (oldTableError) throw oldTableError;

        return NextResponse.json({ success: true, oldTableId, newTableId });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
