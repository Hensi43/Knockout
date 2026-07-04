import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const body = await request.json();
        const { customerName, phone, paymentStatus, seed } = body;

        const data = await prisma.tournamentParticipant.create({
            data: {
                tournamentId: id,
                customerName,
                phone,
                paymentStatus: paymentStatus || 'unpaid',
                seed: seed ? parseInt(seed) : null
            }
        });
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
