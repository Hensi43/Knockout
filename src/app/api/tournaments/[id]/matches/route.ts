import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const body = await request.json();
        const { player1Id, player2Id, round, matchTime } = body;

        const data = await prisma.tournamentMatch.create({
            data: {
                tournamentId: id,
                player1Id,
                player2Id,
                round: round ? parseInt(round) : 1,
                matchTime: matchTime ? new Date(matchTime) : null,
                status: 'scheduled'
            }
        });
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
