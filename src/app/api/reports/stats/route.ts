import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export async function GET() {
    try {
        const supabase = getSupabaseAdmin();

        // Get Monthly
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { data: monthData, error: monthErr } = await supabase
            .from('sessions')
            .select('total_amount')
            .eq('status', 'completed')
            .gte('created_at', startOfMonth.toISOString());
        if (monthErr) throw monthErr;
        const monthlyRevenue = monthData.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);

        // Get Most Used Table
        const { data: sessions, error: sessErr } = await supabase
            .from('sessions')
            .select('table_id, snooker_tables(name)')
            .eq('status', 'completed');
        if (sessErr) throw sessErr;

        const usage: Record<string, { count: number, name: string }> = {};
        sessions.forEach((session: any) => {
            const id = session.table_id;
            if (!usage[id]) {
                usage[id] = { count: 0, name: session.snooker_tables.name };
            }
            usage[id].count++;
        });
        const sorted = Object.values(usage).sort((a, b) => b.count - a.count);
        const mostUsedTable = sorted[0] || { name: 'N/A', count: 0 };

        // Prepare daily revenue stats for charts (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: revStats, error: revErr } = await supabase
            .from('sessions')
            .select('total_amount, created_at')
            .eq('status', 'completed')
            .gte('created_at', thirtyDaysAgo.toISOString())
            .order('created_at', { ascending: true });
        if (revErr) throw revErr;

        // Group by day for charts
        const dailyRevenueMap: Record<string, number> = {};

        // Initialize last 30 days with 0
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            dailyRevenueMap[dateStr] = 0;
        }

        revStats.forEach((session: any) => {
            const dateStr = session.created_at.split('T')[0];
            if (dailyRevenueMap[dateStr] !== undefined) {
                dailyRevenueMap[dateStr] += (Number(session.total_amount) || 0);
            }
        });

        const formattedRevenueStats = Object.keys(dailyRevenueMap).map(date => ({
            date,
            revenue: dailyRevenueMap[date]
        }));

        return NextResponse.json({
            monthlyRevenue,
            mostUsedTable,
            revenueStats: formattedRevenueStats
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
