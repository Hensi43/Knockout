import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { sessionId, tableId, discount } = await request.json();

        if (!sessionId || !tableId) {
            return NextResponse.json({ error: 'Session ID and Table ID are required' }, { status: 400 });
        }

        // Get session and table
        const sessionData = await prisma.session.findUnique({
            where: { id: sessionId },
            select: { startTime: true, status: true }
        });

        if (!sessionData) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }
        if (sessionData.status !== 'active') {
            return NextResponse.json({ error: 'Session is not active' }, { status: 400 });
        }

        const tableData = await prisma.snookerTable.findUnique({
            where: { id: tableId },
            select: { hourlyRate: true }
        });

        if (!tableData) {
            return NextResponse.json({ error: 'Table not found' }, { status: 404 });
        }

        // Calculate duration and cost
        const start = new Date(sessionData.startTime).getTime();
        const now = Date.now();
        const elapsedMs = Math.max(0, now - start);
        const minutes = elapsedMs / (1000 * 60);

        const totalCost = minutes * tableData.hourlyRate;

        const orderItems = await prisma.orderItem.findMany({
            where: { sessionId },
            select: {
                quantity: true,
                priceAtTime: true,
                product: {
                    select: { name: true }
                }
            }
        });

        const timeCost = totalCost;
        const snacksTotal = orderItems.reduce((acc: number, item: any) => acc + (item.quantity * item.priceAtTime), 0);
        const subtotal = timeCost + snacksTotal;

        const finalAmount = Math.max(0, subtotal - (discount || 0));

        // update session record and table status in a transaction
        const [updatedSession] = await prisma.$transaction([
            prisma.session.update({
                where: { id: sessionId },
                data: {
                    endTime: new Date(),
                    totalAmount: finalAmount,
                    discountAmount: discount || 0,
                    status: 'completed'
                }
            }),
            prisma.snookerTable.update({
                where: { id: tableId },
                data: { status: 'available' }
            })
        ]);

        // Build Receipt Data
        const receipt = {
            session: {
                ...updatedSession,
                end_time: updatedSession.endTime,
                total_amount: updatedSession.totalAmount,
                discount_amount: updatedSession.discountAmount,
            }, // map back to snake_case for UI compatibility if needed
            breakdown: {
                minutes: minutes,
                ratePerMinute: tableData.hourlyRate,
                timeCost: timeCost,
                snacks: orderItems.map((item: any) => ({
                    name: item.product?.name || 'Unknown Item',
                    quantity: item.quantity,
                    price: item.priceAtTime,
                    total: item.quantity * item.priceAtTime
                })),
                snacksTotal: snacksTotal,
                subtotal: subtotal,
                discount: discount || 0,
                finalAmount: finalAmount
            }
        };

        return NextResponse.json(receipt);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
