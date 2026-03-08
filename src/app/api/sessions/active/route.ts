import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export async function GET() {
    try {
        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase
            .from('sessions')
            .select('*, snooker_tables(name, hourly_rate)')
            .eq('status', 'active');

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
