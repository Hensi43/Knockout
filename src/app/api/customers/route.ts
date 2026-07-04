import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const data = await prisma.customer.findMany({
            orderBy: { lastVisit: 'desc' }
        });

        const formattedData = data.map(c => ({
            ...c,
            total_visits: c.totalVisits,
            last_visit: c.lastVisit,
            created_at: c.createdAt
        }));

        return NextResponse.json(formattedData);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
