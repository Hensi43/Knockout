import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export async function GET() {
    try {
        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('name');

        if (error) throw error;
        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, price, category, stock } = body;

        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase
            .from('products')
            .insert({ name, price, category, stock })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
