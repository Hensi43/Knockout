import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const data = await prisma.tournament.findMany({
            orderBy: { startDate: 'desc' },
            include: {
                participants: { select: { id: true } } // just get count by checking length
            }
        });
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, startDate, endDate, entryFee, prizePool } = body;

        const data = await prisma.tournament.create({
            data: {
                name,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                entryFee: parseFloat(entryFee) || 0,
                prizePool: parseFloat(prizePool) || 0,
                status: 'upcoming'
            }
        });
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
