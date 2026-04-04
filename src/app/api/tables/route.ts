import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export async function GET() {
    try {
        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase
            .from('snooker_tables')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const supabase = getSupabaseAdmin();
        const { name, hourlyRate } = await request.json();

        if (!name || hourlyRate === undefined || hourlyRate === null) {
            return NextResponse.json({ error: 'Name and hourly rate are required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('snooker_tables')
            .insert([{ name, hourly_rate: hourlyRate, status: 'available' }])
            .select();

        if (error) throw error;
        return NextResponse.json(data[0]);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
