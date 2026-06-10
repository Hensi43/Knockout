import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export async function GET() {
    try {
        const supabase = getSupabaseAdmin();

        // Fetch active order items (KOT orders) that are either pending or preparing
        const { data, error } = await supabase
            .from('order_items')
            .select(`
                id,
                session_id,
                product_id,
                quantity,
                price_at_time,
                status,
                created_at,
                products ( name ),
                sessions (
                    id,
                    table_id,
                    snooker_tables ( name )
                )
            `)
            .in('status', ['pending', 'preparing'])
            .order('created_at', { ascending: true });

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
