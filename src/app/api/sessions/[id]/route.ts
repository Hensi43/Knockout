import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export async function DELETE(request: Request, context: any) {
    try {
        const params = await context.params;
        const { id } = params;
        
        if (!id) return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });

        const supabase = getSupabaseAdmin();

        // Get table ID before deleting
        const { data: sessionData, error: sessionError } = await supabase
            .from('sessions')
            .select('table_id')
            .eq('id', id)
            .single();

        if (sessionError) throw sessionError;

        // Delete session entirely (voiding it)
        const { error: deleteError } = await supabase
            .from('sessions')
            .delete()
            .eq('id', id);

        if (deleteError) throw deleteError;

        // Release the table
        if (sessionData && sessionData.table_id) {
            await supabase
                .from('snooker_tables')
                .update({ status: 'available' })
                .eq('id', sessionData.table_id);
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
