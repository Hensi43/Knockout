import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        // Active Tables
        const activeTablesCount = await prisma.snookerTable.count({
            where: { status: 'occupied' }
        });

        // Total Tables
        const totalTablesCount = await prisma.snookerTable.count();

        // Ongoing Sessions
        const ongoingSessionsCount = await prisma.session.count({
            where: { status: 'active' }
        });

        // Revenue Today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todaySessions = await prisma.session.findMany({
            where: {
                status: 'completed',
                createdAt: { gte: today }
            },
            select: { totalAmount: true, endTime: true, startTime: true }
        });

        const revenueToday = todaySessions.reduce((acc: number, curr: any) => acc + (curr.totalAmount || 0), 0);

        // Average Session Duration
        let totalDurationMs = 0;
        let validSessionsCount = 0;

        todaySessions.forEach((session: any) => {
            if (session.endTime && session.startTime) {
                const start = new Date(session.startTime).getTime();
                const end = new Date(session.endTime).getTime();
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
        const recentSessionsData = await prisma.session.findMany({
            where: { status: 'completed' },
            orderBy: { endTime: 'desc' },
            take: 5,
            select: {
                id: true,
                totalAmount: true,
                startTime: true,
                endTime: true,
                status: true,
                table: { select: { name: true } }
            }
        });

        // Map to expected UI format
        const recentSessions = recentSessionsData.map(session => ({
            id: session.id,
            total_amount: session.totalAmount,
            start_time: session.startTime,
            end_time: session.endTime,
            status: session.status,
            snooker_tables: { name: session.table.name }
        }));

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
