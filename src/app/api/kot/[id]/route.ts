import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params;
        const id = params.id;
        const body = await request.json();
        const { status } = body;

        if (!status || !['pending', 'preparing', 'served', 'cancelled'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        // If order item is cancelled, we revert inventory deduction and remove the item
        if (status === 'cancelled') {
            // Fetch current item to get product_id and quantity
            const item = await prisma.orderItem.findUnique({
                where: { id },
                select: { productId: true, quantity: true }
            });

            if (item) {
                // Re-increment stock and delete order item in transaction
                await prisma.$transaction([
                    prisma.product.update({
                        where: { id: item.productId },
                        data: { stock: { increment: item.quantity } }
                    }),
                    prisma.orderItem.delete({
                        where: { id }
                    })
                ]);
            } else {
                // Item not found, just return success or skip
            }

            return NextResponse.json({ success: true, message: 'Order item cancelled and stock reverted' });
        }

        // Otherwise update status (pending -> preparing -> served)
        const updatedItem = await prisma.orderItem.update({
            where: { id },
            data: { status }
        });

        return NextResponse.json(updatedItem);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
