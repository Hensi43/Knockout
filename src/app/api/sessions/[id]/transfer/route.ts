import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request, context: any) {
    try {
        const params = await context.params;
        const { id } = params;
        const { newTableId } = await request.json();
        
        if (!id || !newTableId) {
            return NextResponse.json({ error: 'Session ID and new Table ID are required' }, { status: 400 });
        }

        // 1. Get current session to find old table ID
        const sessionData = await prisma.session.findUnique({
            where: { id },
            select: { tableId: true }
        });

        if (!sessionData) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }
        
        const oldTableId = sessionData.tableId;

        // Perform table swap in a transaction
        await prisma.$transaction([
            // 2. Update new table status to occupied
            prisma.snookerTable.update({
                where: { id: newTableId },
                data: { status: 'occupied' }
            }),
            // 3. Re-link session to new table
            prisma.session.update({
                where: { id },
                data: { tableId: newTableId }
            }),
            // 4. Update old table status back to available
            prisma.snookerTable.update({
                where: { id: oldTableId },
                data: { status: 'available' }
            })
        ]);

        return NextResponse.json({ success: true, oldTableId, newTableId });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
