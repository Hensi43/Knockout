import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { sessionId, productId, quantity, priceAtTime } = body;

        // 1. Fetch product to verify stock
        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: { stock: true, name: true }
        });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        if (product.stock < quantity) {
            return NextResponse.json({ 
                error: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
            }, { status: 400 });
        }

        // 2. Insert order item and decrement stock in a transaction
        const [orderItem] = await prisma.$transaction([
            prisma.orderItem.create({
                data: {
                    sessionId,
                    productId,
                    quantity,
                    priceAtTime,
                    status: 'pending'
                }
            }),
            prisma.product.update({
                where: { id: productId },
                data: { stock: { decrement: quantity } }
            })
        ]);

        return NextResponse.json(orderItem);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
