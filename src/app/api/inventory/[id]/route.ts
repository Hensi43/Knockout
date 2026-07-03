import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(request: Request, context: any) {
    try {
        // Await the params object before accessing its properties
        const { id } = await context.params;
        const body = await request.json();

        const data = await prisma.product.update({
            where: { id },
            data: body
        });

        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, context: any) {
    try {
        // Await the params object before accessing its properties
        const { id } = await context.params;

        await prisma.product.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
