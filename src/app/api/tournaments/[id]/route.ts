import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;

        const data = await prisma.tournament.findUnique({
            where: { id },
            include: {
                participants: true,
                matches: {
                    include: {
                        player1: true,
                        player2: true,
                        winner: true
                    },
                    orderBy: { matchTime: 'asc' }
                }
            }
        });

        if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const body = await request.json();

        const data = await prisma.tournament.update({
            where: { id },
            data: body
        });
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;

        await prisma.tournament.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
