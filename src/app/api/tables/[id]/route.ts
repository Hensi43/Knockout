import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params;
        const id = params.id;
        const body = await request.json();

        // Map Supabase column names back to Prisma camelCase if needed, but the UI might be sending camelCase already.
        // Assuming body contains { name, hourlyRate, status }
        const data: any = {};
        if (body.name !== undefined) data.name = body.name;
        if (body.hourlyRate !== undefined) data.hourlyRate = body.hourlyRate;
        if (body.hourly_rate !== undefined) data.hourlyRate = body.hourly_rate; // handle old snake_case payload
        if (body.status !== undefined) data.status = body.status;

        const updatedTable = await prisma.snookerTable.update({
            where: { id },
            data
        });

        return NextResponse.json(updatedTable);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params;
        const id = params.id;

        await prisma.snookerTable.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
