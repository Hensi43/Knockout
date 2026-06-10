import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const supabase = getSupabaseAdmin();
        const params = await context.params;
        const id = params.id;
        const body = await request.json();
        const { status } = body;

        if (!status || !['pending', 'preparing', 'served', 'cancelled'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        // If order item is cancelled, we revert inventory deduction and remove the item
        if (status === 'cancelled') {
            // Fetch current item to get product_id and quantity
            const { data: item, error: fetchErr } = await supabase
                .from('order_items')
                .select('product_id, quantity')
                .eq('id', id)
                .single();
            
            if (fetchErr) throw fetchErr;

            if (item) {
                // Fetch product details
                const { data: product } = await supabase
                    .from('products')
                    .select('stock')
                    .eq('id', item.product_id)
                    .single();
                
                if (product) {
                    // Re-increment stock in products
                    await supabase
                        .from('products')
                        .update({ stock: product.stock + item.quantity })
                        .eq('id', item.product_id);
                }
            }

            // Delete order item so it doesn't count in final session checkout bill
            const { error: deleteErr } = await supabase
                .from('order_items')
                .delete()
                .eq('id', id);
            
            if (deleteErr) throw deleteErr;
            return NextResponse.json({ success: true, message: 'Order item cancelled and stock reverted' });
        }

        // Otherwise update status (pending -> preparing -> served)
        const { data, error } = await supabase
            .from('order_items')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
