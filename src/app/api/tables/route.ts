import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const data = await prisma.snookerTable.findMany({
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { name, hourlyRate } = await request.json();

        if (!name || hourlyRate === undefined || hourlyRate === null) {
            return NextResponse.json({ error: 'Name and hourly rate are required' }, { status: 400 });
        }

        const newTable = await prisma.snookerTable.create({
            data: {
                name,
                hourlyRate: hourlyRate,
                status: 'available'
            }
        });

        return NextResponse.json(newTable);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
