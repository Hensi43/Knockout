import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const supabase = getSupabaseAdmin();
        const params = await context.params;
        const id = params.id;
        const body = await request.json();

        const { data, error } = await supabase
            .from('snooker_tables')
            .update(body)
            .eq('id', id)
            .select();

        if (error) throw error;
        return NextResponse.json(data[0]);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const supabase = getSupabaseAdmin();
        const params = await context.params;
        const id = params.id;

        const { error } = await supabase
            .from('snooker_tables')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
