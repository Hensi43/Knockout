import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export async function GET() {
    try {
        const supabase = getSupabaseAdmin();

        // Active Tables
        const { count: activeTablesCount, error: activeErr } = await supabase
            .from('snooker_tables')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'occupied');
        if (activeErr) throw activeErr;

        // Total Tables
        const { count: totalTablesCount, error: totalErr } = await supabase
            .from('snooker_tables')
            .select('*', { count: 'exact', head: true });
        if (totalErr) throw totalErr;

        // Ongoing Sessions
        const { count: ongoingSessionsCount, error: ongoingErr } = await supabase
            .from('sessions')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active');
        if (ongoingErr) throw ongoingErr;

        // Revenue Today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { data: todaySessions, error: revErr } = await supabase
            .from('sessions')
            .select('total_amount, end_time, start_time')
            .eq('status', 'completed')
            .gte('created_at', today.toISOString());
        if (revErr) throw revErr;

        const revenueToday = todaySessions.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);

        // Average Session Duration
        let totalDurationMs = 0;
        let validSessionsCount = 0;

        todaySessions.forEach(session => {
            if (session.end_time && session.start_time) {
                const start = new Date(session.start_time).getTime();
                const end = new Date(session.end_time).getTime();
                if (end > start) {
                    totalDurationMs += (end - start);
                    validSessionsCount++;
                }
            }
        });

        const averageSessionDurationMinutes = validSessionsCount > 0
            ? Math.round(totalDurationMs / validSessionsCount / (1000 * 60))
            : 0;

        // Recent Sessions (Last 5 completed)
        const { data: recentSessions, error: recentErr } = await supabase
            .from('sessions')
            .select(`
                id,
                total_amount,
                start_time,
                end_time,
                status,
                snooker_tables (name)
            `)
            .eq('status', 'completed')
            .order('end_time', { ascending: false })
            .limit(5);

        if (recentErr) throw recentErr;

        // Dummy Data Fallback for "First Impression"
        const dummySessions = [
            { id: 'd1', total_amount: 450, start_time: new Date(Date.now() - 3600000).toISOString(), end_time: new Date().toISOString(), snooker_tables: { name: 'Table 1' }, is_dummy: true },
            { id: 'd2', total_amount: 320, start_time: new Date(Date.now() - 7200000).toISOString(), end_time: new Date(Date.now() - 3600000).toISOString(), snooker_tables: { name: 'Table 3' }, is_dummy: true },
            { id: 'd3', total_amount: 1250, start_time: new Date(Date.now() - 14400000).toISOString(), end_time: new Date(Date.now() - 10800000).toISOString(), snooker_tables: { name: 'VIP Table' }, is_dummy: true },
        ];

        return NextResponse.json({
            activeTables: activeTablesCount || 0,
            totalTables: totalTablesCount || 0,
            revenueToday: revenueToday || 0,
            ongoingSessions: ongoingSessionsCount || 0,
            averageSessionDuration: averageSessionDurationMinutes,
            recentSessions: (recentSessions && recentSessions.length > 0) ? recentSessions : dummySessions
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
