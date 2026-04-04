import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export async function POST(request: Request) {
    try {
        const supabase = getSupabaseAdmin();
        const { sessionId, tableId, discount } = await request.json();

        if (!sessionId || !tableId) {
            return NextResponse.json({ error: 'Session ID and Table ID are required' }, { status: 400 });
        }

        // Get session and table
        const { data: sessionData, error: sessionError } = await supabase
            .from('sessions')
            .select('start_time, status')
            .eq('id', sessionId)
            .single();

        if (sessionError) throw sessionError;
        if (sessionData.status !== 'active') {
            return NextResponse.json({ error: 'Session is not active' }, { status: 400 });
        }

        const { data: tableData, error: tableError } = await supabase
            .from('snooker_tables')
            .select('hourly_rate')
            .eq('id', tableId)
            .single();

        if (tableError) throw tableError;

        // Calculate duration and cost
        const start = new Date(sessionData.start_time).getTime();
        const now = Date.now();
        const elapsedMs = Math.max(0, now - start);
        const minutes = elapsedMs / (1000 * 60);

        const totalCost = minutes * tableData.hourly_rate;

        const { data: orderItems, error: ordersError } = await supabase
            .from('order_items')
            .select(`
                quantity, 
                price_at_time,
                products ( name )
            `)
            .eq('session_id', sessionId);

        if (ordersError) throw ordersError;

        const timeCost = totalCost;
        const snacksTotal = orderItems.reduce((acc, item) => acc + (item.quantity * item.price_at_time), 0);
        const subtotal = timeCost + snacksTotal;

        const finalAmount = Math.max(0, subtotal - (discount || 0));

        // update session record
        const { data: updatedSession, error: updateSessionError } = await supabase
            .from('sessions')
            .update({
                end_time: new Date().toISOString(),
                total_amount: finalAmount,
                discount_amount: discount || 0,
                status: 'completed'
            })
            .eq('id', sessionId)
            .select();

        if (updateSessionError) throw updateSessionError;

        // Mark table AVAILABLE
        const { error: updateTableError } = await supabase
            .from('snooker_tables')
            .update({ status: 'available' })
            .eq('id', tableId);

        if (updateTableError) throw updateTableError;

        // Build Receipt Data
        const receipt = {
            session: updatedSession[0],
            breakdown: {
                minutes: minutes,
                ratePerMinute: tableData.hourly_rate,
                timeCost: timeCost,
                snacks: orderItems.map(item => ({
                    name: (item.products as any)?.name || 'Unknown Item',
                    quantity: item.quantity,
                    price: item.price_at_time,
                    total: item.quantity * item.price_at_time
                })),
                snacksTotal: snacksTotal,
                subtotal: subtotal,
                discount: discount || 0,
                finalAmount: finalAmount
            }
        };

        return NextResponse.json(receipt);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
