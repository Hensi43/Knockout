import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export async function PATCH(request: Request, context: any) {
    try {
        // Await the params object before accessing its properties
        const { id } = await context.params;
        const body = await request.json();

        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase
            .from('products')
            .update(body)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, context: any) {
    try {
        // Await the params object before accessing its properties
        const { id } = await context.params;

        const supabase = getSupabaseAdmin();
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
