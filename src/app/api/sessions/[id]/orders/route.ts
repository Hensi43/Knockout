import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, context: any) {
    try {
        const params = await context.params;
        const { id } = params;
        if (!id) return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });

        const data = await prisma.orderItem.findMany({
            where: { sessionId: id },
            include: {
                product: {
                    select: { name: true, price: true }
                }
            }
        });

        // The UI might expect `products` property instead of `product` based on supabase join syntax
        const formattedData = data.map(item => ({
            ...item,
            products: {
                name: item.product.name,
                price: item.product.price
            }
        }));

        return NextResponse.json(formattedData || []);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
