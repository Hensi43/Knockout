import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { sessionId, productId, quantity, priceAtTime } = body;

        const supabase = getSupabaseAdmin();

        // 1. Fetch product to verify stock
        const { data: product, error: prodErr } = await supabase
            .from('products')
            .select('stock, name')
            .eq('id', productId)
            .single();

        if (prodErr || !product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        if (product.stock < quantity) {
            return NextResponse.json({ 
                error: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
            }, { status: 400 });
        }

        // 2. Insert order item with pending status
        const { data, error } = await supabase
            .from('order_items')
            .insert({
                session_id: sessionId,
                product_id: productId,
                quantity,
                price_at_time: priceAtTime,
                status: 'pending'
            })
            .select()
            .single();

        if (error) throw error;

        // 3. Decrement stock
        const { error: stockErr } = await supabase
            .from('products')
            .update({ stock: product.stock - quantity })
            .eq('id', productId);

        if (stockErr) {
            console.error("Failed to update product stock:", stockErr);
        }

        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
