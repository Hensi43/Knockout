import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { tableId, playerCount, userId } = await request.json();

        if (!tableId) {
            return NextResponse.json({ error: 'Table ID is required' }, { status: 400 });
        }

        // Check table status
        const tableData = await prisma.snookerTable.findUnique({
            where: { id: tableId },
            select: { status: true }
        });

        if (!tableData) {
            return NextResponse.json({ error: 'Table not found' }, { status: 404 });
        }
        
        if (tableData.status === 'occupied') {
            return NextResponse.json({ error: 'Table is already occupied' }, { status: 400 });
        }

        // Create session and update table in a transaction
        const [sessionData] = await prisma.$transaction([
            prisma.session.create({
                data: {
                    tableId,
                    userId: userId || null,
                    startTime: new Date(),
                    playerCount: playerCount || 1,
                    status: 'active'
                }
            }),
            prisma.snookerTable.update({
                where: { id: tableId },
                data: { status: 'occupied' }
            })
        ]);

        return NextResponse.json(sessionData);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
