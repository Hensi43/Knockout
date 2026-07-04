import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        // Get Monthly
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthData = await prisma.session.findMany({
            where: {
                status: 'completed',
                createdAt: { gte: startOfMonth }
            },
            select: { totalAmount: true }
        });
        const monthlyRevenue = monthData.reduce((acc: number, curr: any) => acc + (curr.totalAmount || 0), 0);

        // Get Most Used Table
        const sessions = await prisma.session.findMany({
            where: { status: 'completed' },
            select: { tableId: true, table: { select: { name: true } } }
        });

        const usage: Record<string, { count: number, name: string }> = {};
        sessions.forEach((session: any) => {
            const id = session.tableId;
            if (!usage[id]) {
                usage[id] = { count: 0, name: session.table?.name || 'Deleted Table' };
            }
            usage[id].count++;
        });
        const sorted = Object.values(usage).sort((a, b) => b.count - a.count);
        const mostUsedTable = sorted[0] || { name: 'N/A', count: 0 };

        // Prepare daily revenue stats for charts (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const revStats = await prisma.session.findMany({
            where: {
                status: 'completed',
                createdAt: { gte: thirtyDaysAgo }
            },
            select: { totalAmount: true, createdAt: true },
            orderBy: { createdAt: 'asc' }
        });

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
            const dateStr = session.createdAt.toISOString().split('T')[0];
            if (dailyRevenueMap[dateStr] !== undefined) {
                dailyRevenueMap[dateStr] += (session.totalAmount || 0);
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
