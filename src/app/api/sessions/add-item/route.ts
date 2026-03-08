import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { sessionId, productId, quantity, priceAtTime } = body;

        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase
            .from('order_items')
            .insert({
                session_id: sessionId,
                product_id: productId,
                quantity,
                price_at_time: priceAtTime
            })
            .select()
            .single();

        if (error) throw error;

        // Optionally decrement stock here (skipping for simplicity/safety unless strictly required)

        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
