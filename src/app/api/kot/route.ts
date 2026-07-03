import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const data = await prisma.orderItem.findMany({
            where: {
                status: { in: ['pending', 'preparing'] }
            },
            include: {
                product: { select: { name: true } },
                session: {
                    select: {
                        id: true,
                        tableId: true,
                        table: { select: { name: true } }
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        const formattedData = data.map(item => ({
            id: item.id,
            session_id: item.sessionId,
            product_id: item.productId,
            quantity: item.quantity,
            price_at_time: item.priceAtTime,
            status: item.status,
            created_at: item.createdAt,
            products: { name: item.product.name },
            sessions: {
                id: item.session.id,
                table_id: item.session.tableId,
                snooker_tables: { name: item.session.table.name }
            }
        }));

        return NextResponse.json(formattedData);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
