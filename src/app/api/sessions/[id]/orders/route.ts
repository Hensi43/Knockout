import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export async function GET(request: Request, context: any) {
    try {
        const { id } = context.params;
        if (!id) return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });

        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase
            .from('order_items')
            .select('*, products(name, price)')
            .eq('session_id', id);

        if (error) throw error;
        return NextResponse.json(data || []);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
