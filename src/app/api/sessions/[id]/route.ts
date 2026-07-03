import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(request: Request, context: any) {
    try {
        const params = await context.params;
        const { id } = params;
        
        if (!id) return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });

        // Get table ID before deleting
        const session = await prisma.session.findUnique({
            where: { id },
            select: { tableId: true }
        });

        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        // Run deletion and table release in a transaction
        await prisma.$transaction([
            prisma.session.delete({
                where: { id }
            }),
            prisma.snookerTable.update({
                where: { id: session.tableId },
                data: { status: 'available' }
            })
        ]);

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
