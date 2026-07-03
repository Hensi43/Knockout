import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const data = await prisma.session.findMany({
            where: { status: 'active' },
            include: {
                table: {
                    select: { name: true, hourlyRate: true }
                },
                orderItems: {
                    select: { status: true }
                }
            }
        });

        // The frontend expects snooker_tables instead of table, and order_items instead of orderItems
        const formattedData = data.map(session => ({
            ...session,
            snooker_tables: {
                name: session.table.name,
                hourly_rate: session.table.hourlyRate
            },
            order_items: session.orderItems
        }));

        return NextResponse.json(formattedData);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
