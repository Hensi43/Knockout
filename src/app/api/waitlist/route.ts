import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const data = await prisma.waitlistEntry.findMany({
            orderBy: { createdAt: 'asc' }
        });
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { customerName, phone, estimatedDuration, status } = body;

        const data = await prisma.waitlistEntry.create({
            data: {
                customerName,
                phone,
                estimatedDuration,
                status: status || 'waiting'
            }
        });
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
